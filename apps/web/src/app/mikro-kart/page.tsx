import type { Metadata } from 'next'
import { MikroEditor } from '@/components/mikro/mikro-editor'
import { DEFAULT_STORAGE_KEY } from '@/lib/mikro/storage'
import { getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('mikro.pages.cardTitle') }
}

export default async function MikroKart() {
  const t = await getT()
  return (
    <div className="page page-tool">
      <header className="page-title">
        <h1>{t('mikro.pages.cardTitle')}</h1>
        <p className="muted">{t('mikro.pages.cardIntro')}</p>
      </header>
      <div className="tool-body mk-page-body">
        <MikroEditor storageKey={DEFAULT_STORAGE_KEY} />
      </div>
    </div>
  )
}
