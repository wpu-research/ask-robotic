'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { BillingPeriod, PaidPlanId } from '@/lib/pricing'
import { useT } from '@/i18n/client'
import { apiErrorText } from '@/lib/api-errors'
import { rich } from './rich'

/** Ödeme öncesi iki ayrı onay (ön bilgilendirme + mesafeli satış), sonra sağlayıcının ödeme sayfasına yönlendirme. */
export function CheckoutForm({ planId, period, totalLabel }: { planId: PaidPlanId; period: BillingPeriod; totalLabel: string }) {
  const [info, setInfo] = useState(false)
  const [contract, setContract] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const t = useT()

  async function pay() {
    setBusy(true)
    setError('')
    const res = await fetch('/api/odeme/baslat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ planId, period, accepted: true }),
    })
    const json = await res.json().catch(() => null)
    if (res.ok && json?.redirectUrl) {
      window.location.href = json.redirectUrl
      return
    }
    setError(apiErrorText(t, json?.error, 'pricing.checkout.startFailed'))
    setBusy(false)
  }

  return (
    <>
      <label className="co-check">
        <input type="checkbox" checked={info} onChange={(e) => setInfo(e.target.checked)} />
        <span>{rich(t('pricing.checkout.readInfo'), { form: <Link href="/yasal/on-bilgilendirme" target="_blank">{t('pricing.checkout.infoForm')}</Link> })}</span>
      </label>
      <label className="co-check">
        <input type="checkbox" checked={contract} onChange={(e) => setContract(e.target.checked)} />
        <span>{rich(t('pricing.checkout.acceptContract'), {
          contract: <Link href="/yasal/mesafeli-satis" target="_blank">{t('pricing.checkout.contract')}</Link>,
          refund: <Link href="/yasal/iade-iptal" target="_blank">{t('pricing.checkout.refundTerms')}</Link>,
        })}</span>
      </label>
      {error && <p role="alert" className="pr-msg">{error}</p>}
      <button type="button" className="v2-btn accent" disabled={!info || !contract || busy} onClick={pay}>
        {busy ? t('pricing.checkout.redirecting') : t('pricing.checkout.pay', { total: totalLabel })}
      </button>
      <p className="co-note">{t('pricing.checkout.secureNote')}</p>
    </>
  )
}
