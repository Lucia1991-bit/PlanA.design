import { useBoards } from "@/hooks/useBoards";
import BoardList from "./BoardList";
import EmptyBoard from "./EmptyBoard";

const BoardContent = () => {
  const { boards, fetching } = useBoards();

  if (fetching || boards === null) {
    return <BoardList />;
  }

  if (boards.length === 0) {
    return <EmptyBoard />;
  }

  return <BoardList />;
};

export default BoardContent;
