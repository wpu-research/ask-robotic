import type { Metadata } from 'next'
import { RobotStudio } from '@/components/mikro/robot-studio'
import { getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('mikro.pages.robotTitle') }
}

export default async function RobotAtolyesi() {
  const t = await getT()
  return (
    <div className="page page-tool">
      <header className="page-title">
        <p className="eyebrow">{t('shell.groups.kids')}</p>
        <h1>{t('mikro.pages.robotTitle')}</h1>
        <p className="muted">{t('mikro.pages.robotIntro')}</p>
      </header>
      <div className="tool-body">
        <RobotStudio />
      </div>
    </div>
  )
}
