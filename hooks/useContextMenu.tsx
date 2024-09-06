import { useState, useCallback } from "react";

interface ContextMenuPosition {
  x: number;
  y: number;
  hasActiveObject: boolean;
}

interface UseContextMenuProps {
  canvas: fabric.Canvas | null;
  copy: () => void;
  paste: () => void;
  deleteObjects: () => void;
  mirrorHorizontally: () => void;
  mirrorVertically: () => void;
  isPanMode: boolean;
  isDrawingMode: boolean;
}

export const useContextMenu = ({
  canvas,
  copy,
  paste,
  deleteObjects,
  mirrorHorizontally,
  mirrorVertically,
  isPanMode,
  isDrawingMode,
}: UseContextMenuProps) => {
  const [position, setPosition] = useState<ContextMenuPosition | null>(null);

  const handleAction = useCallback(
    (
      action:
        | "copy"
        | "paste"
        | "delete"
        | "close"
        | "mirrorHorizontally"
        | "mirrorVertically"
    ) => {
      switch (action) {
        case "copy":
          copy();
          break;
        case "paste":
          paste();
          break;
        case "delete":
          deleteObjects();
          break;
        case "mirrorHorizontally":
          mirrorHorizontally();
          break;
        case "mirrorVertically":
          mirrorVertically();
          break;
        case "close":
          setPosition(null);
          break;
      }
    },
    [copy, paste, deleteObjects, mirrorHorizontally, mirrorVertically]
  );

  const open = useCallback(
    (x: number, y: number) => {
      //如果是平移模式或者繪製模式，不可打開右鍵選單
      if (!canvas || isPanMode || isDrawingMode) {
        return;
      }

      const activeObject = canvas.getActiveObject();
      const hasActiveObject = !!activeObject;

      if (activeObject && activeObject.type === "activeSelection") {
        const objects = (activeObject as fabric.ActiveSelection).getObjects();
        console.log("Active selection objects:", objects);
      }

      setPosition({ x, y, hasActiveObject });
    },
    [canvas, isDrawingMode, isPanMode]
  );

  const close = useCallback(() => {
    setPosition(null);
  }, []);

  return { position, open, close, handleAction };
};
