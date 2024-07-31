"use client";
import React, { useEffect, useState } from "react";
import {
  HStack,
  List,
  ListItem,
  useDisclosure,
  Text,
  Box,
  keyframes,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import AuthModal from "@/components/_NavBar/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import ProfileMenu from "./ProfileMenu";
import NavBarBackground from "./NavBarBackground";

//頁面初始加載時 NavBar向下滑動動畫
const slideDown = keyframes`
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
`;

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  //管理登入/註冊 modal開關狀態
  const { isAuthModalOpen, openAuthModal, closeAuthModal, user, isLoading } =
    useAuth();

  // NavBar 的高度和樣式會根據 isScrolled 和 isLoaded 狀態動態變化
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const threshold = 100;

      if (scrollPosition > threshold && !isScrolled) {
        setIsScrolled(true);
      } else if (scrollPosition <= threshold && isScrolled) {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // 初始檢查
    handleScroll();

    // 設置初始加載頁面時 NavBar向下滑動動畫
    setIsLoaded(true);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  //加在頁面時檢查使用者登入狀態需要時間，防止閃現另一種狀態的按鈕
  if (isLoading) {
    return null;
  }

  return (
    <>
      {/* 使用者往下滑時 NavBar高度變化並加上背景色 */}
      <HStack
        as="nav"
        width="100%"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={isLoaded ? 1 : 0}
        height={
          isScrolled ? "65px" : { base: "100px", md: "150px", lg: "200px" }
        }
        animation={isLoaded ? `${slideDown} 0.5s ease-out` : "none"}
        transition="all 0.3s ease-in-out"
        position="fixed"
        justifyContent="center"
        alignItems="center"
        px={{ base: "15px", lg: "80px" }}
        zIndex={10}
      >
        {/* 使用者往下滑時NavBar出現背景色 */}
        <NavBarBackground isScrolled={isScrolled} />
        <List
          maxWidth="1800px"
          width={{
            base: "90%",
            sm: "90%",
            md: "90%",
            lg: "1500px",
            xl: "1800px",
          }}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          {/* LOGO */}
          <ListItem>
            <Link href="/">
              {/* LOGO在使用者往下滑時縮小 */}
              <Box
                position="relative"
                width={{ base: "120px", md: "150px", lg: "175px" }}
                height={{ base: "50px", md: "65px", lg: "75px" }}
                transform={
                  isScrolled
                    ? { base: "scale(0.9)", lg: "scale(0.5)", xl: "scale(0.6)" }
                    : "scale(1)"
                }
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
            {/* 若沒登入，顯示登入/註冊按鈕，若已登入，顯示使用者 Menu */}
          </ListItem>
          {user ? (
            <ProfileMenu />
          ) : (
            <Box>
              {/* 按鈕在使用者往下滑時縮小 */}
              <Text
                as="span"
                transition="all 0.3s ease-in-out"
                fontSize={
                  isScrolled
                    ? { lg: "16px", xl: "18px" }
                    : { base: "16px", md: "18px", lg: "20px", xl: "22px" }
                }
                fontWeight="300"
                cursor="pointer"
                _hover={{
                  borderBottom: { base: "3px solid", lg: "5px solid" },
                  borderColor: { base: "brand.primary", lg: "brand.primary" },
                }}
                onClick={openAuthModal}
                zIndex={10}
              >
                GET STARTED
              </Text>
            </Box>
          )}
        </List>
      </HStack>
      {/* 登入/註冊 modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
};

export default NavBar;
