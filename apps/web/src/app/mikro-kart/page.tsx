import type { Metadata } from 'next'
import { MikroEditor } from '@/components/mikro/mikro-editor'
import { DEFAULT_STORAGE_KEY } from '@/lib/mikro/storage'

export const metadata: Metadata = { title: 'Mikro Kart' }

export default function MikroKart() {
  return (
    <div className="page page-tool">
      <header className="page-title">
        <h1>Mikro Kart</h1>
        <p className="muted">
          Küçük sanal kartı bloklarla programla: 5x5 LED ekran, düğmeler, hareket, ses, radyo ve pinler. Aynı programı JavaScript ve Python olarak da görebilirsin. Çalışman bu tarayıcıda saklanır.
        </p>
      </header>
      <div className="tool-body mk-page-body">
        <MikroEditor storageKey={DEFAULT_STORAGE_KEY} />
      </div>
    </div>
  )
}
