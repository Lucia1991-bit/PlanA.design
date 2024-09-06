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
      // 檢查是否為單一物件且名稱為 "room"
      if (activeObject.name === "room") {
        console.log("Cannot copy room object");
        return;
      }

      // 檢查是否為多重選擇
      if (activeObject.type === "activeSelection") {
        const selection = activeObject as fabric.ActiveSelection;
        // 檢查是否有任何 "room" 物件
        const hasRoomObject = selection
          .getObjects()
          .some((obj) => obj.name === "room");

        if (hasRoomObject) {
          console.log("Cannot copy selection containing room object");
          return;
        }
      }

      // 如果通過了上面的檢查，直接複製整個選擇
      activeObject.clone((cloned: fabric.Object) => {
        setClipboardData(cloned);
      });
    }
  }, [canvas]);

  // 檢查是否可以複製
  // const canCopy = useCallback(() => {
  //   if (!canvas) return false;
  //   return !!canvas.getActiveObject();
  // }, [canvas]);

  const canCopy = useCallback(() => {
    if (!canvas) return false;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return false;

    // 檢查是否為單一物件且名稱為 "room"
    if (activeObject.name === "room") return false;

    // 檢查是否為多重選擇
    if (activeObject.type === "activeSelection") {
      const selection = activeObject as fabric.ActiveSelection;
      // 檢查是否有任何 "room" 物件
      return !selection.getObjects().some((obj) => obj.name === "room");
    }

    return true;
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
        canvas.remove(obj);
      });
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  }, [canvas]);

  // 水平鏡射功能
  const mirrorHorizontally = useCallback(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set("flipX", !activeObject.flipX);
      canvas.requestRenderAll();
    }
  }, [canvas]);

  // 垂直鏡射功能
  const mirrorVertically = useCallback(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set("flipY", !activeObject.flipY);
      canvas.requestRenderAll();
    }
  }, [canvas]);

  return {
    copy,
    paste,
    canCopy,
    canPaste,
    deleteObjects,
    mirrorHorizontally,
    mirrorVertically,
  };
};
