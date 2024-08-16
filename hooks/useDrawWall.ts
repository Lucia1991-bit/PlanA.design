import { fabric } from "fabric";
import { useCallback, useRef, useState, useEffect } from "react";
import useDesignPageColor from "./useDesignPageColor";

interface UseDrawWallProps {
  canvas: fabric.Canvas | null;
  gridRef: React.MutableRefObject<fabric.Group | null>;
  save: () => void;
}

type Point = fabric.Point;
type Path = Point[];

export const useDrawWall = ({ canvas, gridRef, save }: UseDrawWallProps) => {
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentPath, setCurrentPath] = useState<fabric.Point[]>([]);
  const [completedWalls, setCompletedWalls] = useState<fabric.Line[]>([]);
  const [innerPolygon, setInnerPolygon] = useState<fabric.Polygon | null>(null);

  const color = useDesignPageColor();
  const currentLineRef = useRef<fabric.Line | null>(null);

  const WALL_THICKNESS = 29;
  const GRID_SIZE = 8;

  const snapToGrid = useCallback((x: number, y: number): [number, number] => {
    return [
      Math.round(x / GRID_SIZE) * GRID_SIZE,
      Math.round(y / GRID_SIZE) * GRID_SIZE,
    ];
  }, []);

  const startDrawWall = useCallback(() => {
    console.log("startDrawWall: 開始繪製牆壁模式");
    setIsDrawingMode(true);
    setCurrentPath([]);
    setCompletedWalls([]);
    if (innerPolygon && canvas) {
      canvas.remove(innerPolygon);
      setInnerPolygon(null);
    }
  }, [canvas, innerPolygon]);

  const startDrawing = useCallback(
    (event: fabric.IEvent) => {
      if (!isDrawingMode || !canvas) return;

      const pointer = canvas.getPointer(event.e);
      const [x, y] = snapToGrid(pointer.x, pointer.y);
      const newPoint = new fabric.Point(x, y);

      setCurrentPath((prev) => [...prev, newPoint]);

      if (currentLineRef.current) {
        currentLineRef.current.setCoords();
        setCompletedWalls((prev) => [...prev, currentLineRef.current!]);
      }

      const newLine = new fabric.Line([x, y, x, y], {
        stroke: color.wall.fill,
        strokeWidth: WALL_THICKNESS,
        selectable: false,
        evented: false,
        name: "wallLine",
      });

      currentLineRef.current = newLine;
      canvas.add(newLine);
      canvas.renderAll();
      save();
    },
    [isDrawingMode, canvas, snapToGrid, color.wall.fill, save]
  );

  const draw = useCallback(
    (event: fabric.IEvent) => {
      if (!isDrawingMode || !canvas || !currentLineRef.current) return;

      const pointer = canvas.getPointer(event.e);
      let [x, y] = snapToGrid(pointer.x, pointer.y);
      const startPoint = currentPath[currentPath.length - 1];

      if (Math.abs(x - startPoint.x) > Math.abs(y - startPoint.y)) {
        y = startPoint.y;
      } else {
        x = startPoint.x;
      }

      currentLineRef.current.set({ x2: x, y2: y });
      canvas.renderAll();
    },
    [isDrawingMode, canvas, currentPath, snapToGrid]
  );

  const finishDrawWall = useCallback(() => {
    if (!canvas || !isDrawingMode) return;

    setIsDrawingMode(false);
    if (currentLineRef.current) {
      setCompletedWalls((prev) => [...prev, currentLineRef.current!]);
    }
    currentLineRef.current = null;

    // 創建多邊形（如果有至少3條線）
    if (completedWalls.length >= 2) {
      const points = completedWalls.map(
        (line) => new fabric.Point(line.x1!, line.y1!)
      );
      points.push(
        new fabric.Point(
          completedWalls[completedWalls.length - 1].x2!,
          completedWalls[completedWalls.length - 1].y2!
        )
      );

      if (innerPolygon) {
        canvas.remove(innerPolygon);
      }

      const newInnerPolygon = new fabric.Polygon(points, {
        fill: "rgba(0,0,0,0.2)",
        selectable: true,
        evented: true,
        hasBorders: true,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        cornerColor: "#FFF",
        cornerStyle: "circle",
        borderColor: "#3b82f6",
        borderScaleFactor: 1.5,
        transparentCorners: false,
        borderOpacityWhenMoving: 1,
        cornerStrokeColor: "#3b82f6",
        name: "room",
      });

      canvas.add(newInnerPolygon);
      setInnerPolygon(newInnerPolygon);
      canvas.sendToBack(newInnerPolygon);
    }

    setCurrentPath([]);
    canvas.renderAll();
    save();
  }, [canvas, isDrawingMode, completedWalls, innerPolygon, save]);

  return {
    isDrawingMode,
    setIsDrawingMode,
    startDrawWall,
    startDrawing,
    draw,
    finishDrawWall,
    innerPolygon,
  };
};
