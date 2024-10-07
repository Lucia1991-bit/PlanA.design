"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingPage from "@/components/loading/LoadingPage";
import { Box, Container } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import useBoards from "@/hooks/useBoards";
import BoardList from "@/components/dashboard/BoardList";
import { usePageLoading } from "@/context/PageLoadingContext";

const DashboardPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { boards, fetching: boardsFetching } = useBoards(user?.uid);
  const { setIsPageLoading } = usePageLoading();

  //驗證使用者登入狀態(跳轉頁面的操作必須在頁面渲染完成後)
  useEffect(() => {
    if (!authLoading && !user) {
      setIsPageLoading(true);
      router.replace("/");
    } else if (!authLoading && user && !boardsFetching) {
      setIsPageLoading(false);
    }
  }, [user, authLoading, router, boardsFetching, setIsPageLoading]);

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
        maxWidth="1300px"
        width={{
          base: "90%",
          sm: "90%",
          md: "90%",
          lg: "100%",
          xl: "1300px",
        }}
        h="100%"
        px={{ base: "15px", md: "25px" }}
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
