"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SimpleLoadingPage from "@/components/_Loading/SimpleLoadingPage";
import { Box, Container } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import useBoards from "@/hooks/useBoards";
import EmptyBoard from "@/components/_Dashboard/EmptyBoard";
import BoardList from "@/components/_Dashboard/BoardList";

const DashboardPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { boards, fetching: boardsFetching } = useBoards(user?.uid);

  //驗證使用者登入狀態(跳轉頁面的操作必須在頁面渲染完成後)
  useEffect(() => {
    if (!authLoading && !user) {
      return router.replace("/");
    }
  }, [user, authLoading, router]);

  // 如果正在加載或用戶未登入，顯示加載頁面
  if (authLoading || !user || !boards) {
    return <SimpleLoadingPage />;
  }

  return (
    <Box
      pt={{ base: "100px", md: "150px", lg: "200px" }}
      width="100%"
      minHeight="calc(100vh - 95px)"
      bg="brand.primary_light"
      overflow="auto"
      position="relative"
    >
      <Container
        maxWidth={{ base: "85%", md: "90%", lg: "88%", xl: "1500px" }}
        px={{ base: 4, md: 6 }}
        py={{ base: "80px", md: "100px", lg: "80px" }}
      >
        <BoardList boards={boards} fetching={boardsFetching} />
      </Container>
    </Box>
  );
};

export default DashboardPage;
