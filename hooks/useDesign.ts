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
  CanvasLayer,
} from "@/types/DesignType";
import useDesignColor from "./useDesignPageColor";
import useCanvasEvents from "./useCanvasEvents";
import useAutoResize from "./useAutoResize";
import { useDesignColorMode } from "@/context/colorModeContext";
import { useHotkeys } from "@/hooks/useHotkeys";
import { useClipboard } from "@/hooks/useClipboard";
import { useHistory } from "./useHistory";
import { useLoadDesign } from "./useLoadDesign";
import { useDrawWall } from "./useDrawWall";
import { usePattern } from "./usePattern";
import { useContextMenu } from "./useContextMenu";

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
  isPanMode,
  togglePanMode,
  applyPattern,
  contextMenuPosition,
  handleContextMenuAction,
  canCopy,
  canPaste,
  clearCanvas,
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
    isPanMode,
    togglePanMode,
    applyPattern,
    contextMenuPosition,
    handleContextMenuAction,
    canCopy,
    canPaste,
    clearCanvas,
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
  //保存未完成的牆體
  const [unfinishedWall, setUnfinishedWall] = useState<fabric.Object | null>(
    null
  );
  const unfinishedWallRef = useRef<fabric.Object | null>(null);

  //Pattern相關狀態
  const [canvasLayers, setCanvasLayers] = useState<CanvasLayer[]>([]);
  const [imageResources, setImageResources] = useState<Record<string, string>>(
    {}
  );

  // const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
  // const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);

  const { designColorMode } = useDesignColorMode();

  //獲取 light模式及dark模式顏色
  const color = useDesignColor();

  //改變 unfinishedWall的狀態
  const memoizedSetUnfinishedWall = useCallback(
    (wall: fabric.Object | null) => {
      console.log("設置 unfinishedWall:", wall);
      setUnfinishedWall(wall);
      unfinishedWallRef.current = wall;
    },
    []
  );

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

  //更新網格線顏色
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

    canvas.requestRenderAll();
  }, [canvas, color.canvas.mainGridColor, color.canvas.subGridColor]);

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
    initializeCanvasState,
  } = useHistory({
    canvas,
    gridRef,
    updateGridColor,
    updateGridPosition,
    saveDesign,
    canvasLayers,
    setCanvasLayers,
    imageResources,
    setImageResources,
    // unfinishedWallRef,
    // setUnfinishedWall: memoizedSetUnfinishedWall,
  });

  //材質 pattern
  const { applyPattern, adjustPatternScale } = usePattern({ canvas, save });

  //繪製牆體
  const {
    isDrawingMode,
    setIsDrawingMode,
    startDrawWall,
    startDrawing,
    draw,
    finishDrawWall,
  } = useDrawWall({
    canvas,
    gridRef,
    save,
    updateGridColor,
    applyPattern,
    adjustPatternScale,
    unfinishedWall: unfinishedWallRef,
    setUnfinishedWall: memoizedSetUnfinishedWall,
  });

  //畫布的物件互動操作
  const {
    copy,
    paste,
    canCopy,
    canPaste,
    deleteObjects,
    mirrorHorizontally,
    mirrorVertically,
  } = useClipboard({
    canvas,
  });

  //管理物件選單操作
  const {
    position: contextMenuPosition,
    open: openContextMenu,
    close: closeContextMenu,
    handleAction: handleContextMenuAction,
  } = useContextMenu({
    canvas,
    copy,
    paste,
    deleteObjects,
    mirrorHorizontally,
    mirrorVertically,
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
  useLoadDesign({
    canvas,
    initialState: useRef(initialState.current),
    initializeCanvasState,
    canvasHistory,
    setHistoryIndex,
    gridRef,
    updateGridColor,
    updateGridPosition,
    setCanvasLayers,
    setImageResources,
  });

  //處理畫布事件
  const { isPanMode, setIsPanMode } = useCanvasEvents({
    canvas,
    isDrawingMode,
    onStartDrawing: startDrawing,
    onDrawing: draw,
    save,
    setSelectedObjects,
    openContextMenu,
    closeContextMenu,
  });

  //管理平移模式與繪圖模式之間的切換
  const togglePanMode = useCallback(() => {
    setIsPanMode((prev) => !prev);
    if (isDrawingMode) {
      setIsDrawingMode(false);
    }
  }, [isDrawingMode, setIsDrawingMode, setIsPanMode]);

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
      initialCanvas.setBackgroundColor("transparent", () => {
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

      initializeCanvasState();
    },
    [createGrid]
  );

  // 清空畫布
  const clearCanvas = useCallback(() => {
    if (!canvas || !gridRef.current) return;

    // 獲取所有不是網格的對象
    const objectsToRemove = canvas
      .getObjects()
      .filter((obj) => obj !== gridRef.current);

    // 刪除這些對象
    canvas.remove(...objectsToRemove);

    // 重置相關狀態
    setSelectedObjects([]);
    setUnfinishedWall(null);
    unfinishedWallRef.current = null;
    setCanvasLayers([]);
    setImageResources({});

    // 更新網格位置和顏色
    updateGridPosition();
    updateGridColor();

    // 重新渲染畫布
    canvas.renderAll();

    // 保存當前狀態
    save();

    console.log("畫布已清空（保留網格）");
  }, [
    canvas,
    gridRef,
    updateGridPosition,
    updateGridColor,
    save,
    setSelectedObjects,
    setUnfinishedWall,
    setCanvasLayers,
    setImageResources,
  ]);

  useEffect(() => {
    if (isCanvasReady && canvas) {
      updateGridPosition();
      updateGridColor();
      canvas.requestRenderAll();

      // 保存初始狀態
      save();
    }
  }, [isCanvasReady, canvas, updateGridPosition, updateGridColor]);

  useEffect(() => {
    console.log("useDesign 中的 unfinishedWall 變化:", unfinishedWall);
    unfinishedWallRef.current = unfinishedWall;
  }, [unfinishedWall]);

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
        isPanMode,
        togglePanMode,
        startDrawWall,
        finishDrawWall,
        applyPattern,
        contextMenuPosition,
        handleContextMenuAction,
        canCopy,
        canPaste,
        clearCanvas,
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
    isPanMode,
    togglePanMode,
    startDrawWall,
    finishDrawWall,
    applyPattern,
    contextMenuPosition,
    handleContextMenuAction,
    canCopy,
    canPaste,
    clearCanvas,
  ]);

  return { initCanvas, design };
};

export default useDesign;
