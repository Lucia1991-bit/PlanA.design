import { create } from "zustand";
import { fabric } from "fabric";

interface CanvasState {
  canvas: fabric.Canvas | null;
  grid: fabric.Group | null;
  zoom: number;
  pan: { x: number; y: number };
  setCanvas: (canvas: fabric.Canvas | null) => void;
  setGrid: (grid: fabric.Group) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  addObject: (object: fabric.Object) => void;
}

const useCanvasStore = create<CanvasState>((set, get) => ({
  canvas: null,
  grid: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
  setCanvas: (canvas) => set({ canvas }),
  setGrid: (grid) => set({ grid }),
  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),
  addObject: (object) => {
    const { canvas } = get();
    if (canvas) {
      canvas.add(object);
      canvas.requestRenderAll();
    }
  },
}));

export default useCanvasStore;
