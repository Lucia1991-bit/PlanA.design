"use client";

import React, { createContext, useContext, useState } from "react";

const PageLoadingContext = createContext({
  isPageLoading: true,
  setIsPageLoading: (loading: boolean) => {},
});

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isPageLoading, setIsPageLoading] = useState(true);

  return (
    <PageLoadingContext.Provider value={{ isPageLoading, setIsPageLoading }}>
      {children}
    </PageLoadingContext.Provider>
  );
};

export const usePageLoading = () => useContext(PageLoadingContext);
