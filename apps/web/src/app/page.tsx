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
import { InstructorCard } from '@/components/egitmen/instructor-card'
import { DilkurLanding } from '@/components/dilkur/dilkur-landing'
import { getBrand } from '@/lib/brand-server'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const brand = await getBrand()
  if (brand.id === 'dilkur') return { title: { absolute: 'Dilkur Akademi · Okullar için Robotik ve Mühendislik' }, description: brand.tr.footDesc }
  return { title: { absolute: `MacademiaX · ${t('landing.metaTitle')}` }, description: t('landing.metaDescription') }
}

/** "/": giriş yapmış kullanıcıya panel, ziyaretçiye tanıtım sayfası (panel misafir için /panel'de). */
export default async function Home() {
  const catalog = await getCatalog(getDb()).catch(() => [])
  const user = authEnabled() ? await getCurrentUser().catch(() => null) : null
  // Sayfanın sonunda kurucu kartı (eğitmen profiline bağlanır)
  const brand = await getBrand()
  const founder = brand.founderCard ? <div className="page home-founder"><InstructorCard slug="murat-arslan" labelKey="instructor.founder" /></div> : null
  // İş ortağı alan adında ziyaretçi okullara yönelik tanıtımı görür (giriş yapınca panel herkeste aynı)
  if (brand.id === 'dilkur' && !user && authEnabled()) {
    const lessons = catalog.reduce((n, m) => n + m.weeks.reduce((k, w) => k + w.lessons.length, 0), 0)
    return <DilkurLanding lessons={lessons} locale={await getLocale()} />
  }
  if (user || !authEnabled()) return <><Dashboard catalog={catalog} league={user ? <LeagueCard /> : null} />{founder}</>
  return <><Landing catalog={catalog} parts={allComponents.length} locale={await getLocale()} />{founder}</>
}
