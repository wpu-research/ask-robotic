// Gömülü kurslar (Raspberry Pi ile robotik, ARM STM32 ile gömülü programlama) için ortak veri tipleri.
// Yapı Drone dersiyle aynı düzende: ünite = notlar + simülasyon + kod + "Kendin dene" + 4 soruluk quiz; kod bloğu ve
// quiz bileşenleri ESOF 323'ten (components/robotik). Kod örnekleri tek kaynaktan iki dile: yalnız yorumlar çevrilir.
import type { CodeLine } from '@/lib/ml/core'
import type { CodeBlock, QuizItem } from '@/lib/robotik/course'

export type Lang = 'tr' | 'en'
export type { CodeBlock, QuizItem }

export interface UnitText {
  title: string
  /** Kart ve tablo için tek cümle. */
  summary: string
  goals: string[]
  /** Ders notu (HTML, depodaki sabit içerik). */
  notes: string
  code: CodeBlock[]
  /** "Kendin dene": simülasyonda ve (varsa) gerçek kartta yapılacak adımlar. */
  tryIt: string
  pitfalls: string[]
  /** Yazılım mühendisliği bağlantısı (HTML). */
  se: string
  quiz: QuizItem[]
}

/** Tarayıcıda Python (ML dersinin Pyodide çalıştırıcısı) ile çalışan örnek; veri setleri /veri/ml altından. */
export interface PyExample { file: string; code: CodeLine[]; datasets: string[] }

/** Wokwi'de yeni proje: yalnız Wokwi'nin kendi "yeni proje" adresleri (uydurma proje kimliği yok). */
export interface WokwiTask { board: string; url: string; tr: string[]; en: string[] }

export interface CourseUnit<S extends string> {
  n: number
  /** Önerilen süre (saat): ders + uygulama. */
  hours: number
  sims: S[]
  simCfg?: Partial<Record<S, Record<string, string>>>
  /** Hyvex parça kataloğundaki (lib/muhendislik) ilgili parçalar. */
  hyvex: string[]
  py?: PyExample
  wokwi?: WokwiTask
  /** İlgili ESOF 323 haftası. */
  esofWeek?: number
  tr: UnitText
  en: UnitText
}

export interface CourseText {
  title: string
  short: string
  lede: string
  audience: string
  duration: string
  prereq: string
  outcomes: string[]
  certificate: string
  tools: string[]
}

export interface Deliverable { afterUnit: number; tr: { title: string; deliver: string }; en: { title: string; deliver: string } }
export interface CapstoneText { title: string; summary: string; scenario: string; requirements: string[]; architecture: string[]; tests: string[]; demo: string[] }
export interface Capstone {
  tr: CapstoneText
  en: CapstoneText
  hyvex: string[]
  deliverables: Deliverable[]
  grading: { tr: Array<[string, string]>; en: Array<[string, string]> }
}

export const D = (afterUnit: number, tr: [string, string], en: [string, string]): Deliverable => ({ afterUnit, tr: { title: tr[0], deliver: tr[1] }, en: { title: en[0], deliver: en[1] } })

type Src = (c: (tr: string, en: string) => string) => string
/** Kod bloğu: kod aynı, yalnız yorumlar dile göre c(tr, en). Satır sayısı iki dilde eşit kalır (test eder). */
export const block = (lang: Lang, tr: string, en: string, src: Src): CodeBlock => ({ title: lang === 'en' ? en : tr, src: src((a, b) => (lang === 'en' ? b : a)) })
