"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnalysisInput, Neighborhood, SavedOperation } from "@/lib/types";
import {
  isSupabaseConfigured,
  listOperations,
  loadNeighborhoods,
} from "@/lib/storage";
import AnaliseForm from "./AnaliseForm";
import Mercado from "./Mercado";
import Historico from "./Historico";

type Tab = "analise" | "mercado" | "historico";

const DEFAULT_INPUT: AnalysisInput = {
  mode: "flip",
  asset: {
    precoCompra: 300000,
    area: 100,
    custoReforma: 50000,
    transacaoPct: 5,
    outrosCustos: 10000,
    bairro: undefined,
  },
  flip: { precoVenda: 500000, prazoMeses: 12, custoCapitalMensal: 1, corretagemPct: 5 },
  rent: {
    aluguelMensal: 2500,
    vacanciaPct: 5,
    custosMensais: 600,
    prazoReformaMeses: 2,
    custoCapitalMensal: 1,
  },
  financing: { ativo: false, entradaPct: 20, taxaMensal: 1, prazoMeses: 240 },
  criteria: {
    roiMin: 15,
    margemMin: 10,
    prazoMax: 12,
    capRateMin: 6,
    cashflowMin: 500,
    paybackMax: 18,
  },
};

export default function App() {
  const [tab, setTab] = useState<Tab>("analise");
  const [input, setInput] = useState<AnalysisInput>(DEFAULT_INPUT);
  const [bairros, setBairros] = useState<Neighborhood[]>([]);
  const [operacoes, setOperacoes] = useState<SavedOperation[]>([]);

  const refreshHistorico = useCallback(() => {
    listOperations().then(setOperacoes);
  }, []);

  useEffect(() => {
    loadNeighborhoods().then(setBairros);
    refreshHistorico();
  }, [refreshHistorico]);

  const selecionarBairro = (b: Neighborhood) => {
    setInput((p) => ({ ...p, asset: { ...p.asset, bairro: b.bairro } }));
    setTab("analise");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-brand-dark">🏠 Imóvel Viável</h1>
            <p className="text-xs text-slate-500">
              Análise de viabilidade de investimento imobiliário · GO / NO-GO
            </p>
          </div>
          <nav className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {(
              [
                ["analise", "Análise"],
                ["mercado", "Mercado"],
                ["historico", "Histórico"],
              ] as [Tab, string][]
            ).map(([k, label]) => (
              <button
                key={k}
                className={`tab ${tab === k ? "tab-active" : ""}`}
                onClick={() => setTab(k)}
              >
                {label}
                {k === "historico" && operacoes.length > 0 && (
                  <span className="ml-1 rounded-full bg-slate-200 px-1.5 text-xs">
                    {operacoes.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {!isSupabaseConfigured && (
        <div className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-700">
          Modo local: Supabase não configurado — histórico salvo no navegador
          (localStorage). Defina as variáveis de ambiente para persistir no banco.
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === "analise" && (
          <AnaliseForm
            input={input}
            setInput={setInput}
            bairros={bairros}
            onSaved={refreshHistorico}
          />
        )}
        {tab === "mercado" && <Mercado bairros={bairros} onSelect={selecionarBairro} />}
        {tab === "historico" && (
          <Historico operacoes={operacoes} onChange={refreshHistorico} />
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-slate-400">
        <p>
          O Imóvel Viável é uma ferramenta de apoio à decisão e cálculo. Os
          resultados são estimativas baseadas nos dados inseridos e em benchmarks
          que podem variar. Não constitui aconselhamento financeiro, jurídico ou
          de investimento. Valide toda decisão com profissionais qualificados e
          due diligence apropriada.
        </p>
      </footer>
    </div>
  );
}
