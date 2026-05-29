import { describe, it, expect } from "vitest";
import {
  pmtPrice,
  saldoDevedor,
  npv,
  irr,
  anualizar,
  totalInvestido,
  analyzeFlip,
  analyzeRent,
  buildVerdict,
} from "./finance";
import type { AnalysisInput } from "./types";

const close = (a: number, b: number, tol = 0.5) =>
  expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

describe("primitivas financeiras", () => {
  it("pmtPrice calcula a parcela da Tabela Price", () => {
    // PV=100000, i=1% a.m., n=120 -> ~1434.71
    close(pmtPrice(100000, 0.01, 120), 1434.71, 0.05);
  });

  it("pmtPrice com taxa zero divide o principal pelas parcelas", () => {
    expect(pmtPrice(12000, 0, 12)).toBe(1000);
  });

  it("saldoDevedor zera ao fim do prazo", () => {
    const pmt = pmtPrice(100000, 0.01, 120);
    close(saldoDevedor(100000, 0.01, pmt, 120), 0, 0.5);
  });

  it("saldoDevedor após k pagamentos parciais", () => {
    const pmt = pmtPrice(240000, 0.01, 240);
    // após 12 pagamentos ~ 236923
    close(saldoDevedor(240000, 0.01, pmt, 12), 236923, 5);
  });

  it("npv soma simples quando taxa é zero", () => {
    expect(npv(0, [-100, 50, 60])).toBe(10);
  });

  it("irr resolve fluxo de dois períodos", () => {
    // -100 + 121/(1+r)^2 = 0 -> r = 0.10
    close(irr([-100, 0, 121]), 0.1, 0.0005);
  });

  it("irr retorna NaN sem mudança de sinal", () => {
    expect(Number.isNaN(irr([100, 50, 60]))).toBe(true);
  });

  it("anualizar converte retorno do período", () => {
    // 21% em 24 meses -> 10% a.a.
    close(anualizar(0.21, 24), 10, 0.001);
  });
});

const baseFlip: AnalysisInput = {
  mode: "flip",
  asset: {
    precoCompra: 300000,
    area: 100,
    custoReforma: 50000,
    transacaoPct: 5,
    outrosCustos: 10000,
    bairro: "Jardim Botânico",
  },
  flip: {
    precoVenda: 500000,
    prazoMeses: 12,
    custoCapitalMensal: 1,
    corretagemPct: 5,
  },
  financing: { ativo: false, entradaPct: 20, taxaMensal: 1, prazoMeses: 240 },
  criteria: { roiMin: 10, margemMin: 8, prazoMax: 12 },
};

describe("totalInvestido", () => {
  it("soma compra + reforma + transação + outros", () => {
    // 300000 + 50000 + 15000 + 10000
    expect(totalInvestido(baseFlip)).toBe(375000);
  });
});

describe("analyzeFlip (sem alavancagem)", () => {
  const r = analyzeFlip(baseFlip);

  it("total investido", () => expect(r.totalInvestido).toBe(375000));
  it("lucro líquido", () => close(r.lucroLiquido, 52440.62, 1));
  it("ROI total", () => close(r.roiTotal, 13.98, 0.05));
  it("margem líquida", () => close(r.margemLiquida, 10.49, 0.05));
  it("TIR mensal aprox", () => close(r.tir, 1.989, 0.01));
  it("VPL ao custo de capital", () => close(r.vpl, 46542, 5));
  it("multiple do capital", () => close(r.multipleCapital, 1.27, 0.01));
  it("preço/m² de venda", () => expect(r.precoM2Venda).toBe(5000));
});

describe("analyzeFlip (alavancado)", () => {
  const input: AnalysisInput = {
    ...baseFlip,
    financing: { ativo: true, entradaPct: 20, taxaMensal: 1, prazoMeses: 240 },
  };
  const r = analyzeFlip(input);

  it("gera bloco de financiamento", () => {
    expect(r.financiamento).toBeDefined();
  });
  it("valor financiado e capital próprio", () => {
    expect(r.financiamento!.valorFinanciado).toBe(240000);
    expect(r.financiamento!.capitalProprio).toBe(135000);
  });
  it("LTV", () => expect(r.financiamento!.ltv).toBe(80));
  it("parcela Price", () => close(r.financiamento!.parcelaMensal, 2642.6, 1));
  it("ROI sobre capital próprio amplificado", () => {
    close(r.financiamento!.roiCapitalProprio, 52.86, 1);
  });
  it("multiplicador de alavancagem > 1", () => {
    expect(r.financiamento!.multiplicadorAlavancagem).toBeGreaterThan(1);
  });
});

const baseRent: AnalysisInput = {
  mode: "rent",
  asset: {
    precoCompra: 300000,
    area: 80,
    custoReforma: 20000,
    transacaoPct: 4,
    outrosCustos: 5000,
  },
  rent: {
    aluguelMensal: 2500,
    vacanciaPct: 5,
    custosMensais: 600,
    prazoReformaMeses: 2,
    custoCapitalMensal: 1,
  },
  financing: { ativo: false, entradaPct: 20, taxaMensal: 1, prazoMeses: 240 },
  criteria: { capRateMin: 6, cashflowMin: 1000, paybackMax: 20 },
};

describe("analyzeRent (sem alavancagem)", () => {
  const r = analyzeRent(baseRent);
  it("total investido", () => expect(r.totalInvestido).toBe(337000));
  it("cashflow mensal (NOI)", () => close(r.cashflowMensal, 1775, 0.5));
  it("cap rate sobre valor do imóvel", () => close(r.capRate, 6.66, 0.05));
  it("yield bruto", () => close(r.yieldBruto, 8.9, 0.05));
  it("yield líquido", () => close(r.yieldLiquido, 6.32, 0.05));
  it("payback em anos", () => close(r.payback, 15.8, 0.1));
  it("aluguel/m²", () => expect(r.aluguelM2).toBe(31.25));
});

describe("analyzeRent (alavancado)", () => {
  const input: AnalysisInput = {
    ...baseRent,
    financing: { ativo: true, entradaPct: 30, taxaMensal: 0.9, prazoMeses: 360 },
  };
  const r = analyzeRent(input);
  it("calcula cashflow após parcela", () => {
    expect(r.financiamento!.cashflowAposParcela).toBeDefined();
  });
  it("cashflow após parcela menor que NOI", () => {
    expect(r.financiamento!.cashflowAposParcela!).toBeLessThan(r.cashflowMensal);
  });
});

describe("buildVerdict", () => {
  it("GO quando todos os critérios são atendidos (flip)", () => {
    const r = analyzeFlip(baseFlip);
    const v = buildVerdict(baseFlip, r);
    expect(v.checks).toHaveLength(3);
    expect(v.go).toBe(true);
  });

  it("NO-GO quando um critério falha (ROI mínimo alto)", () => {
    const input = { ...baseFlip, criteria: { ...baseFlip.criteria, roiMin: 30 } };
    const r = analyzeFlip(input);
    const v = buildVerdict(input, r);
    expect(v.go).toBe(false);
    expect(v.checks.find((c) => c.label === "ROI total")!.atingido).toBe(false);
  });

  it("usa ROI sobre capital próprio quando alavancado", () => {
    const input: AnalysisInput = {
      ...baseFlip,
      financing: { ativo: true, entradaPct: 20, taxaMensal: 1, prazoMeses: 240 },
    };
    const r = analyzeFlip(input);
    const v = buildVerdict(input, r);
    expect(v.checks.find((c) => c.label === "ROI s/ capital próprio")).toBeDefined();
  });

  it("locação avalia cap rate, cashflow e payback", () => {
    const r = analyzeRent(baseRent);
    const v = buildVerdict(baseRent, r);
    expect(v.checks).toHaveLength(3);
    // payback 15.8 <= 20 ok; capRate 6.66 >= 6 ok; cashflow 1775 >= 1000 ok
    expect(v.go).toBe(true);
  });
});
