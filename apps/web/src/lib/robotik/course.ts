// ESOF 323 Robotics (Nişantaşı Üniversitesi, Yazılım Mühendisliği 3. sınıf, Dr. Murat Arslan) ile platform içeriğinin harmanı.
// weeks.json: 14 hafta, TR/EN. ESOF haftaları ders sitesinden (Türkçesi çeviri), 3/10/11/14. haftalar platform için yazıldı.
import type { SimId } from '@/components/robotik/sim-meta'
import { partBySlug, type EngPart } from '@/lib/muhendislik/catalog'
import type { CourseKitName } from './kits'
import data from './weeks.json'

export type Lang = 'tr' | 'en'
export interface CodeBlock { title: string; src: string }
export interface QuizItem { q: string; options: string[]; answer: number; why: string }
export interface WeekText {
  title: string; tools: string; goals: string[]; notes: string; code: CodeBlock[]; lab: string; hw: string
  /** Derinlemesine bölüm (HTML, çözümlü örneklerle). */
  deep: string
  /** Sık yapılan hatalar. */
  pitfalls: string[]
  /** Yazılım mühendisliği bağlantısı (HTML). */
  se: string
  /** Kendini sına: 4 çoktan seçmeli soru. */
  quiz: QuizItem[]
}
export interface Week {
  n: number
  sims: SimId[]
  simCfg: Partial<Record<SimId, Record<string, string>>>
  /** Bu haftanın Hyvex donanımı (parça slug'ları). */
  parts: string[]
  /** Laboratuvarda açılan Hyvex parçaları (slug; /laboratuvar?parca=). */
  kits: string[]
  /** Wokwi'de çalışılan kartlar. */
  wokwi: Array<'esp32' | 'stm32'>
  /** Derse özel laboratuvar kit(ler)i (/laboratuvar?kit=). */
  courseKit?: CourseKitName | CourseKitName[] | null
  /** Site içi ilgili sayfalar (ör. 11. hafta → Makine Öğrenmesi kursu). */
  related?: Array<{ href: string; tr: string; en: string }>
  exam: boolean
  tr: WeekText
  en: WeekText
}

export const WEEKS: readonly Week[] = data as Week[]
export const weekOf = (n: number): Week | undefined => WEEKS.find((w) => w.n === n)
export const partsOf = (w: Week): EngPart[] => w.parts.map(partBySlug).filter((p): p is EngPart => !!p)
export const kitPartsOf = (w: Week): EngPart[] => w.kits.map(partBySlug).filter((p): p is EngPart => !!p && !!p.lab)
/** Haftanın derse özel laboratuvar kitlerinin adları (tek ya da birden çok). */
export const courseKitNames = (w: Week): CourseKitName[] => (Array.isArray(w.courseKit) ? w.courseKit : w.courseKit ? [w.courseKit] : [])

export const WOKWI: Record<'esp32' | 'stm32', { href: string; tr: string; en: string }> = {
  esp32: { href: 'https://wokwi.com/projects/new/esp32', tr: 'Wokwi\'de yeni ESP32 projesi', en: 'New ESP32 project in Wokwi' },
  stm32: { href: 'https://wokwi.com', tr: 'Wokwi\'de STM32 (New project → STM32 Nucleo)', en: 'STM32 in Wokwi (New project → STM32 Nucleo)' },
}

/** Ders künyesi (ESOF 323 sitesinden). */
export const COURSE = {
  code: 'ESOF 323',
  instructor: 'Dr. Murat Arslan',
  tr: {
    title: 'Robotik', university: 'Nişantaşı Üniversitesi · Yazılım Mühendisliği', term: '2026–2027 Güz',
    lede: 'Robotlar nasıl algılar, karar verir ve eyler: tarayıcıda çalıştırabildiğin kodla gömülü denetim, kinematik, planlama, konum belirleme, bilgisayarlı görü, derin öğrenme ve drone\'lar. Donanım gerekmez; her şey simülasyonda.',
    facts: [['Kredi', '6 AKTS / 3 kredi'], ['Dil', 'İngilizce (bu sitede Türkçe de)'], ['Öğretim üyesi', 'Dr. Murat Arslan'], ['Zaman', 'Cuma 09:00–11:55'], ['Haftalık düzen', 'Ders 09:00–10:25, laboratuvar 10:30–11:55'], ['Derslik', 'C180, Neotech Kampüsü, Maslak'], ['Devam', 'Derse en az %70, uygulamaya %80']],
  },
  en: {
    title: 'Robotics', university: 'Nişantaşı University · Software Engineering', term: 'Fall 2026–2027',
    lede: 'How robots sense, decide and act, taught through code you can run in your browser: embedded control, kinematics, planning, localization, computer vision, deep learning and drones. No hardware needed; everything runs in simulation.',
    facts: [['ECTS / national credit', '6 ECTS / 3 credits'], ['Language', 'English (Turkish also on this site)'], ['Instructor', 'Dr. Murat Arslan'], ['Time', 'Fridays 09:00–11:55'], ['Weekly format', 'Lecture 09:00–10:25, lab 10:30–11:55'], ['Room', 'C180, Neotech Campus, Maslak'], ['Attendance', 'At least 70% lecture, 80% practice']],
  },
} as const
