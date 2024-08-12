import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ROOM_CATEGORIES,
  FURNITURE_CATEGORIES,
  FurnitureType,
} from "@/types/FurnitureType";

//以房間類別獲取家具資料
const fetchFurnitureByRoom = async (
  roomCategory: string
): Promise<FurnitureType[]> => {
  const furnitureRef = collection(db, "furniture");
  const q = query(
    furnitureRef,
    where("room_category", "==", roomCategory),
    orderBy("category")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as FurnitureType)
  );
};

//以家具類別獲取家具資料
const fetchFurnitureByCategory = async (
  category: string
): Promise<FurnitureType[]> => {
  const furnitureRef = collection(db, "furniture");
  const q = query(
    furnitureRef,
    where("category", "==", category),
    orderBy("name")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as FurnitureType)
  );
};

type FetchType = "room" | "category";

export const useFurniture = (fetchType: FetchType, index: number) => {
  const queryClient = useQueryClient();
  const category =
    fetchType === "room" ? ROOM_CATEGORIES[index] : FURNITURE_CATEGORIES[index];

  const queryKey = ["furniture", fetchType, category];
  const queryFn = () =>
    fetchType === "room"
      ? fetchFurnitureByRoom(category)
      : fetchFurnitureByCategory(category);

  const { data, isLoading, isError, error } = useQuery<FurnitureType[], Error>({
    queryKey,
    queryFn,
    staleTime: 6 * 60 * 60 * 1000, // 資料在 6小時內被視為新鮮
  });

  if (error) {
    console.error(`家具數據獲取錯誤 (${fetchType}, ${category}):`, error);
    // 這裡可以添加更多錯誤處理邏輯，如錯誤報告服務
  }

  // 預取下一個分類的數據
  const prefetchNext = (nextIndex: number) => {
    const nextCategory =
      fetchType === "room"
        ? ROOM_CATEGORIES[nextIndex]
        : FURNITURE_CATEGORIES[nextIndex];

    if (nextCategory) {
      queryClient.prefetchQuery({
        queryKey: ["furniture", fetchType, nextCategory],
        queryFn: () =>
          fetchType === "room"
            ? fetchFurnitureByRoom(nextCategory)
            : fetchFurnitureByCategory(nextCategory),
        staleTime: 6 * 60 * 60 * 1000,
      });
    }
  };
  return {
    data,
    isLoading,
    isError,
    error,
    prefetchNext,
    categories: fetchType === "room" ? ROOM_CATEGORIES : FURNITURE_CATEGORIES,
  };
};
