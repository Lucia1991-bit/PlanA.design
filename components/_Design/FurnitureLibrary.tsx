import React, { useEffect, useState } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import SidePanelHeader from "../_UI/SidePanelHeader";
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  Select,
} from "@chakra-ui/react";
import Image from "next/image";
import useDesignPageColor from "@/hooks/useDesignPageColor";
import { Design } from "@/types/DesignType";
import { useFurniture } from "@/hooks/useFurniture";
import SidePanelCloseButton from "@/components/_UI/SidePanelCloseButton";

interface FurnitureLibraryProps {
  design: Design | undefined;
  closeSidePanel: () => void;
}

const FurnitureLibrary = ({
  design,
  closeSidePanel,
}: FurnitureLibraryProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [fetchType, setFetchType] = useState<"room" | "category">("room");
  const [showLoading, setShowLoading] = useState(true);

  const { data, isLoading, isError, error, prefetchNext, categories } =
    useFurniture(fetchType, activeTabIndex);

  const color = useDesignPageColor();

  useEffect(() => {
    // 設置最小顯示時間為 1000 毫秒（1 秒）
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    // 預取下一個類別的資料
    prefetchNext(index);
  };

  const handleFetchTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFetchType(e.target.value as "room" | "category");
    setActiveTabIndex(0);
  };

  const handleImageError = (furniture: any) => {
    console.error(`Failed to load image for furniture: ${furniture.name}`);
    // 可以在這裡實現fallback機制，例如顯示一個預設圖片
  };

  return (
    <>
      <VStack
        width="100%"
        height="100%"
        alignItems="stretch"
        spacing={2}
        p={4}
        overflowX="hidden"
      >
        <SidePanelHeader title="家具庫" description="選擇家具組件" />
        <Select
          value={fetchType}
          onChange={handleFetchTypeChange}
          my={2}
          fontSize="sm"
          size="sm"
          borderColor={color.toolBar.hover}
          color={color.toolBar.text}
          _focus={{
            bg: color.toolBar.hover,
            borderColor: color.toolBar.text,
            boxShadow: "none",
            outline: "none",
          }}
          _active={{
            boxShadow: "none",
          }}
        >
          <option value="room">按房間類別</option>
          <option value="category">按家具類別</option>
        </Select>
        <Tabs
          isFitted
          isLazy
          index={activeTabIndex}
          onChange={handleTabChange}
          flex={1}
          display="flex"
          flexDirection="column"
          overflow="hidden"
          borderColor="rgba(199,200,201, 0.35)"
        >
          <TabList whiteSpace="nowrap">
            {categories.map((category) => (
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
            {categories.map((category) => (
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
                {isLoading || showLoading ? (
                  <Flex
                    w="100%"
                    h="100%"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Spinner color={color.toolBar.subText} />
                  </Flex>
                ) : isError ? (
                  <Flex
                    w="100%"
                    h="100%"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text>發生錯誤，請稍後再試</Text>
                  </Flex>
                ) : (
                  <SimpleGrid columns={2} spacing={4} w="100%" py={5} px={1}>
                    {data?.map((furniture) => (
                      <Button
                        key={furniture.id}
                        onClick={() => design?.addFurniture(furniture.imageUrl)}
                        bg={color.toolBar.hover}
                        borderRadius="md"
                        width="100%"
                        height="115px"
                        overflow="hidden"
                        _hover={{
                          "& > .hover-text": { opacity: 1 },
                          boxShadow: "md",
                          transform: "scale(1.1)",
                        }}
                        transition="all 0.15s ease-in-out"
                        border={`0.5px solid #c7c8c8`}
                        position="relative"
                      >
                        <Box w="100%" h="100%" position="absolute">
                          <Image
                            fill
                            draggable="false"
                            src={furniture.imageUrl}
                            alt={furniture.name}
                            style={{ objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            onError={() => handleImageError(furniture)}
                            unoptimized // 添加這行以禁用 Next.js 的自動優化
                          />
                        </Box>
                        <Box
                          className="hover-text"
                          position="absolute"
                          bottom="0"
                          left="0"
                          right="0"
                          bg={color.toolBar.furniture_hover}
                          color="white"
                          opacity={0}
                          transition="opacity 0.15s ease-in-out"
                          p={2}
                        >
                          <Text
                            color={color.toolBar.furniture_text}
                            fontSize="12px"
                            zIndex={1}
                          >
                            {furniture.name}{" "}
                          </Text>
                          <Text
                            color={color.toolBar.furniture_text}
                            fontSize="10px"
                            zIndex={1}
                          >
                            {furniture.size}
                          </Text>
                        </Box>
                      </Button>
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
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

export default FurnitureLibrary;
