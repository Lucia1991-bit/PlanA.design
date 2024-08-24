import React from "react";
import { Box, VStack, Button, HStack, Text } from "@chakra-ui/react";
import { CopyIcon, DeleteIcon } from "@chakra-ui/icons";
import { MdKeyboardCommandKey } from "react-icons/md";
import { FaPaste } from "react-icons/fa";
import useDesignPageColor from "@/hooks/useDesignPageColor";

interface ContextMenuProps {
  x: number;
  y: number;
  hasActiveObject: boolean;
  canPaste: () => boolean;
  onClose: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  hasActiveObject,
  canPaste,
  onClose,
  onCopy,
  onPaste,
  onDelete,
}) => {
  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const color = useDesignPageColor();

  return (
    <Box
      position="fixed"
      width="150px"
      left={x}
      top={y}
      zIndex={20}
      bg={color.toolBar.backgroundColor}
      boxShadow="md"
      borderRadius="md"
      border={`0.5px solid ${color.toolBar.hover}`}
      py={2}
    >
      <VStack spacing={0} align="stretch">
        <Button
          fontSize="14px"
          borderRadius="0"
          color={color.toolBar.text}
          onClick={() => handleAction(onCopy)}
          leftIcon={<CopyIcon />}
          justifyContent="flex-start"
          variant="ghost"
          w="100%"
          px={3}
          py={1}
          _hover={{
            bg: color.toolBar.hover,
          }}
          fontWeight="500"
          isDisabled={!hasActiveObject}
          _disabled={{
            opacity: 0.4,
            cursor: "default",
            _hover: { bg: "transparent" },
          }}
        >
          <HStack
            width="100%"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text>複製</Text>
            <HStack
              fontSize="12px"
              color={color.toolBar.subText}
              fontWeight="300"
              spacing={0}
            >
              <MdKeyboardCommandKey />
              <Text>C</Text>
            </HStack>
          </HStack>
        </Button>
        <Button
          fontSize="14px"
          borderRadius="0"
          color={color.toolBar.text}
          onClick={() => handleAction(onPaste)}
          leftIcon={<FaPaste />}
          justifyContent="flex-start"
          variant="ghost"
          w="100%"
          px={3}
          py={1}
          _hover={{
            bg: color.toolBar.hover,
          }}
          fontWeight="500"
          isDisabled={!canPaste()}
          _disabled={{
            opacity: 0.4,
            cursor: "default",
            _hover: { bg: "transparent" },
          }}
        >
          <HStack
            width="100%"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text>貼上</Text>
            <HStack
              fontSize="12px"
              color={color.toolBar.subText}
              fontWeight="300"
              spacing={0}
            >
              <MdKeyboardCommandKey />
              <Text>V</Text>
            </HStack>
          </HStack>
        </Button>
        <Button
          fontSize="14px"
          borderRadius="0"
          color={color.toolBar.text}
          onClick={() => handleAction(onDelete)}
          leftIcon={<DeleteIcon />}
          justifyContent="flex-start"
          variant="ghost"
          w="100%"
          px={3}
          py={1}
          _hover={{
            bg: color.toolBar.hover,
          }}
          fontWeight="500"
          isDisabled={!hasActiveObject}
          _disabled={{
            opacity: 0.4,
            cursor: "default",
            _hover: { bg: "transparent" },
          }}
        >
          <HStack
            width="100%"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text>刪除</Text>
            <Text
              fontSize="12px"
              color={color.toolBar.subText}
              fontWeight="300"
            >
              Delete
            </Text>
          </HStack>
        </Button>
      </VStack>
    </Box>
  );
};

export default ContextMenu;
