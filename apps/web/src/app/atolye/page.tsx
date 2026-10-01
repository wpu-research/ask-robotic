import type { Metadata } from 'next'
import { JrEditor } from '@/components/jr/jr-editor'
import { emptyProject } from '@/lib/jr/starters'

export const metadata: Metadata = { title: 'Atölye' }

export default function Atolye() {
  return (
    <div className="page page-tool">
      <header className="page-title">
        <h1>Atölye</h1>
        <p className="muted">
          Blokları sürükleyip bırakarak karakterini programla. Derslerdeki etkinlikleri burada da deneyebilirsin. Çalışman bu tarayıcıda saklanır.
        </p>
      </header>
      <div className="tool-body">
        <JrEditor initial={emptyProject()} storageKey="ask:jr:sandbox" />
      </div>
    </div>
  )
}
