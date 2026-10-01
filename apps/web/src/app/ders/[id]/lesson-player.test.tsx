import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { LessonPlayer } from './lesson-player'

const l = allModules[0].weeks[0].lessons[0]
const props = {
  lesson: { id: 1, title: l.title, durationMin: l.durationMin, problem: l.problem, contentMd: l.contentMd, question: l.question },
  moduleTitle: allModules[0].title,
  moduleSlug: 'scratchjr',
  weekLabel: '1. Hafta: Komut ver, robot yapsın',
  position: { index: 1, total: 10 },
  nextLessonId: 2,
  alreadyDone: false,
}

describe('LessonPlayer', () => {
  it('ilk adımda başlığı, merak sorusunu ve 4 adımı gösterir', () => {
    const html = renderToString(<LessonPlayer {...props} />).replaceAll('&quot;', '"').replaceAll('<!-- -->', '')
    expect(html).toContain(l.title)
    expect(html).toContain(l.problem)
    for (const s of ['Merak', 'Etkinlik', 'Konuşalım', 'Bitti']) expect(html).toContain(s)
    expect(html).toContain('Ders 1/10')
    // etkinlik metni henüz görünmez
    expect(html).not.toContain('Hazırlık')
  })
  it('geri düğmesi ilk adımda devre dışı', () => {
    expect(renderToString(<LessonPlayer {...props} />)).toMatch(/<button[^>]*disabled[^>]*>← Geri/)
  })
})
