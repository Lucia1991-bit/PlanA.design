import { useEffect, useState } from "react";
import { Box, Button, Divider, HStack, VStack } from "@chakra-ui/react";
import SidePanelHeader from "../ui/SidePanelHeader";
import SidePanelCloseButton from "../ui/SidePanelCloseButton";
import useDesignPageColor from "@/hooks/useDesignPageColor";
import { ActiveTool, Design } from "@/types/DesignType";
import LeftToolBarItem from "./LeftToolBarItem";
import Image from "next/image";

interface DrawWallSidePanelProps {
  design: Design | undefined;
  closeSidePanel: () => void;
}

const DrawWallSidePanel = ({
  design,
  closeSidePanel,
}: DrawWallSidePanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const color = useDesignPageColor();

  useEffect(() => {
    setIsDrawing(design?.isDrawingMode || false);
  }, [design?.isDrawingMode]);

  const handleDrawWallClick = () => {
    if (isDrawing) {
      design?.finishDrawWall();
    } else {
      design?.startDrawWall();
    }
  };

  return (
    <>
      <VStack
        width="100%"
        height="100%"
        alignItems="stretch"
        spacing={4}
        p={4}
        overflowX="hidden"
      >
        <SidePanelHeader
          title="繪製牆體"
          description={
            isDrawing
              ? "使用滑鼠左鍵點擊並拖曳以繪製牆體\n拖曳到滿意的位置後再點擊一次繪製下一道牆\n把起點與終點重合後再點擊一次即可完成繪製"
              : "點擊下方按鈕或L鍵後進入繪製模式"
          }
          instruction={isDrawing ? "或可按下方按鈕或Esc鍵退出繪製模式" : ""}
          videoUrl={
            isDrawing
              ? "https://res.cloudinary.com/datj4og4i/video/upload/v1725736733/drawWall_xoxe7u.mp4"
              : ""
          }
        />
        <HStack width="100%" px={3}>
          <LeftToolBarItem
            buttonWidth="30%"
            borderRadius="5px"
            spacing="15px"
            icon="/icons/wall.svg"
            iconWidth="90%"
            label={isDrawing ? "退出繪製 Esc" : "開始繪製 L"}
            shortcut={isDrawing ? "Esc" : "L"}
            textFlex="0.1"
            onClick={handleDrawWallClick}
            isActive={isDrawing}
            draggable={false}
          />
        </HStack>
        <Divider borderColor={color.toolBar.subText} />
        <SidePanelHeader title="放置門窗" description="請選擇門窗組件" />
        <HStack width="100%" px={3}>
          <LeftToolBarItem
            buttonWidth="30%"
            borderRadius="5px"
            spacing="15px"
            icon="/icons/doorIcon.svg"
            iconWidth="90%"
            label="單開門"
            textFlex="0.1"
            onClick={() => design?.addDoorWindow("/door.png")}
          />
          <LeftToolBarItem
            buttonWidth="30%"
            borderRadius="5px"
            spacing="15px"
            icon="/icons/windowIcon3.svg"
            iconWidth="90%"
            label="普通窗"
            textFlex="0.1"
            onClick={() => design?.addDoorWindow("/window.png")}
          />
        </HStack>
      </VStack>
      <Box>
        <SidePanelCloseButton
          position="absolute"
          width="30px"
          height="100%"
          top="0"
          right="-31px"
          zIndex={5}
          color={color.toolBar.backgroundColor}
          borderColor={color.toolBar.hover}
          onClick={() => {
            closeSidePanel();
          }}
          arrowColor={color.toolBar.text}
        />
      </Box>
    </>
  );
};

export default DrawWallSidePanel;
