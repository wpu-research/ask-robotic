import type { Metadata } from 'next'
import Link from 'next/link'
import { RobotTasarla } from '@/components/mikro/robot-tasarla'
import { getLocale } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === 'en'
  return {
    title: en ? 'Design your robot' : 'Robotunu Tasarla',
    description: en
      ? 'Build a robot from wheels, motors, sensors and batteries on a grid, check its balance and power, then run it in the Robot Workshop missions with blocks.'
      : 'Teker, motor, sensör ve pilden ızgara üstünde robot kur; dengesini ve gücünü denetle, sonra Robot Atölyesi görevlerinde bloklarla çalıştır.',
  }
}

export default async function RobotTasarlaPage() {
  const en = (await getLocale()) === 'en'
  return (
    <div className="page page-tool">
      <header className="page-title">
        <p className="eyebrow"><Link href="/robot-atolyesi">{en ? 'Robot workshop' : 'Robot atölyesi'}</Link></p>
        <h1>{en ? 'Design your robot' : 'Robotunu Tasarla'}</h1>
        <p className="muted">
          {en
            ? 'Build your own robot: pick parts, place them on the grid and try it in a mission.'
            : 'Kendi robotunu kur: parçaları seç, ızgaraya yerleştir ve bir görevde dene.'}
        </p>
      </header>
      <div className="tool-body">
        <RobotTasarla />
      </div>
    </div>
  )
}
