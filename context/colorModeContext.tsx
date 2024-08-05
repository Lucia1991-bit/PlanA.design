"use client";

// designColorMode.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorMode, useColorModeValue } from "@chakra-ui/react";

type DesignColorMode = "light" | "dark";

interface DesignColorModeContextType {
  designColorMode: DesignColorMode;
  toggleDesignColorMode: () => void;
  useDesignColorModeValue: <T>(lightValue: T, darkValue: T) => T;
}

const DesignColorModeContext = createContext<
  DesignColorModeContextType | undefined
>(undefined);

export const DesignColorModeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [designColorMode, setDesignColorMode] =
    useState<DesignColorMode>("light");
  const { colorMode } = useColorMode();

  useEffect(() => {
    const savedMode = localStorage.getItem("design-color-mode");
    if (savedMode === "light" || savedMode === "dark") {
      setDesignColorMode(savedMode);
    }
  }, []);

  const toggleDesignColorMode = () => {
    const newMode = designColorMode === "light" ? "dark" : "light";
    setDesignColorMode(newMode);
    localStorage.setItem("design-color-mode", newMode);
  };

  const useDesignColorModeValue = <T,>(lightValue: T, darkValue: T): T => {
    return designColorMode === "light" ? lightValue : darkValue;
  };

  return (
    <DesignColorModeContext.Provider
      value={{
        designColorMode,
        toggleDesignColorMode,
        useDesignColorModeValue,
      }}
    >
      {children}
    </DesignColorModeContext.Provider>
  );
};

export const useDesignColorMode = (): DesignColorModeContextType => {
  const context = useContext(DesignColorModeContext);
  if (context === undefined) {
    throw new Error(
      "useDesignColorMode must be used within a DesignColorModeProvider"
    );
  }
  return context;
};