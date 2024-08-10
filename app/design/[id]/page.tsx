"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Text, useBreakpointValue, VStack } from "@chakra-ui/react";
import { useDesignColorMode } from "@/context/colorModeContext";
import { useAuth } from "@/hooks/useAuth";
import useSingleBoard from "@/hooks/useSingleBoard";
import LogoLoadingPage from "@/components/_Loading/LogoLoadingPage";
import DesignEditor from "@/components/_Design/DesignEditor";
import Image from "next/image";

const DesignPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  const boardId = params.id as string;
  const { board, fetching, error } = useSingleBoard(boardId);
  const { useDesignColorModeValue } = useDesignColorMode();

  const [showLoading, setShowLoading] = useState(true);

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

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (showLoading) {
    return <LogoLoadingPage text="get ready to design!" />;
  }

  if (error) {
    return <ErrorDisplay message="發生錯誤，請稍後再試" />;
  }

  if (!board) {
    return <ErrorDisplay message="找不到設計板，請確認網址是否正確" />;
  }

  return (
    <>
      {isDesktop ? (
        <Box
          w="100%"
          h="100vh"
          overflow="hidden"
          position="relative"
          bg={bgColor}
        >
          <DesignEditor board={board} />
        </Box>
      ) : (
        <MobileWarning />
      )}
    </>
  );
};

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay = ({ message }: ErrorDisplayProps) => (
  <VStack
    w="100%"
    h="100vh"
    justify="center"
    align="center"
    spacing={4}
    bg="#ecebeb"
    color="brand.dark"
  >
    <Text fontSize={{ base: "md", md: "xl" }} fontWeight="bold">
      {message}
    </Text>
  </VStack>
);

const MobileWarning = () => (
  <VStack
    w="100%"
    h="100vh"
    justify="center"
    align="center"
    spacing={4}
    bg="#ecebeb"
    color="brand.dark"
  >
    <Box
      width={{ base: "150px", md: "250px" }}
      height={{ base: "150px", md: "250px" }}
      position="relative"
    >
      <Image
        src="/warning.svg"
        alt="warning"
        fill
        style={{ objectFit: "contain" }}
        priority
      />
    </Box>
    <Box w="90%" textAlign="center">
      <Text fontSize={{ base: "md", md: "22px" }} fontWeight="bold">
        請使用桌面版瀏覽器以獲得最佳設計體驗
      </Text>
      <Text fontSize={{ base: "12px", md: "md" }}>
        您當前的設備螢幕太小，無法提供完整的設計功能
      </Text>
    </Box>
  </VStack>
);

export default DesignPage;
