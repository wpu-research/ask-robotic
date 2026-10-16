'use client'
import { ACTIVITIES } from './activities'

export function LessonActivity({ n, lang }: { n: number; lang: 'tr' | 'en' }) {
  const A = ACTIVITIES[n - 1]
  return A ? <A lang={lang} /> : null
}
