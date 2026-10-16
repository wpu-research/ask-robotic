import type { Metadata } from 'next'
import { SahneEditor } from '@/components/sahne/sahne-editor'
import { getT } from '@/i18n/server'
import { PROJECT_STORAGE_KEY } from '@/lib/sahne/project'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('studios.sahne.page.title') }
}

export default async function SahneAtolyesi() {
  const t = await getT()
  return (
    <div className="page page-tool sh-page">
      <header className="page-title">
        <p className="eyebrow">{t('shell.groups.kids')}</p>
        <h1>{t('studios.sahne.page.title')}</h1>
        <p className="muted">
          {t('studios.sahne.page.intro')}
        </p>
      </header>
      <div className="tool-body">
        <SahneEditor storageKey={PROJECT_STORAGE_KEY} />
      </div>
    </div>
  )
}
