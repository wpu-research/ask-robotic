// Sensör-ML dersinin ortak sayfa görünümüne (components/kurs/course-pages) verilen veri: künye, üniteler, proje ve simülasyonlar.
import type { CourseView } from '@/components/kurs/course-pages'
import { SensorSim } from '@/components/sensor-ml/sims'
import { SENSOR_SIM_META, type SensorSimId } from '@/components/sensor-ml/sim-meta'
import { SML_CAPSTONE, SML_META, SML_RELATED, SML_UNITS, smlStarter } from '@/lib/sensor-ml/course'

export const SML_VIEW: CourseView<SensorSimId> = {
  meta: SML_META, units: SML_UNITS, capstone: SML_CAPSTONE, simMeta: SENSOR_SIM_META,
  sim: (id, lang) => <SensorSim id={id} lang={lang} />,
  starter: smlStarter, related: SML_RELATED,
}
