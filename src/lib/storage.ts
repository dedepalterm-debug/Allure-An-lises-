// Camada de persistência do histórico e dos benchmarks.
//
// Substitui o `window.storage` do protótipo (PRD seção 7): usa Supabase quando
// configurado, caindo para localStorage como fallback para que o app funcione
// sem backend na v1.

import { getSupabase, isSupabaseConfigured } from "./supabase";
import { SEED_NEIGHBORHOODS } from "./benchmarks";
import type {
  AnalysisInput,
  AnalysisResult,
  Neighborhood,
  SavedOperation,
} from "./types";

const LS_KEY = "imovel-viavel:operacoes";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `op-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ---------------- Benchmarks (bairros) ----------------

export async function loadNeighborhoods(): Promise<Neighborhood[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("bairros")
      .select("*")
      .order("prioridade", { ascending: false })
      .order("preco_m2", { ascending: false });
    if (!error && data && data.length > 0) {
      return data as Neighborhood[];
    }
  }
  // Fallback: seed local (ordenado: prioridade primeiro).
  return [...SEED_NEIGHBORHOODS].sort((a, b) => {
    if (a.prioridade !== b.prioridade) return a.prioridade ? -1 : 1;
    return b.preco_m2 - a.preco_m2;
  });
}

// ---------------- Histórico (operações) ----------------

function readLocal(): SavedOperation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SavedOperation[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(ops: SavedOperation[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(ops));
}

export async function saveOperation(params: {
  mode: AnalysisInput["mode"];
  inputs: AnalysisInput;
  resultado: AnalysisResult;
  bairro: string | null;
  veredicto: boolean;
}): Promise<SavedOperation> {
  const op: SavedOperation = {
    id: uuid(),
    created_at: new Date().toISOString(),
    mode: params.mode,
    usa_financiamento: params.inputs.financing.ativo,
    inputs: params.inputs,
    resultado: params.resultado,
    bairro: params.bairro,
    veredicto: params.veredicto,
  };

  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("operacoes")
      .insert({
        mode: op.mode,
        usa_financiamento: op.usa_financiamento,
        inputs: op.inputs,
        resultado: op.resultado,
        bairro: op.bairro,
        veredicto: op.veredicto,
      })
      .select()
      .single();
    if (!error && data) {
      return data as SavedOperation;
    }
  }

  const ops = readLocal();
  ops.unshift(op);
  writeLocal(ops);
  return op;
}

export async function listOperations(): Promise<SavedOperation[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("operacoes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) return data as SavedOperation[];
  }
  return readLocal();
}

export async function deleteOperation(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from("operacoes").delete().eq("id", id);
    if (!error) return;
  }
  writeLocal(readLocal().filter((o) => o.id !== id));
}

export { isSupabaseConfigured };
