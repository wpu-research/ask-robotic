import type { Metadata } from 'next'
import { JrEditor } from '@/components/jr/jr-editor'
import { getT } from '@/i18n/server'
import { emptyProject } from '@/lib/jr/starters'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('studios.jr.page.title') }
}

export default async function Atolye() {
  const t = await getT()
  return (
    <div className="page page-tool">
      <header className="page-title">
        <p className="eyebrow">{t('shell.groups.kids')}</p>
        <h1>{t('studios.jr.page.title')}</h1>
        <p className="muted">
          {t('studios.jr.page.intro')}
        </p>
      </header>
      <div className="tool-body">
        <JrEditor initial={emptyProject()} storageKey="ask:jr:sandbox" />
      </div>
    </div>
  )
}
