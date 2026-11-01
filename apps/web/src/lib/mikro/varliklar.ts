// Varlık kütüphanesi: öğrencinin kendi çizdiği bir parçayı (bir ya da birkaç blok)
// adıyla kaydedip başka tasarımlarda yeniden kullanması.
//
// Tarayıcıda saklanır. Depo erişimi gizli pencerede ya da dolu diskte fırlatabilir:
// her çağrı buna dayanıklıdır, hata atmaz.
import { normalizeBlock, uniqueBlockId, type Block, type Govde } from './govde'

export const ASSET_KEY = 'ask:tasarim:varliklar:v1'
export const MAX_ASSETS = 60

export interface Varlik {
  id: string
  name: string
  /** Blokların merkezi başlangıca taşınmış hâli: nereye eklenirse oraya oturur. */
  blocks: Block[]
  /** Kaydedilme anı (ISO). */
  at: string
}

function read(): Varlik[] {
  try {
    const raw = localStorage.getItem(ASSET_KEY)
    if (!raw) return []
    const v = JSON.parse(raw)
    if (!Array.isArray(v)) return []
    return v
      .filter((a) => a && typeof a.id === 'string' && typeof a.name === 'string' && Array.isArray(a.blocks) && a.blocks.length)
      .map((a) => ({ ...a, blocks: a.blocks.map(normalizeBlock) }))
      .slice(0, MAX_ASSETS)
  } catch {
    return []
  }
}

function write(list: Varlik[]): void {
  try {
    localStorage.setItem(ASSET_KEY, JSON.stringify(list.slice(0, MAX_ASSETS)))
  } catch {
    // gizli pencere ya da dolu depo: kaydedilemez, akış bozulmaz
  }
}

export function listAssets(): Varlik[] {
  return read()
}

/** Blokları merkezleyip (0,0,0) etrafına toplar: varlık nereye eklenirse oraya oturur. */
export function centerBlocks(blocks: Block[]): Block[] {
  if (!blocks.length) return []
  const mid = [0, 1, 2].map((k) => {
    const lo = Math.min(...blocks.map((b) => b.pos[k] - b.size[k]))
    const hi = Math.max(...blocks.map((b) => b.pos[k] + b.size[k]))
    return (lo + hi) / 2
  })
  return blocks.map((b) => normalizeBlock({ ...b, pos: [b.pos[0] - mid[0], b.pos[1] - mid[1], b.pos[2] - mid[2]] }))
}

/**
 * Verilen blokları adlandırıp kaydeder. Aynı ad varsa üzerine yazar — öğrenci
 * "kaydet" deyip duruyorsa kütüphane aynı parçayla dolmasın.
 */
export function saveAsset(name: string, blocks: Block[]): Varlik[] {
  const clean = name.trim().slice(0, 40) || 'Parça'
  if (!blocks.length) return read()
  const list = read().filter((a) => a.name.toLowerCase() !== clean.toLowerCase())
  const asset: Varlik = {
    id: `v${Date.now().toString(36)}`,
    name: clean,
    blocks: centerBlocks(blocks),
    at: new Date().toISOString(),
  }
  const next = [asset, ...list].slice(0, MAX_ASSETS)
  write(next)
  return next
}

export function deleteAsset(id: string): Varlik[] {
  const next = read().filter((a) => a.id !== id)
  write(next)
  return next
}

/**
 * Varlığı gövdeye ekler. Kimlikler çakışmasın diye yeniden adlandırılır;
 * `at` verilirse o noktaya, verilmezse gövdenin önüne konur.
 */
export function insertAsset(g: Govde, asset: Varlik, at?: [number, number, number]): Govde {
  const frontX = g.blocks.reduce((m, b) => Math.max(m, b.pos[0] + b.size[0]), 0)
  const origin = at ?? [frontX + 0.02, 0, 0]
  const taken = g.blocks.map((b) => b.id)
  const added: Block[] = []
  for (const b of asset.blocks) {
    const id = uniqueBlockId([...taken, ...added.map((x) => x.id)])
    added.push(normalizeBlock({ ...b, id, pos: [b.pos[0] + origin[0], b.pos[1] + origin[1], b.pos[2] + origin[2]] }))
  }
  return { ...g, blocks: [...g.blocks, ...added] }
}
