"use client";

import { useState } from "react";
import type { AnalysisInput, AnalysisResult } from "@/lib/types";
import { SectionTitle } from "./ui";

// Renderizador markdown mínimo para a resposta estruturada da IA.
function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];
  let list: string[] = [];

  const flushList = (key: number) => {
    if (list.length) {
      out.push(
        <ul key={`ul-${key}`} className="ml-4 list-disc space-y-1 text-sm text-slate-700">
          {list.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      flushList(idx);
      out.push(
        <h4 key={`h-${idx}`} className="mt-3 text-sm font-semibold text-brand-dark">
          {line.slice(3)}
        </h4>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      list.push(line.slice(2));
    } else if (line.length) {
      flushList(idx);
      out.push(
        <p key={`p-${idx}`} className="text-sm text-slate-700">
          {line}
        </p>
      );
    }
  });
  flushList(lines.length);
  return out;
}

export default function AIPanel({
  input,
  result,
}: {
  input: AnalysisInput;
  result: AnalysisResult;
}) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, result }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha na análise.");
      setAnalysis(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <SectionTitle>Análise qualitativa por IA</SectionTitle>
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading ? "Analisando…" : analysis ? "Refazer análise" : "Analisar com IA"}
        </button>
      </div>
      {error && (
        <p className="mt-2 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}
      {analysis && <div className="mt-3 space-y-1">{renderMarkdown(analysis)}</div>}
      {!analysis && !error && !loading && (
        <p className="text-sm text-slate-500">
          Gera uma avaliação de risco, pontos positivos, pontos de atenção e
          recomendação com base nos números desta operação.
        </p>
      )}
    </div>
  );
}
