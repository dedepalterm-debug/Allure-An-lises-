"use client";

import type { AnalysisResult, Neighborhood } from "@/lib/types";
import { brl, num, pct } from "@/lib/format";
import { Stat, SectionTitle } from "./ui";

function Comparativo({
  label,
  valor,
  mercado,
  unidade,
}: {
  label: string;
  valor: number;
  mercado: number;
  unidade: string;
}) {
  const diff = mercado ? ((valor - mercado) / mercado) * 100 : 0;
  const acima = diff > 0;
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-medium">
          {unidade}
          {num(valor, 0)}
        </span>
        <span className="text-slate-400">vs mercado {unidade}{num(mercado, 0)}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-medium ${
            acima ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {acima ? "▲" : "▼"} {pct(Math.abs(diff), 0)} {acima ? "acima" : "abaixo"}
        </span>
      </span>
    </div>
  );
}

export default function Resultado({
  result,
  bairro,
}: {
  result: AnalysisResult;
  bairro?: Neighborhood;
}) {
  return (
    <div className="space-y-6">
      {result.kind === "flip" ? (
        <>
          <div>
            <SectionTitle>Indicadores — Flip</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat
                label="Lucro líquido"
                value={brl(result.lucroLiquido)}
                tone={result.lucroLiquido >= 0 ? "good" : "bad"}
              />
              <Stat label="ROI total" value={pct(result.roiTotal)} />
              <Stat label="ROI anualizado" value={pct(result.roiAnualizado)} />
              <Stat label="Margem líquida" value={pct(result.margemLiquida)} />
              <Stat label="TIR (a.m.)" value={pct(result.tir, 2)} />
              <Stat label="VPL" value={brl(result.vpl)} tone={result.vpl >= 0 ? "good" : "bad"} />
              <Stat label="Múltiplo do capital" value={`${num(result.multipleCapital, 2)}x`} />
              <Stat label="Total investido" value={brl(result.totalInvestido)} />
              <Stat label="Custo de capital" value={brl(result.custoCapital)} />
            </div>
          </div>

          <div>
            <SectionTitle>Composição de custos</SectionTitle>
            <div className="space-y-1">
              {result.composicaoCustos.map((c) => (
                <div
                  key={c.label}
                  className="flex justify-between border-b border-slate-100 py-1 text-sm"
                >
                  <span className="text-slate-600">{c.label}</span>
                  <span className="font-medium">{brl(c.valor)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div>
          <SectionTitle>Indicadores — Locação</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Cap rate" value={pct(result.capRate)} />
            <Stat label="Yield bruto" value={pct(result.yieldBruto)} />
            <Stat label="Yield líquido" value={pct(result.yieldLiquido)} />
            <Stat
              label="Cashflow mensal"
              value={brl(result.cashflowMensal)}
              tone={result.cashflowMensal >= 0 ? "good" : "bad"}
            />
            <Stat label="ROI anual" value={pct(result.roiAnual)} />
            <Stat label="Payback" value={`${num(result.payback, 1)} anos`} />
            <Stat label="Aluguel/m²" value={brl(result.aluguelM2)} />
            <Stat label="Custo/m²" value={brl(result.custoM2)} />
            <Stat label="Total investido" value={brl(result.totalInvestido)} />
          </div>
        </div>
      )}

      {result.financiamento && (
        <div>
          <SectionTitle>Alavancagem (financiamento)</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Capital próprio" value={brl(result.financiamento.capitalProprio)} />
            <Stat label="Valor financiado" value={brl(result.financiamento.valorFinanciado)} />
            <Stat label="LTV" value={pct(result.financiamento.ltv)} />
            <Stat label="Parcela (Price)" value={brl(result.financiamento.parcelaMensal)} />
            <Stat label="Saldo devedor" value={brl(result.financiamento.saldoDevedor)} />
            <Stat label="Juros pagos" value={brl(result.financiamento.jurosPagos)} />
            <Stat
              label="ROI capital próprio"
              value={pct(result.financiamento.roiCapitalProprio)}
              tone={result.financiamento.roiCapitalProprio >= 0 ? "good" : "bad"}
            />
            <Stat
              label="Multiplicador alavancagem"
              value={`${num(result.financiamento.multiplicadorAlavancagem, 2)}x`}
            />
            {result.financiamento.cashflowAposParcela !== undefined && (
              <Stat
                label="Cashflow após parcela"
                value={brl(result.financiamento.cashflowAposParcela)}
                tone={result.financiamento.cashflowAposParcela >= 0 ? "good" : "bad"}
              />
            )}
          </div>
        </div>
      )}

      {bairro && (
        <div>
          <SectionTitle>Comparativo com o mercado — {bairro.bairro}</SectionTitle>
          <div className="space-y-2">
            {result.kind === "flip" ? (
              <Comparativo
                label="Preço/m² de venda"
                valor={result.precoM2Venda}
                mercado={bairro.preco_m2}
                unidade="R$"
              />
            ) : (
              <Comparativo
                label="Aluguel/m²"
                valor={result.aluguelM2}
                mercado={bairro.aluguel_m2}
                unidade="R$"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
