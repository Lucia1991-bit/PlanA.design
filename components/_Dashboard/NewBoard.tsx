import { AddIcon } from "@chakra-ui/icons";
import { Button, Text, VStack } from "@chakra-ui/react";
import React from "react";

const NewBoard = () => {
  return (
    <Button
      width="100%"
      height="100%"
      bg="brand.primary"
      _hover={{ bg: "brand.hover" }}
    >
      <VStack
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        color="white"
      >
        <AddIcon fontSize="24px" />
        <Text fontSize="16px" fontWeight="400">
          開新設計
        </Text>
      </VStack>
    </Button>
  );
};

export default NewBoard;
