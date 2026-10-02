// Ders etkinliği altyapısı. Bir etkinlik: giriş metni + başlangıç projesi + izinli bloklar + hedefler + çözüm (+ senaryo).
// Hedefler bildirimseldir (JSON benzeri) ve başsız çalıştırılan bir SENARYO'nun sonunda denetlenir: öğrencinin programı
// gerçekten oyunu çalıştırarak sınanır (tuş basılır, kareler ilerletilir, sprite'lar çarpıştırılır).
import { ALL_BLOCK_TYPES, BLOCK_GROUPS } from './blocks'
import type { OyunEngine, SpriteState } from './engine'
import { walkBlocks } from './project'
import { OyunSession } from './session'
import type { Button, OyunProject } from './types'

// ───────── Senaryo ─────────
export type ScenarioStep =
  | { do: 'wait'; frames: number }
  | { do: 'seconds'; s: number }
  /** Düğmeye `frames` kare basılı tutar ve bırakır (varsayılan 2). */
  | { do: 'press'; button: Button; frames?: number }
  | { do: 'tap'; button: Button }
  | { do: 'down'; button: Button }
  | { do: 'up'; button: Button }
  /** `a` türünün ilk sprite'ını `b` türünün ilk sprite'ının üstüne taşıyıp 3 kare ilerletir (çarpıştırma). */
  | { do: 'collide'; a: string; b: string }
  /** Test için sahneye sprite ekler (öğrencinin programı onu görmeden önce). */
  | { do: 'spawn'; image: string; kind: string; x?: number; y?: number }
  /** `kind` türünün ilk sprite'ını (x, y) noktasına taşır ve 1 kare ilerletir (çarpışmadan ayırmak için). */
  | { do: 'place'; kind: string; x: number; y: number }
  /** `kind` türünün ilk sprite'ını haritada (col, row) karosunun ortasına taşır ve 3 kare ilerletir (karoya dokundurmak için). */
  | { do: 'goto'; kind: string; col: number; row: number }

export const DEFAULT_SCENARIO: readonly ScenarioStep[] = [{ do: 'seconds', s: 2 }]

// ───────── Hedefler ─────────
export type Cmp = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'

export type GoalSpec =
  /** Çalışma sırasında (en çok olduğu anda) `of` türünden (verilmezse hepsinden) en az `min` / en çok `max` sprite var; `image` verilirse yalnız o resimli olanlar sayılır. */
  | { kind: 'sprites'; of?: string; image?: string; min?: number; max?: number }
  /** Sonda, `of` türünden bazı sprite'ın özelliği koşulu sağlar. prop: x, y, vx, vy, z, w, h, image, kind ya da `props.ad`. */
  | { kind: 'spriteProp'; of: string; prop: string; op: Cmp; value: number | string | boolean }
  /** Senaryo boyunca `of` türünden bir sprite başlangıç yerinden en az `min` piksel uzaklaştı (axis: 'x' | 'y' | 'any'). */
  | { kind: 'moved'; of: string; axis?: 'x' | 'y' | 'any'; min: number }
  /** Skor: 'increased' = senaryo içinde arttı; 'gte' = sonda en az `value`. */
  | { kind: 'score'; op: 'increased' | 'gte'; value?: number }
  /** Can: 'decreased' = senaryo içinde azaldı; 'lte' / 'gte' = sonda. */
  | { kind: 'life'; op: 'decreased' | 'lte' | 'gte'; value?: number }
  /** Bir harita yüklendi (isteğe bağlı en az boyut). */
  | { kind: 'map'; minCols?: number; minRows?: number }
  /** Sonda haritada `image` karosundan en az `min` / en çok `max` tane var. */
  | { kind: 'tileCount'; image: string; min?: number; max?: number }
  /** Oyun bitti (isteğe bağlı: kazanma ya da kaybetme). */
  | { kind: 'gameOver'; result?: 'win' | 'lose' }
  /** Sayaç olayı en az `min` kez oldu: overlap (çakışma), tileTouch, sound, created, destroyed, buttonPress, shake, particles, message. */
  | { kind: 'event'; name: 'overlap' | 'tileTouch' | 'sound' | 'created' | 'destroyed' | 'buttonPress' | 'shake' | 'particles' | 'message'; min?: number }
  /** Program şu blokları kullanıyor (all: hepsi, any: en az biri). Statik denetim: oyun çalışmadan da bakılır. */
  | { kind: 'usesBlocks'; types: string[]; mode?: 'all' | 'any' }
  /** Özel denetim (yalnız kodla yazılan etkinliklerde; JSON'a çevrilemez). */
  | { kind: 'custom'; test: (r: RunReport) => boolean }

export type OyunGoal = GoalSpec & { id: string; label: string; hint?: string }

// ───────── Etkinlik ─────────
export interface OyunActivity {
  id: string
  title: string
  /** Öğrenciye gösterilen kısa giriş / yönerge (düz metin; satır sonları korunur). */
  intro: string
  /** Başlangıç projesi. Her çağrıda yeni nesne döndürmelidir. */
  starter: () => OyunProject
  /** Araç kutusunda görünecek blok türleri (bkz. blocks.ts ALL_BLOCK_TYPES, BLOCK_GROUPS). */
  allowedBlocks: readonly string[]
  goals: readonly OyunGoal[]
  /** Hedeflerin tamamını sağlayan örnek çözüm (yalnız izinli blokları kullanmalıdır). */
  solution: () => OyunProject
  /** Hedefleri denetleyen çalıştırma senaryosu (verilmezse 2 sn çalıştırılır). */
  scenario?: readonly ScenarioStep[]
  /** Rastgelelik tohumu (varsayılan 1). */
  seed?: number
}

/** `allowedBlocks` yazarken kısaltma: tür adları ve grup adları ('mantik', 'dongu', 'matematik', 'metin', 'degisken', 'fonksiyon'). */
export function allow(...items: string[]): string[] {
  const out = new Set<string>()
  for (const it of items) for (const t of BLOCK_GROUPS[it] ?? [it]) out.add(t)
  return [...out]
}
export const ALL_ALLOWED: readonly string[] = ALL_BLOCK_TYPES

// ───────── Çalıştırma raporu ─────────
export interface RunReport {
  session: OyunSession
  engine: OyunEngine
  project: OyunProject
  /** Senaryonun başında (oyun başladıktan sonra) skor ve can. */
  startScore: number
  startLife: number
  minLife: number
  maxScore: number
  /** Tür başına, senaryo sırasında görülen en çok sprite; resim başına da. */
  peakByKind: Record<string, number>
  peakByImage: Record<string, number>
  peakTotal: number
  /** Tür başına bir sprite'ın başlangıç yerinden en büyük sapma (x, y, uzaklık). */
  moved: Record<string, { x: number; y: number; any: number }>
  blocksUsed: Set<string>
  error: string | null
}

export interface GoalResult { id: string; label: string; hint?: string; ok: boolean; detail?: string }
export interface GoalEvaluation { results: GoalResult[]; allPassed: boolean; error: string | null; report: RunReport }

function cmpOp(a: number | string | boolean, op: Cmp, b: number | string | boolean): boolean {
  switch (op) {
    case 'eq': return a === b
    case 'neq': return a !== b
    case 'gt': return a > b
    case 'gte': return a >= b
    case 'lt': return a < b
    case 'lte': return a <= b
  }
}

function propOf(s: SpriteState, prop: string): number | string | boolean | undefined {
  if (prop.startsWith('props.')) return s.props[prop.slice(6)]
  switch (prop) {
    case 'x': case 'y': case 'vx': case 'vy': case 'z': case 'w': case 'h': return s[prop]
    case 'image': return s.image
    case 'kind': return s.kind
    case 'life': return s.lifeMs ?? 0
    default: return undefined
  }
}

const matchKind = (s: SpriteState, kind?: string): boolean => !kind || kind === 'hepsi' || s.kind === kind

/** Hedefi çalışma raporuna göre denetler. */
export function checkGoal(g: OyunGoal, r: RunReport): { ok: boolean; detail?: string } {
  const e = r.engine
  const needsRun = g.kind !== 'usesBlocks'
  if (needsRun && r.error) return { ok: false, detail: 'Program hata verdi.' }
  switch (g.kind) {
    case 'sprites': {
      const n = g.image ? (r.peakByImage[g.image] ?? 0) : !g.of || g.of === 'hepsi' ? r.peakTotal : (r.peakByKind[g.of] ?? 0)
      return { ok: n >= (g.min ?? 0) && n <= (g.max ?? Infinity), detail: `${n} sprite` }
    }
    case 'spriteProp': {
      const list = e.sprites.filter((s) => matchKind(s, g.of))
      return { ok: list.some((s) => { const v = propOf(s, g.prop); return v !== undefined && cmpOp(v, g.op, g.value) }) }
    }
    case 'moved': {
      const m = r.moved[g.of]
      const d = m ? (g.axis === 'x' ? m.x : g.axis === 'y' ? m.y : m.any) : 0
      return { ok: d >= g.min, detail: `${Math.round(d)} px` }
    }
    case 'score': return g.op === 'increased' ? { ok: r.maxScore > r.startScore } : { ok: e.score >= (g.value ?? 0) || r.maxScore >= (g.value ?? 0), detail: `skor ${r.maxScore}` }
    case 'life':
      if (g.op === 'decreased') return { ok: r.minLife < r.startLife }
      return g.op === 'lte' ? { ok: e.life <= (g.value ?? 0) } : { ok: e.life >= (g.value ?? 0) }
    case 'map': return { ok: !!e.map && e.map.cols >= (g.minCols ?? 1) && e.map.rows >= (g.minRows ?? 1) }
    case 'tileCount': { const n = e.countTiles(g.image); return { ok: n >= (g.min ?? 0) && n <= (g.max ?? Infinity), detail: `${n} karo` } }
    case 'gameOver': return { ok: e.state === 'over' && (!g.result || e.result === g.result) }
    case 'event': {
      const st = e.stats
      const n = { overlap: st.overlaps, tileTouch: st.tileTouches, sound: e.sounds.length, created: st.created, destroyed: st.destroyed, buttonPress: st.buttonPresses, message: st.messages, shake: st.shakes, particles: st.bursts }[g.name]
      return { ok: n >= (g.min ?? 1) }
    }
    case 'usesBlocks': return { ok: g.mode === 'any' ? g.types.some((t) => r.blocksUsed.has(t)) : g.types.every((t) => r.blocksUsed.has(t)) }
    case 'custom': return { ok: !!g.test(r) }
  }
}

// ───────── Senaryo çalıştırıcı ─────────
export function usedBlockTypes(p: OyunProject): Set<string> {
  const out = new Set<string>()
  walkBlocks(p.blocks, (b) => { if (b.enabled !== false) out.add(b.type) })
  return out
}

/** Projeyi senaryoyla başsız çalıştırır ve raporu döndürür (hedef denetimi yapmaz). */
export function runScenario(project: OyunProject, scenario: readonly ScenarioStep[] = DEFAULT_SCENARIO, seed = 1): RunReport {
  const session = new OyunSession(project, { seed })
  const engine = session.engine
  session.start()
  const rep: RunReport = {
    session, engine, project, startScore: engine.score, startLife: engine.life, minLife: engine.life, maxScore: engine.score,
    peakByKind: {}, peakByImage: {}, peakTotal: 0, moved: {}, blocksUsed: usedBlockTypes(project), error: null,
  }
  const origin = new Map<number, { x: number; y: number }>()

  const sample = (): void => {
    const byKind: Record<string, number> = {}, byImage: Record<string, number> = {}
    for (const s of engine.sprites) {
      byKind[s.kind] = (byKind[s.kind] ?? 0) + 1
      byImage[s.image] = (byImage[s.image] ?? 0) + 1
      const o = origin.get(s.id) ?? (origin.set(s.id, { x: s.x, y: s.y }), { x: s.x, y: s.y })
      const m = rep.moved[s.kind] ??= { x: 0, y: 0, any: 0 }
      m.x = Math.max(m.x, Math.abs(s.x - o.x)); m.y = Math.max(m.y, Math.abs(s.y - o.y)); m.any = Math.max(m.any, Math.hypot(s.x - o.x, s.y - o.y))
    }
    for (const [k, n] of Object.entries(byKind)) if (n > (rep.peakByKind[k] ?? 0)) rep.peakByKind[k] = n
    for (const [k, n] of Object.entries(byImage)) if (n > (rep.peakByImage[k] ?? 0)) rep.peakByImage[k] = n
    if (engine.sprites.length > rep.peakTotal) rep.peakTotal = engine.sprites.length
    if (engine.life < rep.minLife) rep.minLife = engine.life
    if (engine.score > rep.maxScore) rep.maxScore = engine.score
  }
  const tick = (n: number): void => { for (let i = 0; i < n && !engine.error; i++) { engine.tick(); sample() } }
  sample()
  tick(1)
  rep.startScore = engine.score
  rep.startLife = engine.life
  rep.minLife = engine.life
  rep.maxScore = engine.score

  for (const st of scenario) {
    if (engine.error) break
    switch (st.do) {
      case 'wait': tick(st.frames); break
      case 'seconds': tick(Math.round(st.s * 60)); break
      case 'press': engine.press(st.button); tick(st.frames ?? 2); engine.release(st.button); tick(1); break
      case 'tap': engine.press(st.button); tick(2); engine.release(st.button); tick(1); break
      case 'down': engine.press(st.button); tick(1); break
      case 'up': engine.release(st.button); tick(1); break
      case 'collide': {
        const a = engine.spritesOfKind(st.a)[0], b = engine.spritesOfKind(st.b).find((s) => s !== a)
        if (a && b) { a.x = b.x; a.y = b.y }
        tick(3)
        break
      }
      case 'place': { const a = engine.spritesOfKind(st.kind)[0]; if (a) { a.x = st.x; a.y = st.y } tick(1); break }
      case 'goto': { const a = engine.spritesOfKind(st.kind)[0]; if (a) engine.placeOnTile(a, st.col, st.row); tick(3); break }
      case 'spawn': if (engine.imageExists(st.image)) engine.createSprite(st.image, st.kind, st.x ?? 80, st.y ?? 60); tick(1); break
    }
  }
  engine.releaseAll()
  rep.error = engine.error?.message ?? null
  return rep
}

/** Hedefleri denetler: projeyi senaryoyla çalıştırır ve her hedef için sonuç verir. */
export function evaluateGoals(activity: Pick<OyunActivity, 'goals' | 'scenario' | 'seed'>, project: OyunProject): GoalEvaluation {
  const report = runScenario(project, activity.scenario ?? DEFAULT_SCENARIO, activity.seed ?? 1)
  const results = activity.goals.map((g) => {
    const c = checkGoal(g, report)
    return { id: g.id, label: g.label, hint: g.hint, ok: c.ok, detail: c.detail }
  })
  return { results, allPassed: results.every((x) => x.ok), error: report.error, report }
}

/** Projede izinli olmayan blok kullanılmış mı? (Çözümün ve öğrencinin işinin denetimi için.) */
export function disallowedBlocks(project: OyunProject, allowed: readonly string[]): string[] {
  const ok = new Set<string>([...allowed, 'oyun_resim', 'oyun_harita'])
  return [...usedBlockTypes(project)].filter((t) => !ok.has(t))
}
