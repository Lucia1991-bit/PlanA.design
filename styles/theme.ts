import { extendTheme } from "@chakra-ui/react";
import { color } from "framer-motion";

const config: any = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: `var(--font-lexend), var(--font-noto-sans-tc), sans-serif`,
    body: `var(--font-lexend), var(--font-noto-sans-tc), sans-serif`,
  },
  colors: {
    brand: {
      primary: "#c6332e",
      primary_light: "#f9f9f8",
      hover: "#a02d2d",
      dark: "#545251",
      dark_hover: "#373838",
      secondary: "#c7c8c8",
      placeholder: "#b5b5b5",
      third: "#9b9b9b",
      light: "rgba(199,200,201, 0.35)",
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: "brand.primary_light",
        color: "brand.dark",
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
    }),
  },
});

export default theme;
