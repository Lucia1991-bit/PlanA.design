import { useState, useCallback } from "react";
import { updateBoard } from "@/operations/BoardOperation";

interface UseUpdateDesignProps {
  userId: string;
  boardId: string;
}

export const useUpdateDesign = ({ userId, boardId }: UseUpdateDesignProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveDesign = useCallback(
    async (fabricData: string) => {
      setIsUpdating(true);
      setError(null);

      try {
        await updateBoard(userId, boardId, { fabricData });
        setIsUpdating(false);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "發生錯誤，請稍後再試"
        );
        setIsUpdating(false);
      }
    },
    [userId, boardId]
  );

  return { saveDesign, isUpdating, error };
};
