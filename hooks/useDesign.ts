import { fabric } from "fabric";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MAIN_GRID_SIZE,
  SUB_GRID_SIZE,
  MAX_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM_LEVEL,
  DesignHookProps,
} from "@/types/DesignType";
import useDesignColor from "./useDesignColor";
import useCanvasEvents from "./useCanvasEvents";
import useAutoResize from "./useAutoResize";

//所有設計功能的邏輯
// const buildDesign = ({ canvas }: BuildDesignProps) => {
//   const getWorkspace = () => {
//     return canvas.getObjects().find((object) => object.name === "clip");
//   };

//   //獲取畫布中心點
//   const center = (object: fabric.Object) => {
//     const workspace = getWorkspace();
//     const center = workspace?.getCenterPoint();

//     if (!center) return;

//     // @ts-ignore
//     canvas._centerObject(object, center);
//   };

//   const addToCanvas = (object: fabric.Object) => {
//     center(object);
//     canvas.add(object);
//     canvas.setActiveObject(object);
//   };
// };

const useDesign = ({ defaultState }: DesignHookProps) => {
  const initialState = useRef(defaultState);
  const gridRef = useRef<fabric.Group | null>(null);

  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  // const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
  // const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);

  //獲取 light模式及dark模式顏色
  const color = useDesignColor();

  //處理畫布事件
  useCanvasEvents({
    canvas,
  });

  //創建網格線
  const createGrid = useCallback(
    (width: number, height: number) => {
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
        selectable: false, //禁用選擇
        evented: false, ///禁用事件
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

  //將網格線置中
  const updateGridPosition = useCallback(() => {
    const grid = gridRef.current;
    if (!grid || !canvas) return;

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
  }, [canvas]);

  // 畫布尺寸隨視窗縮放改變
  const { resizeCanvas } = useAutoResize({
    canvas,
    gridRef,
    createGrid,
    updateGridPosition,
  });

  //初始化畫布
  const initCanvas = useCallback(
    ({ initialCanvas }: { initialCanvas: fabric.Canvas }) => {
      //設定物件控制器的樣式
      fabric.Object.prototype.set({
        cornerColor: "#FFF",
        cornerStyle: "circle",
        borderColor: "#3b82f6",
        borderScaleFactor: 1.5,
        transparentCorners: false,
        borderOpacityWhenMoving: 1,
        cornerStrokeColor: "#3b82f6",
      });

      //設定尺寸及背景顏色
      initialCanvas.setWidth(window.innerWidth);
      initialCanvas.setHeight(window.innerHeight);
      initialCanvas.setBackgroundColor(color.canvas.backgroundColor, () => {
        initialCanvas.renderAll();
      });

      // 創建網格但不立即添加到畫布
      const grid = createGrid(window.innerWidth, window.innerHeight);
      if (grid) {
        gridRef.current = grid;
      }

      // 更新 canvas 狀態
      setCanvas(initialCanvas);

      // const currentState = JSON.stringify(initialCanvas.toJSON(JSON_KEYS));
      // canvasHistory.current = [currentState];
      // setHistoryIndex(0);
    },
    [color.canvas.backgroundColor, createGrid]
  );

  // 使用 useEffect 來處理依賴於 canvas 狀態的操作
  useEffect(() => {
    if (canvas && gridRef.current) {
      canvas.add(gridRef.current);
      updateGridPosition();
      canvas.renderAll();
    }
  }, [canvas, updateGridPosition]);

  const design = useMemo(() => {
    if (canvas) {
      console.log("回傳設計功能");
      // return buildDesign();
    }

    return undefined;
  }, [canvas]);

  return { initCanvas, design };
};

export default useDesign;
