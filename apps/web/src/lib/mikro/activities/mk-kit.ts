// Mikro Kart ders etkinlikleri için ortak küçük yardımcılar (blok kısayolları ve özel hedefler).
import { custom, type MikroGoal } from '../goals'
import { ICON_BY_ID } from '../icons'
import { b, type In } from '../program'
import type { MikroProject } from '../types'

export const pause = (ms: In) => b('mk_pause', { i: { MS: ms } })
export const icon = (id: string) => b('mk_show_icon', { f: { ICON: id } })
export const num = (v: In) => b('mk_show_number', { i: { VALUE: v } })
export const text = (t: In) => b('mk_show_text', { i: { TEXT: t } })
export const leds = (rows: string[]) => b('mk_show_leds', { f: { LEDS: rows.join('') } })
export const clear = () => b('mk_clear')
export const plot = (x: In, y: In) => b('mk_plot', { i: { X: x, Y: y } })
export const bar = (v: In, max: In) => b('mk_show_bar', { i: { V: v, MAX: max } })
export const arrowDeg = (a: In) => b('mk_show_arrow_deg', { i: { ANGLE: a } })

export const ICON_ROWS = (id: string): string[] => ICON_BY_ID[id].rows
export const joinRows = (rows: string[]): string => rows.map((r) => r.padEnd(5, '0').slice(0, 5)).join('')

/** Başlangıç projesinde hazır olarak bulunan değişkenler (öğrencinin "Değişken oluştur" adımını atlatır). */
export function withVars(p: MikroProject, names: string[]): MikroProject {
  const have = new Set((p.workspace.variables ?? []).map((v) => v.name))
  for (const n of names) if (!have.has(n)) (p.workspace.variables ??= []).push({ name: n, id: `v_${n}` })
  return p
}

/** Ekranda boş olmayan bir YAZI (sayı değil) gösterildi. */
export const showedAnyText = (id: string, textMsg: string, hint?: string): MikroGoal =>
  custom(id, textMsg, (c) => !!c.sim && c.sim.allEvents().some(({ e }) => e.kind === 'text' && e.text.trim().length > 0), { hint })

/** Bir kare deseni (rows) en az `n` kez göründü. */
export const patternSeenTimes = (id: string, textMsg: string, rows: string[], n: number, hint?: string): MikroGoal => {
  const want = joinRows(rows)
  return custom(id, textMsg, (c) => !!c.sim && c.sim.cards.some((cd) => cd.device.frames.filter((f) => f.s === want).length >= n), { hint })
}

/** Belirli bir girdi olayından sonra ekran boşaldı (ekranı temizle çalıştı). */
export const clearedAfter = (id: string, textMsg: string, key: string, hint?: string): MikroGoal =>
  custom(id, textMsg, (c) => {
    const d = c.sim?.cards[0]?.device
    if (!d) return false
    const at = d.log.find((e) => e.kind === 'input' && e.key === key)?.t
    return at !== undefined && d.frames.some((f) => f.t >= at && !f.s.includes('1'))
  }, { hint })
