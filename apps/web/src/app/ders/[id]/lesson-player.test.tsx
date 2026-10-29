import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { LessonPlayer } from './lesson-player'

const l = allModules[0].weeks[0].lessons[0]
const props = {
  lesson: { id: 1, title: l.title, durationMin: l.durationMin, problem: l.problem, contentMd: l.contentMd, question: l.question },
  moduleTitle: allModules[0].title,
  moduleSlug: 'scratchjr',
  trackClass: 'track-cocuk',
  weekLabel: '1. hafta: Komut ver, robot yapsın',
  position: { index: 1, total: 10 },
  prevLessonId: null as number | null,
  nextLessonId: 2,
  activityKey: null as string | null,
  serverSync: false,
  serverDone: [] as number[],
}
const html = (p = props) => renderToString(<LessonPlayer {...p} />).replaceAll('&quot;', '"').replaceAll('<!-- -->', '')

describe('LessonPlayer', () => {
  it('misafire şerit ve kampanya rozeti çıkar; üyeye çıkmaz', () => {
    const g = html({ ...props, guest: true, promo: 'İlk 1000 kayda 6 ay Premium ücretsiz — kalan: 5' } as typeof props)
    expect(g).toContain('data-testid="guest-bar"')
    expect(g).toContain('İlk 1000 kayda 6 ay Premium ücretsiz')
    expect(g).toContain('/kayit?next=%2Fders%2F1%3Fklasik%3D1')
    expect(html()).not.toContain('guest-bar')
  })
  it('ilk adımda başlığı, merak sorusunu ve 4 adımı gösterir', () => {
    const h = html()
    expect(h).toContain(l.title)
    expect(h).toContain(l.problem)
    for (const s of ['Merak', 'Etkinlik', 'Konuşalım', 'Bitti']) expect(h).toContain(s)
    expect(h).toContain('Ders 1 / 10')
    expect(h).not.toContain('Hazırlık') // etkinlik metni henüz görünmez
  })
  it('ilk dersin ilk adımında "Geri" yerine hiçbir şey yoktur; önceki ders varsa bağlantı gösterir', () => {
    expect(html()).not.toContain('Önceki ders')
    expect(html({ ...props, prevLessonId: 5 })).toContain('/ders/5')
  })
  it('ilk adım "aria-current" ile işaretlenir ve klavye ipucu görünür', () => {
    const h = html()
    expect(h).toContain('aria-current="step"')
    expect(h).toContain('← → tuşlarıyla')
  })
  it('breadcrumb modül sayfasına bağlanır', () => {
    expect(html()).toContain('href="/moduller/scratchjr"')
  })
})
