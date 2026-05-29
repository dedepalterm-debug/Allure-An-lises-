// API route segura para a análise qualitativa por IA (RF-17, RF-18).
//
// A chave da Anthropic vive apenas no servidor (ANTHROPIC_API_KEY) e nunca é
// exposta ao cliente. O cliente envia inputs + resultado; o servidor monta o
// prompt, injeta o contexto de mercado de Ribeirão Preto quando relevante e
// retorna a análise estruturada.

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { AnalysisInput, AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

const RP_CONTEXT = `Contexto de mercado — Ribeirão Preto (SP), 2025:
- Mercado aquecido, puxado por agronegócio, saúde e educação (USP/medicina).
- Bairros de alto padrão: Jardim Botânico, Jardim Canadá (R$/m² 9.000–10.000, cap rate ~5%).
- Médio-alto: Ribeirânia, Jardim Irajá. Médio/popular: Vila Tibério, Centro, Campos Elíseos (cap rate 6,5%–7,5%).
- Valorização média anual de 5%–8,5% conforme o bairro.
Use este contexto para calibrar o risco e a comparação com o mercado local.`;

function buildPrompt(input: AnalysisInput, result: AnalysisResult): string {
  const bairro = input.asset.bairro;
  const ehRibeirao =
    !!bairro &&
    /ribeir|jardim bot|canad|tibério|tiberio|irajá|iraja|campos elí|elise|ribeirân|ribeiran/i.test(
      bairro
    );

  const partes: string[] = [];
  partes.push(
    `Você é um analista de investimentos imobiliários experiente. Avalie a operação a seguir de forma objetiva e em português do Brasil.`
  );
  partes.push(`Modo da operação: ${input.mode === "flip" ? "Flip (compra, reforma e revenda)" : "Locação (renda)"}.`);
  partes.push(`Usa financiamento (alavancagem): ${input.financing.ativo ? "Sim" : "Não"}.`);
  partes.push(`Dados de entrada (JSON):\n${JSON.stringify(input, null, 2)}`);
  partes.push(`Indicadores calculados (JSON):\n${JSON.stringify(result, null, 2)}`);

  if (input.financing.ativo) {
    partes.push(
      `Como a operação é alavancada, comente explicitamente a relação risco/retorno do CAPITAL PRÓPRIO (equity), não apenas o retorno total.`
    );
  }
  if (ehRibeirao) {
    partes.push(RP_CONTEXT);
  }

  partes.push(
    `Responda EXATAMENTE neste formato markdown, com as quatro seções, sem texto fora delas:

## Avaliação de risco
(2-4 frases)

## Pontos positivos
- item
- item

## Pontos de atenção
- item
- item

## Recomendação
(veredicto qualitativo claro em 1-3 frases)

Não repita os números brutos; interprete-os. Seja direto e prático.`
  );

  return partes.join("\n\n");
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY não configurada no servidor. Defina a variável de ambiente para habilitar a análise por IA.",
      },
      { status: 503 }
    );
  }

  let body: { input?: AnalysisInput; result?: AnalysisResult };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  if (!body.input || !body.result) {
    return NextResponse.json(
      { error: "Campos 'input' e 'result' são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        { role: "user", content: buildPrompt(body.input, body.result) },
      ],
    });

    const texto = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return NextResponse.json({ analysis: texto });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { error: `Falha ao consultar a IA: ${msg}` },
      { status: 502 }
    );
  }
}
