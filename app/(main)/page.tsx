"use client";

import { Box } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import LoadingPage from "@/components/_Loading/LoadingPage";
import BackgroundImage from "@/components/_HomePage/BackgroundImage";
import MainTitle from "@/components/_HomePage/MainTitle";
import Slogan from "@/components/_HomePage/Slogan";
import InstructionSection from "@/components/_HomePage/InstructionSection";
import ScrollIndicator from "@/components/_HomePage/ScrollIndicator";
import IntroSection from "@/components/_HomePage/IntroSection";

const HomePage = () => {
  const [mounted, setMounted] = useState(false);
  const [mainTitleAnimationComplete, setMainTitleAnimationComplete] =
    useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showIntroAnimation, setShowIntroAnimation] = useState(false);
  const introSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const contentTimer = setTimeout(() => {
      setMainTitleAnimationComplete(true);
      setShowScrollIndicator(true);
    }, 1300);

    const handleScroll = () => {
      if (introSectionRef.current) {
        const rect = introSectionRef.current.getBoundingClientRect();
        // 設置觸發點，例如滾動到螢幕高度的75%時觸發
        const triggerPoint = window.innerHeight * 0.75;

        if (rect.top <= triggerPoint && !showIntroAnimation) {
          setShowIntroAnimation(true);
          console.log("IntroSection animation triggered");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // 初始檢查
    handleScroll();

    return () => {
      clearTimeout(contentTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showIntroAnimation]);

  if (!mounted) return <LoadingPage />;

  return (
    <Box width="100%" overflowX="hidden">
      <Box
        as="main"
        position="relative"
        width="100%"
        height="100vh"
        zIndex={-1}
      >
        <BackgroundImage />
        <Box
          position="absolute"
          w="100%"
          h="100%"
          top="0"
          left="0"
          right={0}
          bottom={0}
          display="flex"
          justifyContent="center"
          px={{ base: "15px", md: "25px", lg: "40px" }}
        >
          <Box
            position="absolute"
            top={{ base: "25%", lg: "40%" }}
            maxWidth="1500px"
            width={{
              base: "90%",
              sm: "90%",
              md: "90%",
              lg: "90%",
            }}
            height={{
              base: "30vh",
              sm: "35vh",
              md: "40vh",
              lg: "45vh",
              xl: "50vh",
            }}
            maxHeight="500px"
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignContent="center"
          >
            <MainTitle />
            {mainTitleAnimationComplete && <Slogan />}
          </Box>
        </Box>
      </Box>
      {showScrollIndicator && <ScrollIndicator isVisible={true} delay={700} />}
      <Box ref={introSectionRef}>
        <IntroSection animate={showIntroAnimation} />
      </Box>
      <InstructionSection />
    </Box>
  );
};

export default HomePage;
