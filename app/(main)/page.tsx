"use client";

import { Box } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import SimpleLoadingPage from "@/components/_Loading/SimpleLoadingPage";
import BackgroundImage from "@/components/_HomePage/BackgroundImage";
import MainTitle from "@/components/_HomePage/MainTitle";
import Slogan from "@/components/_HomePage/Slogan";
import InstructionSection from "@/components/_HomePage/InstructionSection";

const HomePage = () => {
  const [mounted, setMounted] = useState(false);
  const [mainTitleAnimationComplete, setMainTitleAnimationComplete] =
    useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setMainTitleAnimationComplete(true);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return <SimpleLoadingPage />;

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
          top={{ base: "25%", lg: "40%" }}
          left={{ base: "50%", lg: "6%" }}
          transform={{ base: "translateX(-50%)", lg: "none" }}
          width={{ base: "85%", lg: "1300px" }}
          height={{ base: "200px", lg: "300px" }}
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignContent="center"
        >
          <MainTitle />
          {mainTitleAnimationComplete && <Slogan />}
        </Box>
      </Box>
      <InstructionSection />
    </Box>
  );
};

export default HomePage;
