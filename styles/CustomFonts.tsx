"use client";

import { Global } from "@emotion/react";

const CustomFonts = () => {
  console.log("CustomFonts component rendered");
  return (
    <Global
      styles={`
      @font-face {
        font-family: 'Fontype Hand';
        src: url('/fonts/Fontype Hand Regular.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: 'Fontype Hand';
        src: url('/fonts/Fontype Hand Bold.otf') format('opentype');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: 'Fontype Hand';
        src: url('/fonts/Fontype Hand Italic.otf') format('opentype');
        font-weight: normal;
        font-style: italic;
        font-display: swap;
      }

      @font-face {
        font-family: 'Fontype Hand';
        src: url('/fonts/Fontype Hand Bold Italic.otf') format('opentype');
        font-weight: bold;
        font-style: italic;
        font-display: swap;
      }
    `}
    />
  );
};

export default CustomFonts;
