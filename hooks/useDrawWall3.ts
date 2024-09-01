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
  const [completedWalls, setCompletedWalls] = useState<fabric.Object[]>([]);
  const [rooms, setRooms] = useState<fabric.Polygon[]>([]);

  //保存未完成的牆體
  const [unfinishedWalls, setUnfinishedWalls] = useState<fabric.Object[]>([]);

  const color = useDesignPageColor();
  const currentLineRef = useRef<fabric.Object | null>(null);
  const guideLineRef = useRef<fabric.Line | null>(null);
  const startPointRef = useRef<fabric.Circle | null>(null);
  const endPointRef = useRef<fabric.Circle | null>(null);

  //追蹤未完成牆體的繪製順序（預設是必須從終點開始繪製，如果想從起點開始必須反轉）
  const currentReversedRef = useRef(false);

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

  //創建牆體預覽
  const createOrUpdatePreviewLine = useCallback(
    (startX: number, startY: number, endX: number, endY: number) => {
      if (!canvas) return;

      const [snappedEndX, snappedEndY] = snapToGrid(endX, endY);

      // 計算牆體的角度和長度
      const angle = Math.atan2(snappedEndY - startY, snappedEndX - startX);
      const dx = (WALL_THICKNESS / 2) * Math.sin(angle);
      const dy = (WALL_THICKNESS / 2) * Math.cos(angle);

      // 創建預覽路徑
      const pathData = [
        `M ${startX - dx} ${startY + dy}`,
        `L ${snappedEndX - dx} ${snappedEndY + dy}`,
        `L ${snappedEndX + dx} ${snappedEndY - dy}`,
        `L ${startX + dx} ${startY - dy}`,
        "Z",
      ].join(" ");

      if (currentLineRef.current) {
        canvas.remove(currentLineRef.current);
      }

      const previewWall = new fabric.Path(pathData, {
        fill: PREVIEW_LINE_COLOR,
        stroke: PREVIEW_LINE_COLOR,
        strokeWidth: 1,
        selectable: false,
        evented: false,
        opacity: 0.5,
        name: "previewWallLine",
        excludeFromExport: true,
      });

      currentLineRef.current = previewWall;
      canvas.add(previewWall);
      canvas.renderAll();
    },
    [canvas, snapToGrid, WALL_THICKNESS, PREVIEW_LINE_COLOR]
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
            excludeFromExport: true, // 防止被保存到歷史記錄
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
          excludeFromExport: true,
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
    (points: fabric.Point[], isReversed: boolean = false) => {
      if (!canvas) return null;

      console.log("Creating continuous wall with points:", points);
      console.log("Is reversed:", isReversed);

      const orderedPoints = isReversed ? [...points].reverse() : points;
      console.log("Ordered points:", orderedPoints);

      const pathData = orderedPoints
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");
      console.log("Path data:", pathData);

      const path = new fabric.Path(pathData, {
        fill: "transparent",
        stroke: color.wall.fill,
        strokeWidth: WALL_THICKNESS,
        strokeLineJoin: "square",
        strokeLineCap: "bevel",
        selectable: false,
        evented: false,
        name: "continuousWall",
        originX: "left",
        originY: "top",
      });

      const endpoints = [
        orderedPoints[0],
        orderedPoints[orderedPoints.length - 1],
      ].map((point, index) => {
        return new fabric.Circle({
          left: point.x - POINT_RADIUS,
          top: point.y - POINT_RADIUS,
          radius: POINT_RADIUS,
          fill: "#FFF",
          stroke: PREVIEW_LINE_COLOR,
          strokeWidth: 1,
          selectable: false,
          evented: false,
          name: `wallEndpoint_${index === 0 ? "start" : "end"}`,
        });
      });

      const group = new fabric.Group([path, ...endpoints], {
        selectable: true,
        evented: false,
        name: "wallGroup",
        hasControls: false,
        objectCaching: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
      });

      const wallId = `wall_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      group.set({
        //@ts-ignore
        id: wallId,
        startPoint: orderedPoints[0],
        endPoint: orderedPoints[orderedPoints.length - 1],
        allPoints: orderedPoints,
        isReversed: isReversed,
      });

      console.log(
        "Created continuous wall:",
        wallId,
        "with points:",
        orderedPoints
      );

      canvas.add(group);
      return group;
    },
    [canvas, color.wall.fill, WALL_THICKNESS, POINT_RADIUS, PREVIEW_LINE_COLOR]
  );
  //進入繪製模式
  const startDrawWall = useCallback(() => {
    console.log("startDrawWall: 開始繪製牆壁模式");
    setIsDrawingMode(true);
    isDrawingRef.current = true;

    setCurrentPath([]);

    // 清除之前的參考點和指引線
    [startPointRef, endPointRef, guideLineRef].forEach((ref) => {
      if (ref.current) {
        canvas?.remove(ref.current);
        ref.current = null;
      }
    });

    canvas?.renderAll();
    save();
  }, [canvas, save]);

  const startDrawing = useCallback(
    (event: fabric.IEvent) => {
      if (!isDrawingMode || !canvas) return;

      const pointer = canvas.getPointer(event.e);
      const [x, y] = snapToGrid(pointer.x, pointer.y);
      const newPoint = new fabric.Point(x, y);

      console.log("滑鼠點擊位置:", { x, y });
      console.log("接續位置:", newPoint);
      console.log("未完成牆體數量:", unfinishedWalls.length);

      setCurrentPath((prev) => {
        let updatedPath: fabric.Point[];
        let isReversed = false;

        const EXTENDED_SNAP_THRESHOLD = SNAP_THRESHOLD * 2;

        let nearestWall: fabric.Object | null = null;
        let nearestDistance = Infinity;
        let isNearStart = false;

        unfinishedWalls.forEach((wall, index) => {
          //@ts-ignore
          const startPoint = wall.get("startPoint") as fabric.Point;
          //@ts-ignore
          const endPoint = wall.get("endPoint") as fabric.Point;

          console.log(`檢查牆體 ${index}:`, wall.get("id"));
          console.log(`  起點:`, startPoint);
          console.log(`  終點:`, endPoint);

          const startDistance = Math.sqrt(
            Math.pow(startPoint.x - x, 2) + Math.pow(startPoint.y - y, 2)
          );
          const endDistance = Math.sqrt(
            Math.pow(endPoint.x - x, 2) + Math.pow(endPoint.y - y, 2)
          );

          console.log(
            `  到起點距離: ${startDistance}, 到終點距離: ${endDistance}`
          );

          if (
            startDistance < EXTENDED_SNAP_THRESHOLD &&
            startDistance < nearestDistance
          ) {
            nearestWall = wall;
            nearestDistance = startDistance;
            isNearStart = true;
            console.log(`  更新最近牆體: ${wall.get("id")}, 靠近起點`);
          } else if (
            endDistance < EXTENDED_SNAP_THRESHOLD &&
            endDistance < nearestDistance
          ) {
            nearestWall = wall;
            nearestDistance = endDistance;
            isNearStart = false;
            console.log(`  更新最近牆體: ${wall.get("id")}, 靠近終點`);
          }
        });

        if (nearestWall) {
          console.log(
            "找到最近的牆體:",
            nearestWall.get("id"),
            "isNearStart:",
            isNearStart
          );
          //@ts-ignore
          const wallPoints = nearestWall.get("allPoints") as fabric.Point[];

          if (isNearStart) {
            console.log("靠近起點，反轉路徑並添加新點到開頭");
            updatedPath = [newPoint, ...wallPoints];
            isReversed = true;
          } else {
            console.log("靠近終點，添加新點到結尾");
            updatedPath = [...wallPoints, newPoint];
            isReversed = false;
          }

          setUnfinishedWalls((walls) => walls.filter((w) => w !== nearestWall));
        } else if (prev.length > 0) {
          console.log("繼續當前路徑");
          updatedPath = [...prev, newPoint];
          isReversed = currentReversedRef.current;
        } else {
          console.log("開始新路徑");
          updatedPath = [newPoint];
          isReversed = false;
        }

        console.log("更新後的路徑:", updatedPath);
        console.log("是否反轉:", isReversed);

        // 更新當前反轉狀態
        currentReversedRef.current = isReversed;

        // 創建或更新牆體
        if (updatedPath.length >= 2) {
          let wall = createContinuousWall(updatedPath, isReversed);
          if (wall) {
            if (currentLineRef.current) {
              canvas.remove(currentLineRef.current);
            }
            canvas.add(wall);
            currentLineRef.current = wall;
            setCompletedWalls([wall]);
            console.log("創建新牆體:", wall.get("id"));
          }
        }

        // 更新參考點和指引線
        createOrUpdatePoint(updatedPath[0].x, updatedPath[0].y, startPointRef);
        createOrUpdatePoint(
          updatedPath[updatedPath.length - 1].x,
          updatedPath[updatedPath.length - 1].y,
          endPointRef
        );
        if (updatedPath.length >= 2) {
          const prevPoint = updatedPath[updatedPath.length - 2];
          const lastPoint = updatedPath[updatedPath.length - 1];
          createOrUpdateGuideLine(
            prevPoint.x,
            prevPoint.y,
            lastPoint.x,
            lastPoint.y
          );
        }

        return updatedPath;
      });

      canvas.renderAll();
      save();
    },
    [
      isDrawingMode,
      canvas,
      snapToGrid,
      createContinuousWall,
      createOrUpdatePoint,
      createOrUpdateGuideLine,
      save,
      unfinishedWalls,
      SNAP_THRESHOLD,
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

    // 清理臨時物件
    [guideLineRef, startPointRef, endPointRef, currentLineRef].forEach(
      (ref) => {
        if (ref.current) {
          canvas.remove(ref.current);
          ref.current = null;
        }
      }
    );

    if (completedWalls.length > 0) {
      const wall = completedWalls[0];
      //@ts-ignore
      const allPoints = wall.get("allPoints") as fabric.Point[];

      if (allPoints.length < 2) {
        console.log("點的數量不足，無法形成牆體或封閉空間");
        canvas.remove(wall);
        setCompletedWalls([]);
      } else {
        const firstPoint = allPoints[0];
        const lastPoint = allPoints[allPoints.length - 1];

        const dx = Math.abs(firstPoint.x - lastPoint.x);
        const dy = Math.abs(firstPoint.y - lastPoint.y);

        if (
          allPoints.length > 2 &&
          dx < SNAP_THRESHOLD &&
          dy < SNAP_THRESHOLD
        ) {
          console.log("檢測到封閉空間");
          createPolygonWithPattern(allPoints);
          canvas.remove(wall);
          setCompletedWalls([]);
        } else {
          console.log("沒有形成封閉空間，保留當前牆體");
          setUnfinishedWalls((prev) => [...prev, wall]);
        }
      }
    }

    setCurrentPath([]);
    setCompletedWalls([]);
    // 重置當前反轉狀態
    // currentReversedRef.current = false;
    canvas.renderAll();
    save();
  }, [canvas, SNAP_THRESHOLD, completedWalls, createPolygonWithPattern, save]);

  //刪除牆體，需將未完成牆體的狀態也一併刪除
  const handleWallDelete = useCallback((deletedWallId: string) => {
    setUnfinishedWalls((prevWalls) =>
      //@ts-ignore
      prevWalls.filter((wall) => wall.get("id") !== deletedWallId)
    );
  }, []);

  return {
    isDrawingMode,
    setIsDrawingMode,
    startDrawWall,
    startDrawing,
    draw,
    finishDrawWall,
    createPolygonWithPattern,
    createContinuousWall,
    handleWallDelete,
  };
};
