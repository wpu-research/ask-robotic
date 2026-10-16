import type { Metadata } from 'next'
import { ArenaEditor } from '@/components/arena/arena-editor'
import { FREE_STARTERS, freeScenes } from '@/lib/arena/free'
import { getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('lab.arena.page.title') }
}

export default async function Arena() {
  const t = await getT()
  const scenes = freeScenes()
  return (
    <div className="page page-tool">
      <header className="page-title">
        <h1>{t('lab.arena.page.title')}</h1>
        <p className="muted">{t('lab.arena.page.intro')}</p>
      </header>
      <div className="tool-body">
        <ArenaEditor scene={scenes[0]} scenes={scenes} starters={FREE_STARTERS} initialCode={FREE_STARTERS[scenes[0].id]} storageKey="ask:arena:sandbox" />
      </div>
    </div>
  )
}
