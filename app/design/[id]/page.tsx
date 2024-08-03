"use client";
import LogoLoadingPage from "@/components/_Loading/LogoLoadingPage";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const DesignPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return <LogoLoadingPage text="Get ready to design!" />;
  }

  return <div>設計頁面！</div>;
};

export default DesignPage;
