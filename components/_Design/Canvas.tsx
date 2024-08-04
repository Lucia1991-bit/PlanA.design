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
  const zoom = useCanvasStore((state) => state.zoom);
  const setZoom = useCanvasStore((state) => state.setZoom);
  const updateGridPosition = useCanvasStore(
    (state) => state.updateGridPosition
  );
  const recreateGrid = useCanvasStore((state) => state.recreateGrid);

  const color = useDesignColor();

  //繪製網格線
  //網格大小
  const MAIN_GRID_SIZE = 200; //一大格200px = 100cm
  const SUB_GRID_SIZE = 20; //一小格20px = 10cm
  const MAX_ZOOM = 3; //讓初始網格範圍比視窗大，防止縮放平移時出現網格邊界

  const createGrid = useCallback(
    (width: number, height: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const canvasWidth = width;
      const canvasHeight = height;

      const maxGridWidth = canvasWidth * MAX_ZOOM;
      const maxGridHeight = canvasHeight * MAX_ZOOM;

      const gridLines = [];

      // 確保網格線從0開始，並向兩側延伸
      const startX =
        -Math.floor(maxGridWidth / 2 / MAIN_GRID_SIZE) * MAIN_GRID_SIZE;
      const startY =
        -Math.floor(maxGridHeight / 2 / MAIN_GRID_SIZE) * MAIN_GRID_SIZE;
      const endX =
        Math.ceil(maxGridWidth / 2 / MAIN_GRID_SIZE) * MAIN_GRID_SIZE;
      const endY =
        Math.ceil(maxGridHeight / 2 / MAIN_GRID_SIZE) * MAIN_GRID_SIZE;

      //繪製次網格線
      //垂直線
      for (let i = startX; i <= endX; i += SUB_GRID_SIZE) {
        const vLine = new fabric.Line([i, -maxGridHeight, i, maxGridHeight], {
          stroke: color.canvas.subGridColor,
          selectable: false,
          strokeUniform: true,
          strokeWidth: 1,
          opacity: 0.7,
        });
        gridLines.push(vLine);
      }
      //水平線
      for (let i = startY; i <= endY; i += SUB_GRID_SIZE) {
        const hLine = new fabric.Line([-maxGridWidth, i, maxGridWidth, i], {
          stroke: color.canvas.subGridColor,
          selectable: false,
          strokeUniform: true,
          strokeWidth: 1,
          opacity: 0.7,
        });
        gridLines.push(hLine);
      }

      //繪製主網格線
      //垂直線
      for (let i = startX; i <= endX; i += MAIN_GRID_SIZE) {
        const vLine = new fabric.Line([i, -maxGridHeight, i, maxGridHeight], {
          stroke: color.canvas.mainGridColor,
          selectable: false,
          strokeUniform: true,
          strokeWidth: 1.5,
          opacity: 0.7,
        });
        gridLines.push(vLine);
      }

      //水平線
      for (let i = startY; i <= endY; i += MAIN_GRID_SIZE) {
        const hLine = new fabric.Line([-maxGridWidth, i, maxGridWidth, i], {
          stroke: color.canvas.mainGridColor,
          selectable: false,
          strokeUniform: true,
          strokeWidth: 1.5,
          opacity: 0.7,
        });
        gridLines.push(hLine);
      }

      // 添加中央 X 軸線
      gridLines.push(
        new fabric.Line([startX, 0, endX, 0], {
          stroke: color.canvas.mainGridColor,
          selectable: false,
          strokeUniform: true,
          strokeWidth: 2.3,
          opacity: 1,
        })
      );

      // 添加中央 Y 軸線
      gridLines.push(
        new fabric.Line([0, startY, 0, endY], {
          stroke: color.canvas.mainGridColor,
          selectable: false,
          strokeUniform: true,
          strokeWidth: 2.3,
          opacity: 1,
        })
      );

      //將網格組成群組
      const gridGroup = new fabric.Group(gridLines, {
        selectable: false,
        evented: false,
        objectCaching: false, //禁用緩存，增加清晰度
        originX: "center",
        originY: "center",
        left: 0,
        top: 0,
      });

      return gridGroup;
    },
    [color.canvas.mainGridColor, color.canvas.subGridColor]
  );

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

    // 創建並添加網格
    const grid = createGrid(window.innerWidth, window.innerHeight);
    if (grid) {
      fabricCanvas.add(grid);
      useCanvasStore.getState().setGrid(grid);
      updateGridPosition();
    }

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

  return (
    <canvas
      ref={canvasRef}
      style={{ border: "2px solid purple", zIndex: "0" }}
    />
  );
};

export default Canvas;
