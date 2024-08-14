import { fabric } from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";
import { BoardType } from "@/types/BoardType";
import useDesign from "@/hooks/useDesign";
import DesignNavBar from "./DesignNavBar";
import LeftToolBar from "./LeftToolBar";
import { ActiveTool, Design } from "@/types/DesignType";
import MaterialsLibrary from "./MaterialsLibrary";
import SidePanel from "@/components/_UI/SidePanel";
import FurnitureLibrary from "./FurnitureLibrary";
import { Box, Divider } from "@chakra-ui/react";
import DrawWallSidePanel from "./DrawWallSidePanel";
import { useUpdateDesign } from "@/hooks/useUpdateDesign";

interface DesignEditorProps {
  board: BoardType;
  userId: string | undefined;
}

const toolsWithSidebar: ActiveTool[] = [
  "material",
  "furniture",
  "draw",
  "text",
];

const shouldOpenSidebar = (tool: ActiveTool) => toolsWithSidebar.includes(tool);

const DesignEditor = ({ board, userId }: DesignEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const { saveDesign, isUpdating, error } = useUpdateDesign({
    userId: userId as string,
    boardId: board.id,
  });

  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === activeTool) {
        setActiveTool("select");
        setIsSidePanelOpen(false);
      } else {
        setActiveTool(tool);
        setIsSidePanelOpen(shouldOpenSidebar(tool));
      }
    },
    [activeTool]
  );

  const closeSidePanel = useCallback(() => {
    setActiveTool("select");
    setIsSidePanelOpen(false);
  }, []);

  const { initCanvas, design } = useDesign({
    defaultState: board.fabricData,
    saveDesign,
  });

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const containerElement = containerRef.current;

    if (!canvasElement || !containerElement) {
      return;
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      preserveObjectStacking: true,
    });

    initCanvas({
      initialCanvas: canvas,
      initialContainer: containerRef.current!,
    });

    return () => {
      if (canvas) {
        canvas.dispose();
      }
    };
  }, [initCanvas]);

  return (
    <Box position="relative">
      <DesignNavBar
        design={design}
        boardId={board.id}
        boardName={board.fileName}
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
        saveDesign={saveDesign}
        isUpdating={isUpdating}
        error={error}
      />
      <LeftToolBar
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
        isSidePanelOpen={isSidePanelOpen}
      />
      <SidePanel isOpen={isSidePanelOpen}>
        {activeTool === "draw" && (
          <DrawWallSidePanel design={design} closeSidePanel={closeSidePanel} />
        )}
        {activeTool === "material" && (
          <MaterialsLibrary design={design} closeSidePanel={closeSidePanel} />
        )}
        {activeTool === "furniture" && (
          <FurnitureLibrary design={design} closeSidePanel={closeSidePanel} />
        )}
      </SidePanel>
      <Box
        w="100%"
        h="100vh"
        overflow="hidden"
        position="relative"
        ref={containerRef}
      >
        <canvas ref={canvasRef} style={{ zIndex: "0" }} />
      </Box>
    </Box>
  );
};

export default DesignEditor;
