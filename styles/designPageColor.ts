import { background } from "@chakra-ui/react";

export const designPageColor = {
  light: {
    canvas: {
      backgroundColor: "#f9f9f8",
      mainGridColor: "rgba(199,200,201, 0.4)",
      subGridColor: "rgba(199,200,201, 0.3)",
    },
    toolBar: {
      backgroundColor: "#ffffff",
      text: "#555352",
      subText: "#9b9b9b",
      hover: "rgba(199,200,201, 0.35)",
    },
    navBar: {
      backgroundColor: "rgba(255, 255, 255, 0.4)",
    },
  },
  dark: {
    canvas: {
      backgroundColor: "#373838",
      mainGridColor: "#515151",
      subGridColor: "#494949",
    },
    toolBar: {
      backgroundColor: "#4c4c4c",
      text: "#ffffff",
      subText: "#9b9b9b",
      hover: "rgba(199,200,201, 0.5)",
    },
    navBar: {
      backgroundColor: "rgba(55, 56, 56, 0.3)",
    },
  },
};
