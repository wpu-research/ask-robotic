// Ajan döngüsü simülatörü. ARAÇLAR gerçekten çalışır (hesap makinesi, bilgi tabanı, robot sensörü).
// "Model adımı" ise BİR MODEL DEĞİLDİR: öğrencinin yazdığı betik (ya da hazır betikli senaryo) hangi aracı çağıracağını söyler.
// Gerçek ajanda bu kararı bir dil modeli her adımda araç sonucunu görerek verirdi.
import { AGENT_KB, AGENT_KB_EN } from './corpus'
import { lowerOf, stem, words, type ContentLang } from './text'

// İleti tablosu: 'tr' mevcut metinler (testler bunları bekler), 'en' serbest atölyenin İngilizce kipi.
const M = {
  tr: {
    empty: 'boş ifade', numExpected: (x: string) => `sayı bekleniyordu: "${x}"`, paren: '")" eksik', div0: 'sıfıra bölme', unexpected: (c: string) => `beklenmeyen karakter: "${c}"`,
    notFound: 'bulunamadı', noSensor: 'bu dünyada robot/sensör yok', noRobot: 'bu dünyada robot yok', stopped: 'robot durduruldu', positive: 'ileri(N): N sıfırdan büyük olmalı',
    crash: 'ÇARPTI: robot duvara vardı', crashErr: 'robot duvara çarptı', stoppedObs: 'durdu', unknown: (n: string) => `bilinmeyen araç: ${n}`,
    limit: (n: number) => `adım sınırı (${n}) aşıldı`, parse: (l: number, p: string) => `satır ${l}: anlaşılamadı: "${p}"`, cond: (l: number, m: string) => `satır ${l}: koşul hesaplanamadı (${m})`,
  },
  en: {
    empty: 'empty expression', numExpected: (x: string) => `number expected: "${x}"`, paren: 'missing ")"', div0: 'division by zero', unexpected: (c: string) => `unexpected character: "${c}"`,
    notFound: 'not found', noSensor: 'no robot/sensor in this world', noRobot: 'no robot in this world', stopped: 'robot is stopped', positive: 'forward(N): N must be greater than zero',
    crash: 'CRASH: the robot reached the wall', crashErr: 'the robot hit the wall', stoppedObs: 'stopped', unknown: (n: string) => `unknown tool: ${n}`,
    limit: (n: number) => `step limit (${n}) exceeded`, parse: (l: number, p: string) => `line ${l}: could not understand: "${p}"`, cond: (l: number, m: string) => `line ${l}: could not evaluate condition (${m})`,
  },
}
/** İngilizce kipte kabul edilen araç adları (iç adlar Türkçe kalır). */
export const TOOL_ALIASES_EN: Readonly<Record<string, string>> = { calc: 'hesapla', search: 'ara', distance: 'mesafe', forward: 'ileri', stop: 'dur', finish: 'bitir' }

// ───────── güvenli hesap makinesi ─────────
export function calc(src: string, lang: ContentLang = 'tr'): number {
  const msg = M[lang]
  const s = src.replace(/\s+/g, '')
  if (s === '') throw new Error(msg.empty)
  let i = 0
  const peek = () => s[i]
  const num = (): number => {
    const m = /^\d+(\.\d+)?/.exec(s.slice(i))
    if (!m) throw new Error(msg.numExpected(s.slice(i, i + 6)))
    i += m[0].length; return parseFloat(m[0])
  }
  const primary = (): number => {
    if (peek() === '(') { i++; const v = cmp(); if (peek() !== ')') throw new Error(msg.paren); i++; return v }
    return num()
  }
  const unary = (): number => { if (peek() === '-') { i++; return -unary() } return primary() }
  const mul = (): number => {
    let v = unary()
    while (peek() === '*' || peek() === '/' || peek() === '%') {
      const op = s[i++]; const r = unary()
      if (op === '*') v *= r
      else { if (r === 0) throw new Error(msg.div0); v = op === '/' ? v / r : v % r }
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
  if (i < s.length) throw new Error(msg.unexpected(s[i]!))
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
/** Dünya adlarının İngilizcesi. */
export const WORLD_LABEL_EN: Record<WorldId, string> = { hesap: 'Calculator only', bilgi: 'Knowledge base + calculator', robot: 'Virtual robot corridor (wall 100 cm away)' }
export const TOOL_DOCS: { name: string; usage: string; about: string }[] = [
  { name: 'hesapla', usage: 'hesapla(12*7)', about: 'Aritmetik ifadeyi hesaplar (+ - * / % parantez, < > == karşılaştırma 1/0 verir).' },
  { name: 'ara', usage: 'ara(üye sayısı)', about: 'Küçük bilgi tabanında arar; bulamazsa "bulunamadı" döner.' },
  { name: 'mesafe', usage: 'mesafe()', about: 'Sanal robotun önündeki duvara cm cinsinden uzaklığı.' },
  { name: 'ileri', usage: 'ileri(30)', about: 'Robotu N cm ilerletir; kalan mesafeyi döner. Duvara varırsa ÇARPAR.' },
  { name: 'dur', usage: 'dur()', about: 'Robotu durdurur; sonraki ileri() hata verir.' },
  { name: 'bitir', usage: 'bitir(6)', about: 'Ajan döngüsünü bitirir ve nihai cevabı verir.' },
]
/** TOOL_DOCS'un İngilizcesi (İngilizce adlar TOOL_ALIASES_EN ile çalışır; Türkçe adlar da geçerlidir). */
export const TOOL_DOCS_EN: Record<string, { usage: string; about: string }> = {
  hesapla: { usage: 'calc(12*7)', about: 'Evaluates an arithmetic expression (+ - * / % parentheses; < > == comparisons return 1/0).' },
  ara: { usage: 'search(member count)', about: 'Searches the small knowledge base; returns "not found" if nothing matches.' },
  mesafe: { usage: 'distance()', about: 'Distance in cm from the virtual robot to the wall in front of it.' },
  ileri: { usage: 'forward(30)', about: 'Moves the robot N cm forward and returns the remaining distance. If it reaches the wall it CRASHES.' },
  dur: { usage: 'stop()', about: 'Stops the robot; any later forward() call fails.' },
  bitir: { usage: 'finish(6)', about: 'Ends the agent loop and gives the final answer.' },
}

export interface Step { n: number; line: number; call: string; tool: string; arg: string; ok: boolean; observation: string }
export interface AgentRun {
  steps: Step[]; final: string | null; finalNumber: number | null; error: string | null
  position: number; crashed: boolean; stopped: boolean; limit: boolean
}

type Ctx = { lang: ContentLang; world: AgentWorld; steps: Step[]; pos: number; crashed: boolean; stopped: boolean; done: boolean; final: string | null; error: string | null; last: string; limit: boolean }

function subst(arg: string, ctx: Ctx): string {
  return arg.replace(/\$(son|last|\d+)/g, (whole, k: string) => {
    if (k === 'last' && ctx.lang !== 'en') return whole
    const v = k === 'son' || k === 'last' ? ctx.last : ctx.steps[Number(k) - 1]?.observation
    return v === undefined ? '' : v
  })
}

function callTool(name: string, raw: string, line: number, ctx: Ctx): void {
  const arg = subst(raw, ctx).trim()
  const step: Step = { n: ctx.steps.length + 1, line, call: `${name}(${raw})`, tool: name, arg, ok: true, observation: '' }
  const fail = (m: string) => { step.ok = false; step.observation = m }
  const msg = M[ctx.lang]
  const lang = ctx.lang
  try {
    switch (name) {
      case 'hesapla': step.observation = fmt(calc(arg, lang)); break
      case 'ara': {
        const q = lowerOf(arg.replace(/^["'«]|["'»]$/g, '').trim(), lang)
        const kb = lang === 'en' && Object.keys(ctx.world.kb).length ? { ...ctx.world.kb, ...AGENT_KB_EN } : ctx.world.kb
        let hit: string | undefined = kb[q]
        if (hit === undefined) {
          const qw = new Set(words(q, lang).map(stem))
          const key = Object.keys(kb).find((k) => { const kw = words(k, lang).map(stem); return kw.length > 0 && kw.every((x) => qw.has(x)) })
          if (key) hit = kb[key]
        }
        if (hit === undefined) fail(msg.notFound); else step.observation = hit
        break
      }
      case 'mesafe':
        if (!ctx.world.hasRobot) fail(msg.noSensor); else step.observation = fmt(ctx.world.wall - ctx.pos)
        break
      case 'ileri': {
        if (!ctx.world.hasRobot) { fail(msg.noRobot); break }
        if (ctx.stopped) { fail(msg.stopped); break }
        const n = calc(arg, lang)
        if (!(n > 0)) { fail(msg.positive); break }
        ctx.pos += n
        if (ctx.pos >= ctx.world.wall) { ctx.crashed = true; ctx.pos = ctx.world.wall; fail(msg.crash); ctx.done = true; ctx.error = msg.crashErr }
        else step.observation = fmt(ctx.world.wall - ctx.pos)
        break
      }
      case 'dur':
        if (!ctx.world.hasRobot) fail(msg.noRobot); else { ctx.stopped = true; step.observation = msg.stoppedObs }
        break
      case 'bitir': ctx.final = arg; step.observation = arg; ctx.done = true; break
      default: fail(msg.unknown(name))
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
    if (ctx.steps.length >= MAX_STEPS) { ctx.limit = true; ctx.done = true; ctx.error = M[ctx.lang].limit(MAX_STEPS); return }
    const m = CALL_RE.exec(p)
    if (!m) { ctx.error = M[ctx.lang].parse(line, p); ctx.done = true; return }
    const raw = lowerOf(m[1]!, ctx.lang)
    callTool(ctx.lang === 'en' ? (TOOL_ALIASES_EN[raw] ?? raw) : raw, m[2]!, line, ctx)
  }
}

export function runAgent(script: string, worldId: WorldId, lang: ContentLang = 'tr'): AgentRun {
  const ctx: Ctx = { lang, world: WORLDS[worldId], steps: [], pos: 0, crashed: false, stopped: false, done: false, final: null, error: null, last: '', limit: false }
  const lines = script.split('\n')
  for (let li = 0; li < lines.length && !ctx.done; li++) {
    const text = lines[li]!.replace(/#.*$/, '').trim()
    if (!text) continue
    const rep = (lang === 'en' ? /^(?:tekrar|repeat)\s+(\d+)\s*:\s*(.+)$/i : /^tekrar\s+(\d+)\s*:\s*(.+)$/i).exec(text)
    const iff = (lang === 'en' ? /^(?:e[ğg]er|if)\s+(.+?)\s*:\s*(.+)$/i : /^e[ğg]er\s+(.+?)\s*:\s*(.+)$/i).exec(text)
    if (rep) {
      const n = Math.min(Number(rep[1]), MAX_STEPS)
      for (let k = 0; k < n && !ctx.done; k++) runStatements(rep[2]!, li + 1, ctx)
    } else if (iff) {
      try {
        const cond = calc(subst(iff[1]!, ctx), lang)
        if (cond !== 0) runStatements(iff[2]!, li + 1, ctx)
      } catch (e) { ctx.error = M[lang].cond(li + 1, (e as Error).message); ctx.done = true }
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
/** Betikli demonun İngilizcesi (aynı adımlar, İngilizce araç adlarıyla; `runAgent(..., 'en')` ile çalışır). */
export const DEMO_SCRIPTED_EN = {
  world: 'bilgi' as WorldId,
  question: 'How many groups does the club have? (member count ÷ group size)',
  steps: [
    { thought: 'I need to know the member count.', call: 'search(member count)' },
    { thought: 'I also need the group size.', call: 'search(group size)' },
    { thought: 'I have both numbers: let me divide.', call: 'calc($1/$2)' },
    { thought: 'Write the result and finish.', call: 'finish($3)' },
  ],
}
export const demoScriptEn = (): string => DEMO_SCRIPTED_EN.steps.map((s) => `${s.call}   # ${s.thought}`).join('\n')
