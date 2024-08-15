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

  // 鎖點網格
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

  // 啟動繪製模式
  const startDrawing = useCallback(
    (o: fabric.IEvent) => {
      setIsDrawingMode(true);

      if (!canvas || !isDrawingMode) return;
      const evt = o.e as MouseEvent;
      if (evt.altKey) return; // 如果按下 Alt 鍵，不開始繪製

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

  // 限制只能畫水平或垂直線
  const draw = useCallback(
    (o: fabric.IEvent) => {
      if (!isDrawingMode || !startPoint || !currentLine || !canvas) return;
      const evt = o.e as MouseEvent;
      if (evt.altKey) return; // 如果按下 Alt 鍵，不繼續繪製

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

  // 結束繪製動作
  const endDrawing = useCallback(() => {
    if (!isDrawingMode || !startPoint || !currentLine || !canvas) return;

    const endPoint = new fabric.Point(currentLine.x2!, currentLine.y2!);
    const newPoints = [...points, endPoint];
    setPoints(newPoints);
    setLines((prevLines) => [...prevLines, currentLine]);

    // 檢查是否形成封閉的區域
    if (
      newPoints.length > 2 &&
      Math.abs(endPoint.x - newPoints[0].x) < 20 &&
      Math.abs(endPoint.y - newPoints[0].y) < 20
    ) {
      // 創建並添加新的多邊形
      if (polygon) canvas.remove(polygon);
      const newPolygon = new fabric.Polygon(newPoints, {
        fill: "rgba(0,0,0,0.5)",
        selectable: false,
      });

      canvas.add(newPolygon);
      setPolygon(newPolygon);
    }

    // 將終點設置為新的起點，為可能下一次繪製做準備
    setStartPoint(endPoint);
    setCurrentLine(null);

    save();
  }, [isDrawingMode, startPoint, currentLine, canvas, points, polygon, save]);

  // 結束繪製並填入預設材質
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

    // 全部重置為下一次繪製
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
