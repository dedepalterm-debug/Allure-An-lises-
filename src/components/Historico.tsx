"use client";

import { useState } from "react";
import type { SavedOperation } from "@/lib/types";
import { brl, dateBR, pct } from "@/lib/format";
import { deleteOperation } from "@/lib/storage";

function Resumo({ op }: { op: SavedOperation }) {
  const r = op.resultado;
  if (r.kind === "flip") {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
        <span>ROI: <b>{pct(r.financiamento?.roiCapitalProprio ?? r.roiTotal)}</b></span>
        <span>Lucro: <b>{brl(r.lucroLiquido)}</b></span>
        <span>VPL: <b>{brl(r.vpl)}</b></span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
      <span>Cap rate: <b>{pct(r.capRate)}</b></span>
      <span>Cashflow: <b>{brl(r.financiamento?.cashflowAposParcela ?? r.cashflowMensal)}</b></span>
      <span>Payback: <b>{r.payback} anos</b></span>
    </div>
  );
}

export default function Historico({
  operacoes,
  onChange,
}: {
  operacoes: SavedOperation[];
  onChange: () => void;
}) {
  const [aberto, setAberto] = useState<string | null>(null);

  async function remover(id: string) {
    await deleteOperation(id);
    onChange();
  }

  if (operacoes.length === 0) {
    return (
      <div className="card text-center text-sm text-slate-500">
        Nenhuma operação salva ainda. Rode uma análise para registrá-la aqui.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {operacoes.map((op) => (
        <div key={op.id} className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    op.mode === "flip"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-sky-100 text-sky-700"
                  }`}
                >
                  {op.mode === "flip" ? "Flip" : "Locação"}
                </span>
                {op.usa_financiamento && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    ⚡ Alavancado
                  </span>
                )}
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    op.veredicto
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {op.veredicto ? "GO" : "NO-GO"}
                </span>
              </div>
              <div className="mt-1 text-sm font-medium">
                {op.bairro || "Sem bairro"}{" "}
                <span className="font-normal text-slate-400">
                  · {dateBR(op.created_at)}
                </span>
              </div>
              <div className="mt-2">
                <Resumo op={op} />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="btn-ghost px-2 py-1 text-xs"
                onClick={() => setAberto(aberto === op.id ? null : op.id)}
              >
                {aberto === op.id ? "Ocultar" : "Detalhes"}
              </button>
              <button
                className="btn-ghost px-2 py-1 text-xs text-rose-600"
                onClick={() => remover(op.id)}
              >
                Excluir
              </button>
            </div>
          </div>

          {aberto === op.id && (
            <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-semibold uppercase text-slate-500">
                  Entradas
                </div>
                <pre className="overflow-x-auto rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                  {JSON.stringify(op.inputs, null, 2)}
                </pre>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold uppercase text-slate-500">
                  Indicadores
                </div>
                <pre className="overflow-x-auto rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                  {JSON.stringify(op.resultado, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
