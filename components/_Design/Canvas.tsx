import * as fabric from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";
import useCanvasStore from "@/stores/useCanvasStore";
import useDesignColor from "@/hooks/useDesignColor";
import { BoardType } from "@/types/BoardType";

interface CanvasProps {
  board: BoardType | null;
}

const Canvas = ({ board }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 使用選擇器函數來訂閱特定狀態
  const setCanvas = useCanvasStore((state) => state.setCanvas);

  const color = useDesignColor();

  //初始化畫布
  const initCanvas = useCallback(() => {
    // 防止重複初始化
    if (fabricRef.current || !canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: color.canvas.backgroundColor,
    });
    fabricRef.current = fabricCanvas;
    setCanvas(fabricCanvas);
    return fabricCanvas;
  }, [color.canvas.backgroundColor, setCanvas]);

  //載入存檔資料
  const loadBoardData = useCallback(
    (canvas: fabric.Canvas, board: BoardType | null) => {
      setIsLoading(true);
      if (board?.fabricData) {
        canvas.loadFromJSON(board.fabricData, () => {
          canvas.renderAll();
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const canvas = initCanvas();
    if (canvas && board) {
      loadBoardData(canvas, board);
    }

    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
        setCanvas(null);
      }
    };
  }, [initCanvas, loadBoardData, board, setCanvas]);

  // TODO:監聽畫布大小變化
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (fabricRef.current) {
  //       fabricRef.current.setDimensions({
  //         width: window.innerWidth,
  //         height: window.innerHeight,
  //       });
  //     }
  //   };

  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  return <canvas ref={canvasRef} style={{ border: "2px solid purple" }} />;
};

export default Canvas;
