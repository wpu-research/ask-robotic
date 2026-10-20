// Oynatma: bir ArmScript çalıştırmasının karelerini ve parça olaylarını zamana göre okur (saf, testli). 3B sahne yalnız
// bu işlevlerin sonucunu çizer; böylece sahnedeki görüntü ile test edilen durum aynıdır.
import type { Frame, ItemEvent } from './armscript'
import type { Item } from './cell'
import type { Joints, V3 } from './kinematics'

/** t anındaki eklem duruşu ve tutucu açıklığı (kareler arasında doğrusal ara değer; uçların dışında uç kare). */
export function frameAt(frames: readonly Frame[], t: number): { q: Joints; grip: number } {
  if (frames.length === 0) throw new Error('kare yok')
  if (t <= frames[0].t) return { q: frames[0].q, grip: frames[0].grip }
  const last = frames[frames.length - 1]
  if (t >= last.t) return { q: last.q, grip: last.grip }
  let lo = 0, hi = frames.length - 1
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (frames[mid].t <= t) lo = mid; else hi = mid }
  const a = frames[lo], b = frames[hi]
  const f = b.t > a.t ? (t - a.t) / (b.t - a.t) : 1
  return { q: a.q.map((v, i) => v + (b.q[i] - v) * f) as Joints, grip: a.grip + (b.grip - a.grip) * f }
}

/** t anındaki parçalar: başlangıç konumları + t'ye kadar olan olaylar; tutulan parça `held` olarak döner (konumu TCP verir). */
export function itemsAt(initial: readonly Item[], events: readonly ItemEvent[], t: number): { items: Item[]; held: string | null } {
  const items = initial.map((i) => ({ ...i, pos: [...i.pos] as V3 }))
  let held: string | null = null
  for (const e of events) {
    if (e.t > t) break
    const it = items.find((x) => x.id === e.id)
    if (!it) continue
    if (e.pos === null) held = e.id
    else { it.pos = [...e.pos] as V3; if (held === e.id) held = null }
  }
  return { items, held }
}
