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
    const fixedTopIndex = canvasObjects.findIndex((obj) =>
      fixedElementNames.includes(obj.name as string)
    );

    const nonFixedObjects = canvasObjects.filter(
      (obj) => !fixedElementNames.includes(obj.name as string)
    );

    // 檢查是否可以上移
    const canMoveUpValue = activeObjects.some(
      (obj) =>
        (obj.name === "room" ||
          !fixedElementNames.includes(obj.name as string)) &&
        canvasObjects.indexOf(obj) < canvasObjects.length - 1
    );
    setCanMoveUp(canMoveUpValue);

    // 檢查是否可以下移
    const lowestActiveObjectIndex = Math.min(
      ...activeObjects.map((obj) => nonFixedObjects.indexOf(obj))
    );
    const canMoveDownValue =
      lowestActiveObjectIndex > 0 ||
      (activeObjects[0].name === "room" &&
        canvasObjects.indexOf(activeObjects[0]) > 1);
    setCanMoveDown(canMoveDownValue);
  }, [canvas]);

  // 將選中的對象向上移動
  const bringForward = useCallback(() => {
    if (!canvas || !canMoveUp) return;
    const activeObjects = canvas.getActiveObjects();
    const canvasObjects = canvas.getObjects();

    activeObjects.sort(
      (a, b) => canvasObjects.indexOf(b) - canvasObjects.indexOf(a)
    );
    activeObjects.forEach((object) => {
      if (
        object.name === "room" ||
        !fixedElementNames.includes(object.name as string)
      ) {
        const currentIndex = canvasObjects.indexOf(object);
        if (currentIndex < canvasObjects.length - 1) {
          canvas.bringForward(object);
        }
      }
    });
    canvas.renderAll();
    ensureDesignElementsAtBottom();
    updateMoveStatus();
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
