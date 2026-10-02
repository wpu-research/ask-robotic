// Ders etkinliği altyapısı. Bir etkinlik: giriş metni + başlangıç projesi + izinli bloklar + hedefler + çözüm (+ senaryo).
// Hedefler bildirimseldir ve başsız çalıştırılan bir SENARYO'nun sonunda denetlenir: öğrencinin programı gerçekten çalıştırılır
// (tuşa basılır, sprite'a tıklanır, kareler ilerletilir) ve sonuç bakılır. Bazı hedefler yalnız programa bakar ("statik").
import { HAT_TYPES, typesUsed } from './blocks'
import { toNum, toStr, type Value } from './engine'
import { walkBlocks, targetsOf } from './project'
import { SahneSession } from './session'
import type { BlockNode, SahneProject } from './types'

// ───────── Senaryo ─────────
export type ScenarioStep =
  | { do: 'flag' }
  | { do: 'wait'; frames: number }
  | { do: 'seconds'; s: number }
  /** Tuşa `frames` kare basılı tutar ve bırakır (varsayılan 3). */
  | { do: 'key'; key: string; frames?: number }
  | { do: 'down'; key: string }
  | { do: 'up'; key: string }
  /** Sprite'a (kimlik ya da ad) tıklar; verilmezse her sprite'a sırayla tıklar. */
  | { do: 'click'; sprite?: string }
  | { do: 'mouse'; x: number; y: number; down?: boolean }
  /** Sprite'ı (x, y) noktasına ışınlar ve 1 kare ilerletir (öğrencinin programı görmeden önce). */
  | { do: 'place'; sprite: string; x: number; y: number }
  /** `b` sprite'ını `a` sprite'ının üstüne taşır ve `frames` (3) kare ilerletir (çarpıştırma). */
  | { do: 'collide'; a: string; b: string; frames?: number }
  | { do: 'setVar'; name: string; value: Value }
  | { do: 'answer'; text: string }
  /** Soru sorulunca cevabı üretir (kalıcı; bir sonraki `autoAnswer` değiştirir). */
  | { do: 'autoAnswer'; fn: (question: string, s: SahneSession) => string }
  /** Şu anki değişkenleri ve sprite konumlarını bir ad altında saklar (hedeflerde `at:` ile okunur). */
  | { do: 'checkpoint'; name: string }
  /** Programdaki her "tuşuna basılınca" başlığının tuşuna sırayla basar (öğrenci hangi tuşları seçtiyse). */
  | { do: 'hatKeys' }
  | { do: 'stop' }

export const DEFAULT_SCENARIO: readonly ScenarioStep[] = [{ do: 'seconds', s: 3 }]

// ───────── Hedefler ─────────
export type Cmp = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
export type SpriteProp = 'x' | 'y' | 'dir' | 'size' | 'visible' | 'costume'

export type GoalSpec =
  // statik (programa bakar)
  /** Program bu blokları kullanıyor (mode: all = hepsi, any = en az biri; sprite: yalnız o sprite). */
  | { kind: 'usesBlocks'; types: string[]; mode?: 'all' | 'any'; sprite?: string }
  /** Programda en az `min` farklı blok türü var (sayı/metin/değişken gölgeleri sayılmaz). */
  | { kind: 'distinctBlocks'; min: number }
  /** Sprite sayısı. */
  | { kind: 'sprites'; min?: number; max?: number }
  /** (Belirtilen ya da herhangi bir) sprite'ın kostüm sayısı. */
  | { kind: 'costumes'; sprite?: string; min: number }
  | { kind: 'backdrops'; min: number }
  /** Gövdesi dolu bir başlık betiği olan sprite (ya da sahne) sayısı. */
  | { kind: 'scripted'; min: number }
  /** `type` başlığı en az `min` tane; `distinct` verilirse bu alandaki farklı değer sayısı da en az `min`. */
  | { kind: 'hats'; type: string; min: number; distinct?: string }
  /** Değişken (`list: true` ise liste) tanımlı; liste için en az `minItems` öğe (başlangıç içeriği ya da çalışma sırasındaki en büyük uzunluk). */
  | { kind: 'defined'; name: string; list?: boolean; minItems?: number }
  /** "Bloklarım": en az `min` kendi blok tanımı ve toplam `calls` çağrı. */
  | { kind: 'procs'; min: number; calls?: number; withParam?: boolean }
  /** Proje notları (plan, nasıl oynanır) en az `minChars` karakter. */
  | { kind: 'notes'; minChars: number }
  /** Proje adı varsayılandan farklı. */
  | { kind: 'named' }
  // dinamik (senaryoyu çalıştırır)
  /** Senaryo sonunda sprite özelliği koşulu sağlar (`at`: bir kontrol noktasında). */
  | { kind: 'prop'; sprite: string; prop: SpriteProp; op: Cmp; value: number | boolean; at?: string }
  /** Senaryo boyunca sprite ('*': herhangi biri) başlangıç yerinden en az `min` birim uzaklaştı (dir: yalnız artı/eksi yön). */
  | { kind: 'moved'; sprite: string; axis?: 'x' | 'y' | 'any'; dir?: 'pos' | 'neg'; min: number }
  /** Değişken değeri koşulu sağlar (sonda ya da `at` kontrol noktasında). */
  | { kind: 'var'; name: string; op: Cmp; value: number | string; at?: string }
  /** Sayaç olayı en az `min` kez oldu (`of`: yalnız bu sprite). `distinct`: en az bu kadar farklı ayrıntı (ör. farklı ses). Adlar: say, sound, costume, backdrop, broadcast, clone, cloneDelete, pen, ask, effect, size, show, hide. */
  | { kind: 'event'; name: string; min?: number; of?: string; distinct?: number }
  /** Konuşma: en az `minLines` satır, `minSpeakers` farklı konuşmacı, istenirse konuşmalar üst üste binmez. */
  | { kind: 'dialogue'; minLines: number; minSpeakers?: number; noOverlap?: boolean }
  /** Aynı anda en çok bu kadar klon yaşadı. */
  | { kind: 'clonesPeak'; min: number }
  /** Bir uç noktasından (başlangıç yönüne göre) en az `min` farklı x değeri görüldü (klonların dağılımı). */
  | { kind: 'spread'; axis: 'x' | 'y'; min: number }
  /** Program hata vermeden çalıştı. */
  | { kind: 'noError' }
  /** Özel denetim (yalnız kodla yazılan etkinliklerde). */
  | { kind: 'custom'; test: (r: RunReport) => boolean }

export type SahneGoal = GoalSpec & { id: string; label: string; hint?: string; optional?: boolean }

export interface SahneActivity {
  id: string
  title: string
  /** Öğrenciye gösterilen kısa giriş / yönerge. */
  intro: string
  /** Başlangıç projesi. Her çağrıda yeni nesne döndürmelidir. */
  starter: () => SahneProject
  /** Araç kutusunda görünecek blok türleri / grupları (bkz. blocks.ts `allow`). */
  allowedBlocks: readonly string[]
  goals: readonly SahneGoal[]
  /** Hedeflerin tamamını sağlayan örnek çözüm (yalnız izinli blokları kullanmalıdır). */
  solution: () => SahneProject
  /** Hedefleri denetleyen çalıştırma senaryosu (verilmezse 3 sn çalıştırılır). */
  scenario?: readonly ScenarioStep[]
  seed?: number
}

// ───────── Çalıştırma raporu ─────────
export interface Checkpoint { vars: Record<string, Value>; sprites: Record<string, { x: number; y: number; dir: number; size: number; visible: boolean; costume: number }> }
export interface Travel { x0: number; y0: number; minX: number; maxX: number; minY: number; maxY: number; xs: Set<number>; ys: Set<number> }

export interface RunReport {
  session: SahneSession
  project: SahneProject
  checkpoints: Record<string, Checkpoint>
  peakClones: number
  /** Her sprite (kimlik) için başlangıç ve en uç konumlar; klonlar kendi tanım kimliği altında toplanır. */
  travel: Record<string, Travel>
  maxListLen: Record<string, number>
  error: string | null
}

export interface GoalResult { id: string; label: string; hint?: string; ok: boolean; optional?: boolean; detail?: string }
export interface GoalEvaluation { results: GoalResult[]; allPassed: boolean; error: string | null; report: RunReport }

const cmp = (a: number, op: Cmp, b: number): boolean => {
  switch (op) {
    case 'eq': return Math.abs(a - b) < 1e-6
    case 'neq': return Math.abs(a - b) >= 1e-6
    case 'gt': return a > b
    case 'gte': return a >= b
    case 'lt': return a < b
    case 'lte': return a <= b
  }
}

const snapshot = (s: SahneSession): Checkpoint => {
  const vars: Record<string, Value> = {}
  for (const v of s.project.variables) if (v.type === '') vars[v.name] = s.engine.getVar(v.id)
  const sprites: Checkpoint['sprites'] = {}
  for (const t of s.engine.targets) if (!t.isClone) sprites[t.defId] = { x: t.x, y: t.y, dir: t.dir, size: t.size, visible: t.visible, costume: t.costume }
  return { vars, sprites }
}

/** Senaryoyu yeni bir oturumda çalıştırır ve rapor üretir. */
export function runScenario(project: SahneProject, scenario: readonly ScenarioStep[] = DEFAULT_SCENARIO, seed = 1): RunReport {
  const s = new SahneSession(project, { seed })
  const rep: RunReport = { session: s, project, checkpoints: {}, peakClones: 0, travel: {}, maxListLen: {}, error: null }
  for (const t of s.engine.targets) rep.travel[t.defId] = { x0: t.x, y0: t.y, minX: t.x, maxX: t.x, minY: t.y, maxY: t.y, xs: new Set([Math.round(t.x)]), ys: new Set([Math.round(t.y)]) }
  for (const v of project.variables) if (v.type === 'List') rep.maxListLen[v.id] = v.items.length
  const step = (n: number): void => {
    for (let i = 0; i < n && !s.error; i++) {
      s.tick(1)
      rep.peakClones = Math.max(rep.peakClones, s.engine.cloneCount)
      for (const t of s.engine.targets) {
        const tr = rep.travel[t.defId]
        if (!tr) continue
        tr.minX = Math.min(tr.minX, t.x); tr.maxX = Math.max(tr.maxX, t.x); tr.minY = Math.min(tr.minY, t.y); tr.maxY = Math.max(tr.maxY, t.y)
        if (t.isClone && tr.xs.size < 400) { tr.xs.add(Math.round(t.x)); tr.ys.add(Math.round(t.y)) }
      }
      for (const id of Object.keys(rep.maxListLen)) rep.maxListLen[id] = Math.max(rep.maxListLen[id], s.engine.lists.get(id)?.length ?? 0)
    }
  }
  s.flag()
  for (const st of scenario) {
    if (s.error) break
    switch (st.do) {
      case 'flag': s.flag(); break
      case 'wait': step(st.frames); break
      case 'seconds': step(Math.round(st.s * 30)); break
      case 'key': s.press(st.key); step(st.frames ?? 3); s.release(st.key); break
      case 'down': s.press(st.key); step(1); break
      case 'up': s.release(st.key); step(1); break
      case 'click':
        if (st.sprite) { s.click(st.sprite) } else for (const t of s.engine.targets.filter((x) => !x.isClone)) { s.interp.click(t); step(2) }
        step(1)
        break
      case 'mouse': s.moveMouse(st.x, st.y); s.mouseDown(!!st.down); step(1); break
      case 'place': { const t = s.sprite(st.sprite); if (t) { s.engine.setXY(t, st.x, st.y); step(1) } break }
      case 'collide': {
        const a = s.sprite(st.a), b = s.sprite(st.b)
        if (a && b) { s.engine.setXY(b, a.x, a.y); step(st.frames ?? 3) }
        break
      }
      case 'setVar': { const id = s.engine.idOf(st.name); if (id) s.engine.setVar(id, st.value); break }
      case 'answer': s.answer(st.text); step(2); break
      case 'autoAnswer': s.autoAnswer = st.fn; break
      case 'checkpoint': rep.checkpoints[st.name] = snapshot(s); break
      case 'hatKeys': {
        const keys = new Set<string>()
        for (const t of targetsOf(project)) walkBlocks(t.def.blocks, (b) => { if (b.type === 'sh_when_key') keys.add(String(b.fields?.K ?? '')) })
        for (const k of keys) { if (!k) continue; s.press(k); step(3); s.release(k); step(2) }
        break
      }
      case 'stop': s.stop(); step(1); break
    }
  }
  rep.error = s.error?.message ?? null
  return rep
}

// ───────── Hedef denetimi ─────────
const defsWithBlocks = (p: SahneProject, sprite?: string) => targetsOf(p).filter((t) => !sprite || t.id === sprite)
const usedTypes = (p: SahneProject, sprite?: string): Set<string> => {
  const out = new Set<string>()
  for (const t of defsWithBlocks(p, sprite)) for (const x of typesUsed(t.def.blocks)) out.add(x)
  return out
}
const NOT_BLOCKS = new Set(['math_number', 'text', 'variables_get', 'sh_arg'])

function hatNodes(p: SahneProject, type: string): BlockNode[] {
  const out: BlockNode[] = []
  for (const t of targetsOf(p)) for (const b of t.def.blocks.blocks?.blocks ?? []) if (b.type === type && b.next?.block) out.push(b)
  return out
}

function spriteVal(r: RunReport, id: string, prop: SpriteProp, at?: string): number | undefined {
  const t = r.session.sprite(id)
  const snap = at ? r.checkpoints[at]?.sprites[t?.defId ?? id] : undefined
  const src = snap ?? (t ? { x: t.x, y: t.y, dir: t.dir, size: t.size, visible: t.visible, costume: t.costume } : undefined)
  if (!src) return undefined
  return prop === 'visible' ? (src.visible ? 1 : 0) : (src[prop] as number)
}

/** Hedefi çalışma raporuna göre denetler. */
export function checkGoal(g: SahneGoal, r: RunReport): { ok: boolean; detail?: string } {
  const p = r.project
  const s = r.session
  const dynamic = !['usesBlocks', 'distinctBlocks', 'sprites', 'costumes', 'backdrops', 'scripted', 'hats', 'defined', 'procs', 'notes', 'named'].includes(g.kind)
  if (dynamic && r.error) return { ok: false, detail: 'Program hata verdi.' }
  switch (g.kind) {
    case 'usesBlocks': {
      const used = usedTypes(p, g.sprite)
      const n = g.types.filter((t) => used.has(t)).length
      return { ok: g.mode === 'any' ? n > 0 : n === g.types.length }
    }
    case 'distinctBlocks': {
      const n = [...usedTypes(p)].filter((t) => !NOT_BLOCKS.has(t)).length
      return { ok: n >= g.min, detail: `${n} farklı blok` }
    }
    case 'sprites': { const n = p.sprites.length; return { ok: n >= (g.min ?? 0) && n <= (g.max ?? Infinity), detail: `${n} sprite` } }
    case 'costumes': {
      const list = g.sprite ? p.sprites.filter((x) => x.id === g.sprite) : p.sprites
      return { ok: list.some((x) => x.costumes.length >= g.min) }
    }
    case 'backdrops': return { ok: p.stage.backdrops.length >= g.min }
    case 'scripted': {
      let n = 0
      for (const t of targetsOf(p)) if ((t.def.blocks.blocks?.blocks ?? []).some((b) => HAT_TYPES.includes(b.type) && b.next?.block)) n++
      return { ok: n >= g.min, detail: `${n} betikli` }
    }
    case 'hats': {
      const nodes = hatNodes(p, g.type)
      if (nodes.length < g.min) return { ok: false, detail: `${nodes.length} tane` }
      if (g.distinct) { const set = new Set(nodes.map((b) => String(b.fields?.[g.distinct!] ?? ''))); return { ok: set.size >= g.min, detail: `${set.size} farklı` } }
      return { ok: true }
    }
    case 'defined': {
      const v = p.variables.find((x) => x.name === g.name && (g.list ? x.type === 'List' : x.type === ''))
      if (!v) return { ok: false }
      if (g.minItems !== undefined) { const n = Math.max(v.items.length, r.maxListLen[v.id] ?? 0); return { ok: n >= g.minItems, detail: `${n} öğe` } }
      return { ok: true }
    }
    case 'procs': {
      const all = [...p.sprites.flatMap((x) => x.procs), ...p.stage.procs]
      if (all.length < g.min) return { ok: false, detail: `${all.length} blok tanımı` }
      if (g.withParam && !all.some((x) => x.params.length > 0)) return { ok: false }
      let calls = 0
      for (const t of targetsOf(p)) walkBlocks(t.def.blocks, (b) => { if (b.type.startsWith('sh_call_')) calls++ })
      return { ok: calls >= (g.calls ?? 0), detail: `${calls} çağrı` }
    }
    case 'notes': return { ok: p.notes.trim().length >= g.minChars, detail: `${p.notes.trim().length} karakter` }
    case 'named': return { ok: p.name.trim() !== '' && p.name.trim().toLowerCase() !== 'projem' }
    case 'prop': {
      const v = spriteVal(r, g.sprite, g.prop, g.at)
      if (v === undefined) return { ok: false, detail: 'Sprite bulunamadı.' }
      return { ok: cmp(v, g.op, typeof g.value === 'boolean' ? (g.value ? 1 : 0) : g.value), detail: String(Math.round(v * 100) / 100) }
    }
    case 'moved': {
      const t = g.sprite === '*' ? undefined : s.sprite(g.sprite)
      const trs = g.sprite === '*' ? Object.values(r.travel) : r.travel[t?.defId ?? g.sprite] ? [r.travel[t?.defId ?? g.sprite]] : []
      if (!trs.length) return { ok: false, detail: 'Sprite bulunamadı.' }
      const dist = (tr: Travel): number => {
        const dx = g.dir === 'neg' ? tr.x0 - tr.minX : g.dir === 'pos' ? tr.maxX - tr.x0 : Math.max(tr.maxX - tr.x0, tr.x0 - tr.minX)
        const dy = g.dir === 'neg' ? tr.y0 - tr.minY : g.dir === 'pos' ? tr.maxY - tr.y0 : Math.max(tr.maxY - tr.y0, tr.y0 - tr.minY)
        return g.axis === 'x' ? dx : g.axis === 'y' ? dy : Math.hypot(dx, dy)
      }
      const d = Math.max(...trs.map(dist))
      return { ok: d >= g.min, detail: `${Math.round(d)} birim` }
    }
    case 'var': {
      const cur = g.at ? r.checkpoints[g.at]?.vars[g.name] : s.variable(g.name)
      if (cur === undefined) return { ok: false, detail: 'Değişken yok.' }
      if (typeof g.value === 'string') return { ok: g.op === 'neq' ? toStr(cur).toLowerCase() !== g.value.toLowerCase() : toStr(cur).toLowerCase() === g.value.toLowerCase(), detail: toStr(cur) }
      return { ok: cmp(toNum(cur), g.op, g.value), detail: toStr(cur) }
    }
    case 'event': {
      const evs = s.engine.events.filter((e) => e.kind === g.name && (!g.of || e.target === s.sprite(g.of)?.defId || e.target === g.of))
      if (evs.length < (g.min ?? 1)) return { ok: false, detail: `${evs.length} kez` }
      if (g.distinct) { const n = new Set(evs.map((e) => e.detail ?? '')).size; return { ok: n >= g.distinct, detail: `${n} farklı` } }
      return { ok: true, detail: `${evs.length} kez` }
    }
    case 'dialogue': {
      const log = s.engine.sayLog.filter((x) => x.text.trim() !== '')
      if (log.length < g.minLines) return { ok: false, detail: `${log.length} satır` }
      if (new Set(log.map((x) => x.defId)).size < (g.minSpeakers ?? 1)) return { ok: false, detail: 'Tek kişi konuşuyor.' }
      if (g.noOverlap) {
        const end = s.engine.time
        const iv = log.map((x) => [x.start, x.end ?? end] as const).sort((a, b) => a[0] - b[0])
        for (let i = 1; i < iv.length; i++) if (iv[i][0] < iv[i - 1][1] - 1) return { ok: false, detail: 'Konuşmalar üst üste biniyor.' }
      }
      return { ok: true, detail: `${log.length} satır` }
    }
    case 'clonesPeak': return { ok: r.peakClones >= g.min, detail: `en çok ${r.peakClones} klon` }
    case 'spread': {
      const best = Math.max(0, ...Object.values(r.travel).map((tr) => (g.axis === 'x' ? tr.xs.size : tr.ys.size)))
      return { ok: best >= g.min, detail: `${best} farklı konum` }
    }
    case 'noError': return { ok: !r.error }
    case 'custom': return { ok: !!g.test(r) }
  }
}

/** Etkinliğin hedeflerini projeye karşı denetler (senaryoyu çalıştırır). */
export function evaluateGoals(a: SahneActivity, project: SahneProject): GoalEvaluation {
  const report = runScenario(project, a.scenario ?? DEFAULT_SCENARIO, a.seed ?? 1)
  const results: GoalResult[] = a.goals.map((g) => {
    let r: { ok: boolean; detail?: string }
    try { r = checkGoal(g, report) } catch { r = { ok: false, detail: 'Denetlenemedi.' } }
    return { id: g.id, label: g.label, hint: g.hint, ok: r.ok, optional: g.optional, detail: r.detail }
  })
  return { results, allPassed: results.filter((x) => !x.optional).every((x) => x.ok), error: report.error, report }
}

