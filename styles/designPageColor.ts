import { background } from "@chakra-ui/react";

export const designPageColor = {
  light: {
    canvas: {
      backgroundColor: "#ecebeb",
      mainGridColor: "rgba(199,200,201, 0.4)",
      subGridColor: "rgba(199,200,201, 0.3)",
    },
    toolBar: {
      backgroundColor: "#f9f9f8",
      text: "#555352",
      subText: "#9b9b9b",
      hover: "rgba(199,200,201, 0.35)",
      furniture_hover: "rgba(85,83,82, 0.65)",
      furniture_text: "#ffffff",
    },
    navBar: {
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      text: "#555352",
      subText: "#9b9b9b",
      hover: "rgba(199,200,201, 0.5)",
    },
    tooltip: {
      backgroundColor: "#555352",
      text: "#ffffff",
    },
    wall: {
      fill: "#8c8c8c",
      stroke: "#000",
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
      hover: "rgba(199,200,201, 0.35)",
      furniture_hover: "rgba(255,255,255,0.6)",
      furniture_text: "#555352",
    },
    navBar: {
      backgroundColor: "rgba(55, 56, 56, 0.3)",
      text: "#ffffff",
      subText: "#9b9b9b",
      hover: "rgba(199,200,201, 0.35)",
    },
    tooltip: {
      backgroundColor: "#ffffff",
      text: "#555352",
    },
    wall: {
      fill: "#8c8c8c",
      stroke: "#000",
    },
  },
};
