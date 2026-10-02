'use client'
import { useState } from 'react'
import { setConsent, useConsent, type ConsentMode } from '@/lib/consent'
import { deleteMyData, useEvents } from '@/lib/events'

export const CONSENT_TEXT = {
  title: 'Öğrenme verisi (taslak, pilot)',
  body: 'Hangi derslere baktığını, mini testlerde neyi doğru yaptığını ve ekranda geçirdiğin süreyi kaydedip İlerlemem sayfasında beceri haritası çıkarabiliriz. Ad, e-posta ya da IP adresi kaydedilmez; yalnızca bu cihazda rastgele üretilen anonim bir kimlik kullanılır. Kaydı istediğin zaman "Verilerimi sil" ile hem bu cihazdan hem sunucudan silebilirsin.',
  minor: '16 yaşından küçükseniz kayıt için ebeveyn ya da yasal vasinin onayı gerekir. Onayı vermeden önce bir yetişkinle birlikte okuyun.',
  draft: 'Bu metin pilot için hazırlanmış bir taslaktır; hukuki KVKK aydınlatma metninin yerini tutmaz.',
  ack: '16 yaşından büyüğüm ya da ebeveynim/vasim bu kaydı onayladı.',
} as const

function Choices({ onChoose }: { onChoose: (mode: ConsentMode, ack: boolean) => void }) {
  const [ack, setAck] = useState(false)
  return (
    <>
      <label className="consent-ack"><input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} /> <span>{CONSENT_TEXT.ack}</span></label>
      <div className="consent-actions">
        <button type="button" className="btn btn-primary btn-sm" disabled={!ack} onClick={() => onChoose('local', true)}>Yalnız bu cihazda tut</button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={!ack} onClick={() => onChoose('sync', true)}>Tut ve anonim olarak sunucuya da gönder</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChoose('denied', false)}>Kaydetme</button>
      </div>
    </>
  )
}

/** Karar verilmemişse sayfanın altında görünen onay bandı. Karar verilene kadar hiçbir olay kaydedilmez. */
export function ConsentBanner() {
  const consent = useConsent()
  if (consent !== null) return null // undefined: henüz okunmadı; nesne: karar verilmiş
  return (
    <aside className="consent-banner" role="region" aria-label="Veri kaydı onayı">
      <h2>{CONSENT_TEXT.title}</h2>
      <p>{CONSENT_TEXT.body}</p>
      <p><b>{CONSENT_TEXT.minor}</b></p>
      <p className="consent-draft">{CONSENT_TEXT.draft}</p>
      <Choices onChoose={setConsent} />
    </aside>
  )
}

const MODE_TEXT: Record<ConsentMode, string> = {
  local: 'Olaylar yalnız bu tarayıcıda saklanıyor.',
  sync: 'Olaylar bu tarayıcıda saklanıyor ve anonim olarak sunucuya gönderiliyor.',
  denied: 'Hiçbir şey kaydedilmiyor.',
}

/** İlerlemem sayfasındaki ayar kutusu: onayı değiştir ve "Verilerimi sil". */
export function ConsentSettings() {
  const consent = useConsent()
  const events = useEvents()
  const [confirm, setConfirm] = useState(false)
  const [msg, setMsg] = useState('')
  if (consent === undefined) return null

  async function wipe() {
    setMsg('')
    const r = await deleteMyData()
    setConfirm(false)
    setMsg(r.server === 'hata'
      ? 'Sunucudaki kayıtlar silinemedi; hiçbir şey silinmedi. Bağlantını kontrol edip yeniden dene.'
      : `Silindi: bu tarayıcıdaki olay günlüğü, cihaz kimliği ve onay${r.server === 'silindi' ? ' ile sunucudaki kayıtların' : ''}. Ders ilerlemen ve çalışma dosyaların etkilenmedi.`)
  }

  return (
    <section className="panel consent-settings" aria-labelledby="veri-ayar">
      <h2 id="veri-ayar">Verilerim (taslak, pilot)</h2>
      <p>{consent ? MODE_TEXT[consent.mode] : 'Henüz bir karar vermedin; hiçbir şey kaydedilmiyor.'} Kayıtlı olay sayısı: <b>{events.length}</b>.</p>
      <p className="muted">{CONSENT_TEXT.body}</p>
      <p className="muted">{CONSENT_TEXT.minor} {CONSENT_TEXT.draft}</p>
      <h3>Tercihini değiştir</h3>
      <Choices onChoose={setConsent} />
      <h3>Verilerimi sil</h3>
      {!confirm ? (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setConfirm(true); setMsg('') }}>Verilerimi sil</button>
      ) : (
        <div className="consent-actions" role="alertdialog" aria-label="Silme onayı">
          <span>Olay günlüğü, cihaz kimliği ve onay bu cihazdan ve sunucudan kalıcı olarak silinecek. Emin misin?</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={wipe}>Evet, sil</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(false)}>Vazgeç</button>
        </div>
      )}
      {msg && <p role="status" className="consent-msg">{msg}</p>}
    </section>
  )
}
