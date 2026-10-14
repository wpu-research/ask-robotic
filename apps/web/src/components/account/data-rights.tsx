'use client'

import { useState } from 'react'
import { useT } from '@/i18n/client'
import { apiErrorText } from '@/lib/api-errors'
import { rich } from '@/components/pricing/rich'

/** KVKK veri hakları: verilerimi indir (JSON) ve hesabımı sil (onay ifadesiyle). */
export function DataRights({ phrase }: { phrase: string }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const t = useT()

  async function del() {
    setBusy(true)
    setError('')
    const res = await fetch('/api/hesap', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ confirm: text }) })
    if (res.ok) {
      window.location.href = '/?hesap=silindi'
      return
    }
    setError(apiErrorText(t, (await res.json().catch(() => null))?.error, 'account.data.deleteFailed'))
    setBusy(false)
  }

  return (
    <>
      <div className="ac-row">
        <a className="v2-btn ghost" href="/api/hesap/veri" download>{t('account.data.download')}</a>
        {!open && <button type="button" className="ac-link" onClick={() => setOpen(true)}>{t('account.data.delete')}</button>}
      </div>
      {open && (
        <div className="ac-card ac-danger">
          <p><b>{t('account.data.warnStrong')}</b> {t('account.data.warn')}</p>
          <label htmlFor="sil-onay">{rich(t('account.data.confirm'), { phrase: <b>{phrase}</b> })}</label>
          <div className="ac-form">
            <input id="sil-onay" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
            <button type="button" className="v2-btn danger" disabled={busy || text.trim().toLocaleUpperCase('tr-TR') !== phrase} onClick={del}>{t('account.data.deleteForever')}</button>
            <button type="button" className="ac-link" onClick={() => { setOpen(false); setText('') }}>{t('account.data.cancel')}</button>
          </div>
          {error && <p role="alert" className="pr-msg">{error}</p>}
        </div>
      )}
    </>
  )
}
