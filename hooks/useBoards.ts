"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  serverTimestamp,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Board, NewBoard, UpdateBoard, UseBoardsReturn } from "@/types/Board";

const useBoards = (userId: string): UseBoardsReturn => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setBoards([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 獲取設計紀錄
    const q = query(
      collection(db, "boards"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const boardsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            //將 firebase的 serverTimestamp轉換成 JS Date 型別
            createdAt: data.createdAt?.toDate(),
            lastModified: data.lastModified?.toDate(),
          } as Board;
        });
        setBoards(boardsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching boards:", error);
        setError("獲取設計紀錄時發生錯誤");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // 創建新設計
  const addBoard = useCallback(async (boardData: NewBoard): Promise<Board> => {
    try {
      const newBoard = {
        ...boardData,
        createdAt: serverTimestamp(),
        lastModified: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "boards"), newBoard);
      const addedBoard = {
        id: docRef.id,
        ...newBoard,
        createdAt: new Date(),
        lastModified: new Date(),
      } as Board;
      return addedBoard;
    } catch (error) {
      console.error("Error adding board:", error);
      setError("開新設計失敗，請稍候再試");
      throw error;
    }
  }, []);

  //更新設計:存檔畫布、改檔名
  const updateBoard = useCallback(
    async (id: string, updateData: UpdateBoard): Promise<void> => {
      try {
        const boardRef = doc(db, "boards", id);

        const dataToUpdate = {
          ...updateData,
          lastModified: serverTimestamp(),
        };

        //如果更新內容包含 fabricData，確保轉換成 JSON 字串格式
        if (updateData.fabricData) {
          dataToUpdate.fabricData = JSON.stringify(updateData.fabricData);
        }

        await updateDoc(boardRef, dataToUpdate);
      } catch (error) {
        console.error("Error updating board:", error);
        setError("存檔失敗，請稍候再試");
        throw error;
      }
    },
    []
  );

  //刪除設計
  const deleteBoard = useCallback(async (boardId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "boards", boardId));
    } catch (error) {
      console.error("Error deleting board:", error);
      setError("Failed to delete board");
      throw error;
    }
  }, []);

  return {
    boards,
    loading,
    error,
    addBoard,
    updateBoard,
    deleteBoard,
  };
};

export default useBoards;
