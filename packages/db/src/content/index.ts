import type { ModuleContent } from './types'
import { modul1 as modul1Base } from './modul-1-scratchjr'
import { modul2 as modul2Base } from './modul-2-scratch'
import { withExtras } from './extras'
import { withEnglish } from './en'
import { modul1En } from './en/modul-1.en'
import { modul2En } from './en/modul-2.en'
import { modul1Extras } from './extras/modul-1'
import { modul2Extras } from './extras/modul-2'
import { modul3 } from './arduino-temelleri.generated'
import { modul4 } from './sensorler-ve-projeler.generated'
import { modul5 } from './robotik.generated'
import { modul7 } from './ai-muhendisligi.generated'
import { modul10 } from './mikro-kart.generated'
import { modul11 } from './oyun-atolyesi.generated'

import type { ComponentGuide } from './types'
import { parcalar } from './parcalar.generated'

const modul1 = withEnglish(withExtras(modul1Base, modul1Extras), modul1En)
const modul2 = withEnglish(withExtras(modul2Base, modul2Extras), modul2En)

export * from './types'
export const allComponents: ComponentGuide[] = parcalar
export const allModules: ModuleContent[] = [modul1, modul2, modul3, modul4, modul5, modul7, modul10, modul11]
