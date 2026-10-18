import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale } from '@/i18n/server'
import { DEMO_TEXT, DEMOS, MODEL_LABEL, SECTOR_LABEL } from '@/lib/cv-demolar'

export async function generateMetadata(): Promise<Metadata> {
  const T = DEMO_TEXT[await getLocale()]
  return { title: T.title, description: T.lead }
}

/** Gerçek Hayat Demoları: büyükler için 8 bilgisayarlı görü demosu (kartlar). */
export default async function Demolar() {
  const lang = await getLocale()
  const T = DEMO_TEXT[lang]
  return (
    <div className="page cvd-page">
      <header className="page-title">
        <p className="eyebrow">{T.eyebrow}</p>
        <h1>{T.title}</h1>
        <p className="lead">{T.lead}</p>
        <p className="cvd-pipe">{T.pipeline}</p>
      </header>
      <ul className="cvd-grid">
        {DEMOS.map((d) => (
          <li key={d.slug}>
            <Link href={`/robotun-gozleri/demolar/${d.slug}`} className="cvd-card" data-testid={`cvd-card-${d.slug}`}>
              <span className="cvd-card-top" style={{ background: d.color }} aria-hidden="true"><span>{d.emoji}</span><i>{SECTOR_LABEL[d.sector][lang]}</i></span>
              <span className="cvd-card-body">
                <b>{d[lang].title}</b>
                <small>{d[lang].tagline}</small>
                <em>{MODEL_LABEL[d.model][lang]}</em>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="cvd-privacy">🔒 {T.privacy}</p>
      <p><Link href="/robotun-gozleri">← {T.kids}</Link></p>
    </div>
  )
}
