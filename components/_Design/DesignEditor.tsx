import { fabric } from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";
import useCanvasStore from "@/stores/useCanvasStore";
import useDesignColor from "@/hooks/useDesignColor";
import { BoardType } from "@/types/BoardType";
import useDesign from "@/hooks/useDesign";
import DesignNavBar from "./DesignNavBar";
import TopToolBar from "./TopToolBar";
import LeftToolBar from "./LeftToolBar";

interface DesignEditorProps {
  board: BoardType;
}

const DesignEditor = ({ board }: DesignEditorProps) => {
  //Canvas相關 Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // const [activeTool, setActiveTool] = useState<ActiveTool>("select");

  // const onChangeActiveTool = useCallback(
  //   (tool: ActiveTool) => {
  //     if (tool === "draw") {
  //       editor?.enableDrawingMode();
  //     }

  //     if (activeTool === "draw") {
  //       editor?.disableDrawingMode();
  //     }

  //     if (tool === activeTool) {
  //       return setActiveTool("select");
  //     }

  //     setActiveTool(tool);
  //   },
  //   [activeTool, editor]
  // );

  //設計專案的存檔資料
  const initialData = board.fabricData;

  const { initCanvas, design } = useDesign({
    defaultState: initialData,
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      preserveObjectStacking: true,
    });

    initCanvas({ initialCanvas: canvas });

    return () => {
      canvas.dispose();
    };
  }, [initCanvas]);
  return (
    <>
      <DesignNavBar />
      <TopToolBar />
      <LeftToolBar />
      <canvas ref={canvasRef} style={{ zIndex: "0" }} />
    </>
  );
};

export default DesignEditor;
