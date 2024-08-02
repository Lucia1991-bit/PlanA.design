import { useEffect, useState } from "react";
import { Box, Card, CardBody, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import BoardMenu from "./BoardMenu";
import Overlay from "./Overlay";
import { BoardType } from "@/types/BoardType";

interface BoardProps {
  board: BoardType;
}

const Board = ({ board }: BoardProps) => {
  /// 格式化日期，以使用者時間為基準換算成距離現在的時間
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "日期未知";
    try {
      return formatDistanceToNow(date, { addSuffix: true, locale: zhTW });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "日期格式錯誤";
    }
  };

  if (!board) return null;

  return (
    <Box position="relative" width="100%" height="100%">
      <Link href={`/design/${board.id}`}>
        <Card
          borderRadius="10px"
          display="flex"
          flexDir="column"
          width="100%"
          height="100%"
          overflow="hidden"
          transition="transform 0.3s ease-in-out"
        >
          <Box
            position="relative"
            width="100%"
            pt="75%"
            zIndex={5}
            overflow="hidden"
            flex="1"
          >
            {/* 遮罩 */}
            <Overlay />

            <Image
              className="board-thumbnail"
              src={board.thumbnailURL}
              alt="file thumbnail"
              fill
              style={{ objectFit: "cover", position: "absolute" }}
              priority
            />
          </Box>
          <CardBody
            textAlign="center"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="65px"
            maxHeight="70px"
          >
            <Text fontSize="17px" fontWeight="500">
              {board.fileName}
            </Text>
            <Text fontSize="14px" fontWeight="200">
              {formatDate(board.lastModified)}
            </Text>
          </CardBody>
        </Card>
      </Link>
      <BoardMenu boardId={board.id} />
    </Box>
  );
};

export default Board;
