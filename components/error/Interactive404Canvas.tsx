import React, { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { Box } from "@chakra-ui/react";
import { useClipboard } from "@/hooks/useClipboard";
import { useHotkeys } from "@/hooks/useHotkeys";

const Interactive404Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const newCanvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#ecebeb",
      });

      fabric.Object.prototype.set({
        cornerColor: "#FFF",
        cornerStyle: "circle",
        borderColor: "#3b82f6",
        borderScaleFactor: 1.5,
        transparentCorners: false,
        borderOpacityWhenMoving: 1,
        cornerStrokeColor: "#3b82f6",
      });

      setCanvas(newCanvas);

      const updateCanvasSize = () => {
        newCanvas.setWidth(window.innerWidth);
        newCanvas.setHeight(window.innerHeight);
        updateTextSize(newCanvas);
        newCanvas.renderAll();
      };

      window.addEventListener("resize", updateCanvasSize);

      return () => {
        newCanvas.dispose();
        window.removeEventListener("resize", updateCanvasSize);
      };
    }
  }, []);

  useEffect(() => {
    if (canvas) {
      createAndCenterText(canvas);
    }
  }, [canvas]);

  const createAndCenterText = (canvas: fabric.Canvas) => {
    canvas.clear();

    const text = new fabric.Text("404", {
      fontSize: 80,
      fill: "#c6332e",
      fontWeight: "300",
      fontFamily: "Lexend, sans-serif",
      originX: "center",
      originY: "center",
    });

    text.set({
      selectable: true,
      hasControls: true,
      hasBorders: true,
    });

    canvas.add(text);
    updateTextSize(canvas);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const updateTextSize = (canvas: fabric.Canvas) => {
    const text = canvas.getObjects()[0] as fabric.Text;
    if (text) {
      const scaleFactor = Math.min(canvas.width!, canvas.height!) / 8;
      const newFontSize = Math.max(scaleFactor, 24);
      text.set({
        fontSize: newFontSize,
        left: canvas.width! / 2,
        top: canvas.height! / 2,
      });
      text.setCoords();
    }
  };

  // 使用 useClipboard hook
  const { copy, paste } = useClipboard({ canvas });

  // 為 useHotkeys 提供空函數
  const noop = useCallback(() => {}, []);

  // 使用 useHotkeys hook
  useHotkeys({
    canvas,
    copy,
    paste,
    deleteObjects: noop,
    isDrawingMode: false,
    undo: noop,
    redo: noop,
    saveToDatabase: noop,
    finishDrawWall: noop,
  });

  return (
    <Box position="absolute" inset={0}>
      <canvas ref={canvasRef} />
    </Box>
  );
};

export default Interactive404Canvas;
