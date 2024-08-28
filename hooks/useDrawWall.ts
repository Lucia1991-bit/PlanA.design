import { fabric } from "fabric";
import { useCallback, useRef, useState } from "react";
import useDesignPageColor from "./useDesignPageColor";
import { SUB_GRID_SIZE } from "@/types/DesignType";
import { PatternOptions } from "./usePattern";

interface UseDrawWallProps {
  canvas: fabric.Canvas | null;
  gridRef: React.MutableRefObject<fabric.Group | null>;
  save: () => void;
  updateGridColor: () => void;
  applyPattern: (
    object: fabric.Object,
    imageUrl: string,
    options?: PatternOptions
  ) => void;
  adjustPatternScale: (
    object: fabric.Object,
    scaleX: number,
    scaleY: number
  ) => void;
}

export const useDrawWall = ({
  canvas,
  gridRef,
  save,
  updateGridColor,
  applyPattern,
  adjustPatternScale,
}: UseDrawWallProps) => {
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const isDrawingRef = useRef(false);
  const [currentPath, setCurrentPath] = useState<fabric.Point[]>([]);
  const [completedWalls, setCompletedWalls] = useState<fabric.Line[]>([]);
  const [rooms, setRooms] = useState<fabric.Polygon[]>([]);

  const color = useDesignPageColor();
  const currentLineRef = useRef<fabric.Line | null>(null);
  const guideLineRef = useRef<fabric.Line | null>(null);
  const startPointRef = useRef<fabric.Circle | null>(null);
  const endPointRef = useRef<fabric.Circle | null>(null);

  const defaultPatternUrl =
    "https://res.cloudinary.com/datj4og4i/image/upload/v1723533704/plan-a/material/%E6%9C%A8%E5%9C%B0%E6%9D%BF/wood25_small.jpg";

  const WALL_THICKNESS = 30;
  const PREVIEW_LINE_COLOR = "rgba(0, 123, 255, 0.7)";
  const GUIDE_LINE_COLOR = "rgba(0, 0, 255, 0.3)";
  const POINT_RADIUS = 5;
  const SNAP_THRESHOLD = 10;

  const snapToGrid = useCallback(
    (x: number, y: number): [number, number] => {
      const gridOffsetX = canvas ? canvas.width! / 2 : 0;
      const gridOffsetY = canvas ? canvas.height! / 2 : 0;
      const adjustedX = x - gridOffsetX;
      const adjustedY = y - gridOffsetY;
      const snappedX = Math.round(adjustedX / SUB_GRID_SIZE) * SUB_GRID_SIZE;
      const snappedY = Math.round(adjustedY / SUB_GRID_SIZE) * SUB_GRID_SIZE;
      return [snappedX + gridOffsetX, snappedY + gridOffsetY];
    },
    [canvas]
  );

  const createOrUpdatePreviewLine = useCallback(
    (startX: number, startY: number, endX: number, endY: number) => {
      if (!canvas) return;

      if (currentLineRef.current) {
        currentLineRef.current.set({
          x1: startX,
          y1: startY,
          x2: endX,
          y2: endY,
        });
      } else {
        const newLine = new fabric.Line([startX, startY, endX, endY], {
          stroke: PREVIEW_LINE_COLOR,
          strokeWidth: WALL_THICKNESS,
          strokeLineCap: "square",
          strokeLineJoin: "bevel",
          selectable: false,
          evented: false,
        });
        currentLineRef.current = newLine;
        canvas.add(newLine);
      }
      canvas.renderAll();
    },
    [canvas]
  );

  const createOrUpdateGuideLine = useCallback(
    (startX: number, startY: number, endX: number, endY: number) => {
      if (!canvas) return;

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const angle = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;

      if (guideLineRef.current) {
        guideLineRef.current.set({
          x1: midX - 1000 * Math.cos((angle * Math.PI) / 180),
          y1: midY - 1000 * Math.sin((angle * Math.PI) / 180),
          x2: midX + 1000 * Math.cos((angle * Math.PI) / 180),
          y2: midY + 1000 * Math.sin((angle * Math.PI) / 180),
        });
      } else {
        const guideLine = new fabric.Line(
          [
            midX - 1000 * Math.cos((angle * Math.PI) / 180),
            midY - 1000 * Math.sin((angle * Math.PI) / 180),
            midX + 1000 * Math.cos((angle * Math.PI) / 180),
            midY + 1000 * Math.sin((angle * Math.PI) / 180),
          ],
          {
            stroke: GUIDE_LINE_COLOR,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
          }
        );
        guideLineRef.current = guideLine;
        canvas.add(guideLine);
      }
      canvas.renderAll();
    },
    [canvas]
  );

  const createOrUpdatePoint = useCallback(
    (
      x: number,
      y: number,
      pointRef: React.MutableRefObject<fabric.Circle | null>
    ) => {
      if (!canvas) return;

      if (pointRef.current) {
        pointRef.current.set({ left: x - POINT_RADIUS, top: y - POINT_RADIUS });
      } else {
        const point = new fabric.Circle({
          left: x - POINT_RADIUS,
          top: y - POINT_RADIUS,
          radius: POINT_RADIUS,
          fill: PREVIEW_LINE_COLOR,
          selectable: false,
          evented: false,
        });
        pointRef.current = point;
        canvas.add(point);
      }
      canvas.renderAll();
    },
    [canvas]
  );

  const ensureDesignElementsAtBottom = useCallback(() => {
    if (!canvas || !gridRef.current) return;

    const grid = gridRef.current;
    const roomObjects = canvas
      .getObjects()
      .filter((obj) => obj.name === "room");
    const wallObjects = canvas
      .getObjects()
      .filter((obj) => obj.name === "wallLine");
    const otherObjects = canvas
      .getObjects()
      .filter(
        (obj) => obj !== grid && obj.name !== "room" && obj.name !== "wallLine"
      );

    canvas.clear();

    canvas.add(grid);
    updateGridColor();
    roomObjects.forEach((room) => canvas.add(room));
    wallObjects.forEach((wall) => canvas.add(wall));
    otherObjects.forEach((obj) => canvas.add(obj));

    canvas.renderAll();
  }, [canvas, gridRef, updateGridColor]);

  const startDrawWall = useCallback(() => {
    console.log("startDrawWall: 開始繪製牆壁模式");
    setIsDrawingMode(true);
    isDrawingRef.current = true;
    setCurrentPath([]);
    setCompletedWalls([]);
  }, []);

  const startDrawing = useCallback(
    (event: fabric.IEvent) => {
      if (!isDrawingMode || !canvas) return;

      const pointer = canvas.getPointer(event.e);
      const [x, y] = snapToGrid(pointer.x, pointer.y);
      const newPoint = new fabric.Point(x, y);

      setCurrentPath((prev) => [...prev, newPoint]);

      if (currentLineRef.current) {
        const completedLine = new fabric.Line(
          [currentLineRef.current.x1!, currentLineRef.current.y1!, x, y],
          {
            stroke: color.wall.fill,
            strokeWidth: WALL_THICKNESS,
            strokeLineCap: "square",
            strokeLineJoin: "round",
            selectable: true,
            evented: true,
            name: "wallLine",
          }
        );
        canvas.add(completedLine);
        setCompletedWalls((prev) => [...prev, completedLine]);
        canvas.remove(currentLineRef.current);
      }

      createOrUpdatePreviewLine(x, y, x, y);
      createOrUpdatePoint(x, y, startPointRef);
      createOrUpdatePoint(x, y, endPointRef);
      createOrUpdateGuideLine(x, y, x, y);

      ensureDesignElementsAtBottom();
      canvas.renderAll();
      save();
    },
    [
      isDrawingMode,
      canvas,
      snapToGrid,
      save,
      ensureDesignElementsAtBottom,
      createOrUpdatePreviewLine,
      createOrUpdatePoint,
      createOrUpdateGuideLine,
      color.wall.fill,
    ]
  );

  const draw = useCallback(
    (event: fabric.IEvent) => {
      if (!isDrawingRef.current || !canvas || !currentLineRef.current) return;

      const pointer = canvas.getPointer(event.e);
      let [x, y] = snapToGrid(pointer.x, pointer.y);
      const startPoint = currentPath[currentPath.length - 1];

      createOrUpdatePreviewLine(startPoint.x, startPoint.y, x, y);
      createOrUpdatePoint(x, y, endPointRef);
      createOrUpdateGuideLine(startPoint.x, startPoint.y, x, y);
      canvas.renderAll();
    },
    [
      canvas,
      currentPath,
      snapToGrid,
      createOrUpdatePreviewLine,
      createOrUpdatePoint,
      createOrUpdateGuideLine,
    ]
  );

  const createPolygonWithPattern = useCallback(
    (points: fabric.Point[]) => {
      if (!canvas) return;

      const newRoom = new fabric.Polygon(points, {
        fill: "rgba(200, 200, 200, 0.4)",
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

      canvas.add(newRoom);
      applyPattern(newRoom, defaultPatternUrl, { scaleX: 1, scaleY: 1 });
      adjustPatternScale(newRoom, 10, 10);

      setRooms((prevRooms) => [...prevRooms, newRoom]);
      ensureDesignElementsAtBottom();
      canvas.renderAll();
      save();

      canvas.setActiveObject(newRoom);
    },
    [
      canvas,
      ensureDesignElementsAtBottom,
      save,
      applyPattern,
      adjustPatternScale,
    ]
  );

  const finishDrawWall = useCallback(() => {
    if (!canvas || !isDrawingRef.current) return;

    setIsDrawingMode(false);
    isDrawingRef.current = false;

    if (currentLineRef.current) {
      canvas.remove(currentLineRef.current);
      currentLineRef.current = null;
    }

    if (guideLineRef.current) {
      canvas.remove(guideLineRef.current);
      guideLineRef.current = null;
    }

    if (startPointRef.current) {
      canvas.remove(startPointRef.current);
      startPointRef.current = null;
    }

    if (endPointRef.current) {
      canvas.remove(endPointRef.current);
      endPointRef.current = null;
    }

    if (completedWalls.length >= 3) {
      const points = completedWalls.map(
        (line) => new fabric.Point(line.x1!, line.y1!)
      );
      points.push(
        new fabric.Point(
          completedWalls[completedWalls.length - 1].x2!,
          completedWalls[completedWalls.length - 1].y2!
        )
      );

      createPolygonWithPattern(points);
    }

    setCurrentPath([]);
    canvas.renderAll();
    save();
  }, [canvas, isDrawingMode, completedWalls, createPolygonWithPattern, save]);

  const deleteSelectedWall = useCallback(() => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.name === "wallLine") {
      canvas.remove(activeObject);
      setCompletedWalls((prev) => prev.filter((wall) => wall !== activeObject));
      canvas.renderAll();
      save();
    }
  }, [canvas, save]);

  return {
    isDrawingMode,
    setIsDrawingMode,
    startDrawWall,
    startDrawing,
    draw,
    finishDrawWall,
    rooms,
    createPolygonWithPattern,
    deleteSelectedWall,
  };
};
