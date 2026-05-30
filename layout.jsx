export const metadata = {
  title: "Imóvel Viável — Análise de Investimentos",
  description: "Sistema de análise de viabilidade de investimento imobiliário: flip, locação e construção, com alavancagem e benchmarks de mercado.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: "#0b0a08" }}>{children}</body>
    </html>
  );
}
