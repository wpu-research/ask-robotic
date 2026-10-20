// Robot kolu dersinin 10 ünitesi (iki dosyaya bölündü: 1–5 kol, kinematik, hareket, tutucu; 6–10 ArmScript, planlama, güvenlik, bitirme).
import type { Unit } from './course'
import { UNITS_A } from './units-a'
import { UNITS_B } from './units-b'

export const UNITS_DATA: Unit[] = [...UNITS_A, ...UNITS_B]
