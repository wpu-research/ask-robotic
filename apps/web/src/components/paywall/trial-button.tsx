'use client'

import { useState } from 'react'
import { useT } from '@/i18n/client'

/** "7 gün ücretsiz dene": giriş yoksa kayda, varsa denemeyi başlatıp sayfayı yeniler (ya da `next`e gider). */
export function TrialButton({ label, className = 'v2-btn accent', next }: { label?: string; className?: string; next?: string }) {
  const t = useT()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function start() {
    setBusy(true)
    setError('')
    const res = await fetch('/api/odeme/deneme', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
    if (res.status === 401) {
      window.location.href = '/kayit'
      return
    }
    if (res.ok) {
      if (next) window.location.href = next
      else window.location.reload()
      return
    }
    setError((await res.json().catch(() => null))?.error ?? t('paywall.error'))
    setBusy(false)
  }

  return (
    <>
      <button type="button" className={className} onClick={start} disabled={busy}>{busy ? t('paywall.opening') : label ?? t('paywall.tryFree')}</button>
      {error && <p role="alert" className="pr-msg">{error}</p>}
    </>
  )
}
