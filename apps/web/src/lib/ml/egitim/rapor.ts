// Eğitim raporu: bir dersin ya da projenin gerçek eğitim çalıştırmasından çıkan her şey (dönem/adım geçmişi, son ölçümler,
// karışıklık matrisi, skorlar, hiperparametreler, tohum) ve panelde çizilecek grafiklerin tarifleri. Saf veri: eğitim paneli
// (components/ml/egitim-paneli.tsx) çizer, CSV/JSON dışa aktarımı buradan üretilir. Yardımcılar sık kullanılan blokları
// (sınıflandırma, regresyon, öğrenme eğrisi, ağırlık histogramı) gerçek tahmin ve skorlardan kurar; uydurma sayı yoktur.
import type { Bi } from '../core'
import { auc, binaryAt, bestIndex, confusionMatrix, histogram, macro, mae, mse, perClass, prCurve, r2, rocCurve, accuracy } from './metrics'

export type ModelTuru = 'regresyon' | 'siniflandirma' | 'sinir-agi' | 'pekistirmeli' | 'kumeleme' | 'evrim' | 'dil-modeli'

/** Grafikteki bir seri. `x` verilmezse grafiğin ortak x'i kullanılır. `tone` 0…5: --ml-c0…c5 rengi. */
export interface Seri { key: string; label: Bi; values: number[]; x?: number[]; tone?: number; dash?: boolean }

interface GrafikTemel { id: string; title: Bi; /** Kısa açıklama (grafiğin altında). */ note?: Bi }
export interface CizgiGrafik extends GrafikTemel {
  kind: 'line'
  x: number[]
  xLabel: Bi
  yLabel?: Bi
  series: Seri[]
  logY?: boolean
  /** Sabit eksen aralığı (ör. doğruluk için 0…1). */
  yMin?: number
  yMax?: number
  /** Dikey işaret (ör. erken durdurma noktası). */
  marker?: { x: number; label: Bi }
  /** Oynatıcıyla birlikte soldan sağa açılır (ders karesine göre). */
  live?: boolean
  /** Köşegen referans çizgisi (ROC için). */
  diag?: boolean
}
export interface CubukGrafik extends GrafikTemel {
  kind: 'bar'
  labels: string[]
  series: Seri[]
  yLabel?: Bi
  yMin?: number
  yMax?: number
}
export interface SacilimGrafik extends GrafikTemel {
  kind: 'scatter'
  xLabel: Bi
  yLabel: Bi
  /** [x, y, sınıf/renk?] */
  points: Array<[number, number, number?]>
  /** y = x çizgisi (tahmin–gerçek). */
  diag?: boolean
  /** y = 0 çizgisi (artıklar). */
  zero?: boolean
}
export interface IsiGrafik extends GrafikTemel {
  kind: 'heat'
  rows: string[]
  cols: string[]
  values: number[][]
  rowLabel?: Bi
  colLabel?: Bi
  /** Hücrede sayıyı yaz. */
  showValues?: boolean
  /** Ondalık basamak (yazılan sayılar için). */
  digits?: number
  /** Karışıklık matrisi: köşegen yeşil, dışı kırmızı tonlu. */
  confusion?: boolean
}
export interface HistGrafik extends GrafikTemel {
  kind: 'hist'
  /** Satır başına bir an (ör. "adım 0", "adım 1500"); hepsi aynı kutu sınırlarını kullanır. */
  edges: number[]
  frames: Array<{ label: string; counts: number[] }>
  xLabel: Bi
}
export type Grafik = CizgiGrafik | CubukGrafik | SacilimGrafik | IsiGrafik | HistGrafik

export interface SonOlcu { key: string; label: Bi; value: number; /** 'pct' yüzde, 'int' tamsayı, sayı: ondalık basamak */ fmt?: 'pct' | 'int' | number }

export interface EgitimRaporu {
  kind: ModelTuru
  /** Kısa model tarifi (ör. "MLP 2-8-1, tanh"); dile bağlıysa iki dilli. */
  model: string | Bi
  seed: number
  hyper: Record<string, number | string>
  /** Dönem/adım geçmişi: x sütununun adı ve sütunlar (hepsi aynı uzunlukta). CSV'nin ilk tablosu budur. */
  history: { x: string; cols: Record<string, number[]> }
  final: SonOlcu[]
  confusion?: { labels: string[]; m: number[][] }
  /** İkili skorlar: eşik kaydırıcısı ROC/PR üzerinde bu skorlarla çalışır. */
  scores?: { y: number[]; s: number[]; t: number; pos: Bi; neg: Bi }
  charts: Grafik[]
}

// ---------------------------------------------------------------- yardımcılar

const bi = (tr: string, en: string): Bi => ({ tr, en })
export const B = bi

/** Geçmişten çizgi grafiği: `cols` geçmiş sütun adları; etiket ve renkler sırayla. */
export function gecmisGrafik(r: Pick<EgitimRaporu, 'history'>, id: string, title: Bi, cols: Array<[key: string, label: Bi, tone?: number, dash?: boolean]>, o: Partial<CizgiGrafik> = {}): CizgiGrafik {
  const xs = r.history.cols[r.history.x] ?? []
  return {
    kind: 'line', id, title, x: xs, xLabel: o.xLabel ?? bi(r.history.x === 'epoch' ? 'dönem' : r.history.x === 'step' ? 'adım' : r.history.x, r.history.x),
    series: cols.filter(([k]) => r.history.cols[k]).map(([key, label, tone, dash]) => ({ key, label, values: r.history.cols[key], tone, dash })), live: true, ...o,
  }
}

/** Erken durdurma işareti: doğrulama kaybının en küçük olduğu x. */
export function erkenDurdurma(xs: readonly number[], val: readonly number[]): { x: number; label: Bi } | undefined {
  if (val.length < 3) return undefined
  const i = bestIndex(val)
  return { x: xs[i], label: bi(`en iyi doğrulama: ${xs[i]}`, `best validation: ${xs[i]}`) }
}

/**
 * Sınıflandırma bloğu: doğruluk, makro kesinlik/duyarlılık/F1, karışıklık matrisi ve sınıf başına çubuklar. İkili skor verilirse
 * ROC (AUC) ve kesinlik–duyarlılık (AP) eğrileri ile eşik kaydırıcısının verisi de eklenir. `prefix` ölçü anahtarlarının önüne gelir
 * (ör. "test_").
 */
export function siniflandirmaBlok(o: {
  y: number[]; pred: number[]; labels: string[]; scores?: number[]; threshold?: number; pos?: Bi; neg?: Bi; prefix?: string; title?: Bi
}): Pick<EgitimRaporu, 'final' | 'confusion' | 'charts' | 'scores'> {
  const K = o.labels.length
  const m = confusionMatrix(o.y, o.pred, K)
  const pc = perClass(m), ma = macro(pc)
  const p = o.prefix ?? ''
  const t = o.title ? ` · ${o.title.tr}` : '', te = o.title ? ` · ${o.title.en}` : ''
  const final: SonOlcu[] = [
    { key: `${p}accuracy`, label: bi(`doğruluk${t}`, `accuracy${te}`), value: accuracy(o.y, o.pred), fmt: 'pct' },
    { key: `${p}precision`, label: bi(`${K === 2 ? 'kesinlik' : 'kesinlik (makro)'}${t}`, `${K === 2 ? 'precision' : 'precision (macro)'}${te}`), value: K === 2 ? pc[1].precision : ma.precision, fmt: 3 },
    { key: `${p}recall`, label: bi(`${K === 2 ? 'duyarlılık' : 'duyarlılık (makro)'}${t}`, `${K === 2 ? 'recall' : 'recall (macro)'}${te}`), value: K === 2 ? pc[1].recall : ma.recall, fmt: 3 },
    { key: `${p}f1`, label: bi(`${K === 2 ? 'F1' : 'F1 (makro)'}${t}`, `${K === 2 ? 'F1' : 'F1 (macro)'}${te}`), value: K === 2 ? pc[1].f1 : ma.f1, fmt: 3 },
  ]
  const charts: Grafik[] = [
    {
      kind: 'heat', id: `${p}confusion`, title: bi(`Karışıklık matrisi${t}`, `Confusion matrix${te}`), rows: o.labels, cols: o.labels, values: m,
      rowLabel: bi('gerçek', 'actual'), colLabel: bi('tahmin', 'predicted'), showValues: true, confusion: true,
    },
    {
      kind: 'bar', id: `${p}per-class`, title: bi(`Sınıf başına ölçüler${t}`, `Per-class metrics${te}`), labels: o.labels, yMin: 0, yMax: 1,
      series: [
        { key: 'precision', label: bi('kesinlik', 'precision'), values: pc.map((c) => c.precision), tone: 1 },
        { key: 'recall', label: bi('duyarlılık', 'recall'), values: pc.map((c) => c.recall), tone: 2 },
        { key: 'f1', label: bi('F1', 'F1'), values: pc.map((c) => c.f1), tone: 3 },
      ],
    },
  ]
  // henüz örnek yoksa ölçüler tanımsız (panelde "–"), 0 değil
  if (!o.y.length) for (const f of final) f.value = NaN
  let scores: EgitimRaporu['scores']
  if (o.scores && K === 2 && o.y.length) {
    const yb = o.y.map((v) => (v === 1 ? 1 : 0))
    const roc = rocCurve(yb, o.scores), pr = prCurve(yb, o.scores), A = auc(yb, o.scores)
    final.push({ key: `${p}auc`, label: bi('ROC AUC', 'ROC AUC'), value: A, fmt: 3 }, { key: `${p}ap`, label: bi('ortalama kesinlik (AP)', 'average precision'), value: pr.ap, fmt: 3 })
    charts.push(
      { kind: 'line', id: `${p}roc`, title: bi(`ROC eğrisi (AUC ${A.toFixed(3).replace('.', ',')})${t}`, `ROC curve (AUC ${A.toFixed(3)})${te}`), x: roc.fpr, xLabel: bi('yanlış pozitif oranı', 'false positive rate'), yLabel: bi('duyarlılık', 'true positive rate'), series: [{ key: 'tpr', label: bi('ROC', 'ROC'), values: roc.tpr, tone: 1 }], yMin: 0, yMax: 1, diag: true },
      { kind: 'line', id: `${p}pr`, title: bi(`Kesinlik–duyarlılık (AP ${pr.ap.toFixed(3).replace('.', ',')})${t}`, `Precision–recall (AP ${pr.ap.toFixed(3)})${te}`), x: pr.recall, xLabel: bi('duyarlılık', 'recall'), yLabel: bi('kesinlik', 'precision'), series: [{ key: 'precision', label: bi('PR', 'PR'), values: pr.precision, tone: 4 }], yMin: 0, yMax: 1 },
    )
    scores = { y: yb, s: o.scores, t: o.threshold ?? 0.5, pos: o.pos ?? bi(o.labels[1], o.labels[1]), neg: o.neg ?? bi(o.labels[0], o.labels[0]) }
  }
  return { final, confusion: { labels: o.labels, m }, charts, scores }
}

/** Regresyon bloğu: MSE, MAE, R², artık grafiği ve tahmin–gerçek saçılımı. */
export function regresyonBlok(o: { y: number[]; pred: number[]; x?: number[]; xLabel?: Bi; unit?: string; prefix?: string }): Pick<EgitimRaporu, 'final' | 'charts'> {
  const p = o.prefix ?? ''
  const u = o.unit ? ` (${o.unit})` : ''
  const res = o.y.map((v, i) => v - o.pred[i])
  // önek hangi küme olduğunu söyler: etikete eklenir
  const [st, se] = p.startsWith('val') ? [' · doğrulama', ' · validation'] : p.startsWith('test') ? [' · test', ' · test'] : p.startsWith('train') ? [' · eğitim', ' · training'] : ['', '']
  return {
    final: [
      { key: `${p}mse`, label: bi(`ortalama kare hata (MSE)${st}`, `mean squared error${se}`), value: mse(o.y, o.pred), fmt: 3 },
      { key: `${p}mae`, label: bi(`ortalama mutlak hata${st}`, `mean absolute error${se}`), value: mae(o.y, o.pred), fmt: 3 },
      { key: `${p}r2`, label: bi(`R²${st}`, `R²${se}`), value: r2(o.y, o.pred), fmt: 3 },
    ],
    charts: [
      { kind: 'scatter', id: `${p}residuals`, title: bi('Artıklar (gerçek − tahmin)', 'Residuals (actual − predicted)'), xLabel: o.x ? o.xLabel ?? bi('x', 'x') : bi(`tahmin${u}`, `predicted${u}`), yLabel: bi(`artık${u}`, `residual${u}`), points: res.map((r, i) => [o.x ? o.x[i] : o.pred[i], r]), zero: true },
      { kind: 'scatter', id: `${p}pred-actual`, title: bi('Tahmin – gerçek', 'Predicted vs actual'), xLabel: bi(`gerçek${u}`, `actual${u}`), yLabel: bi(`tahmin${u}`, `predicted${u}`), points: o.y.map((v, i) => [v, o.pred[i]]), diag: true },
    ],
  }
}

/** Öğrenme eğrisi: eğitim kümesi büyüklüğüne göre eğitim ve test skoru. */
export function ogrenmeEgrisi(sizes: number[], train: number[], test: number[], metric: Bi = bi('doğruluk', 'accuracy'), o: Partial<CizgiGrafik> = {}): CizgiGrafik {
  return {
    kind: 'line', id: 'learning-curve', title: bi('Öğrenme eğrisi', 'Learning curve'), x: sizes, xLabel: bi('eğitim örneği sayısı', 'training examples'), yLabel: metric,
    series: [{ key: 'train', label: bi('eğitim', 'train'), values: train, tone: 1 }, { key: 'test', label: bi('test', 'test'), values: test, tone: 0 }],
    note: bi('İki eğri arasındaki açıklık ezberlemeyi (aşırı öğrenmeyi) gösterir; ikisi de düşükse model yetersizdir.', 'The gap between the curves shows memorising (overfitting); if both are low the model is too weak.'), ...o,
  }
}

/**
 * Katman başına ağırlık histogramları: `snaps[k] = { label, layers: [katman ağırlıkları…] }`. Her katman ayrı bir grafik; bütün
 * anlar aynı kutu sınırlarıyla sayılır (ağırlıkların zamanla yayılması görünür).
 */
export function agirlikHistleri(snaps: Array<{ label: string; layers: ArrayLike<number>[] }>, names: string[], bins = 24): HistGrafik[] {
  return names.map((name, l) => {
    let lo = Infinity, hi = -Infinity
    for (const s of snaps) { const w = s.layers[l]; for (let i = 0; i < w.length; i++) if (Number.isFinite(w[i])) { lo = Math.min(lo, w[i]); hi = Math.max(hi, w[i]) } }
    const m = Math.max(Math.abs(lo), Math.abs(hi), 1e-6)
    const frames = snaps.map((s) => ({ label: s.label, counts: histogram(s.layers[l], bins, -m, m).counts }))
    return { kind: 'hist', id: `w-hist-${l}`, title: bi(`Ağırlık dağılımı · ${name}`, `Weight distribution · ${name}`), edges: histogram([], bins, -m, m).edges, frames, xLabel: bi('ağırlık', 'weight'), note: bi('Her satır bir an (eğitim adımı); yukarıdan aşağı zaman ilerler.', 'Each row is one moment (training step); time runs top to bottom.') }
  })
}

/** Etkinleşme dağılımı (tek an, katman başına satır). */
export function etkinlesmeHist(layers: Array<{ label: string; values: ArrayLike<number> }>, lo: number, hi: number, bins = 24): HistGrafik {
  return {
    kind: 'hist', id: 'act-hist', title: bi('Etkinleşme dağılımı', 'Activation distribution'), edges: histogram([], bins, lo, hi).edges,
    frames: layers.map((l) => ({ label: l.label, counts: histogram(l.values, bins, lo, hi).counts })), xLabel: bi('etkinleşme', 'activation'),
  }
}

/** Eşik kaydırıcısının verdiği anlık ölçüler (panel bunu kullanır; testte de doğrulanır). */
export const esikOlculeri = binaryAt

// ---------------------------------------------------------------- dışa aktarım

/** Model tarifi istenen dilde. */
export const modelAdi = (r: Pick<EgitimRaporu, 'model'>, lang: 'tr' | 'en'): string => (typeof r.model === 'string' ? r.model : r.model[lang])

/** CSV hücresi: sayılar 8 anlamlı basamak, NaN/∞ "nan"/"inf"; metin gerekirse tırnaklanır. */
export function csvCell(v: number | string): string {
  if (typeof v === 'number') {
    if (Number.isNaN(v)) return 'nan'
    if (!Number.isFinite(v)) return v > 0 ? 'inf' : '-inf'
    return Number.isInteger(v) ? String(v) : String(Number(v.toPrecision(8)))
  }
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

/**
 * Raporun CSV'si. İlk tablo dönem/adım geçmişidir (Python'un yazdığı egitim_gecmisi.csv ile aynı düzen: başlık satırı, sonra
 * satır başına bir dönem). Boş bir satırdan sonra `metrik,deger` tablosu (model, tohum, hiperparametreler, son ölçümler); varsa
 * yine boş satırdan sonra karışıklık matrisi (satır gerçek, sütun tahmin).
 */
export function raporCSV(r: EgitimRaporu): string {
  const keys = [r.history.x, ...Object.keys(r.history.cols).filter((k) => k !== r.history.x)]
  const n = Math.max(0, ...keys.map((k) => r.history.cols[k]?.length ?? 0))
  const rows: string[] = [keys.map(csvCell).join(',')]
  for (let i = 0; i < n; i++) rows.push(keys.map((k) => { const v = r.history.cols[k]?.[i]; return v === undefined ? '' : csvCell(v) }).join(','))
  rows.push('', 'metrik,deger', `model,${csvCell(modelAdi(r, 'tr'))}`, `tur,${r.kind}`, `seed,${r.seed}`)
  for (const [k, v] of Object.entries(r.hyper)) rows.push(`hiper.${k},${csvCell(v)}`)
  for (const f of r.final) rows.push(`${f.key},${csvCell(f.value)}`)
  if (r.confusion) {
    rows.push('', ['karisiklik', ...r.confusion.labels.map((l) => `tahmin_${l}`)].map(csvCell).join(','))
    r.confusion.m.forEach((row, i) => rows.push([`gercek_${r.confusion!.labels[i]}`, ...row].map(csvCell).join(',')))
  }
  return rows.join('\n') + '\n'
}

/** Raporun JSON'u: geçmiş, son ölçümler, karışıklık matrisi, hiperparametreler ve tohum (grafik tarifleri hariç). */
export function raporJSON(r: EgitimRaporu): string {
  const num = (v: number) => (Number.isFinite(v) ? Number(v.toPrecision(10)) : null)
  return JSON.stringify({
    model: modelAdi(r, 'tr'), kind: r.kind, seed: r.seed, hyper: r.hyper,
    history: { x: r.history.x, ...Object.fromEntries(Object.entries(r.history.cols).map(([k, v]) => [k, v.map(num)])) },
    final: Object.fromEntries(r.final.map((f) => [f.key, num(f.value)])),
    ...(r.confusion ? { confusion: r.confusion } : {}),
    ...(r.scores ? { threshold: r.scores.t } : {}),
  }, null, 2) + '\n'
}
