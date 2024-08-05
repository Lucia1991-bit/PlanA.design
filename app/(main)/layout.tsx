"use client";
import { usePathname } from "next/navigation";
import NavBar from "@/components/_NavBar/NavBar";
import Footer from "@/components/Footer";
import { BoardsProvider } from "@/context/BoardsContext";
import { DesignColorModeProvider } from "@/context/colorModeContext";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isDashboard = pathname.includes("/dashboard");

  const content = (
    <>
      <DesignColorModeProvider>
        <NavBar />
        <main>{children}</main>
        <Footer />
      </DesignColorModeProvider>
    </>
  );

  // if (isDashboard) {
  //   return <BoardsProvider>{content}</BoardsProvider>;
  // }

  return content;
};

export default MainLayout;
