// Müzik oyununun motoru: bloklar notaları olay listesine yazar; hedef karşılaştırması olay listesinden yapılır.
// Zaman vuruş cinsindendir. Süre bekletmesi: her eylem adımından sonra çalma saatinin ilerlediği kadar beklenir.
import { HaltProgram } from '../interpreter'
import type { GameRun, LevelDef } from '../types'
import { noteType } from './blocks'
import { BEAT_MS, compareMelodies, MAX_EVENTS, notesOnly, SOLFEGE, midiOf, type Ev, type Inst, type MusicState } from './notes'

const TOO_MANY = 'Çok fazla nota çaldın!'
/** Motorun kendi durdurma iletilerinin İngilizcesi (yorumlayıcı iletileri çerçevede çevrilir). */
const HALT_EN: Record<string, string> = { [TOO_MANY]: 'You played too many notes!' }

export interface CopyData { kind: 'copy'; target: Ev[]; checkInst: boolean }
export interface FreeData { kind: 'free'; min: { notes: number; pitches: number; channels: number; instruments: number }; goalText: string }
export type LevelData = CopyData | FreeData

export interface Stats { notes: number; pitches: number; channels: number; instruments: number }
export function statsOf(events: readonly Ev[]): Stats {
  const n = notesOnly(events)
  return {
    notes: n.length,
    pitches: new Set(n.map((e) => e.p)).size,
    channels: new Set(n.map((e) => e.ch)).size,
    instruments: new Set(n.map((e) => e.i)).size,
  }
}

const INSTS = new Set<string>(['piyano', 'flut', 'keman', 'zil'])

export function createRun(level: LevelDef): GameRun<MusicState> {
  const data = level.data as LevelData
  const events: Ev[] = []
  let cursor = 0, ch = 0, nextCh = 1, inst: Inst = 'piyano'
  let maxEnd = 0, paid = 0, depth = 0

  const add = (p: number | null, d: number) => {
    if (events.length >= MAX_EVENTS) throw new HaltProgram(TOO_MANY)
    const dur = Number.isFinite(d) && d > 0 ? d : 1
    events.push({ t: cursor, d: dur, p, i: inst, ch })
    cursor += dur
    if (cursor > maxEnd) maxEnd = cursor
  }

  const blocks: GameRun<MusicState>['api']['blocks'] = {
    muzik_sus: (c) => add(null, Number(c.field('DUR') ?? 1)),
    muzik_enstruman: (c) => { const v = String(c.field('INST') ?? 'piyano'); inst = (INSTS.has(v) ? v : 'piyano') as Inst },
    muzik_es_zamanli: function* (c) {
      const t0 = cursor, inst0 = inst, ch0 = ch
      const chB = nextCh++
      depth++
      try {
        ch = ch0
        yield* c.statements('A')
        const endA = cursor
        cursor = t0; inst = inst0; ch = chB
        yield* c.statements('B')
        cursor = Math.max(endA, cursor)
      } finally {
        depth--
        inst = inst0; ch = ch0
      }
    },
  }
  for (const s of SOLFEGE) {
    blocks[noteType(s.id)] = (c) => add(midiOf(s.semi, Number(c.field('OCT') ?? 4)), Number(c.field('DUR') ?? 1))
  }

  return {
    api: { hats: ['muzik_basla'], blocks },
    snapshot: () => ({ events: events.map((e) => ({ ...e })), total: maxEnd }),
    stepDelay: () => {
      if (depth > 0) return 0
      const owed = (maxEnd - paid) * BEAT_MS
      paid = maxEnd
      return owed
    },
    evaluate(result) {
      if (result.reason === 'halted') return { ok: false, message: result.message || 'Program durdu.', messageEn: result.message ? (HALT_EN[result.message] ?? result.messageEn) : 'The program stopped.' }
      if (result.reason !== 'finished') return { ok: false, message: 'Program bitmedi.', messageEn: 'The program did not finish.' }
      if (data.kind === 'copy') {
        const diff = compareMelodies(events, data.target, data.checkInst)
        return diff ? { ok: false, message: diff, messageEn: compareMelodies(events, data.target, data.checkInst, true) ?? undefined } : { ok: true, message: 'Melodi birebir tuttu!', messageEn: 'The melody matches exactly!' }
      }
      const s = statsOf(events), m = data.min
      if (s.notes < m.notes) return { ok: false, message: `En az ${m.notes} nota çalmalısın (şimdi ${s.notes}).`, messageEn: `Play at least ${m.notes} notes (now ${s.notes}).` }
      if (s.pitches < m.pitches) return { ok: false, message: `En az ${m.pitches} farklı nota kullan (şimdi ${s.pitches}).`, messageEn: `Use at least ${m.pitches} different notes (now ${s.pitches}).` }
      if (s.channels < m.channels) return { ok: false, message: '"Aynı anda çal" ile iki kanal kullan.', messageEn: 'Use two channels with "play together".' }
      if (s.instruments < m.instruments) return { ok: false, message: 'İki farklı enstrüman kullan.', messageEn: 'Use two different instruments.' }
      return { ok: true, message: 'Şarkın çok güzel!', messageEn: 'Your song is lovely!' }
    },
  }
}
