import type { ModuleContent } from './types'
import { modul1 } from './modul-1-scratchjr'
import { modul2 } from './modul-2-scratch'
import { modul3 } from './arduino-temelleri.generated'
import { modul4 } from './sensorler-ve-projeler.generated'

export * from './types'
export const allModules: ModuleContent[] = [modul1, modul2, modul3, modul4]
