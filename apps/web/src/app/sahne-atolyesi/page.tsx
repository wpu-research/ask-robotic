import type { Metadata } from 'next'
import { SahneEditor } from '@/components/sahne/sahne-editor'
import { PROJECT_STORAGE_KEY } from '@/lib/sahne/project'

export const metadata: Metadata = { title: 'Sahne Atölyesi' }

export default function SahneAtolyesi() {
  return (
    <div className="page page-tool sh-page">
      <header className="page-title">
        <h1>Sahne Atölyesi</h1>
        <p className="muted">
          Karakterlerini çiz ya da galeriden seç, bloklarla canlandır: hareket, ses, mesajlaşma, klonlar ve kalem. Kendi bloklarını yap, oyun ve hikâye kur. Çalışmaların bu tarayıcıda saklanır; dosya olarak indirip paylaşabilirsin.
        </p>
      </header>
      <div className="tool-body">
        <SahneEditor storageKey={PROJECT_STORAGE_KEY} />
      </div>
    </div>
  )
}
