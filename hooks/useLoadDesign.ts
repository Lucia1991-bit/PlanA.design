import { fabric } from "fabric";
import { useEffect, useRef } from "react";
import { OBJECT_STATE } from "@/types/DesignType";

interface UseLoadStateProps {
  canvas: fabric.Canvas | null;
  initialState: React.MutableRefObject<string | undefined>;
  canvasHistory: React.MutableRefObject<string[]>;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
  gridRef: React.MutableRefObject<fabric.Group | null>;
  updateGridColor: () => void;
  updateCanvasColor: () => void;
}

export const useLoadState = ({
  canvas,
  initialState,
  canvasHistory,
  setHistoryIndex,
  gridRef,
  updateGridColor,
  updateCanvasColor,
}: UseLoadStateProps) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && initialState?.current && canvas) {
      const data = JSON.parse(initialState.current);

      const grid = gridRef.current;
      if (grid) {
        canvas.remove(grid);
      }

      canvas.loadFromJSON(data, () => {
        if (grid) {
          canvas.add(grid);
          canvas.sendToBack(grid);
        }

        updateGridColor();
        updateCanvasColor();

        const currentState = JSON.stringify(canvas.toJSON(OBJECT_STATE));

        canvasHistory.current = [currentState];
        setHistoryIndex(0);
        canvas.renderAll();
      });

      initialized.current = true;
    }
  }, [canvas, initialState, gridRef, updateGridColor, updateCanvasColor]);
};
