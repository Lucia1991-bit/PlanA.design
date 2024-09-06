import { fabric } from "fabric";
import { useCallback, useState } from "react";

interface UseCanvasOrderingProps {
  canvas: fabric.Canvas | null;
  gridRef: React.MutableRefObject<fabric.Group | null>;
  updateGridColor: () => void;
}

export const useCanvasOrdering = ({
  canvas,
  gridRef,
  updateGridColor,
}: UseCanvasOrderingProps) => {
  // 控制是否可以上移和下移的狀態
  const [canMoveUp, setCanMoveUp] = useState(false);
  const [canMoveDown, setCanMoveDown] = useState(false);

  // 定義固定元素的名稱
  const fixedElementNames = ["wallGroup", "finishedWall", "designGrid"];

  // 確保設計元素保持在底部的函數
  const ensureDesignElementsAtBottom = useCallback(() => {
    if (!canvas || !gridRef.current) return;

    const grid = gridRef.current;
    // 分類畫布上的對象
    const roomObjects = canvas
      .getObjects()
      .filter((obj) => obj.name === "room");
    const wallObjects = canvas
      .getObjects()
      .filter((obj) => obj.name === "wallGroup" || obj.name === "finishedWall");
    const otherObjects = canvas
      .getObjects()
      .filter(
        (obj) =>
          obj !== grid &&
          obj.name !== "room" &&
          obj.name !== "wallGroup" &&
          obj.name !== "finishedWall"
      );

    // 清空畫布並按順序重新添加對象
    canvas.clear();
    canvas.add(grid);
    updateGridColor();
    roomObjects.forEach((room) => canvas.add(room));
    otherObjects.forEach((obj) => canvas.add(obj));
    wallObjects.forEach((wall) => canvas.add(wall));

    canvas.renderAll();
  }, [canvas, gridRef, updateGridColor]);

  // 更新物件是否可以移動的狀態
  const updateMoveStatus = useCallback(() => {
    if (!canvas) {
      setCanMoveUp(false);
      setCanMoveDown(false);
      return;
    }

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) {
      setCanMoveUp(false);
      setCanMoveDown(false);
      return;
    }

    const canvasObjects = canvas.getObjects();
    const roomObjects = canvasObjects.filter((obj) => obj.name === "room");
    const topmostRoom = roomObjects[roomObjects.length - 1];

    // 檢查是否可以上移
    const canMoveUpValue = activeObjects.some((obj) => {
      const currentIndex = canvasObjects.indexOf(obj);
      if (currentIndex < canvasObjects.length - 1) {
        const nextObject = canvasObjects[currentIndex + 1];
        if (obj.name === "room") {
          // 如果是 room 物件，檢查它是否不是最上層的 room
          return (
            obj !== topmostRoom &&
            !fixedElementNames.includes(nextObject.name as string)
          );
        } else {
          // 對於其他物件，檢查上面的物件是否不是固定物件且不是 room
          return (
            !fixedElementNames.includes(obj.name as string) &&
            !fixedElementNames.includes(nextObject.name as string) &&
            nextObject.name !== "room"
          );
        }
      }
      return false;
    });
    setCanMoveUp(canMoveUpValue);

    // 檢查是否可以下移 (保持原有邏輯)
    const canMoveDownValue = activeObjects.every((obj) => {
      const currentIndex = canvasObjects.indexOf(obj);
      if (currentIndex <= 1) return false;

      const previousObject = canvasObjects[currentIndex - 1];
      if (obj.name === "room") {
        return currentIndex > 1;
      } else {
        return (
          previousObject &&
          previousObject.name !== "room" &&
          !fixedElementNames.includes(previousObject.name as string)
        );
      }
    });
    setCanMoveDown(canMoveDownValue);
  }, [canvas]);

  const bringForward = useCallback(() => {
    if (!canvas || !canMoveUp) return;
    const activeObjects = canvas.getActiveObjects();
    const canvasObjects = canvas.getObjects();

    activeObjects.sort(
      (a, b) => canvasObjects.indexOf(b) - canvasObjects.indexOf(a)
    );

    let moved = false;
    activeObjects.forEach((object) => {
      const currentIndex = canvasObjects.indexOf(object);
      if (object.name === "room") {
        // 對於 room 物件，只有當上面的物件不是固定元素時才移動
        if (
          currentIndex < canvasObjects.length - 1 &&
          !fixedElementNames.includes(
            canvasObjects[currentIndex + 1].name as string
          )
        ) {
          canvas.bringForward(object);
          moved = true;
        }
      } else if (!fixedElementNames.includes(object.name as string)) {
        // 對於其他非固定物件，保持原有邏輯
        if (currentIndex < canvasObjects.length - 1) {
          canvas.bringForward(object);
          moved = true;
        }
      }
    });

    if (moved) {
      canvas.renderAll();
      ensureDesignElementsAtBottom();
      updateMoveStatus();
    }
  }, [canvas, canMoveUp, ensureDesignElementsAtBottom, updateMoveStatus]);

  // 將選中的對象向下移動
  const sendBackward = useCallback(() => {
    if (!canvas || !canMoveDown) return;
    const activeObjects = canvas.getActiveObjects();
    const canvasObjects = canvas.getObjects();
    const fixedTopIndex = canvasObjects.findIndex((obj) =>
      fixedElementNames.includes(obj.name as string)
    );

    activeObjects.sort(
      (a, b) => canvasObjects.indexOf(a) - canvasObjects.indexOf(b)
    );
    let moved = false;
    activeObjects.forEach((object) => {
      if (
        object.name === "room" ||
        !fixedElementNames.includes(object.name as string)
      ) {
        const currentIndex = canvasObjects.indexOf(object);
        if (currentIndex > 1) {
          canvas.sendBackwards(object);
          moved = true;
        }
      }
    });
    if (moved) {
      canvas.renderAll();
      ensureDesignElementsAtBottom();
      updateMoveStatus();
    }
  }, [canvas, canMoveDown, ensureDesignElementsAtBottom, updateMoveStatus]);

  return {
    canMoveUp,
    canMoveDown,
    bringForward,
    sendBackward,
    updateMoveStatus,
    ensureDesignElementsAtBottom,
  };
};
