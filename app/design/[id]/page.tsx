"use client";

import { useParams, useRouter, notFound } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Text,
  useBreakpointValue,
  VStack,
  Link as ChakraLink,
  Button,
} from "@chakra-ui/react";
import { useDesignColorMode } from "@/context/colorModeContext";
import { useAuth } from "@/hooks/useAuth";
import useSingleBoard from "@/hooks/useSingleBoard";
import LogoLoadingPage from "@/components/_Loading/LogoLoadingPage";
import DesignEditor from "@/components/_Design/DesignEditor";
import Error from "@/app/error";
import NotFound from "@/app/not-found";
import Link from "next/link";

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
    return <Error />;
  }

  if (!board) {
    return <NotFound />;
  }

  return (
    <>
      {isDesktop ? (
        <DesignEditor board={board} userId={user?.uid} />
      ) : (
        <MobileWarning />
      )}
    </>
  );
};

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
    <VStack
      w="90%"
      textAlign="center"
      justifyContent="center"
      alignItems="center"
      spacing={1}
    >
      <Text fontSize={{ base: "md", md: "22px" }} fontWeight="bold">
        請使用桌面版瀏覽器以獲得最佳設計體驗
      </Text>
      <Text fontSize={{ base: "12px", md: "md" }}>
        您當前的設備螢幕太小，無法提供完整的設計功能
      </Text>
      <Link href="/" passHref legacyBehavior>
        <ChakraLink pointerEvents="auto" mt={5}>
          <Button
            mt={{ base: "-15px", md: "-10px" }}
            fontWeight="300"
            size={{ base: "sm", md: "md" }}
            borderColor="brand.light"
            bg="brand.light"
            color="brand.dark"
            variant="ghost"
            _hover={{
              bg: "brand.secondary",
              color: "brand.dark",
            }}
          >
            返回首頁
          </Button>
        </ChakraLink>
      </Link>
    </VStack>
  </VStack>
);

export default DesignPage;
