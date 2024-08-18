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
  updateCanvasColor: () => void;
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
  updateCanvasColor,
  applyPattern,
  adjustPatternScale,
}: UseDrawWallProps) => {
  // 狀態定義
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const isDrawingRef = useRef(false);
  const [currentPath, setCurrentPath] = useState<fabric.Point[]>([]);
  const [completedWalls, setCompletedWalls] = useState<fabric.Line[]>([]);
  const [rooms, setRooms] = useState<fabric.Polygon[]>([]);

  const color = useDesignPageColor();
  const currentLineRef = useRef<fabric.Line | null>(null);

  //預設地板材質圖片
  const defaultPatternUrl =
    "https://res.cloudinary.com/datj4og4i/image/upload/v1723533704/plan-a/material/%E6%9C%A8%E5%9C%B0%E6%9D%BF/wood25_small.jpg";

  // 常量定義
  const WALL_THICKNESS = 30;

  // 鎖點網格
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

  // 確保網格、牆體、地板材質在底層
  const ensureDesignElementsAtBottom = useCallback(() => {
    if (!canvas || !gridRef.current) return;

    // 將所有元素按類型分組
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

    // 清空畫布
    canvas.clear();

    // 按正確的順序重新添加元素
    canvas.add(grid); // 網格在最底層
    updateGridColor();
    updateCanvasColor();
    roomObjects.forEach((room) => canvas.add(room)); // 房間在網格之上
    wallObjects.forEach((wall) => canvas.add(wall)); // 牆體在房間之上
    otherObjects.forEach((obj) => canvas.add(obj)); // 其他物件在最上層

    canvas.renderAll();
  }, [canvas, gridRef]);

  // 開啟繪製模式
  const startDrawWall = useCallback(() => {
    console.log("startDrawWall: 開始繪製牆壁模式");
    setIsDrawingMode(true);
    isDrawingRef.current = true;
    setCurrentPath([]);
    setCompletedWalls([]);
  }, []);

  // 開始繪製
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
    [
      isDrawingMode,
      canvas,
      snapToGrid,
      color.wall.fill,
      save,
      ensureDesignElementsAtBottom,
    ]
  );

  // 繪製中
  const draw = useCallback(
    (event: fabric.IEvent) => {
      if (!isDrawingRef.current || !canvas || !currentLineRef.current) return;

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

  // 創建多邊形並應用圖案
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
    [canvas, ensureDesignElementsAtBottom, save]
  );

  const TOLERANCE = 20; // 容許範圍，單位為像素

  // 完成繪製
  const finishDrawWall = useCallback(() => {
    if (!canvas || !isDrawingRef.current) return;

    setIsDrawingMode(false);
    isDrawingRef.current = false;

    //結束繪製後刪除掉多餘的線
    if (currentLineRef.current) {
      canvas.remove(currentLineRef.current);
      currentLineRef.current = null;
    }

    // 創建多邊形（如果有至少3條線）
    if (completedWalls.length >= 4) {
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
    setCompletedWalls([]);
    canvas.renderAll();
    save();
  }, [canvas, isDrawingMode, completedWalls, createPolygonWithPattern, save]);

  return {
    isDrawingMode,
    setIsDrawingMode,
    startDrawWall,
    startDrawing,
    draw,
    finishDrawWall,
    rooms,
    createPolygonWithPattern,
  };
};
