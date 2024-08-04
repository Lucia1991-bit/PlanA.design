import { DesignColorModeProvider } from "@/context/colorModeContext";

export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DesignColorModeProvider>{children}</DesignColorModeProvider>;
}
