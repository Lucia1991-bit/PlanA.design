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
  const [canMoveUp, setCanMoveUp] = useState(false);
  const [canMoveDown, setCanMoveDown] = useState(false);

  const fixedElementNames = ["room", "wallGroup", "finishedWall", "designGrid"];

  const ensureDesignElementsAtBottom = useCallback(() => {
    if (!canvas || !gridRef.current) return;

    const grid = gridRef.current;
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

    canvas.clear();

    canvas.add(grid);
    updateGridColor();
    roomObjects.forEach((room) => canvas.add(room));
    wallObjects.forEach((wall) => canvas.add(wall));
    otherObjects.forEach((obj) => canvas.add(obj));

    canvas.renderAll();
  }, [canvas, gridRef, updateGridColor]);

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

    const highestActiveObjectIndex = Math.max(
      ...activeObjects.map((obj) => canvasObjects.indexOf(obj))
    );

    // Check if any active object is not a fixed element and can move up
    const canMoveUpValue = activeObjects.some(
      (obj) =>
        !fixedElementNames.includes(obj.name as string) &&
        canvasObjects.indexOf(obj) < canvasObjects.length - 1
    );
    setCanMoveUp(canMoveUpValue);

    const lowestActiveObjectIndex = Math.min(
      ...activeObjects.map((obj) => nonFixedObjects.indexOf(obj))
    );
    setCanMoveDown(lowestActiveObjectIndex > 0);
  }, [canvas]);

  const bringForward = useCallback(() => {
    if (!canvas || !canMoveUp) return;
    const activeObjects = canvas.getActiveObjects();
    const canvasObjects = canvas.getObjects();

    activeObjects.sort(
      (a, b) => canvasObjects.indexOf(b) - canvasObjects.indexOf(a)
    );
    activeObjects.forEach((object) => {
      if (!fixedElementNames.includes(object.name as string)) {
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
      if (!fixedElementNames.includes(object.name as string)) {
        const currentIndex = canvasObjects.indexOf(object);
        if (currentIndex > fixedTopIndex + 1) {
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
