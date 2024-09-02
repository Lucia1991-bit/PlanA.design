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
}

export const useContextMenu = ({
  canvas,
  copy,
  paste,
  deleteObjects,
  mirrorHorizontally,
  mirrorVertically,
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
      if (!canvas) {
        console.log("Canvas is null, cannot open context menu");
        return;
      }

      const activeObject = canvas.getActiveObject();
      console.log("Active object:", activeObject);

      let hasActiveObject = false;

      if (activeObject) {
        if (activeObject.type === "activeSelection") {
          const objects = (activeObject as fabric.ActiveSelection).getObjects();
          console.log("Active selection objects:", objects);
          hasActiveObject = objects.some((obj) => obj.name !== "room");
        } else {
          hasActiveObject = activeObject.name !== "room";
        }
      }

      console.log("Context menu state:", { hasActiveObject });

      setPosition({ x, y, hasActiveObject });
    },
    [canvas]
  );

  const close = useCallback(() => {
    setPosition(null);
  }, []);

  return { position, open, close, handleAction };
};
