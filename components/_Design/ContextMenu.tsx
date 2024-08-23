import React from "react";
import { Box, VStack, Button } from "@chakra-ui/react";
import { CopyIcon, DeleteIcon } from "@chakra-ui/icons";
import { FaPaste } from "react-icons/fa";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onCopy,
  onPaste,
  onDelete,
}) => {
  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Box
      position="fixed"
      left={x}
      top={y}
      zIndex={10}
      bg="white"
      boxShadow="md"
      borderRadius="md"
    >
      <VStack spacing={0} align="stretch">
        <Button
          onClick={() => handleAction(onCopy)}
          leftIcon={<CopyIcon />}
          justifyContent="flex-start"
          variant="ghost"
          w="100%"
          px={4}
          py={2}
        >
          複製
        </Button>
        <Button
          onClick={() => handleAction(onPaste)}
          leftIcon={<FaPaste />}
          justifyContent="flex-start"
          variant="ghost"
          w="100%"
          px={4}
          py={2}
        >
          貼上
        </Button>
        <Button
          onClick={() => handleAction(onDelete)}
          leftIcon={<DeleteIcon />}
          justifyContent="flex-start"
          variant="ghost"
          w="100%"
          px={4}
          py={2}
        >
          刪除
        </Button>
      </VStack>
    </Box>
  );
};

export default ContextMenu;
