import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import {
  addBoard,
  updateBoard,
  deleteBoard,
} from "@/operations/BoardOperation";
import { useToast } from "@chakra-ui/react";
import { NewBoard } from "@/types/BoardType";

const images = [
  "/boards/placeholders/1.svg",
  "/boards/placeholders/2.svg",
  "/boards/placeholders/3.svg",
  "/boards/placeholders/4.svg",
  "/boards/placeholders/5.svg",
  "/boards/placeholders/6.svg",
  "/boards/placeholders/7.svg",
  "/boards/placeholders/8.svg",
  "/boards/placeholders/9.svg",
  "/boards/placeholders/10.svg",
  "/boards/placeholders/11.svg",
];

export const useBoardOperations = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const route = useRouter();

  //隨機圖片 mapping
  const randomImage = images[Math.floor(Math.random() * images.length)];

  //動作完成後的 Toast通知
  const showToast = (title: string, status: "success" | "error") => {
    toast({
      title,
      status,
      duration: 2000,
      position: "top-right",
      isClosable: true,
      variant: "left-accent",
      containerStyle: {
        marginTop: "20px",
        marginRight: "20px",
        maxWidth: { base: "100px", lg: "200px" },
        fontSize: { base: "14px", lg: "16px" },
      },
    });
  };

  //新增設計
  const createBoard = async () => {
    if (!user) {
      showToast("請先登入", "error");
      return;
    }
    setIsLoading(true);
    try {
      const newBoardData: NewBoard = {
        fileName: "",
        thumbnailURL: randomImage,
        fabricData: "",
        userId: user?.uid as string,
      };
      const newBoardId = await addBoard(newBoardData);

      if (newBoardId) {
        setIsLoading(false);
        // showToast("新增成功", "success");
        setTimeout(() => {
          route.push(`/design/${newBoardId}`);
        }, 200);
      }
    } catch (error) {
      showToast("新增失敗，請稍後再試", "error");
      setIsLoading(false);
    }
  };

  //檔案重新命名
  const renameBoard = async (boardId: string, newName: string) => {
    if (!user) {
      showToast("請先登入", "error");
      return;
    }
    setIsLoading(true);
    try {
      await updateBoard(user.uid, boardId, { fileName: newName });
      showToast("檔案重新命名成功", "success");
      setIsLoading(false);
    } catch (error) {
      showToast("檔案重新命名失敗，請稍後再試", "error");
      setIsLoading(false);
    }
  };

  //刪除檔案
  const removeBoard = async (boardId: string) => {
    if (!user) {
      showToast("請先登入", "error");
      return;
    }
    setIsLoading(true);
    try {
      await deleteBoard(user.uid, boardId);
      showToast("檔案刪除成功", "success");
      setIsLoading(false);
    } catch (error) {
      showToast("檔案刪除失敗，請稍後再試", "error");
      setIsLoading(false);
    }
  };

  return { createBoard, renameBoard, removeBoard, isLoading };
};
