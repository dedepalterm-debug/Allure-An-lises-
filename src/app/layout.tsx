import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Imóvel Viável — Análise de Viabilidade Imobiliária",
  description:
    "Avalie operações de flip e locação: ROI, TIR, VPL, cap rate, alavancagem e veredicto GO/NO-GO.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
