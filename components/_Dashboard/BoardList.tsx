"use client";
import { useEffect, useState } from "react";
import { SimpleGrid, useBreakpointValue } from "@chakra-ui/react";
import Board from "./Board";
import BoardContainer from "./BoardContainer";
import BoardSkeleton from "./BoardSkeleton";
import NewBoard from "./NewBoard";
import EmptyBoard from "./EmptyBoard";
import { BoardType } from "@/types/BoardType";

interface BoardListProps {
  boards: BoardType[] | null;
  fetching: boolean;
}

const BoardList = ({ boards, fetching }: BoardListProps) => {
  const [skeletonCount, setSkeletonCount] = useState(0);
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 4, xl: 5 }) || 1;

  useEffect(() => {
    setSkeletonCount(columns - 1);
  }, [columns]);

  const renderContent = () => {
    if (!boards || fetching) {
      return (
        <>
          <BoardContainer bg="brand.primary">
            <NewBoard />
          </BoardContainer>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <BoardContainer key={`skeleton-${index}`}>
              <BoardSkeleton />
            </BoardContainer>
          ))}
        </>
      );
    }

    if (boards.length === 0) {
      return <EmptyBoard />;
    }

    return (
      <>
        <BoardContainer bg="brand.primary">
          <NewBoard />
        </BoardContainer>
        {boards.map((board) => (
          <BoardContainer
            key={board.id}
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
            <Board board={board} />
          </BoardContainer>
        ))}
      </>
    );
  };

  return (
    <SimpleGrid
      columns={{ base: 1, md: 2, lg: 4, xl: 5 }}
      spacing={6}
      m={{ base: "10", lg: "20" }}
    >
      {renderContent()}
    </SimpleGrid>
  );
};

export default BoardList;
