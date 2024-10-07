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
          bg="#ffffff"
          borderRadius="10px"
          display="flex"
          flexDir="column"
          width="100%"
          height="100%"
          overflow="hidden"
          transition="transform 0.3s ease-in-out"
          color="brand.dark"
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
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              width="90%"
              height="90%"
            >
              <Image
                className="board-thumbnail"
                src={board.thumbnailURL}
                alt="file thumbnail"
                fill
                style={{
                  objectFit: "contain",
                  position: "absolute",
                  transition: "transform 0.3s ease-in-out",
                }}
                priority
              />
            </Box>
          </Box>
          <CardBody
            textAlign="center"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="70px"
            maxHeight="75px"
            minHeight="70px"
            py="2"
          >
            <Text
              fontSize={{ base: "15px", lg: "16px" }}
              fontWeight="500"
              color="primary.dark"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              width="100%" // 確保文本佔滿整個寬度
              mb="1" // 添加底部邊距
            >
              {board.fileName}
            </Text>
            <Text
              fontSize={{ base: "12px", lg: "13px" }}
              fontWeight="200"
              color="primary.dark"
            >
              {formatDate(board.lastModified)}
            </Text>
          </CardBody>
        </Card>
      </Link>
      <BoardMenu boardId={board.id} boardName={board.fileName} />
    </Box>
  );
};

export default Board;
