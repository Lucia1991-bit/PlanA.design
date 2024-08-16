import { fabric } from "fabric";
import { useCallback, useRef, useState, useEffect } from "react";
import useDesignPageColor from "./useDesignPageColor";
import { SUB_GRID_SIZE } from "@/types/DesignType";

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

  const snapToGrid = useCallback(
    (x: number, y: number): [number, number] => {
      // 計算網格的起始位置
      const gridOffsetX = canvas ? canvas.width! / 2 : 0;
      const gridOffsetY = canvas ? canvas.height! / 2 : 0;

      // 調整坐標以考慮網格偏移
      const adjustedX = x - gridOffsetX;
      const adjustedY = y - gridOffsetY;

      // 對齊到最近的 SUB_GRID_SIZE
      const snappedX = Math.round(adjustedX / SUB_GRID_SIZE) * SUB_GRID_SIZE;
      const snappedY = Math.round(adjustedY / SUB_GRID_SIZE) * SUB_GRID_SIZE;

      // 將坐標轉換回畫布坐標系
      return [snappedX + gridOffsetX, snappedY + gridOffsetY];
    },
    [canvas]
  );

  // 新增：確保設計元素在底層的輔助函數
  const ensureDesignElementsAtBottom = useCallback(() => {
    if (!canvas || !gridRef.current) return;

    // 將所有設計元素移到底層
    const designElements = canvas
      .getObjects()
      .filter(
        (obj) =>
          obj === gridRef.current ||
          obj.name === "room" ||
          obj.name === "wallLine"
      );
    designElements.forEach((obj) => canvas.sendToBack(obj));

    // 將網格移到最底層
    canvas.sendToBack(gridRef.current);

    // 如果存在多邊形，將其移到網格之上
    if (innerPolygon) {
      canvas.bringForward(innerPolygon);
    }

    // 將所有牆體移到多邊形之上
    canvas.getObjects().forEach((obj) => {
      if (obj.name === "wallLine") {
        canvas.bringForward(obj);
      }
    });

    canvas.renderAll();
  }, [canvas, gridRef, innerPolygon]);

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
        strokeWidth: 29,
        selectable: true,
        evented: true,
        hasBorders: true,
        hasControls: true,
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
        name: "wallLine",
      });

      newLine.setControlsVisibility({
        mt: false,
        mb: false, // 隱藏頂部和底部中間的控制點
        ml: false,
        mr: false, // 只顯示左右中間的控制點
        tl: false,
        tr: false,
        bl: false,
        br: false, // 隱藏角落的控制點
        mtr: false,
      });

      currentLineRef.current = newLine;
      canvas.add(newLine);
      ensureDesignElementsAtBottom();
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
        fill: "red",
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
      ensureDesignElementsAtBottom();
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
