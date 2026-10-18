'use client'

import { useState, type FormEvent } from 'react'
import { useT } from '@/i18n/client'
import { apiErrorText } from '@/lib/api-errors'

/** Parola değiştirme: mevcut + yeni (en az 10 karakter) + tekrar. Başarıda diğer cihazlardaki oturumlar kapanır. */
export function ChangePassword() {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const t = useT()

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const current = String(data.get('current') ?? '')
    const next = String(data.get('next') ?? '')
    if (next !== String(data.get('confirm') ?? '')) {
      setMsg({ ok: false, text: t('account.password.mismatch') })
      return
    }
    setBusy(true)
    setMsg(null)
    const res = await fetch('/api/hesap/parola', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ current, next }) })
    const json = await res.json().catch(() => null)
    if (res.ok) {
      setMsg({ ok: true, text: t('account.password.changed') })
      form.reset()
    } else setMsg({ ok: false, text: apiErrorText(t, json?.error, 'account.password.failed') })
    setBusy(false)
  }

  return (
    <form className="ac-pw" onSubmit={submit}>
      <label htmlFor="pw-current">{t('account.password.current')}</label>
      <input id="pw-current" name="current" type="password" autoComplete="current-password" maxLength={200} required />
      <label htmlFor="pw-next">{t('account.password.next')}</label>
      <input id="pw-next" name="next" type="password" autoComplete="new-password" minLength={10} maxLength={200} required aria-describedby="pw-hint" />
      <small id="pw-hint" className="muted">{t('account.password.hint')}</small>
      <label htmlFor="pw-confirm">{t('account.password.confirm')}</label>
      <input id="pw-confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} maxLength={200} required />
      <div className="ac-row"><button className="v2-btn accent" disabled={busy}>{t('account.password.submit')}</button></div>
      {msg && <p role="status" className={`pr-msg${msg.ok ? ' ok' : ''}`}>{msg.text}</p>}
    </form>
  )
}
