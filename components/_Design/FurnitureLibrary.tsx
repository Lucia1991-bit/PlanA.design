import React, { useState } from "react";
import SidePanelHeader from "../_UI/SidePanelHeader";
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  SimpleGrid,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import useDesignPageColor from "@/hooks/useDesignPageColor";
import { Design } from "@/types/DesignType";

interface FurnitureLibraryProps {
  design: Design | undefined;
}

// 預定義類別
const CATEGORIES = ["客廳", "房間", "餐廳", "浴室", "家飾"];

const FurnitureLibrary = ({ design }: FurnitureLibraryProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const color = useDesignPageColor();

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    // 預取下一個類別的資料
  };

  const handleAddFurniture = (imageUrl: string) => {
    if (design && design.addFurniture) {
      design.addFurniture(imageUrl);
    } else {
      console.error("Design or addFurniture function is undefined");
    }
  };

  return (
    <VStack width="100%" height="100%" alignItems="stretch" spacing={2} p={4}>
      <SidePanelHeader title="家具庫" description="請選擇家具組件" />
      <Tabs
        isFitted
        isLazy
        onChange={handleTabChange}
        flex={1}
        display="flex"
        flexDirection="column"
        overflow="hidden"
        borderColor="rgba(199,200,201, 0.35)"
      >
        <TabList whiteSpace="nowrap">
          {CATEGORIES.map((category) => (
            <Tab
              key={category}
              fontSize="14px"
              color={color.toolBar.text}
              _selected={{
                borderBottom: "3px solid",
                borderColor: "brand.primary",
                fontWeight: "400",
              }}
              _active={{
                boxShadow: "none",
                bg: color.toolBar.hover,
              }}
            >
              {category}
            </Tab>
          ))}
        </TabList>
        <TabPanels flex={1} overflow="hidden">
          {CATEGORIES.map((category) => (
            <TabPanel
              key={category}
              height="100%"
              overflowY="auto"
              sx={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(199,200,201, 0.35) transparent",
                "&::-webkit-scrollbar": {
                  width: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(199,200,201, 0.35)",
                  borderRadius: "2px",
                },
              }}
            >
              {false ? (
                <Flex
                  w="100%"
                  h="100%"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Spinner color={color.toolBar.subText} />
                </Flex>
              ) : (
                <SimpleGrid
                  columns={2}
                  spacing={4}
                  w="100%"
                  h="100%"
                  py={5}
                  px={1}
                >
                  {Array.from({ length: 20 }).map((_, index) => (
                    <Box key={index} position="relative">
                      <Button
                        onClick={() =>
                          handleAddFurniture(
                            "/furniture/尺寸放大地毯W140D200.png"
                          )
                        }
                        bg={color.toolBar.hover}
                        borderRadius="md"
                        width="100%"
                        height="115px"
                        overflow="hidden"
                        _hover={{
                          "& > .hover-text": { opacity: 1 },
                          boxShadow: "md",
                          transform: "scale(1.03)",
                        }}
                        transition="all 0.15s ease-in-out"
                        border={`0.5px solid #c7c8c8`}
                        position="relative"
                      >
                        <Box w="100%" h="100%" position="absolute">
                          <Image
                            fill
                            src="/furniture/四人沙發Ｗ230D105.png"
                            alt={`Furniture item ${index + 1}`}
                            style={{ objectFit: "contain" }}
                          />
                        </Box>
                        <Box
                          className="hover-text"
                          position="absolute"
                          bottom="0"
                          left="0"
                          right="0"
                          bg="rgba(0, 0, 0, 0.7)"
                          color="white"
                          opacity={0}
                          transition="opacity 0.15s ease-in-out"
                          p={2}
                        >
                          <Text fontSize="10px">四人沙發 W230D105</Text>
                        </Box>
                      </Button>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default FurnitureLibrary;
