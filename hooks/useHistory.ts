import { fabric } from "fabric";
import { useCallback, useRef, useState } from "react";
import { CanvasLayer, OBJECT_STATE } from "@/types/DesignType";

interface useHistoryProps {
  canvas: fabric.Canvas | null;
  gridRef: React.MutableRefObject<fabric.Group | null>;
  updateGridColor: () => void;
  updateGridPosition: () => void;
  saveDesign: (fabricData: string) => Promise<void>;
  canvasLayers: CanvasLayer[];
  setCanvasLayers: React.Dispatch<React.SetStateAction<CanvasLayer[]>>;
  imageResources: Record<string, string>;
  setImageResources: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  unfinishedWall: React.MutableRefObject<fabric.Object | null>;
  completedWalls: React.MutableRefObject<fabric.Object[] | null>;
  setUnfinishedWall: (wall: fabric.Object | null) => void;
  setCompletedWalls: (
    walls: fabric.Object[] | ((prev: fabric.Object[]) => fabric.Object[])
  ) => void;
  isDrawingMode: boolean;
}

export const useHistory = ({
  canvas,
  gridRef,
  updateGridColor,
  updateGridPosition,
  saveDesign,
  canvasLayers,
  setCanvasLayers,
  imageResources,
  setImageResources,
  unfinishedWall,
  setUnfinishedWall,
  completedWalls,
  setCompletedWalls,
  isDrawingMode,
}: useHistoryProps) => {
  // 當前歷史記錄的索引
  const [historyIndex, setHistoryIndex] = useState(-1);
  // 儲存畫布狀態歷史的陣列
  const canvasHistory = useRef<string[]>([]);
  // 用於跳過保存操作的標誌
  const skipSave = useRef(false);
  // 防止保存操作重複的標誌
  const isInSaveOperation = useRef(false);
  // 歷史記錄的最大長度
  const MAX_HISTORY_LENGTH = 50;

  // 檢查是否可以進行撤銷操作
  //在繪製模式時不允許執行撤銷操作
  const canUndo = useCallback(() => {
    return !isDrawingMode && historyIndex > 0;
  }, [isDrawingMode, historyIndex]);

  // 檢查是否可以進行重做操作
  //在繪製模式時不允許執行重做操作
  const canRedo = useCallback(() => {
    return !isDrawingMode && historyIndex < canvasHistory.current.length - 1;
  }, [isDrawingMode, historyIndex]);

  // 獲取當前畫布狀態
  const getCanvasState = useCallback(() => {
    if (!canvas) return null;

    const grid = gridRef.current;
    let gridIndex = -1;

    // 重要：暫時移除網格，確保它不被包含在狀態中
    if (grid) {
      gridIndex = canvas.getObjects().indexOf(grid);
      canvas.remove(grid);
    }

    //Pattern的圖層資料;
    const newCanvasLayers: CanvasLayer[] = [];
    //Pattern的來源 Url
    const newImageResources: Record<string, string> = {};

    // 將 Pattern相關資料獨立到新的 CanvasLayer和 ImageResources中，不另外跟其他 Canvas狀態一起 JSON格式化
    const fabricObjects = canvas
      .getObjects()
      //排除有設定 excludeFromExport屬性的物件
      .filter((obj: any) => !obj.excludeFromExport)
      .map((obj: any, index: number) => {
        // 創建對象的淺複製，確保包含 name 屬性
        const baseObject = Object.assign({}, obj.toObject(), {
          name: obj.name,
          // 保存鎖定狀態
          lockMovementX: obj.lockMovementX,
          lockMovementY: obj.lockMovementY,
          lockRotation: obj.lockRotation,
          lockScalingX: obj.lockScalingX,
          lockScalingY: obj.lockScalingY,
          hasControls: obj.hasControls,
          selectable: obj.selectable,
          evented: obj.evented,
        });

        // 另外處理 wallGroup 牆體的屬性
        if (obj.name === "wallGroup" || obj.name === "finishedWall") {
          baseObject.selectable = false;
          baseObject.evented = false;
          baseObject.hasControls = false;
          baseObject.lockMovementX = true;
          baseObject.lockMovementY = true;
          baseObject.lockRotation = true;
          baseObject.lockScalingX = true;
          baseObject.lockScalingY = true;
          baseObject.subTargetCheck = true;
          baseObject.lockUniScaling = true;

          // 保存 wallGroup 的自定義屬性
          baseObject.id = obj.id;
          baseObject.startPoint = obj.startPoint;
          baseObject.endPoint = obj.endPoint;
          baseObject.allPoints = obj.allPoints;
          baseObject.isReversed = obj.isReversed;
        }

        // 檢查填了 Pattern 的物件(在drawWall裡取名為room)
        if (
          obj.name === "room" ||
          (obj.fill && obj.fill instanceof fabric.Pattern)
        ) {
          //保持屬性不變
          baseObject.selectable = obj.selectable;
          baseObject.evented = obj.evented;
          baseObject.hasBorders = true;
          baseObject.hasControls = false;
          // baseObject.lockMovementX = true;
          // baseObject.lockMovementY = true;
          baseObject.lockRotation = true;
          baseObject.lockScalingX = true;
          baseObject.lockScalingY = true;

          const imageId = `image_${index}`;

          // 檢查 fill 是否為有效的 Pattern
          if (obj.fill && obj.fill instanceof fabric.Pattern) {
            const sourceURL =
              obj.fill.sourceURL || (obj.fill.source && obj.fill.source.src);
            if (sourceURL) {
              // 將圖案源另外儲存，以 ID當作索引，以便在後續的狀態恢復中使用
              newImageResources[imageId] = sourceURL;

              // 創建新的畫布圖層，包含 Pattern 的相關信息
              newCanvasLayers.push({
                index,
                pattern: {
                  sourceId: imageId,
                  //@ts-ignore
                  sourceURL: sourceURL,
                  repeat: obj.fill.repeat,
                  scaleX: obj.fill.scaleX,
                  scaleY: obj.fill.scaleY,
                  //@ts-ignore
                  patternTransform: obj.fill.patternTransform,
                },
              });
            } else {
              console.warn(`No sourceURL found for object ${index}`);
            }
          } else {
            console.warn(`Object ${index} has no valid fill pattern`);
          }
        }

        return baseObject;
      });

    // 重要：將網格添加回原來的位置
    // 這確保了網格與其他物件的順序關係保持不變
    if (grid && gridIndex !== -1) {
      canvas.insertAt(grid, gridIndex, false);
    }

    // 創建不包含 pattern 的畫布狀態
    const currentState = Object.assign({}, canvas.toJSON(OBJECT_STATE), {
      objects: fabricObjects,
    });

    // 更新 pattern 相關狀態
    setCanvasLayers(newCanvasLayers);
    setImageResources(newImageResources);

    const savedData = JSON.stringify({
      canvasState: currentState,
      canvasLayers: newCanvasLayers,
      imageResources: newImageResources,
      unfinishedWallId: unfinishedWall.current
        ? //@ts-ignore
          unfinishedWall.current.get("id")
        : null,
      completedWallIds: completedWalls.current
        ? //@ts-ignore
          completedWalls.current.map((wall) => wall.get("id"))
        : [],
    });

    return savedData;
  }, [
    canvas,
    gridRef,
    setCanvasLayers,
    setImageResources,
    unfinishedWall,
    completedWalls,
  ]);

  //獲取用於保存到資料庫的畫布狀態
  const getDatabaseState = useCallback(() => {
    if (!canvas) return null;

    const currentState = getCanvasState();
    if (!currentState) return null;

    const { canvasState, ...rest } = JSON.parse(currentState);

    // 過濾掉 wallGroup
    canvasState.objects = canvasState.objects.filter(
      (obj: any) => obj.name !== "wallGroup"
    );

    return JSON.stringify({
      canvasState,
      ...rest,
    });
  }, [canvas, getCanvasState]);

  // 保存當前狀態到歷史記錄
  const save = useCallback(() => {
    if (!canvas || skipSave.current || isInSaveOperation.current) return;

    isInSaveOperation.current = true;
    const currentState = getCanvasState();
    if (currentState) {
      // 如果是第一次保存，直接添加到歷史記錄
      if (historyIndex === -1) {
        canvasHistory.current = [currentState];
        setHistoryIndex(0);
      } else {
        // 更新歷史記錄，刪除當前索引之後的所有記錄
        canvasHistory.current = canvasHistory.current.slice(
          0,
          historyIndex + 1
        );
        canvasHistory.current.push(currentState);

        // 限制歷史記錄長度
        if (canvasHistory.current.length > MAX_HISTORY_LENGTH) {
          canvasHistory.current = canvasHistory.current.slice(
            -MAX_HISTORY_LENGTH
          );
        }

        setHistoryIndex(
          Math.min(canvasHistory.current.length - 1, MAX_HISTORY_LENGTH - 1)
        );
      }
    }
    isInSaveOperation.current = false;
  }, [canvas, getCanvasState, historyIndex]);

  // 恢復到指定的歷史狀態
  const restoreState = useCallback(
    (stateString: string) => {
      if (!canvas) return;

      skipSave.current = true;

      const currentGrid = gridRef.current;
      const {
        canvasState,
        canvasLayers: newCanvasLayers,
        imageResources: newImageResources,
        unfinishedWallId,
        completedWallIds,
      } = JSON.parse(stateString);

      // 預加載所有圖像
      const imageLoadPromises = Object.entries(newImageResources).map(
        ([id, url]) =>
          new Promise<void>((resolve) => {
            // 檢查 URL 是否為有效的 http(s) URL
            if (typeof url === "string" && url.startsWith("http")) {
              fabric.util.loadImage(
                url,
                (img) => {
                  if (img) {
                    newImageResources[id] = img;
                  } else {
                    console.warn(`Failed to load image for ${id}`);
                    delete newImageResources[id];
                  }
                  resolve();
                },
                null,
                //@ts-ignore
                { crossOrigin: "anonymous" }
              );
            } else {
              console.warn(`Invalid URL for ${id}`);
              delete newImageResources[id];
              resolve();
            }
          })
      );

      // 等待所有圖像加載完成
      Promise.all(imageLoadPromises).then(() => {
        canvas.loadFromJSON(canvasState, () => {
          newCanvasLayers.forEach((layer: CanvasLayer) => {
            const obj = canvas.getObjects()[layer.index];
            if (obj && obj.name === "room") {
              const img = newImageResources[layer.pattern.sourceId];
              if (img) {
                const pattern = new fabric.Pattern({
                  source: img,
                  repeat: layer.pattern.repeat,
                  //@ts-ignore
                  scaleX: layer.pattern.scaleX,
                  scaleY: layer.pattern.scaleY,
                  //@ts-ignore
                  patternTransform: layer.pattern.patternTransform,
                });
                //@ts-ignore
                (pattern as any).sourceURL = layer.pattern.sourceURL;
                obj.set("fill", pattern);
              } else {
                // 如果圖片加載失敗，設置為透明填充
                obj.set("fill", "rgba(200, 200, 200, 0.4)");
              }
            }
          });

          // 恢復 completedWalls
          const restoredCompletedWalls = completedWallIds
            //@ts-ignore
            .map((id) =>
              //@ts-ignore
              canvas.getObjects().find((obj) => obj.get("id") === id)
            )
            .filter(Boolean);
          setCompletedWalls(restoredCompletedWalls);

          // 恢復 unfinishedWall
          const restoredUnfinishedWall = canvas
            .getObjects()
            //@ts-ignore
            .find((obj) => obj.get("id") === unfinishedWallId);
          setUnfinishedWall(restoredUnfinishedWall || null);

          // 處理網格
          const loadedGrid = canvas
            .getObjects()
            .find((obj) => obj.name === "designGrid") as
            | fabric.Group
            | undefined;

          if (loadedGrid) {
            gridRef.current = loadedGrid;
          } else if (currentGrid) {
            canvas.add(currentGrid);
            canvas.sendToBack(currentGrid);
          }

          // 更新網格顏色及位置
          updateGridColor();
          // updateGridPosition();

          // 更新 pattern 相關狀態
          setCanvasLayers(newCanvasLayers);
          setImageResources(newImageResources);

          canvas.renderAll();

          // 重置跳過保存的標誌
          skipSave.current = false;
        });
      });
    },
    [
      canvas,
      gridRef,
      setCompletedWalls,
      setUnfinishedWall,
      updateGridColor,
      updateGridPosition,
      setCanvasLayers,
      setImageResources,
    ]
  );

  // 執行撤銷操作
  const undo = useCallback(() => {
    if (canUndo()) {
      const previousIndex = historyIndex - 1;
      if (previousIndex >= 0) {
        restoreState(canvasHistory.current[previousIndex]);
        setHistoryIndex(previousIndex);
      } else {
        console.warn("Cannot undo further: reached the beginning of history");
        return;
      }
    }
  }, [canUndo, historyIndex, restoreState]);

  // 執行重做操作
  const redo = useCallback(() => {
    if (canRedo()) {
      const nextIndex = historyIndex + 1;
      restoreState(canvasHistory.current[nextIndex]);
      setHistoryIndex(nextIndex);
    }
  }, [canRedo, historyIndex, restoreState]);

  // 保存到資料庫
  const saveToDatabase = useCallback(async () => {
    if (!canvas || isInSaveOperation.current) return;
    isInSaveOperation.current = true;

    try {
      const databaseState = getDatabaseState();
      if (databaseState) {
        await saveDesign(databaseState);
      }
    } catch (error) {
      console.error("保存設計時發生錯誤:", error);
    } finally {
      isInSaveOperation.current = false;
    }
  }, [canvas, getCanvasState, saveDesign]);

  // 初始化畫布狀態
  const initializeCanvasState = useCallback(
    (isNewDesign: boolean = true) => {
      // 獲取當前畫布的狀態
      const initialState = getCanvasState();

      // 設置歷史索引
      // 如果是新設計，設置為 -1（表示沒有可撤銷的操作）
      // 如果是載入的設計，設置為 0（表示這是第一個可撤銷的狀態）
      if (initialState) {
        canvasHistory.current = [initialState];
        setHistoryIndex(isNewDesign ? -1 : 0);
      }
    },
    [getCanvasState]
  );

  return {
    save,
    canUndo,
    canRedo,
    undo,
    redo,
    setHistoryIndex,
    canvasHistory,
    saveToDatabase,
    initializeCanvasState,
  };
};
