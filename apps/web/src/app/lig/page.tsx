import type { Metadata } from 'next'
import Link from 'next/link'
import { getDb } from '@/lib/db'
import { inAnyClass, LEAGUE_TIERS, myLeagues } from '@/lib/leagues'
import { requireUserPage } from '@/lib/teacher-page'
import { getT } from '@/i18n/server'
import type { MessageKey } from '@/i18n'
import '../ogretmen.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('league.metaTitle') }
}
export const dynamic = 'force-dynamic'

const MEDAL = ['🥇', '🥈', '🥉']

export default async function Lig() {
  const user = await requireUserPage('/lig')
  const db = getDb()
  const leagues = await myLeagues(db, user.id)
  const inClass = leagues.length > 0 || (await inAnyClass(db, user.id))
  const t = await getT()
  // Kademe adları lib/leagues.ts LEAGUE_TIERS sırasıyla (t1…t10)
  const tiers = LEAGUE_TIERS.map((_, i) => t(`league.tiers.t${i + 1}` as MessageKey))
  return (
    <div className="page og">
      <div className="og-head">
        <div>
          <p className="v2-eyebrow">{t('league.eyebrow')}</p>
          <h1>{t('league.title')}</h1>
          <p className="muted">{t('league.lead')}</p>
        </div>
      </div>
      {!leagues.length && (
        <div className="panel">
          {inClass
            ? <p className="muted">{t('league.closed')}</p>
            : <><p>{t('league.joinPrompt')}</p><Link className="v2-btn accent" href="/sinif/katil">{t('league.joinCta')}</Link></>}
        </div>
      )}
      {leagues.map((l) => (
        <section key={l.classId} className="panel og-league" aria-labelledby={`lg-${l.classId}`}>
          <div className="og-head" style={{ marginBottom: 12 }}>
            <h2 id={`lg-${l.classId}`} style={{ margin: 0 }}>{l.className}</h2>
            <span className="chip">{t('league.yourRank')} <b>{l.myRank}</b> / {l.entries.length} · <span className="og-xp">{l.myXp} XP</span></span>
          </div>
          <ol>
            {l.entries.map((e, i) => (
              <li key={i} className={`${e.rank <= 3 && e.xp > 0 ? `top${e.rank}` : ''}${e.me ? ' me' : ''}`}>
                <span className="og-rank">{e.rank <= 3 && e.xp > 0 ? MEDAL[e.rank - 1] : e.rank}</span>
                <span>{e.name}{e.me && <b>{t('league.you')}</b>}</span>
                <span className="og-xp">{e.xp} XP</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <p className="muted" style={{ fontSize: '.85rem' }}>{t('league.tiersSoon', { tiers: tiers.join(' → ') })}</p>
    </div>
  )
}
