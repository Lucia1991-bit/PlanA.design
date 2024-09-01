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
  const [completedWalls, setCompletedWalls] = useState<fabric.Path[]>([]);
  const [allWallPaths, setAllWallPaths] = useState<fabric.Path[]>([]);
  const [rooms, setRooms] = useState<fabric.Polygon[]>([]);

  const color = useDesignPageColor();
  const currentLineRef = useRef<fabric.Object | null>(null);
  const guideLineRef = useRef<fabric.Line | null>(null);
  const startPointRef = useRef<fabric.Circle | null>(null);
  const endPointRef = useRef<fabric.Circle | null>(null);

  const defaultPatternUrl =
    "https://res.cloudinary.com/datj4og4i/image/upload/v1723533704/plan-a/material/%E6%9C%A8%E5%9C%B0%E6%9D%BF/wood25_small.jpg";

  const WALL_THICKNESS = 20;
  const PREVIEW_LINE_COLOR = "rgba(0, 123, 255, 0.5)";
  const GUIDE_LINE_COLOR = "#3b82f6";
  const POINT_RADIUS = 6;
  const SNAP_THRESHOLD = 10;
  const CORNER_SIZE = WALL_THICKNESS * 1.5;

  //鎖點網格
  const snapToGrid = useCallback(
    (x: number, y: number): [number, number] => {
      const gridOffsetX = canvas ? canvas.width! / 2 : 0;
      const gridOffsetY = canvas ? canvas.height! / 2 : 0;
      const adjustedX = x - gridOffsetX;
      const adjustedY = y - gridOffsetY;
      const snappedX = Math.round(adjustedX / SUB_GRID_SIZE) * SUB_GRID_SIZE;
      const snappedY = Math.round(adjustedY / SUB_GRID_SIZE) * SUB_GRID_SIZE;
      return [
        Number((snappedX + gridOffsetX).toFixed(2)),
        Number((snappedY + gridOffsetY).toFixed(2)),
      ];
    },
    [canvas]
  );

  // 創建牆體路徑（for視覺回饋）
  const createWallPath = useCallback(
    (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      isPreview: boolean = false
    ) => {
      // 計算牆體的角度和長度
      const angle = Math.atan2(endY - startY, endX - startX);
      const length = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
      );

      // 計算牆體的寬度偏移
      const dx = (WALL_THICKNESS / 2) * Math.sin(angle);
      const dy = (WALL_THICKNESS / 2) * Math.cos(angle);

      // 創建牆體路徑
      const pathData = [
        `M ${startX - dx} ${startY + dy}`,
        `L ${endX - dx} ${endY + dy}`,
        `L ${endX + dx} ${endY - dy}`,
        `L ${startX + dx} ${startY - dy}`,
        "Z",
      ].join(" ");

      const path = new fabric.Path(pathData, {
        fill: isPreview ? PREVIEW_LINE_COLOR : color.wall.fill,
        stroke: isPreview ? PREVIEW_LINE_COLOR : color.wall.fill,
        strokeWidth: 1,
        selectable: !isPreview,
        evented: !isPreview,
        opacity: isPreview ? 0.5 : 1,
        name: "wallLine",
      });

      // 設置自定義控制點
      if (!isPreview) {
        path.setControlsVisibility({
          mt: false, // 頂部中間
          mb: false, // 底部中間
          ml: true, // 左側中間（保留）
          mr: true, // 右側中間（保留）
          mtr: false, // 旋轉控制點
          tl: false, // 左上角
          tr: false, // 右上角
          bl: false, // 左下角
          br: false, // 右下角
        });
      }

      // 設置自定義屬性
      //@ts-ignore
      path.set("startPoint", new fabric.Point(startX, startY));
      //@ts-ignore
      path.set("endPoint", new fabric.Point(endX, endY));
      //@ts-ignore
      path.set(
        "id",
        `wall_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      );

      return path;
    },
    [color.wall.fill, WALL_THICKNESS, PREVIEW_LINE_COLOR]
  );

  //創建牆體預覽
  const createOrUpdatePreviewLine = useCallback(
    (startX: number, startY: number, endX: number, endY: number) => {
      if (!canvas) return;

      const [snappedEndX, snappedEndY] = snapToGrid(endX, endY);

      if (currentLineRef.current) {
        canvas.remove(currentLineRef.current);
      }

      const previewWall = createWallPath(
        startX,
        startY,
        snappedEndX,
        snappedEndY,
        true
      );
      currentLineRef.current = previewWall;
      canvas.add(previewWall);
      canvas.renderAll();
    },
    [canvas, createWallPath, snapToGrid]
  );

  //創建虛線參考線
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

  //創建預覽參考端點
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
          fill: "#FFF",
          stroke: PREVIEW_LINE_COLOR,
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

  //確認牆體、網格、Pattern之間的順序
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

  // 顯示已完成牆體的端點
  const showCompletedWallEndpoints = useCallback(() => {
    if (!canvas) return;

    completedWalls.forEach((wall) => {
      //@ts-ignore
      const startPoint = wall.get("startPoint") as fabric.Point;
      //@ts-ignore
      const endPoint = wall.get("endPoint") as fabric.Point;

      [startPoint, endPoint].forEach((point) => {
        const endpoint = new fabric.Circle({
          left: point.x - POINT_RADIUS,
          top: point.y - POINT_RADIUS,
          radius: POINT_RADIUS,
          fill: "#FFF",
          stroke: PREVIEW_LINE_COLOR,
          selectable: false,
          evented: false,
        });
        canvas.add(endpoint);
      });
    });

    canvas.renderAll();
  }, [canvas, completedWalls, POINT_RADIUS, PREVIEW_LINE_COLOR]);

  // 創建連續牆體
  //獲取所有牆體的端點，重新繪製一次牆面(才能確保轉角處的連續性)
  const createContinuousWall = useCallback(
    (points: fabric.Point[]) => {
      if (!canvas) return null;

      const pathData = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");

      const path = new fabric.Path(pathData, {
        fill: "transparent",
        stroke: color.wall.fill,
        strokeWidth: WALL_THICKNESS,
        strokeLineJoin: "square",
        strokeLineCap: "bevel",
        selectable: true,
        evented: false,
        name: "wallSegment",
        originX: "left",
        originY: "bottom",
      });

      canvas.add(path);
      return path;
    },
    [canvas, color.wall.fill, WALL_THICKNESS]
  );

  //進入繪製模式
  const startDrawWall = useCallback(() => {
    console.log("startDrawWall: 開始繪製牆壁模式");
    setIsDrawingMode(true);
    isDrawingRef.current = true;
    setCurrentPath([]);

    // 顯示已完成線段的端點
    showCompletedWallEndpoints();
  }, [showCompletedWallEndpoints]);

  //開始繪製牆體
  const startDrawing = useCallback(
    (event: fabric.IEvent) => {
      if (!isDrawingMode || !canvas) return;

      const pointer = canvas.getPointer(event.e);
      const [x, y] = snapToGrid(pointer.x, pointer.y);
      const newPoint = new fabric.Point(x, y);

      setCurrentPath((prev) => [...prev, newPoint]);

      if (currentPath.length > 0) {
        const prevPoint = currentPath[currentPath.length - 1];
        const newWall = createWallPath(prevPoint.x, prevPoint.y, x, y);
        canvas.add(newWall);
        setCompletedWalls((prev) => [...prev, newWall]);
      }

      createOrUpdatePreviewLine(x, y, x, y);
      createOrUpdatePoint(x, y, startPointRef);
      createOrUpdatePoint(x, y, endPointRef);
      createOrUpdateGuideLine(x, y, x, y);

      canvas.renderAll();
      save();
    },
    [
      isDrawingMode,
      canvas,
      snapToGrid,
      currentPath,
      createWallPath,
      createOrUpdatePreviewLine,
      createOrUpdatePoint,
      createOrUpdateGuideLine,
      save,
    ]
  );

  const draw = useCallback(
    (event: fabric.IEvent) => {
      if (!isDrawingRef.current || !canvas || currentPath.length === 0) return;

      const pointer = canvas.getPointer(event.e);
      const [x, y] = snapToGrid(pointer.x, pointer.y);
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

  const createEndpoint = useCallback(
    (x: number, y: number, wallId: string, isStart: boolean) => {
      if (!canvas) return null;

      const endpoint = new fabric.Circle({
        left: x - POINT_RADIUS,
        top: y - POINT_RADIUS,
        radius: POINT_RADIUS,
        fill: "#FFF",
        stroke: PREVIEW_LINE_COLOR,
        selectable: false,
        evented: false,
        name: `wallEndpoint_${wallId}_${isStart ? "start" : "end"}`,
      });

      canvas.add(endpoint);
      return endpoint;
    },
    [canvas, POINT_RADIUS, PREVIEW_LINE_COLOR]
  );

  //為創建的空間填入材質
  const createPolygonWithPattern = useCallback(
    (points: fabric.Point[]) => {
      if (!canvas) return;

      const newRoom = new fabric.Polygon(points, {
        fill: "rgba(200, 200, 200, 0.4)",
        stroke: color.wall.fill,
        strokeWidth: 1,
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
      color.wall.fill,
      applyPattern,
      adjustPatternScale,
      ensureDesignElementsAtBottom,
      save,
    ]
  );

  //結束繪製
  const finishDrawWall = useCallback(() => {
    if (!canvas || !isDrawingRef.current) return;

    setIsDrawingMode(false);
    isDrawingRef.current = false;

    // 清理臨時對象
    [currentLineRef, guideLineRef, startPointRef, endPointRef].forEach(
      (ref) => {
        if (ref.current) {
          canvas.remove(ref.current);
          ref.current = null;
        }
      }
    );

    // 清除所有顯示的臨時端點
    canvas.getObjects().forEach((obj) => {
      if (obj.type === "circle" && !obj.selectable) {
        canvas.remove(obj);
      }
    });

    // 从 completedWalls 中提取点
    const points = completedWalls.reduce((acc: fabric.Point[], wall, index) => {
      //@ts-ignore
      const startPoint = wall.get("startPoint") as fabric.Point;
      if (index === 0) acc.push(startPoint);
      //@ts-ignore
      const endPoint = wall.get("endPoint") as fabric.Point;
      acc.push(endPoint);
      return acc;
    }, []);

    // 创建新的连续墙体
    if (points.length >= 2) {
      const newWallSegment = createContinuousWall(points);
      if (newWallSegment) {
        setAllWallPaths((prevPaths) => [...prevPaths, newWallSegment]);
      }
    }

    // 检查是否形成封闭空间
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    if (
      points.length > 2 &&
      Math.abs(firstPoint.x - lastPoint.x) < SNAP_THRESHOLD &&
      Math.abs(firstPoint.y - lastPoint.y) < SNAP_THRESHOLD
    ) {
      createPolygonWithPattern(points);

      // 清除所有墙体路径和预览线
      allWallPaths.forEach((path) => canvas.remove(path));
      completedWalls.forEach((wall) => canvas.remove(wall));
      if (currentLineRef.current) {
        canvas.remove(currentLineRef.current);
        currentLineRef.current = null;
      }
      setAllWallPaths([]);
      setCompletedWalls([]);
      setCurrentPath([]);
    } else {
      // 如果没有形成封闭空间，保留最后一个点作为下一段的起点
      setCurrentPath([lastPoint]);
      // 清除临时的完成墙体，因为我们已经创建了连续的墙体
      completedWalls.forEach((wall) => canvas.remove(wall));
      setCompletedWalls([]);
    }

    canvas.renderAll();
    save();
  }, [
    canvas,
    completedWalls,
    allWallPaths,
    SNAP_THRESHOLD,
    createContinuousWall,
    createPolygonWithPattern,
    save,
  ]);

  return {
    isDrawingMode,
    setIsDrawingMode,
    startDrawWall,
    startDrawing,
    draw,
    finishDrawWall,
    rooms,
    createPolygonWithPattern,
    createContinuousWall,
  };
};
