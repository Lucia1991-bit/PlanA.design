"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  HStack,
  List,
  ListItem,
  useDisclosure,
  Text,
  Box,
  transition,
  background,
  Flex,
  keyframes,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import AuthModal from "@/components/_NavBar/AuthModal";

//頁面初始加載時 NavBar向下滑動動畫
const slideDown = keyframes`
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
`;

//往下滑超過 banner時 NavBar出現背景色動畫
const slideDownBg = keyframes`
  0% { transform: scaleY(0); transform-origin: top; }
  100% { transform: scaleY(1); transform-origin: top; }
`;

const NavBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const threshold = 400;

      if (scrollPosition > threshold && !isScrolled) {
        setIsScrolled(true);
      } else if (scrollPosition <= threshold && isScrolled) {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // 初始檢查
    handleScroll();

    // 設置初始加載動畫
    setIsLoaded(true);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  return (
    <>
      <HStack
        as="nav"
        width="100%"
        opacity={isLoaded ? 1 : 0}
        height={
          isScrolled ? "80px" : { base: "80px", md: "150px", lg: "200px" }
        }
        animation={isLoaded ? `${slideDown} 0.5s ease-out` : "none"}
        transition="all 0.3s ease-in-out"
        position="fixed"
        top={0}
        justifyContent="center"
        alignItems="center"
        px={[2, 4, 6]}
        zIndex={10}
      >
        {/* 滑動背景 */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="rgba(255, 255, 255, 0.7)"
          backdropFilter="blur(4px)"
          boxShadow="sm"
          transform={isScrolled ? "scaleY(1)" : "scaleY(0)"}
          transformOrigin="top"
          transition="transform 0.3s ease-in-out"
          zIndex={-1}
        />
        <List
          maxWidth="1500px"
          width={{ base: "95%", md: "90%", lg: "1300px", xl: "1500px" }}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <ListItem>
            <Link href="/">
              <Box
                position="relative"
                width={{ base: "120px", md: "150px", lg: "175px", xl: "200px" }}
                height={{ base: "50px", md: "65px", lg: "75px", xl: "85px" }}
                transform={isScrolled ? "scale(0.7)" : "scale(1)"}
              >
                <Image
                  src="/LOGO.png"
                  alt="logo"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </Box>
            </Link>
          </ListItem>
          <Box>
            <Text
              as="span"
              transition="all 0.3s ease-in-out"
              transform={isScrolled ? "scale(0.7)" : "scale(1)"}
              fontSize={{ base: "16px", md: "18px", lg: "20px", xl: "22px" }}
              fontWeight="300"
              cursor="pointer"
              _hover={{
                borderBottom: "5px solid",
                borderColor: "brand.primary",
              }}
              onClick={onOpen}
              zIndex={10}
            >
              GET STARTED
            </Text>
          </Box>
        </List>
      </HStack>
      <AuthModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default NavBar;
