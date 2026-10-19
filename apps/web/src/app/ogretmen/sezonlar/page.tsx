import type { Metadata } from 'next'
import Link from 'next/link'
import { getDb } from '@/lib/db'
import { requireUserPage } from '@/lib/teacher-page'
import { SEASONS, seasonPhase } from '@/lib/mikro/sezon'
import { teacherSeasonView } from '@/lib/sezon-server'
import { SeasonTeamForm } from '@/components/teacher/season-team-form'
import { SeasonLeagueTables } from '@/components/mikro/season-league'
import { formatDate } from '@/i18n/format'
import { getLocale, getT } from '@/i18n/server'
import '../../ogretmen.css'
import '../../robot-atolyesi/sezonlar/sezon.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('season.teacher.metaTitle') }
}
export const dynamic = 'force-dynamic'

export default async function OgretmenSezonlar() {
  const user = await requireUserPage('/ogretmen/sezonlar')
  const t = await getT()
  const locale = await getLocale()
  const en = locale === 'en'
  const db = getDb()
  const views = await Promise.all(SEASONS.map(async (s) => ({ s, v: await teacherSeasonView(db, user.id, s) })))
  const noSchool = views.every(({ v }) => !v.classes.length)

  return (
    <div className="page og sz">
      <div className="og-head">
        <div>
          <p className="v2-eyebrow"><Link href="/ogretmen">{t('season.teacher.eyebrow')}</Link></p>
          <h1>{t('season.teacher.title')}</h1>
          <p className="muted" style={{ maxWidth: 760 }}>{t('season.teacher.lead', { n: SEASONS[0].teamTop })}</p>
        </div>
        <Link className="btn btn-ghost" href="/robot-atolyesi/sezonlar">{t('season.allSeasons')}</Link>
      </div>
      {noSchool && (
        <div className="panel">
          <p className="muted">{t('season.teacher.noSchool')}</p>
          <Link className="v2-btn accent" href="/ogretmen/basla">{t('season.teacher.noSchoolCta')}</Link>
        </div>
      )}
      {!noSchool && views.map(({ s, v }) => {
        const phase = seasonPhase(s)
        const closed = phase === 'bitti'
        return (
          <section key={s.id} className="og" style={{ display: 'grid' }} data-testid={`teacher-season-${s.id}`}>
            <div className="og-head">
              <div>
                <h2 style={{ margin: 0 }}>{en ? s.en.title : s.title}</h2>
                <p className="muted">{t('season.dates', { from: formatDate(locale, s.startsAt), to: formatDate(locale, s.endsAt) })}</p>
              </div>
              <div className="sz-actions">
                <span className={`sz-phase ${phase}`}>{t(`season.phase.${phase}`)}</span>
                <Link className="btn btn-ghost" href={`/robot-atolyesi/sezonlar/${s.id}`}>{t('season.rules')}</Link>
              </div>
            </div>
            {closed && <p className="og-err">{t('season.teacher.closed')}</p>}
            <div className="panel" style={{ display: 'grid', gap: 14 }}>
              {v.classes.map((c) => (
                <div key={c.classId}>
                  {v.classes.some((x) => x.orgId !== c.orgId) && <small className="muted">{c.school}</small>}
                  <SeasonTeamForm seasonId={s.id} classId={c.classId} className={c.className} team={c.team?.team ?? null} closed={closed} />
                </div>
              ))}
            </div>
            <h3 style={{ margin: 0 }}>{t('season.teacher.myTeams')}</h3>
            {v.teams.length ? (
              <div className="og-grid">
                {v.teams.map((tm) => (
                  <article key={tm.classId} className="panel sz-team" data-testid={`teacher-team-${tm.classId}`}>
                    <div className="og-head">
                      <h3>{tm.team} <small className="muted">· {tm.className}</small></h3>
                      <span className="chip"><b>{tm.score}</b></span>
                    </div>
                    <p className="muted" style={{ margin: 0 }}>
                      {tm.leagueRank != null ? t('season.teacher.leagueRank', { rank: tm.leagueRank }) : t('season.teacher.leagueHidden')}
                      {tm.counted.length > 0 && <> · {t('season.teacher.counted', { list: tm.counted.join(' + ') })}</>}
                    </p>
                    <div>
                      <small className="muted">{t('season.teacher.rosterTitle')}</small>
                      <ul className="sz-roster">
                        {tm.roster.map((r, i) => <li key={i}>{r.name}<b>{r.score ?? t('season.teacher.noScore')}</b></li>)}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            ) : <p className="muted">{t('season.teacher.noMyTeams')}</p>}
            <h3 style={{ margin: 0 }}>{t('season.league')}</h3>
            <SeasonLeagueTables league={v.league} t={t} highlight={new Set(v.teams.map((x) => x.classId))} />
          </section>
        )
      })}
    </div>
  )
}
