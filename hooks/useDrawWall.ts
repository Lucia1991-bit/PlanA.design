import { fabric } from "fabric";
import { useCallback, useState } from "react";
import useDesignPageColor from "./useDesignPageColor";

interface UseDrawWallProps {
  canvas: fabric.Canvas | null;
  gridRef: React.MutableRefObject<fabric.Group | null>;
  save: () => void;
}

export const useDrawWall = ({ canvas, gridRef, save }: UseDrawWallProps) => {
  // 狀態定義
  const [isDrawingMode, setIsDrawingMode] = useState(false); // 是否處於繪製模式
  const [startPoint, setStartPoint] = useState<fabric.Point | null>(null); // 當前線段的起點
  const [currentLine, setCurrentLine] = useState<fabric.Line | null>(null); // 當前正在繪製的線段
  const [lines, setLines] = useState<fabric.Line[]>([]); // 已繪製的所有線段
  const [points, setPoints] = useState<fabric.Point[]>([]); // 所有點的集合
  const [polygon, setPolygon] = useState<fabric.Polygon | null>(null); // 最終形成的多邊形

  const color = useDesignPageColor(); // 獲取設計頁面的顏色配置

  // 將座標對齊網格
  const snapToGrid = useCallback((x: number, y: number): [number, number] => {
    const gridSize = 8;
    return [
      Math.round(x / gridSize) * gridSize,
      Math.round(y / gridSize) * gridSize,
    ];
  }, []);

  // 開始繪製牆面
  const startDrawWall = useCallback(() => {
    console.log("啟動繪製模式");
    setIsDrawingMode(true);
  }, []);

  // 開始繪製一個新的線段
  const startDrawing = useCallback(
    (o: fabric.IEvent) => {
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

  // 繪製線段
  const draw = useCallback(
    (o: fabric.IEvent) => {
      if (!isDrawingMode || !startPoint || !currentLine || !canvas) return;
      const evt = o.e as MouseEvent;
      if (evt.altKey) return; // 如果按下 Alt 鍵，不繼續繪製

      const pointer = canvas.getPointer(o.e);
      let [endX, endY] = snapToGrid(pointer.x, pointer.y);

      // 確保線條只能水平或垂直
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

  // 結束當前線段的繪製
  const endDrawing = useCallback(() => {
    if (!isDrawingMode || !startPoint || !currentLine || !canvas) return;

    const endPoint = new fabric.Point(currentLine.x2!, currentLine.y2!);
    const newPoints = [...points, endPoint];
    setPoints(newPoints);
    setLines((prevLines) => [...prevLines, currentLine]);

    // 檢查是否形成封閉路徑
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
    save(); // 保存當前狀態
  }, [isDrawingMode, startPoint, currentLine, canvas, points, polygon, save]);

  // 完成牆面繪製
  const finishDrawWall = useCallback(() => {
    setIsDrawingMode(false);
    if (!canvas || !polygon) {
      console.log("請先完成封閉牆面");
      return;
    }

    // 為牆面添加材質
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

    // 重置狀態
    setLines([]);
    setPoints([]);
    setPolygon(null);
    console.log("結束繪製模式");
    save(); // 保存最終狀態
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
