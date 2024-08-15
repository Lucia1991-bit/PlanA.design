import { useCallback } from "react";
import { useEvent } from "react-use";

interface UseHotkeysProps {
  canvas: fabric.Canvas | null;
  copy: () => void;
  paste: () => void;
  deleteObjects: () => void;
  isDrawingMode: boolean;
  finishDrawWall: () => void;
}

export const useHotkeys = ({
  canvas,
  copy,
  paste,
  deleteObjects,
  isDrawingMode,
  finishDrawWall,
}: UseHotkeysProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isCtrlKey = event.ctrlKey || event.metaKey;
      const isDeleteKey = event.key === "Delete" || event.key === "Backspace";
      const isInput = ["INPUT", "TEXTAREA"].includes(
        (event.target as HTMLElement).tagName
      );

      if (isInput) return;

      if (event.key === "Escape") {
        if (isDrawingMode) {
          event.preventDefault();
          console.log("快捷鍵結束繪製");
          finishDrawWall();
        }
        return;
      }

      if (isDeleteKey && canvas) {
        event.preventDefault();
        deleteObjects();
      }

      if (isCtrlKey && event.key === "c" && canvas) {
        event.preventDefault();
        copy();
      }

      if (isCtrlKey && event.key === "v" && canvas) {
        event.preventDefault();
        paste();
      }
    },
    [canvas, copy, paste, deleteObjects, isDrawingMode, finishDrawWall]
  );

  useEvent("keydown", handleKeyDown);
};
