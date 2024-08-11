import React from "react";
import useDesignColor from "@/hooks/useDesignPageColor";
import { Box } from "@chakra-ui/react";

interface SidePanelProps {
  isOpen: boolean;
  children: React.ReactNode;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, children }) => {
  const color = useDesignColor();

  return (
    <Box
      position="fixed"
      left="70px"
      top="50%"
      opacity={isOpen ? "1" : "0"}
      transform={`translateY(-50%) translateX(${isOpen ? "0" : "-100%"})`}
      width="350px"
      height="calc(100vh - 200px)"
      bg={color.toolBar.backgroundColor}
      borderRadius="0 8px 8px 0"
      borderWidth="0.5px "
      borderColor={color.toolBar.hover}
      boxShadow="4px 0 10px -5px rgba(0,0,0,0.1), 0 4px 10px -5px rgba(0,0,0,0.1), 0 -4px 10px -5px rgba(0,0,0,0.1)"
      zIndex="1"
      overflow="hidden"
      transition="opacity 0.5s ease-in-out, transform 0.5s ease-in-out"
    >
      {children}
    </Box>
  );
};

export default SidePanel;
