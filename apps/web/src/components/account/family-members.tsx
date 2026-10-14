'use client'

import { useState, type FormEvent } from 'react'
import { useT } from '@/i18n/client'
import { apiErrorText } from '@/lib/api-errors'

type Member = { id: string; name: string; username: string | null; email: string | null }

/** Aile planı üyeleri: kullanıcı adı / e-postayla ekle, çıkar. Koltuk sınırı sunucuda denetlenir. */
export function FamilyMembers({ initial, limit }: { initial: Member[]; limit: number }) {
  const [members, setMembers] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const t = useT()

  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const identifier = String(new FormData(form).get('identifier') ?? '').trim()
    if (!identifier) return
    setBusy(true)
    setMsg(null)
    const res = await fetch('/api/hesap/aile', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ identifier }) })
    const json = await res.json().catch(() => null)
    if (res.ok) {
      // Ekranda yalnız ad gösterilir; tam liste sayfa yenilenince gelir
      setMembers((m) => [...m, { id: json.member.id, name: json.member.name, username: null, email: null }])
      setMsg({ ok: true, text: t('account.family.added', { name: json.member.name }) })
      form.reset()
    } else setMsg({ ok: false, text: apiErrorText(t, json?.error, 'account.family.addFailed') })
    setBusy(false)
  }

  async function remove(id: string) {
    setBusy(true)
    setMsg(null)
    const res = await fetch('/api/hesap/aile', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: id }) })
    if (res.ok) setMembers((m) => m.filter((x) => x.id !== id))
    else setMsg({ ok: false, text: apiErrorText(t, (await res.json().catch(() => null))?.error, 'account.family.removeFailed') })
    setBusy(false)
  }

  return (
    <>
      <p className="muted">{t('account.family.count', { n: members.length, limit })}</p>
      {members.length > 0 && (
        <ul className="ac-members">
          {members.map((m) => (
            <li key={m.id}>
              <span><b>{m.name}</b>{(m.username || m.email) && <> <small>{m.username ?? m.email}</small></>}</span>
              <button type="button" className="ac-link" disabled={busy} onClick={() => remove(m.id)}>{t('account.family.remove')}</button>
            </li>
          ))}
        </ul>
      )}
      {members.length < limit && (
        <form className="ac-form" onSubmit={add}>
          <label className="sr-only" htmlFor="aile-id">{t('account.family.idLabel')}</label>
          <input id="aile-id" name="identifier" placeholder={t('account.family.idLabel')} maxLength={254} required autoComplete="off" />
          <button className="v2-btn accent" disabled={busy}>{t('account.family.add')}</button>
        </form>
      )}
      {msg && <p role="status" className={`pr-msg${msg.ok ? ' ok' : ''}`}>{msg.text}</p>}
    </>
  )
}
