import {
  Button,
  Divider,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import {
  LuDownload,
  LuMousePointerClick,
  LuRedo2,
  LuSave,
  LuUndo2,
} from "react-icons/lu";
import ProfileMenu from "../_Profile/ProfileMenu";
import useDesignPageColor from "@/hooks/useDesignPageColor";
import Logo from "./Logo";
import ColorModeSwitch from "./ColorModeSwitch";
import RenameProjectButton from "@/components/_Design/RenameProjectButton";
import { ActiveTool, Design } from "@/types/DesignType";

interface DesignNavBarProps {
  boardId: string;
  boardName: string;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  design: Design | undefined;
}

const DesignNavBar = ({
  boardId,
  boardName,
  activeTool,
  onChangeActiveTool,
  design,
}: DesignNavBarProps) => {
  const color = useDesignPageColor();

  return (
    <HStack
      bg={color.toolBar.backgroundColor}
      color={color.toolBar.text}
      boxShadow="md"
      width={{ lg: "90%", xl: "85%" }}
      height="60px"
      position="fixed"
      top="0"
      left="50%"
      transform={"translateX(-50%)"}
      zIndex="2"
      paddingX="30px"
      justifyContent="space-between"
      alignItems="center"
      borderRadius="8px"
      border={`0.5px solid ${color.toolBar.hover}`}
    >
      <HStack spacing={4}>
        <Logo />
        <RenameProjectButton boardId={boardId} initialName={boardName} />
        <Divider
          orientation="vertical"
          height="30px"
          borderColor={color.navBar.text}
        />
        <HStack>
          <Tooltip
            label="選取物件"
            placement="bottom"
            bg={color.tooltip.backgroundColor}
            color={color.tooltip.text}
            offset={[0, 15]}
          >
            <IconButton
              onClick={() => onChangeActiveTool("select")}
              size="md"
              bg={activeTool === "select" ? color.toolBar.hover : "transparent"}
              color={color.toolBar.text}
              aria-label={"select"}
              icon={<LuMousePointerClick fontSize="20px" />}
              _hover={{ bg: color.toolBar.hover }}
              _active={{
                bg: color.toolBar.hover,
              }}
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
              isDisabled={!design?.canUndo()}
              color={color.toolBar.text}
              size="md"
              aria-label={"undo"}
              icon={<LuUndo2 fontSize="20px" />}
              bg="transparent"
              _hover={{ bg: color.toolBar.hover }}
              onClick={() => design?.onUndo()}
              _disabled={{
                opacity: 0.4,
                cursor: "default",
                _hover: { bg: "transparent" },
              }}
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
              isDisabled={!design?.canRedo()}
              color={color.toolBar.text}
              size="md"
              aria-label={"redo"}
              icon={<LuRedo2 fontSize="20px" />}
              bg="transparent"
              _hover={{ bg: color.toolBar.hover }}
              _disabled={{
                opacity: 0.4,
                cursor: "default",
                _hover: { bg: "transparent" },
              }}
              onClick={() => design?.onRedo()}
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
          {/* 匯出選項 */}
          {/* <Menu>
            <Tooltip
              label="匯出"
              placement="bottom"
              bg={color.tooltip.backgroundColor}
              color={color.tooltip.text}
              offset={[0, 15]}
            >
              <MenuButton
                as={IconButton}
                color={color.toolBar.text}
                size="md"
                aria-label={"export"}
                icon={<LuDownload fontSize="20px" />}
                bg="transparent"
                _hover={{ bg: color.toolBar.hover }}
              />
            </Tooltip>
            <MenuList
              bg={color.toolBar.backgroundColor}
              borderColor={color.toolBar.hover}
            >
              <MenuItem
                onClick={() => editor?.savePng()}
                bg="transparent"
                _hover={{ bg: color.toolBar.hover }}
              >
                <HStack spacing={2}>
                  <LuDownload fontSize="24px" />
                  <VStack align="start" spacing={0}>
                    <Text>PNG</Text>
                    <Text
                      fontSize="xs"
                      color={color.toolBar.text}
                      opacity={0.8}
                    >
                      Best for sharing on the web
                    </Text>
                  </VStack>
                </HStack>
              </MenuItem>
              <MenuItem
                onClick={() => editor?.saveJpg()}
                bg="transparent"
                _hover={{ bg: color.toolBar.hover }}
              >
                <HStack spacing={2}>
                  <LuDownload fontSize="24px" />
                  <VStack align="start" spacing={0}>
                    <Text>JPG</Text>
                    <Text
                      fontSize="xs"
                      color={color.toolBar.text}
                      opacity={0.8}
                    >
                      Best for printing
                    </Text>
                  </VStack>
                </HStack>
              </MenuItem>
              <MenuItem
                onClick={() => editor?.saveSvg()}
                bg="transparent"
                _hover={{ bg: color.toolBar.hover }}
              >
                <HStack spacing={2}>
                  <LuDownload fontSize="24px" />
                  <VStack align="start" spacing={0}>
                    <Text>SVG</Text>
                    <Text
                      fontSize="xs"
                      color={color.toolBar.text}
                      opacity={0.8}
                    >
                      Best for editing in vector software
                    </Text>
                  </VStack>
                </HStack>
              </MenuItem>
            </MenuList>
          </Menu> */}
        </HStack>
      </HStack>

      <HStack spacing={0}>
        <Divider
          orientation="vertical"
          height="30px"
          borderColor={color.navBar.text}
        />
        <ColorModeSwitch />
        <ProfileMenu isDesignPage={true} />
      </HStack>
    </HStack>
  );
};

export default DesignNavBar;
