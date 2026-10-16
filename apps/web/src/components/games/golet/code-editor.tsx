'use client'
// Basit JavaScript düzenleyici: satır numaralı metin kutusu (Tab 2 boşluk girer). Gölet'in JavaScript kipi içindir.
import { useRef, type KeyboardEvent } from 'react'
import { useT } from '@/i18n/client'

export function CodeEditor({ value, onChange, onRun, disabled }: { value: string; onChange: (v: string) => void; onRun: () => void; disabled?: boolean }) {
  const tr = useT()
  const gutter = useRef<HTMLDivElement>(null)
  const lines = value.split('\n').length
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onRun(); return }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const { selectionStart: a, selectionEnd: z } = t
      onChange(value.slice(0, a) + '  ' + value.slice(z))
      requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = a + 2 })
    }
  }
  return (
    <div className="gl-ed-body">
      <div className="gl-gutter" ref={gutter} aria-hidden="true">{Array.from({ length: lines }, (_, i) => i + 1).join('\n')}</div>
      <textarea
        className="gl-code" value={value} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off" disabled={disabled}
        aria-label={tr('studios.gamesB.golet.codeLabel')}
        onChange={(e) => onChange(e.target.value)} onKeyDown={onKey}
        onScroll={(e) => { if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop }}
      />
    </div>
  )
}
