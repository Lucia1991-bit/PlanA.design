"use client";

import React, { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Show, Text, VStack } from "@chakra-ui/react";
import { useDesignColorMode } from "@/context/colorModeContext";
import useCanvasGridColor from "@/hooks/useDesignColor";
import { useAuth } from "@/hooks/useAuth";
import Canvas from "@/components/_Design/Canvas";
import useSingleBoard from "@/hooks/useSingleBoard";
import useCanvasStore from "@/stores/useCanvasStore";
import TopToolBar from "@/components/_Design/TopToolBar";
import Info from "@/components/_Design/Info";
import LogoLoadingPage from "@/components/_Loading/LogoLoadingPage";

const DesignPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();

  const boardId = params.id as string;
  const { board, fetching, error } = useSingleBoard(boardId);

  const { useDesignColorModeValue } = useDesignColorMode();

  const bgColor = useDesignColorModeValue(
    "brand.primary_light",
    "brand.dark_hover"
  );
  const textColor = useDesignColorModeValue(
    "brand.dark",
    "brand.primary_light"
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const isLoading = useMemo(() => {
    return authLoading || fetching;
  }, [authLoading, fetching]);

  if (isLoading) {
    return <LogoLoadingPage text="get ready to design!" />;
  }

  if (error) {
    return <div>發生錯誤</div>;
  }

  return (
    <>
      <Show above="md">
        <Box
          w="100%"
          h="100vh"
          overflow="hidden"
          bg={bgColor}
          color={textColor}
          position="relative"
        >
          <Info />
          <TopToolBar />
          {/* 成功獲取到設計資料才渲染畫布 */}
          {board && <Canvas board={board} />}
        </Box>
      </Show>
      <Show below="md">
        <VStack
          w="100%"
          h="100vh"
          justify="center"
          align="center"
          bg={bgColor}
          color={textColor}
        >
          <Text fontSize="xl" fontWeight="bold">
            請使用桌面版瀏覽器以獲得最佳設計體驗
          </Text>
          <Text>您當前的設備螢幕太小，無法提供完整的設計功能。</Text>
        </VStack>
      </Show>
    </>
  );
};

export default DesignPage;
