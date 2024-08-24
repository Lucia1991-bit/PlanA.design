import { fabric } from "fabric";
import { useEffect, useRef } from "react";
import { CanvasLayer, OBJECT_STATE } from "@/types/DesignType";

interface UseLoadDesignProps {
  canvas: fabric.Canvas | null;
  initialState: React.MutableRefObject<string | undefined>;
  canvasHistory: React.MutableRefObject<string[]>;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
  gridRef: React.MutableRefObject<fabric.Group | null>;
  updateGridColor: () => void;
  updateCanvasColor: () => void;
  updateGridPosition: () => void;
  setCanvasLayers: React.Dispatch<React.SetStateAction<CanvasLayer[]>>;
  setImageResources: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
}

export const useLoadDesign = ({
  canvas,
  initialState,
  canvasHistory,
  setHistoryIndex,
  gridRef,
  updateGridColor,
  updateCanvasColor,
  updateGridPosition,
  setCanvasLayers,
  setImageResources,
}: UseLoadDesignProps) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && initialState?.current && canvas) {
      try {
        // 首先解析外層的 JSON 字符串
        const parsedInitialState = JSON.parse(initialState.current);

        // 然後解析內層的 JSON 字符串
        const {
          canvasState,
          canvasLayers = [],
          imageResources = {},
        } = JSON.parse(parsedInitialState);

        if (!canvasState) {
          console.error("Canvas state is undefined or null");
          return;
        }

        // 更新 pattern 相關狀態
        setCanvasLayers(canvasLayers);
        setImageResources(imageResources);

        const grid = gridRef.current;
        if (grid) {
          canvas.remove(grid);
        }

        canvas.loadFromJSON(canvasState, () => {
          // 處理 Pattern
          canvasLayers.forEach((layer: CanvasLayer) => {
            const obj = canvas.getObjects()[layer.index];
            if (obj && obj.name === "room") {
              const imageUrl = imageResources[layer.pattern.sourceId];
              if (typeof imageUrl === "string") {
                fabric.util.loadImage(
                  imageUrl,
                  (img) => {
                    if (img) {
                      const pattern = new fabric.Pattern({
                        source: img,
                        repeat: layer.pattern.repeat,
                        //@ts-ignore
                        scaleX: layer.pattern.scaleX,
                        scaleY: layer.pattern.scaleY,
                        //@ts-ignore
                        patternTransform: layer.pattern.patternTransform,
                      });
                      obj.set("fill", pattern);
                    } else {
                      console.warn(
                        `Failed to load image for layer ${layer.index}`
                      );
                      obj.set("fill", "rgba(0,0,0,0)");
                    }
                    canvas.renderAll();
                  },
                  null,
                  //@ts-ignore
                  { crossOrigin: "anonymous" }
                );
              } else {
                console.warn(`Invalid image URL for layer ${layer.index}`);
                obj.set("fill", "rgba(0,0,0,0)");
              }
            }
          });

          if (grid) {
            canvas.add(grid);
            canvas.sendToBack(grid);
          }
          updateGridPosition();
          updateGridColor();
          updateCanvasColor();

          // 設置畫布尺寸
          if (canvasState.width && canvasState.height) {
            canvas.setWidth(canvasState.width);
            canvas.setHeight(canvasState.height);
          }

          const currentState = JSON.stringify({
            canvasState: canvas.toJSON(OBJECT_STATE),
            canvasLayers,
            imageResources,
          });
          canvasHistory.current = [currentState];
          setHistoryIndex(0);

          canvas.renderAll();
        });

        initialized.current = true;
      } catch (error) {
        console.error("Error processing initial state:", error);
      }
    }
  }, [
    canvas,
    initialState,
    gridRef,
    updateGridColor,
    updateCanvasColor,
    updateGridPosition,
    canvasHistory,
    setHistoryIndex,
    setCanvasLayers,
    setImageResources,
  ]);
};
