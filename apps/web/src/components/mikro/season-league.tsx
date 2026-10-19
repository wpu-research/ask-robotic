// Okullar arası lig tabloları (sunucu bileşeni): takımlar ve okullar. Öğrenci adı yok.
import type { SeasonLeague } from '@/lib/sezon-server'
import type { TFunction } from '@/i18n'

const MEDAL = ['🥇', '🥈', '🥉']
const rankCell = (rank: number, score: number) => (rank <= 3 && score > 0 ? <span aria-label={String(rank)}>{MEDAL[rank - 1]}</span> : rank)

export function SeasonLeagueTables({ league, t, highlight }: { league: SeasonLeague; t: TFunction; highlight?: ReadonlySet<string> }) {
  if (!league.teams.length) return <p className="muted" data-testid="season-league-empty">{t('season.noTeams')}</p>
  return (
    <div className="sz-league" data-testid="season-league">
      <div>
        <h3>{t('season.teams')}</h3>
        <div className="og-table-wrap">
          <table className="og-table">
            <thead><tr><th>{t('season.colRank')}</th><th>{t('season.colTeam')}</th><th>{t('season.colSchool')}</th><th>{t('season.colPlayers')}</th><th className="num">{t('season.colScore')}</th></tr></thead>
            <tbody>
              {league.teams.map((r) => (
                <tr key={r.classId} className={highlight?.has(r.classId) ? 'me' : undefined}>
                  <td>{rankCell(r.rank, r.score)}</td>
                  <td><b>{r.team}</b></td>
                  <td>{r.school}</td>
                  <td>{t('season.players', { n: r.participants, m: r.members })}</td>
                  <td className="num"><b>{r.score}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h3>{t('season.schools')}</h3>
        <div className="og-table-wrap">
          <table className="og-table">
            <thead><tr><th>{t('season.colRank')}</th><th>{t('season.colSchool')}</th><th>{t('season.colBestTeam')}</th><th>{t('season.colTeams')}</th><th className="num">{t('season.colScore')}</th></tr></thead>
            <tbody>
              {league.schools.map((s) => (
                <tr key={s.orgId}>
                  <td>{rankCell(s.rank, s.score)}</td>
                  <td><b>{s.school}</b></td>
                  <td>{s.bestTeam}</td>
                  <td>{s.teams}</td>
                  <td className="num"><b>{s.score}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
