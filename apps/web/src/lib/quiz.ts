// Mini test mantığı (saf). Soru tipleri: packages/db/src/content/types.ts.
import type { QuizQuestion } from '@ask/db'
import type { AnswerRecord } from './skills'
import type { AppEvent } from './events'

/** "9,1", "9.1", "9 mA", "−5" gibi girdilerden sayıyı çıkarır; sayı yoksa null. */
export function parseNumber(input: string): number | null {
  const m = input.trim().replace(/−/g, '-').match(/^(-?\d+(?:[.,]\d+)?)\s*[A-Za-zΩΩµ%°/]*$/)
  if (!m) return null
  const n = Number(m[1].replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/** Seçmeli sorularda `answer` seçenek sırasıdır; sayısal soruda değer, `tolerance` (mutlak) kadar sapma kabul edilir. */
export function isCorrect(q: QuizQuestion, answer: number): boolean {
  if (q.kind === 'numeric') return Math.abs(answer - q.answer) <= (q.tolerance ?? 0) + 1e-9
  return answer === q.answer
}

export function correctLabel(q: QuizQuestion): string {
  return q.kind === 'numeric' ? `${String(q.answer).replace('.', ',')}${q.unit ? ' ' + q.unit : ''}` : q.options?.[q.answer] ?? ''
}

/** Beceri ustalığı için cevap kayıtları: her `quiz_answer` olayı; `n` = aynı sorunun kaçıncı çözümü. */
export function answerRecords(events: readonly AppEvent[]): AnswerRecord[] {
  const seen = new Map<string, number>()
  return [...events]
    .sort((a, b) => a.t - b.t)
    .filter((e) => e.type === 'quiz_answer' && typeof e.p?.q === 'string')
    .map((e) => {
      const key = `${e.lessonId ?? 0}:${e.p!.q}`
      const n = (seen.get(key) ?? 0) + 1
      seen.set(key, n)
      return { skills: String(e.p!.sk ?? '').split(',').filter(Boolean), correct: e.p!.ok === true, t: e.t, n }
    })
}

export interface QuizSummary { lessonId: number; attempts: number; lastScore: number; lastTotal: number; bestScore: number; lastT: number }

/** Ders başına tamamlanan mini test özeti (`quiz_done` olaylarından). */
export function quizSummaries(events: readonly AppEvent[]): QuizSummary[] {
  const by = new Map<number, QuizSummary>()
  for (const e of [...events].sort((a, b) => a.t - b.t)) {
    if (e.type !== 'quiz_done' || !e.lessonId) continue
    const score = Number(e.p?.score ?? 0)
    const total = Number(e.p?.total ?? 0)
    if (!(total > 0)) continue
    const prev = by.get(e.lessonId)
    by.set(e.lessonId, { lessonId: e.lessonId, attempts: (prev?.attempts ?? 0) + 1, lastScore: score, lastTotal: total, bestScore: Math.max(prev?.bestScore ?? 0, score), lastT: e.t })
  }
  return [...by.values()].sort((a, b) => b.lastT - a.lastT)
}
