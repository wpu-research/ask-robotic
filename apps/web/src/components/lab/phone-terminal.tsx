'use client'
import { useEffect, useRef, useState } from 'react'
import type { PartRuntime } from '@/lib/lab/contract'
import { useT } from '@/i18n/client'

interface Props {
  /** Seçili HC-05'in çalışma zamanı durumu (yalnız çalışırken). */
  rt?: PartRuntime['hc05']
  running: boolean
  onSend: (text: string) => void
}

/** HC-05'e eşleşmiş sanal telefon: Bluetooth seri terminal uygulaması gibi gelenleri gösterir, yazılanı CR+LF ile gönderir. */
export function PhoneTerminal({ rt, running, onSend }: Props) {
  const t = useT()
  const box = useRef<HTMLPreElement>(null)
  const [msg, setMsg] = useState('')
  const text = (rt?.phone ?? '').replace(/\r/g, '')
  useEffect(() => { const el = box.current; if (el) el.scrollTop = el.scrollHeight }, [text])
  const canSend = running && !!rt?.connected
  const note = !running ? t('lab.phone.startFirst')
    : !rt?.powered ? t('lab.phone.unpowered')
      : rt.mode === 'at' ? t('lab.phone.atMode')
        : !rt.connected ? t('lab.phone.notConnected') : null
  return (
    <div className="lab-phone" data-testid="lab-phone" data-connected={rt?.connected ? 'true' : 'false'}>
      <div className="lab-phone-head">
        <b>{t('lab.phone.title')}</b>
        {running && rt?.powered && <small>{t('lab.phone.status', { mode: t(rt.mode === 'at' ? 'lab.phone.modeAt' : 'lab.phone.modeData'), baud: rt.baud })}</small>}
      </div>
      <pre ref={box} className="lab-serial-out lab-phone-out" data-testid="lab-phone-out" tabIndex={0} aria-live="off">
        {text || <span className="muted">{t('lab.phone.empty')}</span>}
      </pre>
      {note && <p className="lab-hint">{note}</p>}
      {running && (rt?.framingErrors ?? 0) > 0 && <p className="lab-hint" data-testid="lab-phone-garbled">{t('lab.phone.garbled', { n: rt!.framingErrors })}</p>}
      <form className="lab-serial-form" onSubmit={(e) => { e.preventDefault(); if (canSend && msg) { onSend(msg + '\r\n'); setMsg('') } }}>
        <input
          className="lab-serial-in" value={msg} onChange={(e) => setMsg(e.target.value)} disabled={!canSend}
          placeholder={canSend ? t('lab.phone.placeholder') : running ? '' : t('lab.phone.startFirst')} aria-label={t('lab.phone.inputAria')}
        />
        <button type="submit" className="jr-btn small" disabled={!canSend || !msg}>{t('lab.phone.send')}</button>
      </form>
    </div>
  )
}
