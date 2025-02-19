"use client";

import { Box } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import LoadingPage from "@/components/loading/LoadingPage";
import BackgroundImage from "@/components/homePage/BackgroundImage";
import MainTitle from "@/components/homePage/MainTitle";
import Slogan from "@/components/homePage/Slogan";
import InstructionSection from "@/components/homePage/InstructionSection";
import ScrollIndicator from "@/components/homePage/ScrollIndicator";
import IntroSection from "@/components/homePage/IntroSection";
import { usePageLoading } from "@/context/PageLoadingContext";

const HomePage = () => {
  const [mounted, setMounted] = useState(false);
  const [mainTitleAnimationComplete, setMainTitleAnimationComplete] =
    useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showIntroAnimation, setShowIntroAnimation] = useState(false);
  const [showInstructionAnimation, setShowInstructionAnimation] =
    useState(false);
  const introSectionRef = useRef<HTMLDivElement>(null);
  const instructionSectionRef = useRef<HTMLDivElement>(null);

  const { setIsPageLoading } = usePageLoading();

  useEffect(() => {
    // 延長 loading 效果
    const mountTimer = setTimeout(() => {
      setMounted(true);
      setIsPageLoading(false);
    }, 1000);

    return () => clearTimeout(mountTimer);
  }, [setIsPageLoading]);

  useEffect(() => {
    if (mounted) {
      const contentTimer = setTimeout(() => {
        setMainTitleAnimationComplete(true);
        setShowScrollIndicator(true);
      }, 1300);

      const handleScroll = () => {
        const triggerPoint = window.innerHeight * 0.7;

        if (introSectionRef.current) {
          const introRect = introSectionRef.current.getBoundingClientRect();
          if (introRect.top <= triggerPoint && !showIntroAnimation) {
            setShowIntroAnimation(true);
          }
        }

        if (instructionSectionRef.current) {
          const instructionRect =
            instructionSectionRef.current.getBoundingClientRect();
          if (
            instructionRect.top <= triggerPoint &&
            !showInstructionAnimation
          ) {
            setShowInstructionAnimation(true);
          }
        }
      };

      window.addEventListener("scroll", handleScroll);
      handleScroll();

      return () => {
        clearTimeout(contentTimer);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [mounted, showIntroAnimation, showInstructionAnimation]);

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
          px={{ base: "15px", md: "25px", lg: "30px" }}
        >
          <Box
            position="absolute"
            top={{ base: "25%", lg: "40%" }}
            maxWidth="1300px"
            width={{
              base: "90%",
              sm: "90%",
              md: "90%",
              lg: "90%",
              xl: "1300px",
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
      <Box ref={instructionSectionRef}>
        <InstructionSection animate={showInstructionAnimation} />
      </Box>
    </Box>
  );
};

export default HomePage;
