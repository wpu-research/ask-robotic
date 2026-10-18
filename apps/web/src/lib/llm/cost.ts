// Servis ve maliyet hesaplayıcı (saf mantık): token başına fiyatlardan istek başı ve aylık maliyet, önbellek ve toplu
// işleme kazancı, basit gecikme modeli (ilk token süresi + üretim hızı). Fiyatlar örnek liste fiyatıdır (Ekim 2026,
// claude-sonnet-5-5, milyon token başına); kullanıcı değiştirebilir, güncel fiyat sağlayıcının sayfasından kontrol edilir.

export interface Prices { input: number; output: number; cacheRead: number; cacheWrite: number }
/** Milyon token başına ABD doları. */
export const DEFAULT_PRICES: Prices = { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 }
/** Toplu işleme (Batches) indirimi: yarı fiyat. */
export const BATCH_DISCOUNT = 0.5

export interface CostInput {
  requestsPerDay: number
  inputTokens: number
  outputTokens: number
  /** Giriş tokenlarının önbelleğe alınabilir ön ek payı (0..1); örn. her istekte aynı sistem promptu ve notlar. */
  cachedShare: number
  /** Önbellek isabet oranı (0..1): ön ekin önbellekten okunduğu isteklerin payı; kalanlar önbelleğe yazar. */
  hitRate: number
  /** İsteklerin toplu işlemeye uygun payı (0..1): acelesi olmayan gece işleri. */
  batchShare: number
  prices: Prices
  daysPerMonth?: number
}
export const COST_DEFAULTS: Omit<CostInput, 'prices'> = { requestsPerDay: 2000, inputTokens: 6000, outputTokens: 400, cachedShare: 0.8, hitRate: 0.9, batchShare: 0, daysPerMonth: 30 }

export interface CostReport {
  /** Önbelleksiz, toplu işlemesiz istek başı maliyet. */
  plainPerRequest: number
  perRequest: number
  perMonth: number
  plainPerMonth: number
  /** Önbellek ve toplu işlemenin aylık kazancı ($). */
  cacheSaving: number
  batchSaving: number
  /** Aylık token sayıları. */
  monthInput: number
  monthOutput: number
}

const M = 1_000_000

export function costReport(c: CostInput): CostReport {
  const p = c.prices
  const days = c.daysPerMonth ?? 30
  const plainPerRequest = (c.inputTokens * p.input + c.outputTokens * p.output) / M
  const cached = c.inputTokens * c.cachedShare, fresh = c.inputTokens - cached
  // isabetli istekte ön ek ucuza okunur; isabetsizde önbelleğe yazılır (biraz pahalı)
  const cachedCost = cached * (c.hitRate * p.cacheRead + (1 - c.hitRate) * p.cacheWrite)
  const withCache = (fresh * p.input + cachedCost + c.outputTokens * p.output) / M
  const perRequest = withCache * (1 - c.batchShare * BATCH_DISCOUNT)
  const n = c.requestsPerDay * days
  return {
    plainPerRequest, perRequest, perMonth: perRequest * n, plainPerMonth: plainPerRequest * n,
    cacheSaving: (plainPerRequest - withCache) * n, batchSaving: (withCache - perRequest) * n,
    monthInput: c.inputTokens * n, monthOutput: c.outputTokens * n,
  }
}

export interface LatencyInput { inputTokens: number; outputTokens: number; cachedShare: number; hitRate: number }
/** Öğretim amaçlı gecikme modeli. Sabitler gerçek ölçüm değil, büyüklük sırası göstermek için seçildi. */
export const LATENCY = { baseMs: 400, prefillPerKTokMs: 60, cachedPrefillFactor: 0.1, tokensPerSec: 60 }
export interface LatencyReport { ttftMs: number; totalMs: number; generateMs: number }
export function latency(l: LatencyInput): LatencyReport {
  const cachedTok = l.inputTokens * l.cachedShare * l.hitRate
  const prefill = ((l.inputTokens - cachedTok) + cachedTok * LATENCY.cachedPrefillFactor) / 1000 * LATENCY.prefillPerKTokMs
  const ttftMs = LATENCY.baseMs + prefill
  const generateMs = l.outputTokens / LATENCY.tokensPerSec * 1000
  return { ttftMs, generateMs, totalMs: ttftMs + generateMs }
}

/** Bağlam penceresi bütçesi: sistem + geçmiş + belgeler + çıkış payı pencereyi aşıyor mu? */
export function contextBudget(window: number, parts: { system: number; history: number; docs: number; maxOutput: number }): { used: number; free: number; fits: boolean } {
  const used = parts.system + parts.history + parts.docs + parts.maxOutput
  return { used, free: window - used, fits: used <= window }
}
