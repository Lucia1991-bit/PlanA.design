import { Box } from "@chakra-ui/react";

const Overlay = () => {
  return (
    <Box
      className="board-overlay"
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="brand.dark"
      opacity="0"
      transition="opacity 0.3s ease-in-out"
      pointerEvents="none"
      zIndex={2}
    />
  );
};

export default Overlay;
