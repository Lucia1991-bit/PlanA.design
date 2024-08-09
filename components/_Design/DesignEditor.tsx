import { fabric } from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";
import useCanvasStore from "@/stores/useCanvasStore";
import useDesignColor from "@/hooks/useDesignColor";
import { BoardType } from "@/types/BoardType";
import { calculateZoom } from "./utils/canvasUtils";

interface CanvasProps {
  board: BoardType | null;
}

const Canvas = ({ board }: CanvasProps) => {
  const [isLoading, setIsLoading] = useState(true);

  //Canvas相關 Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const gridRef = useRef<fabric.Group | null>(null);
  const isDraggingRef = useRef(false);
  const isScrollingRef = useRef(false);
  const lastInteractionTimeRef = useRef(0);

  // 使用選擇器函數來訂閱特定狀態
  const setCanvas = useCanvasStore((state) => state.setCanvas);

  //獲取 light模式及dark模式顏色
  const color = useDesignColor();

  //繪製網格線
  //網格大小
  const MAIN_GRID_SIZE = 200; //一大格200px = 100cm
  const SUB_GRID_SIZE = 20; //一小格20px = 10cm
  const MAX_ZOOM = 3; //讓初始網格範圍比視窗大，防止縮放平移時出現網格邊界
  const MIN_ZOOM = 0.7;
  const MAX_ZOOM_LEVEL = 4;
  const INTERACTION_DELAY = 300;

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

  const updateGridPosition = useCallback(() => {
    const canvas = fabricRef.current;
    const grid = gridRef.current;
    if (!canvas || !grid) return;

    const zoom = canvas.getZoom();
    const vpt = canvas.viewportTransform;
    if (vpt) {
      grid.set({
        left: (canvas.getWidth() / 2 - vpt[4]) / zoom,
        top: (canvas.getHeight() / 2 - vpt[5]) / zoom,
      });
      grid.setCoords();
    }
    canvas.requestRenderAll();
  }, []);

  const initCanvas = useCallback(() => {
    if (fabricRef.current || !canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: color.canvas.backgroundColor,
      // renderOnAddRemove: false, //添加或移除物件時畫布不會自動重新渲染
    });
    fabricRef.current = canvas;
    setCanvas(canvas);

    const grid = createGrid(window.innerWidth, window.innerHeight);
    if (grid) {
      canvas.add(grid);
      gridRef.current = grid;
      updateGridPosition();
    }

    // 縮放功能
    canvas.on("mouse:wheel", (opt) => {
      opt.e.preventDefault();
      opt.e.stopPropagation();

      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(MIN_ZOOM, zoom), MAX_ZOOM_LEVEL);

      const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
      canvas.zoomToPoint(point, zoom);

      //禁止瀏覽器滾動
      opt.e.preventDefault();
      //防止事件冒泡
      opt.e.stopPropagation();

      canvas.renderAll();
    });

    // 平移功能
    let lastPosX: number, lastPosY: number;

    canvas.on("mouse:down", (opt) => {
      const evt = opt.e as MouseEvent;
      if (evt.altKey === true && !isScrollingRef.current) {
        isDraggingRef.current = true;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        canvas.selection = false;
      }
    });

    canvas.on("mouse:move", (opt) => {
      if (isDraggingRef.current) {
        const e = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform;
        if (!vpt) return;

        let dx = e.clientX - lastPosX;
        let dy = e.clientY - lastPosY;

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

        lastPosX = e.clientX;
        lastPosY = e.clientY;

        canvas.requestRenderAll();
        canvas.setCursor("grabbing");
      }
    });

    canvas.on("mouse:up", () => {
      isDraggingRef.current = false;
      canvas.selection = true;
      canvas.setCursor("default");
      setTimeout(() => {
        lastInteractionTimeRef.current = 0;
      }, INTERACTION_DELAY);
    });

    canvas.renderAll();
    return canvas;
  }, [color.canvas.backgroundColor, createGrid, setCanvas, updateGridPosition]);

  useEffect(() => {
    const canvas = initCanvas();
    if (canvas && board) {
      // 載入板塊數據的邏輯
    }

    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
        setCanvas(null);
      }
    };
  }, [initCanvas, board, setCanvas]);

  return <canvas ref={canvasRef} style={{ zIndex: "0" }} />;
};

export default Canvas;
