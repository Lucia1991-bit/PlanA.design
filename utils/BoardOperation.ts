import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  getDoc,
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

//更新設計:存檔畫布、改檔名(添加用戶驗證)
export const updateBoard = async (
  userId: string,
  id: string,
  updateData: UpdateBoard
): Promise<void> => {
  try {
    const boardRef = doc(db, "boards", id);
    const boardSnap = await getDoc(boardRef);

    if (!boardSnap.exists()) {
      throw new Error("Board not found");
    }

    const boardData = boardSnap.data() as BoardType;

    if (boardData.userId !== userId) {
      throw new Error(
        "Unauthorized: User does not have permission to update this board"
      );
    }

    const dataToUpdate = {
      ...updateData,
      lastModified: serverTimestamp(),
    };

    await updateDoc(boardRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating board:", error);
    console.log("儲存畫布發生錯誤");
    throw error;
  }
};

//刪除設計
export const deleteBoard = async (
  userId: string,
  boardId: string
): Promise<void> => {
  try {
    const boardRef = doc(db, "boards", boardId);
    const boardSnap = await getDoc(boardRef);

    if (!boardSnap.exists()) {
      throw new Error("Board not found");
    }

    const boardData = boardSnap.data() as BoardType;

    if (boardData.userId !== userId) {
      throw new Error(
        "Unauthorized: User does not have permission to delete this board"
      );
    }

    await deleteDoc(doc(db, "boards", boardId));
  } catch (error) {
    console.error("Error deleting board:", error);
    throw error;
  }
};
