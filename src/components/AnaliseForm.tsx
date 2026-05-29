"use client";

import { useMemo, useState } from "react";
import type { AnalysisInput, Neighborhood } from "@/lib/types";
import { analyze, buildVerdict } from "@/lib/finance";
import { saveOperation } from "@/lib/storage";
import { NumberField, SectionTitle } from "./ui";
import Veredicto from "./Veredicto";
import Resultado from "./Resultado";
import AIPanel from "./AIPanel";

export default function AnaliseForm({
  input,
  setInput,
  bairros,
  onSaved,
}: {
  input: AnalysisInput;
  setInput: (updater: (prev: AnalysisInput) => AnalysisInput) => void;
  bairros: Neighborhood[];
  onSaved: () => void;
}) {
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const result = useMemo(() => analyze(input), [input]);
  const verdict = useMemo(() => buildVerdict(input, result), [input, result]);
  const bairroRef = bairros.find((b) => b.bairro === input.asset.bairro);

  const setAsset = (patch: Partial<AnalysisInput["asset"]>) =>
    setInput((p) => ({ ...p, asset: { ...p.asset, ...patch } }));
  const setFlip = (patch: Partial<NonNullable<AnalysisInput["flip"]>>) =>
    setInput((p) => ({ ...p, flip: { ...p.flip!, ...patch } }));
  const setRent = (patch: Partial<NonNullable<AnalysisInput["rent"]>>) =>
    setInput((p) => ({ ...p, rent: { ...p.rent!, ...patch } }));
  const setFin = (patch: Partial<AnalysisInput["financing"]>) =>
    setInput((p) => ({ ...p, financing: { ...p.financing, ...patch } }));
  const setCrit = (patch: Partial<AnalysisInput["criteria"]>) =>
    setInput((p) => ({ ...p, criteria: { ...p.criteria, ...patch } }));

  async function analisar() {
    setSalvando(true);
    try {
      await saveOperation({
        mode: input.mode,
        inputs: input,
        resultado: result,
        bairro: input.asset.bairro ?? null,
        veredicto: verdict.go,
      });
      setSalvo(true);
      onSaved();
      setTimeout(() => setSalvo(false), 2500);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Coluna de entradas */}
      <div className="space-y-6">
        {/* Modo */}
        <div className="card">
          <SectionTitle>Modo de operação</SectionTitle>
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            {(["flip", "rent"] as const).map((m) => (
              <button
                key={m}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                  input.mode === m ? "bg-white text-brand shadow-sm" : "text-slate-600"
                }`}
                onClick={() => setInput((p) => ({ ...p, mode: m }))}
              >
                {m === "flip" ? "Flip (revenda)" : "Locação (renda)"}
              </button>
            ))}
          </div>
        </div>

        {/* Ativo */}
        <div className="card">
          <SectionTitle>Dados do ativo</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Preço de compra (R$)" value={input.asset.precoCompra} onChange={(v) => setAsset({ precoCompra: v })} step={1000} />
            <NumberField label="Área (m²)" value={input.asset.area} onChange={(v) => setAsset({ area: v })} suffix="m²" />
            <NumberField label="Custo de reforma (R$)" value={input.asset.custoReforma} onChange={(v) => setAsset({ custoReforma: v })} step={1000} />
            <NumberField label="Transação (% sobre compra)" value={input.asset.transacaoPct} onChange={(v) => setAsset({ transacaoPct: v })} suffix="%" step={0.5} />
            <NumberField label="Outros custos fixos (R$)" value={input.asset.outrosCustos} onChange={(v) => setAsset({ outrosCustos: v })} step={500} />
            <label className="block">
              <span className="label">Bairro de referência</span>
              <select
                className="field"
                value={input.asset.bairro ?? ""}
                onChange={(e) => setAsset({ bairro: e.target.value || undefined })}
              >
                <option value="">— nenhum —</option>
                {bairros.map((b) => (
                  <option key={b.id} value={b.bairro}>
                    {b.bairro} ({b.cidade})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Operação */}
        <div className="card">
          <SectionTitle>
            {input.mode === "flip" ? "Operação — Flip" : "Operação — Locação"}
          </SectionTitle>
          {input.mode === "flip" ? (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Preço de venda esperado (R$)" value={input.flip!.precoVenda} onChange={(v) => setFlip({ precoVenda: v })} step={1000} />
              <NumberField label="Prazo total (meses)" value={input.flip!.prazoMeses} onChange={(v) => setFlip({ prazoMeses: v })} suffix="m" />
              <NumberField label="Custo de capital (% a.m.)" value={input.flip!.custoCapitalMensal} onChange={(v) => setFlip({ custoCapitalMensal: v })} suffix="%" step={0.1} />
              <NumberField label="Corretagem (% sobre venda)" value={input.flip!.corretagemPct} onChange={(v) => setFlip({ corretagemPct: v })} suffix="%" step={0.5} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Aluguel mensal esperado (R$)" value={input.rent!.aluguelMensal} onChange={(v) => setRent({ aluguelMensal: v })} step={100} />
              <NumberField label="Vacância (%)" value={input.rent!.vacanciaPct} onChange={(v) => setRent({ vacanciaPct: v })} suffix="%" step={1} />
              <NumberField label="Custos mensais (R$)" value={input.rent!.custosMensais} onChange={(v) => setRent({ custosMensais: v })} step={50} />
              <NumberField label="Reforma até locação (meses)" value={input.rent!.prazoReformaMeses} onChange={(v) => setRent({ prazoReformaMeses: v })} suffix="m" />
              <NumberField label="Custo de capital (% a.m.)" value={input.rent!.custoCapitalMensal} onChange={(v) => setRent({ custoCapitalMensal: v })} suffix="%" step={0.1} />
            </div>
          )}
        </div>

        {/* Alavancagem */}
        <div className="card">
          <label className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Análise de alavancagem (financiamento)
            </span>
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand"
              checked={input.financing.ativo}
              onChange={(e) => setFin({ ativo: e.target.checked })}
            />
          </label>
          {input.financing.ativo && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <NumberField label="Entrada — capital próprio (%)" value={input.financing.entradaPct} onChange={(v) => setFin({ entradaPct: v })} suffix="%" step={5} />
              <NumberField label="Taxa do financiamento (% a.m.)" value={input.financing.taxaMensal} onChange={(v) => setFin({ taxaMensal: v })} suffix="%" step={0.1} />
              <NumberField label="Prazo do financiamento (meses)" value={input.financing.prazoMeses} onChange={(v) => setFin({ prazoMeses: v })} suffix="m" />
            </div>
          )}
        </div>

        {/* Critérios */}
        <div className="card">
          <SectionTitle>Critérios de decisão (GO/NO-GO)</SectionTitle>
          {input.mode === "flip" ? (
            <div className="grid grid-cols-3 gap-3">
              <NumberField label={input.financing.ativo ? "ROI equity mín. (%)" : "ROI mín. (%)"} value={input.criteria.roiMin ?? 0} onChange={(v) => setCrit({ roiMin: v })} suffix="%" />
              <NumberField label="Margem mín. (%)" value={input.criteria.margemMin ?? 0} onChange={(v) => setCrit({ margemMin: v })} suffix="%" />
              <NumberField label="Prazo máx. (meses)" value={input.criteria.prazoMax ?? 0} onChange={(v) => setCrit({ prazoMax: v })} suffix="m" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <NumberField label="Cap rate mín. (%)" value={input.criteria.capRateMin ?? 0} onChange={(v) => setCrit({ capRateMin: v })} suffix="%" step={0.5} />
              <NumberField label="Cashflow mín. (R$)" value={input.criteria.cashflowMin ?? 0} onChange={(v) => setCrit({ cashflowMin: v })} step={50} />
              <NumberField label="Payback máx. (anos)" value={input.criteria.paybackMax ?? 0} onChange={(v) => setCrit({ paybackMax: v })} suffix="a" />
            </div>
          )}
        </div>
      </div>

      {/* Coluna de resultados */}
      <div className="space-y-6">
        <Veredicto verdict={verdict} preview />

        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={analisar} disabled={salvando}>
            {salvando ? "Salvando…" : "Analisar e salvar"}
          </button>
          {salvo && <span className="text-sm text-emerald-600">✓ Operação salva no histórico</span>}
        </div>

        <div className="card">
          <Resultado result={result} bairro={bairroRef} />
        </div>

        <AIPanel input={input} result={result} />
      </div>
    </div>
  );
}
