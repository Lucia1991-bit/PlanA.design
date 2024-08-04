import { create } from "zustand";
import * as fabric from "fabric";
import { BoardType } from "@/types/BoardType";

interface CanvasState {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;
}

const useCanvasStore = create<CanvasState>((set) => ({
  canvas: null,
  isCanvasReady: false,
  setCanvas: (canvas) => set({ canvas }),
}));

export default useCanvasStore;
