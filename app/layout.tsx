import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Controle Financeiro - Grupo Studio",
  description: "Sistema de gestão financeira do Grupo Studio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}