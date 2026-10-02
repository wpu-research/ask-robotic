import type { ModuleContent } from './types'
import { modul1 } from './modul-1-scratchjr'
import { modul2 } from './modul-2-scratch'
import { modul3 } from './arduino-temelleri.generated'
import { modul4 } from './sensorler-ve-projeler.generated'
import { modul5 } from './robotik.generated'
import { modul7 } from './ai-muhendisligi.generated'
import { modul10 } from './mikro-kart.generated'
import { modul11 } from './oyun-atolyesi.generated'

import type { ComponentGuide } from './types'
import { parcalar } from './parcalar.generated'

export * from './types'
export const allComponents: ComponentGuide[] = parcalar
export const allModules: ModuleContent[] = [modul1, modul2, modul3, modul4, modul5, modul7, modul10, modul11]
