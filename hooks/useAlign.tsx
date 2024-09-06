import { useCallback } from "react";
import { fabric } from "fabric";

interface UseAlignProps {
  canvas: fabric.Canvas | null;
}

const useAlign = ({ canvas }: UseAlignProps) => {
  const processAlign = useCallback(
    (alignType: string, activeObj: fabric.Object | fabric.ActiveSelection) => {
      if (!canvas) return;

      switch (alignType) {
        case "left":
          activeObj.set({ left: 0 });
          break;
        case "right":
          activeObj.set({
            left: canvas.width! - activeObj.width! * activeObj.scaleX!,
          });
          break;
        case "top":
          activeObj.set({ top: 0 });
          break;
        case "bottom":
          activeObj.set({
            top: canvas.height! - activeObj.height! * activeObj.scaleY!,
          });
          break;
        case "centerH":
          activeObj.set({
            left:
              canvas.width! / 2 - (activeObj.width! * activeObj.scaleX!) / 2,
          });
          break;
        case "centerV":
          activeObj.set({
            top:
              canvas.height! / 2 - (activeObj.height! * activeObj.scaleY!) / 2,
          });
          break;
      }

      activeObj.setCoords();
      canvas.renderAll();
    },
    [canvas]
  );

  const alignObjects = useCallback(
    (alignType: string) => {
      if (!canvas) return;
      const activeObj =
        canvas.getActiveObject() || canvas.getActiveObjects()[0];

      if (activeObj) {
        if (activeObj.type === "activeSelection") {
          // 如果是多選，對每個物件進行對齊
          const activeSelection = activeObj as fabric.ActiveSelection;
          activeSelection.forEachObject((obj) => {
            processAlign(alignType, obj);
          });
          activeSelection.setCoords();
        } else {
          // 單一物件對齊
          processAlign(alignType, activeObj);
        }
        canvas.requestRenderAll();
      } else {
        console.warn("No object selected");
      }
    },
    [canvas, processAlign]
  );

  const alignLeft = useCallback(() => alignObjects("left"), [alignObjects]);
  const alignRight = useCallback(() => alignObjects("right"), [alignObjects]);
  const alignTop = useCallback(() => alignObjects("top"), [alignObjects]);
  const alignBottom = useCallback(() => alignObjects("bottom"), [alignObjects]);
  const alignCenterHorizontally = useCallback(
    () => alignObjects("centerH"),
    [alignObjects]
  );
  const alignCenterVertically = useCallback(
    () => alignObjects("centerV"),
    [alignObjects]
  );

  // 簡單的水平和垂直分佈實現
  const distributeHorizontally = useCallback(() => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 3) return;

    const sortedObjects = activeObjects.sort((a, b) => a.left! - b.left!);
    const totalWidth =
      sortedObjects[sortedObjects.length - 1].left! - sortedObjects[0].left!;
    const gap = totalWidth / (sortedObjects.length - 1);

    for (let i = 1; i < sortedObjects.length - 1; i++) {
      sortedObjects[i].set({ left: sortedObjects[0].left! + gap * i });
    }
    canvas.requestRenderAll();
  }, [canvas]);

  const distributeVertically = useCallback(() => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 3) return;

    const sortedObjects = activeObjects.sort((a, b) => a.top! - b.top!);
    const totalHeight =
      sortedObjects[sortedObjects.length - 1].top! - sortedObjects[0].top!;
    const gap = totalHeight / (sortedObjects.length - 1);

    for (let i = 1; i < sortedObjects.length - 1; i++) {
      sortedObjects[i].set({ top: sortedObjects[0].top! + gap * i });
    }
    canvas.requestRenderAll();
  }, [canvas]);

  return {
    alignLeft,
    alignRight,
    alignTop,
    alignBottom,
    alignCenterHorizontally,
    alignCenterVertically,
    distributeHorizontally,
    distributeVertically,
  };
};

export default useAlign;
