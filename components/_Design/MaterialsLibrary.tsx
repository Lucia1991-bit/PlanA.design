import React, { useEffect, useState } from "react";
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
import SidePanelCloseButton from "../_UI/SidePanelCloseButton";
import { Design } from "@/types/DesignType";
import { useMaterials } from "@/hooks/useMaterials";

interface MaterialsLibraryProps {
  design: Design | undefined;
  closeSidePanel: () => void;
}

const MaterialsLibrary = ({
  design,
  closeSidePanel,
}: MaterialsLibraryProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showLoading, setShowLoading] = useState(true);

  const { data, isLoading, isError, error, prefetchNext, categories } =
    useMaterials(activeTabIndex);

  const color = useDesignPageColor();

  useEffect(() => {
    // 設置最小顯示時間為 800 毫秒
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    // 預取下一個類別的資料
    prefetchNext(index);
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
                    {data?.map((material) => (
                      <Button
                        key={material.id}
                        bg={color.toolBar.hover}
                        borderRadius="md"
                        width="100%"
                        height="115px"
                        overflow="hidden"
                        _hover={{
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
                            src={material.small_imageUrl}
                            alt={material.name}
                            style={{ objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            unoptimized // 添加這行以禁用 Next.js 的自動優化
                          />
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

export default MaterialsLibrary;
