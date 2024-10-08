import { fabric } from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Divider } from "@chakra-ui/react";
import useDesign from "@/hooks/useDesign";
import { useUpdateDesign } from "@/hooks/useUpdateDesign";
import DesignNavBar from "./DesignNavBar";
import LeftToolBar from "./LeftToolBar";
import MaterialsLibrary from "./MaterialsLibrary";
import SidePanel from "@/components/ui/SidePanel";
import FurnitureLibrary from "./FurnitureLibrary";
import DrawWallSidePanel from "./DrawWallSidePanel";
import { ActiveTool, Design } from "@/types/DesignType";
import { BoardType } from "@/types/BoardType";
import ContextMenu from "./ContextMenu";
import useDesignPageColor from "@/hooks/useDesignPageColor";
import ExportSidePanel from "./ExportSidePanel";
import { de } from "date-fns/locale";

interface DesignEditorProps {
  board: BoardType;
  userId: string | undefined;
}

const toolsWithSidebar: ActiveTool[] = [
  "material",
  "furniture",
  "draw",
  "export",
];

const shouldOpenSidebar = (tool: ActiveTool) => toolsWithSidebar.includes(tool);

const DesignEditor = ({ board, userId }: DesignEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const { saveDesign, isUpdating, error, hasSaved } = useUpdateDesign({
    userId: userId as string,
    boardId: board.id,
  });

  const color = useDesignPageColor();

  const { initCanvas, design } = useDesign({
    defaultState: board.fabricData,
    saveDesign,
  });

  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === activeTool) {
        setActiveTool("select");
        setIsSidePanelOpen(false);
        if (design?.isPanMode) {
          design.togglePanMode();
        }
      } else {
        setActiveTool(tool);
        setIsSidePanelOpen(shouldOpenSidebar(tool));
        if (tool === "pan") {
          design?.togglePanMode();
        } else if (design?.isPanMode) {
          design.togglePanMode();
        }
      }
    },
    [activeTool, design]
  );

  const closeSidePanel = useCallback(() => {
    setActiveTool("select");
    setIsSidePanelOpen(false);
  }, []);

  //防止按右鍵的預設行為
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Default context menu prevented in DesignEditor");
  }, []);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const containerElement = containerRef.current;

    if (!canvasElement || !containerElement) {
      return;
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: true,
      selection: false, // 禁用多重選擇
      selectionBorderColor: "transparent", // 使選擇邊框透明
      selectionLineWidth: 0, // 選擇線寬度為0
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

  // if (design?.isExportLoading) {
  //   return <LogoLoadingPage text="Exporting..." />;
  // }

  return (
    <>
      <Box
        position="relative"
        width="100%"
        height="100vh"
        overflow="hidden"
        bg={color.canvas.backgroundColor}
      >
        <DesignNavBar
          design={design}
          boardId={board.id}
          boardName={board.fileName}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          saveDesign={saveDesign}
          isUpdating={isUpdating}
          error={error}
          hasSaved={hasSaved}
        />
        <LeftToolBar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          isSidePanelOpen={isSidePanelOpen}
        />
        <SidePanel isOpen={isSidePanelOpen}>
          {activeTool === "draw" && (
            <DrawWallSidePanel
              design={design}
              closeSidePanel={closeSidePanel}
            />
          )}
          {activeTool === "material" && (
            <MaterialsLibrary design={design} closeSidePanel={closeSidePanel} />
          )}
          {activeTool === "furniture" && (
            <FurnitureLibrary design={design} closeSidePanel={closeSidePanel} />
          )}
          {activeTool === "export" && (
            <ExportSidePanel design={design} closeSidePanel={closeSidePanel} />
          )}
        </SidePanel>
        <Box
          w="100%"
          h="100vh"
          overflow="hidden"
          position="relative"
          ref={containerRef}
          onContextMenu={handleContextMenu}
        >
          <canvas ref={canvasRef} style={{ zIndex: "0" }} />
          {/* {design?.isExportMode && (
          <Box
            id="export-viewport"
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            width={`${design.getViewportDimensions().width}px`}
            height={`${design.getViewportDimensions().height}px`}
            border="2px dashed red"
            pointerEvents="none"
            zIndex="1"
          />
        )} */}
          {design?.contextMenuPosition && (
            <ContextMenu
              x={design.contextMenuPosition.x}
              y={design.contextMenuPosition.y}
              hasActiveObject={design.contextMenuPosition.hasActiveObject}
              canCopy={design.canCopy}
              canPaste={design.canPaste}
              onClose={() => design.handleContextMenuAction("close")}
              onCopy={() => design.handleContextMenuAction("copy")}
              onPaste={() => design.handleContextMenuAction("paste")}
              onDelete={() => design.handleContextMenuAction("delete")}
              onMirrorHorizontally={() =>
                design.handleContextMenuAction("mirrorHorizontally")
              }
              onMirrorVertically={() =>
                design.handleContextMenuAction("mirrorVertically")
              }
              canMoveUp={design.canMoveUp}
              canMoveDown={design.canMoveDown}
              onBringForward={() => design.bringForward()}
              onSendBackwards={() => design.sendBackward()}
              onGroupSelectedObjects={() => design.groupSelectedObjects()}
              onUngroupSelectedObjects={() => design.ungroupSelectedObjects()}
              canGroup={design.canGroup}
              canUngroup={design.canUngroup}
              onLockObjects={() => design.lockObjects()}
              onUnlockObjects={() => design.unlockObjects()}
              canLock={design.canLock}
              hasLockedObjects={design.hasLockedObjects}
            />
          )}
        </Box>
      </Box>
    </>
  );
};

export default DesignEditor;
