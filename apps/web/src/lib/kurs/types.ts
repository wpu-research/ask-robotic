// Büyükler için ünite tabanlı derslerin (IoT, Sensör verisinden ML) ortak veri biçimi. Drone dersinin yapısıyla aynı fikir:
// ünite = hedefler + ders notu + tarayıcı simülasyonu + kod + "Kendin dene" + sık hatalar + YM bağlantısı + 4 soruluk quiz.
// Kod bloğu ve quiz biçimi ESOF 323 bileşenlerinden (CodeBlock, Quiz) gelir.
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
  /** "Kendin dene": simülasyonda ve kodda yapılacak görev. */
  lab: string
  pitfalls: string[]
  /** Yazılım mühendisliği bağlantısı (HTML). */
  se: string
  quiz: QuizItem[]
}

export interface RelLink { href: string; tr: string; en: string }

export interface CourseUnit<S extends string = string> {
  n: number
  sims: S[]
  /** Hyvex parça slug'ları (laboratuvar kiti olanlar "Laboratuvarda aç" bağlantısı alır). */
  parts: string[]
  /** Wokwi'de ESP32 ile denenebilir. */
  wokwi?: boolean
  /** Site içi ilgili sayfalar (ML dersi, laboratuvar, öbür kurs). */
  related?: RelLink[]
  /** Tarayıcıda çalışan Python (Pyodide): kod satırları (TR/EN yorumlu) ve açılan veri setlerinin kimlikleri (lib/ml/veri). */
  py?: { file: string; code: CodeLine[]; data: string[] }
  tr: UnitText
  en: UnitText
}

interface MetaText {
  title: string
  lede: string
  /** Hedef kitle. */
  audience: string
  /** Süre (hafta / saat). */
  duration: string
  prereq: string
  outcomes: string[]
  certificate: string
}
export interface CourseMeta {
  /** /muhendislik/<slug> */
  slug: string
  /** Kart üstündeki kısa kod (IOT, SENSÖR-ML…). */
  code: string
  hours: number
  tr: MetaText
  en: MetaText
}

export interface Deliverable { afterUnit: number; tr: { title: string; deliver: string }; en: { title: string; deliver: string } }
export interface CapText { title: string; summary: string; scenario: string; requirements: string[]; architecture: string[]; tests: string[]; demo: string[] }
export interface Capstone { tr: CapText; en: CapText; parts: string[]; deliverables: Deliverable[]; grading: Array<{ tr: string; en: string; pct: number }> }

export const D = (afterUnit: number, tr: [string, string], en: [string, string]): Deliverable => ({ afterUnit, tr: { title: tr[0], deliver: tr[1] }, en: { title: en[0], deliver: en[1] } })

// --- OpenCV / PyTorch dersleri (Kurs* tipleri) ---
/** Kod örneği. `run`: tarayıcıda gerçek Python ile çalıştırılabilir (OpenCV dersinde Pyodide + opencv-python). */
export interface KursCode extends CodeBlock { run?: boolean }

export interface KursUnitText {
  title: string
  /** Kart ve tablo için tek cümle. */
  summary: string
  goals: string[]
  /** Ders notu (HTML, depodaki sabit içerik). */
  notes: string
  code: KursCode[]
  /** "Kendin dene": araçta yapılacak görev. */
  lab: string
  pitfalls: string[]
  /** Yazılım mühendisliği bağlantısı (HTML). */
  se: string
  quiz: QuizItem[]
}

export interface KursUnitText {
  title: string
  /** Kart ve tablo için tek cümle. */
  summary: string
  goals: string[]
  /** Ders notu (HTML, depodaki sabit içerik). */
  notes: string
  code: KursCode[]
  /** "Kendin dene": araçta yapılacak görev. */
  lab: string
  pitfalls: string[]
  /** Yazılım mühendisliği bağlantısı (HTML). */
  se: string
  quiz: QuizItem[]
}

export interface KursUnit<T extends string> {
  n: number
  /** Ünitede gösterilen tarayıcı araçları (dersin araç kimlikleri). */
  tools: T[]
  toolCfg?: Partial<Record<T, Record<string, string>>>
  /** Colab defteri (public/defterler/<ders>/<ad>.ipynb ve <ad>.en.ipynb); yalnız defteri olan derslerde. */
  notebook?: string
  tr: KursUnitText
  en: KursUnitText
}

export interface KursMetaText {
  title: string
  lede: string
  /** Hedef kitle (16+). */
  audience: string
  prereq: string
  /** Kazanımlar. */
  outcomes: string[]
}

export interface KursMeta {
  slug: string
  /** Kart rozeti (ör. OPENCV). */
  code: string
  /** Toplam süre (saat). */
  hours: number
  tr: KursMetaText
  en: KursMetaText
}

export interface KursCapstone { tr: CapText; en: CapText; deliverables: Deliverable[]; notebook?: string }

/** Sertifika notu (iki ders için aynı). */
export const CERT_NOTE = {
  tr: 'Tüm üniteleri ve bitirme projesini tamamlayana Macademia katılım belgesi verilir.',
  en: 'Completing all units and the capstone earns a Macademia certificate of participation.',
} as const
