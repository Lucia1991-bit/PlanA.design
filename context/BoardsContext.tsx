"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BoardType } from "@/types/BoardType";
import { useAuth } from "@/hooks/useAuth";

interface BoardsContextType {
  boards: BoardType[] | null;
  fetching: boolean;
}

export const BoardsContext = createContext<BoardsContextType | undefined>(
  undefined
);

export const BoardsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [boards, setBoards] = useState<BoardType[] | null>(null);
  const [fetching, setFetching] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setBoards(null);
      setFetching(false);
      return;
    }

    const q = query(
      collection(db, "boards"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const boardsData = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate(),
              lastModified: doc.data().lastModified?.toDate(),
            } as BoardType)
        );
        setBoards(boardsData);
        setTimeout(() => {
          setFetching(false);
        }, 500);
      },
      (error) => {
        console.error("Error fetching boards:", error);
        setBoards(null);
        setFetching(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <BoardsContext.Provider value={{ boards, fetching }}>
      {children}
    </BoardsContext.Provider>
  );
};
