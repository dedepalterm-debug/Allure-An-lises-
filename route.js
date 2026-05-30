// API route segura para a análise de IA.
// A chave da Anthropic fica em variável de ambiente no servidor — nunca no cliente.
// Defina ANTHROPIC_API_KEY no .env.local e nas Environment Variables do Vercel.

export const runtime = "edge"; // resposta rápida; remova esta linha para usar Node.js runtime

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return Response.json({ error: "prompt ausente" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { text: "Configuração ausente: defina ANTHROPIC_API_KEY no ambiente." },
        { status: 200 }
      );
    }

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        // Ajuste o modelo conforme sua conta/preferência:
        // ex.: "claude-sonnet-4-6", "claude-opus-4-8", "claude-haiku-4-5"
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const d = await r.json();
    const text = d?.content?.find((b) => b.type === "text")?.text || "Não foi possível gerar a análise.";
    return Response.json({ text });
  } catch (e) {
    return Response.json({ text: "Erro ao processar a análise." }, { status: 200 });
  }
}
