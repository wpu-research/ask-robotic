import type { Metadata } from 'next'
import { AiGallery } from '@/components/ai/ai-gallery'
import { getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('studios.ai.page.title') }
}

export default async function AiAtolyesi() {
  const t = await getT()
  return (
    <div className="page page-tool">
      <header className="page-title">
        <p className="eyebrow">{t('shell.groups.adults')}</p>
        <h1>{t('studios.ai.page.title')}</h1>
        <p className="muted">
          {t('studios.ai.page.intro')}
        </p>
      </header>
      <div className="tool-body">
        <AiGallery />
      </div>
    </div>
  )
}
