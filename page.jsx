"use client";
import { useState, useEffect } from "react";
import { storage } from "../lib/storage";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const pct = (v) => `${(v || 0).toFixed(2)}%`;
const n2 = (v) => (v || 0).toFixed(2);

const MARKET = [
  { bairro: "Vila do Golf", cidade: "Ribeirão Preto", tipo: "Alto Padrão", precoM2: 11500, aluguelM2: 48, valorizacao: 7.5, capRate: 5.0, destaque: "Mais valorizado de RP. Iguatemi e verticais premium.", prioridade: true },
  { bairro: "Nova Aliança", cidade: "Ribeirão Preto", tipo: "Alto Padrão", precoM2: 9500, aluguelM2: 42, valorizacao: 7.2, capRate: 5.3, destaque: "m² médio R$9.453 (Apto.vc 2025). Alta demanda UNIP.", prioridade: true },
  { bairro: "Ilhas do Sul", cidade: "Ribeirão Preto", tipo: "Alto Padrão", precoM2: 8900, aluguelM2: 38, valorizacao: 6.8, capRate: 5.1, destaque: "Referência Médio-Alto Padrão. 24% do VGV da cidade.", prioridade: true },
  { bairro: "Alto da Boa Vista", cidade: "Ribeirão Preto", tipo: "Alto Padrão", precoM2: 8200, aluguelM2: 36, valorizacao: 6.2, capRate: 5.3, destaque: "Zona Sul premium. Condomínios fechados de alto nível.", prioridade: true },
  { bairro: "Jardim Botânico", cidade: "Ribeirão Preto", tipo: "Alto Padrão", precoM2: 7000, aluguelM2: 30, valorizacao: 6.5, capRate: 5.1, destaque: ">R$6.800/m² (KoreImob jun/2025). Mais buscado p/ aluguel.", prioridade: true },
  { bairro: "City Ribeirão", cidade: "Ribeirão Preto", tipo: "Médio-Alto", precoM2: 7200, aluguelM2: 32, valorizacao: 6.0, capRate: 5.3, destaque: "m² R$7.200 (fonte local 2025). Boa infraestrutura.", prioridade: true },
  { bairro: "Olhos D'Água", cidade: "Ribeirão Preto", tipo: "Médio-Alto", precoM2: 6800, aluguelM2: 30, valorizacao: 7.0, capRate: 5.3, destaque: "Maior crescimento de valorização. Urbanismo planejado.", prioridade: true },
  { bairro: "Ribeirânia", cidade: "Ribeirão Preto", tipo: "Médio-Alto", precoM2: 6500, aluguelM2: 28, valorizacao: 5.8, capRate: 5.2, destaque: "Próximo à USP. Alta demanda de estudantes.", prioridade: true },
  { bairro: "Bonfim Paulista", cidade: "Ribeirão Preto", tipo: "Médio", precoM2: 6100, aluguelM2: 26, valorizacao: 5.5, capRate: 5.1, destaque: "m² R$6.100 (fonte local 2025). Próximo ao RibeirãoShopping.", prioridade: true },
  { bairro: "Campos Elíseos", cidade: "Ribeirão Preto", tipo: "Médio", precoM2: 5500, aluguelM2: 24, valorizacao: 4.8, capRate: 5.2, destaque: "Zona Norte consolidada.", prioridade: true },
  { bairro: "Jardim Paulista", cidade: "Ribeirão Preto", tipo: "Médio", precoM2: 5800, aluguelM2: 25, valorizacao: 4.5, capRate: 5.2, destaque: "Região central. Perfil misto.", prioridade: true },
  { bairro: "Ipiranga", cidade: "Ribeirão Preto", tipo: "Popular", precoM2: 4200, aluguelM2: 19, valorizacao: 3.8, capRate: 5.4, destaque: "Expansão periférica. MCMV.", prioridade: true },
  { bairro: "Moema", cidade: "São Paulo", tipo: "Alto Padrão", precoM2: 14500, aluguelM2: 55, valorizacao: 6.2, capRate: 4.5, destaque: "", prioridade: false },
  { bairro: "Pinheiros", cidade: "São Paulo", tipo: "Alto Padrão", precoM2: 13200, aluguelM2: 52, valorizacao: 5.8, capRate: 4.7, destaque: "", prioridade: false },
  { bairro: "Tatuapé", cidade: "São Paulo", tipo: "Médio", precoM2: 8900, aluguelM2: 35, valorizacao: 4.8, capRate: 4.7, destaque: "", prioridade: false },
  { bairro: "Ipanema", cidade: "Rio de Janeiro", tipo: "Alto Padrão", precoM2: 18000, aluguelM2: 75, valorizacao: 4.5, capRate: 5.0, destaque: "", prioridade: false },
  { bairro: "Savassi", cidade: "Belo Horizonte", tipo: "Médio-Alto", precoM2: 8500, aluguelM2: 33, valorizacao: 5.2, capRate: 4.7, destaque: "", prioridade: false },
];

const Field = ({ label, value, onChange, prefix, suffix, hint }) => (
  <div style={{ marginBottom: "12px" }}>
    <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7a6e64", marginBottom: "3px" }}>{label}</label>
    {hint && <p style={{ fontSize: "10px", color: "#4a4038", marginBottom: "3px", lineHeight: "1.5" }}>{hint}</p>}
    <div style={{ display: "flex", alignItems: "center", background: "#141210", border: "1px solid #2e2418", borderRadius: "5px", overflow: "hidden" }}>
      {prefix && <span style={{ padding: "0 9px", color: "#c8a87a", fontSize: "11px", borderRight: "1px solid #2e2418", fontFamily: "monospace", whiteSpace: "nowrap" }}>{prefix}</span>}
      <input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "9px 11px", color: "#f5efe8", fontSize: "13px", fontFamily: "monospace", minWidth: 0 }} />
      {suffix && <span style={{ padding: "0 9px", color: "#5a5048", fontSize: "10px", borderLeft: "1px solid #2e2418", whiteSpace: "nowrap" }}>{suffix}</span>}
    </div>
  </div>
);

const Sel = ({ label, value, onChange, options, grouped }) => (
  <div style={{ marginBottom: "12px" }}>
    <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7a6e64", marginBottom: "3px" }}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", background: "#141210", border: "1px solid #2e2418", borderRadius: "5px", padding: "9px 11px", color: value ? "#f5efe8" : "#5a5048", fontSize: "12px", outline: "none", cursor: "pointer" }}>
      <option value="">— Selecione —</option>
      {grouped ? (<>
        <optgroup label="📍 Ribeirão Preto">{options.filter(o => o.cidade === "Ribeirão Preto").map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</optgroup>
        <optgroup label="Outras Cidades">{options.filter(o => o.cidade !== "Ribeirão Preto").map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</optgroup>
      </>) : options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

const M = ({ label, value, pos, neg, gold, sm, badge }) => (
  <div style={{ padding: "11px 13px", background: gold ? "rgba(200,168,122,0.07)" : "#0f0d0b", border: `1px solid ${gold ? "#c8a87a28" : "#1e1a14"}`, borderRadius: "6px", position: "relative" }}>
    {badge && <div style={{ position: "absolute", top: "5px", right: "7px", fontSize: "8px", color: badge === "alav" ? "#a07040" : "#406080", letterSpacing: "0.08em" }}>{badge === "alav" ? "ALAVANCADO" : "SEM ALAV."}</div>}
    <div style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#5a5048", marginBottom: "3px" }}>{label}</div>
    <div style={{ fontSize: sm ? "14px" : "18px", fontWeight: "700", fontFamily: "monospace", color: pos ? "#6ec898" : neg ? "#e07070" : gold ? "#c8a87a" : "#f0e8e0" }}>{value}</div>
  </div>
);

const renderAI = (text) => text.split('\n').map((line, i) => {
  const html = line.replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong style="color:#c8a87a;font-size:10px;letter-spacing:0.1em;text-transform:uppercase">${t}</strong>`);
  return <p key={i} style={{ margin: "2px 0", fontSize: "12px", color: "#b0a8a0", lineHeight: "1.75" }} dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }} />;
});

const PMT = (taxa, prazo, pv) => taxa === 0 ? pv / prazo : pv * (taxa * Math.pow(1 + taxa, prazo)) / (Math.pow(1 + taxa, prazo) - 1);
const saldoApos = (taxa, prazo, pv, k) => {
  const parcela = PMT(taxa, prazo, pv);
  return taxa === 0 ? pv - (pv / prazo) * k : pv * Math.pow(1 + taxa, k) - parcela * (Math.pow(1 + taxa, k) - 1) / taxa;
};

export default function App() {
  const [mode, setMode] = useState("flip");
  const [tab, setTab] = useState("analise");
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [aiText, setAiText] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [viewHist, setViewHist] = useState(null);
  const [mktCity, setMktCity] = useState("Ribeirão Preto");

  const [inp, setInp] = useState({
    // Flip / Locação — ativo
    precoCompra: 350000, areaM2: 70, custoReforma: 60000,
    // Construção — terreno e obra
    precoTerreno: 180000, areaTerreno: 250, areaConstruir: 160, custoM2Construcao: 3200, custosProjeto: 25000,
    // Compartilhado
    custosTransacao: 3, outrosCustos: 4000, bairro: "Nova Aliança",
    // Flip / Construção — venda
    precoVenda: 520000, custoCorretagem: 6,
    // Locação
    aluguelMensal: 2800, taxaVacancia: 8, custosMensais: 600, prazoReforma: 3,
    // Operação
    prazoMeses: 7, taxaJurosMensal: 1.2,
    // Alavancagem
    usaFinanciamento: false, entrada: 25, taxaFinanciamento: 1.0, prazoFinanciamento: 240,
    // Critérios
    minROI: 20, minROIEquity: 40, minMargem: 15, maxPrazo: 12,
    minCapRate: 5.5, maxPaybackAnos: 15, minCashflow: 0,
  });
  const s = (k) => (v) => setInp(p => ({ ...p, [k]: v }));
  const tog = (k) => () => setInp(p => ({ ...p, [k]: !p[k] }));

  // ── FLIP ──
  const calcFlip = (i = inp) => {
    const tr = (i.custosTransacao / 100) * i.precoCompra;
    const cor = (i.custoCorretagem / 100) * i.precoVenda;
    const ti = i.precoCompra + i.custoReforma + tr + i.outrosCustos;
    const cf = ti * (i.taxaJurosMensal / 100) * i.prazoMeses;
    const tc = ti + cf + cor;
    const ll = i.precoVenda - tc;
    const ml = (ll / i.precoVenda) * 100;
    const roi = (ll / ti) * 100;
    const roiA = ((1 + roi / 100) ** (12 / i.prazoMeses) - 1) * 100;
    const mm = i.precoVenda / ti;
    const pm2c = i.precoCompra / i.areaM2, pm2v = i.precoVenda / i.areaM2;
    const cfs = [-ti, ...Array(i.prazoMeses - 1).fill(0), i.precoVenda - cor];
    let irr = 0;
    for (let r = 0.001; r < 0.5; r += 0.001) { if (cfs.reduce((a, c, t) => a + c / Math.pow(1 + r, t), 0) < 0) { irr = (r - 0.001) * 100 * 12; break; } }
    const vpl = cfs.reduce((a, c, t) => a + c / Math.pow(1 + i.taxaJurosMensal / 100, t), 0);
    const alav = i.usaFinanciamento ? buildLeverage(i, i.precoCompra, tr, i.custoReforma, cor, i.precoVenda, roi) : null;
    const go = i.usaFinanciamento ? (alav.roiEquity >= i.minROIEquity && alav.mlEquity >= i.minMargem && i.prazoMeses <= i.maxPrazo) : (roi >= i.minROI && ml >= i.minMargem && i.prazoMeses <= i.maxPrazo);
    const criterios = critFlipBuild(i, roi, ml, alav, "Margem Líquida");
    return { tr, cor, ti, cf, tc, ll, ml, roi, roiA, mm, pm2c, pm2v, irr, vpl, go, criterios, alav };
  };

  // ── CONSTRUÇÃO ──
  const calcBuild = (i = inp) => {
    const terreno = i.precoTerreno;
    const itbi = (i.custosTransacao / 100) * terreno;
    const custoObra = i.areaConstruir * i.custoM2Construcao;
    const projeto = i.custosProjeto;
    const ti = terreno + itbi + custoObra + projeto + i.outrosCustos;
    const cor = (i.custoCorretagem / 100) * i.precoVenda;
    // Terreno exposto todo o período; obra desembolsada linearmente (exposição média = metade)
    const cfTerreno = (terreno + itbi + projeto + i.outrosCustos) * (i.taxaJurosMensal / 100) * i.prazoMeses;
    const cfObra = custoObra * (i.taxaJurosMensal / 100) * (i.prazoMeses / 2);
    const cf = cfTerreno + cfObra;
    const tc = ti + cf + cor;
    const ll = i.precoVenda - tc;
    const margemVGV = (ll / i.precoVenda) * 100;
    const roi = (ll / ti) * 100;
    const roiA = ((1 + roi / 100) ** (12 / i.prazoMeses) - 1) * 100;
    const mm = i.precoVenda / ti;
    const custoM2Total = tc / i.areaConstruir, vendaM2 = i.precoVenda / i.areaConstruir, custoObraM2 = custoObra / i.areaConstruir;
    const terrenoPct = (terreno / i.precoVenda) * 100, obraPct = (custoObra / i.precoVenda) * 100;
    // Fluxo: investimento inicial + obra mensal, venda no fim
    const obraMes = custoObra / i.prazoMeses;
    const cfs = [-(terreno + itbi + projeto + i.outrosCustos)];
    for (let m = 1; m < i.prazoMeses; m++) cfs.push(-obraMes);
    cfs.push(i.precoVenda - cor - obraMes);
    let irr = 0;
    for (let r = 0.001; r < 0.5; r += 0.001) { if (cfs.reduce((a, c, t) => a + c / Math.pow(1 + r, t), 0) < 0) { irr = (r - 0.001) * 100 * 12; break; } }
    const vpl = cfs.reduce((a, c, t) => a + c / Math.pow(1 + i.taxaJurosMensal / 100, t), 0);
    // Alavancagem: base financiável = terreno + obra; capital próprio = entrada + itbi + projeto + outros
    let alav = null;
    if (i.usaFinanciamento) {
      const base = terreno + custoObra;
      const entradaValor = base * (i.entrada / 100);
      const valorFinanciado = base - entradaValor;
      const tf = i.taxaFinanciamento / 100;
      const parcela = PMT(tf, i.prazoFinanciamento, valorFinanciado);
      const saldoVenda = saldoApos(tf, i.prazoFinanciamento, valorFinanciado, i.prazoMeses);
      const totalParcelas = parcela * i.prazoMeses;
      const jurosPagos = totalParcelas - (valorFinanciado - saldoVenda);
      const capitalProprio = entradaValor + itbi + projeto + i.outrosCustos;
      const lucroAlav = i.precoVenda - cor - saldoVenda - totalParcelas - capitalProprio;
      const roiEquity = (lucroAlav / capitalProprio) * 100;
      const roiEquityA = roiEquity > -100 ? ((1 + roiEquity / 100) ** (12 / i.prazoMeses) - 1) * 100 : -100;
      const mult = roi !== 0 ? roiEquity / roi : 0;
      const ltv = (valorFinanciado / base) * 100;
      const custoTotalDivida = totalParcelas + saldoVenda - valorFinanciado;
      const mlEquity = (lucroAlav / i.precoVenda) * 100;
      alav = { entradaValor, valorFinanciado, parcela, saldoVenda, totalParcelas, jurosPagos, capitalProprio, lucroAlav, roiEquity, roiEquityA, mult, ltv, custoTotalDivida, mlEquity };
    }
    const go = i.usaFinanciamento ? (alav.roiEquity >= i.minROIEquity && alav.mlEquity >= i.minMargem && i.prazoMeses <= i.maxPrazo) : (roi >= i.minROI && margemVGV >= i.minMargem && i.prazoMeses <= i.maxPrazo);
    const criterios = i.usaFinanciamento ? [
      { label: "ROI s/ Capital Próprio", meta: `≥ ${i.minROIEquity}%`, valor: pct(alav?.roiEquity), ok: alav?.roiEquity >= i.minROIEquity },
      { label: "Margem s/ VGV", meta: `≥ ${i.minMargem}%`, valor: pct(alav?.mlEquity), ok: alav?.mlEquity >= i.minMargem },
      { label: "Prazo de Obra Máx.", meta: `≤ ${i.maxPrazo} meses`, valor: `${i.prazoMeses}m`, ok: i.prazoMeses <= i.maxPrazo },
    ] : [
      { label: "ROI Total", meta: `≥ ${i.minROI}%`, valor: pct(roi), ok: roi >= i.minROI },
      { label: "Margem s/ VGV", meta: `≥ ${i.minMargem}%`, valor: pct(margemVGV), ok: margemVGV >= i.minMargem },
      { label: "Prazo de Obra Máx.", meta: `≤ ${i.maxPrazo} meses`, valor: `${i.prazoMeses}m`, ok: i.prazoMeses <= i.maxPrazo },
    ];
    return { terreno, itbi, custoObra, projeto, ti, cf, cfTerreno, cfObra, tc, cor, ll, ml: margemVGV, margemVGV, roi, roiA, mm, custoM2Total, vendaM2, custoObraM2, terrenoPct, obraPct, irr, vpl, go, criterios, alav };
  };

  // ── helper: alavancagem flip ──
  function buildLeverage(i, precoBase, tr, reforma, cor, precoVenda, roi) {
    const entradaValor = precoBase * (i.entrada / 100);
    const valorFinanciado = precoBase - entradaValor;
    const tf = i.taxaFinanciamento / 100;
    const parcela = PMT(tf, i.prazoFinanciamento, valorFinanciado);
    const saldoVenda = saldoApos(tf, i.prazoFinanciamento, valorFinanciado, i.prazoMeses);
    const totalParcelas = parcela * i.prazoMeses;
    const jurosPagos = totalParcelas - (valorFinanciado - saldoVenda);
    const capitalProprio = entradaValor + reforma + tr + i.outrosCustos;
    const lucroAlav = precoVenda - cor - saldoVenda - totalParcelas - capitalProprio;
    const roiEquity = (lucroAlav / capitalProprio) * 100;
    const roiEquityA = roiEquity > -100 ? ((1 + roiEquity / 100) ** (12 / i.prazoMeses) - 1) * 100 : -100;
    const mult = roi !== 0 ? roiEquity / roi : 0;
    const ltv = (valorFinanciado / precoBase) * 100;
    const custoTotalDivida = totalParcelas + saldoVenda - valorFinanciado;
    const mlEquity = (lucroAlav / precoVenda) * 100;
    return { entradaValor, valorFinanciado, parcela, saldoVenda, totalParcelas, jurosPagos, capitalProprio, lucroAlav, roiEquity, roiEquityA, mult, ltv, custoTotalDivida, mlEquity };
  }
  function critFlipBuild(i, roi, ml, alav, mlLabel) {
    return i.usaFinanciamento ? [
      { label: "ROI s/ Capital Próprio", meta: `≥ ${i.minROIEquity}%`, valor: pct(alav?.roiEquity), ok: alav?.roiEquity >= i.minROIEquity },
      { label: mlLabel, meta: `≥ ${i.minMargem}%`, valor: pct(alav?.mlEquity), ok: alav?.mlEquity >= i.minMargem },
      { label: "Prazo Máximo", meta: `≤ ${i.maxPrazo} meses`, valor: `${i.prazoMeses}m`, ok: i.prazoMeses <= i.maxPrazo },
    ] : [
      { label: "ROI Total", meta: `≥ ${i.minROI}%`, valor: pct(roi), ok: roi >= i.minROI },
      { label: mlLabel, meta: `≥ ${i.minMargem}%`, valor: pct(ml), ok: ml >= i.minMargem },
      { label: "Prazo Máximo", meta: `≤ ${i.maxPrazo} meses`, valor: `${i.prazoMeses}m`, ok: i.prazoMeses <= i.maxPrazo },
    ];
  }

  // ── LOCAÇÃO ──
  const calcRent = (i = inp) => {
    const tr = (i.custosTransacao / 100) * i.precoCompra;
    const ti = i.precoCompra + i.custoReforma + tr + i.outrosCustos;
    const ae = i.aluguelMensal * (1 - i.taxaVacancia / 100);
    const rb = ae - i.custosMensais;
    const ccm = ti * (i.taxaJurosMensal / 100);
    const cfm = rb - ccm;
    const capRate = (ae * 12) / ti * 100, yb = (i.aluguelMensal * 12) / ti * 100, yl = (rb * 12) / ti * 100;
    const pb = cfm > 0 ? ti / (cfm * 12) : 999;
    const roiA = (cfm * 12) / ti * 100;
    const pm2 = i.precoCompra / i.areaM2, am2 = i.aluguelMensal / i.areaM2;
    let alav = null;
    if (i.usaFinanciamento) {
      const entradaValor = i.precoCompra * (i.entrada / 100);
      const valorFinanciado = i.precoCompra - entradaValor;
      const tf = i.taxaFinanciamento / 100;
      const parcela = PMT(tf, i.prazoFinanciamento, valorFinanciado);
      const capitalProprio = entradaValor + i.custoReforma + tr + i.outrosCustos;
      const cfmAlav = rb - parcela;
      const roiEquityA = (cfmAlav * 12) / capitalProprio * 100;
      const capRateEquity = (ae * 12) / capitalProprio * 100;
      const pbEquity = cfmAlav > 0 ? capitalProprio / (cfmAlav * 12) : 999;
      const ltv = (valorFinanciado / i.precoCompra) * 100;
      const mult = roiA !== 0 ? roiEquityA / roiA : 0;
      alav = { entradaValor, valorFinanciado, parcela, capitalProprio, cfmAlav, roiEquityA, capRateEquity, pbEquity, ltv, mult };
    }
    const go = i.usaFinanciamento ? (alav.cfmAlav >= i.minCashflow && alav.roiEquityA > 0 && alav.pbEquity <= i.maxPaybackAnos) : (capRate >= i.minCapRate && cfm >= i.minCashflow && pb <= i.maxPaybackAnos);
    const criterios = i.usaFinanciamento ? [
      { label: "Cashflow após Banco", meta: `≥ ${fmt(i.minCashflow)}/mês`, valor: fmt(alav?.cfmAlav), ok: alav?.cfmAlav >= i.minCashflow },
      { label: "ROI s/ Capital Próprio", meta: "> 0%", valor: pct(alav?.roiEquityA), ok: alav?.roiEquityA > 0 },
      { label: "Payback (Cap. Próprio)", meta: `≤ ${i.maxPaybackAnos} anos`, valor: alav?.pbEquity === 999 ? "∞" : `${alav?.pbEquity.toFixed(1)}a`, ok: alav?.pbEquity <= i.maxPaybackAnos },
    ] : [
      { label: "Cap Rate Mínimo", meta: `≥ ${i.minCapRate}%`, valor: pct(capRate), ok: capRate >= i.minCapRate },
      { label: "Cashflow Mensal", meta: `≥ ${fmt(i.minCashflow)}`, valor: fmt(cfm), ok: cfm >= i.minCashflow },
      { label: "Payback Máximo", meta: `≤ ${i.maxPaybackAnos} anos`, valor: pb === 999 ? "∞" : `${pb.toFixed(1)}a`, ok: pb <= i.maxPaybackAnos },
    ];
    return { tr, ti, ae, rb, ccm, cfm, capRate, yb, yl, pb, roiA, roi: roiA, pm2, am2, go, criterios, alav };
  };

  const calc = (i) => mode === "flip" ? calcFlip(i) : mode === "rent" ? calcRent(i) : calcBuild(i);
  const preview = calc();
  const bairroData = MARKET.find(m => m.bairro === inp.bairro);
  const cities = [...new Set(MARKET.map(m => m.cidade))];
  const areaRef = mode === "build" ? inp.areaConstruir : inp.areaM2;

  useEffect(() => { loadHist(); }, []);
  const loadHist = async () => {
    setHistLoading(true);
    try {
      const r = await storage.list("hist:");
      if (r?.keys?.length) {
        const items = await Promise.all(r.keys.map(async k => { try { const x = await storage.get(k); return x ? { ...JSON.parse(x.value), _key: k } : null; } catch { return null; } }));
        setHistory(items.filter(Boolean).sort((a, b) => b.ts - a.ts));
      }
    } catch { }
    setHistLoading(false);
  };
  const saveOp = async (res) => { try { const ts = Date.now(); await storage.set(`hist:${ts}`, JSON.stringify({ ts, mode, inp: { ...inp }, res, bairroData: bairroData || null })); loadHist(); } catch { } };
  const delHist = async (key) => { try { await storage.delete(key); setViewHist(null); loadHist(); } catch { } };
  const runAnalysis = () => { setAnimating(true); setAiText(null); setTimeout(() => { const res = calc(); setVerdict(res); setAnimating(false); saveOp(res); }, 2000); };

  const runAI = async () => {
    if (!verdict) return;
    setAiLoading(true);
    const bd = bairroData, alav = verdict.alav;
    const modeLabel = mode === "flip" ? "Flip (Compra + Reforma + Revenda)" : mode === "rent" ? "Renda (Compra + Reforma + Locação)" : "Construção (Terreno + Obra + Venda)";
    let dados = "";
    if (mode === "build") {
      dados = `• Terreno: ${fmt(inp.precoTerreno)} (${inp.areaTerreno}m²)
• Área a construir: ${inp.areaConstruir} m²
• Custo de obra: ${fmt(inp.custoM2Construcao)}/m² = ${fmt(verdict.custoObra)} total
• Projetos/aprovações: ${fmt(inp.custosProjeto)}
• VGV (preço de venda): ${fmt(inp.precoVenda)} = ${fmt(verdict.vendaM2)}/m²
• Prazo de obra: ${inp.prazoMeses} meses
• Custo all-in/m²: ${fmt(verdict.custoM2Total)}
• Terreno = ${n2(verdict.terrenoPct)}% do VGV | Obra = ${n2(verdict.obraPct)}% do VGV`;
    } else if (mode === "flip") {
      dados = `• Compra: ${fmt(inp.precoCompra)} = ${fmt(inp.precoCompra / inp.areaM2)}/m²\n• Reforma: ${fmt(inp.custoReforma)}\n• Venda: ${fmt(inp.precoVenda)} = ${fmt(inp.precoVenda / inp.areaM2)}/m²\n• Prazo: ${inp.prazoMeses} meses`;
    } else {
      dados = `• Compra: ${fmt(inp.precoCompra)}\n• Reforma: ${fmt(inp.custoReforma)}\n• Aluguel: ${fmt(inp.aluguelMensal)}\n• Vacância: ${inp.taxaVacancia}%`;
    }
    const indic = mode === "rent"
      ? `• Cap Rate: ${pct(verdict.capRate)}\n• Cashflow/mês: ${fmt(verdict.cfm)}\n• Payback: ${verdict.pb?.toFixed(1)} anos`
      : `• ROI Total: ${pct(verdict.roi)}\n• Margem ${mode === "build" ? "s/ VGV" : "Líquida"}: ${pct(verdict.ml)}\n• TIR Anual: ${pct(verdict.irr)}\n• Lucro: ${fmt(verdict.ll)}`;
    const alavTxt = inp.usaFinanciamento && alav ? `\nALAVANCAGEM (capital próprio ${fmt(alav.capitalProprio)}):\n• ROI s/ Capital Próprio: ${pct(alav.roiEquity ?? alav.roiEquityA)}\n• Multiplicador: ${n2(alav.mult)}x\n• Entrada: ${fmt(alav.entradaValor)} | Financiado: ${fmt(alav.valorFinanciado)} | LTV ${n2(alav.ltv)}%\n${alav.parcela ? `• Parcela: ${fmt(alav.parcela)}` : ""}${alav.saldoVenda ? ` | Saldo na venda: ${fmt(alav.saldoVenda)}` : ""}` : "\nEstrutura: 100% capital próprio.";

    const prompt = `Você é um especialista em investimentos imobiliários no Brasil, com foco em incorporação, construção e alavancagem financeira. Analise esta operação de forma objetiva.

TIPO: ${modeLabel}
BAIRRO: ${inp.bairro || "—"}${bd ? ` — ${bd.cidade}, ${bd.tipo}` : ""}

DADOS:
${dados}
• Custo de capital: ${inp.taxaJurosMensal}% a.m.

INDICADORES:
${indic}
${alavTxt}
${bd ? `\nMERCADO (${bd.bairro}): m² R$${bd.precoM2} | val. ${bd.valorizacao}%a.a. | cap rate ${bd.capRate}% | ${bd.destaque}` : ""}
${mode === "build" ? "\nNOTA: Para construção, avalie se o custo all-in/m² é competitivo vs preço de venda/m² do mercado, e o risco de estouro de orçamento e prazo de obra." : ""}

VEREDICTO: ${verdict.go ? "GO ✓" : "NO-GO ✗"}

Responda em 4 seções (títulos em **):
**RISCO**: Baixo/Médio/Alto — 1 frase com números${mode === "build" ? " (considere risco de obra)" : ""}
**PONTOS POSITIVOS**: 3 pontos com dados reais
**PONTOS DE ATENÇÃO**: 3 riscos específicos${mode === "build" ? " (orçamento, prazo, aprovações)" : ""}
**RECOMENDAÇÃO**: 2-3 frases práticas${inp.usaFinanciamento ? ", comente a alavancagem" : ""}

Responda em português, direto, usando os números.`;

    try {
      const r = await fetch("/api/analise", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const d = await r.json();
      setAiText(d.text || "Erro ao gerar análise.");
    } catch { setAiText("Erro de conexão. Tente novamente."); }
    setAiLoading(false);
  };

  const BtnP = ({ children, onClick, color }) => <button onClick={onClick} style={{ width: "100%", padding: "11px", background: color || "#c8a87a", color: color ? "#fff" : "#0d0b09", border: "none", borderRadius: "5px", fontSize: "11px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" }}>{children}</button>;
  const BtnG = ({ children, onClick }) => <button onClick={onClick} style={{ flex: 1, padding: "11px", background: "transparent", color: "#5a5048", border: "1px solid #2a2018", borderRadius: "5px", fontSize: "11px", cursor: "pointer" }}>{children}</button>;

  const steps = mode === "build" ? ["Terreno & Obra", "Venda", "Critérios"] : ["Ativo", mode === "flip" ? "Venda" : "Locação", "Critérios"];
  const modeLabels = { flip: "🏚 Flip", rent: "🏠 Locação", build: "🏗 Construção" };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0a08", color: "#f5efe8" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;font-family:system-ui,sans-serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes verdIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}@keyframes bar{0%{width:0}100%{width:85%}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}@keyframes glow{0%,100%{box-shadow:0 0 6px #c8a87a22}50%{box-shadow:0 0 14px #c8a87a44}}
        .fu{animation:fadeUp .35s ease both}.tab-btn:hover{color:#c8a87a!important}.hr:hover{background:rgba(200,168,122,0.04)!important}`}</style>

      {/* TOP BAR */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 24px", borderBottom: "1px solid #1c1810", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
          <span style={{ fontSize: "18px", fontFamily: "'Cormorant Garamond', serif", fontWeight: "900", letterSpacing: "-0.02em" }}>Imóvel Viável</span>
          <span style={{ fontSize: "8px", letterSpacing: "0.2em", color: "#c8a87a", textTransform: "uppercase" }}>Análise de Investimentos</span>
        </div>
        <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "#141210", border: "1px solid #2a2018", borderRadius: "4px", overflow: "hidden", marginRight: "8px" }}>
            {Object.entries(modeLabels).map(([v, l]) => (
              <button key={v} onClick={() => { setMode(v); setVerdict(null); setAiText(null); setStep(0); }}
                style={{ padding: "6px 10px", border: "none", background: mode === v ? "#c8a87a" : "transparent", color: mode === v ? "#0d0b09" : "#5a5048", fontSize: "10px", fontWeight: "600", cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap" }}>{l}</button>
            ))}
          </div>
          {[["analise", "Análise"], ["mercado", "Mercado"], ["portfolio", "Portfólio"], ["historico", `Histórico (${history.length})`]].map(([t, l]) => (
            <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{ padding: "6px 10px", background: "transparent", border: "none", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", color: tab === t ? "#c8a87a" : "#3a3028", borderBottom: `2px solid ${tab === t ? "#c8a87a" : "transparent"}`, transition: "all .2s", whiteSpace: "nowrap" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ══ ANÁLISE ══ */}
      {tab === "analise" && (
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", minHeight: "calc(100vh - 53px)" }}>
          {/* LEFT */}
          <div style={{ padding: "20px", borderRight: "1px solid #161210", overflowY: "auto" }}>
            <div style={{ display: "flex", gap: "3px", marginBottom: "18px" }}>
              {steps.map((l, i) => <div key={i} onClick={() => setStep(i)} style={{ flex: 1, padding: "6px 0", textAlign: "center", fontSize: "8.5px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", color: step === i ? "#c8a87a" : "#2e2820", borderBottom: `2px solid ${step === i ? "#c8a87a" : "#1a1610"}`, transition: "all .2s" }}>{l}</div>)}
            </div>

            {/* STEP 0 */}
            {step === 0 && (
              <div className="fu">
                {mode === "build" ? (<>
                  <Field label="Preço do Terreno" value={inp.precoTerreno} onChange={s("precoTerreno")} prefix="R$" />
                  <Field label="Área do Terreno" value={inp.areaTerreno} onChange={s("areaTerreno")} suffix="m²" />
                  <Field label="Área a Construir" value={inp.areaConstruir} onChange={s("areaConstruir")} suffix="m²" hint="Área construída total do projeto" />
                  <Field label="Custo de Construção" value={inp.custoM2Construcao} onChange={s("custoM2Construcao")} prefix="R$" suffix="/m²" hint={`Base CUB. Total da obra: ${fmt(inp.areaConstruir * inp.custoM2Construcao)}`} />
                  <Field label="Projetos e Aprovações" value={inp.custosProjeto} onChange={s("custosProjeto")} prefix="R$" hint="Arquitetura, engenharia, ART, alvará, prefeitura" />
                  <Field label="ITBI + Cartório (Terreno)" value={inp.custosTransacao} onChange={s("custosTransacao")} suffix="% terreno" />
                  <Field label="Outros Custos" value={inp.outrosCustos} onChange={s("outrosCustos")} prefix="R$" />
                </>) : (<>
                  <Field label="Preço de Compra" value={inp.precoCompra} onChange={s("precoCompra")} prefix="R$" />
                  <Field label="Área Total" value={inp.areaM2} onChange={s("areaM2")} suffix="m²" />
                  <Field label="Custo de Reforma" value={inp.custoReforma} onChange={s("custoReforma")} prefix="R$" hint="Mão de obra + materiais + projetos" />
                  <Field label="Custos de Transação (ITBI + Cartório)" value={inp.custosTransacao} onChange={s("custosTransacao")} suffix="% compra" />
                  <Field label="Outros Custos (Cond., IPTU...)" value={inp.outrosCustos} onChange={s("outrosCustos")} prefix="R$" />
                </>)}
                <Sel label="Bairro / Referência de Mercado" value={inp.bairro} onChange={s("bairro")} grouped options={MARKET.map(m => ({ v: m.bairro, l: `${m.bairro}${m.prioridade ? "" : ` — ${m.cidade}`}`, cidade: m.cidade }))} />
                {bairroData && (
                  <div style={{ padding: "9px 11px", background: "#141210", border: "1px solid #2a2018", borderRadius: "5px", fontSize: "11px", color: "#7a6e64", lineHeight: "1.9" }}>
                    {bairroData.prioridade && <div style={{ fontSize: "8px", color: "#c8a87a", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "3px" }}>📍 Dado real 2025</div>}
                    <b style={{ color: "#c8a87a" }}>{bairroData.bairro}</b> · {bairroData.tipo}<br />
                    Venda: <b style={{ color: "#d0c0a0" }}>R$ {bairroData.precoM2.toLocaleString("pt-BR")}/m²</b>
                    {mode === "build" && inp.areaConstruir > 0 && <><br />VGV de mercado (área × m²): <b style={{ color: "#6ec898" }}>{fmt(bairroData.precoM2 * inp.areaConstruir)}</b></>}
                  </div>
                )}
                <div style={{ marginTop: "12px" }}><BtnP onClick={() => setStep(1)}>Próximo →</BtnP></div>
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="fu">
                {mode === "rent" ? (<>
                  <Field label="Aluguel Mensal Esperado" value={inp.aluguelMensal} onChange={s("aluguelMensal")} prefix="R$" />
                  <Field label="Taxa de Vacância" value={inp.taxaVacancia} onChange={s("taxaVacancia")} suffix="%" />
                  <Field label="Custos Mensais (Cond.+IPTU+Manut.)" value={inp.custosMensais} onChange={s("custosMensais")} prefix="R$" />
                  <Field label="Prazo de Reforma até Locação" value={inp.prazoReforma} onChange={s("prazoReforma")} suffix="meses" />
                  <Field label="Custo do Capital" value={inp.taxaJurosMensal} onChange={s("taxaJurosMensal")} suffix="% a.m." />
                </>) : (<>
                  <Field label={mode === "build" ? "Preço de Venda (VGV)" : "Preço de Venda Esperado"} value={inp.precoVenda} onChange={s("precoVenda")} prefix="R$" hint={mode === "build" ? "Valor Geral de Vendas do projeto pronto" : undefined} />
                  <Field label={mode === "build" ? "Prazo de Construção" : "Prazo Total (Reforma + Venda)"} value={inp.prazoMeses} onChange={s("prazoMeses")} suffix="meses" />
                  <Field label="Custo do Capital / Oportunidade" value={inp.taxaJurosMensal} onChange={s("taxaJurosMensal")} suffix="% a.m." />
                  <Field label="Comissão de Corretagem" value={inp.custoCorretagem} onChange={s("custoCorretagem")} suffix="% venda" />
                </>)}

                {/* ALAVANCAGEM */}
                <div style={{ margin: "16px 0 4px" }}>
                  <button onClick={tog("usaFinanciamento")} style={{ width: "100%", padding: "10px 14px", background: inp.usaFinanciamento ? "rgba(200,168,122,0.1)" : "#141210", border: `1px solid ${inp.usaFinanciamento ? "#c8a87a55" : "#2e2418"}`, borderRadius: "6px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .25s" }}>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "11px", fontWeight: "600", color: inp.usaFinanciamento ? "#c8a87a" : "#7a6e64" }}>⚡ Usar Alavancagem (Financiamento)</div>
                      <div style={{ fontSize: "10px", color: "#4a4038", marginTop: "1px" }}>{mode === "build" ? "Financiamento à produção / terreno" : "ROI sobre capital próprio"}</div>
                    </div>
                    <div style={{ width: "36px", height: "20px", background: inp.usaFinanciamento ? "#c8a87a" : "#2a2018", borderRadius: "10px", position: "relative", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: "3px", left: inp.usaFinanciamento ? "18px" : "3px", width: "14px", height: "14px", background: "#fff", borderRadius: "50%", transition: "left .25s" }} />
                    </div>
                  </button>
                </div>
                {inp.usaFinanciamento && (
                  <div className="fu" style={{ background: "#111009", border: "1px solid #c8a87a22", borderRadius: "6px", padding: "14px", marginTop: "6px" }}>
                    <div style={{ fontSize: "9px", letterSpacing: "0.15em", color: "#c8a87a", textTransform: "uppercase", marginBottom: "12px" }}>{mode === "build" ? "Financiamento da Produção" : "Estrutura de Financiamento"}</div>
                    <Field label={mode === "build" ? "Entrada (% terreno + obra)" : "Entrada (Capital Próprio)"} value={inp.entrada} onChange={s("entrada")} suffix="%" />
                    <Field label="Taxa do Financiamento" value={inp.taxaFinanciamento} onChange={s("taxaFinanciamento")} suffix="% a.m." hint={`= ${((Math.pow(1 + inp.taxaFinanciamento / 100, 12) - 1) * 100).toFixed(2)}% ao ano`} />
                    <Field label="Prazo do Financiamento" value={inp.prazoFinanciamento} onChange={s("prazoFinanciamento")} suffix="meses" />
                    {(() => {
                      const base = mode === "build" ? (inp.precoTerreno + inp.areaConstruir * inp.custoM2Construcao) : inp.precoCompra;
                      const vf = base * (1 - inp.entrada / 100);
                      const parc = PMT(inp.taxaFinanciamento / 100, inp.prazoFinanciamento, vf);
                      const cp = preview.alav?.capitalProprio || 0;
                      return <div style={{ padding: "9px 11px", background: "#0d0b09", borderRadius: "5px", fontSize: "11px", color: "#8a7a6a", lineHeight: "2" }}>
                        Base financiável: <b style={{ color: "#d0c0a0" }}>{fmt(base)}</b><br />
                        Parcela mensal: <b style={{ color: "#c8a87a" }}>{fmt(parc)}</b><br />
                        Capital próprio: <b style={{ color: "#6ec898" }}>{fmt(cp)}</b> · LTV: <b style={{ color: "#d0c0a0" }}>{((vf / base) * 100).toFixed(0)}%</b>
                      </div>;
                    })()}
                  </div>
                )}
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <BtnG onClick={() => setStep(0)}>← Voltar</BtnG>
                  <div style={{ flex: 2 }}><BtnP onClick={() => setStep(2)}>Próximo →</BtnP></div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="fu">
                <div style={{ marginBottom: "10px", padding: "8px 11px", background: "#141210", border: "1px solid #2a2018", borderRadius: "5px", fontSize: "10px", color: "#4a4038", lineHeight: "1.7" }}>
                  GO somente se <b style={{ color: "#b0a080" }}>todos</b> os critérios forem atendidos.
                  {inp.usaFinanciamento && <><br /><span style={{ color: "#c8a87a88" }}>⚡ Critérios sobre capital próprio.</span></>}
                </div>
                {mode === "rent" ? (<>
                  {inp.usaFinanciamento ? <Field label="Cashflow Mín. após Banco" value={inp.minCashflow} onChange={s("minCashflow")} prefix="R$" /> : <><Field label="Cap Rate Mínimo" value={inp.minCapRate} onChange={s("minCapRate")} suffix="% a.a." /><Field label="Cashflow Mensal Mínimo" value={inp.minCashflow} onChange={s("minCashflow")} prefix="R$" /></>}
                  <Field label="Payback Máximo" value={inp.maxPaybackAnos} onChange={s("maxPaybackAnos")} suffix="anos" />
                </>) : (<>
                  {inp.usaFinanciamento ? <Field label="ROI s/ Capital Próprio Mín." value={inp.minROIEquity} onChange={s("minROIEquity")} suffix="%" /> : <Field label="ROI Mínimo" value={inp.minROI} onChange={s("minROI")} suffix="%" />}
                  <Field label={mode === "build" ? "Margem s/ VGV Mínima" : "Margem Líquida Mínima"} value={inp.minMargem} onChange={s("minMargem")} suffix="%" />
                  <Field label={mode === "build" ? "Prazo de Obra Máximo" : "Prazo Máximo"} value={inp.maxPrazo} onChange={s("maxPrazo")} suffix="meses" />
                </>)}
                <div style={{ padding: "9px 11px", background: preview.go ? "#0c1c12" : "#1c0c0c", border: `1px solid ${preview.go ? "#2a5a3a" : "#3a1a1a"}`, borderRadius: "5px", fontSize: "11px", color: preview.go ? "#6ec898" : "#e07070", textAlign: "center" }}>
                  Preview: {preview.go ? "✓ GO" : "✗ NO-GO"}
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <BtnG onClick={() => setStep(1)}>← Voltar</BtnG>
                  <div style={{ flex: 2 }}><BtnP onClick={runAnalysis} color={preview.go ? "#2a6a4a" : "#6a2a2a"}>⚡ Analisar</BtnP></div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div style={{ padding: "22px 26px", background: "#0d0b09", overflowY: "auto" }}>
            {animating && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", border: "2px solid #1c1810", borderTop: "2px solid #c8a87a", borderRadius: "50%", animation: "spin .9s linear infinite" }} />
              <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#c8a87a", textTransform: "uppercase", animation: "pulse 1s ease infinite" }}>Processando</div>
              <div style={{ width: "140px", height: "1px", background: "#1a1610", overflow: "hidden" }}><div style={{ height: "100%", background: "#c8a87a", animation: "bar 2s ease forwards" }} /></div>
            </div>}

            {!animating && !verdict && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: .2 }}>
              <div style={{ fontSize: "40px" }}>{mode === "build" ? "🏗" : mode === "rent" ? "🏠" : "🏚"}</div>
              <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "#8a7a6a", textTransform: "uppercase", marginTop: "8px" }}>Preencha e analise</div>
            </div>}

            {!animating && verdict && (
              <div style={{ animation: "verdIn .45s ease" }}>
                <div style={{ marginBottom: "18px", padding: "18px 20px", borderRadius: "8px", background: verdict.go ? "linear-gradient(135deg,#0c1e14,#060e08)" : "linear-gradient(135deg,#1c0c0c,#0e0606)", border: `1px solid ${verdict.go ? "#2a6a4a" : "#6a2a2a"}` }}>
                  <div style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: verdict.go ? "#6ec898" : "#e07070", marginBottom: "4px" }}>Veredicto · {modeLabels[mode].replace(/[🏚🏠🏗] /, "")}{inp.usaFinanciamento && " · Alavancado"}</div>
                  <div style={{ fontSize: "34px", fontFamily: "'Cormorant Garamond', serif", fontWeight: "900", color: verdict.go ? "#6ec898" : "#e07070" }}>{verdict.go ? "✓ GO" : "✗ NO-GO"}</div>
                  {inp.usaFinanciamento && verdict.alav && <div style={{ marginTop: "6px", fontSize: "11px", color: "#8a7a6a" }}>Capital Próprio: <b style={{ color: "#c8a87a" }}>{fmt(verdict.alav.capitalProprio)}</b>{mode !== "rent" && <> · ROI equity: <b style={{ color: verdict.alav.roiEquity > 0 ? "#6ec898" : "#e07070" }}>{pct(verdict.alav.roiEquity)}</b></>}</div>}
                </div>

                {/* Checklist */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "8px", letterSpacing: "0.13em", textTransform: "uppercase", color: "#3a3028", marginBottom: "6px" }}>Checklist</div>
                  {verdict.criterios.map((c, i) => <div key={i} className="hr" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: "4px", marginBottom: "3px", background: "#0f0d0b", border: "1px solid #181410" }}>
                    <div><div style={{ fontSize: "11px", color: "#b0a8a0" }}>{c.label}</div><div style={{ fontSize: "9px", color: "#3a3028", fontFamily: "monospace" }}>meta: {c.meta}</div></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}><span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: "600", color: c.ok ? "#6ec898" : "#e07070" }}>{c.valor}</span><span>{c.ok ? "✓" : "✗"}</span></div>
                  </div>)}
                </div>

                {/* Construction summary */}
                {mode === "build" && (
                  <div style={{ marginBottom: "16px", padding: "14px", background: "#0f0d0b", border: "1px solid #1c1810", borderRadius: "7px" }}>
                    <div style={{ fontSize: "8px", letterSpacing: "0.13em", textTransform: "uppercase", color: "#3a3028", marginBottom: "10px" }}>Síntese da Incorporação</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "10px" }}>
                      <M label="VGV (Venda)" value={fmt(inp.precoVenda)} gold sm />
                      <M label="Custo All-in/m²" value={fmt(verdict.custoM2Total)} sm />
                      <M label="Venda/m²" value={fmt(verdict.vendaM2)} sm />
                      <M label="Terreno % VGV" value={pct(verdict.terrenoPct)} sm />
                      <M label="Obra % VGV" value={pct(verdict.obraPct)} sm />
                      <M label="Custo Obra/m²" value={fmt(verdict.custoObraM2)} sm />
                    </div>
                    <div style={{ height: "10px", display: "flex", borderRadius: "5px", overflow: "hidden" }}>
                      <div style={{ width: `${verdict.terrenoPct}%`, background: "#8a6a4a" }} title="Terreno" />
                      <div style={{ width: `${verdict.obraPct}%`, background: "#c8a87a" }} title="Obra" />
                      <div style={{ flex: 1, background: verdict.margemVGV > 0 ? "#2a6a4a" : "#6a2a2a" }} title="Margem + custos" />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8px", marginTop: "3px", color: "#5a5048" }}>
                      <span>🟫 Terreno {n2(verdict.terrenoPct)}%</span><span>🟧 Obra {n2(verdict.obraPct)}%</span><span style={{ color: verdict.margemVGV > 0 ? "#6ec898" : "#e07070" }}>Margem {n2(verdict.margemVGV)}%</span>
                    </div>
                  </div>
                )}

                {/* Leverage panel */}
                {inp.usaFinanciamento && verdict.alav && (
                  <div style={{ marginBottom: "16px", padding: "16px", background: "#0f0e0a", border: "1px solid #c8a87a22", borderRadius: "8px", animation: "glow 3s ease infinite" }}>
                    <div style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c8a87a", marginBottom: "12px" }}>⚡ Alavancagem — Capital Próprio</div>
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                        <div style={{ width: `${inp.entrada}%`, background: "#c8a87a" }} /><div style={{ flex: 1, background: "#2a4060" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", marginTop: "3px" }}>
                        <span style={{ color: "#c8a87a" }}>Seu capital: {fmt(verdict.alav.capitalProprio)}</span>
                        <span style={{ color: "#406080" }}>Banco: {fmt(verdict.alav.valorFinanciado)}</span>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
                      {mode === "rent" ? (<>
                        <M label="ROI Anual (sem alav.)" value={pct(verdict.roiA)} pos={verdict.roiA > 0} badge="sem" sm />
                        <M label="ROI Capital Próprio" value={pct(verdict.alav.roiEquityA)} pos={verdict.alav.roiEquityA > 0} neg={verdict.alav.roiEquityA < 0} gold badge="alav" sm />
                        <M label="Multiplicador" value={`${n2(verdict.alav.mult)}x`} pos={verdict.alav.mult > 1} gold sm />
                        <M label="Cashflow após Banco" value={fmt(verdict.alav.cfmAlav)} pos={verdict.alav.cfmAlav > 0} neg={verdict.alav.cfmAlav < 0} gold sm />
                        <M label="Parcela Mensal" value={fmt(verdict.alav.parcela)} neg sm />
                        <M label="Payback Cap. Próprio" value={verdict.alav.pbEquity === 999 ? "∞" : `${verdict.alav.pbEquity.toFixed(1)}a`} sm />
                      </>) : (<>
                        <M label="ROI Total (sem alav.)" value={pct(verdict.roi)} pos={verdict.roi > 0} badge="sem" sm />
                        <M label="ROI Capital Próprio" value={pct(verdict.alav.roiEquity)} pos={verdict.alav.roiEquity > 0} neg={verdict.alav.roiEquity < 0} gold badge="alav" sm />
                        <M label="Multiplicador Alavancagem" value={`${n2(verdict.alav.mult)}x`} pos={verdict.alav.mult > 1} gold sm />
                        <M label="ROI Equity Anualizado" value={pct(verdict.alav.roiEquityA)} pos={verdict.alav.roiEquityA > 0} gold sm />
                        <M label="Lucro s/ Cap. Próprio" value={fmt(verdict.alav.lucroAlav)} pos={verdict.alav.lucroAlav > 0} neg={verdict.alav.lucroAlav < 0} sm />
                        <M label="LTV" value={pct(verdict.alav.ltv)} sm />
                        <M label="Parcela Mensal" value={fmt(verdict.alav.parcela)} sm />
                        <M label="Custo Total da Dívida" value={fmt(verdict.alav.custoTotalDivida)} neg sm />
                      </>)}
                    </div>
                    {mode !== "rent" && <div style={{ marginTop: "10px", padding: "9px 11px", background: "#0d0b09", borderRadius: "5px", fontSize: "11px", color: "#6a5e52", lineHeight: "2" }}>
                      Parcelas pagas: <b style={{ color: "#d0c0a0" }}>{fmt(verdict.alav.totalParcelas)}</b> · Saldo na venda: <b style={{ color: "#d0c0a0" }}>{fmt(verdict.alav.saldoVenda)}</b> · Juros: <b style={{ color: "#e07070" }}>{fmt(verdict.alav.jurosPagos)}</b>
                    </div>}
                  </div>
                )}

                {/* Standard metrics */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "8px", letterSpacing: "0.13em", textTransform: "uppercase", color: "#3a3028", marginBottom: "8px" }}>Indicadores</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                    {mode === "rent" ? [
                      ["Cap Rate", pct(verdict.capRate), verdict.capRate > 0, false, !inp.usaFinanciamento],
                      ["Yield Bruto", pct(verdict.yb), verdict.yb > 0, false, false],
                      ["Yield Líquido", pct(verdict.yl), verdict.yl > 0, verdict.yl < 0, false],
                      ["Cashflow/mês", fmt(verdict.cfm), verdict.cfm > 0, verdict.cfm < 0, false],
                      ["ROI Anual", pct(verdict.roiA), verdict.roiA > 0, false, false],
                      ["Payback", verdict.pb === 999 ? "∞" : `${verdict.pb?.toFixed(1)}a`, verdict.pb < 20, false, false],
                    ] : [
                      ["ROI Total", pct(verdict.roi), verdict.roi > 0, verdict.roi < 0, !inp.usaFinanciamento],
                      [mode === "build" ? "Margem s/ VGV" : "Margem Líquida", pct(verdict.ml), verdict.ml > 0, verdict.ml < 0, false],
                      ["ROI Anualizado", pct(verdict.roiA), verdict.roiA > 0, false, false],
                      ["TIR Anual (aprox.)", pct(verdict.irr), verdict.irr > 0, false, false],
                      ["VPL", fmt(verdict.vpl), verdict.vpl > 0, verdict.vpl < 0, false],
                      ["Lucro (sem alav.)", fmt(verdict.ll), verdict.ll > 0, verdict.ll < 0, false],
                    ].map(([l, v, pos, neg, gold], idx) => <M key={idx} label={l} value={v} pos={pos} neg={neg} gold={gold} sm />)}
                  </div>
                </div>

                {/* Cost breakdown */}
                <div style={{ padding: "13px 15px", background: "#0f0d0b", border: "1px solid #1c1810", borderRadius: "6px", marginBottom: "14px" }}>
                  <div style={{ fontSize: "8px", letterSpacing: "0.13em", textTransform: "uppercase", color: "#3a3028", marginBottom: "10px" }}>Composição de Custos</div>
                  {(mode === "build" ? [
                    ["Terreno", verdict.terreno], ["ITBI + Cartório", verdict.itbi], ["Construção (obra)", verdict.custoObra],
                    ["Projetos e Aprovações", verdict.projeto], ["Outros Custos", inp.outrosCustos],
                    ["Custo Financeiro", verdict.cf], ["Corretagem na Venda", verdict.cor],
                  ] : mode === "flip" ? [
                    ["Preço de Compra", inp.precoCompra], ["Custo de Reforma", inp.custoReforma], ["Transação", verdict.tr],
                    ["Outros Custos", inp.outrosCustos], ["Custo Financeiro", verdict.cf], ["Corretagem", verdict.cor],
                  ] : [
                    ["Preço de Compra", inp.precoCompra], ["Custo de Reforma", inp.custoReforma], ["Transação", verdict.tr], ["Outros Custos", inp.outrosCustos],
                  ]).map(([l, v], i, arr) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < arr.length - 1 ? "1px solid #141210" : "none" }}><span style={{ fontSize: "11px", color: "#5a5048" }}>{l}</span><span style={{ fontFamily: "monospace", fontSize: "11px", color: "#b0a898" }}>{fmt(v)}</span></div>)}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0 0", borderTop: "1px solid #2a2018", marginTop: "4px" }}><span style={{ fontSize: "11px", fontWeight: "700", color: "#c8a87a" }}>{mode === "build" ? "Custo Total do Projeto" : "Total Investido"}</span><span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: "700", color: "#c8a87a" }}>{fmt(verdict.tc)}</span></div>
                </div>

                {/* AI */}
                <div style={{ padding: "13px 15px", background: "#0d0b09", border: "1px solid #282018", borderRadius: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ fontSize: "8px", letterSpacing: "0.13em", textTransform: "uppercase", color: "#3a3028" }}>✦ Análise de IA</div>
                    {!aiText && !aiLoading && <button onClick={runAI} style={{ padding: "4px 10px", background: "#c8a87a", color: "#0d0b09", border: "none", borderRadius: "3px", fontSize: "10px", fontWeight: "700", cursor: "pointer" }}>Gerar</button>}
                    {aiText && <button onClick={runAI} style={{ padding: "4px 8px", background: "transparent", color: "#4a4038", border: "1px solid #2a2018", borderRadius: "3px", fontSize: "9px", cursor: "pointer" }}>↻ Refazer</button>}
                  </div>
                  {aiLoading && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "12px", height: "12px", border: "1px solid #2a2018", borderTop: "1px solid #c8a87a", borderRadius: "50%", animation: "spin .8s linear infinite", flexShrink: 0 }} /><span style={{ fontSize: "10px", color: "#4a4038", animation: "pulse 1.2s ease infinite" }}>Gerando…</span></div>}
                  {aiText && !aiLoading && <div>{renderAI(aiText)}</div>}
                  {!aiText && !aiLoading && <div style={{ fontSize: "10px", color: "#2a2018", lineHeight: "1.6" }}>Análise qualitativa com contexto de mercado{mode === "build" ? ", risco de obra" : ""}{inp.usaFinanciamento ? " e alavancagem" : ""}.</div>}
                </div>

                <button onClick={() => { setVerdict(null); setAiText(null); setStep(0); }} style={{ marginTop: "12px", width: "100%", padding: "8px", background: "transparent", color: "#2e2820", border: "1px solid #181410", borderRadius: "4px", fontSize: "9px", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" }}>← Nova Análise</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ MERCADO ══ */}
      {tab === "mercado" && (
        <div style={{ padding: "24px 32px", animation: "fadeUp .35s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
            <div><h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: "900", margin: "0 0 3px" }}>Benchmarks de Mercado</h2><p style={{ color: "#3a3028", fontSize: "11px", margin: 0 }}>Dados reais 2025 — FipeZAP, CRECISP, Apto.vc, KoreImob.</p></div>
            <div style={{ display: "flex", gap: "4px" }}>
              {cities.map(c => <button key={c} onClick={() => setMktCity(mktCity === c ? "" : c)} style={{ padding: "5px 10px", background: mktCity === c ? "#c8a87a" : "#141210", color: mktCity === c ? "#0d0b09" : "#4a4038", border: "1px solid #2a2018", borderRadius: "4px", fontSize: "10px", cursor: "pointer", fontWeight: mktCity === c ? "700" : "400" }}>{c === "Ribeirão Preto" ? "📍 " : ""}{c}</button>)}
              {mktCity && <button onClick={() => setMktCity("")} style={{ padding: "5px 9px", background: "transparent", color: "#2a2018", border: "1px solid #1c1810", borderRadius: "4px", fontSize: "10px", cursor: "pointer" }}>Todos</button>}
            </div>
          </div>
          {(mktCity === "Ribeirão Preto" || !mktCity) && <div style={{ padding: "10px 14px", background: "#121008", border: "1px solid #c8a87a1a", borderRadius: "6px", marginBottom: "14px", fontSize: "11px", color: "#7a6e64", lineHeight: "1.9" }}><b style={{ color: "#c8a87a" }}>📍 Ribeirão Preto 2025</b> · Preço médio: <b style={{ color: "#d0c0a0" }}>R$ 5.131–7.252/m²</b> (FipeZAP/CRECISP) · +0,17%/mês · VGV 2023: R$2,2bi (+16%).</div>}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead><tr style={{ borderBottom: "1px solid #1c1810" }}>{["Bairro", "Cidade", "Perfil", "Preço/m²", "Aluguel/m²", "Yield", "Val. Anual", "Cap Rate"].map((h, i) => <th key={i} style={{ padding: "8px 11px", textAlign: "left", fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#3a3028", fontWeight: "600" }}>{h}</th>)}</tr></thead>
              <tbody>
                {(mktCity ? MARKET.filter(m => m.cidade === mktCity) : MARKET).map((m, i) => {
                  const yb = (m.aluguelM2 * 12) / m.precoM2 * 100; const isSel = m.bairro === inp.bairro;
                  return <tr key={i} className="hr" onClick={() => { setInp(p => ({ ...p, bairro: m.bairro })); setTab("analise"); }} style={{ borderBottom: "1px solid #121010", cursor: "pointer", background: isSel ? "rgba(200,168,122,0.05)" : "transparent" }}>
                    <td style={{ padding: "8px 11px", fontWeight: isSel ? "700" : m.prioridade ? "500" : "400", color: isSel ? "#c8a87a" : m.prioridade ? "#d0c8bc" : "#6a6058" }}>{m.bairro}{isSel ? " ✓" : ""}</td>
                    <td style={{ padding: "8px 11px", color: "#4a4038", fontSize: "10px" }}>{m.cidade}</td>
                    <td style={{ padding: "8px 11px" }}><span style={{ padding: "2px 6px", borderRadius: "3px", fontSize: "8px", background: m.tipo === "Alto Padrão" ? "#c8a87a1a" : m.tipo === "Médio-Alto" ? "#6a8a7a1a" : "#5a5a7a1a", color: m.tipo === "Alto Padrão" ? "#c8a87a" : m.tipo === "Médio-Alto" ? "#7ec8a0" : "#8888b8" }}>{m.tipo}</span></td>
                    <td style={{ padding: "8px 11px", fontFamily: "monospace", color: "#e0d8d0" }}>R$ {m.precoM2.toLocaleString("pt-BR")}</td>
                    <td style={{ padding: "8px 11px", fontFamily: "monospace", color: "#c0b8b0" }}>R$ {m.aluguelM2}/m²</td>
                    <td style={{ padding: "8px 11px", fontFamily: "monospace", color: yb >= 5.5 ? "#6ec898" : yb >= 4.5 ? "#c8a87a" : "#e07070" }}>{yb.toFixed(1)}%</td>
                    <td style={{ padding: "8px 11px", fontFamily: "monospace", color: "#a8a098" }}>{m.valorizacao}%</td>
                    <td style={{ padding: "8px 11px", fontFamily: "monospace", color: "#a8a098" }}>{m.capRate}%</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: "12px", fontSize: "10px", color: "#252018" }}>Clique num bairro para usar como referência. No modo Construção, o preço/m² serve de base para estimar o VGV.</p>
        </div>
      )}

      {/* ══ PORTFÓLIO ══ */}
      {tab === "portfolio" && (() => {
        const ops = history;
        const total = ops.length;
        const gos = ops.filter(o => o.res?.go).length;
        const goRate = total ? (gos / total) * 100 : 0;
        const capInvest = (o) => o.mode === "build" ? (o.res?.tc || 0) : (o.res?.ti || 0);
        const totalCapital = ops.reduce((a, o) => a + capInvest(o), 0);
        const capProprio = ops.reduce((a, o) => a + (o.inp?.usaFinanciamento ? (o.res?.alav?.capitalProprio || 0) : capInvest(o)), 0);
        const byMode = (m) => ops.filter(o => o.mode === m);
        const avg = (arr, f) => arr.length ? arr.reduce((a, o) => a + (f(o) || 0), 0) / arr.length : 0;
        const flips = byMode("flip"), rents = byMode("rent"), builds = byMode("build");
        const lucroPotencial = ops.filter(o => o.res?.go).reduce((a, o) => {
          if (o.mode === "rent") return a + (o.inp?.usaFinanciamento ? (o.res?.alav?.cfmAlav || 0) * 12 : (o.res?.cfm || 0) * 12);
          return a + (o.inp?.usaFinanciamento ? (o.res?.alav?.lucroAlav || 0) : (o.res?.ll || 0));
        }, 0);
        const Card = ({ label, value, sub, color }) => (
          <div style={{ padding: "18px 20px", background: "#0f0d0b", border: "1px solid #1e1a14", borderRadius: "8px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.13em", textTransform: "uppercase", color: "#5a5048", marginBottom: "6px" }}>{label}</div>
            <div style={{ fontSize: "24px", fontWeight: "700", fontFamily: "monospace", color: color || "#f0e8e0" }}>{value}</div>
            {sub && <div style={{ fontSize: "10px", color: "#3a3028", marginTop: "3px" }}>{sub}</div>}
          </div>
        );
        return (
          <div style={{ padding: "24px 32px", animation: "fadeUp .35s ease" }}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: "900", margin: "0 0 3px" }}>Portfólio — Visão Consolidada</h2>
              <p style={{ color: "#3a3028", fontSize: "11px", margin: 0 }}>Resumo de todas as operações analisadas e salvas.</p>
            </div>
            {total === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 0", opacity: .2 }}>
                <div style={{ fontSize: "40px" }}>📊</div>
                <div style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#5a5048", marginTop: "8px" }}>Analise operações para ver o portfólio</div>
              </div>
            ) : (<>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "16px" }}>
                <Card label="Operações Analisadas" value={total} sub={`${gos} aprovadas (GO)`} />
                <Card label="Taxa de Aprovação" value={pct(goRate)} color={goRate >= 50 ? "#6ec898" : "#c8a87a"} sub="operações GO / total" />
                <Card label="Capital Total Analisado" value={fmt(totalCapital)} color="#c8a87a" sub="soma dos custos de projeto" />
                <Card label="Capital Próprio Alocado" value={fmt(capProprio)} sub="considerando alavancagem" />
                <Card label="Resultado Potencial (GOs)" value={fmt(lucroPotencial)} color={lucroPotencial > 0 ? "#6ec898" : "#e07070"} sub="lucro (flip/obra) + renda anual" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                {[["🏚 Flip", flips, "ROI médio", (o) => o.res?.roi], ["🏠 Locação", rents, "Cap Rate médio", (o) => o.res?.capRate], ["🏗 Construção", builds, "ROI médio", (o) => o.res?.roi]].map(([label, arr, metricLabel, f]) => (
                  <div key={label} style={{ padding: "16px", background: "#0f0d0b", border: "1px solid #1e1a14", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: "#c8a87a", marginBottom: "10px", fontWeight: "600" }}>{label}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #141210" }}>
                      <span style={{ fontSize: "10px", color: "#4a4038" }}>Operações</span>
                      <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#c0b8b0" }}>{arr.length}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #141210" }}>
                      <span style={{ fontSize: "10px", color: "#4a4038" }}>Aprovadas</span>
                      <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#6ec898" }}>{arr.filter(o => o.res?.go).length}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                      <span style={{ fontSize: "10px", color: "#4a4038" }}>{metricLabel}</span>
                      <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#c8a87a" }}>{arr.length ? pct(avg(arr, f)) : "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "16px", background: "#0f0d0b", border: "1px solid #1e1a14", borderRadius: "8px" }}>
                <div style={{ fontSize: "9px", letterSpacing: "0.13em", textTransform: "uppercase", color: "#3a3028", marginBottom: "12px" }}>Operações por Bairro</div>
                {Object.entries(ops.reduce((acc, o) => { const b = o.inp?.bairro || "—"; acc[b] = (acc[b] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).map(([b, c]) => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }}>
                    <span style={{ fontSize: "11px", color: "#c0b8b0", width: "140px" }}>{b}</span>
                    <div style={{ flex: 1, height: "8px", background: "#141210", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${(c / total) * 100}%`, height: "100%", background: "#c8a87a" }} />
                    </div>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#8a7a6a", width: "24px", textAlign: "right" }}>{c}</span>
                  </div>
                ))}
              </div>
            </>)}
          </div>
        );
      })()}

      {/* ══ HISTÓRICO ══ */}
      {tab === "historico" && (
        <div style={{ padding: "24px 32px", animation: "fadeUp .35s ease" }}>
          <div style={{ marginBottom: "18px" }}><h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: "900", margin: "0 0 3px" }}>Histórico de Operações</h2><p style={{ color: "#3a3028", fontSize: "11px", margin: 0 }}>{history.length} operação(ões) salva(s).</p></div>
          {histLoading && <div style={{ color: "#2a2820", fontSize: "11px" }}>Carregando…</div>}
          {!histLoading && history.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", opacity: .2 }}><div style={{ fontSize: "36px" }}>📋</div><div style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#5a5048", marginTop: "8px" }}>Nenhuma operação</div></div>}
          {!histLoading && !viewHist && history.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "9px" }}>
              {history.map((h, i) => {
                const alav = h.res?.alav; const ml = { flip: "🏚 Flip", rent: "🏠 Locação", build: "🏗 Construção" }[h.mode] || h.mode;
                return <div key={i} onClick={() => setViewHist(h)} className="hr" style={{ padding: "14px", background: "#0f0d0b", border: `1px solid ${h.res?.go ? "#1a3e26" : "#2e1818"}`, borderRadius: "6px", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "9px" }}>
                    <div><div style={{ fontSize: "10px", color: "#3a3028" }}>{ml}{h.inp?.usaFinanciamento ? " ⚡" : ""}{h.inp?.bairro && <span style={{ color: "#c8a87a66" }}> · {h.inp.bairro}</span>}</div><div style={{ fontSize: "9px", color: "#252018" }}>{new Date(h.ts).toLocaleDateString("pt-BR")} {new Date(h.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div></div>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: h.res?.go ? "#6ec898" : "#e07070" }}>{h.res?.go ? "GO" : "NO-GO"}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                    {[
                      [h.mode === "build" ? "VGV" : "COMPRA", fmt(h.mode === "build" ? h.inp?.precoVenda : h.inp?.precoCompra)],
                      [h.inp?.usaFinanciamento ? "ROI EQUITY" : (h.mode === "rent" ? "CAP RATE" : "ROI"), h.inp?.usaFinanciamento ? pct(alav?.roiEquity ?? alav?.roiEquityA) : h.mode === "rent" ? pct(h.res?.capRate) : pct(h.res?.roi)],
                      [h.inp?.usaFinanciamento ? "CAP. PRÓPRIO" : (h.mode === "rent" ? "CF/MÊS" : "LUCRO"), h.inp?.usaFinanciamento ? fmt(alav?.capitalProprio) : h.mode === "rent" ? fmt(h.res?.cfm) : fmt(h.res?.ll)],
                    ].map(([l, v]) => <div key={l} style={{ background: "#0d0b09", padding: "5px 7px", borderRadius: "3px" }}><div style={{ fontSize: "7px", color: "#2e2820", letterSpacing: "0.08em" }}>{l}</div><div style={{ fontSize: "10px", fontFamily: "monospace", color: "#908880" }}>{v}</div></div>)}
                  </div>
                </div>;
              })}
            </div>
          )}
          {!histLoading && viewHist && (
            <div style={{ animation: "fadeUp .3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <button onClick={() => setViewHist(null)} style={{ padding: "6px 11px", background: "transparent", color: "#4a4038", border: "1px solid #2a2018", borderRadius: "4px", fontSize: "10px", cursor: "pointer" }}>← Histórico</button>
                <button onClick={() => delHist(viewHist._key)} style={{ padding: "6px 11px", background: "#1a0a0a", color: "#e07070", border: "1px solid #3a1a1a", borderRadius: "4px", fontSize: "10px", cursor: "pointer" }}>🗑 Excluir</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div>
                  <div style={{ fontSize: "8px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#3a3028", marginBottom: "8px" }}>Parâmetros</div>
                  {Object.entries({ "Tipo": { flip: "Flip", rent: "Locação", build: "Construção" }[viewHist.mode], "Alavancagem": viewHist.inp?.usaFinanciamento ? `Sim (${viewHist.inp?.entrada}% entrada)` : "Não", "Bairro": viewHist.inp?.bairro || "—", ...(viewHist.mode === "build" ? { "Terreno": fmt(viewHist.inp?.precoTerreno), "Área construir": `${viewHist.inp?.areaConstruir} m²`, "Custo obra/m²": fmt(viewHist.inp?.custoM2Construcao), "VGV": fmt(viewHist.inp?.precoVenda), "Prazo obra": `${viewHist.inp?.prazoMeses}m` } : { "Compra": fmt(viewHist.inp?.precoCompra), "Área": `${viewHist.inp?.areaM2} m²`, "Reforma": fmt(viewHist.inp?.custoReforma), ...(viewHist.mode === "flip" ? { "Venda": fmt(viewHist.inp?.precoVenda) } : { "Aluguel": fmt(viewHist.inp?.aluguelMensal) }) }), "Data": new Date(viewHist.ts).toLocaleString("pt-BR") }).map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #121010" }}><span style={{ fontSize: "10px", color: "#3a3028" }}>{k}</span><span style={{ fontFamily: "monospace", fontSize: "10px", color: "#908880" }}>{v}</span></div>)}
                </div>
                <div>
                  <div style={{ fontSize: "8px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#3a3028", marginBottom: "8px" }}>Indicadores</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                    {(viewHist.mode === "rent" ? [
                      ["Cap Rate", pct(viewHist.res?.capRate), viewHist.res?.capRate > 0],
                      ...(viewHist.inp?.usaFinanciamento ? [["ROI Equity", pct(viewHist.res?.alav?.roiEquityA), viewHist.res?.alav?.roiEquityA > 0], ["CF após banco", fmt(viewHist.res?.alav?.cfmAlav), viewHist.res?.alav?.cfmAlav > 0]] : [["Cashflow/mês", fmt(viewHist.res?.cfm), viewHist.res?.cfm > 0], ["Payback", `${viewHist.res?.pb?.toFixed(1)}a`, true]]),
                      ["Veredicto", viewHist.res?.go ? "GO" : "NO-GO", viewHist.res?.go],
                    ] : [
                      ["ROI Total", pct(viewHist.res?.roi), viewHist.res?.roi > 0],
                      [viewHist.mode === "build" ? "Margem VGV" : "Margem", pct(viewHist.res?.ml), viewHist.res?.ml > 0],
                      ...(viewHist.inp?.usaFinanciamento ? [["ROI Equity", pct(viewHist.res?.alav?.roiEquity), viewHist.res?.alav?.roiEquity > 0], ["Multiplic.", `${n2(viewHist.res?.alav?.mult)}x`, viewHist.res?.alav?.mult > 1]] : [["TIR Anual", pct(viewHist.res?.irr), viewHist.res?.irr > 0], ["Lucro", fmt(viewHist.res?.ll), viewHist.res?.ll > 0]]),
                      ["Veredicto", viewHist.res?.go ? "GO" : "NO-GO", viewHist.res?.go],
                    ]).map(([l, v, ok]) => <div key={l} style={{ padding: "8px 10px", background: "#0f0d0b", border: "1px solid #181410", borderRadius: "4px" }}><div style={{ fontSize: "8px", color: "#2e2820", textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div><div style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: "700", color: ok ? "#6ec898" : "#e07070", marginTop: "1px" }}>{v}</div></div>)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
