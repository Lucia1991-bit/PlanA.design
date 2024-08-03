import { useBoardOperations } from "@/hooks/useBoardOperations ";
import { Box, Button, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";

const EmptyBoard = () => {
  const { createBoard, isLoading } = useBoardOperations();

  const handleCreateBoard = () => {
    createBoard();
  };

  return (
    <VStack
      align="center"
      justify="center"
      width="100%"
      height="100%"
      minHeight="calc(100vh - 95px)"
      position="absolute"
      top="0"
      left="0"
    >
      <Box
        position="relative"
        width={{ base: "180px", md: "250px", lg: "290px" }}
        height={{ base: "180px", md: "250px", lg: "290px" }}
      >
        <Image
          src="/boards/empty-design.svg"
          fill
          style={{ objectFit: "contain" }}
          priority
          alt="Empty Design"
        />
      </Box>
      <Text
        mt={2}
        fontSize={{ base: "19px", lg: "25px" }}
        fontWeight="600"
        letterSpacing={2}
      >
        目前還沒有設計項目
      </Text>
      <Text
        fontSize={{ base: "13px", lg: "16px" }}
        color="brand.third"
        mt="-10px"
      >
        快來創建您的第一個設計吧！
      </Text>
      <Button
        mt={4}
        fontWeight="400"
        letterSpacing={2}
        bg="brand.primary"
        color="white"
        size={{ base: "sm", lg: "lg" }}
        _hover={{
          bg: "#a02d2d",
        }}
        isLoading={isLoading}
        onClick={handleCreateBoard}
      >
        START
      </Button>
    </VStack>
  );
};

export default EmptyBoard;
