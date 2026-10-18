// Büyükler için ünite tabanlı dersler (OpenCV, PyTorch) ortak veri yapısı. Drone dersiyle aynı düzen: ünite metni iki dilde
// eşit yapıda, her ünitede tarayıcıda çalışan araç(lar), kod, "Kendin dene", sık hatalar, YM bağlantısı ve 4 soruluk quiz.
import type { CodeBlock, QuizItem } from '@/lib/robotik/course'

export type Lang = 'tr' | 'en'

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

export interface CapText { title: string; summary: string; scenario: string; requirements: string[]; architecture: string[]; tests: string[]; demo: string[] }
export interface Deliverable { afterUnit: number; tr: { title: string; deliver: string }; en: { title: string; deliver: string } }
export interface KursCapstone { tr: CapText; en: CapText; deliverables: Deliverable[]; notebook?: string }

export const D = (afterUnit: number, tr: [string, string], en: [string, string]): Deliverable => ({ afterUnit, tr: { title: tr[0], deliver: tr[1] }, en: { title: en[0], deliver: en[1] } })

/** Sertifika notu (iki ders için aynı). */
export const CERT_NOTE = {
  tr: 'Tüm üniteleri ve bitirme projesini tamamlayana Macademia katılım belgesi verilir.',
  en: 'Completing all units and the capstone earns a Macademia certificate of participation.',
} as const
