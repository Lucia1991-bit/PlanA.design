import { useEffect, useState } from "react";

import { doc, onSnapshot } from "firebase/firestore";
import { BoardType, UseSingleBoardReturn } from "../types/BoardType";
import { db } from "@/lib/firebase";

const useSingleBoard = (id: string): UseSingleBoardReturn => {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [fetching, setFetching] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setBoard(null);
      setFetching(false);
      return;
    }

    setFetching(true);
    const boardRef = doc(db, "boards", id);

    const unsubscribe = onSnapshot(
      boardRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setBoard({
            id: docSnapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            lastModified: data.lastModified?.toDate(),
          } as BoardType);
        } else {
          setError("查無此設計資料");
        }
        setFetching(false);
      },
      (error) => {
        console.error("Error fetching boards:", error);
        setError("獲取設計紀錄時發生錯誤");
        setFetching(false);
      }
    );
    return () => unsubscribe();
  }, [id]);

  return { board, fetching, error };
};

export default useSingleBoard;
