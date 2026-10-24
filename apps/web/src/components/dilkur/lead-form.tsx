'use client'
// Okul teklif formu (Dilkur ana sayfası #teklif). /api/okul-teklif'e gönderir; marka sunucuda alan adından çözülür.
import Link from 'next/link'
import { useState } from 'react'
import { useLocale } from '@/i18n/client'
import { LEVELS, type LevelId } from '@/lib/okul-teklif'

export function LeadForm() {
  const en = useLocale() === 'en'
  const [levels, setLevels] = useState<LevelId[]>([])
  const [kvkk, setKvkk] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const toggle = (id: LevelId) => setLevels((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]))

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const f = new FormData(e.currentTarget)
    if (levels.length === 0) { setError(en ? 'Pick at least one school level.' : 'En az bir kademe seçin.'); return }
    if (!kvkk) { setError(en ? 'Please accept the privacy notice.' : 'Lütfen aydınlatma metnini onaylayın.'); return }
    setBusy(true)
    try {
      const body = { school: f.get('school'), city: f.get('city'), levels, students: f.get('students') || undefined, contactName: f.get('contactName'), contactRole: f.get('contactRole') || undefined, phone: f.get('phone'), email: f.get('email'), note: f.get('note') || undefined, consentKvkk: kvkk }
      const res = await fetch('/api/okul-teklif', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(res.status === 400 ? (en ? 'Please check the required fields.' : 'Lütfen zorunlu alanları kontrol edin.') : (data.error ?? (en ? 'Could not send, please try again.' : 'Gönderilemedi, tekrar deneyin.'))); return }
      setDone(true)
    } catch {
      setError(en ? 'No connection, please try again.' : 'Bağlantı yok, tekrar deneyin.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="dk-form dk-done" role="status" data-testid="lead-done">
        <h3>{en ? 'Thank you, we received your request' : 'Teşekkürler, talebinizi aldık'}</h3>
        <p>{en ? 'Our education advisor will call you within one working day to plan a free demo lesson for your school.' : 'Eğitim danışmanımız bir iş günü içinde sizi arayıp okulunuz için ücretsiz tanıtım dersini planlayacak.'}</p>
      </div>
    )
  }

  return (
    <form className="dk-form" onSubmit={submit} noValidate data-testid="lead-form">
      <div className="dk-grid2">
        <label>{en ? 'School name' : 'Okul adı'} *<input name="school" required minLength={2} maxLength={160} autoComplete="organization" /></label>
        <label>{en ? 'City / district' : 'İl / ilçe'} *<input name="city" required minLength={2} maxLength={80} autoComplete="address-level2" /></label>
      </div>
      <fieldset className="dk-levels">
        <legend>{en ? 'School levels' : 'Kademeler'} *</legend>
        {LEVELS.map((l) => (
          <label key={l.id} className="dk-chip"><input type="checkbox" checked={levels.includes(l.id)} onChange={() => toggle(l.id)} data-testid={`lead-level-${l.id}`} /><span>{en ? l.en : l.tr}</span></label>
        ))}
      </fieldset>
      <div className="dk-grid2">
        <label>{en ? 'Your name' : 'Yetkili adı soyadı'} *<input name="contactName" required minLength={2} maxLength={80} autoComplete="name" /></label>
        <label>{en ? 'Role (optional)' : 'Görevi (isteğe bağlı)'}<input name="contactRole" maxLength={80} placeholder={en ? 'Principal, IT teacher…' : 'Müdür, BT öğretmeni…'} /></label>
        <label>{en ? 'Phone' : 'Telefon'} *<input name="phone" type="tel" required maxLength={32} autoComplete="tel" placeholder="05xx xxx xx xx" /></label>
        <label>{en ? 'Email' : 'E-posta'} *<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
        <label>{en ? 'Number of students (optional)' : 'Öğrenci sayısı (isteğe bağlı)'}<input name="students" type="number" min={1} max={20000} inputMode="numeric" /></label>
      </div>
      <label>{en ? 'Note (optional)' : 'Notunuz (isteğe bağlı)'}<textarea name="note" rows={3} maxLength={1000} /></label>
      <label className="dk-check"><input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} data-testid="lead-kvkk" />
        <span>{en ? 'I have read the ' : ''}<Link href="/yasal/kvkk-aydinlatma" target="_blank">{en ? 'privacy notice' : 'KVKK aydınlatma metnini'}</Link>{en ? ' and agree to be contacted about this request.' : ' okudum; bu talep için benimle iletişime geçilmesini kabul ediyorum.'}</span></label>
      {error && <p className="dk-error" role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary dk-submit" disabled={busy} data-testid="lead-submit">{busy ? (en ? 'Sending…' : 'Gönderiliyor…') : (en ? 'Request a quote' : 'Teklif isteyin')}</button>
    </form>
  )
}
