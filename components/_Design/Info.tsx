import { HStack, Text } from "@chakra-ui/react";
import useDesignColor from "@/hooks/useDesignColor";
import ColorModeSwitch from "./ColorModeSwitch";

const Info = () => {
  const color = useDesignColor();

  return (
    <HStack
      bg="transparent"
      width="300px"
      height="30px"
      zIndex={2}
      justifyContent="space-around"
      alignItems="center"
    >
      <Text>項目名稱</Text>
      <ColorModeSwitch />
    </HStack>
  );
};

export default Info;
