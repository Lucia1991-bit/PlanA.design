import { HStack, Text } from "@chakra-ui/react";
import useDesignColor from "@/hooks/useDesignColor";
import ColorModeSwitch from "./ColorModeSwitch";

const Info = () => {
  const color = useDesignColor();

  return (
    <HStack
      position="absolute"
      bg={color.toolBar.backgroundColor}
      left="0"
      top="20px"
      width="10%"
      height="80px"
      p={4}
      zIndex={2}
    >
      <ColorModeSwitch />
      <Text>INFO</Text>
    </HStack>
  );
};

export default Info;
