import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BoardType, NewBoard, UpdateBoard } from "@/types/BoardType";

// 創建新設計
export const addBoard = async (boardData: NewBoard): Promise<string> => {
  try {
    const newBoard = {
      ...boardData,
      fileName: boardData.fileName || "Untitled Design",
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "boards"), newBoard);

    return docRef.id;
  } catch (error) {
    console.error("Error adding board:", error);
    throw error;
  }
};

//更新設計:存檔畫布、改檔名
export const updateBoard = async (
  id: string,
  updateData: UpdateBoard
): Promise<void> => {
  try {
    const boardRef = doc(db, "boards", id);

    const dataToUpdate = {
      ...updateData,
      lastModified: serverTimestamp(),
    };

    if (updateData.fabricData) {
      dataToUpdate.fabricData = JSON.stringify(updateData.fabricData);
    }

    await updateDoc(boardRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating board:", error);
    throw error;
  }
};

//刪除設計
export const deleteBoard = async (boardId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "boards", boardId));
  } catch (error) {
    console.error("Error deleting board:", error);
    throw error;
  }
};
