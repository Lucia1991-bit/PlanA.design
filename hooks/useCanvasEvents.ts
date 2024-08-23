import { useCallback, useState, useEffect, useRef } from "react";
import { fabric } from "fabric";
import { MIN_ZOOM, MAX_ZOOM_LEVEL } from "@/types/DesignType";

interface UseCanvasEventsProps {
  canvas: fabric.Canvas | null;
  isDrawingMode: boolean;
  onStartDrawing: (event: fabric.IEvent) => void;
  onDrawing: (event: fabric.IEvent) => void;
  save: () => void;
  copy: () => void;
  paste: () => void;
  deleteObjects: () => void;
}

const useCanvasEvents = ({
  canvas,
  isDrawingMode,
  onStartDrawing,
  onDrawing,
  save,
  copy,
  paste,
  deleteObjects,
}: UseCanvasEventsProps) => {
  // 用於追踪畫布是否正在被拖動
  const isDraggingRef = useRef(false);
  // 用於存儲上一次鼠標位置，用於計算拖動距離
  const lastPosXRef = useRef(0);
  const lastPosYRef = useRef(0);
  // 用於追踪空白鍵是否被按下
  const isSpacebarDownRef = useRef(false);
  // 紀錄右鍵選單的位置
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

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

      console.log(
        "Mouse event:",
        evt.type,
        "Button:",
        evt.button,
        "Which:",
        evt.which
      );

      // 處理右鍵點擊
      if (evt.button === 3 || evt.which === 3) {
        evt.preventDefault();
        evt.stopPropagation();
        const pointer = canvas.getPointer(evt);
        const target = canvas.findTarget(evt as any, false);

        console.log("Right click detected", pointer, target);

        // 無論是否有目標物件，都設置 contextMenu 位置
        setContextMenuPosition({ x: evt.clientX, y: evt.clientY });
        console.log("Context menu position set:", {
          x: evt.clientX,
          y: evt.clientY,
        });

        if (target) {
          canvas.setActiveObject(target);
        } else {
          canvas.discardActiveObject();
        }
        canvas.renderAll();
        return;
      }

      // 空白鍵按下時進入拖動模式
      if (isSpacebarDownRef.current) {
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
      } else {
        setContextMenuPosition(null);
      }
    },
    [canvas, isDrawingMode, onStartDrawing, setContextMenuPosition]
  );

  // 處理鼠標移動事件
  const handleMouseMove = useCallback(
    (opt: fabric.IEvent) => {
      if (!canvas) return;
      const evt = opt.e as MouseEvent;

      if (isDraggingRef.current && isSpacebarDownRef.current) {
        // 處理畫布拖動
        const vpt = canvas.viewportTransform;
        if (!vpt) return;

        const dx = evt.clientX - lastPosXRef.current;
        const dy = evt.clientY - lastPosYRef.current;

        vpt[4] += dx;
        vpt[5] += dy;

        lastPosXRef.current = evt.clientX;
        lastPosYRef.current = evt.clientY;

        canvas.requestRenderAll();
        canvas.setCursor("grabbing");
      } else if (isDrawingMode) {
        // 在繪製模式下繼續繪製
        onDrawing(opt);
      }
    },
    [canvas, isDrawingMode, onDrawing]
  );

  // 處理鼠標釋放事件
  const handleMouseUp = useCallback(() => {
    if (!canvas) return;
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      canvas.defaultCursor = isDrawingMode ? "crosshair" : "default";
      if (!isDrawingMode) {
        save(); // 在非繪製模式下，拖動結束後保存狀態
      }
    }
    // 在繪製模式下取消原本物件選取
    canvas.selection = !isDrawingMode;
    canvas.requestRenderAll();
  }, [canvas, isDrawingMode, save]);

  // 處理鍵盤按下事件
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space" && !isSpacebarDownRef.current) {
        isSpacebarDownRef.current = true;
        if (canvas) {
          canvas.defaultCursor = "grab";
          canvas.requestRenderAll();
        }
      }
    },
    [canvas]
  );

  // 處理鍵盤釋放事件
  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isSpacebarDownRef.current = false;
        if (canvas) {
          canvas.defaultCursor = isDrawingMode ? "crosshair" : "default";
          canvas.requestRenderAll();
        }
      }
    },
    [canvas, isDrawingMode]
  );

  // 處理物件旋轉，實現旋轉吸附
  const handleObjectRotate = useCallback(
    (event: fabric.IEvent) => {
      if (!canvas) return;
      const targetObject = event.target as fabric.Object;
      if (!targetObject) return;

      const rotationStep = 10;
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

  // 處理右鍵Menu動作
  const handleContextMenuAction = useCallback(
    (action: "copy" | "paste" | "delete" | "close") => {
      switch (action) {
        case "copy":
          copy();
          break;
        case "paste":
          paste();
          break;
        case "delete":
          deleteObjects();
          break;
        case "close":
          setContextMenuPosition(null);
          break;
      }
    },
    [copy, paste, deleteObjects]
  );

  // 設置和清理畫布事件監聽器
  useEffect(() => {
    if (!canvas) return;

    canvas.on("mouse:wheel", handleWheel);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("object:rotating", handleObjectRotate);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // 清理函數
    return () => {
      canvas.off("mouse:wheel", handleWheel);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("object:rotating", handleObjectRotate);

      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    canvas,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleObjectRotate,
    handleKeyDown,
    handleKeyUp,
  ]);

  return {
    contextMenuPosition,
    setContextMenuPosition,
    handleContextMenuAction,
  };
};

export default useCanvasEvents;
