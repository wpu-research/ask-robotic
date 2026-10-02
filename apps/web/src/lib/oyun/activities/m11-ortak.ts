// Oyun Atölyesi modülü (modul-11) hafta 4-6 etkinlikleri için ortak yardımcılar.
import { runScenario, type RunReport, type ScenarioStep } from '../activity'
import { b, set } from '../dsl'
import type { BlockNode } from '../types'

/** Hedef denetiminde ikinci bir senaryo koşturur ("şu durumda şunu yapıyor mu?" soruları için). */
export function alt(r: RunReport, scenario: readonly ScenarioStep[], test: (r2: RunReport) => boolean, seed = 1): boolean {
  const r2 = runScenario(r.project, scenario, seed)
  return !r2.error && test(r2)
}

/** İlk `kind` sprite'ı (yoksa undefined). */
export const first = (r: RunReport, kind: string) => r.engine.spritesOfKind(kind)[0]

export const dist = (a: { x: number; y: number }, c: { x: number; y: number }): number => Math.hypot(a.x - c.x, a.y - c.y)

/** Gökyüzü renkli sahne + kedi oluşturma gibi ortak başlangıç parçaları. */
export const yeniSprite = (ad: string, img: string, kind: string, x: number, y: number): BlockNode[] => [
  set(ad, b('sprite_yeni', { IMG: img, K: kind })),
  b('sprite_konum', { S: ad, X: x, Y: y }),
]

export * from '../dsl'
export { bu, diger, oku, olayKaro, tiles, mapFromRows, makeProject } from '../samples/kit'
