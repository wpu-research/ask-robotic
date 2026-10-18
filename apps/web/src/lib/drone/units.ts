// Drone dersinin 10 ünitesi (iki dosyaya bölündü: 1–5 fizik ve denetim, 6–10 yazılım ve sistem).
import type { Unit } from './course'
import { UNITS_A } from './units-a'
import { UNITS_B } from './units-b'

export const UNITS_DATA: Unit[] = [...UNITS_A, ...UNITS_B]
