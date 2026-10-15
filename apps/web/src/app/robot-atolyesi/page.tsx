import type { Metadata } from 'next'
import { RobotStudio } from '@/components/mikro/robot-studio'

export const metadata: Metadata = { title: 'Robot Atölyesi' }

export default function RobotAtolyesi() {
  return (
    <div className="page page-tool">
      <header className="page-title">
        <h1>Robot Atölyesi</h1>
        <p className="muted">
          Mikro Kart'ı iki motorlu bir robot gövdesine tak ve bloklarla programla: git, dön, mesafe ölç, rengi ve çizgiyi oku. Blok Robotu ile Mini Gezgin, okullardaki blok tabanlı eğitim robotlarına benzer; aynı görevi sınıfınızdaki gerçek robotla da deneyebilirsiniz. Çalışmaların bu tarayıcıda saklanır.
        </p>
      </header>
      <div className="tool-body mk-page-body">
        <RobotStudio />
      </div>
    </div>
  )
}
