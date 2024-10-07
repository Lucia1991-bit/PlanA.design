import React from "react";
import useDesignPageColor from "@/hooks/useDesignPageColor";
import { Design } from "@/types/DesignType";
import { Box, Button, Divider, HStack, Text, VStack } from "@chakra-ui/react";
import SidePanelHeader from "../ui/SidePanelHeader";
import LeftToolBarItem from "./LeftToolBarItem";
import SidePanelCloseButton from "../ui/SidePanelCloseButton";
import { LuFileImage } from "react-icons/lu";

interface ExportSidePanelProps {
  design: Design | undefined;
  closeSidePanel: () => void;
}

const ExportSidePanel = ({ design, closeSidePanel }: ExportSidePanelProps) => {
  const color = useDesignPageColor();

  const handlePaperSizeChange = (newSize: "A4" | "A3") => {
    design?.adjustToNewPaperSize(newSize);
  };

  return (
    <>
      <VStack
        width="100%"
        height="100%"
        alignItems="stretch"
        spacing={4}
        p={4}
        overflowX="hidden"
        position="relative"
      >
        <SidePanelHeader title="匯出PNG圖片" description="請選擇匯出尺寸" />
        <VStack>
          <Button
            width="100%"
            height="50px"
            variant="ghost"
            bg={
              design?.paperSize === "A4" ? color.toolBar.hover : "transparent"
            }
            color={color.toolBar.text}
            _hover={{ bg: color.toolBar.hover }}
            _focus={{ outline: "none", boxShadow: "none" }}
            borderRadius="5px"
            px={3}
            onClick={() => handlePaperSizeChange("A4")}
          >
            <HStack
              width="100%"
              height="100%"
              justifyContent="space-between"
              alignItems="center"
            >
              <HStack alignItems="center" height="100%">
                <LuFileImage fontSize="25px" />
                <Text>A4</Text>
              </HStack>
              <Text fontSize="14px" fontWeight="300">
                297 x 210 mm
              </Text>
            </HStack>
          </Button>

          <Button
            width="100%"
            height="50px"
            variant="ghost"
            color={color.toolBar.text}
            bg={
              design?.paperSize === "A3" ? color.toolBar.hover : "transparent"
            }
            _hover={{ bg: color.toolBar.hover }}
            _focus={{ outline: "none", boxShadow: "none" }}
            borderRadius="5px"
            px={3}
            onClick={() => handlePaperSizeChange("A3")}
          >
            <HStack
              width="100%"
              height="100%"
              justifyContent="space-between"
              alignItems="center"
            >
              <HStack alignItems="center" height="100%">
                <LuFileImage fontSize="25px" />
                <Text>A3</Text>
              </HStack>
              <Text fontSize="14px" fontWeight="300">
                420 x 297 mm
              </Text>
            </HStack>
          </Button>
        </VStack>

        <HStack
          position="absolute"
          bottom="20px"
          left="50%"
          transform={"translateX(-50%)"}
          spacing={3}
        >
          <Button
            mt={4}
            fontWeight="500"
            w="130px"
            letterSpacing={1}
            borderColor={color.toolBar.hover}
            color={color.toolBar.text}
            variant="outline"
            size="sm"
            _hover={{
              bg: "brand.light",
            }}
            py={5}
            onClick={() => {
              design?.cancelExport();
              closeSidePanel();
            }}
          >
            取消
          </Button>
          <Button
            mt={4}
            fontWeight="500"
            w="130px"
            letterSpacing={1}
            bg="brand.primary"
            color="white"
            size="sm"
            _hover={{
              bg: "#a02d2d",
            }}
            py={5}
            onClick={design?.handleExport}
            isLoading={design?.isExportLoading}
            _disabled={{ cursor: "default" }}
          >
            確定匯出
          </Button>
        </HStack>
      </VStack>
      <Box>
        <SidePanelCloseButton
          position="absolute"
          width="30px"
          height="100%"
          top="0"
          right="-31px"
          zIndex={5}
          color={color.toolBar.backgroundColor}
          borderColor={color.toolBar.hover}
          onClick={() => {
            closeSidePanel();
          }}
          arrowColor={color.toolBar.text}
        />
      </Box>
    </>
  );
};

export default ExportSidePanel;
