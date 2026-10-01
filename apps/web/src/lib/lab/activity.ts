import type { Circuit, PartType, PropValue } from './contract'
import type { LabGoal } from './goals'
import { LAB_ACTIVITIES } from './activities'

export interface LabSetup { circuit: Circuit; code: string }

/** YALNIZ TEST: çözümü çalıştırırken öğrencinin yapacağı etkileşimleri (butona bas, kaydırıcıyı oynat, seriye yaz) betimler. */
export interface LabScenario {
  /** Benzetimi ms kadar ilerletir (hedef istatistikleri içeride toplanır). */
  advance(ms: number): void
  setProp(partId: string, key: string, value: PropValue): void
  sendSerial(text: string): void
  /** Şu anki benzetim durumu (seri çıktı vb. okumak için). */
  readonly serial: string
}

/** Bir dersin Etkinlik adımında, yazının altında açılan devre laboratuvarı etkinliği. */
export interface LabActivity {
  /** Kısa yönerge (laboratuvarın üstünde gösterilir). */
  intro?: string
  /** Her çağrıda taze başlangıç devresi ve kodu üretir. */
  starter: () => LabSetup
  /** Paletle sunulan parça türleri; verilmezse laboratuvarın varsayılanı. */
  allowedParts?: PartType[]
  goals: LabGoal[]
  /** YALNIZ TEST: tüm hedefleri sağlayan örnek çözüm (devre + kod). */
  solution?: () => LabSetup
  /** YALNIZ TEST: çözüm çalışırken yapılacak etkileşimler. Verilmezse çözüm 3 sn çalıştırılır. */
  scenario?: (s: LabScenario) => void
}

/** Anahtar: "<modül slug>:<hafta>:<ders>" (Jr etkinlikleriyle aynı biçim). */
export const getLabActivity = (key: string | null | undefined): LabActivity | null => (key ? LAB_ACTIVITIES[key] ?? null : null)
export const allLabActivities = () => Object.entries(LAB_ACTIVITIES)
