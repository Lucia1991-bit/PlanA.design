import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CATEGORIES, MaterialType } from "@/types/MaterialType";

const fetchMaterialByCategory = async (
  category: string
): Promise<MaterialType[]> => {
  console.log(`正在獲取類別 "${category}" 的材料數據`);
  const materialRef = collection(db, "materials2");
  const q = query(
    materialRef,
    where("category", "==", category),
    orderBy("name")
  );
  const snapshot = await getDocs(q);
  console.log(`類別 "${category}" 找到 ${snapshot.docs.length} 個文檔`);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as MaterialType)
  );
};

export const useMaterials = (index: number) => {
  const queryClient = useQueryClient();
  const category = CATEGORIES[index];

  const queryKey = ["materials", category];
  const queryFn = () => fetchMaterialByCategory(category);

  const { data, isLoading, isError, error } = useQuery<MaterialType[], Error>({
    queryKey,
    queryFn,
    staleTime: 6 * 60 * 60 * 1000, // 資料在 6小時內被視為新鮮
  });

  if (error) {
    console.error(`材料數據獲取錯誤 (${category}):`, error);
  }

  // 預取下一個分類的資料
  const prefetchNext = (nextIndex: number) => {
    const nextCategory = CATEGORIES[nextIndex];
    if (nextCategory) {
      queryClient.prefetchQuery({
        queryKey: ["materials", nextCategory],
        queryFn: () => fetchMaterialByCategory(nextCategory),
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
    categories: CATEGORIES,
  };
};
