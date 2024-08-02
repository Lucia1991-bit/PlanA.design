import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
  useMediaQuery,
  VStack,
} from "@chakra-ui/react";
import BoardActionsModal from "../_UI/BoardActionsModal";
import { useBoardOperations } from "@/hooks/useBoardOperations ";

interface BoardMenuProps {
  boardId: string;
  boardName: string;
}

const BoardMenu = ({ boardId, boardName }: BoardMenuProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobileOrTablet] = useMediaQuery("(max-width: 1024px)");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "rename" | "delete";
  }>({
    isOpen: false,
    type: "rename",
  });
  const { renameBoard, removeBoard, isLoading } = useBoardOperations();

  //點擊 Icon按鈕打開選單
  const handleMenuClick = (e: React.MouseEvent) => {
    //防止點擊時觸發其他按鈕
    e.stopPropagation();
    e.preventDefault();
    if (isMobileOrTablet) {
      isOpen ? onClose() : onOpen();
    } else {
      onOpen();
    }
  };

  //電腦版 hover時顯示選單
  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMobileOrTablet) {
      onOpen();
    }
  };

  //電腦版 滑鼠離開時顯示選單
  const handleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMobileOrTablet) {
      onClose();
    }
  };

  //改名 Board: 跳出確認 Modal
  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalState({ isOpen: true, type: "rename" });
    onClose();
  };

  //刪除 Board: 跳出確認 Modal
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalState({ isOpen: true, type: "delete" });
    onClose();
  };

  //關閉 Modal
  const handleModalClose = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  //點擊 Modal 確認按鈕
  const handleModalSubmit = (value: string) => {
    if (modalState.type === "rename") {
      renameBoard(boardId, value);
    } else if (modalState.type === "delete") {
      removeBoard(boardId);
    }
    handleModalClose();
  };

  return (
    <>
      <Box
        className="board-menu"
        position="absolute"
        top={2}
        right={2}
        zIndex={20}
        opacity={isMobileOrTablet ? 1 : 0}
      >
        <Popover
          placement={isMobileOrTablet ? "bottom" : "right"}
          strategy="fixed"
          isOpen={isOpen}
          onClose={onClose}
        >
          <PopoverTrigger>
            <IconButton
              size="sm"
              variant="ghost"
              bg={isMobileOrTablet ? "transparent" : "rgba(0, 0, 0, 0.2)"}
              color={isMobileOrTablet ? "primary.dark" : "white"}
              aria-label="See menu"
              icon={<BsThreeDotsVertical />}
              _hover={{ bg: "rgba(0, 0, 0, 0.5)", color: "white" }}
              _focus={{ outline: "none", boxShadow: "none" }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleMenuClick}
            />
          </PopoverTrigger>
          <PopoverContent
            width="120px"
            _focus={{ outline: "none", boxShadow: "none" }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <PopoverBody p={0} py={2}>
              <VStack align="stretch" spacing={1}>
                <Button
                  fontWeight="500"
                  borderRadius={0}
                  w="100%"
                  color="brand.dark"
                  leftIcon={<EditIcon />}
                  justifyContent="flex-start"
                  variant="ghost"
                  size="sm"
                  _hover={{ bg: "brand.light" }}
                  onClick={handleRenameClick}
                >
                  重新命名
                </Button>
                <Button
                  fontWeight="500"
                  borderRadius={0}
                  color="brand.dark"
                  leftIcon={<DeleteIcon />}
                  justifyContent="flex-start"
                  variant="ghost"
                  size="sm"
                  _hover={{ bg: "brand.light" }}
                  onClick={handleDeleteClick}
                >
                  刪除設計
                </Button>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>

      {modalState.isOpen && (
        <BoardActionsModal
          isOpen={modalState.isOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          type={modalState.type}
          currentName={boardName}
        />
      )}
    </>
  );
};

export default BoardMenu;
