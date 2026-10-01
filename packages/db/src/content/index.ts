import type { ModuleContent } from './types'
import { modul1 } from './modul-1-scratchjr'
import { modul2 } from './modul-2-scratch'

export * from './types'
export const allModules: ModuleContent[] = [modul1, modul2]
