import type { Metadata } from 'next'
import Link from 'next/link'
import { SEASONS, seasonMaxScore, seasonPhase } from '@/lib/mikro/sezon'
import { SeasonField } from '@/components/mikro/season-field'
import { formatDate } from '@/i18n/format'
import { getLocale, getT } from '@/i18n/server'
import '../../ogretmen.css'
import './sezon.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('season.metaTitle') }
}

export default async function Sezonlar() {
  const t = await getT()
  const locale = await getLocale()
  const en = locale === 'en'
  const now = new Date()
  return (
    <div className="page og sz">
      <div className="og-head">
        <div>
          <p className="v2-eyebrow">{t('season.eyebrow')}</p>
          <h1>{t('season.title')}</h1>
          <p className="muted" style={{ maxWidth: 760 }}>{t('season.lead')}</p>
        </div>
        <Link className="btn btn-ghost" href="/ogretmen/sezonlar">{t('season.teacherCta')}</Link>
      </div>
      <div className="sz-cards">
        {SEASONS.map((s) => {
          const phase = seasonPhase(s, now)
          return (
            <article key={s.id} className="panel sz-card" data-testid={`season-card-${s.id}`}>
              <div className="og-head">
                <h2>{en ? s.en.title : s.title}</h2>
                <span className={`sz-phase ${phase}`}>{t(`season.phase.${phase}`)}</span>
              </div>
              <SeasonField scene={s.field.scene()} profile={s.field.profile} en={en} label={t('season.fieldAlt', { title: en ? s.en.title : s.title })} />
              <p>{en ? s.en.theme : s.theme}</p>
              <p className="muted">
                {t('season.dates', { from: formatDate(locale, s.startsAt), to: formatDate(locale, s.endsAt) })}
                {' · '}{t('season.facts.timeValue', { s: s.field.timeLimitS })}
                {' · '}{t('season.facts.max')}: {seasonMaxScore(s)}
              </p>
              <div className="sz-actions">
                <Link className="v2-btn accent" href={`/robot-atolyesi?saha=${s.field.id}`}>{t('season.play')}</Link>
                <Link className="btn btn-ghost" href={`/robot-atolyesi/sezonlar/${s.id}`}>{t('season.rules')}</Link>
                <Link className="btn btn-ghost" href={`/robot-atolyesi/sezonlar/${s.id}#lig`}>{t('season.league')}</Link>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
