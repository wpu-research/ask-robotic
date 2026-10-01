'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  text: string
  canSend: boolean
  open: boolean
  onToggle: () => void
  onSend: (s: string) => void
  onClear: () => void
}

/** Tinkercad gibi altta yatay, açılır/kapanır seri monitör şeridi. */
export function SerialMonitor({ text, canSend, open, onToggle, onSend, onClear }: Props) {
  const box = useRef<HTMLPreElement>(null)
  const stick = useRef(true)
  const [msg, setMsg] = useState('')
  useEffect(() => {
    const el = box.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [text, open])
  return (
    <section className={`lab-serial${open ? ' open' : ''}`} aria-label="Seri monitör">
      <div className="lab-serial-head">
        <button type="button" className="lab-serial-toggle" aria-expanded={open} aria-controls="lab-serial-body" onClick={onToggle} data-testid="lab-serial-toggle">
          <span aria-hidden="true">{open ? '▾' : '▸'}</span> Seri monitör
          {!open && text && <span className="lab-badge" aria-label="Yeni çıktı var" />}
        </button>
        {open && <button type="button" className="jr-btn small" onClick={onClear}>Temizle</button>}
      </div>
      {open && (
        <div id="lab-serial-body" className="lab-serial-body">
          <pre
            ref={box} className="lab-serial-out" data-testid="lab-serial" tabIndex={0} aria-live="off"
            onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24 }}
          >{text || <span className="muted">Seri çıktı burada görünür (Serial.println).</span>}</pre>
          <form className="lab-serial-form" onSubmit={(e) => { e.preventDefault(); if (canSend && msg) { onSend(msg + '\n'); setMsg('') } }}>
            <input
              className="lab-serial-in" value={msg} onChange={(e) => setMsg(e.target.value)} disabled={!canSend}
              placeholder={canSend ? 'Arduino\'ya gönderilecek metin' : 'Önce başlat'} aria-label="Seri porta gönderilecek metin"
            />
            <button type="submit" className="jr-btn small" disabled={!canSend || !msg}>Gönder</button>
          </form>
        </div>
      )}
    </section>
  )
}
