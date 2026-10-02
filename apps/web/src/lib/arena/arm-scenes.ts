// Robot kol sahneleri (omuz D9, dirsek D10, tutucu D11). Koordinatlar cm: omuz ekseni (0, 0), x ileri, y yukarı.
import type { ArmScene } from './types'

export interface ArmSceneInit {
  id?: string
  title?: string
  description?: string
  objects?: ArmScene['objects']
  zones?: ArmScene['zones']
  timeLimitS?: number
  servoDegPerSec?: number
  /** Verilirse kapalı tutucu bu açının ÜSTÜNDEdir (varsayılan: 90°'nin altı kapalı). */
  gripClosedAboveDeg?: number
}

/** İki eklemli düz kol: üst kol ve ön kol 10 cm; tutucu açık = 120°, kapalı = 60° (eşik 90°). */
export function armScene(o: ArmSceneInit = {}): ArmScene {
  return {
    kind: 'arm', id: o.id ?? 'kol', title: o.title ?? 'Robot kol', description: o.description ?? 'İki eklemli kol yandan görünür: omuz D9, dirsek D10, tutucu D11.',
    l1: 10, l2: 10, gripClosedBelowDeg: 90, gripClosedAboveDeg: o.gripClosedAboveDeg,
    objects: o.objects ?? [], zones: o.zones ?? [],
    view: { xMin: -12, xMax: 28, yMin: -14, yMax: 24 },
    servoDegPerSec: o.servoDegPerSec, timeLimitS: o.timeLimitS ?? 30,
  }
}
