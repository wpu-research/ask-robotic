// Örnek oyun galerisi (8 oyun). Hepsi blok programıdır; "Oyun Atölyesi"nde açılıp değiştirilebilir.
import { BALON, KOSUCU, TUGLA, YILAN } from './games-b'
import { LABIRENT, PLATFORM, UZAY_GEMISI, YAKALAMACA } from './games-a'
import type { OyunSample } from './kit'

export type { OyunSample } from './kit'
export const SAMPLES: readonly OyunSample[] = [YAKALAMACA, BALON, UZAY_GEMISI, LABIRENT, TUGLA, KOSUCU, YILAN, PLATFORM]
export const SAMPLE_BY_ID: Readonly<Record<string, OyunSample>> = Object.fromEntries(SAMPLES.map((s) => [s.id, s]))
