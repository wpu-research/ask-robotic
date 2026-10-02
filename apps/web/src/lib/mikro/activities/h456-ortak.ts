// Mikro Kart ders etkinlikleri (hafta 4-6) için ortak yardımcılar: kısa blok kurucuları ve ses/ekran hedefleri.
import { type GoalCtx, type MikroGoal, custom } from '../goals'
import { type In, b } from '../program'
import type { PBlock } from '../types'
import { NOTE_FREQ } from '../music'

/** Nota adı -> frekans (Hz). */
export const hz = (n: string): number => NOTE_FREQ[n]

export const beats = { onaltida: '0.25', sekizde: '0.5', dortte: '1', yarim: '2', bir: '4', iki: '8' } as const

export const note = (name: string, beat: string = beats.dortte): PBlock => b('mk_play_note', { f: { NOTE: name, BEATS: beat } })
export const rest = (beat: string = beats.dortte): PBlock => b('mk_rest', { f: { BEATS: beat } })
export const tone = (freq: In, beat: string = beats.dortte): PBlock => b('mk_play_tone', { i: { FREQ: freq }, f: { BEATS: beat } })
export const tempo = (bpm: number): PBlock => b('mk_set_tempo', { i: { BPM: bpm } })
export const icon = (id: string): PBlock => b('mk_show_icon', { f: { ICON: id } })
export const pause = (ms: In): PBlock => b('mk_pause', { i: { MS: ms } })
export const clear = (): PBlock => b('mk_clear')
export const showNum = (v: In): PBlock => b('mk_show_number', { i: { VALUE: v } })
export const showText = (t: In): PBlock => b('mk_show_text', { i: { TEXT: t } })
export const melody = (id: string): PBlock => b('mk_play_melody', { f: { MEL: id } })
export const mapBlock = (v: In, a: In, c: In, d: In, e: In): PBlock => b('mk_map', { i: { V: v, A: a, B: c, C: d, D: e } })
export const radioNum = (v: In): PBlock => b('mk_radio_send_number', { i: { VALUE: v } })
export const radioGroup = (g: number): PBlock => b('mk_radio_group', { i: { G: g } })
export const radioRecv = (kind: 'number' | 'text' | 'name' | 'value'): PBlock => b('mk_radio_recv', { f: { KIND: kind } })
export const onRadio = (body: PBlock[]): PBlock => b('mk_on_radio', { s: { DO: body } })
export const onGesture = (g: string, body: PBlock[]): PBlock => b('mk_on_gesture', { f: { G: g }, s: { DO: body } })
export const onLogo = (body: PBlock[], ev: 'touch' | 'release' = 'touch'): PBlock => b('mk_on_logo', { f: { EV: ev }, s: { DO: body } })
export const onPin = (pin: 'P0' | 'P1' | 'P2', body: PBlock[]): PBlock => b('mk_on_pin', { f: { PIN: pin, EV: 'touch' }, s: { DO: body } })
export const every = (ms: number, body: PBlock[]): PBlock => b('mk_every', { f: { MS: ms }, s: { DO: body } })

/** Verilen frekanslar, bir kartın günlüğünde bu sırayla (arada başka sesler olabilir) çalındı. */
export function tonesInOrder(id: string, text: string, freqs: number[], o: { card?: number; hint?: string } = {}): MikroGoal {
  return custom(id, text, (c: GoalCtx) => {
    const cards = c.sim ? (o.card === undefined ? c.sim.cards : [c.sim.cards[o.card]]) : []
    return cards.some((cd) => {
      let k = 0
      for (const e of cd?.device.log ?? []) if (e.kind === 'tone' && e.freq === freqs[k]) k++
      return k >= freqs.length
    })
  }, { hint: o.hint })
}

/** En az bir nota, tam bu sürede (ms) çalındı. */
export const toneLasted = (id: string, text: string, freq: number, ms: number, o: { hint?: string } = {}): MikroGoal =>
  custom(id, text, (c) => !!c.sim && c.sim.allEvents().some(({ e }) => e.kind === 'tone' && e.freq === freq && e.ms === ms), { hint: o.hint })
