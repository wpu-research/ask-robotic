import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCatalogModule } from '@/lib/catalog'
import { getDb } from '@/lib/db'
import { ModuleView } from '@/components/module/module-view'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const m = await getCatalogModule(getDb(), slug).catch(() => null)
  return { title: m?.title ?? 'Modül' }
}

export default async function ModulSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const m = await getCatalogModule(getDb(), slug)
  if (!m) notFound()
  return <ModuleView m={m} />
}
