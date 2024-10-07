import React, { useState, useEffect } from "react";
import { Box, Flex, Text, keyframes } from "@chakra-ui/react";

interface ScrollIndicatorProps {
  isVisible: boolean;
  delay?: number;
}

const flowAnimation = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const fadeInAnimation = keyframes`
  0%, 70% { opacity: 0; }
  100% { opacity: 1; }
`;

const ScrollIndicator = ({ isVisible, delay }: ScrollIndicatorProps) => {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowIndicator(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay]);

  return (
    <Flex
      position="absolute"
      left={{ base: "6.2%", xl: "10%" }}
      top="85vh"
      zIndex={4}
      alignItems="flex-start"
      opacity={showIndicator ? 1 : 0}
      transition="opacity 1s ease-in-out"
    >
      <Box position="relative" height="300px" width="1.5px" overflow="hidden">
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bg="brand.secondary"
        />
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="80%"
          bg="brand.dark"
          animation={
            showIndicator ? `${flowAnimation} 3s linear infinite` : "none"
          }
        />
        <Box
          as="svg"
          viewBox="0 0 24 12"
          width="12px"
          height="6px"
          fill="none"
          stroke="brand.dark"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          position="absolute"
          bottom="-6px"
          left="50%"
          transform="translateX(-50%)"
          animation={
            showIndicator ? `${fadeInAnimation} 3s linear forwards` : "none"
          }
        >
          <path d="M2 2l10 8 10-8" />
        </Box>
      </Box>
      <Text
        fontSize={{ base: "sm", md: "md" }}
        fontWeight="400"
        color="brand.dark"
        transform="rotate(90deg)"
        ml="-8px"
        mt="15px"
        letterSpacing="0.1em"
      >
        Scroll
      </Text>
    </Flex>
  );
};

export default ScrollIndicator;
