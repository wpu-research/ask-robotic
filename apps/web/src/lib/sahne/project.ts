// Proje modeli: kurucular, doğrulama (içe aktarma), localStorage, dışa aktarma, ad/kimlik yardımcıları. Saf TS (DOM yalnız kayıtta, korumalı).
import { ARG_BLOCK, BLOCK_BY_TYPE, PROC_CALL_PREFIX, PROC_DEF_PREFIX, VAR_GET } from './blocks'
import { emptyProgram, vid } from './dsl'
import { BACKDROP_BY_ID } from './gallery/backdrops'
import { CHARACTER_BY_ID } from './gallery/characters'
import { SOUND_BY_ID, makeSound } from './sounds'
import { MAX_COSTUMES, MAX_SPRITES, type BlockNode, type BlockState, type Costume, type ProcDef, type SahneProject, type Shape, type SoundRef, type SpriteDef, type StageDef, type VarDef } from './types'

export const PROJECT_STORAGE_KEY = 'ask:sahne:project:v1'
export const MAX_PROJECT_BYTES = 3_000_000

let counter = 0
/** Kısa benzersiz kimlik (kostüm, sprite, blok tanımı). */
export const newId = (prefix: string): string => `${prefix}${Date.now().toString(36).slice(-4)}${(++counter).toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`

export const slugify = (s: string, fallback = 'proje'): string => {
  const x = s.toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return x || fallback
}

export const cloneCostume = (c: Costume, id?: string, name?: string): Costume => ({ ...c, id: id ?? c.id, name: name ?? c.name, shapes: c.shapes.map((s) => ({ ...s, ...('pts' in s ? { pts: [...s.pts] } : {}) }) as Shape) })

export interface SpriteOpts { id?: string; name?: string; x?: number; y?: number; dir?: number; size?: number; visible?: boolean; sounds?: SoundRef[]; blocks?: BlockState; procs?: ProcDef[] }

/** Galeri karakterinden sprite. */
export function spriteFromGallery(charId: string, o: SpriteOpts = {}): SpriteDef {
  const ch = CHARACTER_BY_ID[charId]
  if (!ch) throw new Error(`Galeride '${charId}' karakteri yok.`)
  return spriteFromCostumes(ch.costumes.map((c) => cloneCostume(c)), { name: ch.name, ...o })
}
export function spriteFromCostumes(costumes: Costume[], o: SpriteOpts = {}): SpriteDef {
  return {
    id: o.id ?? newId('s'), name: o.name ?? 'Sprite', costumes, costume: 0, sounds: o.sounds ?? [], x: o.x ?? 0, y: o.y ?? 0, dir: o.dir ?? 90, size: o.size ?? 100,
    visible: o.visible ?? true, rotationStyle: 'all', procs: o.procs ?? [], blocks: o.blocks ?? emptyProgram(),
  }
}
export function backdropFromGallery(id: string): Costume {
  const c = BACKDROP_BY_ID[id]
  if (!c) throw new Error(`Galeride '${id}' arka planı yok.`)
  return cloneCostume(c)
}
export function emptyCostume(name: string, w = 96, h = 96): Costume { return { id: newId('c'), name, w, h, shapes: [] } }

export function emptyStage(backdropId = 'beyaz'): StageDef {
  return { backdrops: [backdropFromGallery(backdropId)], backdrop: 0, sounds: [], procs: [], blocks: emptyProgram() }
}
export function newProject(name = 'Projem'): SahneProject {
  return { version: 1, name, notes: '', stage: emptyStage(), sprites: [], variables: [], messages: [] }
}
/** Serbest atölyenin başlangıcı: tek sprite, boş betik. */
export function starterProject(): SahneProject {
  const p = newProject('Projem')
  p.sprites = [spriteFromGallery('kedi', { id: 'sprite1', name: 'Kedi', sounds: [makeSound('miyav')] })]
  return p
}

export const makeVar = (name: string, o: Partial<VarDef> = {}): VarDef => ({ id: vid(name), name, type: '', value: 0, items: [], visible: true, ...o })
export const makeList = (name: string, items: string[] = [], o: Partial<VarDef> = {}): VarDef => ({ id: vid(name), name, type: 'List', value: 0, items, visible: true, ...o })

// ───────── tarama yardımcıları ─────────
export function walkBlocks(state: BlockState | undefined, fn: (b: BlockNode) => void): void {
  const walk = (n: BlockNode | undefined): void => {
    for (let b = n; b; b = b.next?.block ?? b.next?.shadow) {
      fn(b)
      for (const i of Object.values(b.inputs ?? {})) { walk(i.block); walk(i.shadow) }
    }
  }
  for (const t of state?.blocks?.blocks ?? []) walk(t)
}

export const targetsOf = (p: SahneProject): { id: string; def: StageDef | SpriteDef }[] => [{ id: 'stage', def: p.stage }, ...p.sprites.map((s) => ({ id: s.id, def: s }))]

/** Projedeki tüm yayın mesajları (elle eklenenler + bloklarda kullanılanlar). */
export function allMessages(p: SahneProject): string[] {
  const set = new Set<string>(p.messages)
  for (const t of targetsOf(p)) walkBlocks(t.def.blocks, (b) => { if (b.type === 'sh_broadcast' || b.type === 'sh_broadcast_wait' || b.type === 'sh_when_msg') { const m = String(b.fields?.M ?? ''); if (m) set.add(m) } })
  return [...set]
}

/** Bir hedefin kostüm adı değişince bloklardaki başvuruları günceller. */
export function renameCostumeRefs(state: BlockState, kind: 'costume' | 'backdrop' | 'sound', from: string, to: string): BlockState {
  const copy = JSON.parse(JSON.stringify(state)) as BlockState
  const types: Record<string, string[]> = { costume: ['sh_costume:C'], backdrop: ['sh_backdrop:B', 'sh_when_backdrop:B'], sound: ['sh_play:S', 'sh_play_until:S'] }
  walkBlocks(copy, (b) => {
    for (const spec of types[kind]) { const [t, f] = spec.split(':'); if (b.type === t && b.fields?.[f] === from) b.fields[f] = to }
  })
  return copy
}

/** Blok durumunu hedefin değişken listesiyle birleştirir (Blockly yüklemesi için). */
export function stateWithVariables(state: BlockState, vars: VarDef[]): BlockState {
  return { ...state, variables: vars.map((v) => ({ name: v.name, id: v.id, ...(v.type ? { type: v.type } : {}) })) }
}

// ───────── doğrulama ─────────
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
const str = (x: unknown, d: string, max = 200): string => (typeof x === 'string' ? x.slice(0, max) : d)
const numv = (x: unknown, d: number, lo = -1e6, hi = 1e6): number => (typeof x === 'number' && Number.isFinite(x) ? Math.max(lo, Math.min(hi, x)) : d)
const color = (x: unknown): string | null => (typeof x === 'string' && x.length <= 40 ? x : null)
const pts = (x: unknown, max = 8000): number[] | null => (Array.isArray(x) && x.length <= max && x.every((n) => typeof n === 'number' && Number.isFinite(n)) ? (x as number[]) : null)

function parseShape(x: unknown): Shape | null {
  if (!isObj(x)) return null
  const f = x.f === null ? null : color(x.f)
  const s = x.s === null ? null : color(x.s)
  switch (x.t) {
    case 'rect': return { t: 'rect', x: numv(x.x, 0), y: numv(x.y, 0), w: numv(x.w, 0), h: numv(x.h, 0), f, s, sw: numv(x.sw, 0, 0, 100), ...(typeof x.r === 'number' ? { r: numv(x.r, 0, 0, 200) } : {}) }
    case 'ellipse': return { t: 'ellipse', cx: numv(x.cx, 0), cy: numv(x.cy, 0), rx: numv(x.rx, 0), ry: numv(x.ry, 0), f, s, sw: numv(x.sw, 0, 0, 100) }
    case 'poly': { const p = pts(x.pts); return p ? { t: 'poly', pts: p, f, s, sw: numv(x.sw, 0, 0, 100) } : null }
    case 'path': { const p = pts(x.pts); const c = color(x.c); return p && c ? { t: 'path', pts: p, c, w: numv(x.w, 2, 0.5, 200) } : null }
    default: return null
  }
}
function parseCostume(x: unknown, i: number): Costume | null {
  if (!isObj(x)) return null
  const w = numv(x.w, 96, 8, 1000), h = numv(x.h, 96, 8, 1000)
  const shapes = (Array.isArray(x.shapes) ? x.shapes.slice(0, 4000) : []).map(parseShape).filter((s): s is Shape => !!s)
  const bm = typeof x.bitmap === 'string' && x.bitmap.startsWith('data:image/png;base64,') && x.bitmap.length < 900_000 ? x.bitmap : undefined
  return { id: str(x.id, `c${i}`, 40) || `c${i}`, name: str(x.name, `kostüm${i + 1}`, 60) || `kostüm${i + 1}`, w, h, shapes, ...(bm ? { bitmap: bm } : {}) }
}
function parseSound(x: unknown): SoundRef | null {
  if (!isObj(x) || typeof x.gid !== 'string' || !SOUND_BY_ID[x.gid]) return null
  return { name: str(x.name, SOUND_BY_ID[x.gid].name, 60), gid: x.gid, ...(typeof x.speed === 'number' ? { speed: numv(x.speed, 1, 0.25, 4) } : {}), ...(typeof x.pitch === 'number' ? { pitch: numv(x.pitch, 1, 0.25, 4) } : {}), ...(x.reverse === true ? { reverse: true } : {}), ...(typeof x.gain === 'number' ? { gain: numv(x.gain, 1, 0, 1) } : {}) }
}
function parseProcs(x: unknown): ProcDef[] {
  if (!Array.isArray(x)) return []
  return x.slice(0, 40).filter(isObj).map((p) => ({ id: str(p.id, '', 40), name: str(p.name, 'blok', 40), params: Array.isArray(p.params) ? p.params.slice(0, 6).map((q) => str(q, 'girdi', 30)) : [] })).filter((p) => /^[a-z0-9_]+$/i.test(p.id))
}

/** Bilinmeyen blok türlerini ve bozuk girişleri ayıklar (Blockly yüklemesi çökmesin). */
export function sanitizeState(x: unknown, procs: ProcDef[]): BlockState {
  if (!isObj(x)) return emptyProgram()
  const procIds = new Set(procs.map((p) => p.id))
  const known = (t: string): boolean =>
    !!BLOCK_BY_TYPE[t] || t === 'math_number' || t === 'text' || t === VAR_GET || t === ARG_BLOCK ||
    (t.startsWith(PROC_DEF_PREFIX) && procIds.has(t.slice(PROC_DEF_PREFIX.length))) || (t.startsWith(PROC_CALL_PREFIX) && procIds.has(t.slice(PROC_CALL_PREFIX.length)))
  let budget = 20000
  const clean = (n: unknown): BlockNode | undefined => {
    // `next` zincirinde bilinmeyen blok varsa atla
    let cur: unknown = n
    while (isObj(cur) && (typeof cur.type !== 'string' || !known(cur.type) || budget-- <= 0)) cur = isObj(cur.next) ? (cur.next as { block?: unknown }).block : undefined
    if (!isObj(cur)) return undefined
    const out: BlockNode = { type: String(cur.type) }
    if (typeof cur.id === 'string') out.id = cur.id.slice(0, 60)
    if (typeof cur.x === 'number') out.x = cur.x
    if (typeof cur.y === 'number') out.y = cur.y
    if (isObj(cur.fields)) out.fields = JSON.parse(JSON.stringify(cur.fields))
    if (cur.enabled === false) out.enabled = false
    if (isObj(cur.inputs)) {
      out.inputs = {}
      for (const [k, v] of Object.entries(cur.inputs)) {
        if (!isObj(v)) continue
        const e: { block?: BlockNode; shadow?: BlockNode } = {}
        const bl = clean(v.block); if (bl) e.block = bl
        const sh = clean(v.shadow); if (sh) e.shadow = sh
        out.inputs[k] = e
      }
    }
    const nx = isObj(cur.next) ? clean((cur.next as { block?: unknown }).block) : undefined
    if (nx) out.next = { block: nx }
    return out
  }
  const tops = (isObj(x.blocks) && Array.isArray(x.blocks.blocks) ? x.blocks.blocks : []).slice(0, 400).map(clean).filter((b): b is BlockNode => !!b)
  const variables = (Array.isArray(x.variables) ? x.variables : []).filter(isObj).slice(0, 200).map((v) => ({ name: str(v.name, 'değişken', 60), id: str(v.id, '', 80), ...(v.type === 'List' ? { type: 'List' } : {}) })).filter((v) => v.id)
  return { blocks: { languageVersion: 0, blocks: tops }, variables }
}

export function validateProject(raw: unknown): SahneProject | null {
  if (!isObj(raw) || raw.version !== 1 || !isObj(raw.stage)) return null
  const rs = raw.stage
  const backdrops = (Array.isArray(rs.backdrops) ? rs.backdrops.slice(0, MAX_COSTUMES) : []).map(parseCostume).filter((c): c is Costume => !!c)
  if (!backdrops.length) backdrops.push(backdropFromGallery('beyaz'))
  const stageProcs = parseProcs(rs.procs)
  const stage: StageDef = { backdrops, backdrop: Math.max(0, Math.min(backdrops.length - 1, Math.round(numv(rs.backdrop, 0)))), sounds: (Array.isArray(rs.sounds) ? rs.sounds : []).map(parseSound).filter((s): s is SoundRef => !!s), procs: stageProcs, blocks: sanitizeState(rs.blocks, stageProcs) }
  const seen = new Set<string>()
  const sprites: SpriteDef[] = []
  for (const x of (Array.isArray(raw.sprites) ? raw.sprites : []).slice(0, MAX_SPRITES)) {
    if (!isObj(x)) continue
    const costumes = (Array.isArray(x.costumes) ? x.costumes.slice(0, MAX_COSTUMES) : []).map(parseCostume).filter((c): c is Costume => !!c)
    if (!costumes.length) costumes.push(emptyCostume('kostüm1'))
    let id = str(x.id, '', 40).replace(/[^a-zA-Z0-9_-]/g, '')
    if (!id || seen.has(id) || id === 'stage') id = newId('s')
    seen.add(id)
    const procs = parseProcs(x.procs)
    sprites.push({
      id, name: str(x.name, 'Sprite', 40) || 'Sprite', costumes, costume: Math.max(0, Math.min(costumes.length - 1, Math.round(numv(x.costume, 0)))),
      sounds: (Array.isArray(x.sounds) ? x.sounds : []).map(parseSound).filter((s): s is SoundRef => !!s),
      x: numv(x.x, 0, -2000, 2000), y: numv(x.y, 0, -2000, 2000), dir: numv(x.dir, 90, -360, 360), size: numv(x.size, 100, 5, 800), visible: x.visible !== false,
      rotationStyle: x.rotationStyle === 'lr' || x.rotationStyle === 'none' ? x.rotationStyle : 'all', procs, blocks: sanitizeState(x.blocks, procs),
    })
  }
  const variables: VarDef[] = (Array.isArray(raw.variables) ? raw.variables : []).filter(isObj).slice(0, 200).map((v) => ({
    id: str(v.id, '', 80), name: str(v.name, 'değişken', 60), type: v.type === 'List' ? 'List' as const : '' as const,
    value: typeof v.value === 'number' || typeof v.value === 'string' ? (typeof v.value === 'string' ? v.value.slice(0, 500) : v.value) : 0,
    items: Array.isArray(v.items) ? v.items.slice(0, 2000).map((i) => String(i).slice(0, 300)) : [], visible: v.visible !== false,
  })).filter((v) => v.id)
  return { version: 1, name: str(raw.name, 'Projem', 60) || 'Projem', notes: str(raw.notes, '', 4000), stage, sprites, variables, messages: (Array.isArray(raw.messages) ? raw.messages : []).slice(0, 100).map((m) => str(m, '', 60)).filter(Boolean) }
}

export function parseProject(text: string): SahneProject | null {
  if (text.length > MAX_PROJECT_BYTES) return null
  try { return validateProject(JSON.parse(text)) } catch { return null }
}
export const exportProject = (p: SahneProject): string => JSON.stringify(p, null, 1)
export const cloneProject = (p: SahneProject): SahneProject => JSON.parse(JSON.stringify(p)) as SahneProject

// ───────── localStorage ─────────
export function loadProject(key: string = PROJECT_STORAGE_KEY): SahneProject | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const t = localStorage.getItem(key)
    return t ? parseProject(t) : null
  } catch { return null }
}
export function saveProject(p: SahneProject, key: string = PROJECT_STORAGE_KEY): boolean {
  try {
    if (typeof localStorage === 'undefined') return false
    localStorage.setItem(key, JSON.stringify(p))
    return true
  } catch { return false }
}
