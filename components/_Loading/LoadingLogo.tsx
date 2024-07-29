import React from "react";
import { Box, keyframes } from "@chakra-ui/react";

const arcTransition = keyframes`
 0%, 100% { opacity: 0; }
  20%, 30% { opacity: 1; }
  40%, 100% { opacity: 0; }
`;

const LoadingLogo = () => {
  return (
    <Box
      width="100px"
      height="100px"
      backgroundColor="#c6332e"
      position="relative"
      overflow="hidden"
      borderRadius="10px"
    >
      {[1, 2, 3, 4].map((num) => (
        <Box
          key={num}
          as="svg"
          viewBox="0 0 100 100"
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          opacity={0}
          animation={`${arcTransition} 2s infinite`}
          sx={{
            animationDelay: `${(num - 1) * 0.4}s`,
          }}
        >
          <path
            d={
              num === 1
                ? "M0,0 A100,100 0 0,1 100,100"
                : num === 2
                ? "M100,0 A100,100 0 0,0 0,100"
                : num === 3
                ? "M100,100 A100,100 0 0,1 0,0"
                : "M0,100 A100,100 0 0,0 100,0"
            }
            fill="none"
            stroke="#c7c8c9"
            strokeWidth="6px"
            strokeLinecap="round"
          />
        </Box>
      ))}
    </Box>
  );
};

export default LoadingLogo;
