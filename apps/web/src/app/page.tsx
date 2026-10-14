import type { Metadata } from 'next'
import { allComponents } from '@ask/db'
import { Dashboard } from '@/components/dashboard/dashboard'
import { LeagueCard } from '@/components/dashboard/league-card'
import { Landing } from '@/components/landing/landing'
import { getCurrentUser } from '@/lib/auth/current'
import { getCatalog } from '@/lib/catalog'
import { getDb } from '@/lib/db'
import { authEnabled } from '@/lib/flags'
import { getLocale, getT } from '@/i18n/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: { absolute: `ASK Robotic · ${t('landing.metaTitle')}` }, description: t('landing.metaDescription') }
}

/** "/": giriş yapmış kullanıcıya panel, ziyaretçiye tanıtım sayfası (panel misafir için /panel'de). */
export default async function Home() {
  const catalog = await getCatalog(getDb()).catch(() => [])
  const user = authEnabled() ? await getCurrentUser().catch(() => null) : null
  if (user || !authEnabled()) return <Dashboard catalog={catalog} league={user ? <LeagueCard /> : null} />
  return <Landing catalog={catalog} parts={allComponents.length} locale={await getLocale()} />
}
