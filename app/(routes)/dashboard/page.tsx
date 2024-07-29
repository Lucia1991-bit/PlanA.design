"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import SimpleLoadingPage from "@/components/_Loading/SimpleLoadingPage";
import { Box } from "@chakra-ui/react";

const DashboardPage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      return router.replace("/");
    }
  }, [user, isLoading, router]);

  // 如果正在加載或用戶未登入，顯示加載頁面
  if (isLoading || !user) {
    return <SimpleLoadingPage />;
  }

  // 用戶已登入，顯示 Dashboard 內容
  return (
    <Box bg="red" width="100%" overflowX="hidden">
      哈囉
    </Box>
  );
};

export default DashboardPage;
