import { fabric } from "fabric";
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { SUB_GRID_SIZE } from "@/types/DesignType";

const paperSizes = {
  A4: { width: 297, height: 210 }, // 毫米
  A3: { width: 420, height: 297 }, // 毫米
};

const mmToPixels = (mm: number) => Math.round((mm * SUB_GRID_SIZE) / 5);

// 10像素邊距
const MARGIN_PX = 15;

interface ExportProps {
  canvas: fabric.Canvas | null;
  saveToDatabase: () => void;
}

export const useExport = ({ canvas, saveToDatabase }: ExportProps) => {
  const [paperSize, setPaperSize] = useState<"A4" | "A3">("A4");
  const [isExportMode, setIsExportMode] = useState(false);
  const [isExportLoading, setExportLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const getViewportDimensions = useCallback(() => {
    const dimensions = paperSizes[paperSize];
    return {
      width: mmToPixels(dimensions.width),
      height: mmToPixels(dimensions.height),
    };
  }, [paperSize]);

  const adjustToNewPaperSize = useCallback((newSize: "A4" | "A3") => {
    setPaperSize(newSize);
    setIsExportMode(true);
  }, []);

  const handleExport = useCallback(async () => {
    if (!canvas) return;

    setExportLoading(true);

    try {
      // 保存當前畫布狀態
      await saveToDatabase();

      const { width: targetWidth, height: targetHeight } =
        getViewportDimensions();

      // 創建臨時畫布
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = targetWidth;
      tempCanvas.height = targetHeight;
      const tempContext = tempCanvas.getContext("2d");

      if (!tempContext) {
        throw new Error("Failed to create temporary canvas context");
      }

      tempContext.fillStyle = "white";
      tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      const tempFabricCanvas = new fabric.Canvas(tempCanvas);

      //遞迴複製，確保嵌套群組物件都會被複製
      const cloneObjectDeep = (obj: fabric.Object): Promise<fabric.Object> => {
        return new Promise((resolve) => {
          obj.clone(
            (cloned: fabric.Object) => {
              if (obj.type === "group") {
                const group = obj as fabric.Group;
                const clonedGroup = cloned as fabric.Group;
                Promise.all(group.getObjects().map(cloneObjectDeep)).then(
                  (clonedChildren) => {
                    //@ts-ignore
                    clonedGroup.set({ objects: clonedChildren });
                    resolve(clonedGroup);
                  }
                );
              } else {
                resolve(cloned);
              }
            },
            ["objects"]
          );
        });
      };

      // 過濾不要匯出的物件
      const objectsToExport = canvas
        .getObjects()
        .filter((obj) => obj.name !== "designGrid" && obj.name !== "wallGroup");

      const clonedObjects = await Promise.all(
        objectsToExport.map(cloneObjectDeep)
      );

      clonedObjects.forEach((obj) => tempFabricCanvas.add(obj));

      // 計算邊界框
      const groupToExport = new fabric.Group(tempFabricCanvas.getObjects(), {
        left: 0,
        top: 0,
        originX: "left",
        originY: "top",
      });

      const groupBoundingRect = groupToExport.getBoundingRect(true, true);
      groupToExport.destroy();

      // 計算縮放
      const scaleX = (targetWidth - 2 * MARGIN_PX) / groupBoundingRect.width;
      const scaleY = (targetHeight - 2 * MARGIN_PX) / groupBoundingRect.height;
      const scale = Math.min(Math.max(0.1, Math.min(scaleX, scaleY)), 2);

      // 計算偏移
      const offsetX = Math.max(
        MARGIN_PX,
        (targetWidth - groupBoundingRect.width * scale) / 2
      );
      const offsetY = Math.max(
        MARGIN_PX,
        (targetHeight - groupBoundingRect.height * scale) / 2
      );

      // 應用縮放和偏移
      tempFabricCanvas.getObjects().forEach((obj) => {
        obj.set({
          left: (obj.left! - groupBoundingRect.left) * scale + offsetX,
          top: (obj.top! - groupBoundingRect.top) * scale + offsetY,
          scaleX: obj.scaleX! * scale,
          scaleY: obj.scaleY! * scale,
        });
        obj.setCoords();
      });

      tempFabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      tempFabricCanvas.renderAll();

      // 生成圖片
      const dataUrl = tempFabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        width: targetWidth,
        height: targetHeight,
      });

      // 下載圖片
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${uuidv4()}_${paperSize}.png`;
      link.click();

      tempFabricCanvas.dispose();
    } catch (error) {
      console.error("Error during export process:", error);
    } finally {
      setExportLoading(false);
      window.location.reload();
    }
  }, [canvas, getViewportDimensions, paperSize, saveToDatabase]);

  const cancelExport = useCallback(() => {
    setIsExportMode(false);
  }, []);

  return {
    paperSize,
    isExportMode,
    isExportLoading,
    getViewportDimensions,
    adjustToNewPaperSize,
    handleExport,
    cancelExport,
  };
};
