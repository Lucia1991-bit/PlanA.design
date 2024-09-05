import React from "react";
import { VStack } from "@chakra-ui/react";
import useDesignPageColor from "@/hooks/useDesignPageColor";
import { ActiveTool } from "@/types/DesignType";
import LeftToolBarItem from "./LeftToolBarItem";

interface LeftToolBarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  isSidePanelOpen: boolean;
}

const LeftToolBar = ({
  activeTool,
  onChangeActiveTool,
  isSidePanelOpen,
}: LeftToolBarProps) => {
  const color = useDesignPageColor();

  return (
    <VStack
      width="70px"
      height="calc(100vh - 200px)"
      bgColor={color.toolBar.backgroundColor}
      borderRadius={isSidePanelOpen ? "8px 0 0 8px" : "8px"}
      borderWidth={isSidePanelOpen ? "0.5px 0 0.5px 0.5px" : "0.5px"}
      position="fixed"
      top="50%"
      left="0"
      transform="translateY(-50%)"
      zIndex="2"
      borderColor={color.toolBar.hover}
      boxShadow={
        isSidePanelOpen
          ? "-5px 0 10px -5px rgba(0,0,0,0.1), 0 -5px 10px -5px rgba(0,0,0,0.1), 0 5px 10px -5px rgba(0,0,0,0.1)"
          : "lg"
      }
      alignItems="center"
      justifyContent="flex-start"
      transition="border-radius 0.3s ease-in-out"
      py={5}
      spacing="0"
    >
      <LeftToolBarItem
        icon="/icons/drawWall.svg"
        label="建造"
        isActive={activeTool === "draw"}
        onClick={() => onChangeActiveTool("draw")}
      />
      <LeftToolBarItem
        icon="/icons/material.svg"
        label="材質庫"
        isActive={activeTool === "material"}
        onClick={() => onChangeActiveTool("material")}
      />
      <LeftToolBarItem
        icon="/icons/furniture.svg"
        label="家具庫"
        isActive={activeTool === "furniture"}
        onClick={() => onChangeActiveTool("furniture")}
      />
      <LeftToolBarItem
        icon="/icons/export.svg"
        label="匯出"
        isActive={activeTool === "export"}
        onClick={() => onChangeActiveTool("export")}
      />
      {/* 添加其他工具按鈕 */}
    </VStack>
  );
};

export default LeftToolBar;
