import type { Metadata } from 'next'
import { PartsIndex } from '@/components/learn/parts-index'
import { localizedGuides } from '@/lib/parca-rehberi-i18n'
import { getLocale, getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('content.parts.metaTitle') }
}

export default async function Parcalar() {
  const locale = await getLocale()
  const t = await getT()
  const guides = localizedGuides(locale)
  return (
    <div className="page">
      <header className="page-title">
        <h1>{t('content.parts.title')}</h1>
        <p className="muted">{t('content.parts.intro', { n: guides.length })}</p>
      </header>
      <PartsIndex guides={guides} />
    </div>
  )
}
