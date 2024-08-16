import { fabric } from "fabric";
import { useEffect, useRef, useCallback } from "react";
import { MIN_ZOOM, MAX_ZOOM_LEVEL } from "@/types/DesignType";
import { set } from "lodash";

interface CanvasEventProps {
  canvas: fabric.Canvas | null;
  setSelectedObjects: (objects: fabric.Object[]) => void;
  save: () => void;
  isDrawingMode: boolean;
  onStartDrawing: (event: fabric.IEvent) => void;
  onDrawing: (event: fabric.IEvent) => void;
  onEndDrawing: () => void;
}

const useCanvasEvents = ({
  canvas,
  save,
  isDrawingMode,
  onStartDrawing,
  onDrawing,
  onEndDrawing,
  setSelectedObjects,
}: CanvasEventProps) => {
  // 用於追踪畫布是否正在被拖動
  const isDraggingRef = useRef(false);
  // 用於存儲上一次鼠標位置，用於計算拖動距離
  const lastPosXRef = useRef(0);
  const lastPosYRef = useRef(0);

  // 更新鼠標樣式
  const updateCursor = useCallback(() => {
    if (!canvas) return;
    if (isDrawingMode) {
      canvas.defaultCursor = "crosshair";
    } else {
      canvas.defaultCursor = "default";
    }
    canvas.requestRenderAll();
  }, [canvas, isDrawingMode]);

  // 當繪製模式改變時更新鼠標樣式
  useEffect(() => {
    updateCursor();
  }, [isDrawingMode, updateCursor]);

  // 處理滾輪縮放
  const handleWheel = useCallback(
    (opt: fabric.IEvent) => {
      if (!canvas) return;
      const e = opt.e as WheelEvent;
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(MIN_ZOOM, zoom), MAX_ZOOM_LEVEL);

      const point = new fabric.Point(e.offsetX, e.offsetY);
      canvas.zoomToPoint(point, zoom);

      canvas.renderAll();
    },
    [canvas]
  );

  // 處理鼠標按下事件
  const handleMouseDown = useCallback(
    (opt: fabric.IEvent) => {
      if (!canvas) return;
      const evt = opt.e as MouseEvent;

      if (evt.altKey === true) {
        // Alt 鍵按下時進入拖動模式
        isDraggingRef.current = true;
        lastPosXRef.current = evt.clientX;
        lastPosYRef.current = evt.clientY;
        canvas.selection = false;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        canvas.setCursor("grabbing");
      } else if (isDrawingMode) {
        // 在繪製模式下開始繪製
        onStartDrawing(opt);
      }
    },
    [canvas, isDrawingMode, onStartDrawing]
  );

  // 處理鼠標移動事件
  const handleMouseMove = useCallback(
    (opt: fabric.IEvent) => {
      if (!canvas) return;
      const evt = opt.e as MouseEvent;

      if (isDraggingRef.current && evt.altKey) {
        // 處理畫布拖動
        const e = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform;
        if (!vpt) return;

        const dx = e.clientX - lastPosXRef.current;
        const dy = e.clientY - lastPosYRef.current;

        const zoom = canvas.getZoom();
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();

        const maxPanX = canvasWidth / zoom / 2;
        const maxPanY = canvasHeight / zoom / 2;

        vpt[4] = Math.min(
          Math.max(vpt[4] + dx, -maxPanX * zoom),
          maxPanX * zoom
        );
        vpt[5] = Math.min(
          Math.max(vpt[5] + dy, -maxPanY * zoom),
          maxPanY * zoom
        );

        lastPosXRef.current = e.clientX;
        lastPosYRef.current = e.clientY;

        canvas.requestRenderAll();
        canvas.setCursor("grabbing");
      } else if (isDrawingMode) {
        // 在繪製模式下繼續繪製
        onDrawing(opt);
      }
    },
    [canvas, isDrawingMode, onDrawing, updateCursor]
  );

  // 處理鼠標釋放事件
  const handleMouseUp = useCallback(() => {
    if (!canvas) return;
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      updateCursor();
      if (!isDrawingMode) {
        save(); // 在非繪製模式下，拖動結束後保存狀態
      }
    } else if (isDrawingMode) {
      onEndDrawing(); // 在繪製模式下，結束當前繪製
    }
    canvas.selection = !isDrawingMode;
    canvas.requestRenderAll();
  }, [canvas, isDrawingMode, onEndDrawing, updateCursor, save]);

  // 處理物件旋轉，實現旋轉吸附
  const handleObjectRotate = useCallback(
    (event: fabric.IEvent) => {
      if (!canvas) return;
      const targetObject = event.target as fabric.Object;
      if (!targetObject) return;

      const rotationStep = 5;
      let currentAngle = targetObject.angle || 0;

      const snappedAngle =
        Math.round(currentAngle / rotationStep) * rotationStep;
      if (snappedAngle !== currentAngle) {
        targetObject.set("angle", snappedAngle);
        canvas.requestRenderAll();
      }
    },
    [canvas]
  );

  // 處理物件修改（添加、刪除、修改）
  const handleObjectModification = useCallback(() => {
    if (!isDrawingMode) {
      save(); // 只在非繪製模式下保存狀態
    }
  }, [isDrawingMode, save]);

  //處理物件選取事件
  const handleSelection = useCallback(
    (event: fabric.IEvent) => {
      if (!canvas) return;

      const selected = event.selected;
      if (!selected || selected.length === 0) return;

      const hasWallLine = selected.some(
        (obj: fabric.Object) => obj.name === "wallLine"
      );
      if (!hasWallLine) return;

      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;

      const applyRestrictions = (
        obj: fabric.Object | fabric.ActiveSelection
      ) => {
        obj.set({
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
          hasControls: false,
          hasBorders: true,
        });
      };

      applyRestrictions(activeObject);
      activeObject.setCoords();
      canvas.requestRenderAll();

      setSelectedObjects(selected);
    },
    [canvas, setSelectedObjects]
  );

  // 設置和清理畫布事件監聽器
  useEffect(() => {
    if (!canvas) return;

    // 為物件操作添加事件監聽
    canvas.on("object:added", handleObjectModification);
    canvas.on("object:removed", handleObjectModification);
    canvas.on("object:modified", handleObjectModification);

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => {
      console.log("選擇已清除");
    });

    // 為其他畫布事件添加監聽
    canvas.on("mouse:wheel", handleWheel);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("object:rotating", handleObjectRotate);

    // 清理函數
    return () => {
      canvas.off("object:added", handleObjectModification);
      canvas.off("object:removed", handleObjectModification);
      canvas.off("object:modified", handleObjectModification);

      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared");

      canvas.off("mouse:wheel", handleWheel);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("object:rotating", handleObjectRotate);
    };
  }, [
    canvas,
    handleObjectModification,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleObjectRotate,
  ]);

  // 當繪製模式改變時更新畫布狀態
  useEffect(() => {
    if (canvas) {
      canvas.selection = !isDrawingMode; // 在繪製模式下禁用選擇
      if (isDrawingMode) {
        canvas.discardActiveObject(); // 在進入繪製模式時取消當前選中的物件
        canvas.requestRenderAll();
      }
      updateCursor();
    }
  }, [canvas, isDrawingMode, updateCursor]);
};

export default useCanvasEvents;
