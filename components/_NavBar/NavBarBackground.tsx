import { Box } from "@chakra-ui/react";

interface NavBarBackgroundProps {
  isScrolled: boolean;
}

const NavBarBackground = ({ isScrolled }: NavBarBackgroundProps) => {
  return (
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
  );
};

export default NavBarBackground;
