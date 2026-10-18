// Drone mühendisliği dersi (büyükler için): PARÇA + SİMÜLASYON + YAZILIM, 10 ünite, TR/EN. Donanım yok; her şey tarayıcıda
// ve ileri öğrenci için Gazebo + PX4 SITL + ROS 2'de. Yapı ESOF 323 haftalarıyla aynı (kod bloğu ve test bileşenleri ortak).
import type { DroneSimId } from '@/components/drone/sim-meta'
import type { SimId } from '@/components/robotik/sim-meta'
import type { CodeBlock, QuizItem } from '@/lib/robotik/course'
import type { DronePartKey } from './parts'
import { UNITS_DATA } from './units'

export type Lang = 'tr' | 'en'
export type Pillar = 'parca' | 'sim' | 'yazilim'
export interface UnitText {
  title: string
  /** Kart ve tablo için tek cümle. */
  summary: string
  goals: string[]
  /** Ders notu (HTML, depodaki sabit içerik). */
  notes: string
  code: CodeBlock[]
  /** Simülasyonda yapılacak görev. */
  lab: string
  pitfalls: string[]
  /** Yazılım mühendisliği bağlantısı (HTML). */
  se: string
  quiz: QuizItem[]
}
export interface Unit {
  n: number
  pillars: Pillar[]
  sims: DroneSimId[]
  simCfg?: Partial<Record<DroneSimId, Record<string, string>>>
  /** ESOF 323'ten yeniden kullanılan simülasyonlar. */
  esofSims?: SimId[]
  parts: DronePartKey[]
  tr: UnitText
  en: UnitText
}

export const UNITS: readonly Unit[] = UNITS_DATA
export const unitOf = (n: number): Unit | undefined => UNITS.find((u) => u.n === n)

export const PILLAR_TEXT: Record<Pillar, { tr: string; en: string }> = {
  parca: { tr: 'Parça', en: 'Parts' },
  sim: { tr: 'Simülasyon', en: 'Simulation' },
  yazilim: { tr: 'Yazılım', en: 'Software' },
}

/** Ders künyesi. */
export const DRONE_COURSE = {
  tr: {
    title: 'Drone mühendisliği',
    lede: 'Bir multirotoru parçalarından, fiziğinden ve yazılımından öğren: gövde, motor, ESC, LiPo ve uçuş kontrolcüsü; itki, PID ve sensör füzyonu; PX4, MAVLink, MAVSDK ve ROS 2. Donanım gerekmez: yedi simülasyon tarayıcıda çalışır, ileri adımlar Gazebo + PX4 SITL\'de.',
    level: 'Büyükler için · lise son sınıf, üniversite ve meslekten öğrenenler',
    prereq: 'Ön koşul: temel Python ya da C++, lise fiziği (kuvvet, enerji). Mühendislik yolunun 1–7. seviyeleri yardımcıdır ama şart değildir.',
  },
  en: {
    title: 'Drone engineering',
    lede: 'Learn a multirotor through its parts, its physics and its software: frame, motor, ESC, LiPo and flight controller; thrust, PID and sensor fusion; PX4, MAVLink, MAVSDK and ROS 2. No hardware needed: seven simulations run in your browser, advanced steps in Gazebo + PX4 SITL.',
    level: 'For adults · final-year high school, university and working learners',
    prereq: 'Prerequisites: basic Python or C++, high-school physics (force, energy). Levels 1–7 of the engineering path help but are not required.',
  },
} as const
