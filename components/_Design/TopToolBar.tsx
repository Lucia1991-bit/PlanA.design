import { HStack, IconButton, Text, Tooltip } from "@chakra-ui/react";
import {
  LuUndo2,
  LuRedo2,
  LuSave,
  LuDownload,
  LuMousePointerClick,
} from "react-icons/lu";
import useDesignPageColor from "@/hooks/useDesignPageColor";

const TopToolBar = () => {
  const color = useDesignPageColor();
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
      justifyContent="center"
      alignItems="center"
    >
      <Tooltip
        label="選取物件"
        placement="bottom"
        bg={color.tooltip.backgroundColor}
        color={color.tooltip.text}
        offset={[0, 15]}
      >
        <IconButton
          size="md"
          color={color.toolBar.text}
          aria-label={"select"}
          icon={<LuMousePointerClick fontSize="20px" />}
          bg="transparent"
          _hover={{ bg: color.toolBar.hover }}
        />
      </Tooltip>
      <Tooltip
        label="復原"
        placement="bottom"
        bg={color.tooltip.backgroundColor}
        color={color.tooltip.text}
        offset={[0, 15]}
      >
        <IconButton
          color={color.toolBar.text}
          size="md"
          aria-label={"undo"}
          icon={<LuUndo2 fontSize="20px" />}
          bg="transparent"
          _hover={{ bg: color.toolBar.hover }}
        />
      </Tooltip>

      <Tooltip
        label="取消復原"
        placement="bottom"
        bg={color.tooltip.backgroundColor}
        color={color.tooltip.text}
        offset={[0, 15]}
      >
        <IconButton
          color={color.toolBar.text}
          size="md"
          aria-label={"redo"}
          icon={<LuRedo2 fontSize="20px" />}
          bg="transparent"
          _hover={{ bg: color.toolBar.hover }}
        />
      </Tooltip>

      <Tooltip
        label="存檔"
        placement="bottom"
        bg={color.tooltip.backgroundColor}
        color={color.tooltip.text}
        offset={[0, 15]}
      >
        <IconButton
          color={color.toolBar.text}
          size="md"
          aria-label={"save"}
          icon={<LuSave fontSize="20px" />}
          bg="transparent"
          _hover={{ bg: color.toolBar.hover }}
        />
      </Tooltip>

      <Tooltip
        label="匯出"
        placement="bottom"
        bg={color.tooltip.backgroundColor}
        color={color.tooltip.text}
        offset={[0, 15]}
      >
        <IconButton
          color={color.toolBar.text}
          size="md"
          aria-label={"export"}
          icon={<LuDownload fontSize="20px" />}
          bg="transparent"
          _hover={{ bg: color.toolBar.hover }}
        />
      </Tooltip>
    </HStack>
  );
};

export default TopToolBar;
