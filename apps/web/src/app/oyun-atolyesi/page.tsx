import type { Metadata } from 'next'
import { OyunEditor } from '@/components/oyun/oyun-editor'
import { PROJECT_STORAGE_KEY } from '@/lib/oyun/project'

export const metadata: Metadata = { title: 'Oyun Atölyesi' }

export default function OyunAtolyesi() {
  return (
    <div className="page page-tool oy-page">
      <header className="page-title">
        <h1>Oyun Atölyesi</h1>
        <p className="muted">
          Blokları birleştirerek kendi oyununu yap: sprite&apos;lar, harita, ses ve efektler. Piksel resimlerini kendin çiz, istersen JavaScript sekmesinden kodunu oku. Çalışman bu tarayıcıda saklanır.
        </p>
      </header>
      <div className="tool-body oy-tool-body">
        <OyunEditor storageKey={PROJECT_STORAGE_KEY} />
      </div>
    </div>
  )
}
