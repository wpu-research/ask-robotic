import { Dashboard } from '@/components/dashboard/dashboard'
import { LeagueCard } from '@/components/dashboard/league-card'
import { getCatalog } from '@/lib/catalog'
import { getDb } from '@/lib/db'
import { authEnabled } from '@/lib/flags'

export const dynamic = 'force-dynamic'

/** Öğrenme paneli: misafir de kullanır (ilerleme tarayıcıda). Giriş yapmış kullanıcıya "/" da bunu gösterir. */
export default async function Panel() {
  const catalog = await getCatalog(getDb()).catch(() => [])
  return <Dashboard catalog={catalog} league={authEnabled() ? <LeagueCard /> : null} />
}
