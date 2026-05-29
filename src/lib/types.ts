// Tipos compartilhados do domínio "Imóvel Viável".

export type Mode = "flip" | "rent";

export type NeighborhoodProfile =
  | "Alto Padrão"
  | "Médio-Alto"
  | "Médio"
  | "Popular";

export interface Neighborhood {
  id: string;
  bairro: string;
  cidade: string;
  tipo: NeighborhoodProfile;
  preco_m2: number; // R$/m² de venda
  aluguel_m2: number; // R$/m²/mês
  valorizacao: number; // % a.a.
  cap_rate: number; // % médio
  prioridade: boolean; // destaque (ex.: Ribeirão Preto)
  fonte: string;
  atualizado_em: string; // ISO date
}

// ---------- Entradas ----------

export interface AssetInputs {
  precoCompra: number; // R$
  area: number; // m²
  custoReforma: number; // R$
  transacaoPct: number; // % sobre compra (ITBI/cartório)
  outrosCustos: number; // R$ fixos
  bairro?: string; // bairro de referência
}

export interface FlipInputs {
  precoVenda: number; // R$
  prazoMeses: number; // meses
  custoCapitalMensal: number; // % a.m. (custo de oportunidade)
  corretagemPct: number; // % sobre venda
}

export interface RentInputs {
  aluguelMensal: number; // R$
  vacanciaPct: number; // %
  custosMensais: number; // R$ (condomínio + IPTU + manutenção)
  prazoReformaMeses: number; // meses até locação
  custoCapitalMensal: number; // % a.m.
}

export interface FinancingInputs {
  ativo: boolean; // toggle de alavancagem
  entradaPct: number; // % capital próprio sobre a compra
  taxaMensal: number; // % a.m. do financiamento
  prazoMeses: number; // meses do financiamento
}

export interface Criteria {
  // Flip
  roiMin?: number; // % (ROI total ou ROI equity se alavancado)
  margemMin?: number; // %
  prazoMax?: number; // meses
  // Locação
  capRateMin?: number; // %
  cashflowMin?: number; // R$/mês
  paybackMax?: number; // anos
}

export interface AnalysisInput {
  mode: Mode;
  asset: AssetInputs;
  flip?: FlipInputs;
  rent?: RentInputs;
  financing: FinancingInputs;
  criteria: Criteria;
}

// ---------- Resultados ----------

export interface FinancingResult {
  valorFinanciado: number;
  capitalProprio: number; // entrada
  ltv: number; // %
  parcelaMensal: number; // PMT (Price)
  saldoDevedor: number; // saldo na venda/no horizonte
  jurosPagos: number; // total de juros pagos no período
  custoTotalDivida: number; // parcelas pagas no período
  roiCapitalProprio: number; // %
  roiEquityAnualizado: number; // %
  multiplicadorAlavancagem: number; // roi equity / roi total
  cashflowAposParcela?: number; // R$/mês (locação)
}

export interface FlipResult {
  kind: "flip";
  totalInvestido: number;
  custoCapital: number; // custo de oportunidade do período
  lucroLiquido: number;
  roiTotal: number; // %
  roiAnualizado: number; // %
  margemLiquida: number; // %
  tir: number; // % a.m. (aprox.)
  vpl: number; // R$
  multipleCapital: number; // x
  precoM2Compra: number;
  precoM2Venda: number;
  composicaoCustos: { label: string; valor: number }[];
  financiamento?: FinancingResult;
}

export interface RentResult {
  kind: "rent";
  totalInvestido: number;
  aluguelEfetivoAnual: number;
  capRate: number; // %
  yieldBruto: number; // %
  yieldLiquido: number; // %
  cashflowMensal: number; // R$
  roiAnual: number; // %
  payback: number; // anos
  aluguelM2: number;
  custoM2: number;
  financiamento?: FinancingResult;
}

export type AnalysisResult = FlipResult | RentResult;

export interface CriterionCheck {
  label: string;
  valor: number;
  meta: number;
  unidade: string;
  atingido: boolean;
  comparador: ">=" | "<=";
}

export interface Verdict {
  go: boolean;
  checks: CriterionCheck[];
}

// ---------- Persistência ----------

export interface SavedOperation {
  id: string;
  created_at: string;
  mode: Mode;
  usa_financiamento: boolean;
  inputs: AnalysisInput;
  resultado: AnalysisResult;
  bairro: string | null;
  veredicto: boolean;
}
