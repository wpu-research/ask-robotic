import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { LessonPlayer } from '@/app/ders/[id]/lesson-player'
import { ConceptCards } from './concept-cards'
import { ConsentBanner, CONSENT_TEXT } from './consent-banner'
import { PartsIndex } from './parts-index'
import { QuizPlayer } from './quiz-player'
import { PART_GUIDES } from '@/lib/parca-rehberi'
import { NAV, isActive } from '@/components/shell/nav-items'
import { STATIC_ITEMS } from '@/lib/command-palette'
import { buildPaletteItems } from '@/lib/palette-index'

const clean = (h: string) => h.replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('<!-- -->', '')
const m3 = allModules.find((m) => m.slug === 'arduino-temelleri')!
const l1 = m3.weeks[0].lessons[2] // Blink
const base = {
  lesson: { id: 3, title: l1.title, durationMin: l1.durationMin, problem: l1.problem, contentMd: l1.contentMd, question: l1.question, explainerMd: l1.explainerMd, concepts: l1.concepts, quiz: l1.quiz },
  moduleTitle: m3.title, moduleSlug: m3.slug, trackClass: 'track-maker', weekLabel: '1. hafta: Temeller',
  position: { index: 3, total: 35 }, prevLessonId: 2, nextLessonId: 4, activityKey: null as string | null, serverSync: false, serverDone: [] as number[],
}

describe('ders oynatıcı: anlatım ve test adımları', () => {
  it('anlatım ve test varsa 6 adım gösterir; sıra Merak, Anlatım, Etkinlik, Test, Konuşalım, Bitti', () => {
    const h = clean(renderToString(<LessonPlayer {...base} />))
    const labels = [...h.matchAll(/<span class="label">([^<]+)<\/span>/g)].map((x) => x[1])
    expect(labels).toEqual(['Merak', 'Anlatım', 'Etkinlik', 'Test', 'Konuşalım', 'Bitti'])
  })
  it('anlatım/test yoksa eski 4 adım kalır (geriye uyumlu)', () => {
    const h = clean(renderToString(<LessonPlayer {...base} lesson={{ ...base.lesson, explainerMd: undefined, concepts: undefined, quiz: undefined }} />))
    const labels = [...h.matchAll(/<span class="label">([^<]+)<\/span>/g)].map((x) => x[1])
    expect(labels).toEqual(['Merak', 'Etkinlik', 'Konuşalım', 'Bitti'])
  })
  it('yalnız test varsa Anlatım adımı çıkmaz', () => {
    const h = clean(renderToString(<LessonPlayer {...base} lesson={{ ...base.lesson, explainerMd: undefined, concepts: undefined }} />))
    const labels = [...h.matchAll(/<span class="label">([^<]+)<\/span>/g)].map((x) => x[1])
    expect(labels).toEqual(['Merak', 'Etkinlik', 'Test', 'Konuşalım', 'Bitti'])
  })
})

describe('kavram kartları ve mini test', () => {
  it('kavram kartları terim, tanım, örnek ve sık yapılan yanlışı gösterir', () => {
    const h = clean(renderToString(<ConceptCards concepts={l1.concepts!} />))
    for (const c of l1.concepts!) { expect(h).toContain(c.term); expect(h).toContain('Sık yapılan yanlış') }
  })
  it('mini test ilk soruyu seçenekleriyle gösterir; cevap verilene kadar sonraki soru kapalıdır', () => {
    const q = l1.quiz!
    const h = clean(renderToString(<QuizPlayer lessonId={3} questions={q} />))
    expect(h).toContain(`Soru 1 / ${q.length}`)
    expect(h).toContain('Mini test')
    for (const o of q[0].options ?? []) expect(h).toContain(o.replace(/&/g, '&amp;'))
    expect(h).toMatch(/<button[^>]*disabled[^>]*>Sonraki soru/)
    expect(h).not.toContain('quiz-feedback')
  })
  it('sayısal soruda giriş kutusu ve birim görünür', () => {
    const num = m3.weeks[0].lessons[1].quiz!.filter((x) => x.kind === 'numeric')
    const h = clean(renderToString(<QuizPlayer questions={num} />))
    expect(h).toContain('inputMode="decimal"')
    expect(h).toContain('quiz-unit">mA')
    expect(h).toContain('Kontrol et')
  })
})

describe('onay bandı ve gezinme', () => {
  it('onay bandı sunucuda çizilmez (karar okunana kadar gizli)', () => {
    expect(renderToString(<ConsentBanner />)).toBe('')
  })
  it('onay metni taslak olduğunu, 16 yaş uyarısını ve silme hakkını söyler', () => {
    expect(CONSENT_TEXT.draft).toMatch(/taslak/i)
    expect(CONSENT_TEXT.minor).toMatch(/16 yaşından küçük/)
    expect(CONSENT_TEXT.body).toMatch(/Verilerimi sil/)
    expect(CONSENT_TEXT.body).toMatch(/e-posta ya da IP adresi kaydedilmez/)
  })
  it('kenar çubuğunda Parçalar, Testlerim ve İlerlemem aktif bağlantılardır', () => {
    const items = NAV.flatMap((g) => g.items)
    for (const href of ['/parcalar', '/testler', '/ilerleme']) {
      const it = items.find((i) => i.href === href)!
      expect(it, href).toBeDefined()
      expect(it.soon, href).toBeFalsy()
    }
    expect(items.some((i) => i.soon)).toBe(false)
    expect(isActive('/parcalar', '/parcalar/led')).toBe(true)
  })
  it('komut paletinde sayfalar ve parça sayfaları bulunur', () => {
    const hrefs = STATIC_ITEMS.map((i) => i.href)
    expect(hrefs).toEqual(expect.arrayContaining(['/parcalar', '/testler', '/ilerleme']))
    const items = buildPaletteItems([])
    expect(items.filter((i) => i.id.startsWith('pg:')).map((i) => i.href).sort()).toEqual(PART_GUIDES.map((g) => `/parcalar/${g.slug}`).sort())
  })
  it('parça dizini 6 parçayı kategori başlıklarıyla listeler', () => {
    const h = clean(renderToString(<PartsIndex guides={[...PART_GUIDES]} />))
    expect(h).toContain('6 parça')
    for (const g of PART_GUIDES) expect(h).toContain(`/parcalar/${g.slug}`)
    for (const c of new Set(PART_GUIDES.map((g) => g.category))) expect(h).toContain(c)
  })
})
