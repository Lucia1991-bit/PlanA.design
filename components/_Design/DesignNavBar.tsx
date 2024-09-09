import {
  Box,
  Button,
  Divider,
  HStack,
  IconButton,
  keyframes,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import {
  LuLoader,
  LuDownload,
  LuMousePointerClick,
  LuMousePointer2,
  LuRedo2,
  LuSave,
  LuUndo2,
  LuEraser,
  LuHand,
  LuSpace,
} from "react-icons/lu";
import { BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import { MdKeyboardCommandKey, MdOutlineSpaceBar } from "react-icons/md";
import ProfileMenu from "../_Profile/ProfileMenu";
import useDesignPageColor from "@/hooks/useDesignPageColor";
import Logo from "./Logo";
import ColorModeSwitch from "./ColorModeSwitch";
import RenameProjectButton from "@/components/_Design/RenameProjectButton";
import { ActiveTool, Design } from "@/types/DesignType";
import { useCallback, useEffect, useState } from "react";
import CustomTooltip from "../_UI/CustomTooltip";
import ClearCanvasModal from "../_UI/ClearCanvasModal";
import { PiMouseLeftClick } from "react-icons/pi";

interface DesignNavBarProps {
  boardId: string;
  boardName: string;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  design: Design | undefined;
  saveDesign: (fabricData: string, thumbnailURL: string) => void;
  isUpdating: boolean;
  error: string | null;
  hasSaved: boolean;
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SpinningLoader = () => (
  <Box animation={`${spin} 2s linear infinite`}>
    <LuLoader size={20} />
  </Box>
);

const DesignNavBar = ({
  boardId,
  boardName,
  activeTool,
  onChangeActiveTool,
  design,
  isUpdating,
  saveDesign,
  error,
  hasSaved,
}: DesignNavBarProps) => {
  const [isClearCanvasModalOpen, setIsClearCanvasModalOpen] = useState(false);
  const color = useDesignPageColor();
  const handleClearCanvas = () => {
    if (design?.clearCanvas) {
      design.clearCanvas();
    }
    setIsClearCanvasModalOpen(false);
  };

  return (
    <>
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
              px="8px"
              py="4px"
              borderRadius="3px"
              fontSize="13px"
              label="選取物件"
              placement="bottom"
              bg={color.tooltip.backgroundColor}
              color={color.tooltip.text}
              offset={[0, 15]}
            >
              <IconButton
                onClick={() => onChangeActiveTool("select")}
                size="md"
                bg={
                  activeTool === "select" ? color.toolBar.hover : "transparent"
                }
                color={color.toolBar.text}
                aria-label={"select"}
                icon={<LuMousePointer2 fontSize="20px" />}
                _hover={{ bg: color.toolBar.hover }}
                _active={{
                  bg: color.toolBar.hover,
                }}
              />
            </Tooltip>
            <CustomTooltip
              mainText="平移畫布"
              shortcutContent={
                <>
                  <LuSpace />
                  <PiMouseLeftClick />
                </>
              }
            >
              <IconButton
                onClick={() => onChangeActiveTool("pan")}
                size="md"
                bg={activeTool === "pan" ? color.toolBar.hover : "transparent"}
                color={color.toolBar.text}
                aria-label={"panMode"}
                icon={<LuHand fontSize="20px" />}
                _hover={{ bg: color.toolBar.hover }}
                _active={{
                  bg: color.toolBar.hover,
                }}
              />
            </CustomTooltip>

            <CustomTooltip
              mainText="復原"
              shortcutContent={
                <>
                  <MdKeyboardCommandKey />
                  <Text>Z</Text>
                </>
              }
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
            </CustomTooltip>

            <CustomTooltip
              mainText="取消復原"
              shortcutContent={
                <>
                  <MdKeyboardCommandKey />
                  <Text>Y</Text>
                </>
              }
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
            </CustomTooltip>

            <CustomTooltip
              mainText="存檔"
              shortcutContent={
                <>
                  <MdKeyboardCommandKey />
                  <Text>S</Text>
                </>
              }
            >
              <IconButton
                color={color.toolBar.text}
                size="md"
                aria-label={"save"}
                icon={<LuSave fontSize="20px" />}
                bg="transparent"
                _hover={{ bg: color.toolBar.hover }}
                onClick={design?.onSave}
                isDisabled={isUpdating}
                _disabled={{
                  opacity: 0.4,
                  cursor: "default",
                  _hover: { bg: "transparent" },
                }}
              />
            </CustomTooltip>
            <Tooltip
              px="8px"
              py="4px"
              borderRadius="3px"
              fontSize="13px"
              label="清空畫布"
              placement="bottom"
              bg={color.tooltip.backgroundColor}
              color={color.tooltip.text}
              offset={[0, 15]}
            >
              <IconButton
                onClick={handleClearCanvas}
                size="md"
                bg="transparent"
                color={color.toolBar.text}
                aria-label={"clearCanvas"}
                icon={<LuEraser fontSize="20px" />}
                _hover={{ bg: color.toolBar.hover }}
                _active={{
                  bg: color.toolBar.hover,
                }}
              />
            </Tooltip>
            <Divider
              orientation="vertical"
              height="30px"
              borderColor={color.navBar.text}
            />
            {isUpdating && (
              <HStack ml={4} color={color.toolBar.subText}>
                <SpinningLoader />
                <Text fontSize="12px">存檔中...</Text>
              </HStack>
            )}

            {!isUpdating && error && (
              <HStack ml={4} color={color.toolBar.subText}>
                <BsCloudSlash size="20px" />
                <Text fontSize="12px">存檔失敗</Text>
              </HStack>
            )}

            {!isUpdating && !error && hasSaved && (
              <HStack ml={4} color={color.toolBar.subText}>
                <BsCloudCheck size="20px" />
                <Text fontSize="12px">存檔完成</Text>
              </HStack>
            )}

            {/* <Tooltip
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
          </Tooltip> */}
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
      {/* <ClearCanvasModal
        isOpen={isClearCanvasModalOpen}
        onClose={() => setIsClearCanvasModalOpen(false)}
        onConfirm={handleClearCanvas}
      /> */}
    </>
  );
};

export default DesignNavBar;
