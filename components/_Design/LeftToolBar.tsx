import useDesignColor from "@/hooks/useDesignColor";
import { VStack } from "@chakra-ui/react";
import React from "react";

const LeftToolBar = () => {
  const color = useDesignColor();

  return (
    <VStack
      width="80px"
      height="600px"
      bgColor={color.toolBar.backgroundColor}
      boxShadow="lg"
      borderRadius="5px"
      position="absolute"
      top="50%"
      left="10px"
      transform="translateY(-50%)"
      zIndex="2"
      borderWidth="0.5px"
      borderColor={color.toolBar.hover}
    ></VStack>
  );
};

export default LeftToolBar;
