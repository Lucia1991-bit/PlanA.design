import { useCallback, useState, useEffect, useRef } from "react";
import { fabric } from "fabric";
import { MIN_ZOOM, MAX_ZOOM_LEVEL } from "@/types/DesignType";

interface UseCanvasEventsProps {
  canvas: fabric.Canvas | null;
  isDrawingMode: boolean;
  onStartDrawing: (event: fabric.IEvent) => void;
  onDrawing: (event: fabric.IEvent) => void;
  save: () => void;
  setSelectedObjects: React.Dispatch<React.SetStateAction<fabric.Object[]>>;
  openContextMenu: (x: number, y: number, hasActiveObject: boolean) => void;
  closeContextMenu: () => void;
}

const useCanvasEvents = ({
  canvas,
  isDrawingMode,
  onStartDrawing,
  onDrawing,
  save,
  setSelectedObjects,
  openContextMenu,
  closeContextMenu,
}: UseCanvasEventsProps) => {
  // 用於追踪畫布是否正在被拖動
  const isDraggingRef = useRef(false);
  // 用於存儲上一次鼠標位置，用於計算拖動距離
  const lastPosXRef = useRef(0);
  const lastPosYRef = useRef(0);
  // 用於追踪空白鍵是否被按下
  const isSpacebarDownRef = useRef(false);

  // 處理選擇事件
  const handleSelectionCreated = useCallback(
    (e: fabric.IEvent) => {
      const selected = (e as any).selected || [];
      setSelectedObjects(selected);
    },
    [setSelectedObjects]
  );

  const handleSelectionUpdated = useCallback(
    (e: fabric.IEvent) => {
      const selected = (e as any).selected || [];
      setSelectedObjects(selected);
    },
    [setSelectedObjects]
  );

  const handleSelectionCleared = useCallback(() => {
    setSelectedObjects([]);
  }, [setSelectedObjects]);

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

      // 處理右鍵點擊
      if (evt.button === 3 || evt.which === 3) {
        evt.preventDefault();
        evt.stopPropagation();
        const target = canvas.findTarget(evt as any, false);

        const canvasElement = canvas.getElement();
        const canvasRect = canvasElement.getBoundingClientRect();

        let x = evt.clientX;
        let y = evt.clientY;

        // 使用實際的 ContextMenu 寬度和高度
        const menuWidth = 150;
        const menuHeight = 200; // 估計高度，可能需要根據實際情況調整

        // 確保右鍵選單不會超出畫布邊界
        if (x + menuWidth > canvasRect.right) {
          x = canvasRect.right - menuWidth;
        }
        if (y + menuHeight > canvasRect.bottom) {
          y = canvasRect.bottom - menuHeight;
        }

        openContextMenu(x, y, !!target);

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
        closeContextMenu();
      }
    },
    [canvas, isDrawingMode, onStartDrawing, openContextMenu]
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

  // 處理物件修改（添加、刪除、修改）
  const handleObjectModification = useCallback(() => {
    if (!isDrawingMode) {
      save(); // 只在非繪製模式下保存狀態
    }
  }, [isDrawingMode, save]);

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

  // 當繪製模式改變時更新鼠標樣式
  useEffect(() => {
    updateCursor();
  }, [isDrawingMode, updateCursor]);

  // 設置和清理畫布事件監聽器
  useEffect(() => {
    if (!canvas) return;

    canvas.on("mouse:wheel", handleWheel);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    canvas.on("object:added", handleObjectModification);
    canvas.on("object:removed", handleObjectModification);
    canvas.on("object:modified", handleObjectModification);
    canvas.on("object:rotating", handleObjectRotate);

    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionUpdated);
    canvas.on("selection:cleared", handleSelectionCleared);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // 清理函數
    return () => {
      canvas.off("mouse:wheel", handleWheel);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);

      canvas.off("object:added", handleObjectModification);
      canvas.off("object:removed", handleObjectModification);
      canvas.off("object:modified", handleObjectModification);
      canvas.off("object:rotating", handleObjectRotate);

      canvas.off("selection:created", handleSelectionCreated);
      canvas.off("selection:updated", handleSelectionUpdated);
      canvas.off("selection:cleared", handleSelectionCleared);

      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    canvas,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleObjectModification,
    handleObjectRotate,
    handleKeyDown,
    handleKeyUp,
    handleSelectionCreated,
    handleSelectionUpdated,
    handleSelectionCleared,
  ]);
};

export default useCanvasEvents;
