// Ana sayfa lig kartı (sunucu bileşeni): sınıftaki sıram + haftalık XP; sınıfta değilsem "bir sınıfa katıl".
// Kullanım: <LeagueCard /> (oturumu kendisi okur) ya da veriyi verip <LeagueCardView league={…} />.
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/current'
import { getDb } from '@/lib/db'
import { inAnyClass, myLeagues, type MyLeague } from '@/lib/leagues'
import { getT } from '@/i18n/server'
import { createT, type TFunction } from '@/i18n'
import '@/app/ogretmen.css'

export type LeagueCardData = { state: 'none' } | { state: 'off' } | { state: 'on'; league: Pick<MyLeague, 'className' | 'myRank' | 'myXp'> & { size: number } }

export async function loadLeagueCard(userId: string): Promise<LeagueCardData> {
  const db = getDb()
  const leagues = await myLeagues(db, userId)
  if (!leagues.length) return (await inAnyClass(db, userId)) ? { state: 'off' } : { state: 'none' }
  const best = [...leagues].sort((a, b) => a.myRank - b.myRank)[0]
  return { state: 'on', league: { className: best.className, myRank: best.myRank, myXp: best.myXp, size: best.entries.length } }
}

const TR = createT('tr')

export function LeagueCardView({ data, t = TR }: { data: LeagueCardData; /** Sözlük; verilmezse Türkçe. */ t?: TFunction }) {
  if (data.state === 'off') return null
  if (data.state === 'none') {
    return (
      <div className="hh-card og-league-card">
        <b>{t('home.league.joinTitle')}</b>
        <p className="muted" style={{ margin: 0 }}>{t('home.league.joinText')}</p>
        <Link className="v2-btn ghost" href="/sinif/katil">{t('home.league.enterCode')}</Link>
      </div>
    )
  }
  const l = data.league
  return (
    <Link className="hh-card og-league-card" href="/lig" style={{ textDecoration: 'none', color: 'inherit' }}>
      <span className="muted">{t('home.league.thisWeek', { name: l.className })}</span>
      <p className="big">{l.myRank}. <span className="muted" style={{ fontSize: '1rem' }}>/ {l.size}</span></p>
      <span className="og-xp">{l.myXp} XP</span>
    </Link>
  )
}

export async function LeagueCard() {
  const user = await getCurrentUser().catch(() => null)
  if (!user) return null
  const data = await loadLeagueCard(user.id).catch(() => null)
  return data ? <LeagueCardView data={data} t={await getT()} /> : null
}
