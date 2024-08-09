export const MAIN_GRID_SIZE = 200; //一大格200px = 100cm
export const SUB_GRID_SIZE = 20; //一小格20px = 10cm
export const MAX_ZOOM = 3; //讓初始網格範圍比視窗大，防止縮放平移時出現網格邊界
export const MIN_ZOOM = 0.7;
export const MAX_ZOOM_LEVEL = 4;
export const INTERACTION_DELAY = 300;

export interface DesignHookProps {
  defaultState?: string;
  // clearSelectionCallback?: () => void;
  // saveCallback?: (values: {
  //   json: string;
  //   height: number;
  //   width: number;
  // }) => void;
}

export type BuildEditorProps = {
  // undo: () => void;
  // redo: () => void;
  // save: (skip?: boolean) => void;
  // canUndo: () => boolean;
  // canRedo: () => boolean;
  // autoZoom: () => void;
  // copy: () => void;
  // paste: () => void;
  // canvas: fabric.Canvas;
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
