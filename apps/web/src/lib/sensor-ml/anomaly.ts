// Anomali uyarısı: tahmin artığı (gerçek − tahmin) eğitimdeki artık dağılımıyla z-skoruna çevrilir; histerezisli alarm
// (açma eşiği > kapama eşiği) ve bekleme süresi (cooldown) ile gereksiz tekrar eden uyarılar engellenir. Değerlendirme:
// arıza penceresi yakalandı mı, kaç yanlış alarm, gecikme kaç örnek. Hepsi saf fonksiyon (mikrodenetleyicide aynı mantık).
import { buildTable, type FeatOpts } from './features'
import { fitLinear, predictLinear } from './model'
import { dropMask, hampel, interpLinear } from './clean'
import type { Series } from './sensors'

export interface AlarmOpts { on: number; off: number; /** Bir uyarıdan sonra yeni uyarı için beklenecek örnek sayısı. */ cooldown: number; /** Eşiğin üstünde kaç ardışık örnekten sonra açılır. */ minRun: number }
export const ALARM_DEFAULTS: AlarmOpts = { on: 3, off: 1.5, cooldown: 18, minRun: 2 }

export interface AlarmOut { state: boolean[]; alerts: number[] }
export function alarm(score: readonly number[], o: AlarmOpts = ALARM_DEFAULTS): AlarmOut {
  const state: boolean[] = [], alerts: number[] = []
  let on = false, run = 0, last = -Infinity
  score.forEach((z, i) => {
    const a = Number.isFinite(z) ? Math.abs(z) : 0
    if (!on) {
      run = a >= o.on ? run + 1 : 0
      if (run >= o.minRun) { on = true; if (i - last >= o.cooldown) { alerts.push(i); last = i } }
    } else if (a < o.off) { on = false; run = 0 }
    state.push(on)
  })
  return { state, alerts }
}

export interface AlertEval { caught: boolean; delay: number; falseAlerts: number; truePos: number }
/** label: 1 arıza. Arıza başladıktan sonra ilk uyarıya kadarki gecikme; arıza penceresi dışındaki uyarılar yanlış alarm. */
export function evaluate(alerts: readonly number[], label: readonly number[]): AlertEval {
  const start = label.indexOf(1)
  const end = label.lastIndexOf(1)
  const inside = alerts.filter((i) => label[i] === 1 || (start >= 0 && i >= start && i <= end + 6))
  const first = inside[0]
  return { caught: inside.length > 0, delay: first === undefined ? NaN : first - start, falseAlerts: alerts.length - inside.length, truePos: inside.length }
}

export interface Pipeline { idx: number[]; actual: number[]; pred: number[]; z: number[]; sd: number; trainEnd: number }
/**
 * Bitirme projesinin hattı: Hampel ile sıçramaları sil → doğrusal ara değerle doldur → özellik tablosu (ufuk h) → ilk
 * `trainDays` günde (arızasız) eğit → tüm seride tahmin → artığın z-skoru (eğitim artıklarının σ'sı ile).
 */
export function pipeline(s: Series, feat: FeatOpts, trainDays = 4, lambda = 1): Pipeline {
  const clean = interpLinear(dropMask(s.temp, hampel(s.temp, 3, 4)))
  const tab = buildTable(clean, s.hour, s.light, feat)
  const stepsPerDay = Math.round(1440 / (s.t[1] - s.t[0] || 10))
  const cut = tab.idx.findIndex((i) => i >= trainDays * stepsPerDay - feat.horizon)
  const trainEnd = cut < 0 ? tab.idx.length : cut
  const m = fitLinear(tab.X.slice(0, trainEnd), tab.y.slice(0, trainEnd), lambda)
  const pred = tab.X.map((x) => predictLinear(m, x))
  const res = tab.y.map((v, i) => v - pred[i])
  const tr = res.slice(0, trainEnd)
  const mu = tr.reduce((a, b) => a + b, 0) / (tr.length || 1)
  const sd = Math.sqrt(tr.reduce((a, b) => a + (b - mu) ** 2, 0) / (tr.length || 1)) || 1
  // Artık h adım sonraki gerçek değere aittir: z'yi hedefin zamanına (idx + h) yerleştir
  return { idx: tab.idx.map((i) => i + feat.horizon), actual: tab.y, pred, z: res.map((r) => (r - mu) / sd), sd, trainEnd }
}
