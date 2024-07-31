import { useRef } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";

const BoardMenu = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const menuRef = useRef(null);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleMouseEnter = () => {
    onOpen();
  };

  const handleMouseLeave = () => {
    onClose();
  };

  return (
    <Box
      className="board-menu"
      position="absolute"
      top={2}
      right={2}
      zIndex={10}
      opacity={0}
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Menu isOpen={isOpen} placement="right" isLazy>
        <MenuButton
          as={IconButton}
          size="sm"
          variant="ghost"
          bg="transparent"
          color="white"
          aria-label="See menu"
          icon={<BsThreeDotsVertical />}
          top={2}
          right={2}
          zIndex={2}
          _hover={{ bg: "brand.dark" }}
          _focus={{ outline: "none", boxShadow: "none" }}
          _active={{ bg: "brand.dark" }}
          onClick={handleMenuClick}
        />
        <MenuList zIndex={10}>
          <MenuItem
            _hover={{ bg: "brand.light" }}
            _focus={{ bg: "brand.light" }}
            icon={<EditIcon />}
          >
            重新命名
          </MenuItem>
          <MenuItem
            _hover={{ bg: "brand.light" }}
            _focus={{ bg: "brand.light" }}
            icon={<DeleteIcon />}
          >
            刪除
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default BoardMenu;
