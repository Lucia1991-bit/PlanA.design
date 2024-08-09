"use client";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export const DesignContext = createContext<ReturnType<typeof useDesign> | null>(
  null
);

export const DesignProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const designValue = useDesign();

  return (
    <DesignContext.Provider value={designValue}>
      {children}
    </DesignContext.Provider>
  );
};
