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
  VStack,
} from "@chakra-ui/react";
import useDesignColor from "@/hooks/useDesignColor";
import image from "next/image";
import Image from "next/image";

// 預定義類別
const CATEGORIES = ["石材", "木地板", "磁磚", "戶外"];

const MaterialsLibrary = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const color = useDesignColor();

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    // 預取下一個類別的資料
  };

  return (
    <VStack width="100%" height="100%" alignItems="stretch" spacing={2} p={4}>
      <SidePanelHeader title={"材質庫"} description={"請選擇地板材質"} />
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
                  {/* 模擬內容 */}
                  {Array.from({ length: 20 }).map((_, index) => (
                    <Button
                      key={index}
                      bg="transparent"
                      borderRadius="md"
                      width="100%"
                      height="115px"
                      overflow="hidden"
                      _hover={{
                        boxShadow: "lg",
                        transform: "scale(1.03)",
                        transition: "transform 0.15s ease-in-out",
                      }}
                      border={`0.5px solid ${color.toolBar.hover}`}
                    >
                      <Image fill src="/wood1.jpg" alt="marble1" />
                    </Button>
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

export default MaterialsLibrary;
