import { Dashboard } from '@/components/dashboard/dashboard'
import { getCatalog } from '@/lib/catalog'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const catalog = await getCatalog(getDb()).catch(() => [])
  return <Dashboard catalog={catalog} />
}
