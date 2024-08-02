"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SimpleLoadingPage from "@/components/_Loading/SimpleLoadingPage";
import { Box } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import useBoards from "@/hooks/useBoards";
import EmptyBoard from "@/components/_Dashboard/EmptyBoard";
import BoardList from "@/components/_Dashboard/BoardList";

const DashboardPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const { boards, fetching: boardsFetching } = useBoards(user?.uid);

  //驗證使用者登入狀態
  useEffect(() => {
    if (!authLoading && !user) {
      return router.replace("/");
    }
  }, [user, authLoading, router]);

  // 如果正在加載或用戶未登入，顯示加載頁面
  if (authLoading || !user) {
    return <SimpleLoadingPage />;
  }

  return (
    <Box
      pt={{ base: "100px", md: "150px", lg: "200px" }}
      width="100%"
      overflowX="hidden"
      minHeight="calc(100vh - 95px)"
      position="relative"
      bg="brand.primary_light"
    >
      <BoardList boards={boards} fetching={boardsFetching} />
    </Box>
  );
};

export default DashboardPage;
