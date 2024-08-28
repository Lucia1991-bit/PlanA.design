"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingPage from "@/components/_Loading/LoadingPage";
import { Box, Container } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import useBoards from "@/hooks/useBoards";
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
    return <LoadingPage />;
  }

  return (
    <Box
      pt={{ base: "100px", md: "150px", lg: "200px" }}
      width="100%"
      minHeight="calc(100vh - 95px)"
      bg="brand.primary_light"
      overflowX="hidden"
      overflowY="auto"
      position="relative"
      display="flex"
      flexDirection="column"
    >
      <Box flex="0"></Box>
      <Container
        maxWidth={{
          base: "90%",
          sm: "90%",
          md: "90%",
          lg: "1300px",
          xl: "1500px",
        }}
        h="100%"
        px={{ base: "20px", md: "30px", lg: "40px" }}
        py={{ base: 10, md: 4 }}
        display="flex"
        alignItems="center"
        position="relative"
        flex="1.05"
      >
        <BoardList boards={boards} fetching={boardsFetching} />
      </Container>
    </Box>
  );
};

export default DashboardPage;
