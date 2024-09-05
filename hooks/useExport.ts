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
  getCanvasState: () => string | null;
  restoreState: (stateString: string) => void;
  saveToDatabase: () => void;
}

export const useExport = ({
  canvas,
  getCanvasState,
  restoreState,
  saveToDatabase,
}: ExportProps) => {
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

    // 保存當前畫布狀態
    // const currentState = getCanvasState();
    // if (currentState === null) {
    //   console.error("Failed to get canvas state");
    //   setExportLoading(false);
    //   return;
    // }

    const { width: targetWidth, height: targetHeight } =
      getViewportDimensions();

    // 創建臨時畫布，使用精確的紙張尺寸
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = targetWidth;
    tempCanvas.height = targetHeight;
    const tempContext = tempCanvas.getContext("2d");

    if (tempContext) {
      tempContext.fillStyle = "white";
      tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      const tempFabricCanvas = new fabric.Canvas(tempCanvas);

      const objectsToExport = canvas
        .getObjects()
        .filter(
          (obj) =>
            obj.name !== "designGrid" &&
            obj.name !== "wallGroup" &&
            obj.name !== "viewport"
        );

      // 首先，將所有物件複製到臨時畫布
      objectsToExport.forEach((obj) => {
        const clonedObj = fabric.util.object.clone(obj);
        tempFabricCanvas.add(clonedObj);
      });

      // 計算邊界框
      const groupBoundingRect = tempFabricCanvas.getObjects().reduce(
        (acc, obj) => {
          const objRect = obj.getBoundingRect(true, true);
          return {
            left: Math.min(acc.left, objRect.left),
            top: Math.min(acc.top, objRect.top),
            right: Math.max(acc.right, objRect.left + objRect.width),
            bottom: Math.max(acc.bottom, objRect.top + objRect.height),
          };
        },
        { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }
      );

      const boundingWidth = groupBoundingRect.right - groupBoundingRect.left;
      const boundingHeight = groupBoundingRect.bottom - groupBoundingRect.top;

      // 計算縮放比例，考慮邊距
      const scaleX = (targetWidth - 2 * MARGIN_PX) / boundingWidth;
      const scaleY = (targetHeight - 2 * MARGIN_PX) / boundingHeight;
      let scale = Math.min(scaleX, scaleY);

      // 限制縮放範圍在 0.1 到 2 之間
      scale = Math.max(0.1, Math.min(scale, 2));

      // 計算縮放後的尺寸
      const scaledWidth = boundingWidth * scale;
      const scaledHeight = boundingHeight * scale;

      // 計算居中偏移，確保至少有 10 像素的邊距
      const offsetX = Math.max(MARGIN_PX, (targetWidth - scaledWidth) / 2);
      const offsetY = Math.max(MARGIN_PX, (targetHeight - scaledHeight) / 2);

      // 應用縮放和偏移
      tempFabricCanvas.getObjects().forEach((obj) => {
        obj.set({
          left: (obj.left! - groupBoundingRect.left) * scale + offsetX,
          top: (obj.top! - groupBoundingRect.top) * scale + offsetY,
          scaleX: obj.scaleX! * scale,
          scaleY: obj.scaleY! * scale,
        });
      });

      tempFabricCanvas.renderAll();

      // 使用 setTimeout 確保所有渲染都已完成
      setTimeout(() => {
        const dataUrl = tempFabricCanvas.toDataURL({
          format: "png",
          quality: 1,
        });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${uuidv4()}_${paperSize}.png`;
        link.click();

        tempFabricCanvas.dispose();
        saveToDatabase();
        window.location.reload();
        setTimeout(() => {
          setExportLoading(false);
        }, 1000);
      }, 100);
    } else {
      setExportLoading(false);
    }
  }, [canvas, getViewportDimensions, paperSize, getCanvasState, restoreState]);

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
