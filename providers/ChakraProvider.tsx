"use client";

import { Box, ChakraProvider } from "@chakra-ui/react";
import theme from "../styles/theme";

export function UIProviders({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      <Box as="main">{children}</Box>
    </ChakraProvider>
  );
}
