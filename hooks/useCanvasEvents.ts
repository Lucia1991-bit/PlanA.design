import { fabric } from "fabric";
import { useEffect, useRef } from "react";
import { MIN_ZOOM, MAX_ZOOM_LEVEL } from "@/types/DesignType";

interface CanvasEventProps {
  canvas: fabric.Canvas | null;
  save: () => void;
}

const useCanvasEvents = ({ canvas, save }: CanvasEventProps) => {
  const isDraggingRef = useRef(false);
  const lastPosXRef = useRef(0);
  const lastPosYRef = useRef(0);

  useEffect(() => {
    if (!canvas) return;

    canvas.on("object:added", () => save());
    canvas.on("object:removed", () => save());
    canvas.on("object:modified", () => save());

    const handleWheel = (opt: fabric.IEvent) => {
      const e = opt.e as WheelEvent;
      e.preventDefault();
      e.stopPropagation();

      const delta = (opt.e as WheelEvent).deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(MIN_ZOOM, zoom), MAX_ZOOM_LEVEL);

      const point = new fabric.Point(e.offsetX, e.offsetY);
      canvas.zoomToPoint(point, zoom);

      canvas.renderAll();
    };

    const handleMouseDown = (opt: fabric.IEvent) => {
      const evt = opt.e as MouseEvent;
      if (evt.altKey === true) {
        isDraggingRef.current = true;
        lastPosXRef.current = evt.clientX;
        lastPosYRef.current = evt.clientY;
        canvas.selection = false;
      }
    };

    const handleMouseMove = (opt: fabric.IEvent) => {
      if (isDraggingRef.current) {
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
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      canvas.selection = true;
      canvas.setCursor("default");
    };

    //控制物件旋轉角度(一次轉幾度)
    const rotationStep = 5; // 可以根據需要調整
    const handleObjectRotate = (event: fabric.IEvent) => {
      //TODO:之後統一管理選取的物件
      const targetObject = event.target as fabric.Object;
      if (!targetObject) return;

      let currentAngle = targetObject.angle || 0;

      //將角度轉換為最接近的值
      const snappedAngle =
        Math.round(currentAngle / rotationStep) * rotationStep;
      // 如果轉換後的角度與當前角度不同，則更新物件的角度
      if (snappedAngle !== currentAngle) {
        targetObject.set("angle", snappedAngle);
        canvas.requestRenderAll();
      }
    };

    canvas.on("mouse:wheel", handleWheel);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("object:rotating", handleObjectRotate);

    // canvas.on("object:added", save);
    // canvas.on("object:removed", save);
    // canvas.on("object:modified", save);
    // canvas.on("selection:created", (e) => setSelectedObjects(e.selected || []));
    // canvas.on("selection:updated", (e) => setSelectedObjects(e.selected || []));
    // canvas.on("selection:cleared", () => {
    //   setSelectedObjects([]);
    //   clearSelectionCallback?.();
    // });

    return () => {
      canvas.off("mouse:wheel", handleWheel);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("object:rotating", handleObjectRotate);
      canvas.off("object:added");
      canvas.off("object:removed");
      canvas.off("object:modified");

      // canvas.off("object:added", save);
      // canvas.off("object:removed", save);
      // canvas.off("object:modified", save);
      // canvas.off("selection:created");
      // canvas.off("selection:updated");
      // canvas.off("selection:cleared");
    };
  }, [canvas]);
};

export default useCanvasEvents;
