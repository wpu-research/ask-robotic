// IoT dersinin ortak sayfa görünümüne (components/kurs/course-pages) verilen veri: künye, üniteler, proje ve simülasyonlar.
import { IotSim } from '@/components/iot/sims'
import { IOT_SIM_META, type IotSimId } from '@/components/iot/sim-meta'
import type { CourseView } from '@/components/kurs/course-pages'
import { IOT_CAPSTONE, IOT_META, IOT_RELATED, IOT_UNITS, iotStarter } from '@/lib/iot/course'

export const IOT_VIEW: CourseView<IotSimId> = {
  meta: IOT_META, units: IOT_UNITS, capstone: IOT_CAPSTONE, simMeta: IOT_SIM_META,
  sim: (id, lang) => <IotSim id={id} lang={lang} />,
  starter: iotStarter, related: IOT_RELATED,
}
