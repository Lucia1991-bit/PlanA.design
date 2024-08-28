import React, { useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Show,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaCircleChevronRight } from "react-icons/fa6";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";

const MotionBox = motion(Box);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);
const MotionFlex = motion(Flex);

interface IntroSectionProps {
  animate: boolean;
}

const IntroSection: React.FC<IntroSectionProps> = ({ animate }) => {
  const controls = useAnimation();

  useEffect(() => {
    console.log("IntroSection animate prop:", animate);
    if (animate) {
      controls.start("visible");
    }
  }, [animate, controls]);

  const letterVariants = {
    hidden: {
      y: 20,
      opacity: 0.1,
      color: "#f9f9f8",
    },
    visible: {
      y: 0,
      opacity: 1,
      color: ["#f9f9f8", "#c7c8c8", "#c6332e"],
      transition: {
        y: { type: "spring", damping: 10, stiffness: 100, duration: 0.5 },
        opacity: { duration: 0.5 },
        color: {
          times: [0, 0.1, 1], // 调整颜色变化的时间点，减少白色停留时间
          duration: 1, // 缩短整个颜色变化过程至1秒
          ease: "easeInOut",
        },
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 1 + custom * 0.3, // Increase delay between items
        duration: 0.8,
        ease: "easeOut",
      },
    }),
  };

  return (
    <Box
      width="100%"
      minHeight="75vh"
      bg="brand.light"
      display="flex"
      justifyContent="center"
      alignItems="center"
      py={10}
    >
      <Box
        maxWidth="1300px"
        width="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        px={6}
      >
        <MotionFlex
          width="100%"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          justifyContent={{ base: "center", lg: "flex-start" }}
          pl={{ base: "0", lg: "95px" }}
        >
          {"ABOUT".split("").map((letter, index) => (
            <MotionText
              key={index}
              variants={letterVariants}
              fontSize={{ base: "22px", md: "26px", lg: "30px" }}
              fontWeight="300"
              letterSpacing={6}
            >
              {letter}
            </MotionText>
          ))}
        </MotionFlex>
        <Flex
          w="100%"
          flexDirection={{ base: "column", lg: "row" }}
          justifyContent="center"
          alignItems="center"
          mt={8}
          gap={6}
        >
          <MotionBox
            position="relative"
            maxWidth={{ base: "300px", md: "400px", lg: "600px" }}
            width="100%"
            height={{ base: "200px", md: "250px", lg: "400px" }}
            variants={contentVariants}
            custom={0}
            initial="hidden"
            animate={controls}
          >
            <Image
              src="/floorPlan2.png"
              alt="floor-plan"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "contain" }}
              priority
            />
          </MotionBox>
          <VStack
            p={2}
            zIndex={4}
            align={{ base: "center", lg: "flex-start" }}
            flex={0.8}
            spacing={4}
          >
            <MotionHeading
              as="h2"
              fontSize={{ base: "26px", md: "30px", lg: "35px" }}
              color="brand.dark"
              fontWeight="400"
              letterSpacing="1px"
              whiteSpace="nowrap"
              variants={contentVariants}
              custom={1}
              initial="hidden"
              animate={controls}
              mb={{ base: "10px", lg: "18px" }}
            >
              簡單步驟&nbsp;&nbsp;&nbsp;無限可能
            </MotionHeading>
            <MotionHeading
              as="h3"
              fontSize={{ base: "18px", md: "20px", lg: "22px" }}
              fontWeight="400"
              letterSpacing="1px"
              variants={contentVariants}
              custom={2}
              initial="hidden"
              animate={controls}
            >
              輕鬆創建居家平面配置圖，實現每一個靈感
            </MotionHeading>
            <VStack
              spacing={2}
              width="100%"
              alignItems={{ base: "center", lg: "flex-start" }}
            >
              {[
                "直觀易用的操作介面，每個人都能輕鬆上手",
                "從個人房間到整套住宅，均可繪製",
                "豐富的家具和裝飾元素選擇，滿足多元設計需求",
              ].map((text, index) => (
                <MotionBox
                  key={index}
                  variants={contentVariants}
                  custom={index + 3}
                  initial="hidden"
                  animate={controls}
                  width="100%"
                >
                  <HStack
                    spacing={3}
                    alignItems="center"
                    justifyContent={{ base: "center", lg: "flex-start" }}
                  >
                    <Show above="lg">
                      <Box flexShrink={0}>
                        <FaCircleChevronRight color="#c6332e" size="16px" />
                      </Box>
                    </Show>
                    <Text
                      whiteSpace={index === 0 ? "nowrap" : "normal"}
                      fontSize={{ base: "14px", md: "15px", lg: "16px" }}
                      color="brand.third"
                    >
                      {text}
                    </Text>
                  </HStack>
                </MotionBox>
              ))}
            </VStack>
          </VStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default IntroSection;
