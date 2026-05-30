// ─────────────────────────────────────────────────────────────────────────────
// Driver de armazenamento com Supabase (opcional)
//
// Para ativar:
//   1. npm install @supabase/supabase-js
//   2. Crie um projeto em supabase.com e rode o schema em supabase-schema.sql
//   3. Defina as variáveis no .env.local e no Vercel:
//        NEXT_PUBLIC_SUPABASE_URL
//        NEXT_PUBLIC_SUPABASE_ANON_KEY
//   4. Em lib/storage.js, troque o export para usar este driver:
//        import { supabaseDriver } from "./storage.supabase";
//        export const storage = supabaseDriver;
//
// Mantém a mesma interface key-value (list/get/set/delete) usada pelo app,
// gravando cada operação como uma linha na tabela `operacoes` (coluna `chave`,
// `valor` jsonb). Simples e suficiente para o histórico.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = url && anon ? createClient(url, anon) : null;

export const supabaseDriver = {
  async list(prefix = "") {
    if (!supabase) return { keys: [] };
    const { data, error } = await supabase
      .from("operacoes")
      .select("chave")
      .like("chave", `${prefix}%`);
    if (error) { console.error(error); return { keys: [] }; }
    return { keys: data.map((r) => r.chave) };
  },
  async get(key) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("operacoes")
      .select("valor")
      .eq("chave", key)
      .single();
    if (error || !data) return null;
    return { key, value: JSON.stringify(data.valor) };
  },
  async set(key, value) {
    if (!supabase) return null;
    const valor = typeof value === "string" ? JSON.parse(value) : value;
    const { error } = await supabase
      .from("operacoes")
      .upsert({ chave: key, valor }, { onConflict: "chave" });
    if (error) { console.error(error); return null; }
    return { key, value };
  },
  async delete(key) {
    if (!supabase) return null;
    const { error } = await supabase.from("operacoes").delete().eq("chave", key);
    if (error) { console.error(error); return null; }
    return { key, deleted: true };
  },
};
