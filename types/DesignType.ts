import { PatternOptions } from "@/hooks/usePattern";

export const MAIN_GRID_SIZE = 200; //一大格200px = 100cm
export const SUB_GRID_SIZE = 20; //一小格20px = 10cm
export const MAX_ZOOM = 5; //讓初始網格範圍比視窗大，防止縮放平移時出現網格邊界
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM_LEVEL = 5;
export const INTERACTION_DELAY = 300;

//整體縮放比例
export const GLOBAL_SCALE = 0.4;

//canvas物件狀態
export const OBJECT_STATE = [
  "name",
  "gradientAngle",
  "selectable",
  "hasControls",
  "linkData",
  "editable",
  "extensionType",
  "extension",
  "left",
  "top",
  "width",
  "height",
  "scaleX",
  "scaleY",
  "angle",
  "strokeWidth",
  "strokeUniform",
  "fill",
  "opacity",
  "visible",
  "clipTo",
  "transformMatrix",
  "objectCaching",
  "evented",
  "originX",
  "originY",
  // 新增的屬性
  "lockMovementX",
  "lockMovementY",
  "lockRotation",
  "lockScalingX",
  "lockScalingY",
  "hasBorders",
  "cornerColor",
  "cornerStyle",
  "borderColor",
  "borderScaleFactor",
  "transparentCorners",
  "borderOpacityWhenMoving",
  "cornerStrokeColor",
  "patternTransform",
  "patternSourceType",
  "source", // 這對於 Pattern 很重要
  "repeat",
  "subTargetCheck",
  "lockUniScaling",
  "id",
];

export const selectionDependentTools = [
  "fill",
  "font",
  "filter",
  "opacity",
  "remove-bg",
  "stroke-color",
  "stroke-width",
];

export type ActiveTool =
  | "select"
  | "wall"
  | "text"
  | "material"
  | "furniture"
  | "draw"
  | "door"
  | "window"
  | "pan"
  | "export"
  | "fill"
  | "stroke-color"
  | "stroke-width"
  | "font"
  | "opacity"
  | "filter"
  | "settings";

//右鍵選單的位置
export type ContextMenuPosition = {
  x: number;
  y: number;
};

//Pattern相關狀態
export type CanvasLayer = {
  index: number;
  pattern: {
    sourceId: string;
    repeat: string;
    scaleX: number;
    scaleY: number;
  };
};

//export圖檔相關
export type PaperSize = "A4" | "A3";

export interface DesignHookProps {
  defaultState?: string;
  saveDesign: (fabricData: string) => Promise<void>;
}

export type BuildDesignProps = {
  undo: () => void;
  redo: () => void;
  save: (skip?: boolean) => void;
  saveToDatabase: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  isDrawingMode: boolean;
  setIsDrawingMode: (mode: boolean) => void;
  startDrawWall: () => void;
  finishDrawWall: () => void;
  isPanMode: boolean;
  togglePanMode: () => void;
  applyPattern: (
    object: fabric.Object,
    imageUrl: string,
    options?: PatternOptions
  ) => void;
  canvas: fabric.Canvas;
  contextMenuPosition: {
    x: number;
    y: number;
    hasActiveObject: boolean;
  } | null;
  handleContextMenuAction: (
    action:
      | "copy"
      | "paste"
      | "delete"
      | "close"
      | "mirrorHorizontally"
      | "mirrorVertically"
  ) => void;
  canCopy: () => boolean;
  canPaste: () => boolean;
  clearCanvas: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  bringForward: () => void;
  sendBackward: () => void;
  paperSize: PaperSize;
  isExportMode: boolean;
  isExportLoading: boolean;
  getViewportDimensions: () => { width: number; height: number };
  adjustToNewPaperSize: (newSize: PaperSize) => void;
  handleExport: () => void;
  cancelExport: () => void;
};

export interface Design {
  // savePng: () => void;
  // saveJpg: () => void;
  // saveSvg: () => void;
  // saveJson: () => void;
  // loadJson: (json: string) => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  isDrawingMode: boolean;
  setIsDrawingMode: (mode: boolean) => void;
  startDrawWall: () => void;
  finishDrawWall: () => void;
  isPanMode: boolean;
  togglePanMode: () => void;
  addFurniture: (imageUrl: string) => void;
  addDoorWindow: (imageUrl: string) => void;
  applyPattern: (
    object: fabric.Object,
    imageUrl: string,
    options?: PatternOptions
  ) => void;
  contextMenuPosition: {
    x: number;
    y: number;
    hasActiveObject: boolean;
  } | null;
  handleContextMenuAction: (
    action:
      | "copy"
      | "paste"
      | "delete"
      | "close"
      | "mirrorHorizontally"
      | "mirrorVertically"
  ) => void;
  canCopy: () => boolean;
  canPaste: () => boolean;
  clearCanvas: () => void;
  canvas: fabric.Canvas;
  canMoveUp: boolean;
  canMoveDown: boolean;
  bringForward: () => void;
  sendBackward: () => void;
  paperSize: PaperSize;
  isExportMode: boolean;
  isExportLoading: boolean;
  getViewportDimensions: () => { width: number; height: number };
  adjustToNewPaperSize: (newSize: PaperSize) => void;
  handleExport: () => void;
  cancelExport: () => void;
  groupSelectedObjects: () => void;
  ungroupSelectedObjects: () => void;
  canGroup: () => boolean;
  canUngroup: () => boolean;
  lockObjects: () => void;
  unlockObjects: () => void;
  canLock: () => boolean;
  hasLockedObjects: () => boolean;
}
