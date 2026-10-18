import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { activityKey } from './jr/activity'
import { LESSON_VIDEOS, lessonVideoFor, youtubeEmbedUrl, type LessonVideo } from './lesson-videos'

const ornek: Record<string, LessonVideo> = {
  'arduino-temelleri:1:3': { youtubeId: 'dQw4w9WgXcQ', lang: 'tr', title: 'LED' },
  'arduino-temelleri:1:4': { youtubeId: 'kisa', lang: 'en' },
  'arduino-temelleri:1:5': { youtubeId: 'abc"><scrip', lang: 'tr' },
}

describe('ders videoları', () => {
  it('anahtarla bulur; girdi yoksa, anahtar boşsa ya da kimlik bozuksa null', () => {
    expect(lessonVideoFor('arduino-temelleri:1:3', ornek)).toEqual({ youtubeId: 'dQw4w9WgXcQ', lang: 'tr', title: 'LED' })
    expect(lessonVideoFor('arduino-temelleri:9:9', ornek)).toBeNull()
    expect(lessonVideoFor(null, ornek)).toBeNull()
    expect(lessonVideoFor('arduino-temelleri:1:4', ornek)).toBeNull()
    expect(lessonVideoFor('arduino-temelleri:1:5', ornek)).toBeNull()
    expect(lessonVideoFor('toString', ornek)).toBeNull()
  })
  it('gömme adresi çerezsiz alan adını kullanır', () => {
    expect(youtubeEmbedUrl('dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0')
  })
  it('tablodaki her anahtar gerçek bir derse karşılık gelir ve kimliği geçerlidir', () => {
    const keys = new Set(allModules.flatMap((m) => m.weeks.flatMap((w, wi) => w.lessons.map((_, li) => activityKey(m.slug, wi + 1, li + 1)))))
    for (const [k, v] of Object.entries(LESSON_VIDEOS)) {
      expect(keys.has(k), k).toBe(true)
      expect(lessonVideoFor(k), k).toEqual(v)
    }
  })
})
