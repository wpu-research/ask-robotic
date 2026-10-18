import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SEASON_BY_ID, seasonMaxScore, seasonPhase } from '@/lib/mikro/sezon'
import { ROBOT_PROFILES } from '@/lib/mikro/robot'
import { PROFILE_EN } from '@/lib/mikro/en'
import { seasonLeague, type SeasonLeague } from '@/lib/sezon-server'
import { getDb } from '@/lib/db'
import { SeasonField, ZONE_CSS } from '@/components/mikro/season-field'
import { SeasonLeagueTables } from '@/components/mikro/season-league'
import { formatDate } from '@/i18n/format'
import { getLocale, getT } from '@/i18n/server'
import '../../../ogretmen.css'
import '../sezon.css'

type Props = { params: Promise<{ id: string }> }
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = SEASON_BY_ID[(await params).id]
  const en = (await getLocale()) === 'en'
  return { title: s ? (en ? s.en.title : s.title) : (await getT())('season.metaTitle') }
}

export default async function SezonKurallari({ params }: Props) {
  const s = SEASON_BY_ID[(await params).id]
  if (!s) notFound()
  const t = await getT()
  const locale = await getLocale()
  const en = locale === 'en'
  const phase = seasonPhase(s)
  // Lig DB'den gelir; DB yoksa kurallar yine gösterilir.
  const league: SeasonLeague = await seasonLeague(getDb(), s).catch(() => ({ teams: [], schools: [] }))
  const title = en ? s.en.title : s.title
  const robot = en ? PROFILE_EN[s.field.profile].title : ROBOT_PROFILES[s.field.profile].title
  return (
    <div className="page og sz">
      <div className="og-head">
        <div>
          <p className="v2-eyebrow"><Link href="/robot-atolyesi/sezonlar">{t('season.allSeasons')}</Link></p>
          <h1>{title}</h1>
          <p className="muted" style={{ maxWidth: 760 }}>{en ? s.en.theme : s.theme}</p>
        </div>
        <div className="sz-actions">
          <span className={`sz-phase ${phase}`}>{t(`season.phase.${phase}`)}</span>
          <Link className="v2-btn accent" href={`/robot-atolyesi?saha=${s.field.id}`} data-testid="season-play">{t('season.play')}</Link>
          <Link className="btn btn-ghost" href="/ogretmen/sezonlar">{t('season.teacherCta')}</Link>
        </div>
      </div>

      <dl className="sz-facts">
        <div><dt>{t('season.facts.robot')}</dt><dd>{robot}</dd></div>
        <div><dt>{t('season.facts.time')}</dt><dd>{t('season.facts.timeValue', { s: s.field.timeLimitS })}</dd></div>
        <div><dt>{t('season.facts.max')}</dt><dd>{seasonMaxScore(s)}</dd></div>
        <div><dt>{t('season.facts.team')}</dt><dd>{t('season.facts.teamValue', { n: s.teamTop })}</dd></div>
        <div><dt>{t('season.facts.dates')}</dt><dd>{t('season.dates', { from: formatDate(locale, s.startsAt), to: formatDate(locale, s.endsAt) })}</dd></div>
      </dl>

      <div className="sz-grid">
        <section className="panel" aria-labelledby="sz-field">
          <h2 id="sz-field" style={{ marginTop: 0, fontSize: '1.1rem' }}>{t('season.fieldTitle')}</h2>
          <SeasonField scene={s.field.scene()} profile={s.field.profile} en={en} label={t('season.fieldAlt', { title })} />
          <ul className="sz-legend">
            <li><i style={{ color: ZONE_CSS.start, borderStyle: 'solid' }} />{t('season.legend.start')}</li>
            <li><i style={{ color: ZONE_CSS.checkpoint }} />{t('season.legend.checkpoint')}</li>
            <li><i style={{ color: ZONE_CSS.goal }} />{t('season.legend.goal')}</li>
            <li><i style={{ color: ZONE_CSS.penalty }} />{t('season.legend.penalty')}</li>
            <li><i className="sq" style={{ color: '#0f172a' }} />{t('season.legend.cube')}</li>
            <li><i className="ln" style={{ color: '#334155' }} />{t('season.legend.wall')}</li>
          </ul>
        </section>
        <section className="panel sz-how">
          <h2>{t('season.scoringTitle')}</h2>
          <ol>
            <li>{t('season.scoring1')}</li>
            <li>{t('season.scoring2')}</li>
            <li>{t('season.scoring3', { n: s.teamTop })}</li>
            <li>{t('season.scoring4')}</li>
          </ol>
        </section>
      </div>

      <section aria-labelledby="sz-subs">
        <h2 id="sz-subs">{t('season.subMissions')}</h2>
        <div className="og-table-wrap">
          <table className="og-table sz-table" data-testid="season-scoring">
            <thead><tr><th>#</th><th>{t('season.colTask')}</th><th>{t('season.colHow')}</th><th className="num">{t('season.colPoints')}</th></tr></thead>
            <tbody>
              {s.subMissions.map((m, i) => (
                <tr key={m.id}>
                  <td>{i + 1}</td>
                  <td><b>{en ? m.en.title : m.title}</b></td>
                  <td>{en ? m.en.how : m.how}</td>
                  <td className="pts"><b>{en ? m.points.replace('sn', 's') : m.points}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="sz-pens">
        <h2 id="sz-pens">{t('season.penalties')}</h2>
        <div className="og-table-wrap">
          <table className="og-table sz-table" data-testid="season-penalties">
            <thead><tr><th>{t('season.colTask')}</th><th>{t('season.colHow')}</th><th className="num">{t('season.colPoints')}</th></tr></thead>
            <tbody>
              {s.penalties.map((p) => (
                <tr key={p.id}>
                  <td><b>{en ? p.en.title : p.title}</b></td>
                  <td>{en ? p.en.how : p.how}</td>
                  <td className="pts neg"><b>{p.points}</b> <small className="muted">{t(p.per === 'each' ? 'season.each' : 'season.once')}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="lig" aria-labelledby="sz-lig">
        <h2 id="sz-lig">{t('season.league')}</h2>
        <SeasonLeagueTables league={league} t={t} />
      </section>
    </div>
  )
}
