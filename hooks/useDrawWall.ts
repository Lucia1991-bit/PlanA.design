import { fabric } from "fabric";
import { useCallback, useRef, useState } from "react";
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
  const [currentPath, setCurrentPath] = useState<Path>([]);
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
      let [x, y] = snapToGrid(pointer.x, pointer.y);

      const newPoint = new fabric.Point(x, y);
      setCurrentPath([newPoint]);

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
      if (
        !isDrawingMode ||
        !canvas ||
        currentPath.length === 0 ||
        !currentLineRef.current
      )
        return;

      const pointer = canvas.getPointer(event.e);
      let [x, y] = snapToGrid(pointer.x, pointer.y);
      const startPoint = currentPath[0];

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

  const isPointNear = useCallback(
    (p1: Point, p2: Point, threshold: number): boolean => {
      return p1.distanceFrom(p2) < threshold;
    },
    []
  );

  const calculateInnerPoints = useCallback((walls: fabric.Line[]): Point[] => {
    return walls.flatMap((wall) => {
      const angle = Math.atan2(wall.y2! - wall.y1!, wall.x2! - wall.x1!);
      const offset = WALL_THICKNESS / 2;
      const dx = Math.sin(angle) * offset;
      const dy = -Math.cos(angle) * offset;

      return [
        new fabric.Point(wall.x1! + dx, wall.y1! + dy),
        new fabric.Point(wall.x2! + dx, wall.y2! + dy),
      ];
    });
  }, []);

  const checkClosedSpace = useCallback(
    (walls: fabric.Line[]): boolean => {
      if (walls.length < 3) return false;

      const innerPoints = calculateInnerPoints(walls);
      const firstPoint = innerPoints[0];
      const lastPoint = innerPoints[innerPoints.length - 1];

      return isPointNear(firstPoint, lastPoint, GRID_SIZE);
    },
    [calculateInnerPoints, isPointNear]
  );

  const endDrawing = useCallback(
    (event: fabric.IEvent) => {
      if (
        !isDrawingMode ||
        !canvas ||
        currentPath.length === 0 ||
        !currentLineRef.current
      )
        return;

      const pointer = canvas.getPointer(event.e);
      let [x, y] = snapToGrid(pointer.x, pointer.y);
      const startPoint = currentPath[0];

      if (Math.abs(x - startPoint.x) > Math.abs(y - startPoint.y)) {
        y = startPoint.y;
      } else {
        x = startPoint.x;
      }

      currentLineRef.current.set({ x2: x, y2: y });
      const newWalls = [...completedWalls, currentLineRef.current];
      setCompletedWalls(newWalls);
      setCurrentPath([...currentPath, new fabric.Point(x, y)]);

      if (checkClosedSpace(newWalls)) {
        createInnerPolygon(newWalls);
      }

      currentLineRef.current = null;
      canvas.renderAll();
    },
    [
      isDrawingMode,
      canvas,
      currentPath,
      completedWalls,
      snapToGrid,
      checkClosedSpace,
    ]
  );

  const createInnerPolygon = useCallback(
    (walls: fabric.Line[]) => {
      if (!canvas) return;

      const innerPoints = calculateInnerPoints(walls);

      if (innerPolygon) {
        canvas.remove(innerPolygon);
      }

      const newInnerPolygon = new fabric.Polygon(innerPoints, {
        fill: "rgba(0,0,0,0.2)",
        stroke: "transparent",
        selectable: false,
        evented: false,
        name: "innerPolygon",
      });

      canvas.add(newInnerPolygon);
      setInnerPolygon(newInnerPolygon);
      canvas.sendToBack(newInnerPolygon);

      canvas.renderAll();
    },
    [canvas, calculateInnerPoints, innerPolygon]
  );

  const finishDrawWall = useCallback(() => {
    setIsDrawingMode(false);
    if (currentLineRef.current && canvas) {
      canvas.remove(currentLineRef.current);
    }
    currentLineRef.current = null;
    setCurrentPath([]);
  }, [canvas]);

  return {
    isDrawingMode,
    setIsDrawingMode,
    startDrawWall,
    startDrawing,
    draw,
    endDrawing,
    finishDrawWall,
    innerPolygon,
  };
};
