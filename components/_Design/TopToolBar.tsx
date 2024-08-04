import { HStack } from "@chakra-ui/react";

const TopToolBar = () => {
  return (
    <HStack
      width="40%"
      height="80px"
      bg="gold"
      position="absolute"
      top="20px"
      left="50%"
      transform="translateX(-50%)"
      zIndex="2"
    ></HStack>
  );
};

export default TopToolBar;
