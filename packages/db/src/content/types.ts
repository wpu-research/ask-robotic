export interface LessonContent {
  title: string
  durationMin: number
  /** Merak uyandıran açılış sorusu / küçük hikâye */
  problem: string
  /** Etkinlik adımları ve ebeveyn notu (Markdown) */
  contentMd: string
  /** Ders sonu konuşma sorusu */
  question: string
}

export interface WeekContent {
  title: string
  project: string
  lessons: LessonContent[]
}

export interface ModuleContent {
  slug: string
  title: string
  track: 'cocuk' | 'maker' | 'ai'
  position: number
  minAge: number
  weeks: WeekContent[]
}
