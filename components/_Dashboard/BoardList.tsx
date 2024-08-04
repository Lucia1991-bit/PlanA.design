"use client";
import { useEffect, useState } from "react";
import {
  SimpleGrid,
  useBreakpointValue,
  useMediaQuery,
} from "@chakra-ui/react";
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
  //檢查是不是移動設備
  const [isMobileOrTablet] = useMediaQuery("(max-width: 1024px)");

  useEffect(() => {
    setSkeletonCount(Math.min(Math.max(columns, 1), columns * 2));
  }, [columns]);

  const renderContent = () => {
    if (!boards) {
      return null;
    }

    //加載中，顯示skeleton
    if (fetching) {
      return (
        <>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <BoardContainer key={`skeleton-${index}`}>
              <BoardSkeleton />
            </BoardContainer>
          ))}
        </>
      );
    }

    //沒有資料，顯示空版頁面
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
            _hover={
              isMobileOrTablet
                ? {}
                : {
                    boxShadow: "lg",
                    "& .board-menu": { opacity: 1 },
                    "& .board-thumbnail": { transform: "scale(1.1)" },
                    "& .board-overlay": { opacity: 0.3 },
                  }
            }
          >
            <Board board={board} />
          </BoardContainer>
        ))}
      </>
    );
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4, xl: 5 }} spacing={6}>
      {renderContent()}
    </SimpleGrid>
  );
};

export default BoardList;
