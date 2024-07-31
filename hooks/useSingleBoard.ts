import { useEffect, useState } from "react";

import { doc, onSnapshot } from "firebase/firestore";
import { Board } from "../types/Board";
import { db } from "@/lib/firebase";

const useSingleBoard = (id: string) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setBoard(null);
      setLoading(false);
      return;
    }

    setLoading(true);
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
          } as Board);
        } else {
          setError("查無此設計資料");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching boards:", error);
        setError("獲取設計紀錄時發生錯誤");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [id]);

  return { board, loading, error };
};

export default useSingleBoard;
