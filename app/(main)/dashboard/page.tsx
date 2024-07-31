"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import SimpleLoadingPage from "@/components/_Loading/SimpleLoadingPage";
import { Box, Stack } from "@chakra-ui/react";
import EmptyBoard from "@/components/_Dashboard/EmptyBoard";
import BoardList from "@/components/_Dashboard/BoardList";

const DashboardPage = () => {
  const { user, isLoading } = useAuth();
  const [designData, setDesignData] = useState([]);
  const router = useRouter();

  //驗證使用者登入狀態
  useEffect(() => {
    if (!isLoading && !user) {
      return router.replace("/");
    }
  }, [user, isLoading, router]);

  // 如果正在加載或用戶未登入，顯示加載頁面
  if (isLoading || !user) {
    return <SimpleLoadingPage />;
  }

  //TODO: 從 firestore獲取設計紀錄

  return (
    <Box
      pt={{ base: "100px", md: "150px", lg: "200px" }}
      width="100%"
      overflowX="hidden"
      minHeight="calc(100vh - 95px)"
      position="relative"
    >
      {/* TODO: 如果使用者設計紀錄是空的顯示創建新設計 */}
      {designData.length !== 0 ? <EmptyBoard /> : <BoardList />}
    </Box>
  );
};

export default DashboardPage;
