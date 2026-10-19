// 3B sera sahnesinin (sensör-ML) saf mantığı: bitirme hattının (temizle → özellik → ridge → artık z-skoru → histerezisli
// uyarı) her örneği için sahnede gösterilecek değerler. three.js yok; sahne bu kareleri yalnız renk ve etikete çevirir.
import { alarm, pipeline, type AlarmOpts } from './anomaly'
import { FEAT_DEFAULTS } from './features'
import type { Series } from './sensors'

export type Status = 'normal' | 'watch' | 'alert'
export interface SmlFrame {
  /** Serideki örnek indeksi (hedefin zamanı). */
  i: number
  day: number
  hour: number
  /** Temizlenmiş gerçek sıcaklık ve h adım önce yapılmış tahmin. */
  actual: number
  pred: number
  z: number
  alarm: boolean
  /** Gerçek arıza penceresi (etiket, yalnız ders için). */
  fault: boolean
  hum: number
  light: number
  status: Status
}

/** Bütün günler için kareler. |z| açma eşiğinin yarısını geçince "izle", alarm açıkken "uyarı". */
export function smlFrames(s: Series, horizon = 3, opts?: AlarmOpts): SmlFrame[] {
  const P = pipeline(s, { ...FEAT_DEFAULTS, horizon })
  const A = alarm(P.z, opts)
  const on = opts?.on ?? 3
  return P.idx.map((i, k) => {
    const z = P.z[k], a = A.state[k]
    return {
      i, day: Math.floor(s.t[i] / 1440) + 1, hour: s.hour[i], actual: P.actual[k], pred: P.pred[k], z, alarm: a, fault: s.fault[i] === 1,
      hum: s.hum[i], light: s.light[i], status: a ? 'alert' : Math.abs(z) >= on / 2 ? 'watch' : 'normal',
    }
  })
}

/** Ondalıklı konumdaki kare (oynatma çubuğu): en yakın alttaki kare, sınırlar içinde. */
export const frameAtPos = (f: readonly SmlFrame[], pos: number): SmlFrame => f[Math.max(0, Math.min(f.length - 1, Math.floor(pos)))]

/** Isı haritası: seranın 5 × 3 yatağındaki tahmini sıcaklık. Güneşe bakan (güney, z < 0) sıralar ve ısıtıcıya yakın köşe
 *  biraz sıcak (arızada ısıtıcı köşesi belirgin); orta sıra sensörün ölçtüğü değerdir. Görselleştirme içindir, ölçüm değildir. */
export function bedTemps(f: SmlFrame, cols = 5, rows = 3): number[][] {
  const sun = Math.max(0, Math.sin(((f.hour - 6) / 12) * Math.PI))
  return Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
    const south = (rows - 1 - r) / Math.max(1, rows - 1) - 0.5
    const heater = f.fault ? Math.max(0, 1 - Math.hypot(c, rows - 1 - r) / 2.5) * 2.5 : 0
    return f.actual + 1.2 * sun * south + heater
  }))
}
