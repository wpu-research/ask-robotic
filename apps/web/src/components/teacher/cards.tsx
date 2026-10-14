'use client'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import type { LoginCard } from '@/lib/qr-svg'
import { intlTag } from '@/i18n'
import { useLocale, useT } from '@/i18n/client'
import { localizeError, sendJson } from './api'

/** Yazdırılabilir QR kart sayfası. Gizli kodlar yalnız bu ekranda görünür (DB'de özet var). */
export function CardSheet({ cards, className, onClose }: { cards: LoginCard[]; className: string; onClose?: () => void }) {
  const t = useT()
  if (!cards.length) return null
  return (
    <section className="og-print panel" aria-label={t('teacher.cards.sheetLabel')}>
      <div className="og-head og-no-print">
        <div>
          <h2 style={{ margin: 0 }}>{t('teacher.cards.sheetTitle', { n: cards.length })}</h2>
          <p className="muted">{t('teacher.cards.sheetLead')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="v2-btn accent" onClick={() => window.print()}>{t('teacher.cards.print')}</button>
          {onClose && <button type="button" className="v2-btn ghost" onClick={onClose}>{t('teacher.cards.close')}</button>}
        </div>
      </div>
      <p className="og-print-only">{t('teacher.cards.printHeader', { name: className })}</p>
      <div className="og-cards">
        {cards.map((c) => (
          <article key={c.id} className="og-card">
            <b>{c.name}</b>
            <small>{className}</small>
            <div className="qr" aria-label={t('teacher.cards.qrFor', { name: c.name })} dangerouslySetInnerHTML={{ __html: c.svg }} />
            <span className="og-code">{c.username}</span>
            <span>{t('teacher.cards.secret')} <span className="og-code">{c.secret}</span></span>
            <small>{t('teacher.cards.scanOrOpen', { host: new URL(c.url).host })}</small>
          </article>
        ))}
      </div>
    </section>
  )
}

/** Toplu öğrenci ekleme: satır başına bir ad ya da "ad,soyad" CSV. */
export function BulkAddForm({ classId, className }: { classId: string; className: string }) {
  const t = useT()
  const router = useRouter()
  const [cards, setCards] = useState<LoginCard[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const text = String(new FormData(form).get('text') ?? '')
    setBusy(true); setError('')
    const r = await sendJson<{ cards: LoginCard[] }>(`/api/ogretmen/sinif/${classId}/ogrenciler`, { text })
    setBusy(false)
    if (!r.ok) { setError(localizeError(t, r.error)); return }
    setCards(r.data.cards)
    form.reset()
    router.refresh()
  }
  async function onFile(file: File | undefined, form: HTMLFormElement | null) {
    if (!file || !form) return
    const ta = form.elements.namedItem('text') as HTMLTextAreaElement
    ta.value = (await file.text()).slice(0, 60_000)
  }
  return (
    <>
      <form className="og-form" onSubmit={onSubmit} style={{ maxWidth: 'none' }}>
        <label className="field" htmlFor="og-roster">{t('teacher.cards.rosterLabel')}</label>
        <textarea id="og-roster" name="text" className="og-textarea" required
          placeholder={t('teacher.cards.rosterPh')} />
        <div className="row">
          <label className="btn btn-ghost btn-sm">{t('teacher.cards.chooseCsv')}
            <input type="file" accept=".csv,.txt,text/csv,text/plain" hidden onChange={(e) => onFile(e.target.files?.[0], e.target.form)} />
          </label>
          <button className="v2-btn accent" disabled={busy}>{busy ? t('teacher.cards.adding') : t('teacher.cards.addStudents')}</button>
        </div>
        <p className="muted" style={{ margin: 0 }}>{t('teacher.cards.addHelp')}</p>
        {error && <p role="alert" className="og-err">{error}</p>}
      </form>
      <CardSheet cards={cards} className={className} onClose={() => setCards([])} />
    </>
  )
}

export interface RosterRow { id: string; name: string; username: string | null; loginMode: string; lastActive: string | null }

/** Öğrenci listesi + öğrenci başına "Yeni kart". `selectable` ise toplu kart üretimi (kartlar sayfası). */
export function RosterTable({ classId, className, rows, selectable = false }: { classId: string; className: string; rows: RosterRow[]; selectable?: boolean }) {
  const t = useT()
  const locale = useLocale()
  const [cards, setCards] = useState<LoginCard[]>([])
  const [sel, setSel] = useState<Set<string>>(() => new Set(rows.filter((r) => r.loginMode !== 'email').map((r) => r.id)))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function regen(ids: string[]) {
    if (!ids.length) return
    if (!window.confirm(t('teacher.cards.confirmRegen', { n: ids.length }))) return
    setBusy(true); setError('')
    const r = await sendJson<{ cards: LoginCard[] }>(`/api/ogretmen/sinif/${classId}/kartlar`, { userIds: ids })
    setBusy(false)
    if (!r.ok) { setError(localizeError(t, r.error)); return }
    setCards(r.data.cards)
  }
  const qrRows = rows.filter((r) => r.loginMode !== 'email')
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  if (!rows.length) return <p className="muted">{t('teacher.noStudents')}</p>
  return (
    <>
      {selectable && (
        <div className="og-head">
          <p className="muted" style={{ margin: 0 }}>{t('teacher.cards.selected', { sel: sel.size, total: qrRows.length })}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSel(new Set(sel.size === qrRows.length ? [] : qrRows.map((r) => r.id)))}>
              {sel.size === qrRows.length ? t('teacher.cards.unselectAll') : t('teacher.cards.selectAll')}
            </button>
            <button type="button" className="v2-btn accent" disabled={busy || !sel.size} onClick={() => regen([...sel])}>{t('teacher.cards.regenSelected')}</button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="og-err">{error}</p>}
      <div className="og-table-wrap">
        <table className="og-table">
          <thead><tr>{selectable && <th aria-label={t('teacher.cards.select')} />}<th>{t('teacher.cards.name')}</th><th>{t('teacher.cards.username')}</th><th>{t('teacher.cards.login')}</th><th>{t('teacher.cards.lastActivity')}</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {selectable && <td>{r.loginMode !== 'email' && <input type="checkbox" checked={sel.has(r.id)} onChange={() => toggle(r.id)} aria-label={t('teacher.cards.selectName', { name: r.name })} />}</td>}
                <td>{r.name}</td>
                <td className="og-code">{r.username ?? '—'}</td>
                <td>{r.loginMode === 'email' ? t('teacher.cards.email') : t('teacher.cards.qrCard')}</td>
                <td>{r.lastActive ? new Date(r.lastActive).toLocaleString(intlTag(locale), { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                <td>{r.loginMode !== 'email' && <button type="button" className="og-link-btn" disabled={busy} onClick={() => regen([r.id])}>{t('teacher.cards.newCard')}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CardSheet cards={cards} className={className} onClose={() => setCards([])} />
    </>
  )
}
