import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { addBoard } from "@/operations/BoardOperation";
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
];

export const useCreateBoard = () => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();
  const route = useRouter();

  //隨機圖片 mapping
  const randomImage = images[Math.floor(Math.random() * images.length)];

  const createBoard = async () => {
    setIsCreating(true);
    try {
      const newBoardData: NewBoard = {
        fileName: "",
        thumbnailURL: randomImage,
        fabricData: "",
        userId: user?.uid as string,
      };
      const newBoardId = await addBoard(newBoardData);

      if (newBoardId) {
        toast({
          title: "新增成功",
          status: "success",
          duration: 3000,
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

        setIsCreating(false);

        setTimeout(() => {
          route.push(`/design/${newBoardId}`);
        }, 1000);
      }
    } catch (error) {
      toast({
        title: "新增失敗，請稍候再試",
        status: "error",
        duration: 3000,
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
      setIsCreating(false);
    }
  };

  return { createBoard, isCreating };
};
