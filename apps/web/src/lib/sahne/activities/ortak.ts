// Etkinlikler için ortak yardımcılar.
import type { RunReport } from '../activity'
import { BLOCK_BY_TYPE } from '../blocks'
import { targetsOf, walkBlocks } from '../project'
import type { BlockNode, SahneProject } from '../types'

/** Başlık olmayan, değer olmayan "komut" blokları (kart sayısı). */
export function commandCount(p: SahneProject): number {
  let n = 0
  for (const t of targetsOf(p)) walkBlocks(t.def.blocks, (b) => { const d = BLOCK_BY_TYPE[b.type]; if (d && d.shape !== 'hat' && d.shape !== 'val' && d.shape !== 'bool') n++ })
  return n
}

/** Programdaki bir türün bloklarından birine koşul uyuyor mu. */
export function someBlock(p: SahneProject, type: string, test: (b: BlockNode) => boolean): boolean {
  let ok = false
  for (const t of targetsOf(p)) walkBlocks(t.def.blocks, (b) => { if (b.type === type && test(b)) ok = true })
  return ok
}

/** Bir girişteki sayı gölgesinin değeri (yoksa NaN). */
export const numInput = (b: BlockNode, name: string): number => {
  const n = b.inputs?.[name]?.shadow ?? b.inputs?.[name]?.block
  return n && n.type === 'math_number' ? Number(n.fields?.NUM) : NaN
}

/** Kontrol noktalarında `cp` adlı anın değişken değeri. */
export const cpVar = (r: RunReport, cp: string, name: string): number => Number(r.checkpoints[cp]?.vars[name] ?? NaN)
export const cpSprite = (r: RunReport, cp: string, id: string) => r.checkpoints[cp]?.sprites[id]

/** Etkileşim başlığı (tuş, tıklama, mesaj) var mı. */
export function hasInteraction(p: SahneProject): boolean {
  return ['sh_when_key', 'sh_when_clicked', 'sh_when_msg'].some((t) => targetsOf(p).some((x) => (x.def.blocks.blocks?.blocks ?? []).some((b) => b.type === t && b.next?.block)))
}

/** Senaryodaki etkileşimlerden sonra sahnede görünür/duyulur bir şey değişti mi (konum, yön, boyut, kostüm, konuşma, ses, efekt). */
export function visiblyChanged(r: RunReport, before = 'once'): boolean {
  const s = r.session
  const evs = ['say', 'sound', 'costume', 'effect', 'size', 'backdrop', 'show', 'hide', 'clone']
  if (evs.some((k) => (s.engine.counts[k] ?? 0) > 0)) return true
  const b = r.checkpoints[before]
  if (!b) return false
  return s.engine.targets.some((t) => { const o = b.sprites[t.defId]; return !!o && (Math.abs(o.x - t.x) > 1 || Math.abs(o.y - t.y) > 1 || Math.abs(o.dir - t.dir) > 1 || o.size !== t.size || o.costume !== t.costume) })
}
