import { HStack, Switch, Text } from "@chakra-ui/react";
import { useDesignColorMode } from "@/context/colorModeContext";

const ColorModeSwitch = () => {
  const { designColorMode, toggleDesignColorMode } = useDesignColorMode();

  return (
    <HStack width="80px">
      <Switch
        colorScheme="whiteAlpha"
        size="sm"
        isChecked={designColorMode === "dark"}
        onChange={toggleDesignColorMode}
      />
      <Text>Dark</Text>
    </HStack>
  );
};

export default ColorModeSwitch;
