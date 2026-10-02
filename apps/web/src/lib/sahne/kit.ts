// Proje kurma kısayolları: etkinlik başlangıçları/çözümleri, örnekler ve testler için.
import { program } from './dsl'
import { CHARACTER_BY_ID } from './gallery/characters'
import { backdropFromGallery, cloneCostume, makeVar, newProject, spriteFromCostumes, spriteFromGallery } from './project'
import { makeSound } from './sounds'
import type { BlockNode, Costume, ProcDef, SahneProject, VarDef } from './types'

export interface SpriteSpec {
  id: string
  name?: string
  /** Galeri karakteri; `costumes` verilirse o kullanılır. */
  char?: string
  /** Galeri karakterinin yalnız bu sıradaki kostümlerini al. */
  pick?: number[]
  costumes?: Costume[]
  x?: number
  y?: number
  dir?: number
  size?: number
  visible?: boolean
  /** Ses galerisi anahtarları ('miyav', 'do', …); ad = galerideki ad. */
  sounds?: string[]
  procs?: ProcDef[]
  blocks?: BlockNode[]
}

export interface ProjectOpts {
  /** Sahne betikleri. */
  stage?: BlockNode[]
  stageProcs?: ProcDef[]
  /** Galeri arka plan kimlikleri (ilki seçili). Varsayılan: beyaz. */
  backdrops?: string[]
  vars?: VarDef[]
  messages?: string[]
  notes?: string
}

export function makeProject(name: string, sprites: SpriteSpec[], o: ProjectOpts = {}): SahneProject {
  const p = newProject(name)
  p.stage.backdrops = (o.backdrops ?? ['beyaz']).map((id) => backdropFromGallery(id))
  p.stage.blocks = program(o.stage ?? [])
  p.stage.procs = o.stageProcs ?? []
  p.sprites = sprites.map((s) => {
    const ch = CHARACTER_BY_ID[s.char ?? 'kedi']
    const base = s.costumes
      ? spriteFromCostumes(s.costumes, { id: s.id, name: s.name })
      : s.pick && ch
        ? spriteFromCostumes(s.pick.map((i) => cloneCostume(ch.costumes[i])), { id: s.id, name: s.name ?? ch.name })
        : spriteFromGallery(s.char ?? 'kedi', { id: s.id, name: s.name })
    return {
      ...base, id: s.id, name: s.name ?? base.name, x: s.x ?? 0, y: s.y ?? 0, dir: s.dir ?? 90, size: s.size ?? 100, visible: s.visible ?? true,
      sounds: (s.sounds ?? []).map((g) => makeSound(g)), procs: s.procs ?? [], blocks: program(s.blocks ?? []),
    }
  })
  p.variables = o.vars ?? []
  p.messages = o.messages ?? []
  p.notes = o.notes ?? ''
  return p
}

export { makeVar }
