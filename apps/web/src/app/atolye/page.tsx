import type { Metadata } from 'next'
import { JrEditor } from '@/components/jr/jr-editor'
import { emptyProject } from '@/lib/jr/starters'

export const metadata: Metadata = { title: 'Atölye' }

export default function Atolye() {
  return (
    <div className="container" style={{ maxWidth: 1180 }}>
      <div className="page-head">
        <p className="eyebrow">Serbest çalışma</p>
        <h1>Atölye</h1>
        <p className="muted" style={{ maxWidth: '64ch' }}>
          Blokları sürükleyip bırakarak karakterini programla. Derslerdeki etkinlikleri burada da deneyebilirsin. Çalışman bu tarayıcıda saklanır.
        </p>
      </div>
      <div style={{ paddingBottom: 56 }}>
        <JrEditor initial={emptyProject()} storageKey="ask:jr:sandbox" />
      </div>
    </div>
  )
}
