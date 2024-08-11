import { fabric } from "fabric";
import React, { useCallback } from "react";
import useDesign from "./useDesign";
import useDesignPageColor from "./useDesignPageColor";

interface useCanvasAndGridColorProps {
  canvas: fabric.Canvas | null;
  gridRef: React.MutableRefObject<fabric.Group | null>;
}

const useCanvasAndGridColor = ({
  canvas,
  gridRef,
}: useCanvasAndGridColorProps) => {
  const color = useDesignPageColor();

  const updateCanvasColor = useCallback(() => {
    if (!canvas) return;
    canvas.setBackgroundColor(color.canvas.backgroundColor, () => {
      canvas.renderAll();
    });
  }, [canvas, color.canvas.backgroundColor]);

  const updateGridColor = useCallback(() => {
    if (!gridRef.current || !canvas) return;
    gridRef.current.getObjects().forEach((line) => {
      if (line instanceof fabric.Line) {
        line.set({
          stroke:
            line.strokeWidth === 1
              ? color.canvas.subGridColor
              : color.canvas.mainGridColor,
        });
        line.setCoords();
      }
    });
    canvas.requestRenderAll();
  }, [canvas, gridRef, color.canvas.mainGridColor, color.canvas.subGridColor]);

  const updateColors = useCallback(() => {
    updateCanvasColor();
    updateGridColor();
  }, [updateCanvasColor, updateGridColor]);

  return { updateColors };
};

export default useCanvasAndGridColor;
