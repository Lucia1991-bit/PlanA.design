import type { Metadata } from "next";
import { UIProviders } from "../providers/ChakraProvider";
import { fonts } from "../styles/Googlefonts";
import NavBar from "@/components/_NavBar/NavBar";

export const metadata: Metadata = {
  title: "Plan A | 簡單步驟，無限可能",
  description: "輕鬆創建室內平面配置圖，實現每一個靈感",
  icons: {
    icon: "/favicon.png", // 主要 favicon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fonts.lexend.variable} ${fonts.notoSansTC.variable} `}
    >
      <body>
        <UIProviders>
          <NavBar />
          {children}
        </UIProviders>
      </body>
    </html>
  );
}
