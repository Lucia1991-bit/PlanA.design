import { IconButton, Tooltip } from "@chakra-ui/react";
import { useDesignColorMode } from "@/context/colorModeContext";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import useDesignPageColor from "@/hooks/useDesignPageColor";
import { useCallback } from "react";

const ColorModeSwitch = () => {
  const { designColorMode, toggleDesignColorMode } = useDesignColorMode();
  const color = useDesignPageColor();

  const handleColorModeToggle = useCallback(() => {
    toggleDesignColorMode();
  }, [toggleDesignColorMode]);

  return (
    <Tooltip
      px="8px"
      py="4px"
      borderRadius="3px"
      fontSize="13px"
      label="切換色彩主題"
      placement="bottom"
      offset={[0, 15]}
      bg={color.tooltip.backgroundColor}
      color={color.tooltip.text}
    >
      <IconButton
        aria-label="Toggle color mode"
        icon={designColorMode === "dark" ? <SunIcon /> : <MoonIcon />}
        onClick={handleColorModeToggle}
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
