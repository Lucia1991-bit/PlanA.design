// designTheme.ts
import {
  extendTheme,
  theme as chakraTheme,
  ThemeConfig,
} from "@chakra-ui/react";
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
import { canvasColor } from "./designPageColor";

// 自定義顏色
const colors = {
  ...chakraTheme.colors, // 保留 Chakra 默認顏色
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
  canvas: canvasColor,
};

// 顏色模式配置
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

// 擴展 Chakra 默認主題
const designTheme = extendTheme({
  ...chakraTheme, // 擴展整個 Chakra 默認主題
  colors,
  config,
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: props.colorMode === "light" ? "gray.100" : "gray.800",
      },
    }),
  },
  components: {
    ...chakraTheme.components, // 保留 Chakra 默認組件主題
    Box: {
      baseStyle: (props: StyleFunctionProps) => ({
        bg: mode("red", "green")(props),
        color: mode("gray.800", "whiteAlpha.900")(props),
      }),
    },
    // 可以在這裡添加或覆蓋其他組件的樣式
  },
});

export default designTheme;
