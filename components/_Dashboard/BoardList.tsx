"use client";

import { Box, Center, SimpleGrid, Text } from "@chakra-ui/react";
import Board from "./Board";
import BoardContainer from "./BoardContainer";
import BoardSkeleton from "./BoardSkeleton";
import NewBoard from "./NewBoard";

const BoardList = () => {
  return (
    <SimpleGrid
      columns={{ base: 1, md: 2, lg: 4, xl: 5 }}
      spacing={6}
      m={{ base: "10", lg: "20" }}
    >
      <BoardContainer bg="brand.primary">
        <NewBoard />
      </BoardContainer>
      <BoardContainer
        _hover={{
          "& .board-menu": { opacity: 1 },
          "& .board-thumbnail": {
            transform: "scale(1.1)",
            transition: "all 0.4s ease-in-out",
          },
          "& .board-overlay": {
            opacity: 0.3,
            transition: "opacity 0.3s ease-in-out",
          },
        }}
      >
        <Board />
      </BoardContainer>
      <BoardContainer>
        <BoardSkeleton />
      </BoardContainer>
    </SimpleGrid>
  );
};

export default BoardList;
