import { useState, useCallback, useEffect } from "react";
import { fabric } from "fabric";

interface UseClipboardProps {
  canvas: fabric.Canvas | null;
}

export const useClipboard = ({ canvas }: UseClipboardProps) => {
  // 儲存複製的物件
  const [clipboardData, setClipboardData] = useState<fabric.Object | null>(
    null
  );

  // 複製功能
  const copy = useCallback(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned: fabric.Object) => {
        setClipboardData(cloned);
      });
    }
  }, [canvas]);

  // 貼上功能
  const paste = useCallback(() => {
    if (!canvas || !clipboardData) return;
    clipboardData.clone((clonedObj: fabric.Object) => {
      canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left! + 20,
        top: clonedObj.top! + 20,
        evented: true,
      });
      if (clonedObj.type === "activeSelection") {
        // 如果是多重選擇，需要逐個添加到畫布
        (clonedObj as fabric.ActiveSelection).canvas = canvas;
        (clonedObj as fabric.ActiveSelection).forEachObject((obj) => {
          canvas.add(obj);
        });
        clonedObj.setCoords();
      } else {
        canvas.add(clonedObj);
      }
      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
    });
  }, [canvas, clipboardData]);

  // 檢查是否有資料可以貼上
  const canPaste = useCallback(() => {
    return clipboardData !== null;
  }, [clipboardData]);

  // 刪除物件功能
  const deleteObjects = useCallback(() => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects) {
      activeObjects.forEach((obj) => {
        if (obj.name === "wallLine") {
          const wallId = obj.get("id") as string;
          canvas.getObjects().forEach((canvasObj) => {
            if (
              canvasObj.name &&
              canvasObj.name.startsWith(`wallEndpoint_${wallId}`)
            ) {
              canvas.remove(canvasObj);
            }
          });
        }
        canvas.remove(obj);
      });
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  }, [canvas]);

  return { copy, paste, canPaste, deleteObjects };
};
