import { fabric } from "fabric";
import { useCallback, useRef, useState } from "react";
import { CanvasLayer, OBJECT_STATE } from "@/types/DesignType";

interface useHistoryProps {
  canvas: fabric.Canvas | null;
  gridRef: React.MutableRefObject<fabric.Group | null>;
  updateGridColor: () => void;
  updateCanvasColor: () => void;
  updateGridPosition: () => void;
  saveDesign: (fabricData: string) => Promise<void>;
  canvasLayers: CanvasLayer[];
  setCanvasLayers: React.Dispatch<React.SetStateAction<CanvasLayer[]>>;
  imageResources: Record<string, string>;
  setImageResources: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
}

export const useHistory = ({
  canvas,
  gridRef,
  updateGridColor,
  updateCanvasColor,
  updateGridPosition,
  saveDesign,
  canvasLayers,
  setCanvasLayers,
  imageResources,
  setImageResources,
}: useHistoryProps) => {
  // 當前歷史記錄的索引
  const [historyIndex, setHistoryIndex] = useState(-1);
  // 存儲畫布狀態歷史的陣列
  const canvasHistory = useRef<string[]>([]);
  // 用於跳過保存操作的標誌
  const skipSave = useRef(false);
  // 防止保存操作重複的標誌
  const isInSaveOperation = useRef(false);
  // 歷史記錄的最大長度
  const MAX_HISTORY_LENGTH = 50;

  // 檢查是否可以進行撤銷操作
  const canUndo = useCallback(() => historyIndex > 0, [historyIndex]);
  // 檢查是否可以進行重做操作
  const canRedo = useCallback(
    () => historyIndex < canvasHistory.current.length - 1,
    [historyIndex]
  );

  // 獲取當前畫布狀態
  const getCanvasState = useCallback(() => {
    if (!canvas) return null;

    const grid = gridRef.current;
    let gridIndex = -1;

    // 重要：暫時移除網格，以確保它不被包含在狀態中
    if (grid) {
      gridIndex = canvas.getObjects().indexOf(grid);
      canvas.remove(grid);
    }

    //Pattern的圖層資料;
    const newCanvasLayers: CanvasLayer[] = [];
    //Pattern的來源 Url
    const newImageResources: Record<string, string> = {};

    // 將 Pattern相關資料獨立到新的 CanvasLayer和 ImageResources中，不另外跟其他 Canvas狀態一起 JSON格式化
    // 處理畫布上的所有物件
    const fabricObjects = canvas.getObjects().map((obj: any, index: number) => {
      console.log(`Object ${index}:`, obj);
      // 檢查填了 Pattern 的物件(在drawWall裡取名為room)
      if (
        obj.name === "room" ||
        (obj.fill && obj.fill instanceof fabric.Pattern)
      ) {
        // 為每個圖案生成唯一的 ID
        const imageId = `image_${index}`;
        console.log(`Processing object ${index} with name:`, obj.name);

        // 檢查 fill 是否為有效的 Pattern
        if (obj.fill && obj.fill instanceof fabric.Pattern) {
          // 嘗試獲取 sourceURL，首選 sourceURL，如果不存在則嘗試 source.src
          const sourceURL =
            obj.fill.sourceURL || (obj.fill.source && obj.fill.source.src);
          if (sourceURL) {
            console.log(`Found sourceURL for object ${index}:`, sourceURL);
            // 將圖案源另外儲存，以 ID當作索引，以便在後續的狀態恢復中使用
            newImageResources[imageId] = sourceURL;

            // 創建新的畫布圖層，包含 Pattern 的相關信息
            newCanvasLayers.push({
              index,
              pattern: {
                sourceId: imageId,
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

        // 創建對象的淺複製，移除 fill 屬性
        const objWithoutFill = Object.assign({}, obj.toObject(), {
          fill: null,
          name: obj.name,
        });
        return objWithoutFill;
      }

      // 如果對象沒有圖案填充，直接返回原對象，確保包含 name 屬性
      return Object.assign({}, obj.toObject(), { name: obj.name });
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

    return JSON.stringify({
      canvasState: currentState,
      canvasLayers: newCanvasLayers,
      imageResources: newImageResources,
    });
  }, [canvas, gridRef, setCanvasLayers, setImageResources]);

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

      // 設置跳過保存的標誌，防止在恢復過程中觸發新的保存操作
      skipSave.current = true;
      // 保存當前的網格引用
      const currentGrid = gridRef.current;
      const {
        canvasState,
        canvasLayers: newCanvasLayers,
        imageResources: newImageResources,
      } = JSON.parse(stateString);

      // 預加載所有圖像
      const imageLoadPromises = Object.entries(newImageResources).map(
        ([id, url]) =>
          new Promise<void>((resolve) => {
            if (typeof url === "string") {
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
                (pattern as any).sourceURL = layer.pattern.sourceId;
                obj.set("fill", pattern);
              } else {
                // 如果圖片加載失敗，設置為透明填充
                obj.set("fill", "rgba(0,0,0,0)");
              }
            }
          });

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
          updateCanvasColor();
          updateGridPosition();

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
      updateGridColor,
      updateCanvasColor,
      updateGridPosition,
      setCanvasLayers,
      setImageResources,
    ]
  );

  // 執行撤銷操作
  const undo = useCallback(() => {
    if (canUndo()) {
      const previousIndex = historyIndex - 1;
      restoreState(canvasHistory.current[previousIndex]);
      setHistoryIndex(previousIndex);
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

  // 保存到數據庫
  const saveToDatabase = useCallback(async () => {
    if (!canvas || isInSaveOperation.current) return;
    isInSaveOperation.current = true;

    try {
      const currentState = getCanvasState();
      if (currentState) {
        await saveDesign(currentState);
      }
    } catch (error) {
      console.error("保存設計時發生錯誤:", error);
    } finally {
      isInSaveOperation.current = false;
    }
  }, [canvas, getCanvasState, saveDesign]);

  // 初始化畫布狀態
  const initializeCanvasState = useCallback(() => {
    const initialState = getCanvasState();
    if (initialState) {
      // 直接設置初始狀態，但不添加到歷史記錄
      canvasHistory.current = [initialState];
      // 將 historyIndex 設置為 -1，表示還沒有可撤銷的操作
      setHistoryIndex(-1);
    }
  }, [getCanvasState]);

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
