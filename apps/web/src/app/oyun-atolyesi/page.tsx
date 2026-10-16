import type { Metadata } from 'next'
import { OyunEditor } from '@/components/oyun/oyun-editor'
import { getT } from '@/i18n/server'
import { PROJECT_STORAGE_KEY } from '@/lib/oyun/project'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('studios.oyun.page.title') }
}

export default async function OyunAtolyesi() {
  const t = await getT()
  return (
    <div className="page page-tool oy-page">
      <header className="page-title">
        <p className="eyebrow">{t('shell.groups.kids')}</p>
        <h1>{t('studios.oyun.page.title')}</h1>
        <p className="muted">{t('studios.oyun.page.intro')}</p>
      </header>
      <div className="tool-body oy-tool-body">
        <OyunEditor storageKey={PROJECT_STORAGE_KEY} />
      </div>
    </div>
  )
}
