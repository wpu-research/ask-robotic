'use client'

import { useState } from 'react'
import { useT } from '@/i18n/client'
import { apiErrorText } from '@/lib/api-errors'

/** Doğrulanmamış e-posta için "doğrulama e-postası gönder" düğmesi (yalnız SMTP ayarlıyken gösterilir). */
export function ResendVerification() {
  const t = useT()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  async function send() {
    setBusy(true); setMsg(null)
    const res = await fetch('/api/hesap/eposta-dogrulama', { method: 'POST' }).catch(() => null)
    if (res?.ok) setMsg({ ok: true, text: t('account.emailVerify.sent') })
    else setMsg({ ok: false, text: apiErrorText(t, (await res?.json().catch(() => null))?.error, 'auth.errors.generic') })
    setBusy(false)
  }
  return (
    <div>
      <button type="button" className="v2-btn ghost" disabled={busy} onClick={send}>{t('account.emailVerify.resend')}</button>
      {msg && <p role="status" className={`pr-msg${msg.ok ? ' ok' : ''}`}>{msg.text}</p>}
    </div>
  )
}
