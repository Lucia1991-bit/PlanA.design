import { HStack, Switch, Text } from "@chakra-ui/react";
import { useDesignColorMode } from "@/context/colorModeContext";

const ColorModeSwitch = () => {
  const { designColorMode, toggleDesignColorMode } = useDesignColorMode();

  return (
    <HStack width="200px">
      <Switch
        isChecked={designColorMode === "dark"}
        onChange={toggleDesignColorMode}
      />
      <Text>Dark Mode</Text>
    </HStack>
  );
};

export default ColorModeSwitch;
