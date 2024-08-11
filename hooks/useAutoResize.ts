import React, {
  useCallback,
  useEffect,
  useState,
  MutableRefObject,
  useRef,
} from "react";
import debounce from "lodash/debounce";
import { fabric } from "fabric";
import { MAX_ZOOM } from "@/types/DesignType";

interface UseAutoResizeProps {
  canvas: fabric.Canvas | null;
  container: HTMLDivElement | null;
  gridRef: MutableRefObject<fabric.Group | null>;
  createGrid: (width: number, height: number) => fabric.Group;
  updateGridPosition: () => void;
}

const useAutoResize = ({
  canvas,
  container,
  gridRef,
  createGrid,
  updateGridPosition,
}: UseAutoResizeProps) => {
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const maxSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    setIsCanvasReady(!!canvas && !!container);
  }, [canvas, container]);

  const resizeCanvas = useCallback(() => {
    if (!canvas || !container || !isCanvasReady) {
      console.log("Canvas or container not ready");
      return;
    }

    const newWidth = container.offsetWidth;
    const newHeight = container.offsetHeight;
    const oldWidth = canvas.getWidth();
    const oldHeight = canvas.getHeight();

    // 更新最大尺寸
    maxSizeRef.current = {
      width: Math.max(maxSizeRef.current.width, newWidth),
      height: Math.max(maxSizeRef.current.height, newHeight),
    };

    try {
      // 保存當前的對象和它們的相對位置
      const objects = canvas
        .getObjects()
        .filter((obj) => obj !== gridRef.current);
      const objectsData = objects.map((obj) => ({
        object: obj,
        originalLeft: obj.left,
        originalTop: obj.top,
        originalScaleX: obj.scaleX,
        originalScaleY: obj.scaleY,
        originalWidth: obj.width,
        originalHeight: obj.height,
      }));

      canvas.setWidth(newWidth);
      canvas.setHeight(newHeight);

      // 調整網格大小
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

      // 確保網格在最底層
      canvas.sendToBack(gridRef.current);

      // 重新添加所有對象並調整它們的位置和大小
      objectsData.forEach(
        ({
          object,
          originalLeft,
          originalTop,
          originalScaleX,
          originalScaleY,
          originalWidth,
          originalHeight,
        }) => {
          const scaleX =
            (newWidth / maxSizeRef.current.width) * originalScaleX!;
          const scaleY =
            (newHeight / maxSizeRef.current.height) * originalScaleY!;
          const left = (originalLeft! / maxSizeRef.current.width) * newWidth;
          const top = (originalTop! / maxSizeRef.current.height) * newHeight;

          object.set({
            left,
            top,
            scaleX,
            scaleY,
          });
          object.setCoords();
        }
      );

      updateGridPosition();
      canvas.requestRenderAll();
    } catch (error) {
      console.error("Error resizing canvas:", error);
    }
  }, [
    canvas,
    container,
    isCanvasReady,
    gridRef,
    createGrid,
    updateGridPosition,
  ]);

  useEffect(() => {
    const debouncedResize = debounce(resizeCanvas, 50);

    if (isCanvasReady && container) {
      console.log("Setting up ResizeObserver in useAutoResize");
      const resizeObserver = new ResizeObserver(debouncedResize);
      resizeObserver.observe(container);

      // 初始调用一次以确保正确的初始大小
      resizeCanvas();

      return () => {
        resizeObserver.disconnect();
        debouncedResize.cancel();
      };
    }
  }, [isCanvasReady, resizeCanvas, container]);

  return { resizeCanvas };
};

export default useAutoResize;
