/** Kavram kartı: dersin anahtar terimi. */
export interface Concept {
  term: string
  definition: string
  /** Tek cümlelik somut örnek */
  example: string
  /** Sık yapılan yanlış / tuzak */
  pitfall: string
}

export type QuizKind = 'mcq' | 'predict-output' | 'find-bug' | 'numeric'

/**
 * Mini test sorusu.
 * - mcq / predict-output / find-bug: `options` zorunlu, `answer` = doğru seçeneğin 0 tabanlı sırası.
 * - numeric: `options` yok, `answer` = doğru sayı; `tolerance` (mutlak, varsayılan 0) ve `unit` opsiyonel.
 * `skills`: lib/skills.ts'teki beceri kimlikleri.
 */
export interface QuizQuestion {
  id: string
  kind: QuizKind
  prompt: string
  options?: string[]
  answer: number
  tolerance?: number
  unit?: string
  explanation: string
  skills: string[]
}

export interface LessonContent {
  title: string
  durationMin: number
  /** Merak uyandıran açılış sorusu / küçük hikâye */
  problem: string
  /** Etkinlik adımları ve ebeveyn notu (Markdown) */
  contentMd: string
  /** Ders sonu konuşma sorusu */
  question: string
  /** Konu anlatımı (Markdown), opsiyonel */
  explainerMd?: string
  /** Kavram kartları (3-6), opsiyonel */
  concepts?: Concept[]
  /** Mini test (3-5 soru), opsiyonel */
  quiz?: QuizQuestion[]
}

export interface WeekContent {
  title: string
  project: string
  lessons: LessonContent[]
  /** Haftalık çalışma rehberi (Markdown), opsiyonel */
  guideMd?: string
}

export interface ModuleContent {
  slug: string
  title: string
  track: 'cocuk' | 'maker' | 'ai'
  position: number
  minAge: number
  weeks: WeekContent[]
}

/** Parça ansiklopedisi maddesi (içerik dosyası: content-src/parcalar/*.md -> parcalar.generated.ts). */
export interface ComponentGuide {
  slug: string
  title: string
  /** Laboratuvar parça türü (packages/sim contract.ts PartType); pin adları buna göre doğrulanır. */
  partType: string
  category: string
  summary: string
  /** Pinler: ad (contract.ts ile aynı) + açıklama */
  pins: { name: string; description: string }[]
  howItWorksMd: string
  wiringMd: string
  /** Tipik değerler: etiket, değer, not */
  typicalValues: { label: string; value: string; note?: string }[]
  commonMistakesMd: string
  /** İlgili dersler: "modül-slug:hafta:ders" */
  relatedLessons: string[]
}
