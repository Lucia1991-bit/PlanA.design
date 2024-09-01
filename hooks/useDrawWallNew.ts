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
  const [currentPath, setCurrentPath] = useState<fabric.Point[]>([]);
  const [completedWalls, setCompletedWalls] = useState<fabric.Object[]>([]);
  const [rooms, setRooms] = useState<fabric.Polygon[]>([]);

  const isDrawingRef = useRef(false);
  const color = useDesignPageColor();
  const currentLineRef = useRef<fabric.Object | null>(null);
  const guideLineRef = useRef<fabric.Line | null>(null);
  const startPointRef = useRef<fabric.Circle | null>(null);
  const endPointRef = useRef<fabric.Circle | null>(null);
  const intersectionPointRef = useRef<fabric.Circle | null>(null);

  const defaultPatternUrl =
    "https://res.cloudinary.com/datj4og4i/image/upload/v1723533704/plan-a/material/%E6%9C%A8%E5%9C%B0%E6%9D%BF/wood25_small.jpg";
  const WALL_THICKNESS = 20;
  const PREVIEW_LINE_COLOR = "rgba(0, 123, 255, 0.5)";
  const GUIDE_LINE_COLOR = "#3b82f6";
  const POINT_RADIUS = 6;
  const SNAP_THRESHOLD = 10;

  // 將座標點貼齊網格
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

  // 創建牆體
  const createWallPath = useCallback(
    (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      isPreview: boolean = false
    ) => {
      // 計算牆體角度和長度
      const angle = Math.atan2(endY - startY, endX - startX);
      const length = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
      );

      // 計算垂直於牆體的角度
      const perpAngle = angle + Math.PI / 2;
      const halfThickness = WALL_THICKNESS / 2;

      // 計算內側和外側點
      const innerStartX = startX - halfThickness * Math.cos(perpAngle);
      const innerStartY = startY - halfThickness * Math.sin(perpAngle);
      const innerEndX = endX - halfThickness * Math.cos(perpAngle);
      const innerEndY = endY - halfThickness * Math.sin(perpAngle);

      const outerStartX = startX + halfThickness * Math.cos(perpAngle);
      const outerStartY = startY + halfThickness * Math.sin(perpAngle);
      const outerEndX = endX + halfThickness * Math.cos(perpAngle);
      const outerEndY = endY + halfThickness * Math.sin(perpAngle);

      // 創建矩形物件
      const rect = new fabric.Rect({
        width: Number(length.toFixed(2)),
        height: WALL_THICKNESS,
        fill: isPreview ? PREVIEW_LINE_COLOR : color.wall.fill,
        stroke: "transparent",
        strokeWidth: 1,
        originX: "left",
        originY: "center",
      });

      // 創建群組
      const group = new fabric.Group([rect], {
        left: startX,
        top: startY,
        angle: angle * (180 / Math.PI),
        selectable: !isPreview,
        evented: !isPreview,
        opacity: isPreview ? 0.5 : 1,
        name: "wallLine",
        lockRotation: !isPreview,
        hasControls: !isPreview,
        hasBorders: false,
      });

      // 設置控制點可見性
      if (!isPreview) {
        group.setControlsVisibility({
          mt: false,
          mb: false,
          ml: true,
          mr: true,
          mtr: false,
          tl: false,
          tr: false,
          bl: false,
          br: false,
        });
      }

      // 設置自定義屬性
      group.set({
        startPoint: new fabric.Point(startX, startY),
        endPoint: new fabric.Point(endX, endY),
        innerStart: new fabric.Point(innerStartX, innerStartY),
        innerEnd: new fabric.Point(innerEndX, innerEndY),
        outerStart: new fabric.Point(outerStartX, outerStartY),
        outerEnd: new fabric.Point(outerEndX, outerEndY),
        id: `wall_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

      return group;
    },
    [color.wall.fill]
  );

  const getInnerPoints = useCallback((wall: fabric.Group) => {
    return {
      start: wall.get("innerStart") as fabric.Point,
      end: wall.get("innerEnd") as fabric.Point,
    };
  }, []);

  const getOuterPoints = useCallback((wall: fabric.Group) => {
    return {
      start: wall.get("outerStart") as fabric.Point,
      end: wall.get("outerEnd") as fabric.Point,
    };
  }, []);

  // 創建或更新預覽線
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

  // 創建或更新點
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
    [canvas, POINT_RADIUS, PREVIEW_LINE_COLOR]
  );

  // 創建或更新輔助線
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
    [canvas, GUIDE_LINE_COLOR]
  );

  // 確保設計元素在底層
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

  // 計算內側交點
  const calculateInnerIntersection = useCallback(
    (wall1: fabric.Group, wall2: fabric.Group) => {
      const wall1Points = getInnerPoints(wall1);
      const wall2Points = getInnerPoints(wall2);
      return fabric.Intersection.intersectLineLine(
        wall1Points.start,
        wall1Points.end,
        wall2Points.start,
        wall2Points.end
      );
    },
    [getInnerPoints]
  );

  // 計算外側交點
  const calculateOuterIntersection = useCallback(
    (wall1: fabric.Group, wall2: fabric.Group) => {
      const wall1Points = getOuterPoints(wall1);
      const wall2Points = getOuterPoints(wall2);
      return fabric.Intersection.intersectLineLine(
        wall1Points.start,
        wall1Points.end,
        wall2Points.start,
        wall2Points.end
      );
    },
    [getOuterPoints]
  );

  // 計算兩點之間的距離
  const distanceBetweenPoints = useCallback(
    (point1: fabric.Point, point2: fabric.Point) => {
      return Math.sqrt(
        Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
      );
    },
    []
  );

  // 調整牆體到交點
  const adjustWallToIntersection = useCallback(
    (
      wall: fabric.Group,
      intersectionPoint: fabric.Point,
      type: "inner" | "outer"
    ) => {
      const startPoint = wall.get("startPoint") as fabric.Point;
      const endPoint = wall.get("endPoint") as fabric.Point;

      const isStartCloser =
        distanceBetweenPoints(startPoint, intersectionPoint) <
        distanceBetweenPoints(endPoint, intersectionPoint);

      if (type === "inner") {
        if (isStartCloser) {
          wall.set("innerStart", intersectionPoint);
        } else {
          wall.set("innerEnd", intersectionPoint);
        }
      } else {
        if (isStartCloser) {
          wall.set("outerStart", intersectionPoint);
        } else {
          wall.set("outerEnd", intersectionPoint);
        }
      }

      const newAngle = Math.atan2(
        endPoint.y - startPoint.y,
        endPoint.x - startPoint.x
      );
      const newLength = distanceBetweenPoints(startPoint, endPoint);

      wall.set({
        angle: newAngle * (180 / Math.PI),
        width: newLength,
      });

      const rect = wall.item(0) as fabric.Rect;
      rect.set("width", newLength);

      wall.setCoords();
    },
    [distanceBetweenPoints]
  );

  // 修剪外側轉角
  const trimOuterCorner = useCallback(
    (
      wall1: fabric.Group,
      wall2: fabric.Group,
      intersection: fabric.Intersection
    ) => {
      if (intersection.status === "Intersection") {
        const point = intersection.points[0];

        wall1.set("outerEnd", point);
        wall2.set("outerStart", point);

        const wall1Points = wall1.get("points") as fabric.Point[];
        const wall2Points = wall2.get("points") as fabric.Point[];

        wall1Points[2] = point;
        wall2Points[3] = point;

        wall1.set("points", wall1Points);
        wall2.set("points", wall2Points);

        wall1.setCoords();
        wall2.setCoords();
      }
    },
    []
  );

  // 處理轉角
  const processCorner = useCallback(
    (wall1: fabric.Group, wall2: fabric.Group) => {
      const intersection = calculateInnerIntersection(wall1, wall2);

      if (intersection.status === "Intersection") {
        const point = intersection.points[0];
        adjustWallToIntersection(wall1, point, "inner");
        adjustWallToIntersection(wall2, point, "inner");

        const outerIntersection = calculateOuterIntersection(wall1, wall2);
        if (outerIntersection.status === "Intersection") {
          trimOuterCorner(wall1, wall2, outerIntersection);
        }
      }
    },
    [
      calculateInnerIntersection,
      adjustWallToIntersection,
      calculateOuterIntersection,
      trimOuterCorner,
    ]
  );

  // 顯示已完成牆體的端點
  const showCompletedWallEndpoints = useCallback(() => {
    if (!canvas) return;

    completedWalls.forEach((wall) => {
      const innerPoints = getInnerPoints(wall as fabric.Group);

      [innerPoints.start, innerPoints.end].forEach((point) => {
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
  }, [
    canvas,
    completedWalls,
    POINT_RADIUS,
    PREVIEW_LINE_COLOR,
    getInnerPoints,
  ]);

  // 開始繪製牆體
  const startDrawWall = useCallback(() => {
    console.log("startDrawWall: 開始繪製牆壁模式");
    setIsDrawingMode(true);
    isDrawingRef.current = true;
    setCurrentPath([]);

    // 顯示已完成線段的端點
    showCompletedWallEndpoints();
  }, [showCompletedWallEndpoints]);

  // 開始繪製
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

  // 繪製
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

  // 創建帶有圖案的多邊形（房間）
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

  // 完成繪製牆體
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

    // 處理轉角連接
    if (completedWalls.length >= 2) {
      for (let i = 0; i < completedWalls.length; i++) {
        const currentWall = completedWalls[i] as fabric.Group;
        const nextWall = completedWalls[
          (i + 1) % completedWalls.length
        ] as fabric.Group;
        processCorner(currentWall, nextWall);
      }
    }

    // 如果形成封閉空間，創建多邊形
    if (completedWalls.length >= 3) {
      const points = completedWalls.map(
        (wall) => (wall as fabric.Group).get("innerStart") as fabric.Point
      );
      points.push(
        (completedWalls[completedWalls.length - 1] as fabric.Group).get(
          "innerEnd"
        ) as fabric.Point
      );

      createPolygonWithPattern(points);

      // 清除所有完成的牆
      setCompletedWalls([]);
    }

    setCurrentPath([]);
    canvas.renderAll();
    save();
  }, [canvas, completedWalls, processCorner, createPolygonWithPattern, save]);

  // 返回需要的函數和狀態
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
