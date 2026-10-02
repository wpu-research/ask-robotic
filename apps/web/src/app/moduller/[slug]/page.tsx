import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCatalogModule } from '@/lib/catalog'
import { getDb } from '@/lib/db'
import { getModuleTree } from '@/lib/content'
import { ModuleView } from '@/components/module/module-view'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const m = await getCatalogModule(getDb(), slug).catch(() => null)
  return { title: m?.title ?? 'Modül' }
}

export default async function ModulSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = getDb()
  const m = await getCatalogModule(db, slug)
  if (!m) notFound()
  // Haftalık rehber metinleri yalnız bu sayfada yüklenir (panel verisi şişmesin)
  const tree = await getModuleTree(db, slug)
  const guides: Record<number, string> = {}
  for (const w of tree?.weeks ?? []) if (w.guideMd) guides[w.position] = w.guideMd
  return <ModuleView m={m} guides={guides} />
}
