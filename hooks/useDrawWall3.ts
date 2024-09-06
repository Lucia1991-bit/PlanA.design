import { fabric } from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";
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

  //下面兩個狀態要傳進 useHistory
  //考慮到依賴關係(useHistory必須在前面)，因此移到外部的 useDesign宣告
  unfinishedWall: React.MutableRefObject<fabric.Object | null>;
  completedWalls: React.MutableRefObject<fabric.Object[] | null>;
  setUnfinishedWall: (wall: fabric.Object | null) => void;
  setCompletedWalls: (
    walls: fabric.Object[] | ((prev: fabric.Object[]) => fabric.Object[])
  ) => void;
  isDrawingMode: boolean;
  setIsDrawingMode: (mode: boolean) => void;
}

export const useDrawWall = ({
  canvas,
  gridRef,
  isDrawingMode,
  setIsDrawingMode,
  save,
  updateGridColor,
  applyPattern,
  adjustPatternScale,
  unfinishedWall,
  setUnfinishedWall,
  completedWalls,
  setCompletedWalls,
}: UseDrawWallProps) => {
  const isDrawingRef = useRef(false);
  const [currentPath, setCurrentPath] = useState<fabric.Point[]>([]);

  const [rooms, setRooms] = useState<fabric.Path[]>([]);

  const color = useDesignPageColor();

  //預覽線
  const currentLineRef = useRef<fabric.Object | null>(null);
  //參考線
  const guideLineRef = useRef<fabric.Line | null>(null);
  //預覽起點終點
  const startPointRef = useRef<fabric.Circle | null>(null);
  const endPointRef = useRef<fabric.Circle | null>(null);

  //追蹤未完成牆體的繪製順序（預設是必須從終點開始繪製，如果想從起點開始必須反轉）
  const currentReversedRef = useRef(false);

  const defaultPatternUrl =
    "https://res.cloudinary.com/datj4og4i/image/upload/v1725103376/plan-a/material/%E7%A3%81%E7%A3%9A/tile16_small.jpg";

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
      pointRef: React.MutableRefObject<fabric.Circle | null>,
      name: string
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
          name: name,
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
      .filter((obj) => obj.name === "wallGroup" || obj.name === "finishedWall");
    const otherObjects = canvas
      .getObjects()
      .filter(
        (obj) => obj !== grid && obj.name !== "room" && obj.name !== "wallGroup"
      );

    canvas.clear();

    canvas.add(grid);
    updateGridColor();
    roomObjects.forEach((room) => canvas.add(room));
    wallObjects.forEach((wall) => canvas.add(wall));
    otherObjects.forEach((obj) => canvas.add(obj));

    canvas.renderAll();
  }, [canvas, gridRef, updateGridColor]);

  // 創建連續牆體
  //獲取所有牆體的端點，重新繪製一次牆面(才能確保轉角處的連續性)
  const createContinuousWall = useCallback(
    (points: fabric.Point[], isReversed: boolean = false) => {
      if (!canvas) return null;

      const orderedPoints = isReversed ? [...points].reverse() : points;

      const pathData = orderedPoints
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");

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
        const circle = new fabric.Circle({
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
        circle.set("data", { type: "wallEndpoint", index: index });

        return circle;
      });

      const group = new fabric.Group([path, ...endpoints], {
        selectable: false,
        evented: false,
        name: "wallGroup",
        hasControls: false,
        objectCaching: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        subTargetCheck: true,
        lockUniScaling: true,
      });

      const wallId = `wall_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // 禁用組內對象的事件
      group.getObjects().forEach((obj) => {
        obj.evented = false;
        obj.selectable = false;
      });

      group.set({
        //@ts-ignore
        id: wallId,
        startPoint: orderedPoints[0],
        endPoint: orderedPoints[orderedPoints.length - 1],
        allPoints: orderedPoints,
        isReversed: isReversed,
      });

      canvas.add(group);
      updateWalls(group, false); // 更新牆體狀態
      //確保順序正確
      ensureDesignElementsAtBottom();
      return group;
    },
    [canvas, color.wall.fill, WALL_THICKNESS, POINT_RADIUS, PREVIEW_LINE_COLOR]
  );

  // 更新牆體狀態的函數
  const updateWalls = useCallback(
    (newWall: fabric.Object | null, isCompleted: boolean = false) => {
      if (isCompleted) {
        // 如果牆體已完成（形成封閉空間）將新牆體添加到已完成牆體列表
        //清除未完成牆體
        setCompletedWalls((prev) => [...prev, newWall!]);
        setUnfinishedWall(null);
      } else if (newWall) {
        // 如果有新的未完成牆體，設置新的未完成牆體
        setUnfinishedWall(newWall);
        // 更新已完成牆體列表：移除之前的未完成牆體（如果存在），並添加新牆體
        setCompletedWalls((prev) => [
          ...prev.filter((w) => w !== unfinishedWall.current),
          newWall,
        ]);
      } else {
        // 當 newWall 為 null 且不是完成狀態時（例如取消繪製）
        // 只清除未完成牆體
        setUnfinishedWall(null);
      }
    },
    [setUnfinishedWall, setCompletedWalls, unfinishedWall]
  );

  //進入繪製模式
  const startDrawWall = useCallback(() => {
    console.log("test");
    setIsDrawingMode(true);
    isDrawingRef.current = true;

    // 清除之前的參考點和指引線
    [startPointRef, endPointRef, guideLineRef].forEach((ref) => {
      if (ref.current) {
        canvas?.remove(ref.current);
        ref.current = null;
      }
    });

    if (unfinishedWall.current && unfinishedWall.current.get) {
      const wallPoints = unfinishedWall.current.get(
        //@ts-ignore
        "allPoints"
      ) as fabric.Point[];
      console.log("繼續未完成牆體的繪製, 點數:", wallPoints.length);
      setCurrentPath(wallPoints);
      createOrUpdatePoint(
        wallPoints[0].x,
        wallPoints[0].y,
        startPointRef,
        "startPoint"
      );
      createOrUpdatePoint(
        wallPoints[wallPoints.length - 1].x,
        wallPoints[wallPoints.length - 1].y,
        endPointRef,
        "endPoint"
      );
    } else {
      console.log("開始新的牆體繪製");
      setCurrentPath([]);
    }

    canvas?.renderAll();
    save();
  }, [setIsDrawingMode, unfinishedWall, canvas, save, createOrUpdatePoint]);

  const startDrawing = useCallback(
    (event: fabric.IEvent) => {
      if (!isDrawingMode || !canvas) return;

      const pointer = canvas.getPointer(event.e);
      const [x, y] = snapToGrid(pointer.x, pointer.y);
      const newPoint = new fabric.Point(x, y);

      setCurrentPath((prev) => {
        const updatedPath = [...prev, newPoint];
        console.log("Updated path length:", updatedPath.length);

        createOrUpdatePoint(x, y, endPointRef, "endPoint");

        // 如果這是第一個點，也創建起點
        if (updatedPath.length === 1) {
          createOrUpdatePoint(x, y, startPointRef, "startPoint");
        } else if (updatedPath.length >= 2) {
          const prevPoint = updatedPath[updatedPath.length - 2];
          createOrUpdateGuideLine(prevPoint.x, prevPoint.y, x, y);

          const wall = createContinuousWall(updatedPath);
          if (wall) {
            if (currentLineRef.current) {
              canvas.remove(currentLineRef.current);
            }
            canvas.add(wall);
            currentLineRef.current = wall;
            updateWalls(wall, false);
          }
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
      updateWalls,
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
      createOrUpdatePoint(x, y, endPointRef, "endPoint");
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

  //為創建的空間填入材質
  const createPolygonWithPattern = useCallback(
    (points: fabric.Point[]) => {
      if (!canvas) return null;

      // 為封閉形狀生成路徑數據
      const pathData =
        points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
        " Z";

      const room = new fabric.Path(pathData, {
        fill: "rgba(200, 200, 200, 0.4)",
        stroke: color.wall.fill,
        strokeWidth: WALL_THICKNESS,
        selectable: true,
        evented: true,
        hasBorders: true,
        hasControls: false,
        // lockMovementX: true,
        // lockMovementY: true,
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

      // 應用材質並調整比例
      applyPattern(room, defaultPatternUrl, { scaleX: 1, scaleY: 1 });
      adjustPatternScale(room, 10, 10);

      // 更新房間列表並確保設計元素位於底部
      setRooms((prevRooms) => [...prevRooms, room]);
      ensureDesignElementsAtBottom();

      canvas.setActiveObject(room);

      return room;
    },
    [
      canvas,
      color.wall.fill,
      applyPattern,
      adjustPatternScale,
      ensureDesignElementsAtBottom,
      setRooms,
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

    // 處理只有一個點或沒有點的情況
    if (currentPath.length <= 1) {
      console.log("無法構成一個牆面，結束繪製並清理");
      if (unfinishedWall.current) {
        canvas.remove(unfinishedWall.current);
      }
      updateWalls(null);
      setCurrentPath([]);
      canvas.renderAll();
      save();
      return;
    }

    const firstPoint = currentPath[0];
    const lastPoint = currentPath[currentPath.length - 1];
    const dx = Math.abs(firstPoint.x - lastPoint.x);
    const dy = Math.abs(firstPoint.y - lastPoint.y);

    if (currentPath.length > 2 && dx < SNAP_THRESHOLD && dy < SNAP_THRESHOLD) {
      console.log("檢測到封閉空間");
      // 創建完全閉合的路徑
      const closedPoints = [...currentPath, firstPoint];

      // 移除所有與新封閉空間重疊的未完成牆體和已存在的房間
      canvas.getObjects().forEach((obj) => {
        if (obj.name === "wallGroup" || obj.name === "room") {
          //@ts-ignore
          const objPoints = obj.get("allPoints") as fabric.Point[];
          if (
            objPoints &&
            objPoints.some((point) =>
              closedPoints.some(
                (closedPoint) =>
                  Math.abs(point.x - closedPoint.x) < SNAP_THRESHOLD &&
                  Math.abs(point.y - closedPoint.y) < SNAP_THRESHOLD
              )
            )
          ) {
            canvas.remove(obj);
            if (obj.name === "wallGroup") {
              setCompletedWalls((prev) => prev.filter((w) => w !== obj));
            }
          }
        }
      });

      // 使用 createPolygonWithPattern 創建新的 room
      const newRoom = createPolygonWithPattern(closedPoints);
      if (newRoom) {
        canvas.add(newRoom);
      }

      // 更新牆體狀態
      updateWalls(null);
    } else {
      console.log("未形成封閉空間，創建或更新未完成牆體");
      // 創建或更新未完成牆體
      const wall = createContinuousWall(currentPath);
      if (wall) {
        updateWalls(wall);
      }
    }

    setCurrentPath([]);
    //確保順序正確
    ensureDesignElementsAtBottom();
    canvas.renderAll();
    save();
  }, [
    canvas,
    currentPath,
    setIsDrawingMode,
    SNAP_THRESHOLD,
    createContinuousWall,
    createPolygonWithPattern,
    updateWalls,
    setCompletedWalls,
    save,
  ]);

  // 刪除所有牆面
  const deleteAllWalls = useCallback(() => {
    if (!canvas) return;

    // 找出所有的牆體和相關元素
    const wallObjects = canvas
      .getObjects()
      .filter(
        (obj) =>
          obj.name === "wallGroup" ||
          obj.name === "wallCorner" ||
          obj.name === "room"
      );

    // 刪除找到的所有牆體和相關元素
    wallObjects.forEach((obj) => {
      canvas.remove(obj);
    });

    // 重置相關狀態
    setCompletedWalls([]);
    setCurrentPath([]);
    setUnfinishedWall(null);

    // 重新渲染畫布
    canvas.renderAll();

    // 保存當前狀態
    save();

    console.log("所有牆面已被刪除");
  }, [canvas, setCompletedWalls, setCurrentPath, setUnfinishedWall, save]);

  return {
    isDrawingMode,
    setIsDrawingMode,
    startDrawWall,
    startDrawing,
    draw,
    finishDrawWall,
    createPolygonWithPattern,
    createContinuousWall,
    deleteAllWalls,
  };
};
