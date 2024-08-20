import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  Spinner,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { useBoardOperations } from "@/hooks/useBoardOperations ";

const NewBoard = () => {
  const { createBoard, isLoading } = useBoardOperations();

  const buttonHeight = useBreakpointValue({ base: "80px", md: "100%" });
  const iconSize = useBreakpointValue({ base: "20px", md: "24px" });
  const fontSize = useBreakpointValue({ base: "14px", md: "16px" });

  const handleCreateBoard = () => {
    createBoard();
  };

  return (
    <Button
      color="white"
      width="100%"
      height={buttonHeight}
      bg="brand.primary"
      _hover={{ bg: "brand.hover" }}
      borderRadius="10px"
      isDisabled={isLoading}
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
        <AddIcon fontSize={iconSize} />
        <Text fontSize={fontSize} fontWeight="400">
          開新設計
        </Text>
      </VStack>
    </Button>
  );
};

export default NewBoard;
