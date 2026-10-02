// Ajan döngüsü simülatörü. ARAÇLAR gerçekten çalışır (hesap makinesi, bilgi tabanı, robot sensörü).
// "Model adımı" ise BİR MODEL DEĞİLDİR: öğrencinin yazdığı betik (ya da hazır betikli senaryo) hangi aracı çağıracağını söyler.
// Gerçek ajanda bu kararı bir dil modeli her adımda araç sonucunu görerek verirdi.
import { AGENT_KB } from './corpus'
import { stem, trLower, words } from './text'

// ───────── güvenli hesap makinesi ─────────
export function calc(src: string): number {
  const s = src.replace(/\s+/g, '')
  if (s === '') throw new Error('boş ifade')
  let i = 0
  const peek = () => s[i]
  const num = (): number => {
    const m = /^\d+(\.\d+)?/.exec(s.slice(i))
    if (!m) throw new Error(`sayı bekleniyordu: "${s.slice(i, i + 6)}"`)
    i += m[0].length; return parseFloat(m[0])
  }
  const primary = (): number => {
    if (peek() === '(') { i++; const v = cmp(); if (peek() !== ')') throw new Error('")" eksik'); i++; return v }
    return num()
  }
  const unary = (): number => { if (peek() === '-') { i++; return -unary() } return primary() }
  const mul = (): number => {
    let v = unary()
    while (peek() === '*' || peek() === '/' || peek() === '%') {
      const op = s[i++]; const r = unary()
      if (op === '*') v *= r
      else { if (r === 0) throw new Error('sıfıra bölme'); v = op === '/' ? v / r : v % r }
    }
    return v
  }
  const add = (): number => {
    let v = mul()
    while (peek() === '+' || peek() === '-') { const op = s[i++]; const r = mul(); v = op === '+' ? v + r : v - r }
    return v
  }
  const cmp = (): number => {
    const v = add()
    const m = /^(<=|>=|==|<|>)/.exec(s.slice(i))
    if (!m) return v
    i += m[0].length; const r = add()
    return ({ '<': v < r, '>': v > r, '<=': v <= r, '>=': v >= r, '==': v === r } as Record<string, boolean>)[m[0]] ? 1 : 0
  }
  const v = cmp()
  if (i < s.length) throw new Error(`beklenmeyen karakter: "${s[i]}"`)
  return v
}
const fmt = (n: number): string => String(Math.round(n * 1e6) / 1e6)

// ───────── dünyalar ─────────
export type WorldId = 'hesap' | 'bilgi' | 'robot'
export interface AgentWorld { id: WorldId; label: string; kb: Readonly<Record<string, string>>; wall: number; hasRobot: boolean }
export const WORLDS: Record<WorldId, AgentWorld> = {
  hesap: { id: 'hesap', label: 'Yalnız hesap makinesi', kb: {}, wall: 0, hasRobot: false },
  bilgi: { id: 'bilgi', label: 'Bilgi tabanı + hesap makinesi', kb: AGENT_KB, wall: 0, hasRobot: false },
  robot: { id: 'robot', label: 'Sanal robot koridoru (duvar 100 cm uzakta)', kb: {}, wall: 100, hasRobot: true },
}
export const MAX_STEPS = 30
export const TOOL_DOCS: { name: string; usage: string; about: string }[] = [
  { name: 'hesapla', usage: 'hesapla(12*7)', about: 'Aritmetik ifadeyi hesaplar (+ - * / % parantez, < > == karşılaştırma 1/0 verir).' },
  { name: 'ara', usage: 'ara(üye sayısı)', about: 'Küçük bilgi tabanında arar; bulamazsa "bulunamadı" döner.' },
  { name: 'mesafe', usage: 'mesafe()', about: 'Sanal robotun önündeki duvara cm cinsinden uzaklığı.' },
  { name: 'ileri', usage: 'ileri(30)', about: 'Robotu N cm ilerletir; kalan mesafeyi döner. Duvara varırsa ÇARPAR.' },
  { name: 'dur', usage: 'dur()', about: 'Robotu durdurur; sonraki ileri() hata verir.' },
  { name: 'bitir', usage: 'bitir(6)', about: 'Ajan döngüsünü bitirir ve nihai cevabı verir.' },
]

export interface Step { n: number; line: number; call: string; tool: string; arg: string; ok: boolean; observation: string }
export interface AgentRun {
  steps: Step[]; final: string | null; finalNumber: number | null; error: string | null
  position: number; crashed: boolean; stopped: boolean; limit: boolean
}

type Ctx = { world: AgentWorld; steps: Step[]; pos: number; crashed: boolean; stopped: boolean; done: boolean; final: string | null; error: string | null; last: string; limit: boolean }

function subst(arg: string, ctx: Ctx): string {
  return arg.replace(/\$(son|\d+)/g, (_, k: string) => {
    const v = k === 'son' ? ctx.last : ctx.steps[Number(k) - 1]?.observation
    return v === undefined ? '' : v
  })
}

function callTool(name: string, raw: string, line: number, ctx: Ctx): void {
  const arg = subst(raw, ctx).trim()
  const step: Step = { n: ctx.steps.length + 1, line, call: `${name}(${raw})`, tool: name, arg, ok: true, observation: '' }
  const fail = (m: string) => { step.ok = false; step.observation = m }
  try {
    switch (name) {
      case 'hesapla': step.observation = fmt(calc(arg)); break
      case 'ara': {
        const q = trLower(arg.replace(/^["'«]|["'»]$/g, '').trim())
        const kb = ctx.world.kb
        let hit: string | undefined = kb[q]
        if (hit === undefined) {
          const qw = new Set(words(q).map(stem))
          const key = Object.keys(kb).find((k) => { const kw = words(k).map(stem); return kw.length > 0 && kw.every((x) => qw.has(x)) })
          if (key) hit = kb[key]
        }
        if (hit === undefined) fail('bulunamadı'); else step.observation = hit
        break
      }
      case 'mesafe':
        if (!ctx.world.hasRobot) fail('bu dünyada robot/sensör yok'); else step.observation = fmt(ctx.world.wall - ctx.pos)
        break
      case 'ileri': {
        if (!ctx.world.hasRobot) { fail('bu dünyada robot yok'); break }
        if (ctx.stopped) { fail('robot durduruldu'); break }
        const n = calc(arg)
        if (!(n > 0)) { fail('ileri(N): N sıfırdan büyük olmalı'); break }
        ctx.pos += n
        if (ctx.pos >= ctx.world.wall) { ctx.crashed = true; ctx.pos = ctx.world.wall; fail('ÇARPTI: robot duvara vardı'); ctx.done = true; ctx.error = 'robot duvara çarptı' }
        else step.observation = fmt(ctx.world.wall - ctx.pos)
        break
      }
      case 'dur':
        if (!ctx.world.hasRobot) fail('bu dünyada robot yok'); else { ctx.stopped = true; step.observation = 'durdu' }
        break
      case 'bitir': ctx.final = arg; step.observation = arg; ctx.done = true; break
      default: fail(`bilinmeyen araç: ${name}`)
    }
  } catch (e) { fail((e as Error).message) }
  ctx.steps.push(step)
  if (step.ok) ctx.last = step.observation
}

const CALL_RE = /^([a-zçğıöşü]+)\s*\((.*)\)$/i
function runStatements(src: string, line: number, ctx: Ctx): void {
  for (const part of src.split(';')) {
    if (ctx.done) return
    const p = part.trim(); if (!p) continue
    if (ctx.steps.length >= MAX_STEPS) { ctx.limit = true; ctx.done = true; ctx.error = `adım sınırı (${MAX_STEPS}) aşıldı`; return }
    const m = CALL_RE.exec(p)
    if (!m) { ctx.error = `satır ${line}: anlaşılamadı: "${p}"`; ctx.done = true; return }
    callTool(trLower(m[1]!), m[2]!, line, ctx)
  }
}

export function runAgent(script: string, worldId: WorldId): AgentRun {
  const ctx: Ctx = { world: WORLDS[worldId], steps: [], pos: 0, crashed: false, stopped: false, done: false, final: null, error: null, last: '', limit: false }
  const lines = script.split('\n')
  for (let li = 0; li < lines.length && !ctx.done; li++) {
    const text = lines[li]!.replace(/#.*$/, '').trim()
    if (!text) continue
    const rep = /^tekrar\s+(\d+)\s*:\s*(.+)$/i.exec(text)
    const iff = /^e[ğg]er\s+(.+?)\s*:\s*(.+)$/i.exec(text)
    if (rep) {
      const n = Math.min(Number(rep[1]), MAX_STEPS)
      for (let k = 0; k < n && !ctx.done; k++) runStatements(rep[2]!, li + 1, ctx)
    } else if (iff) {
      try {
        const cond = calc(subst(iff[1]!, ctx))
        if (cond !== 0) runStatements(iff[2]!, li + 1, ctx)
      } catch (e) { ctx.error = `satır ${li + 1}: koşul hesaplanamadı (${(e as Error).message})`; ctx.done = true }
    } else runStatements(text, li + 1, ctx)
  }
  const fn = ctx.final !== null && ctx.final !== '' && Number.isFinite(Number(ctx.final)) ? Number(ctx.final) : null
  return { steps: ctx.steps, final: ctx.final, finalNumber: fn, error: ctx.error, position: ctx.pos, crashed: ctx.crashed, stopped: ctx.stopped, limit: ctx.limit }
}

/** Hazır, BETİKLİ demo: "model adımı" metni sabit yazılmıştır, bir model üretmemiştir. */
export const DEMO_SCRIPTED = {
  world: 'bilgi' as WorldId,
  question: 'Kulüpte kaç grup olur? (üye sayısı ÷ grup büyüklüğü)',
  steps: [
    { thought: 'Üye sayısını bilmem gerek.', call: 'ara(üye sayısı)' },
    { thought: 'Grup büyüklüğünü de bilmem gerek.', call: 'ara(grup büyüklüğü)' },
    { thought: 'İki sayı elimde: böleyim.', call: 'hesapla($1/$2)' },
    { thought: 'Sonucu yazıp bitireyim.', call: 'bitir($3)' },
  ],
}
export const demoScript = (): string => DEMO_SCRIPTED.steps.map((s) => `${s.call}   # ${s.thought}`).join('\n')
