"use client";
import React from "react";
import { usePathname } from "next/navigation";
import NavBar from "@/components/navBar/NavBar";
import Footer from "@/components/Footer";
import { BoardsProvider } from "@/context/BoardsContext";
import { DesignColorModeProvider } from "@/context/colorModeContext";
import { LoadingProvider } from "@/context/PageLoadingContext";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isDashboard = pathname.includes("/dashboard");

  const content = (
    <>
      <LoadingProvider>
        <DesignColorModeProvider>
          <NavBar />
          <main>{children}</main>
          <Footer />
        </DesignColorModeProvider>
      </LoadingProvider>
    </>
  );

  // if (isDashboard) {
  //   return <BoardsProvider>{content}</BoardsProvider>;
  // }

  return content;
};

export default MainLayout;
