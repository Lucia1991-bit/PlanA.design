import React from "react";
import useDesignColor from "@/hooks/useDesignColor";
import { VStack } from "@chakra-ui/react";
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
  const color = useDesignColor();

  return (
    <VStack
      width="70px"
      height="calc(100vh - 200px)"
      bgColor={color.toolBar.backgroundColor}
      borderRadius={isSidePanelOpen ? "8px 0 0 8px" : "8px"}
      borderWidth={isSidePanelOpen ? "0.5px 0 0.5px 0.5px" : "0.5px"}
      position="fixed"
      top="50%"
      left="10px"
      transform="translateY(-50%)"
      zIndex="2"
      borderColor={color.toolBar.hover}
      boxShadow="lg"
      alignItems="center"
      justifyContent="space-around"
      transition="border-radius 0.3s ease-in-out"
    >
      <LeftToolBarItem
        icon="/icons/material.png"
        label="材質庫"
        isActive={activeTool === "material"}
        onClick={() => onChangeActiveTool("material")}
      />
      {/* 添加其他工具按鈕 */}
    </VStack>
  );
};

export default LeftToolBar;
