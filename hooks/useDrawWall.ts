import { fabric } from "fabric";
import { useCallback, useState } from "react";
import useDesignPageColor from "./useDesignPageColor";

interface UseDrawWallProps {
  canvas: fabric.Canvas | null;
  gridRef: React.MutableRefObject<fabric.Group | null>;
  save: () => void;
}

export const useDrawWall = ({ canvas, gridRef, save }: UseDrawWallProps) => {
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [startPoint, setStartPoint] = useState<fabric.Point | null>(null);
  const [currentLine, setCurrentLine] = useState<fabric.Line | null>(null);
  const [lines, setLines] = useState<fabric.Line[]>([]);
  const [points, setPoints] = useState<fabric.Point[]>([]);
  const [polygon, setPolygon] = useState<fabric.Polygon | null>(null);

  const color = useDesignPageColor();

  const snapToGrid = useCallback((x: number, y: number): [number, number] => {
    const gridSize = 8;
    return [
      Math.round(x / gridSize) * gridSize,
      Math.round(y / gridSize) * gridSize,
    ];
  }, []);

  const startDrawWall = useCallback(() => {
    console.log("啟動繪製模式");
    setIsDrawingMode(true);
  }, []);

  const startDrawing = useCallback(
    (o: fabric.IEvent) => {
      if (!canvas || !isDrawingMode) return;
      const evt = o.e as MouseEvent;
      if (evt.altKey) return;

      const pointer = canvas.getPointer(o.e);
      const [x, y] = snapToGrid(pointer.x, pointer.y);
      setStartPoint(new fabric.Point(x, y));

      const newLine = new fabric.Line([x, y, x, y], {
        stroke: color.wall.fill,
        strokeWidth: 29,
        selectable: false,
      });
      canvas.add(newLine);
      setCurrentLine(newLine);
    },
    [canvas, isDrawingMode, snapToGrid, color.wall.fill]
  );

  const draw = useCallback(
    (o: fabric.IEvent) => {
      if (!isDrawingMode || !startPoint || !currentLine || !canvas) return;
      const evt = o.e as MouseEvent;
      if (evt.altKey) return;

      const pointer = canvas.getPointer(o.e);
      let [endX, endY] = snapToGrid(pointer.x, pointer.y);

      if (Math.abs(endX - startPoint.x) > Math.abs(endY - startPoint.y)) {
        endY = startPoint.y; // 水平線
      } else {
        endX = startPoint.x; // 垂直線
      }

      currentLine.set({ x2: endX, y2: endY });
      canvas.renderAll();
    },
    [isDrawingMode, startPoint, currentLine, canvas, snapToGrid]
  );

  const endDrawing = useCallback(() => {
    if (!isDrawingMode || !startPoint || !currentLine || !canvas) return;

    const endPoint = new fabric.Point(currentLine.x2!, currentLine.y2!);
    const newPoints = [...points, endPoint];
    setPoints(newPoints);
    setLines((prevLines) => [...prevLines, currentLine]);

    if (
      newPoints.length > 2 &&
      Math.abs(endPoint.x - newPoints[0].x) < 20 &&
      Math.abs(endPoint.y - newPoints[0].y) < 20
    ) {
      if (polygon) canvas.remove(polygon);
      const newPolygon = new fabric.Polygon(newPoints, {
        fill: "rgba(0,0,0,0.5)",
        selectable: false,
      });

      canvas.add(newPolygon);
      setPolygon(newPolygon);
    }

    setStartPoint(endPoint);
    setCurrentLine(null);

    save();
  }, [isDrawingMode, startPoint, currentLine, canvas, points, polygon, save]);

  const finishDrawWall = useCallback(() => {
    setIsDrawingMode(false);
    if (!canvas || !polygon) {
      console.log("請先完成封閉牆面");
      return;
    }

    fabric.Image.fromURL("/wood1.jpg", (img) => {
      const pattern = new fabric.Pattern({
        source: img.getElement() as HTMLImageElement,
        repeat: "repeat",
      });
      polygon.set({
        fill: pattern,
        stroke: "black",
        strokeWidth: 2,
        selectable: true,
      });
      canvas.renderAll();
    });

    setLines([]);
    setPoints([]);
    setPolygon(null);

    console.log("結束繪製模式");
    save();
  }, [canvas, polygon, save]);

  return {
    isDrawingMode,
    setIsDrawingMode,
    startDrawWall,
    startDrawing,
    draw,
    endDrawing,
    finishDrawWall,
    polygon,
  };
};
