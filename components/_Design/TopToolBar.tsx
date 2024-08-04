import useDesignColor from "@/hooks/useDesignColor";
import { HStack } from "@chakra-ui/react";

const TopToolBar = () => {
  const color = useDesignColor();
  return (
    <HStack
      width="40%"
      height="60px"
      bg={color.toolBar.backgroundColor}
      position="absolute"
      top="20px"
      left="50%"
      transform="translateX(-50%)"
      zIndex="2"
      boxShadow="md"
      borderRadius="5px"
    ></HStack>
  );
};

export default TopToolBar;
