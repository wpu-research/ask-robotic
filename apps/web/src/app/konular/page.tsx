import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import { TopicsView } from '@/components/topics/topics-view'
import { getCatalog } from '@/lib/catalog'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'
export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('topics.metaTitle') }
}

export default async function Konular() {
  const catalog = await getCatalog(getDb()).catch(() => [])
  return <TopicsView catalog={catalog} />
}
