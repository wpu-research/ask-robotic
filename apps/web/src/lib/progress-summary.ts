// İlerlemem özeti (saf): olay günlüğünden toplam süre, olay sayıları ve test özeti. Hiçbir değer uydurulmaz; veri yoksa sıfır döner.
import type { AppEvent, EventType } from './events-core'
import { quizSummaries, type QuizSummary } from './quiz'

export interface EventSummary {
  total: number
  seconds: number
  counts: Partial<Record<EventType, number>>
  lessonsViewed: number
  quizzes: QuizSummary[]
  /** Çözülen testlerin en iyi puanlarının ortalaması (0-1); test yoksa null. */
  quizAvg: number | null
}

export function summarizeEvents(events: readonly AppEvent[]): EventSummary {
  const counts: Partial<Record<EventType, number>> = {}
  let seconds = 0
  const viewed = new Set<number>()
  for (const e of events) {
    counts[e.type] = (counts[e.type] ?? 0) + 1
    if (e.type === 'lesson_leave') seconds += Math.min(1800, Math.max(0, Number(e.p?.sec ?? 0)))
    if (e.type === 'lesson_view' && e.lessonId) viewed.add(e.lessonId)
  }
  const quizzes = quizSummaries(events)
  // En iyi puan oranı: bestScore / (son testteki soru sayısı)
  const quizAvg = quizzes.length ? quizzes.reduce((s, q) => s + q.bestScore / q.lastTotal, 0) / quizzes.length : null
  return { total: events.length, seconds, counts, lessonsViewed: viewed.size, quizzes, quizAvg }
}

/** 90 sn -> "2 dk", 3700 sn -> "1 sa 2 dk", 0 -> "0 dk". */
export function durationLabel(sec: number): string {
  const m = Math.round(sec / 60)
  if (m < 60) return `${m} dk`
  return `${Math.floor(m / 60)} sa ${m % 60} dk`
}
