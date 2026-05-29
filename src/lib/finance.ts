// Motor de cálculo financeiro do "Imóvel Viável".
//
// Todas as fórmulas seguem a seção 6 do PRD. Funções são puras e cobertas por
// testes unitários (finance.test.ts) com casos de referência (RNF-07).
//
// Convenções de unidade:
// - Percentuais de entrada (taxas, %) são informados em pontos percentuais
//   (ex.: 1.5 = 1,5% a.m.) e convertidos internamente para fração.
// - Valores monetários em reais (R$).

import type {
  AnalysisInput,
  AnalysisResult,
  CriterionCheck,
  FinancingResult,
  FlipResult,
  RentResult,
  Verdict,
} from "./types";

/** Arredonda para `casas` casas decimais, evitando ruído de ponto flutuante. */
export function round(value: number, casas = 2): number {
  if (!Number.isFinite(value)) return 0;
  const f = 10 ** casas;
  return Math.round((value + Number.EPSILON) * f) / f;
}

/** Divisão segura: retorna 0 quando o denominador é 0/indefinido. */
export function safeDiv(a: number, b: number): number {
  if (!b || !Number.isFinite(b)) return 0;
  return a / b;
}

/**
 * Parcela pela Tabela Price.
 * PMT = PV × [i(1+i)^n] / [(1+i)^n − 1]
 * @param pv valor financiado
 * @param i taxa mensal em fração (ex.: 0.012)
 * @param n número de parcelas
 */
export function pmtPrice(pv: number, i: number, n: number): number {
  if (n <= 0) return 0;
  if (i === 0) return pv / n;
  const f = Math.pow(1 + i, n);
  return (pv * (i * f)) / (f - 1);
}

/**
 * Saldo devedor após `k` pagamentos.
 * PV(1+i)^k − PMT × [(1+i)^k − 1] / i
 */
export function saldoDevedor(
  pv: number,
  i: number,
  pmt: number,
  k: number
): number {
  if (k <= 0) return pv;
  if (i === 0) return Math.max(0, pv - pmt * k);
  const f = Math.pow(1 + i, k);
  const saldo = pv * f - (pmt * (f - 1)) / i;
  return Math.max(0, saldo);
}

/** Valor presente líquido de uma série de fluxos (fluxo[0] em t=0). */
export function npv(rate: number, fluxos: number[]): number {
  return fluxos.reduce(
    (acc, cf, t) => acc + cf / Math.pow(1 + rate, t),
    0
  );
}

/**
 * Taxa interna de retorno (aproximação por bisseção).
 * Retorna a taxa por período (mesma periodicidade dos fluxos), em fração.
 * Retorna NaN se não houver convergência/raiz no intervalo.
 */
export function irr(fluxos: number[], palpite = 0.01): number {
  // Sem mudança de sinal não há TIR.
  const temPositivo = fluxos.some((f) => f > 0);
  const temNegativo = fluxos.some((f) => f < 0);
  if (!temPositivo || !temNegativo) return NaN;

  let lo = -0.9999;
  let hi = 10; // 1000% por período como teto
  let fLo = npv(lo, fluxos);
  let fHi = npv(hi, fluxos);
  if (fLo * fHi > 0) {
    // tenta expandir o teto
    hi = 100;
    fHi = npv(hi, fluxos);
    if (fLo * fHi > 0) return NaN;
  }

  let mid = palpite;
  for (let iter = 0; iter < 200; iter++) {
    mid = (lo + hi) / 2;
    const fMid = npv(mid, fluxos);
    if (Math.abs(fMid) < 1e-7) return mid;
    if (fLo * fMid < 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return mid;
}

/** Converte um retorno do período em retorno anualizado equivalente (%). */
export function anualizar(retornoFracao: number, meses: number): number {
  if (meses <= 0) return 0;
  return (Math.pow(1 + retornoFracao, 12 / meses) - 1) * 100;
}

/** Total investido sem alavancagem: compra + reforma + transação + outros. */
export function totalInvestido(input: AnalysisInput): number {
  const { precoCompra, custoReforma, transacaoPct, outrosCustos } = input.asset;
  const transacao = precoCompra * (transacaoPct / 100);
  return precoCompra + custoReforma + transacao + outrosCustos;
}

// ---------------- Financiamento (alavancagem) ----------------

function calcFinancing(
  input: AnalysisInput,
  total: number,
  opts: { horizonteMeses: number; roiBase: number; cashflowMensal?: number }
): FinancingResult {
  const { precoCompra } = input.asset;
  const { entradaPct, taxaMensal, prazoMeses } = input.financing;
  const i = taxaMensal / 100;

  const entradaCompra = precoCompra * (entradaPct / 100);
  const valorFinanciado = precoCompra - entradaCompra;
  // Capital próprio total = tudo que não foi financiado.
  const capitalProprio = total - valorFinanciado;
  const ltv = safeDiv(valorFinanciado, precoCompra) * 100;

  const parcela = pmtPrice(valorFinanciado, i, prazoMeses);
  const k = Math.min(opts.horizonteMeses, prazoMeses);
  const saldo = saldoDevedor(valorFinanciado, i, parcela, k);
  const parcelasPagas = parcela * k;
  const amortizado = valorFinanciado - saldo;
  const jurosPagos = parcelasPagas - amortizado;

  const result: FinancingResult = {
    valorFinanciado: round(valorFinanciado),
    capitalProprio: round(capitalProprio),
    ltv: round(ltv),
    parcelaMensal: round(parcela),
    saldoDevedor: round(saldo),
    jurosPagos: round(jurosPagos),
    custoTotalDivida: round(parcelasPagas),
    roiCapitalProprio: 0,
    roiEquityAnualizado: 0,
    multiplicadorAlavancagem: 0,
  };

  if (input.mode === "flip" && input.flip) {
    const { precoVenda, corretagemPct, prazoMeses: prazoFlip } = input.flip;
    const corretagem = precoVenda * (corretagemPct / 100);
    // ROI sobre capital próprio (PRD seção 6).
    const ganhoLiquido =
      precoVenda - corretagem - saldo - parcelasPagas - capitalProprio;
    const roiCP = safeDiv(ganhoLiquido, capitalProprio) * 100;
    result.roiCapitalProprio = round(roiCP);
    result.roiEquityAnualizado = round(anualizar(roiCP / 100, prazoFlip));
    result.multiplicadorAlavancagem = round(safeDiv(roiCP, opts.roiBase), 2);
  } else if (input.mode === "rent" && opts.cashflowMensal !== undefined) {
    const cashflowAposParcela = opts.cashflowMensal - parcela;
    result.cashflowAposParcela = round(cashflowAposParcela);
    const roiCP = safeDiv(cashflowAposParcela * 12, capitalProprio) * 100;
    result.roiCapitalProprio = round(roiCP);
    result.roiEquityAnualizado = round(roiCP); // já é anual
    result.multiplicadorAlavancagem = round(safeDiv(roiCP, opts.roiBase), 2);
  }

  return result;
}

// ---------------- Flip ----------------

export function analyzeFlip(input: AnalysisInput): FlipResult {
  const flip = input.flip!;
  const total = totalInvestido(input);
  const { area } = input.asset;
  const i = flip.custoCapitalMensal / 100;
  const n = flip.prazoMeses;

  const corretagem = flip.precoVenda * (flip.corretagemPct / 100);
  const receitaLiquidaVenda = flip.precoVenda - corretagem;
  // Custo de oportunidade do capital imobilizado no período (juros compostos).
  const custoCapital = total * (Math.pow(1 + i, n) - 1);
  const lucroLiquido = receitaLiquidaVenda - total - custoCapital;

  const roiTotal = safeDiv(lucroLiquido, total) * 100;
  const roiAnualizado = anualizar(roiTotal / 100, n);
  const margemLiquida = safeDiv(lucroLiquido, flip.precoVenda) * 100;

  // TIR a partir dos fluxos: t0 = −total, tn = +receita líquida.
  const fluxos = new Array(n + 1).fill(0);
  fluxos[0] = -total;
  fluxos[n] = receitaLiquidaVenda;
  const tirMensal = irr(fluxos);
  const tir = Number.isNaN(tirMensal) ? 0 : tirMensal * 100;

  // VPL descontando ao custo de capital.
  const vpl = npv(i, fluxos);
  const multipleCapital = safeDiv(receitaLiquidaVenda, total);

  const transacao = input.asset.precoCompra * (input.asset.transacaoPct / 100);

  const result: FlipResult = {
    kind: "flip",
    totalInvestido: round(total),
    custoCapital: round(custoCapital),
    lucroLiquido: round(lucroLiquido),
    roiTotal: round(roiTotal),
    roiAnualizado: round(roiAnualizado),
    margemLiquida: round(margemLiquida),
    tir: round(tir, 3),
    vpl: round(vpl),
    multipleCapital: round(multipleCapital, 2),
    precoM2Compra: round(safeDiv(input.asset.precoCompra, area)),
    precoM2Venda: round(safeDiv(flip.precoVenda, area)),
    composicaoCustos: [
      { label: "Compra", valor: round(input.asset.precoCompra) },
      { label: "Reforma", valor: round(input.asset.custoReforma) },
      { label: "Transação (ITBI/cartório)", valor: round(transacao) },
      { label: "Outros custos", valor: round(input.asset.outrosCustos) },
      { label: "Corretagem (venda)", valor: round(corretagem) },
      { label: "Custo de capital", valor: round(custoCapital) },
    ],
  };

  if (input.financing.ativo) {
    result.financiamento = calcFinancing(input, total, {
      horizonteMeses: n,
      roiBase: roiTotal,
    });
  }

  return result;
}

// ---------------- Locação ----------------

export function analyzeRent(input: AnalysisInput): RentResult {
  const rent = input.rent!;
  const total = totalInvestido(input);
  const { area, precoCompra, custoReforma } = input.asset;
  const valorImovel = precoCompra + custoReforma;

  const rendaBrutaMensal = rent.aluguelMensal;
  const rendaEfetivaMensal = rendaBrutaMensal * (1 - rent.vacanciaPct / 100);
  const cashflowMensal = rendaEfetivaMensal - rent.custosMensais; // NOI mensal
  const noiAnual = cashflowMensal * 12;
  const rendaBrutaAnual = rendaBrutaMensal * 12;

  const capRate = safeDiv(noiAnual, valorImovel) * 100;
  const yieldBruto = safeDiv(rendaBrutaAnual, total) * 100;
  const yieldLiquido = safeDiv(noiAnual, total) * 100;
  const roiAnual = yieldLiquido;
  const payback = safeDiv(total, noiAnual);

  const result: RentResult = {
    kind: "rent",
    totalInvestido: round(total),
    aluguelEfetivoAnual: round(noiAnual),
    capRate: round(capRate),
    yieldBruto: round(yieldBruto),
    yieldLiquido: round(yieldLiquido),
    cashflowMensal: round(cashflowMensal),
    roiAnual: round(roiAnual),
    payback: round(payback, 1),
    aluguelM2: round(safeDiv(rendaBrutaMensal, area)),
    custoM2: round(safeDiv(total, area)),
  };

  if (input.financing.ativo) {
    result.financiamento = calcFinancing(input, total, {
      horizonteMeses: input.financing.prazoMeses,
      roiBase: roiAnual,
      cashflowMensal,
    });
  }

  return result;
}

export function analyze(input: AnalysisInput): AnalysisResult {
  return input.mode === "flip" ? analyzeFlip(input) : analyzeRent(input);
}

// ---------------- Veredicto GO / NO-GO ----------------

export function buildVerdict(
  input: AnalysisInput,
  result: AnalysisResult
): Verdict {
  const checks: CriterionCheck[] = [];
  const c = input.criteria;
  const alavancado = input.financing.ativo && !!result.financiamento;

  if (result.kind === "flip") {
    if (c.roiMin !== undefined) {
      const valor = alavancado
        ? result.financiamento!.roiCapitalProprio
        : result.roiTotal;
      checks.push({
        label: alavancado ? "ROI s/ capital próprio" : "ROI total",
        valor,
        meta: c.roiMin,
        unidade: "%",
        comparador: ">=",
        atingido: valor >= c.roiMin,
      });
    }
    if (c.margemMin !== undefined) {
      checks.push({
        label: "Margem líquida",
        valor: result.margemLiquida,
        meta: c.margemMin,
        unidade: "%",
        comparador: ">=",
        atingido: result.margemLiquida >= c.margemMin,
      });
    }
    if (c.prazoMax !== undefined && input.flip) {
      checks.push({
        label: "Prazo",
        valor: input.flip.prazoMeses,
        meta: c.prazoMax,
        unidade: "meses",
        comparador: "<=",
        atingido: input.flip.prazoMeses <= c.prazoMax,
      });
    }
  } else {
    if (c.capRateMin !== undefined) {
      checks.push({
        label: "Cap rate",
        valor: result.capRate,
        meta: c.capRateMin,
        unidade: "%",
        comparador: ">=",
        atingido: result.capRate >= c.capRateMin,
      });
    }
    if (c.cashflowMin !== undefined) {
      const valor = alavancado
        ? result.financiamento!.cashflowAposParcela ?? 0
        : result.cashflowMensal;
      checks.push({
        label: alavancado ? "Cashflow após parcela" : "Cashflow mensal",
        valor,
        meta: c.cashflowMin,
        unidade: "R$",
        comparador: ">=",
        atingido: valor >= c.cashflowMin,
      });
    }
    if (c.paybackMax !== undefined) {
      checks.push({
        label: "Payback",
        valor: result.payback,
        meta: c.paybackMax,
        unidade: "anos",
        comparador: "<=",
        atingido: result.payback > 0 && result.payback <= c.paybackMax,
      });
    }
  }

  const go = checks.length > 0 && checks.every((ck) => ck.atingido);
  return { go, checks };
}
