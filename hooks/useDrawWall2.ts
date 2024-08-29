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
  const [completedWalls, setCompletedWalls] = useState<fabric.Group[]>([]);
  const [rooms, setRooms] = useState<fabric.Polygon[]>([]);

  const color = useDesignPageColor();
  const currentLineRef = useRef<fabric.Group | null>(null);
  const guideLineRef = useRef<fabric.Line | null>(null);
  const startPointRef = useRef<fabric.Circle | null>(null);
  const endPointRef = useRef<fabric.Circle | null>(null);

  const defaultPatternUrl =
    "https://res.cloudinary.com/datj4og4i/image/upload/v1723533704/plan-a/material/%E6%9C%A8%E5%9C%B0%E6%9D%BF/wood25_small.jpg";

  const WALL_THICKNESS = 20;
  const PREVIEW_LINE_COLOR = "rgba(0, 123, 255, 0.5)";
  const GUIDE_LINE_COLOR = "#3b82f6";
  const POINT_RADIUS = 6;
  const SNAP_THRESHOLD = 20;
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

  //創建牆體
  const createWallPath = useCallback(
    (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      isPreview: boolean = false
    ) => {
      const angle = Math.atan2(endY - startY, endX - startX);
      const length = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
      );

      const rect = new fabric.Rect({
        width: Number(length.toFixed(2)),
        height: WALL_THICKNESS,
        fill: isPreview ? PREVIEW_LINE_COLOR : color.wall.fill,
        stroke: "transparent",
        strokeWidth: 1,
        originX: "left",
        originY: "center",
      });

      const group = new fabric.Group([rect], {
        left: startX,
        top: startY,
        angle: angle * (180 / Math.PI),
        selectable: !isPreview,
        evented: !isPreview,
        opacity: isPreview ? 0.5 : 1,
        name: "wallLine",
        // 新增以下屬性
        lockRotation: !isPreview, // 禁止旋轉
        hasControls: !isPreview, // 啟用控制點
        hasBorders: false, // 禁用邊框
      });

      // 設置自定義控制點
      if (!isPreview) {
        group.setControlsVisibility({
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

      //@ts-ignore
      group.set("startPoint", new fabric.Point(startX, startY));
      //@ts-ignore
      group.set("endPoint", new fabric.Point(endX, endY));

      const wallId = `wall_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      //@ts-ignore
      group.set("id", wallId);

      return group;
    },
    [color.wall.fill]
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

  // 新增一個函數來顯示已完成線段的端點
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

      // 顯示所有隱藏的參考點
      [startPointRef, endPointRef].forEach((ref) => {
        if (ref.current) {
          ref.current.set("visible", true);
        }
      });

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
      currentPath,
      createWallPath,
      createOrUpdatePreviewLine,
      createOrUpdatePoint,
      createOrUpdateGuideLine,
      ensureDesignElementsAtBottom,
      save,
    ]
  );

  //繪製中
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

  const createLShapedConnector = (
    point: fabric.Point,
    angle1: number,
    angle2: number
  ) => {
    const size = WALL_THICKNESS;
    const path = [
      `M ${point.x} ${point.y}`,
      `L ${point.x + size * Math.cos(angle1)} ${
        point.y + size * Math.sin(angle1)
      }`,
      `L ${point.x + size * Math.cos(angle1) + size * Math.cos(angle2)} ${
        point.y + size * Math.sin(angle1) + size * Math.sin(angle2)
      }`,
      `L ${point.x + size * Math.cos(angle2)} ${
        point.y + size * Math.sin(angle2)
      }`,
      "Z",
    ].join(" ");

    return new fabric.Path(path, {
      fill: color.wall.fill,
      stroke: "transparent",
      selectable: true,
      evented: true,
      name: "wallConnector",
    });
  };

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

    // 定義 updateWallGeometry 函數
    const updateWallGeometry = (
      wall: fabric.Group,
      start: fabric.Point,
      end: fabric.Point
    ) => {
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const length = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      wall.set({
        left: start.x,
        top: start.y,
        angle: angle * (180 / Math.PI),
        width: length,
      });
      wall.setCoords();
    };

    // 處理轉角連接
    if (completedWalls.length >= 2) {
      for (let i = 0; i < completedWalls.length; i++) {
        const currentWall = completedWalls[i];
        const nextWall = completedWalls[(i + 1) % completedWalls.length];

        //@ts-ignore
        const currentEnd = currentWall.get("endPoint") as fabric.Point;
        //@ts-ignore
        const nextStart = nextWall.get("startPoint") as fabric.Point;

        // 如果端點足夠接近，就將它們合併
        if (
          Math.abs(currentEnd.x - nextStart.x) < SNAP_THRESHOLD &&
          Math.abs(currentEnd.y - nextStart.y) < SNAP_THRESHOLD
        ) {
          const midPoint = new fabric.Point(
            (currentEnd.x + nextStart.x) / 2,
            (currentEnd.y + nextStart.y) / 2
          );
          //@ts-ignore
          currentWall.set("endPoint", midPoint);
          //@ts-ignore
          nextWall.set("startPoint", midPoint);

          // 更新牆體的位置和尺寸
          updateWallGeometry(
            currentWall,
            //@ts-ignore
            currentWall.get("startPoint") as fabric.Point,
            midPoint
          );
          updateWallGeometry(
            nextWall,
            midPoint,
            //@ts-ignore
            nextWall.get("endPoint") as fabric.Point
          );

          // 創建 L 型連接件
          const currentAngle = Math.atan2(
            //@ts-ignore
            midPoint.y - currentWall.get("startPoint").y,
            //@ts-ignore
            midPoint.x - currentWall.get("startPoint").x
          );
          const nextAngle = Math.atan2(
            //@ts-ignore
            nextWall.get("endPoint").y - midPoint.y,
            //@ts-ignore
            nextWall.get("endPoint").x - midPoint.x
          );

          const connector = createLShapedConnector(
            midPoint,
            currentAngle,
            nextAngle
          );
          canvas.add(connector);
        }
      }
    }

    // 創建最終端點
    completedWalls.forEach((wall, index) => {
      //@ts-ignore
      const wallId = wall.get("id") as string;

      //@ts-ignore
      const startPoint = wall.get("startPoint") as fabric.Point;
      createEndpoint(startPoint.x, startPoint.y, wallId, true);

      if (index === completedWalls.length - 1) {
        //@ts-ignore
        const endPoint = wall.get("endPoint") as fabric.Point;
        createEndpoint(endPoint.x, endPoint.y, wallId, false);
      }
    });

    // 創建多邊形（如果需要）
    if (completedWalls.length >= 3) {
      const points = completedWalls.map(
        //@ts-ignore
        (wall) => wall.get("startPoint") as fabric.Point
      );
      points.push(
        completedWalls[completedWalls.length - 1].get(
          //@ts-ignore
          "endPoint"
        ) as fabric.Point
      );

      createPolygonWithPattern(points);

      // 如果形成了封閉空間，清除所有完成的牆
      setCompletedWalls([]);
    }

    setCurrentPath([]);
    canvas.renderAll();
    save();
  }, [
    canvas,
    completedWalls,
    save,
    createLShapedConnector,
    createEndpoint,
    createPolygonWithPattern,
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
  };
};