// Hedefler: bir etkinliğin "bitti" ölçütleri. Çalışma günlüğünden ve program yapısından değerlendirilir.
// `sticky` hedefler (varsayılan) çalışma bir kez sağlayınca, program değişene kadar "tamam" kalır; `sticky: false` olanlar canlı değerlendirilir.
import { usedTypes } from './program'
import type { Simulation } from './sim'
import type { DeviceEvent, PinName, RadioMessage, Value, WorkspaceState } from './types'

export interface GoalCtx {
  /** Çalışma yoksa null (yalnız yapı hedefleri değerlendirilir). */
  sim: Simulation | null
  ws: WorkspaceState
}

export interface MikroGoal {
  id: string
  text: string
  hint?: string
  /** Varsayılan true: çalışma sonucu bir kez sağlanınca korunur. false: her değerlendirmede yeniden bakılır (yapı hedefleri). */
  sticky?: boolean
  check(ctx: GoalCtx): boolean
}

export interface GoalStatus { id: string; text: string; hint?: string; done: boolean }

/** `stickyDone`: önceden sağlanmış sticky hedef kimlikleri. Güncellenmiş küme ve durum listesi döner. */
export function evaluateGoals(goals: MikroGoal[], ctx: GoalCtx, stickyDone: ReadonlySet<string> = new Set()): { status: GoalStatus[]; stickyDone: Set<string> } {
  const next = new Set(stickyDone)
  const status = goals.map((g) => {
    const sticky = g.sticky !== false
    let done = sticky && next.has(g.id)
    if (!done) {
      try { done = !!g.check(ctx) } catch { done = false }
      if (done && sticky) next.add(g.id)
    }
    return { id: g.id, text: g.text, hint: g.hint, done }
  })
  return { status, stickyDone: next }
}

const events = (ctx: GoalCtx, card?: number): { card: number; e: DeviceEvent }[] => {
  if (!ctx.sim) return []
  return ctx.sim.allEvents().filter((x) => card === undefined || x.card === card)
}
const g = (id: string, text: string, check: (c: GoalCtx) => boolean, o: { hint?: string; sticky?: boolean } = {}): MikroGoal => ({ id, text, hint: o.hint, sticky: o.sticky, check })

// ---------------- yapı hedefleri (program yazıldı mı) ----------------
/** Programda şu blok türlerinden (hepsi ya da biri) bulunmalı. */
export const usesBlocks = (id: string, text: string, types: string[], o: { any?: boolean; hint?: string } = {}): MikroGoal =>
  g(id, text, (c) => { const u = usedTypes(c.ws); return o.any ? types.some((t) => u.has(t)) : types.every((t) => u.has(t)) }, { hint: o.hint, sticky: false })

// ---------------- davranış hedefleri (günlük) ----------------
/** Ekranda bu desen (5 satır, '0'/'1') bir an göründü. */
export const ledPattern = (id: string, text: string, rows: string[], o: { card?: number; hint?: string } = {}): MikroGoal => {
  const want = rows.map((r) => r.padEnd(5, '0').slice(0, 5)).join('')
  return g(id, text, (c) => {
    if (!c.sim) return false
    const cards = o.card === undefined ? c.sim.cards : [c.sim.cards[o.card]]
    return cards.some((cd) => !!cd && (cd.device.pattern() === want || cd.device.frames.some((f) => f.s === want)))
  }, { hint: o.hint })
}

/** Ekranda bu desenlerin hepsi (herhangi bir sırada) göründü. */
export const ledPatterns = (id: string, text: string, list: string[][], o: { hint?: string } = {}): MikroGoal => {
  const wants = list.map((rows) => rows.map((r) => r.padEnd(5, '0').slice(0, 5)).join(''))
  return g(id, text, (c) => !!c.sim && wants.every((w) => c.sim!.cards.some((cd) => cd.device.pattern() === w || cd.device.frames.some((f) => f.s === w))), { hint: o.hint })
}

/** En az `min` LED aynı anda yanan bir kare göründü. */
export const ledCount = (id: string, text: string, min: number, o: { hint?: string } = {}): MikroGoal =>
  g(id, text, (c) => !!c.sim && c.sim.cards.some((cd) => cd.device.frames.some((f) => [...f.s].filter((ch) => ch === '1').length >= min)), { hint: o.hint })

/** Yazı ya da sayı gösterildi (`match` yazı: tam eşit; RegExp: içerir). */
export const showsText = (id: string, text: string, match: string | RegExp, o: { card?: number; hint?: string } = {}): MikroGoal =>
  g(id, text, (c) => events(c, o.card).some(({ e }) => {
    const s = e.kind === 'text' ? e.text : e.kind === 'number' ? String(e.value) : null
    return s !== null && (typeof match === 'string' ? s === match : match.test(s))
  }), { hint: o.hint })

/** Bir sayı gösterildi; `pred` ile koşul verilebilir. */
export const showsNumber = (id: string, text: string, pred: number | ((n: number) => boolean), o: { card?: number; hint?: string } = {}): MikroGoal =>
  g(id, text, (c) => events(c, o.card).some(({ e }) => e.kind === 'number' && (typeof pred === 'number' ? e.value === pred : pred(e.value))), { hint: o.hint })

/** Ses çalındı: herhangi bir nota/ezgi ya da belirli frekans / ezgi adı; en az `min` kez. */
export const playsSound = (id: string, text: string, o: { freq?: number; melody?: string; min?: number; hint?: string } = {}): MikroGoal =>
  g(id, text, (c) => {
    const ev = events(c).map((x) => x.e)
    if (o.melody) return ev.some((e) => e.kind === 'melody' && e.name === o.melody)
    const tones = ev.filter((e) => e.kind === 'tone' && (o.freq === undefined || e.freq === o.freq))
    return tones.length >= (o.min ?? 1)
  }, { hint: o.hint })

/** Radyo mesajı gönderildi (`kind`: num/str/kv) ve isteğe bağlı koşul. */
export const radioSent = (id: string, text: string, o: { kind?: RadioMessage['kind']; card?: number; where?: (m: RadioMessage) => boolean; hint?: string } = {}): MikroGoal =>
  g(id, text, (c) => events(c, o.card).some(({ e }) => e.kind === 'radioSend' && (!o.kind || e.msg.kind === o.kind) && (!o.where || o.where(e.msg))), { hint: o.hint })

/** Bir kart radyo mesajı aldı. */
export const radioReceived = (id: string, text: string, o: { card?: number; where?: (m: RadioMessage) => boolean; hint?: string } = {}): MikroGoal =>
  g(id, text, (c) => events(c, o.card).some(({ e }) => e.kind === 'radioRecv' && (!o.where || o.where(e.msg))), { hint: o.hint })

/** Girdi olayından (örn. `button:A:press`) SONRA koşulu sağlayan bir olay oldu. */
export const afterInput = (id: string, text: string, key: string, then: (e: DeviceEvent) => boolean, o: { card?: number; hint?: string } = {}): MikroGoal =>
  g(id, text, (c) => {
    const list = events(c, o.card)
    const i = list.findIndex(({ e }) => e.kind === 'input' && e.key === key)
    return i >= 0 && list.slice(i + 1).some(({ e }) => then(e))
  }, { hint: o.hint })

/** Bir girdi olayından sonra ekran deseni göründü. */
export const afterInputPattern = (id: string, text: string, key: string, rows: string[], o: { card?: number; hint?: string } = {}): MikroGoal => {
  const want = rows.map((r) => r.padEnd(5, '0').slice(0, 5)).join('')
  return g(id, text, (c) => {
    if (!c.sim) return false
    const cards = o.card === undefined ? c.sim.cards : [c.sim.cards[o.card]]
    return cards.some((cd) => {
      if (!cd) return false
      const at = cd.device.log.find((e) => e.kind === 'input' && e.key === key)?.t
      return at !== undefined && (cd.device.frames.some((f) => f.t >= at && f.s === want))
    })
  }, { hint: o.hint })
}

/** Değişken değeri koşulu (kart 0). */
export const variableIs = (id: string, text: string, name: string, pred: Value | ((v: Value) => boolean), o: { hint?: string; card?: number } = {}): MikroGoal =>
  g(id, text, (c) => {
    const rt = c.sim?.cards[o.card ?? 0]?.runtime
    if (!rt) return false
    const v = rt.vars.get(name)
    if (v === undefined) return false
    return typeof pred === 'function' ? pred(v) : v === pred
  }, { hint: o.hint })

/** Konsola (seri) yazıldı. */
export const serialHas = (id: string, text: string, match: string | RegExp, o: { hint?: string } = {}): MikroGoal =>
  g(id, text, (c) => events(c).some(({ e }) => e.kind === 'serial' && (typeof match === 'string' ? e.text === match : match.test(e.text))), { hint: o.hint })

/** Pin çıkışı yazıldı. */
export const pinWritten = (id: string, text: string, pin: PinName, mode: 'digital' | 'analog' | 'servo', pred?: (v: number) => boolean, o: { hint?: string } = {}): MikroGoal =>
  g(id, text, (c) => events(c).some(({ e }) => e.kind === 'pin' && e.pin === pin && e.mode === mode && (!pred || pred(e.value))), { hint: o.hint })

/** Serbest ölçüt. */
export const custom = g
