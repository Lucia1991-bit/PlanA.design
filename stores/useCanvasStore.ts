import { create } from "zustand";
import * as fabric from "fabric";

interface CanvasState {
  canvas: fabric.Canvas | null;
  grid: fabric.Group | null;
  zoom: number;
  pan: { x: number; y: number };
  setCanvas: (canvas: fabric.Canvas | null) => void;
  setGrid: (grid: fabric.Group) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  updateGridPosition: () => void;
  recreateGrid: () => void;
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
  //更新網格線在畫布的位置，使其居中
  updateGridPosition: () => {
    const { canvas, grid, zoom } = get();
    if (canvas && grid) {
      const vpt = canvas.viewportTransform;
      if (vpt) {
        grid.set({
          left: (canvas.getWidth() / 2 - vpt[4]) / zoom,
          top: (canvas.getHeight() / 2 - vpt[5]) / zoom,
        });
        grid.setCoords();
        canvas.requestRenderAll();
      }
    }
  },
  //重新創建網格線(使用在視窗縮放時)
  recreateGrid: () => {
    const { canvas, grid } = get();
    if (canvas) {
      if (grid) {
        canvas.remove(grid);
      }
      const newGrid = createGrid(canvas.getWidth(), canvas.getHeight());
      canvas.add(newGrid);
      set({ grid: newGrid });
      get().updateGridPosition();
    }
  },
}));

export default useCanvasStore;
