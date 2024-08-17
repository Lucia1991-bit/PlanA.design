import { OBJECT_STATE } from "@/types/DesignType";
import { fabric } from "fabric";
import { useCallback, useRef, useState } from "react";
import debounce from "lodash/debounce";

interface useHistoryProps {
  canvas: fabric.Canvas | null;
  gridRef: React.MutableRefObject<fabric.Group | null>;
  updateGridColor: () => void;
  updateCanvasColor: () => void;
  saveDesign: (fabricData: string) => Promise<void>;
}

export const useHistory = ({
  canvas,
  gridRef,
  updateGridColor,
  updateCanvasColor,
  saveDesign,
}: useHistoryProps) => {
  // 當前歷史記錄的索引
  const [historyIndex, setHistoryIndex] = useState(0);
  // 存儲畫布狀態歷史的陣列
  const canvasHistory = useRef<string[]>([]);
  const skipSave = useRef(false);
  // 防止保存操作重複
  const isInSaveOperation = useRef(false);

  const canUndo = useCallback(() => historyIndex > 0, [historyIndex]);
  const canRedo = useCallback(
    () => historyIndex < canvasHistory.current.length - 1,
    [historyIndex]
  );

  //保存到歷史紀錄
  const save = useCallback(() => {
    if (!canvas || skipSave.current || isInSaveOperation.current) return;

    isInSaveOperation.current = true;

    const grid = gridRef.current;
    let gridIndex = -1;

    // 如果存在網格，暫時從畫布中移除
    if (grid) {
      //找到網格在畫布中的索引
      gridIndex = canvas.getObjects().indexOf(grid);
      canvas.remove(grid);
    }

    //將畫布中物件的狀態轉成 JSON
    const currentState = canvas.toJSON(OBJECT_STATE);

    // 處理 Pattern
    currentState.objects.forEach((obj: any) => {
      if (obj.fill && obj.fill.source) {
        obj.fill = {
          type: "pattern",
          source: obj.fill.sourceURL || obj.fill.source.src,
          repeat: obj.fill.repeat,
          scaleX: obj.fill.scaleX,
          scaleY: obj.fill.scaleY,
        };
      }
    });

    const json = JSON.stringify(currentState);

    //使用這個索引將網格插回原來的位置
    if (grid && gridIndex !== -1) {
      canvas.insertAt(grid, gridIndex, false);
    }

    // 更新歷史記錄
    // canvasHistory.current = canvasHistory.current.slice(0, historyIndex + 1);
    canvasHistory.current.push(json);
    setHistoryIndex(canvasHistory.current.length - 1);

    isInSaveOperation.current = false;
  }, [canvas, gridRef]);

  //使用debounce自動保存到資料庫

  //手動保存到資料庫
  const saveToDatabase = useCallback(async () => {
    if (!canvas || isInSaveOperation.current) return;
    isInSaveOperation.current = true;

    const grid = gridRef.current;
    let gridStackPosition = grid ? canvas.getObjects().indexOf(grid) : -1;

    try {
      if (grid) {
        canvas.remove(grid);
      }

      const currentState = canvas.toJSON(OBJECT_STATE);

      // 處理 Pattern
      currentState.objects.forEach((obj: any) => {
        if (obj.fill && obj.fill.source) {
          obj.fill = {
            type: "pattern",
            source: obj.fill.sourceURL || obj.fill.source.src,
            repeat: obj.fill.repeat,
            scaleX: obj.fill.scaleX,
            scaleY: obj.fill.scaleY,
          };
        }
      });

      const json = JSON.stringify(currentState);

      await saveDesign(json);

      if (canvas) {
        if (grid) {
          canvas.add(grid);
          if (gridStackPosition > -1) {
            canvas.moveTo(grid, gridStackPosition);
          }
        }
        canvas.renderAll();
      }
      isInSaveOperation.current = false;
    } catch (error) {
      console.error("保存設計時發生錯誤:", error);
      // 可以在這裡添加錯誤處理邏輯，例如顯示錯誤消息給用戶
    }
  }, [canvas, gridRef, saveDesign]);

  // 恢復到指定的歷史狀態
  const restoreState = useCallback(
    (state: string) => {
      if (!canvas) return;

      skipSave.current = true;

      // 暫時存儲當前網格
      const currentGrid = gridRef.current;

      // 解析狀態
      const parsedState = JSON.parse(state);

      // 處理 Pattern
      if (parsedState.objects) {
        parsedState.objects.forEach((obj: any) => {
          if (obj.fill && obj.fill.type === "pattern") {
            fabric.util.loadImage(obj.fill.source, (img) => {
              obj.fill = new fabric.Pattern({
                source: img,
                repeat: obj.fill.repeat,
                //@ts-ignore
                scaleX: obj.fill.scaleX,
                scaleY: obj.fill.scaleY,
              });
              (obj.fill as any).sourceURL = obj.fill.source;
            });
          }
        });
      }

      // 從 JSON 加載畫布狀態
      canvas.loadFromJSON(parsedState, () => {
        // 檢查加載的狀態是否已經包含網格
        const loadedGrid = canvas
          .getObjects()
          .find((obj) => obj.name === "designGrid") as fabric.Group | undefined;

        if (loadedGrid) {
          // 如果加載的狀態包含網格，使用加載的網格
          gridRef.current = loadedGrid;
        } else if (currentGrid) {
          // 如果加載的狀態不包含網格，但之前有網格，則添加回之前的網格
          canvas.add(currentGrid);
          canvas.sendToBack(currentGrid);
        }

        // 更新網格和畫布顏色
        updateGridColor();
        updateCanvasColor();

        canvas.renderAll();
        skipSave.current = false;
      });
    },
    [canvas, gridRef, updateGridColor, updateCanvasColor]
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

  return {
    save,
    canUndo,
    canRedo,
    undo,
    redo,
    setHistoryIndex,
    canvasHistory,
    saveToDatabase,
  };
};
