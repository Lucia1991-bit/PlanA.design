import { useState, useCallback } from "react";

interface ContextMenuPosition {
  x: number;
  y: number;
  hasActiveObject: boolean;
}

interface UseContextMenuProps {
  copy: () => void;
  paste: () => void;
  deleteObjects: () => void;
}

export const useContextMenu = ({
  copy,
  paste,
  deleteObjects,
}: UseContextMenuProps) => {
  const [position, setPosition] = useState<ContextMenuPosition | null>(null);

  const handleAction = useCallback(
    (action: "copy" | "paste" | "delete" | "close") => {
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
        case "close":
          setPosition(null);
          break;
      }
    },
    [copy, paste, deleteObjects]
  );

  const open = useCallback((x: number, y: number, hasActiveObject: boolean) => {
    setPosition({ x, y, hasActiveObject });
  }, []);

  const close = useCallback(() => {
    setPosition(null);
  }, []);

  return { position, open, close, handleAction };
};
