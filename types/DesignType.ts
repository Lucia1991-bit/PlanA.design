import { PatternOptions } from "@/hooks/usePattern";

export const MAIN_GRID_SIZE = 200; //一大格200px = 100cm
export const SUB_GRID_SIZE = 20; //一小格20px = 10cm
export const MAX_ZOOM = 3; //讓初始網格範圍比視窗大，防止縮放平移時出現網格邊界
export const MIN_ZOOM = 0.6;
export const MAX_ZOOM_LEVEL = 3;
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

export interface DesignHookProps {
  defaultState?: string;
  saveDesign: (fabricData: string) => Promise<void>;
  // clearSelectionCallback?: () => void;
  // saveCallback?: (values: {
  //   json: string;
  //   height: number;
  //   width: number;
  // }) => void;
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
  // autoZoom: () => void;
  // copy: () => void;
  // paste: () => void;
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
  // fillColor: string;
  // strokeColor: string;
  // strokeWidth: number;
  // selectedObjects: fabric.Object[];
  // strokeDashArray: number[];
  // fontFamily: string;
  // setStrokeDashArray: (value: number[]) => void;
  // setFillColor: (value: string) => void;
  // setStrokeColor: (value: string) => void;
  // setStrokeWidth: (value: number) => void;
  // setFontFamily: (value: string) => void;
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
  // autoZoom: () => void;
  // zoomIn: () => void;
  // zoomOut: () => void;
  // getWorkspace: () => fabric.Object | undefined;
  // changeBackground: (value: string) => void;
  // changeSize: (value: { width: number; height: number }) => void;
  // enableDrawingMode: () => void;
  // disableDrawingMode: () => void;
  // onCopy: () => void;
  // onPaste: () => void;
  // changeImageFilter: (value: string) => void;
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
  // addPatternPath: (imageUrl: string) => void;
  // delete: () => void;
  // changeFontSize: (value: number) => void;
  // getActiveFontSize: () => number;
  // changeTextAlign: (value: string) => void;
  // getActiveTextAlign: () => string;
  // changeFontUnderline: (value: boolean) => void;
  // getActiveFontUnderline: () => boolean;
  // changeFontLinethrough: (value: boolean) => void;
  // getActiveFontLinethrough: () => boolean;
  // changeFontStyle: (value: string) => void;
  // getActiveFontStyle: () => string;
  // changeFontWeight: (value: number) => void;
  // getActiveFontWeight: () => number;
  // getActiveFontFamily: () => string;
  // changeFontFamily: (value: string) => void;
  // addText: (value: string, options?: ITextboxOptions) => void;
  // getActiveOpacity: () => number;
  // changeOpacity: (value: number) => void;
  // bringForward: () => void;
  // sendBackwards: () => void;
  // changeStrokeWidth: (value: number) => void;
  // changeFillColor: (value: string) => void;
  // changeStrokeColor: (value: string) => void;
  // changeStrokeDashArray: (value: number[]) => void;
  // addCircle: () => void;
  // addSoftRectangle: () => void;
  // addRectangle: () => void;
  // addTriangle: () => void;
  // addInverseTriangle: () => void;
  // addDiamond: () => void;
  canvas: fabric.Canvas;
  // getActiveFillColor: () => string;
  // getActiveStrokeColor: () => string;
  // getActiveStrokeWidth: () => number;
  // getActiveStrokeDashArray: () => number[];
  // selectedObjects: fabric.Object[];
}
