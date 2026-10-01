// ASK Jr — hedef denetimi için proje analizi ve benzetim yardımcıları (saf, DOM yok).

import { BLOCK_BY_TYPE } from './blocks'
import { Engine } from './engine'
import { findSprite, scriptIsRunnable } from './ops'
import type { Block, BlockType, EngineEvent, EngineSnapshot, Project, Script } from './types'

function flatten(blocks: Block[], out: Block[] = []): Block[] {
  for (const b of blocks) {
    out.push(b)
    if (b.children) flatten(b.children, out)
  }
  return out
}

function allScripts(project: Project): Script[] {
  return project.pages.flatMap((p) => p.sprites.flatMap((s) => s.scripts))
}

/** Tüm blokların düz listesi (betik sırası, ön-sıra; çocuklar ebeveyninden hemen sonra). */
export function allBlocks(project: Project): Block[] {
  return allScripts(project).flatMap((s) => flatten(s.blocks))
}

export function countBlocks(project: Project, type?: BlockType): number {
  const all = allBlocks(project)
  return type ? all.filter((b) => b.type === type).length : all.length
}

/** İlk bloğu başlatma bloğu olan (yani gerçekten çalışabilen) betikler. */
export function runnableScripts(project: Project): Script[] {
  return allScripts(project).filter(scriptIsRunnable)
}

export function hasRunnableScript(project: Project, triggerType?: 'flag' | 'tap'): boolean {
  return runnableScripts(project).some((s) => !triggerType || s.blocks[0].type === triggerType)
}

/** En derin container iç içeliği: container'sız betik 0, tek repeat 1, repeat içinde repeat 2. */
export function maxNesting(project: Project): number {
  const depth = (blocks: Block[]): number => {
    let max = 0
    for (const b of blocks) {
      if (BLOCK_BY_TYPE[b.type].container) max = Math.max(max, 1 + depth(b.children ?? []))
    }
    return max
  }
  return allScripts(project).reduce((m, s) => Math.max(m, depth(s.blocks)), 0)
}

/** Döngü (repeat/forever ya da yalnız loopType) gövdesindeki tüm bloklar; iç içe olsa da her blok bir kez. */
export function blocksInsideLoops(project: Project, loopType?: 'repeat' | 'forever'): Block[] {
  const out: Block[] = []
  const walk = (blocks: Block[], inside: boolean) => {
    for (const b of blocks) {
      if (inside) out.push(b)
      const isLoop = !!BLOCK_BY_TYPE[b.type].container && (!loopType || b.type === loopType)
      if (b.children) walk(b.children, inside || isLoop)
    }
  }
  for (const s of allScripts(project)) walk(s.blocks, false)
  return out
}

/** Betiğin üst düzey blok tipleri. */
export function scriptTypes(script: Script): BlockType[] {
  return script.blocks.map((b) => b.type)
}

export function pageCount(project: Project): number {
  return project.pages.length
}

// ---- Benzetim ----

export interface TrailPoint { t: number; x: number; y: number }

export interface SimulateOptions {
  press?: 'flag' | { tap: string }
  ms: number
  /** Başlangıç sayfası (0 tabanlı). */
  onPage?: number
}

export interface SimulateResult {
  snapshot: EngineSnapshot
  events: EngineEvent[]
  /** Sprite kimliği -> 50 ms'lik örnekler (t=0 dahil, ms sonunda son örnek). Yalnız etkin sayfanın sprite'ları. */
  positions: Record<string, TrailPoint[]>
}

const SAMPLE_MS = 50

/** Taze bir motorla, belirtilen süre kadar (press verilmezse bayrağa basarak) koşturur. */
export function simulate(project: Project, opts: SimulateOptions): SimulateResult {
  const engine = new Engine(project)
  engine.reset(opts.onPage ?? 0)
  const press = opts.press ?? 'flag'
  if (press === 'flag') engine.pressFlag()
  else engine.tapSprite(press.tap)

  const positions: Record<string, TrailPoint[]> = {}
  const sample = () => {
    const snap = engine.snapshot
    for (const s of snap.sprites) (positions[s.id] ??= []).push({ t: snap.time, x: s.x, y: s.y })
  }
  sample()
  let elapsed = 0
  const total = Math.max(0, opts.ms)
  while (elapsed < total) {
    const d = Math.min(SAMPLE_MS, total - elapsed)
    engine.tick(d)
    elapsed += d
    sample()
  }
  return { snapshot: engine.snapshot, events: engine.events, positions }
}

/** Bayrağa basınca sprite'ın her 50 ms'deki konumu. Sprite projede yoksa boş dizi. */
export function trail(project: Project, spriteId: string, ms: number): TrailPoint[] {
  const found = findSprite(project, spriteId)
  if (!found) return []
  return simulate(project, { press: 'flag', ms, onPage: found.pageIndex }).positions[spriteId] ?? []
}

// ---- Hedefler ----

export interface Goal {
  id: string
  text: string
  check: (p: Project) => boolean
  hint?: string
}

export interface GoalResult { id: string; text: string; done: boolean; hint: string | undefined }
/** Arayüzün kullandığı ad (GoalResult ile aynı). */
export type GoalStatus = GoalResult

export function evaluateGoals(project: Project, goals: Goal[]): GoalResult[] {
  return goals.map((g) => {
    let done = false
    try { done = !!g.check(project) } catch { done = false }
    return { id: g.id, text: g.text, done, hint: g.hint }
  })
}
