import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `var(--font-lexend), var(--font-noto-sans-tc), sans-serif`,
    body: `var(--font-lexend), var(--font-noto-sans-tc), sans-serif`,
  },
  colors: {
    brand: {
      primary: "#c6332e",
      hover: "#a02d2d",
      dark: "#545251",
      secondary: "#c7c8c8",
      light: "rgba(199,200,201, 0.35)",
    },
  },
  styles: {
    global: {
      body: {
        bg: "#ffffff",
        color: "#545251",
      },
      // 重置所有元素的邊框和輪廓
      "*": {
        borderColor: "gray.200",
        outline: "none",
      },
      // 特別處理分隔線
      hr: {
        borderColor: "gray.200",
      },
    },
  },
});

export default theme;
