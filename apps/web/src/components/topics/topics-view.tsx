'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { CatalogModule } from '@/lib/catalog'
import { localizeCatalog } from '@/lib/catalog-en'
import { countDone, moduleLessonIds } from '@/lib/dashboard'
import { BANDS, bandForAge, bandText, SECTIONS, sectionLabel, TOPICS, topicText, type BandKey } from '@/lib/learning-paths'
import { useLocale, useT } from '@/i18n/client'
import { useProfile } from '@/lib/profile'
import { useDoneIds } from '@/lib/progress-store'

const ICON: Record<string, string> = { 'blokla-kodlama': '🧩', 'oyun-yapimi': '🎮', 'mikro-kart': '🔆', arduino: '💡', 'elektronik-muhendisligi': '🔌', robotik: '🤖', 'robotik-muhendisligi': '🚁', 'yapay-zeka': '🧠' }

/**
 * Konu kataloğu (Brilliant "Topics" gibi): bölüm → konu satırı (seviye etiketi, ad, tek cümlelik vaat).
 * Satır açılınca konunun kursları önerilen sırayla; profil varsa öğrencinin bandı seçili gelir.
 */
export function TopicsView({ catalog: catalogTr }: { catalog: CatalogModule[] }) {
  const profile = useProfile()
  const t = useT()
  const locale = useLocale()
  // Modül adı/tanıtımı ve ders başlıkları dile göre (lib/catalog-en.ts)
  const catalog = useMemo(() => localizeCatalog(catalogTr, locale), [catalogTr, locale])
  const done = useDoneIds()
  const [band, setBand] = useState<BandKey | 'hepsi'>('hepsi')
  const [open, setOpen] = useState<string | null>(null)
  useEffect(() => {
    if (!profile) return
    setBand(bandForAge(profile.age).key)
    setOpen(TOPICS.find((x) => x.courses.includes(profile.course))?.key ?? null)
  }, [profile])

  const topics = TOPICS.filter((x) => band === 'hepsi' || x.bands.includes(band))
  const sel = band === 'hepsi' ? null : bandText(BANDS.find((b) => b.key === band)!, locale)
  return (
    <div className="page topics">
      <header className="page-title">
        <h1>{t('topics.title')}</h1>
        <p className="muted">{t('topics.intro')}</p>
      </header>

      <div className="tp-bands" role="group" aria-label={t('topics.bandGroup')}>
        <button type="button" aria-pressed={band === 'hepsi'} onClick={() => setBand('hepsi')}>{t('topics.all')}</button>
        {BANDS.map((b) => (
          <button key={b.key} type="button" aria-pressed={band === b.key} onClick={() => setBand(b.key)}>
            <b>{bandText(b, locale).title}</b><small>{bandText(b, locale).ages}</small>
          </button>
        ))}
      </div>
      {sel && <p className="tp-band-blurb">{sel.grades} · {sel.blurb}</p>}

      {SECTIONS.map((sec) => {
        const list = topics.filter((x) => x.section === sec)
        if (!list.length) return null
        return (
          <section key={sec} aria-labelledby={`sec-${sec}`}>
            <h2 id={`sec-${sec}`} className="tp-section">{sectionLabel(sec, locale)}</h2>
            <ul className="tp-list">
              {list.map((tp) => {
                const tt = topicText(tp, locale)
                const isOpen = open === tp.key
                const mine = profile && tp.courses.includes(profile.course)
                return (
                  <li key={tp.key} className={`tp-row ${isOpen ? 'open' : ''}`}>
                    <button type="button" className="tp-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : tp.key)}>
                      <span className="tp-icon" aria-hidden="true">{ICON[tp.key]}</span>
                      <span className="tp-text">
                        <small>{tt.label}{mine && <span className="tp-mine">{t('topics.yourPlan')}</span>}</small>
                        <b>{tt.title}</b>
                        <span>{tt.promise}</span>
                      </span>
                      <span className="tp-chev" aria-hidden="true">⌄</span>
                    </button>
                    {isOpen && (
                      <ol className="tp-courses">
                        {tp.courses.map((slug, i) => {
                          const m = catalog.find((x) => x.slug === slug)
                          if (!m) return null
                          const ids = moduleLessonIds(m)
                          const c = countDone(ids, done)
                          const first = m.weeks[0]?.lessons[0]
                          const v2 = m.weeks.reduce((n, w) => n + w.lessons.filter((l) => l.steps).length, 0)
                          return (
                            <li key={slug} className="tp-course">
                              <span className="tp-step" aria-hidden="true">{i + 1}</span>
                              <div>
                                <b>{m.title}</b>
                                <p className="muted">{m.tagline}</p>
                                <small>{t('topics.lessons', { n: ids.length })} · {t('topics.weeks', { n: m.weeks.length })}{v2 ? ` · ${t('topics.interactive', { n: v2 })}` : ''}{c.done ? ` · ${t('topics.donePct', { n: c.pct })}` : ''}</small>
                              </div>
                              <div className="tp-go">
                                <Link className="v2-btn ghost" href={`/moduller/${slug}`}>{t('topics.map')}</Link>
                                {first && <Link className="v2-btn accent" href={`/ders/${first.id}`}>{c.done ? t('topics.continue') : t('topics.start')}</Link>}
                              </div>
                            </li>
                          )
                        })}
                        {tp.links?.map((l, i) => {
                          const lt = locale === 'en' ? l.en : l
                          return (
                            <li key={l.href} className="tp-course">
                              <span className="tp-step" aria-hidden="true">{tp.courses.length + i + 1}</span>
                              <div><b>{lt.title}</b><p className="muted">{lt.text}</p></div>
                              <div className="tp-go"><Link className="v2-btn accent" href={l.href}>{t('topics.start')}</Link></div>
                            </li>
                          )
                        })}
                        {tt.soon?.map((s) => <li key={s} className="tp-course soon"><span className="tp-step" aria-hidden="true">…</span><div><b>{s}</b><small>{t('topics.soon')}</small></div></li>)}
                      </ol>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
      {!profile && profile !== undefined && (
        <p className="tp-cta">{t('topics.ctaQuestion')} <Link href="/basla">{t('topics.ctaLink')}</Link></p>
      )}
    </div>
  )
}
