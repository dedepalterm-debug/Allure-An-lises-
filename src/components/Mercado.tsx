"use client";

import { useMemo, useState } from "react";
import type { Neighborhood } from "@/lib/types";
import { brl, num, pct } from "@/lib/format";

export default function Mercado({
  bairros,
  onSelect,
}: {
  bairros: Neighborhood[];
  onSelect: (b: Neighborhood) => void;
}) {
  const cidades = useMemo(
    () => Array.from(new Set(bairros.map((b) => b.cidade))),
    [bairros]
  );
  const [cidade, setCidade] = useState<string>("Todas");

  const filtrados = useMemo(
    () => (cidade === "Todas" ? bairros : bairros.filter((b) => b.cidade === cidade)),
    [bairros, cidade]
  );

  return (
    <div className="card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Benchmarks de mercado</h2>
          <p className="text-sm text-slate-500">
            Clique em um bairro para usá-lo como referência na análise.
          </p>
        </div>
        <label className="text-sm">
          <span className="mr-2 text-slate-500">Cidade:</span>
          <select
            className="field inline-block w-auto"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          >
            <option>Todas</option>
            {cidades.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="py-2 pr-3">Bairro</th>
              <th className="py-2 pr-3">Cidade</th>
              <th className="py-2 pr-3">Perfil</th>
              <th className="py-2 pr-3 text-right">Preço/m²</th>
              <th className="py-2 pr-3 text-right">Aluguel/m²</th>
              <th className="py-2 pr-3 text-right">Yield bruto</th>
              <th className="py-2 pr-3 text-right">Valorização</th>
              <th className="py-2 pr-3 text-right">Cap rate</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((b) => {
              const yieldBruto = b.preco_m2 ? ((b.aluguel_m2 * 12) / b.preco_m2) * 100 : 0;
              return (
                <tr
                  key={b.id}
                  className={`border-b border-slate-100 ${
                    b.prioridade ? "bg-teal-50/60" : ""
                  }`}
                >
                  <td className="py-2 pr-3 font-medium">
                    {b.prioridade && <span className="mr-1" title={b.fonte}>⭐</span>}
                    {b.bairro}
                  </td>
                  <td className="py-2 pr-3 text-slate-600">{b.cidade}</td>
                  <td className="py-2 pr-3 text-slate-600">{b.tipo}</td>
                  <td className="py-2 pr-3 text-right">{brl(b.preco_m2)}</td>
                  <td className="py-2 pr-3 text-right">{brl(b.aluguel_m2)}</td>
                  <td className="py-2 pr-3 text-right">{pct(yieldBruto)}</td>
                  <td className="py-2 pr-3 text-right">{pct(b.valorizacao)}</td>
                  <td className="py-2 pr-3 text-right">{num(b.cap_rate, 1)}%</td>
                  <td className="py-2 text-right">
                    <button
                      className="btn-ghost px-2 py-1 text-xs"
                      onClick={() => onSelect(b)}
                    >
                      Usar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        ⭐ Bairros de Ribeirão Preto em destaque. Fontes: FipeZAP, CRECISP,
        Apto.vc, KoreImob e fontes locais (2025).
      </p>
    </div>
  );
}
