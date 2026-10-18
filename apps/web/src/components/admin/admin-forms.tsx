'use client'

// Admin paneli yalnız Türkçe (iç araç); öğrenci arayüzündeki i18n anahtarlarına girmez.
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type Msg = { ok: boolean; text: string } | null

export const DURATIONS = [
  { value: '1', label: '1 ay' },
  { value: '3', label: '3 ay' },
  { value: '6', label: '6 ay' },
  { value: '12', label: '1 yıl' },
  { value: 'sure', label: 'Süresiz' },
  { value: 'tarih', label: 'Tarih seç…' },
] as const

/** Süre seçimini bitiş tarihine çevirir: ay sayısı bugünden eklenir, 'sure' = süresiz (null). */
function untilOf(duration: string, date: string): string | null | undefined {
  if (duration === 'sure') return null
  if (duration === 'tarih') return date ? new Date(`${date}T23:59:59+03:00`).toISOString() : undefined
  const d = new Date()
  d.setMonth(d.getMonth() + Number(duration))
  return d.toISOString()
}

async function send(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  return { ok: res.ok, json: await res.json().catch(() => null) }
}

function DurationFields({ id }: { id: string }) {
  const [duration, setDuration] = useState('6')
  return (
    <>
      <select name="duration" aria-label="Süre" value={duration} onChange={(e) => setDuration(e.target.value)}>
        {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
      </select>
      {duration === 'tarih' && <input type="date" name="date" aria-label="Bitiş tarihi" id={`${id}-date`} required />}
    </>
  )
}

export function CreateUserForm() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<Msg>(null)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const plan = String(f.get('plan'))
    const until = plan === 'none' ? null : untilOf(String(f.get('duration')), String(f.get('date') ?? ''))
    if (until === undefined) return setMsg({ ok: false, text: 'Bitiş tarihini seç' })
    setBusy(true)
    setMsg(null)
    const r = await send('/api/admin/kullanici', 'POST', {
      name: f.get('name'), email: f.get('email'), username: f.get('username'), password: f.get('password'),
      role: f.get('role'), plan, until,
    })
    if (r.ok) {
      const login = r.json.user.email ?? r.json.user.username
      setMsg({ ok: true, text: r.json.password ? `Hesap açıldı: ${login} · parola: ${r.json.password} (bir kez gösterilir, şimdi kopyala)` : `Hesap açıldı: ${login}` })
      form.reset()
      router.refresh()
    } else setMsg({ ok: false, text: r.json?.error ?? 'Hesap açılamadı' })
    setBusy(false)
  }

  return (
    <form className="ad-form" onSubmit={submit}>
      <input name="name" placeholder="Ad Soyad" required maxLength={80} />
      <input name="email" type="email" placeholder="E-posta" maxLength={254} autoComplete="off" />
      <input name="username" placeholder="ya da kullanıcı adı" maxLength={40} autoComplete="off" />
      <input name="password" type="text" placeholder="Parola (boşsa üretilir)" maxLength={200} autoComplete="off" />
      <select name="role" aria-label="Rol" defaultValue="student">
        <option value="student">Öğrenci</option>
        <option value="parent">Veli</option>
        <option value="teacher">Öğretmen</option>
        <option value="admin">Admin</option>
      </select>
      <select name="plan" aria-label="Plan" defaultValue="premium">
        <option value="premium">Premium</option>
        <option value="family">Aile</option>
        <option value="none">Üyelik yok</option>
      </select>
      <DurationFields id="yeni" />
      <button className="v2-btn accent" disabled={busy}>Hesap aç</button>
      {msg && <p role="status" className={`pr-msg${msg.ok ? ' ok' : ''}`}>{msg.text}</p>}
    </form>
  )
}

export function GrantForm({ userId, hasPlan }: { userId: string; hasPlan: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<Msg>(null)

  async function grant(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const until = untilOf(String(f.get('duration')), String(f.get('date') ?? ''))
    if (until === undefined) return setMsg({ ok: false, text: 'Bitiş tarihini seç' })
    setBusy(true)
    setMsg(null)
    const r = await send('/api/admin/uyelik', 'POST', { userId, plan: f.get('plan'), until })
    setMsg(r.ok ? { ok: true, text: 'Kaydedildi' } : { ok: false, text: r.json?.error ?? 'Kaydedilemedi' })
    setBusy(false)
    if (r.ok) router.refresh()
  }

  async function revoke() {
    if (!confirm('Elle verilen üyelik kapatılsın mı? Ücretli abonelik etkilenmez.')) return
    setBusy(true)
    const r = await send('/api/admin/uyelik', 'DELETE', { userId })
    setMsg(r.ok ? { ok: true, text: 'Kapatıldı' } : { ok: false, text: r.json?.error ?? 'Kapatılamadı' })
    setBusy(false)
    if (r.ok) router.refresh()
  }

  return (
    <form className="ad-grant" onSubmit={grant}>
      <select name="plan" aria-label="Plan" defaultValue="premium">
        <option value="premium">Premium</option>
        <option value="family">Aile</option>
      </select>
      <DurationFields id={userId} />
      <button className="v2-btn accent" disabled={busy}>Ver</button>
      {hasPlan && <button type="button" className="ac-link" disabled={busy} onClick={revoke}>Kapat</button>}
      {msg && <small className={msg.ok ? 'ad-ok' : 'ad-err'}>{msg.text}</small>}
    </form>
  )
}
