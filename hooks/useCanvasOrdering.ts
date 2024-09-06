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
  // 狀態：是否可以上移和下移
  const [canMoveUp, setCanMoveUp] = useState(false);
  const [canMoveDown, setCanMoveDown] = useState(false);

  // 定義固定在底部和頂部的元素
  const fixedBottomElements = ["designGrid"];
  const fixedTopElements = ["wallGroup", "finishedWall"];

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
      .filter((obj) => fixedTopElements.includes(obj.name as string));
    const otherObjects = canvas
      .getObjects()
      .filter(
        (obj) =>
          obj !== grid &&
          obj.name !== "room" &&
          !fixedTopElements.includes(obj.name as string)
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

  // 更新是否可以移動的狀態
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
    const fixedBottomIndex = canvasObjects.findIndex((obj) =>
      fixedBottomElements.includes(obj.name as string)
    );
    const firstFixedTopIndex = canvasObjects.findIndex((obj) =>
      fixedTopElements.includes(obj.name as string)
    );

    // 檢查是否可以上移
    const canMoveUpValue = activeObjects.some((obj) => {
      const index = canvasObjects.indexOf(obj);
      return (
        index < firstFixedTopIndex - 1 ||
        (obj.name === "room" && index < firstFixedTopIndex - 1)
      );
    });
    setCanMoveUp(canMoveUpValue);

    // 檢查是否可以下移
    const canMoveDownValue = activeObjects.some((obj) => {
      const index = canvasObjects.indexOf(obj);
      return (
        index > fixedBottomIndex + 1 ||
        (obj.name === "room" && index > fixedBottomIndex + 1)
      );
    });
    setCanMoveDown(canMoveDownValue);
  }, [canvas]);

  // 將選中的對象向上移動
  const bringForward = useCallback(() => {
    if (!canvas || !canMoveUp) return;
    const activeObjects = canvas.getActiveObjects();
    const canvasObjects = canvas.getObjects();
    const firstFixedTopIndex = canvasObjects.findIndex((obj) =>
      fixedTopElements.includes(obj.name as string)
    );

    activeObjects.sort(
      (a, b) => canvasObjects.indexOf(b) - canvasObjects.indexOf(a)
    );
    activeObjects.forEach((object) => {
      const currentIndex = canvasObjects.indexOf(object);
      if (
        currentIndex < firstFixedTopIndex - 1 ||
        (object.name === "room" && currentIndex < firstFixedTopIndex - 1)
      ) {
        canvas.bringForward(object);
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
    const fixedBottomIndex = canvasObjects.findIndex((obj) =>
      fixedBottomElements.includes(obj.name as string)
    );

    activeObjects.sort(
      (a, b) => canvasObjects.indexOf(a) - canvasObjects.indexOf(b)
    );
    activeObjects.forEach((object) => {
      const currentIndex = canvasObjects.indexOf(object);
      if (
        currentIndex > fixedBottomIndex + 1 ||
        (object.name === "room" && currentIndex > fixedBottomIndex + 1)
      ) {
        canvas.sendBackwards(object);
      }
    });

    canvas.renderAll();
    ensureDesignElementsAtBottom();
    updateMoveStatus();
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
