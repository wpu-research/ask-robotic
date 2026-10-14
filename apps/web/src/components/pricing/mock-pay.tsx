'use client'

import { useState } from 'react'
import { useT } from '@/i18n/client'
import { apiErrorText } from '@/lib/api-errors'

/** Sahte ödeme sayfasının düğmeleri (yalnız PAYMENTS_PROVIDER=mock). */
export function MockPay({ refId }: { refId: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const t = useT()

  async function send(outcome: 'succeeded' | 'failed' | 'canceled') {
    setBusy(true)
    setError('')
    const res = await fetch('/api/odeme/mock/callback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ref: refId, outcome }),
    })
    const json = await res.json().catch(() => null)
    if (res.ok && json?.redirect) {
      window.location.href = json.redirect
      return
    }
    setError(apiErrorText(t, json?.error, 'pricing.mock.error'))
    setBusy(false)
  }

  return (
    <>
      {error && <p role="alert" className="pr-msg">{error}</p>}
      <div className="co-btns">
        <button type="button" className="v2-btn ok" disabled={busy} onClick={() => send('succeeded')}>{t('pricing.mock.success')}</button>
        <button type="button" className="v2-btn ghost" disabled={busy} onClick={() => send('failed')}>{t('pricing.mock.declined')}</button>
      </div>
      <button type="button" className="ac-link" disabled={busy} onClick={() => send('canceled')}>{t('pricing.mock.cancel')}</button>
    </>
  )
}
