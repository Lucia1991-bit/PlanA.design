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
import { useCanvasOrdering } from "./useCanvasOrdering";
import { useExport } from "./useExport";

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
  canMoveUp,
  canMoveDown,
  bringForward,
  sendBackward,
  paperSize,
  isExportMode,
  isExportLoading,
  getViewportDimensions,
  adjustToNewPaperSize,
  handleExport,
  cancelExport,
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

  //群組物件
  const groupSelectedObjects = () => {
    if (!canvas) return;
    const activeSelection = canvas.getActiveObject() as fabric.ActiveSelection;
    if (!activeSelection || activeSelection.type !== "activeSelection") {
      console.warn("No multiple selection to group");
      return;
    }

    // 創建群組
    const group = activeSelection.toGroup();
    canvas.setActiveObject(group);

    canvas.requestRenderAll();
  };

  //解除群組
  const ungroupSelectedObjects = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject() as fabric.Group;
    if (!activeObject || activeObject.type !== "group") {
      console.warn("Selected object is not a group");
      return;
    }

    // 解散群組
    activeObject.toActiveSelection();
    canvas.requestRenderAll();
  };

  // 檢查是否可以群組
  const canGroup = () => {
    if (!canvas) return false;
    const activeObject = canvas.getActiveObject();

    if (activeObject && activeObject.type === "activeSelection") {
      // 檢查 activeSelection 中的物件數量
      const selectedObjects = (
        activeObject as fabric.ActiveSelection
      ).getObjects();
      return selectedObjects.length > 1;
    }

    // 如果不是 activeSelection，檢查是否有多個物件被選中
    const selectedObjects = canvas.getActiveObjects();
    return selectedObjects.length > 1;
  };

  // 檢查是否可以解散群組
  const canUngroup = () => {
    if (!canvas) return false;
    const activeObject = canvas.getActiveObject();
    return !!(activeObject && activeObject.type === "group");
  };

  //鎖定物件
  const lockObjects = () => {
    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach((obj) => {
      if (obj.name !== "designGrid" && obj.name !== "wallGroup") {
        if (obj.name === "room") {
          // 對於 room 物件，只鎖定移動
          obj.set({
            lockMovementX: true,
            lockMovementY: true,
            selectable: false,
            evented: false,
          });
        } else {
          // 對於其他物件，完全鎖定
          obj.set({
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
            selectable: false,
            evented: false,
          });
        }
      }
    });
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    save();
  };

  //解鎖物件
  const unlockObjects = () => {
    canvas.getObjects().forEach((obj) => {
      // 檢查是否是特殊物件
      if (obj.name === "designGrid" || obj.name === "wallGroup") {
        // 不改變這些物件的屬性
        return;
      }

      if (obj.name === "room") {
        // 對於 room 物件，只解鎖移動，保留其他特殊屬性
        obj.set({
          lockMovementX: false,
          lockMovementY: false,
          selectable: true,
          evented: true,
          // 保留其他特殊屬性
          hasControls: false,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
        });
      } else if (obj.lockMovementX && obj.lockMovementY) {
        // 對於其他被鎖定的物件，完全解鎖
        obj.set({
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          hasControls: true,
          selectable: true,
          evented: true,
        });
      }
    });
    canvas.requestRenderAll();
    save();
  };

  //是否可以鎖定
  const canLock = () => {
    return canvas
      .getActiveObjects()
      .some(
        (obj) =>
          obj.name !== "designGrid" &&
          obj.name !== "wallGroup" &&
          !obj.lockMovementX &&
          !obj.lockMovementY
      );
  };

  //畫布上是否有可以解除鎖定的物件
  const hasLockedObjects = () => {
    return canvas
      .getObjects()
      .some(
        (obj) =>
          obj.name !== "designGrid" &&
          obj.name !== "wallGroup" &&
          (obj.lockMovementX || obj.lockMovementY)
      );
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
    // addDoorWindow: (imageUrl: string) => {
    //   fabric.loadSVGFromURL(imageUrl, (objects, options) => {
    //     const svg = fabric.util.groupSVGElements(objects, options);
    //     svg.scale(1.9);
    //     svg.objectCaching = false;
    //     centerObjectOnCanvas(canvas, svg);
    //     canvas.add(svg);
    //     canvas.setActiveObject(svg);
    //     canvas.renderAll();
    //   });
    // },
    addDoorWindow: (imageUrl: string) => {
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
    canMoveUp,
    canMoveDown,
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
    bringForward,
    sendBackward,
    paperSize,
    isExportMode,
    isExportLoading,
    getViewportDimensions,
    adjustToNewPaperSize,
    handleExport,
    cancelExport,
    groupSelectedObjects,
    ungroupSelectedObjects,
    canGroup,
    canUngroup,
    lockObjects,
    unlockObjects,
    canLock,
    hasLockedObjects,
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

  //管理繪圖模式(useHistory也會使用所以提取出來)
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  //管理畫布平移模式
  const [isPanMode, setIsPanMode] = useState(false);

  //保存未完成的牆體(結束繪製時形成的連續牆體)
  const [unfinishedWall, setUnfinishedWall] = useState<fabric.Object | null>(
    null
  );
  const unfinishedWallRef = useRef<fabric.Object | null>(null);
  //保存繪製的所有原本的獨立牆體
  const [completedWalls, setCompletedWalls] = useState<fabric.Object[]>([]);
  const completedWallsRef = useRef<fabric.Object[]>([]);

  //Pattern相關狀態
  const [canvasLayers, setCanvasLayers] = useState<CanvasLayer[]>([]);
  const [imageResources, setImageResources] = useState<Record<string, string>>(
    {}
  );
  const { designColorMode } = useDesignColorMode();

  //獲取 light模式及dark模式顏色
  const color = useDesignColor();

  //改變 unfinishedWall的狀態
  const memoizedSetUnfinishedWall = useCallback(
    (wall: fabric.Object | null) => {
      setUnfinishedWall(wall);
      unfinishedWallRef.current = wall;
    },
    []
  );

  // 改變 completedWalls 的狀態
  const memoizedSetCompletedWalls = useCallback(
    (
      wallsOrUpdater:
        | fabric.Object[]
        | ((prev: fabric.Object[]) => fabric.Object[])
    ) => {
      setCompletedWalls((prevWalls) => {
        let newWalls: fabric.Object[];

        if (typeof wallsOrUpdater === "function") {
          newWalls = wallsOrUpdater(prevWalls);
        } else {
          newWalls = wallsOrUpdater;
        }

        completedWallsRef.current = newWalls;
        return newWalls;
      });
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
    unfinishedWall: unfinishedWallRef,
    setUnfinishedWall: memoizedSetUnfinishedWall,
    completedWalls: completedWallsRef,
    setCompletedWalls: memoizedSetCompletedWalls,
    isDrawingMode,
  });

  //材質 pattern
  const { applyPattern, adjustPatternScale } = usePattern({ canvas, save });

  //繪製牆體
  const { startDrawWall, startDrawing, draw, finishDrawWall } = useDrawWall({
    canvas,
    gridRef,
    isDrawingMode,
    setIsDrawingMode,
    save,
    updateGridColor,
    applyPattern,
    adjustPatternScale,
    unfinishedWall: unfinishedWallRef,
    setUnfinishedWall: memoizedSetUnfinishedWall,
    completedWalls: completedWallsRef,
    setCompletedWalls: memoizedSetCompletedWalls,
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
    isPanMode,
    isDrawingMode,
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

  //處理物件順序
  const {
    canMoveUp,
    canMoveDown,
    bringForward,
    sendBackward,
    updateMoveStatus,
    ensureDesignElementsAtBottom,
  } = useCanvasOrdering({
    canvas,
    gridRef,
    updateGridColor,
  });

  //處理畫布事件
  useCanvasEvents({
    canvas,
    isPanMode,
    setIsPanMode,
    isDrawingMode,
    onStartDrawing: startDrawing,
    onDrawing: draw,
    save,
    setSelectedObjects,
    openContextMenu,
    closeContextMenu,
    updateMoveStatus,
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
    startDrawWall,
    finishDrawWall,
    undo,
    redo,
    saveToDatabase,
  });

  //處理檔案匯出成圖檔
  const {
    paperSize,
    isExportMode,
    isExportLoading,
    getViewportDimensions,
    adjustToNewPaperSize,
    handleExport,
    cancelExport,
  } = useExport({
    canvas,
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

    // 重新渲染畫布
    canvas.renderAll();

    // 保存當前狀態
    save();

    console.log("畫布已清空（保留網格）");
  }, [
    canvas,
    gridRef,
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
        canMoveUp,
        canMoveDown,
        bringForward,
        sendBackward,
        paperSize,
        isExportMode,
        isExportLoading,
        getViewportDimensions,
        adjustToNewPaperSize,
        handleExport,
        cancelExport,
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
    canMoveUp,
    canMoveDown,
    bringForward,
    sendBackward,
    paperSize,
    isExportMode,
    isExportLoading,
    getViewportDimensions,
    adjustToNewPaperSize,
    handleExport,
    cancelExport,
  ]);

  return { initCanvas, design };
};

export default useDesign;
