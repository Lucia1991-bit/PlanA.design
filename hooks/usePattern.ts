import { fabric } from "fabric";
import { useCallback } from "react";

interface UsePatternProps {
  canvas: fabric.Canvas | null;
}

export interface PatternOptions {
  scaleX?: number;
  scaleY?: number;
  repeat?: string;
}

export const usePattern = ({ canvas }: UsePatternProps) => {
  // 應用 pattern 到對象
  const applyPattern = useCallback(
    (object: fabric.Object, imageUrl: string, options: PatternOptions = {}) => {
      if (!canvas) return;

      fabric.Image.fromURL(
        imageUrl,
        (img) => {
          if (img.width === 0 || img.height === 0) {
            console.error("Failed to load image");
            return;
          }
          const pattern = new fabric.Pattern({
            source: img.getElement() as HTMLImageElement,
            repeat: options.repeat || "repeat",
            offsetX: 0,
            offsetY: 0,
            //@ts-ignore
            scaleX: options.scaleX || 1,
            scaleY: options.scaleY || 1,
          });
          (pattern as any).sourceURL = imageUrl; // 儲存原始 URL
          object.set("fill", pattern);
          canvas.renderAll();
        },
        { crossOrigin: "anonymous" }
      );
    },
    [canvas]
  );

  // 調整已應用 pattern 的比例
  const adjustPatternScale = useCallback(
    (object: fabric.Object, scaleX: number, scaleY: number) => {
      if (!canvas) return;
      const fill = object.get("fill");
      if (fill instanceof fabric.Pattern) {
        const offsetX = fill.offsetX || 0;
        const offsetY = fill.offsetY || 0;
        fill.patternTransform = [scaleX, 0, 0, scaleY, offsetX, offsetY];
        object.set("fill", fill);
        canvas.renderAll();
      }
    },
    [canvas]
  );

  return { applyPattern, adjustPatternScale };
};
