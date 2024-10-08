//設計資料型別
export interface BoardType {
  id: string;
  fileName: string;
  thumbnailURL: string;
  fabricData: string;
  userId: string;
  createdAt: Date;
  lastModified?: Date; // 最後修改時間
}

//創建新設計
export interface NewBoard {
  fileName: string;
  thumbnailURL: string;
  fabricData: string;
  userId: string;
}

//更新設計: 存檔(畫布內容 & 畫布截圖)、改檔名
export interface UpdateBoard {
  fileName?: string;
  thumbnailURL?: string;
  fabricData?: string;
}

//使用 useBoards hook 回傳的資料
export interface UseBoardsReturn {
  boards: BoardType[] | null;
  fetching: boolean;
  addBoard: (board: NewBoard) => Promise<BoardType>;
  updateBoard: (id: string, board: UpdateBoard) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
}

//使用 useSingleBoard hook 回傳的資料
export interface UseSingleBoardReturn {
  board: BoardType | null;
  fetching: boolean;
  error: string | null;
}
