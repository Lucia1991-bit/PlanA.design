import { fabric } from "fabric";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MAIN_GRID_SIZE,
  SUB_GRID_SIZE,
  MAX_ZOOM,
  DesignHookProps,
  GLOBAL_SCALE,
  BuildDesignProps,
  Design,
} from "@/types/DesignType";
import useDesignColor from "./useDesignPageColor";
import useCanvasEvents from "./useCanvasEvents";
import useAutoResize from "./useAutoResize";
import useCanvasAndGridColor from "./useCanvasAndGridColor";
import { useDesignColorMode } from "@/context/colorModeContext";
import { useHotkeys } from "@/hooks/useHotkeys";
import { useClipboard } from "@/hooks/useClipboard";
import { useHistory } from "./useHistory";
import { useLoadState } from "./useLoadDesign";
import { useDrawWall } from "./useDrawWall";
import { usePattern } from "./usePattern";

//所有設計功能的邏輯
const buildDesign = ({
  canvas,
  save,
  undo,
  redo,
  canRedo,
  canUndo,
  saveToDatabase,
  isDrawingMode,
  setIsDrawingMode,
  startDrawWall,
  finishDrawWall,
  applyPattern,
  contextMenuPosition,
  handleContextMenuAction,
}: BuildDesignProps): Design => {
  //獲取畫布中心點
  const getCanvasCenter = (canvas: fabric.Canvas) => {
    return {
      x: canvas.getWidth() / 2,
      y: canvas.getHeight() / 2,
    };
  };

  //將物件放置畫布中心
  const centerObjectOnCanvas = (
    canvas: fabric.Canvas,
    object: fabric.Object
  ) => {
    const center = getCanvasCenter(canvas);
    object.set({
      left: center.x,
      top: center.y,
      originX: "center",
      originY: "center",
    });
  };

  return {
    canvas,
    canUndo,
    canRedo,
    onUndo: () => undo(),
    onRedo: () => redo(),
    onSave: () => {
      console.log("onSave called in buildDesign");
      return saveToDatabase();
    },
    addFurniture: (imageUrl: string) => {
      fabric.Image.fromURL(
        imageUrl,
        (img) => {
          img.scale(GLOBAL_SCALE);
          img.objectCaching = false;
          centerObjectOnCanvas(canvas, img);
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        },
        { crossOrigin: "anonymous" }
      );
    },
    addDoorWindow: (imageUrl: string) => {
      fabric.loadSVGFromURL(imageUrl, (objects, options) => {
        const svg = fabric.util.groupSVGElements(objects, options);
        svg.scale(1.8);
        svg.objectCaching = false;
        centerObjectOnCanvas(canvas, svg);
        canvas.add(svg);
        canvas.setActiveObject(svg);
        canvas.renderAll();
      });
    },
    isDrawingMode,
    setIsDrawingMode,
    startDrawWall,
    finishDrawWall,
    applyPattern,
    contextMenuPosition,
    handleContextMenuAction,
  };
};

const useDesign = ({ defaultState, saveDesign }: DesignHookProps) => {
  const initialState = useRef(defaultState);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const gridRef = useRef<fabric.Group | null>(null);

  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

  // const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
  // const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);

  const getCanvas = useCallback(() => canvasRef.current, []);

  const { designColorMode } = useDesignColorMode();

  //獲取 light模式及dark模式顏色
  const color = useDesignColor();

  //創建網格線
  const createGrid = useCallback((width: number, height: number) => {
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
    const endX = Math.ceil(maxGridWidth / 2 / MAIN_GRID_SIZE) * MAIN_GRID_SIZE;
    const endY = Math.ceil(maxGridHeight / 2 / MAIN_GRID_SIZE) * MAIN_GRID_SIZE;

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
      name: "designGrid", // 給網格一個唯一的名字
      selectable: false, //禁用選擇
      evented: false, ///禁用事件
      objectCaching: false, //禁用緩存，增加清晰度
      originX: "center",
      originY: "center",
      left: 0,
      top: 0,
    });

    return gridGroup;
  }, []);

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

  const updateGridColor = useCallback(() => {
    if (!gridRef.current || !canvas) {
      console.warn("Canvas is not initialized yet");
      return;
    }

    gridRef.current.getObjects().forEach((line: fabric.Object) => {
      if (line instanceof fabric.Line) {
        if (line.strokeWidth === 1.5 || line.strokeWidth === 2.3) {
          line.set({ stroke: color.canvas.mainGridColor });
        } else {
          line.set({ stroke: color.canvas.subGridColor });
        }
      }
    });

    canvas.renderAll();
  }, [canvas, color.canvas.mainGridColor, color.canvas.subGridColor]);

  const updateCanvasColor = useCallback(() => {
    if (!canvas) {
      console.warn("Canvas is not initialized yet");
      return;
    }

    const backgroundColor = designColorMode === "light" ? "#ecebeb" : "#373838";
    canvas.setBackgroundColor(backgroundColor, () => {
      canvas.renderAll();
    });
  }, [canvas, designColorMode]);

  //畫布的物件互動操作
  const { copy, paste, deleteObjects } = useClipboard({ canvas });

  //管理畫布歷史紀錄及存檔
  const {
    save,
    canRedo,
    canUndo,
    undo,
    redo,
    setHistoryIndex,
    canvasHistory,
    saveToDatabase,
  } = useHistory({
    canvas,
    gridRef,
    updateGridColor,
    updateCanvasColor,
    saveDesign,
  });

  //材質 pattern
  const { applyPattern, adjustPatternScale } = usePattern({ canvas });

  //繪製牆體
  const {
    isDrawingMode,
    setIsDrawingMode,
    startDrawWall,
    startDrawing,
    draw,
    finishDrawWall,
    rooms,
  } = useDrawWall({
    canvas,
    gridRef,
    save,
    updateGridColor,
    updateCanvasColor,
    applyPattern,
    adjustPatternScale,
  });

  //處理畫布事件
  const {
    contextMenuPosition,
    setContextMenuPosition,
    handleContextMenuAction,
  } = useCanvasEvents({
    canvas,
    save,
    isDrawingMode,
    onStartDrawing: startDrawing,
    onDrawing: draw,
    copy,
    paste,
    deleteObjects,
  });

  //畫布操作快捷鍵
  useHotkeys({
    canvas,
    copy,
    paste,
    deleteObjects,
    isDrawingMode,
    finishDrawWall,
    undo,
    redo,
    saveToDatabase,
  });

  // 畫布尺寸隨視窗縮放改變
  const { resizeCanvas } = useAutoResize({
    canvas,
    container,
    gridRef,
    createGrid,
    updateGridPosition,
  });

  //加載存檔資料
  useLoadState({
    canvas,
    initialState: useRef(initialState.current),
    canvasHistory,
    setHistoryIndex,
    gridRef,
    updateGridColor,
    updateCanvasColor,
  });

  //初始化畫布
  const initCanvas = useCallback(
    ({
      initialCanvas,
      initialContainer,
    }: {
      initialCanvas: fabric.Canvas;
      initialContainer: HTMLDivElement;
    }) => {
      canvasRef.current = initialCanvas;

      fabric.Object.prototype.set({
        cornerColor: "#FFF",
        cornerStyle: "circle",
        borderColor: "#3b82f6",
        borderScaleFactor: 1.5,
        transparentCorners: false,
        borderOpacityWhenMoving: 1,
        cornerStrokeColor: "#3b82f6",
      });

      //初始尺寸及畫布顏色
      initialCanvas.setWidth(initialContainer.offsetWidth);
      initialCanvas.setHeight(initialContainer.offsetHeight);
      initialCanvas.setBackgroundColor(color.canvas.backgroundColor, () => {
        initialCanvas.renderAll();
      });

      const grid = createGrid(
        initialContainer.offsetWidth,
        initialContainer.offsetHeight
      );
      if (grid) {
        gridRef.current = grid;
        initialCanvas.add(grid);
        initialCanvas.sendToBack(grid);
      }

      setCanvas(initialCanvas);
      setContainer(initialContainer);
      setIsCanvasReady(true);
    },
    [createGrid]
  );

  // 新增：保存初始狀態的函數
  // const saveInitialState = useCallback(() => {
  //   if (canvas && gridRef.current) {
  //     const grid = gridRef.current;
  //     canvas.remove(grid);
  //     const currentState = JSON.stringify(canvas.toJSON(OBJECT_STATE));
  //     canvas.add(grid);
  //     canvas.sendToBack(grid);

  //     canvasHistory.current = [currentState];
  //     setHistoryIndex(0);
  //     // 調用 save 來確保初始狀態被正確記錄
  //   }
  // }, [canvas, gridRef, canvasHistory, setHistoryIndex, save]);

  useEffect(() => {
    if (isCanvasReady && canvas) {
      updateGridPosition();
      updateCanvasColor();
      updateGridColor();
      canvas.requestRenderAll();

      // 保存初始狀態
      save();
    }
  }, [
    isCanvasReady,
    canvas,
    updateGridPosition,
    updateCanvasColor,
    updateGridColor,
  ]);

  const design = useMemo(() => {
    if (canvas) {
      return buildDesign({
        canvas,
        save,
        undo,
        redo,
        canUndo,
        canRedo,
        saveToDatabase,
        isDrawingMode,
        setIsDrawingMode,
        startDrawWall,
        finishDrawWall,
        applyPattern,
        contextMenuPosition,
        handleContextMenuAction,
      });
    }

    return undefined;
  }, [
    canvas,
    save,
    undo,
    redo,
    canUndo,
    canRedo,
    saveToDatabase,
    isDrawingMode,
    setIsDrawingMode,
    startDrawWall,
    finishDrawWall,
    applyPattern,
    contextMenuPosition,
    handleContextMenuAction,
  ]);

  return { initCanvas, design };
};

export default useDesign;
