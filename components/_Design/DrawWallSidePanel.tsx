import { useState } from "react";
import { Box, Button, Divider, HStack, VStack } from "@chakra-ui/react";
import SidePanelHeader from "../_UI/SidePanelHeader";
import SidePanelCloseButton from "../_UI/SidePanelCloseButton";
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
  const color = useDesignPageColor();

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
          description="點擊後開始繪製，按Esc退出"
        />
        <HStack width="100%">
          <LeftToolBarItem
            buttonWidth="30%"
            borderRadius="5px"
            spacing="15px"
            icon="/icons/wall.svg"
            iconWidth="90%"
            label="垂直牆"
            onClick={() => console.log("click")}
          />
        </HStack>
        <Divider borderColor={color.toolBar.subText} />
        <SidePanelHeader title="放置門窗" description="請選擇門窗組件" />
        <HStack width="100%">
          <LeftToolBarItem
            buttonWidth="30%"
            borderRadius="5px"
            spacing="15px"
            icon="/icons/doorIcon.svg"
            iconWidth="90%"
            label="單開門"
            onClick={() => design?.addDoorWindow("/door2.svg")}
          />
          <LeftToolBarItem
            buttonWidth="30%"
            borderRadius="5px"
            spacing="15px"
            icon="/icons/windowIcon3.svg"
            iconWidth="90%"
            label="普通窗"
            onClick={() => design?.addDoorWindow("/window2.svg")}
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
