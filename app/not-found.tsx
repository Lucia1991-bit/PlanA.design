"use client";

import {
  Box,
  Button,
  HStack,
  Link as ChakraLink,
  List,
  ListItem,
  Text,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import Interactive404Canvas from "@/components/error/Interactive404Canvas";

const NotFound = () => {
  return (
    <Box
      width="100%"
      height="100vh"
      overflowX="hidden"
      bg="#ecebeb"
      color="brand.dark"
      position="relative"
    >
      <HStack
        as="nav"
        width="100%"
        top={0}
        left={0}
        right={0}
        bottom={0}
        height={{ base: "100px", md: "120px", lg: "200px" }}
        transition="all 0.3s ease-in-out"
        position="fixed"
        justifyContent="center"
        alignItems="center"
        px={{ base: "15px", md: "25px", lg: "40px" }}
        zIndex={10}
      >
        <List
          className="navBar-container"
          maxWidth="1500px"
          width={{
            base: "90%",
            sm: "90%",
            md: "90%",
            lg: "1300px",
            xl: "1500px",
          }}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          {/* LOGO */}
          <ListItem>
            <Link href="/">
              {/* LOGO 在使用者往下滑時縮小 */}
              <Box
                position="relative"
                width={{ base: "90px", md: "120px", lg: "175px" }}
                height={{ base: "38px", md: "65px", lg: "75px" }}
              >
                <Image
                  src="/LOGO.png"
                  alt="logo"
                  sizes="100%"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </Box>
            </Link>
          </ListItem>
        </List>
      </HStack>
      <Interactive404Canvas />
      <VStack
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        spacing={8}
        zIndex={2}
        pointerEvents="none" // 允許點擊穿透到底層的 canvas
      >
        <Box height={{ base: "130px", md: "200px" }} pointerEvents="auto" />{" "}
        {/* 為 404 腾出空間，但允許互動 */}
        <Text
          fontSize={{ base: "sm", md: "lg" }}
          fontWeight="medium"
          pointerEvents="auto" // 使文字可以被選中
        >
          很抱歉，訪問的頁面不存在
        </Text>
        <Link href="/" passHref legacyBehavior>
          <ChakraLink pointerEvents="auto">
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
    </Box>
  );
};

export default NotFound;
