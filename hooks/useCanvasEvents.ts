import { fabric } from "fabric";
import { useEffect, useRef, useCallback } from "react";
import { MIN_ZOOM, MAX_ZOOM_LEVEL } from "@/types/DesignType";

interface CanvasEventProps {
  canvas: fabric.Canvas | null;
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
}: CanvasEventProps) => {
  const isDraggingRef = useRef(false);
  const lastPosXRef = useRef(0);
  const lastPosYRef = useRef(0);

  const updateCursor = useCallback(() => {
    if (!canvas) return;
    if (isDrawingMode) {
      canvas.defaultCursor = "crosshair";
    } else {
      canvas.defaultCursor = "default";
    }
    canvas.requestRenderAll();
  }, [canvas, isDrawingMode]);

  useEffect(() => {
    updateCursor();
  }, [isDrawingMode, updateCursor]);

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

  const handleMouseDown = useCallback(
    (opt: fabric.IEvent) => {
      if (!canvas) return;
      const evt = opt.e as MouseEvent;

      if (evt.altKey === true) {
        isDraggingRef.current = true;
        lastPosXRef.current = evt.clientX;
        lastPosYRef.current = evt.clientY;
        canvas.selection = false;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        canvas.setCursor("grabbing");
      } else if (isDrawingMode) {
        onStartDrawing(opt);
      }
    },
    [canvas, isDrawingMode, onStartDrawing]
  );

  const handleMouseMove = useCallback(
    (opt: fabric.IEvent) => {
      if (!canvas) return;
      const evt = opt.e as MouseEvent;

      if (isDraggingRef.current || evt.altKey) {
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
        onDrawing(opt);
      } else {
        updateCursor();
      }
    },
    [canvas, isDrawingMode, onDrawing, updateCursor]
  );

  const handleMouseUp = useCallback(() => {
    if (!canvas) return;
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      updateCursor();
    } else if (isDrawingMode) {
      onEndDrawing();
    }
    canvas.selection = !isDrawingMode;
    canvas.requestRenderAll();
  }, [canvas, isDrawingMode, onEndDrawing, updateCursor]);

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

  useEffect(() => {
    if (!canvas) return;

    canvas.on("object:added", save);
    canvas.on("object:removed", save);
    canvas.on("object:modified", save);
    canvas.on("mouse:wheel", handleWheel);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("object:rotating", handleObjectRotate);

    return () => {
      canvas.off("object:added", save);
      canvas.off("object:removed", save);
      canvas.off("object:modified", save);
      canvas.off("mouse:wheel", handleWheel);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("object:rotating", handleObjectRotate);
    };
  }, [
    canvas,
    save,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleObjectRotate,
  ]);

  useEffect(() => {
    if (canvas) {
      canvas.selection = !isDrawingMode;
      if (isDrawingMode) {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
      updateCursor();
    }
  }, [canvas, isDrawingMode, updateCursor]);
};

export default useCanvasEvents;
