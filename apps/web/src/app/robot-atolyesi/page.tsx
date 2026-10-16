import type { Metadata } from 'next'
import { RobotStudio } from '@/components/mikro/robot-studio'

export const metadata: Metadata = { title: 'Robot Atölyesi' }

export default function RobotAtolyesi() {
  return (
    <div className="page page-tool">
      <header className="page-title">
        <h1>Robot Atölyesi</h1>
        <p className="muted">Robotunu bloklarla programla, görevleri bitir. Kartı bir robota taktın: git, dön, mesafeyi ölç, rengi ve çizgiyi oku.</p>
      </header>
      <div className="tool-body">
        <RobotStudio />
      </div>
    </div>
  )
}
