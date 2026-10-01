// Arena sahneleri: hazır pist/engel/labirent kurucuları. Ders etkinlikleri bunları değiştirerek (spread) kullanır.
import type { Polyline, Wall } from '@ask/sim'
import { arc, oval, rectWalls } from './geometry'
import type { ArenaScene, Pose, RoverScene, SceneSensors, Zone } from './types'

/** 5'li çizgi dizisi: A0 en sol (y > 0 sol taraf), 2,4 cm aralık, aks hizasından 7 cm önde. */
export const LINE_ROW = [0.048, 0.024, 0, -0.024, -0.048].map((y, pin) => ({ pin, x: 0.07, y }))

export interface RoverSceneInit {
  id: string
  title: string
  description?: string
  width?: number
  height?: number
  /** `box` = dış çerçeve duvarları (varsayılan true). */
  box?: boolean
  walls?: Wall[]
  lines?: Polyline[]
  lineWidth?: number
  pose?: Partial<Pose>
  sensors?: SceneSensors
  extra?: RoverScene['extra']
  zones?: Zone[]
  buttons?: RoverScene['buttons']
  movable?: boolean
  movers?: RoverScene['movers']
  lostHoldMs?: number
  timeLimitS?: number
}

export function roverScene(o: RoverSceneInit): RoverScene {
  const width = o.width ?? 2, height = o.height ?? 2
  const sensors = o.sensors ?? {}
  if (sensors.bumpers && sensors.encoders) throw new Error('Tampon ve enkoder aynı anda kullanılamaz (ikisi de D2/D3).')
  return {
    kind: 'rover', id: o.id, title: o.title, description: o.description, width, height,
    walls: [...(o.box === false ? [] : rectWalls(0, 0, width, height)), ...(o.walls ?? [])],
    lines: o.lines ?? [], lineWidth: o.lineWidth,
    pose: { x: 0.5, y: height / 2, theta: 0, ...o.pose },
    sensors, extra: o.extra, zones: o.zones ?? [], buttons: o.buttons, movable: o.movable, movers: o.movers, lostHoldMs: o.lostHoldMs, timeLimitS: o.timeLimitS ?? 60,
  }
}

/** Sahnenin bağımsız bir kopyası (etkinlik başına özelleştirmek için). */
export function withScene<T extends ArenaScene>(base: T, patch: Partial<T>): T {
  return { ...structuredClone(base), ...patch }
}

// ---------------------------------------------------------------- hazır sahneler
/** Düz yol (sürüş kalibrasyonu): 4 m x 1 m, her metrede kontrol noktası, sonda bitiş. */
export const flatRoad = (): RoverScene => roverScene({
  id: 'duz-yol', title: 'Düz yol', description: 'Sürüş kalibrasyonu: 4 m’lik düz yol. Robot ileri gidip sonda durmalı.',
  width: 4, height: 1, pose: { x: 0.3, y: 0.5, theta: 0 }, sensors: { encoders: true, imu: true },
  zones: [
    { id: 'baslangic', kind: 'start', x: 0.3, y: 0.5, r: 0.12 },
    { id: 'm1', kind: 'checkpoint', label: '1 m', x: 1.3, y: 0.5, r: 0.1 },
    { id: 'm2', kind: 'checkpoint', label: '2 m', x: 2.3, y: 0.5, r: 0.1 },
    { id: 'm3', kind: 'checkpoint', label: '3 m', x: 3.3, y: 0.5, r: 0.1 },
    { id: 'bitis', kind: 'goal', label: 'Bitiş', x: 3.7, y: 0.5, r: 0.2 },
  ],
  timeLimitS: 30,
})

/** Kolay çizgi pisti: oval; üç kontrol noktası, başlangıçta bitiş. */
export const easyLine = (): RoverScene => roverScene({
  id: 'cizgi-kolay', title: 'Kolay çizgi pisti', description: 'Oval pist: bir tam tur at.',
  pose: { x: 1, y: 0.7, theta: 0 }, sensors: { line: true },
  lines: [oval(1, 1, 0.25, 0.3)],
  zones: [
    { id: 'baslangic', kind: 'goal', label: 'Bitiş', x: 1, y: 0.7, r: 0.12 },
    { id: 'k1', kind: 'checkpoint', x: 1.55, y: 1.0, r: 0.12 },
    { id: 'k2', kind: 'checkpoint', x: 1.0, y: 1.3, r: 0.12 },
    { id: 'k3', kind: 'checkpoint', x: 0.45, y: 1.0, r: 0.12 },
  ],
  timeLimitS: 40,
})

/** Zor çizgi pisti (proje pisti): düz, kavis, dik viraj, boşluk, bitiş bandı. */
export function hardLine(gap = 0.09): RoverScene {
  const nokta: Polyline = [[0.1, 1.0], [0.9, 1.0]]
  for (const p of arc(0.9, 1.4, 0.4, -90, 0, 12).slice(1)) nokta.push(p)
  nokta.push([1.3, 1.7], [1.9, 1.7])
  return roverScene({
    id: 'cizgi-zor', title: 'Zor çizgi pisti', description: 'Kavis, dik viraj ve bir çizgi boşluğu var; sondaki banda ulaş.',
    width: 3, height: 2.2, pose: { x: 0.3, y: 1.0, theta: 0 }, sensors: { line: true },
    lines: [nokta, [[1.9 + gap, 1.7], [2.6, 1.7]], [[2.6, 1.55], [2.6, 1.85]]],
    zones: [
      { id: 'baslangic', kind: 'start', x: 0.3, y: 1.0, r: 0.1 },
      { id: 'viraj', kind: 'checkpoint', x: 1.3, y: 1.7, r: 0.12 },
      { id: 'bitis', kind: 'goal', label: 'Bitiş', x: 2.6, y: 1.7, r: 0.12 },
    ],
    timeLimitS: 40,
  })
}

/** Engelli alan: 2 x 2 m, ortada blok ve iki duvar parçası. Ultrasonik + tampon. */
export const obstacleField = (): RoverScene => roverScene({
  id: 'engelli', title: 'Engelli alan', description: 'Ortada blok ve iki duvar parçası var. Çarpmadan dolaş; panelde gezdiğin alan (25 cm’lik hücre) sayılır.',
  pose: { x: 0.3, y: 0.4, theta: 0 }, sensors: { ultrasonic: true, bumpers: true },
  walls: [...rectWalls(0.6, 0.9, 1.0, 1.3), [1.4, 0.3, 1.4, 0.9], [0.3, 1.6, 0.9, 1.6]],
  extra: { noiseCm: 1, seed: 7 }, timeLimitS: 60,
})

/** Tampon çarpma duvarı: boş 2 x 2 m kutu, robot doğu duvarına bakar. */
export const bumpWall = (): RoverScene => roverScene({
  id: 'tampon', title: 'Tampon duvarı', description: 'Duvara yaklaş, tamponlarla çarpmayı algıla ve geri çekil.',
  pose: { x: 0.5, y: 1, theta: 0 }, sensors: { bumpers: true },
  zones: [{ id: 'guvenli', kind: 'target', label: 'Güvenli bölge', x: 0.9, y: 1, r: 0.2 }],
  timeLimitS: 30,
})

/** Labirent: 2 x 2 m, 0,5 m koridor, yılan şeklinde yol. Başlangıç sol altta, çıkış sol üstte. */
export const maze = (): RoverScene => roverScene({
  id: 'labirent', title: 'Labirent', description: 'Dar koridorlar. Duvarları ultrasonikle oku, çıkışa ulaş.',
  pose: { x: 0.25, y: 0.25, theta: 0 }, sensors: { ultrasonic: true, bumpers: true },
  walls: [[0, 0.5, 1.5, 0.5], [0.5, 1.0, 2, 1.0], [0, 1.5, 1.5, 1.5]],
  zones: [
    { id: 'baslangic', kind: 'start', x: 0.25, y: 0.25, r: 0.15 },
    { id: 'k1', kind: 'checkpoint', x: 1.75, y: 0.75, r: 0.15 },
    { id: 'k2', kind: 'checkpoint', x: 0.25, y: 1.25, r: 0.15 },
    { id: 'cikis', kind: 'goal', label: 'Çıkış', x: 0.25, y: 1.75, r: 0.15 },
  ],
  extra: { noiseCm: 1, seed: 3 }, timeLimitS: 90,
})

/** Serbest mod listesi (sahne seçici). */
export const FREE_SCENES = (): RoverScene[] => [easyLine(), hardLine(), obstacleField(), bumpWall(), maze(), flatRoad()]
