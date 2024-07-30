import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";

const BoardMenu = () => {
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  return (
    <Menu placement="bottom" isLazy>
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
        _hover={{ bg: "brand.light" }}
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
  );
};

export default BoardMenu;
