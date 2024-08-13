import { useState } from "react";
import { Box, VStack } from "@chakra-ui/react";
import SidePanelHeader from "../_UI/SidePanelHeader";
import SidePanelCloseButton from "../_UI/SidePanelCloseButton";
import useDesignPageColor from "@/hooks/useDesignPageColor";
import { Design } from "@/types/DesignType";

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
        spacing={2}
        p={4}
        overflowX="hidden"
      >
        <SidePanelHeader title="家具庫" description="請選擇家具組件" />
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
