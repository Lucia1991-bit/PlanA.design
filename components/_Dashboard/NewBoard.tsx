import { AddIcon } from "@chakra-ui/icons";
import { Button, Spinner, Text, VStack } from "@chakra-ui/react";
import { useCreateBoard } from "@/hooks/useCreateBoard";

const NewBoard = () => {
  const { createBoard, isCreating } = useCreateBoard();

  const handleCreateBoard = () => {
    createBoard();
  };

  return (
    <Button
      color="white"
      width="100%"
      height="100%"
      bg="brand.primary"
      _hover={{ bg: "brand.hover" }}
      borderRadius="10px"
      isDisabled={isCreating}
      onClick={handleCreateBoard}
      _disabled={{
        cursor: "auto",
      }}
      position="relative"
      overflow="hidden"
    >
      <VStack
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
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
