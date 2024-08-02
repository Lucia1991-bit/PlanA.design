// import { useContext } from "react";
// import { BoardsContext } from "@/context/BoardsContext";

// export const useBoards = () => {
//   const context = useContext(BoardsContext);
//   if (context === undefined) {
//     throw new Error("useBoards must be used within a BoardsProvider");
//   }
//   return context;
// };

"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BoardType } from "@/types/BoardType";

const useBoards = (userId: string | undefined) => {
  const [boards, setBoards] = useState<BoardType[] | null>(null);
  const [fetching, setFetching] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setBoards(null);
      setFetching(false);
      return;
    }

    setFetching(true);

    //按照最新存檔時間排序
    const q = query(
      collection(db, "boards"),
      where("userId", "==", userId),
      orderBy("lastModified", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const boardsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            lastModified: data.lastModified?.toDate(),
          } as BoardType;
        });
        setBoards(boardsData);
        setTimeout(() => {
          setFetching(false);
        }, 800);
      },
      (error) => {
        console.error("Error fetching boards:", error);
        setBoards(null);
        setFetching(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return {
    boards,
    fetching,
  };
};

export default useBoards;
