import React, {
  useCallback,
  useEffect,
  useState,
  MutableRefObject,
} from "react";
import debounce from "lodash/debounce";
import { fabric } from "fabric";
import { MAX_ZOOM } from "@/types/DesignType";

interface UseAutoResizeProps {
  canvas: fabric.Canvas | null;
  gridRef: MutableRefObject<fabric.Group | null>;
  createGrid: (width: number, height: number) => fabric.Group;
  updateGridPosition: () => void;
}

const useAutoResize = ({
  canvas,
  gridRef,
  createGrid,
  updateGridPosition,
}: UseAutoResizeProps) => {
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  useEffect(() => {
    setIsCanvasReady(!!canvas);
  }, [canvas]);

  const resizeCanvas = useCallback(() => {
    if (!canvas || !isCanvasReady) {
      return;
    }

    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    try {
      canvas.setWidth(newWidth);
      canvas.setHeight(newHeight);

      if (!gridRef.current) {
        const newGrid = createGrid(newWidth, newHeight);
        gridRef.current = newGrid;
        canvas.add(newGrid);
      } else {
        const currentGrid = gridRef.current;
        currentGrid.set({
          width: newWidth * MAX_ZOOM,
          height: newHeight * MAX_ZOOM,
        });
        currentGrid.setCoords();
      }

      updateGridPosition();
      canvas.renderAll();
    } catch (error) {
      console.error("Error resizing canvas:", error);
    }
  }, [canvas, isCanvasReady, gridRef, createGrid, updateGridPosition]);

  useEffect(() => {
    const debouncedResize = debounce(resizeCanvas, 100);

    if (isCanvasReady) {
      window.addEventListener("resize", debouncedResize);
      resizeCanvas();
    }

    return () => {
      window.removeEventListener("resize", debouncedResize);
      debouncedResize.cancel();
    };
  }, [isCanvasReady, resizeCanvas]);

  return { resizeCanvas };
};

export default useAutoResize;
