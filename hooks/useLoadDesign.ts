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

      // 處理 Pattern
      if (data.objects) {
        data.objects.forEach((obj: any) => {
          if (obj.fill && obj.fill.type === "pattern") {
            fabric.util.loadImage(obj.fill.source, (img) => {
              obj.fill = new fabric.Pattern({
                source: img,
                repeat: obj.fill.repeat,
                //@ts-ignore
                scaleX: obj.fill.scaleX,
                scaleY: obj.fill.scaleY,
              });
              (obj.fill as any).sourceURL = obj.fill.source;
            });
          }
        });
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
