'use client'
// Ders kod örneği: başlık + kopyala düğmesi + kod.
import { useState } from 'react'

export function CodeBlock({ title, src, lang }: { title: string; src: string; lang: 'tr' | 'en' }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle')
  const copy = async () => {
    try { await navigator.clipboard.writeText(src); setState('ok') } catch { setState('fail') }
    setTimeout(() => setState('idle'), 1600)
  }
  const label = state === 'ok' ? (lang === 'en' ? 'Copied' : 'Kopyalandı') : state === 'fail' ? (lang === 'en' ? 'Select and copy' : 'Seçip kopyala') : (lang === 'en' ? 'Copy' : 'Kopyala')
  return (
    <figure className="rb-code">
      <figcaption><span>{title}</span><button type="button" onClick={copy}>{label}</button></figcaption>
      <pre><code>{src}</code></pre>
    </figure>
  )
}
