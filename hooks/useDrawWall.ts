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
  unfinishedWall: React.MutableRefObject<fabric.Object | null>;
  setUnfinishedWall: (wall: fabric.Object | null) => void;
}

export const useDrawWall = ({
  canvas,
  gridRef,
  save,
  updateGridColor,
  applyPattern,
  adjustPatternScale,
  unfinishedWall,
  setUnfinishedWall,
}: UseDrawWallProps) => {
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const isDrawingRef = useRef(false);
  const [currentPath, setCurrentPath] = useState<fabric.Point[]>([]);
  const [completedWalls, setCompletedWalls] = useState<fabric.Object[]>([]);
  const [rooms, setRooms] = useState<fabric.Polygon[]>([]);

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

    console.log("在開始繪製檢查unfinishedWall", unfinishedWall.current);

    if (unfinishedWall.current && unfinishedWall.current.get) {
      console.log("存在未完成的牆體，繼續繪製");
      console.log(unfinishedWall.current.get("id"));
      const wallPoints = unfinishedWall.current.get(
        "allPoints"
      ) as fabric.Point[];
      setCurrentPath(wallPoints);
      setCompletedWalls([unfinishedWall.current]);
      currentLineRef.current = unfinishedWall.current;
    } else {
      console.log("沒有未完成的牆體，準備開始新的繪製");
      setCurrentPath([]);
      setCompletedWalls([]);
      if (currentLineRef.current) {
        canvas?.remove(currentLineRef.current);
        currentLineRef.current = null;
      }
    }

    canvas?.renderAll();
    save();
  }, [canvas, unfinishedWall, save]);

  const startDrawing = useCallback(
    (event: fabric.IEvent) => {
      if (!isDrawingMode || !canvas) return;

      const pointer = canvas.getPointer(event.e);
      const [x, y] = snapToGrid(pointer.x, pointer.y);
      const newPoint = new fabric.Point(x, y);

      setCurrentPath((prev) => {
        let updatedPath: fabric.Point[];

        if (prev.length > 0) {
          updatedPath = [...prev, newPoint];
        } else {
          updatedPath = [newPoint];
        }

        // 創建或更新牆體
        if (updatedPath.length >= 2) {
          let wall = createContinuousWall(updatedPath);
          if (wall) {
            if (currentLineRef.current) {
              canvas.remove(currentLineRef.current);
            }
            canvas.add(wall);
            currentLineRef.current = wall;
            setCompletedWalls([wall]);
          }
        }

        // 更新參考點和指引線
        createOrUpdatePoint(
          updatedPath[0].x,
          updatedPath[0].y,
          startPointRef,
          "startPoint"
        );
        createOrUpdatePoint(
          updatedPath[updatedPath.length - 1].x,
          updatedPath[updatedPath.length - 1].y,
          endPointRef,
          "endPoint"
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

  // const createClosedSpaceCorner = (
  //   point: fabric.Point,
  //   prevWall: fabric.Group,
  //   nextWall: fabric.Group
  // ) => {
  //   if (!canvas) return;

  //   // 獲取前一個牆和下一個牆的方向向量
  //   const prevDir = {
  //     x: point.x - (prevWall.get("startPoint") as fabric.Point).x,
  //     y: point.y - (prevWall.get("startPoint") as fabric.Point).y,
  //   };
  //   const nextDir = {
  //     x: (nextWall.get("endPoint") as fabric.Point).x - point.x,
  //     y: (nextWall.get("endPoint") as fabric.Point).y - point.y,
  //   };

  //   // 計算角度
  //   const angle =
  //     Math.atan2(prevDir.y, prevDir.x) - Math.atan2(nextDir.y, nextDir.x);

  //   // 創建轉角
  //   const cornerSize = WALL_THICKNESS;
  //   const corner = new fabric.Circle({
  //     left: point.x - cornerSize / 2,
  //     top: point.y - cornerSize / 2,
  //     radius: cornerSize / 2,
  //     fill: color.wall.fill,
  //     selectable: false,
  //     evented: false,
  //     name: "wallCorner",
  //   });

  //   canvas.add(corner);
  // };

  //填補終點轉角的缺角
  const createClosedSpaceCorner = (
    point: fabric.Point,
    prevWall: fabric.Group,
    nextWall: fabric.Group
  ) => {
    if (!canvas) return;

    // 獲取前一個牆和下一個牆的方向向量
    const prevDir = {
      x: point.x - (prevWall.get("startPoint") as fabric.Point).x,
      y: point.y - (prevWall.get("startPoint") as fabric.Point).y,
    };
    const nextDir = {
      x: (nextWall.get("endPoint") as fabric.Point).x - point.x,
      y: (nextWall.get("endPoint") as fabric.Point).y - point.y,
    };

    // 計算角度
    const prevAngle = Math.atan2(prevDir.y, prevDir.x);
    const nextAngle = Math.atan2(nextDir.y, nextDir.x);
    const cornerAngle = nextAngle - prevAngle;

    // 創建轉角
    const cornerSize = WALL_THICKNESS;
    const halfSize = cornerSize / 2;

    // 計算轉角的四個點
    const p1 = {
      x:
        point.x -
        halfSize * Math.cos(prevAngle) -
        halfSize * Math.sin(prevAngle),
      y:
        point.y -
        halfSize * Math.sin(prevAngle) +
        halfSize * Math.cos(prevAngle),
    };
    const p2 = {
      x:
        point.x +
        halfSize * Math.cos(prevAngle) -
        halfSize * Math.sin(prevAngle),
      y:
        point.y +
        halfSize * Math.sin(prevAngle) +
        halfSize * Math.cos(prevAngle),
    };
    const p3 = {
      x:
        point.x +
        halfSize * Math.cos(nextAngle) +
        halfSize * Math.sin(nextAngle),
      y:
        point.y +
        halfSize * Math.sin(nextAngle) -
        halfSize * Math.cos(nextAngle),
    };
    const p4 = {
      x:
        point.x -
        halfSize * Math.cos(nextAngle) +
        halfSize * Math.sin(nextAngle),
      y:
        point.y -
        halfSize * Math.sin(nextAngle) -
        halfSize * Math.cos(nextAngle),
    };

    // 定義轉角路徑
    const pathData = [
      "M",
      p1.x,
      p1.y,
      "L",
      p2.x,
      p2.y,
      "L",
      p3.x,
      p3.y,
      "L",
      p4.x,
      p4.y,
      "Z",
    ].join(" ");

    const corner = new fabric.Path(pathData, {
      fill: color.wall.fill,
      selectable: false,
      evented: false,
      name: "wallCorner",
    });

    canvas.add(corner);
  };

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
        console.log("點的數量不足，刪除當前點");
        canvas.remove(wall);
        setCompletedWalls([]);
        setCurrentPath([]);
        setUnfinishedWall(null);
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

          // // 創建封閉空間的轉角
          // const closingPoint = new fabric.Point(
          //   (firstPoint.x + lastPoint.x) / 2,
          //   (firstPoint.y + lastPoint.y) / 2
          // );

          // // 獲取最後一個牆體和第一個牆體
          // const lastWall = completedWalls[
          //   completedWalls.length - 1
          // ] as fabric.Group;
          // const firstWall = completedWalls[0] as fabric.Group;

          // createClosedSpaceCorner(closingPoint, lastWall, firstWall);

          // 創建完全閉合的路徑
          const closedPoints = [...allPoints, firstPoint];
          const closedPathData =
            closedPoints
              .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
              .join(" ") + " Z";

          const closedWall = new fabric.Path(closedPathData, {
            fill: "transparent",
            stroke: color.wall.fill,
            strokeWidth: WALL_THICKNESS,
            strokeLineJoin: "miter",
            strokeMiterLimit: 5,
            strokeLineCap: "square",
            selectable: false,
            evented: false,
            objectCaching: false,
            name: "finishedWall",
          });

          canvas.remove(wall);
          canvas.add(closedWall);

          createPolygonWithPattern(closedPoints);

          setCompletedWalls([]);
          setCurrentPath([]);
          setUnfinishedWall(null);
          save();
        } else {
          console.log("沒有形成封閉空間，保留當前牆體為未完成狀態");
          setUnfinishedWall(wall);
          console.log("在finishDrawWall存進unfinishedWall", unfinishedWall);
          setCurrentPath([]);
          setCompletedWalls([]);
          save();
        }
      }
    } else {
      console.log("沒有完成的牆體，清除所有當前繪製狀態");
      setCurrentPath([]);
      setUnfinishedWall(null);
      save();
    }

    canvas.renderAll();
  }, [
    canvas,
    SNAP_THRESHOLD,
    completedWalls,
    createPolygonWithPattern,
    save,
    color.wall.fill,
    WALL_THICKNESS,
    createClosedSpaceCorner,
  ]);

  //刪除牆體，需將未完成牆體的狀態也一併刪除
  // const handleWallDelete = useCallback((deletedWallId: string) => {
  //   setUnfinishedWall((prevWall) =>
  //     prevWall && prevWall.get("id") === deletedWallId ? null : prevWall
  //   );
  // }, []);

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
