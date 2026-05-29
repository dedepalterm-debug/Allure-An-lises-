"use client";

import type { Verdict } from "@/lib/types";
import { num } from "@/lib/format";

function formatVal(v: number, unidade: string): string {
  if (unidade === "R$")
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(v);
  if (unidade === "%") return `${num(v, 1)}%`;
  return `${num(v, unidade === "anos" ? 1 : 0)} ${unidade}`;
}

export default function Veredicto({
  verdict,
  preview = false,
}: {
  verdict: Verdict;
  preview?: boolean;
}) {
  const go = verdict.go;
  return (
    <div
      className={`rounded-xl border p-5 ${
        go
          ? "border-emerald-200 bg-emerald-50"
          : "border-rose-200 bg-rose-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          {preview && (
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Preview em tempo real
            </div>
          )}
          <div
            className={`text-2xl font-bold ${
              go ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {go ? "✅ GO" : "⛔ NO-GO"}
          </div>
        </div>
        <div className="text-right text-xs text-slate-500">
          {verdict.checks.filter((c) => c.atingido).length}/
          {verdict.checks.length} critérios atendidos
        </div>
      </div>

      {verdict.checks.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          Defina ao menos um critério de decisão para obter o veredicto.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {verdict.checks.map((c) => (
            <li
              key={c.label}
              className="flex items-center justify-between rounded-md bg-white/70 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2">
                <span className={c.atingido ? "text-emerald-600" : "text-rose-600"}>
                  {c.atingido ? "✓" : "✗"}
                </span>
                <span className="font-medium text-slate-700">{c.label}</span>
              </span>
              <span className="text-slate-600">
                {formatVal(c.valor, c.unidade)}{" "}
                <span className="text-slate-400">
                  ({c.comparador === ">=" ? "≥" : "≤"}{" "}
                  {formatVal(c.meta, c.unidade)})
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
