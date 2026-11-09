'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { setConsent, useConsent, type ConsentMode } from '@/lib/consent'
import { deleteMyData, useEvents } from '@/lib/events'
import { useT } from '@/i18n/client'
import { consent as consentTr } from '@/i18n/tr/consent'

/** Onay metninin Türkçe kaynağı (i18n/tr/consent.ts notice). Görüntüleme dile göre t('consent.notice.*') ile. */
export const CONSENT_TEXT = consentTr.notice

function Choices({ onChoose }: { onChoose: (mode: ConsentMode, ack: boolean) => void }) {
  const t = useT()
  const [ack, setAck] = useState(false)
  return (
    <>
      <label className="consent-ack"><input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} /> <span>{t('consent.notice.ack')}</span></label>
      <div className="consent-actions">
        <button type="button" className="btn btn-primary btn-sm" disabled={!ack} onClick={() => onChoose('local', true)}>{t('consent.local')}</button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={!ack} onClick={() => onChoose('sync', true)}>{t('consent.sync')}</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChoose('denied', false)}>{t('consent.deny')}</button>
      </div>
    </>
  )
}

/** Karar verilmemişse sayfanın altında görünen onay bandı. Karar verilene kadar hiçbir olay kaydedilmez. */
export function ConsentBanner() {
  const pathname = usePathname()
  const t = useT()
  const consent = useConsent()
  // Sınav ekranında (öğretmen paneli hariç) gösterilmez: sınavın üstünü örtmesin
  if (pathname === '/sinav' || (pathname?.startsWith('/sinav/') && !pathname.startsWith('/sinav/yonetim'))) return null
  if (consent !== null) return null // undefined: henüz okunmadı; nesne: karar verilmiş
  return (
    <aside className="consent-banner" role="region" aria-label={t('consent.bannerLabel')}>
      <h2>{t('consent.notice.title')}</h2>
      <p>{t('consent.notice.body')}</p>
      <p><b>{t('consent.notice.minor')}</b></p>
      <p className="consent-draft">{t('consent.notice.draft')}</p>
      <Choices onChoose={setConsent} />
    </aside>
  )
}

/** İlerlemem sayfasındaki ayar kutusu: onayı değiştir ve "Verilerimi sil". */
export function ConsentSettings() {
  const t = useT()
  const consent = useConsent()
  const events = useEvents()
  const [confirm, setConfirm] = useState(false)
  const [msg, setMsg] = useState('')
  if (consent === undefined) return null

  async function wipe() {
    setMsg('')
    const r = await deleteMyData()
    setConfirm(false)
    setMsg(t(r.server === 'hata' ? 'consent.deleteError' : r.server === 'silindi' ? 'consent.deletedServer' : 'consent.deletedLocal'))
  }

  return (
    <section className="panel consent-settings" aria-labelledby="veri-ayar">
      <h2 id="veri-ayar">{t('consent.settingsTitle')}</h2>
      <p>{consent ? t(`consent.mode.${consent.mode}`) : t('consent.undecided')} {t('consent.eventCount')} <b>{events.length}</b>.</p>
      <p className="muted">{t('consent.notice.body')}</p>
      <p className="muted">{t('consent.notice.minor')} {t('consent.notice.draft')}</p>
      <h3>{t('consent.change')}</h3>
      <Choices onChoose={setConsent} />
      <h3>{t('consent.deleteTitle')}</h3>
      {!confirm ? (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setConfirm(true); setMsg('') }}>{t('consent.deleteButton')}</button>
      ) : (
        <div className="consent-actions" role="alertdialog" aria-label={t('consent.deleteDialog')}>
          <span>{t('consent.deleteConfirm')}</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={wipe}>{t('consent.deleteYes')}</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(false)}>{t('consent.deleteNo')}</button>
        </div>
      )}
      {msg && <p role="status" className="consent-msg">{msg}</p>}
    </section>
  )
}
