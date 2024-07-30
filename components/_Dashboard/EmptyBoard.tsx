import { Box, Button, Stack, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";

const EmptyBoard = () => {
  return (
    <VStack
      align="center"
      justify="center"
      width="100%"
      height="100%"
      minHeight="calc(100vh - 95px)"
      bg="green"
      position="absolute"
      top="50%"
      transform="translateY(-50%)"
    >
      <Box
        position="relative"
        width={{ base: "200px", md: "250px", lg: "300px" }}
        height={{ base: "200px", md: "250px", lg: "300px" }}
      >
        <Image
          src="/boards/empty-design.svg"
          layout="fill"
          objectFit="contain"
          priority
          alt="Empty Design"
        />
      </Box>
      <Text
        fontSize={{ base: "20px", lg: "25px" }}
        fontWeight="600"
        letterSpacing={2}
      >
        目前還沒有設計項目
      </Text>
      <Text
        fontSize={{ base: "14px", lg: "16px" }}
        color="brand.third"
        mt="-10px"
      >
        快來創建您的第一個設計吧！
      </Text>
      <Button
        fontWeight="400"
        bg="brand.primary"
        color="white"
        size={{ base: "md", lg: "lg" }}
        _hover={{
          bg: "#a02d2d",
        }}
      >
        START
      </Button>
    </VStack>
  );
};

export default EmptyBoard;
