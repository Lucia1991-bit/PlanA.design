import { HStack, IconButton, Switch, Text, Tooltip } from "@chakra-ui/react";
import { useDesignColorMode } from "@/context/colorModeContext";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import useDesignColor from "@/hooks/useDesignColor";

const ColorModeSwitch = () => {
  const { designColorMode, toggleDesignColorMode } = useDesignColorMode();
  const color = useDesignColor();

  return (
    <Tooltip
      label="切換色彩模式"
      placement="bottom"
      offset={[0, 15]}
      bg={color.tooltip.backgroundColor}
      color={color.tooltip.text}
    >
      <IconButton
        aria-label="Toggle color mode"
        icon={designColorMode === "dark" ? <SunIcon /> : <MoonIcon />}
        onClick={toggleDesignColorMode}
        size="md"
        fontSize="lg"
        variant="ghost"
        color="current"
        marginLeft="2"
        _hover={{
          bg: "brand.light",
        }}
        _active={{
          bg: "brand.light",
        }}
      />
    </Tooltip>
  );
};

export default ColorModeSwitch;
