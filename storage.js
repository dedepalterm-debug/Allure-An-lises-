// ─────────────────────────────────────────────────────────────────────────────
// Camada de armazenamento do Imóvel Viável
//
// Por padrão usa localStorage (funciona imediatamente, sem configurar banco).
// Para usar banco de dados real (Supabase), veja lib/storage.supabase.js e
// troque o export no final deste arquivo.
//
// A interface imita a API usada pelo app: list / get / set / delete.
// ─────────────────────────────────────────────────────────────────────────────

const localStorageDriver = {
  async list(prefix = "") {
    const keys = [];
    if (typeof window === "undefined") return { keys };
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
    return { keys };
  },
  async get(key) {
    if (typeof window === "undefined") return null;
    const value = window.localStorage.getItem(key);
    return value === null ? null : { key, value };
  },
  async set(key, value) {
    if (typeof window === "undefined") return null;
    window.localStorage.setItem(key, value);
    return { key, value };
  },
  async delete(key) {
    if (typeof window === "undefined") return null;
    window.localStorage.removeItem(key);
    return { key, deleted: true };
  },
};

// Driver ativo. Para migrar para Supabase:
//   import { supabaseDriver } from "./storage.supabase";
//   export const storage = supabaseDriver;
export const storage = localStorageDriver;
