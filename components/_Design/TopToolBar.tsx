import useDesignColor from "@/hooks/useDesignColor";
import { HStack, Text } from "@chakra-ui/react";

const TopToolBar = () => {
  const color = useDesignColor();
  return (
    <HStack
      width="28%"
      height="70px"
      bg={color.toolBar.backgroundColor}
      color={color.toolBar.text}
      position="absolute"
      top="64px"
      left="50%"
      transform="translateX(-50%)"
      zIndex="2"
      boxShadow="md"
      borderRadius="5px"
      borderWidth="0.5px"
      borderColor={color.toolBar.hover}
      px={4}
      justifyContent="space-around"
      alignItems="center"
    >
      <Text>繪製牆體</Text>
      <Text>門窗組件</Text>
      <Text>Undo</Text>
      <Text>Redo</Text>
      <Text>存檔</Text>
      <Text>清空</Text>
    </HStack>
  );
};

export default TopToolBar;
