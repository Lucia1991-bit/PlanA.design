import { Box, Card, CardBody, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import BoardMenu from "./BoardMenu";

const Board = () => {
  return (
    <Box position="relative" width="100%" height="100%">
      <Link href="/">
        <Card
          borderRadius="6px"
          display="flex"
          flexDir="column"
          width="100%"
          height="100%"
          overflow="hidden"
          transition={"transform 0.3s ease-in-out"}
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
            <Box
              className="board-overlay"
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="brand.dark"
              opacity="0"
              transition="opacity 0.3s ease-in-out"
              pointerEvents="none"
              zIndex={2}
            />
            <Image
              className="board-thumbnail"
              src="/boards/placeholders/placeholder1.svg"
              alt="file thumbnail"
              fill
              style={{ objectFit: "cover", position: "absolute" }}
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
            <Text fontSize="18px" fontWeight="500">
              檔案名稱
            </Text>
            <Text fontSize="12px" fontWeight="200">
              創建日期
            </Text>
          </CardBody>
        </Card>
      </Link>
      <Box
        className="board-menu"
        position="absolute"
        top={2}
        right={2}
        zIndex={10}
        opacity={0}
      >
        <BoardMenu />
      </Box>
    </Box>
  );
};

export default Board;
