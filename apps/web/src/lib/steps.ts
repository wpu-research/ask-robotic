// Etkileşimli ders (v2) adımlarının saf kontrol mantığı: cevap denetimi, widget metrikleri, karıştırma.
// Tipler: packages/db/src/content/types.ts (LessonStep). Arayüz: components/lesson-v2.
import type { LessonStep, WidgetGoal } from '@ask/db'

type Of<K extends LessonStep['kind']> = Extract<LessonStep, { kind: K }>

export const INTERACTIVE: LessonStep['kind'][] = ['choice', 'numeric', 'fill', 'order', 'widget', 'activity']
export const isInteractive = (s: LessonStep) => INTERACTIVE.includes(s.kind)

export const checkChoice = (s: Of<'choice'>, picked: number) => picked === s.answer
export const checkNumeric = (s: Of<'numeric'>, value: number) => Math.abs(value - s.answer) <= (s.tolerance ?? 0) + 1e-9
export const checkFill = (s: Of<'fill'>, filled: (string | null)[]) => s.answer.length === filled.length && s.answer.every((a, i) => filled[i] === a)
export const checkOrder = (s: Of<'order'>, lines: string[]) => lines.length === s.lines.length && lines.every((l, i) => l === s.lines[i])

export const BLANK = '___'
/** Kodu boşluklarından böler: n boşluk → n+1 parça. */
export const splitBlanks = (code: string) => code.split(BLANK)

// ---- Widget metrikleri ----

/** LED'in ileri yönlü gerilimi (kırmızı LED, yaklaşık). */
export const LED_VF = 2
export const R_VALUES = [10, 22, 47, 68, 100, 150, 220, 330, 470, 680, 1000, 2200, 4700, 10000]

export function ohmMetrics(v: number, r: number, led: boolean): Record<string, number> {
  const drop = led ? Math.max(0, v - LED_VF) : v
  const i = r > 0 ? drop / r : 0
  const iMa = Math.round(i * 1000 * 10) / 10
  return { V: v, R: r, I_mA: iMa, P_mW: Math.round(i * i * r * 1000 * 10) / 10, ledOn: led && iMa >= 1 ? 1 : 0 }
}

export function blinkMetrics(onMs: number, offMs: number): Record<string, number> {
  const periodMs = onMs + offMs
  return { onMs, offMs, periodMs, hz: periodMs > 0 ? Math.round((1000 / periodMs) * 100) / 100 : 0, duty: periodMs > 0 ? Math.round((onMs / periodMs) * 100) : 0 }
}

export function goalMet(g: WidgetGoal, metrics: Record<string, number>): boolean {
  const v = metrics[g.metric]
  if (v === undefined || !Number.isFinite(v)) return false
  return (g.min === undefined || v >= g.min - 1e-9) && (g.max === undefined || v <= g.max + 1e-9)
}

// ---- Karıştırma ----

/** Tohumlu karıştırma (sunucu ve tarayıcı aynı sırayı üretir); sonuç hiçbir zaman doğru sıra olmaz (≥ 2 öğe). */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const a = [...items]
  let x = (seed * 2654435761) >>> 0 || 1
  const rnd = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296 }
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  if (a.length > 1 && a.every((v, i) => v === items[i])) a.push(a.shift()!)
  return a
}
