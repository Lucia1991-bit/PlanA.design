"use client";
import { Box, Text, transition, useBreakpointValue } from "@chakra-ui/react";
import { motion, AnimatePresence, stagger, delay } from "framer-motion";
import { Damion } from "next/font/google";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const MotionBox = motion(Box);
const MotionText = motion(Text);

//標語
const slogans = [
  "for your work.",
  "for your home.",
  "for your life.",
  "for your dream.",
];

const HomePage = () => {
  //確保component只在客戶端渲染後才顯示內容
  const [mounted, setMounted] = useState(false);
  const [currentSlogan, setCurrentSlogan] = useState(0);
  const [mainTitleAnimationComplete, setMainTitleAnimationComplete] =
    useState(false);

  const imageSrc = useBreakpointValue({
    base: "https://res.cloudinary.com/datj4og4i/image/upload/v1722068270/%E6%89%8B%E6%A9%9F%E7%89%88%E9%A6%96%E5%9C%96_lg7pku.png",
    md: "https://res.cloudinary.com/datj4og4i/image/upload/v1722068272/%E9%9B%BB%E8%85%A6%E7%89%88%E9%A6%96%E5%9C%96_ky6vuu.png",
  });

  useEffect(() => {
    setMounted(true);

    //等待 shape your plan 動畫完成後開始 for your...動畫循環
    const timer = setTimeout(() => {
      setMainTitleAnimationComplete(true);
    }, 1500); // 幾秒後開始 slogan 動畫

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mainTitleAnimationComplete) {
      const interval = setInterval(() => {
        setCurrentSlogan((prev) => (prev + 1) % slogans.length);
      }, 2300);
      return () => clearInterval(interval);
    }
  }, [mainTitleAnimationComplete]);

  const mainTitleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const sloganVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // 增加間隔時間
        delayChildren: 0.1,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: 0.4,
      },
    },
  };

  if (!mounted) return null;

  return (
    <Box width="100%" overflowX="hidden">
      <Box position="relative" width="100%" height="100vh" zIndex={-1}>
        <MotionBox
          position="relative"
          width="115%" // 增加容器寬度
          height="100vh"
          zIndex={-1}
          initial={{ x: "0%", opacity: 0 }}
          animate={{ x: "-8%", opacity: 1 }} // 向左移動容器
          transition={{
            x: { duration: 10, ease: "easeOut" }, //移動動畫
            opacity: { duration: 1.5, ease: "easeIn" }, //淡入動畫
          }}
          style={{
            right: "0", // 確保右側對齊
          }}
        >
          <Image
            src={imageSrc}
            alt="Responsive Image"
            fill
            objectFit="cover"
            priority
          />
        </MotionBox>
        <Box
          position="absolute"
          top={{ base: "23%", lg: "40%" }}
          left={{ base: "50%", lg: "6%" }}
          transform={{ base: "translateX(-50%)", lg: "none" }}
          width={{ base: "90%", lg: "1300px" }}
          height={{ base: "200px", lg: "300px" }}
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignContent="center"
        >
          {/* 標題shape a plan動畫 */}
          <MotionText
            ket="main-title"
            variants={mainTitleVariants}
            initial="hidden"
            animate="visible"
            whiteSpace="nowrap"
            fontWeight="200"
            fontSize={{ base: "40px", md: "55px", lg: "70px" }}
          >
            {"SHAPE A PLAN".split("").map((char, index) => (
              <motion.span key={index} variants={letterVariants}>
                {char}
              </motion.span>
            ))}
          </MotionText>

          {/* For your...動畫 */}
          <AnimatePresence mode="wait">
            {mainTitleAnimationComplete && (
              <MotionText
                key={currentSlogan}
                variant={sloganVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
                whiteSpace="nowrap"
                fontWeight="300"
                fontSize={{ base: "45px", md: "63px", lg: "80px" }}
                mt="-20px"
                color="brand.primary"
              >
                {slogans[currentSlogan].split("").map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.1, delay: index * 0.05 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </MotionText>
            )}
          </AnimatePresence>
        </Box>
      </Box>
      <Box width="100%" height="200vh">
        <div>說明</div>
      </Box>
    </Box>
  );
};

export default HomePage;
