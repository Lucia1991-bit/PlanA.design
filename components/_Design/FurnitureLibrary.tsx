import React, { useEffect, useState } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import SidePanelHeader from "../_UI/SidePanelHeader";
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Select,
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
import { useFurniture } from "@/hooks/useFurniture";
import { ROOM_CATEGORIES, FURNITURE_CATEGORIES } from "@/types/FurnitureType";

interface FurnitureLibraryProps {
  design: Design | undefined;
}

const getPublicImageUrl = async (imagePath: string) => {
  const storage = getStorage();
  const imageRef = ref(storage, imagePath);
  try {
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.error("Error getting download URL:", error);
    return null;
  }
};

const FurnitureLibrary = ({ design }: FurnitureLibraryProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [fetchType, setFetchType] = useState<"room" | "category">("room");

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data, isLoading, isError, error, prefetchNext, categories } =
    useFurniture(fetchType, activeTabIndex);

  const color = useDesignPageColor();

  //獲取 Tab改變
  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    // 預取下一個類別的資料
    prefetchNext(index);
  };

  //獲取 Select類別改變
  const handleFetchTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFetchType(e.target.value as "room" | "category");
    setActiveTabIndex(0); // 當切換類別時，重置選擇的索引
  };

  return (
    <VStack width="100%" height="100%" alignItems="stretch" spacing={2} p={4}>
      <SidePanelHeader title="家具庫" description="請選擇家具組件" />
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
              {isLoading ? (
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
                <SimpleGrid
                  columns={2}
                  spacing={4}
                  w="100%"
                  h="100%"
                  py={5}
                  px={1}
                >
                  {data?.map((furniture) => (
                    <Box key={furniture.id} position="relative">
                      <Button
                        onClick={() => design?.addFurniture(furniture.imageUrl)}
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
                            src={furniture.imageUrl}
                            alt={furniture.name}
                            style={{ objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, 50vw"
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
                          <Text fontSize="10px">{furniture.name} </Text>
                          <Text fontSize="10px">{furniture.size}</Text>
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
