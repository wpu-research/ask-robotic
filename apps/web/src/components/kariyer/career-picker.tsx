'use client'
// Yol haritası: hedef seçimi. Seçilen hedef adres çubuğunda (#hedef-<slug>) tutulur, böylece bağlantı paylaşılabilir.
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n/client'
import { CAREERS, COURSES, STAGES, careerHours, careerOf, stageOf } from '@/lib/kariyer'

const PREFIX = '#hedef-'

export function CareerPicker() {
  const lang = useLocale()
  const en = lang === 'en'
  const [slug, setSlug] = useState(CAREERS[0].slug)

  useEffect(() => {
    const fromHash = () => { const s = window.location.hash.startsWith(PREFIX) ? window.location.hash.slice(PREFIX.length) : ''; if (careerOf(s)) setSlug(s) }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [])

  const pick = (s: string) => { setSlug(s); history.replaceState(null, '', PREFIX + s) }
  const c = careerOf(slug)!
  const t = c[lang]
  const stageN = (h: string) => STAGES.findIndex((s) => s.key === stageOf(h)) + 1

  return (
    <div className="yh-picker">
      <div className="yh-goals" role="radiogroup" aria-label={en ? 'Goal' : 'Hedef'}>
        {CAREERS.map((g) => (
          <button key={g.slug} type="button" role="radio" aria-checked={g.slug === slug} className="yh-goal" data-testid={`goal-${g.slug}`} onClick={() => pick(g.slug)}>
            {g[lang].title}
          </button>
        ))}
      </div>

      <article className="yh-plan" aria-live="polite" data-testid="goal-plan">
        <h3>{t.title}</h3>
        <p className="lead">{t.summary}</p>
        <dl className="pg-meta">
          <div><dt>{en ? 'Courses' : 'Ders'}</dt><dd className="big">{c.core.length}</dd></div>
          <div><dt>{en ? 'Total' : 'Toplam'}</dt><dd className="big">{careerHours(c)} {en ? 'h' : 'saat'}</dd></div>
          <div><dt>{en ? 'Where you work' : 'Nerede çalışırsın'}</dt><dd>{t.work}</dd></div>
        </dl>
        <h4>{en ? 'Finish these, in order' : 'Bunları sırayla bitir'}</h4>
        <ol className="pg-chain">
          {c.core.map((h) => (
            <li key={h}>
              <Link href={h}><b>{COURSES[h][lang].title}</b><span className="h">{COURSES[h].hours} {en ? 'h' : 'sa'} · {en ? 'Stage' : 'Aşama'} {stageN(h)}</span><small>{COURSES[h][lang].topics}</small></Link>
            </li>
          ))}
        </ol>
        {c.extra.length > 0 && (
          <>
            <h4>{en ? 'Recommended next' : 'Sonra önerilen'}</h4>
            <ul className="yh-extra">
              {c.extra.map((h) => <li key={h}><Link className="eng-chip" href={h}>{COURSES[h][lang].title}</Link></li>)}
            </ul>
          </>
        )}
      </article>
    </div>
  )
}
