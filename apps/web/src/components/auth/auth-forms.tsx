'use client'
import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { parseProfile, type Profile } from '@/lib/profile'
import { LOCAL } from '@/lib/session'
import { useT } from '@/i18n/client'
import type { TFunction } from '@/i18n'
import { apiErrorText } from '@/lib/api-errors'

/** Hata yoksa null; varsa arayüz dilinde mesaj (sunucu metni lib/api-errors.ts ile çevrilir). */
export async function post(t: TFunction, url: string, body: unknown): Promise<string | null> {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null)
  if (res?.ok) return null
  if (!res) return t('auth.errors.network')
  return apiErrorText(t, (await res.json().catch(() => null))?.error, 'auth.errors.generic')
}

export function LoginForm({ next, resetEnabled = false }: { next: string; resetEnabled?: boolean }) {
  const t = useT()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true); setError('')
    const f = new FormData(e.currentTarget)
    const err = await post(t, '/api/auth/login', { login: f.get('login'), password: f.get('password') })
    if (!err) { window.location.href = next; return } // tam yükleme: oturum ve eşitleme baştan
    setError(err); setBusy(false)
  }

  return (
    <form className="au-form" onSubmit={onSubmit}>
      <label className="au-field">{t('auth.login.loginLabel')}
        <input name="login" required autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={254} autoFocus />
      </label>
      <label className="au-field">{t('auth.login.password')}
        <input name="password" type="password" required autoComplete="current-password" maxLength={200} />
      </label>
      {error && <p role="alert" className="au-error">{error}</p>}
      <button className="v2-btn" disabled={busy}>{busy ? t('auth.login.busy') : t('auth.login.submit')}</button>
      {resetEnabled && <p className="au-alt"><Link href="/sifremi-unuttum">{t('auth.login.forgot')}</Link></p>}
      <p className="au-small">{t('auth.login.qrHint')}</p>
      <div className="au-or">{t('auth.login.or')}</div>
      <p className="au-alt">{t('auth.login.noAccount')} <Link href="/kayit">{t('auth.login.createFree')}</Link></p>
    </form>
  )
}

type Role = 'student' | 'parent' | 'teacher'
const ROLES = [
  { key: 'student', icon: '🎒', label: 'auth.register.roleStudent' },
  { key: 'parent', icon: '👨‍👧', label: 'auth.register.roleParent' },
  { key: 'teacher', icon: '🧑‍🏫', label: 'auth.register.roleTeacher' },
] as const satisfies readonly { key: Role; icon: string; label: string }[]

export function RegisterForm({ next, fromOnboarding }: { next: string; fromOnboarding: boolean }) {
  const t = useT()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<Role>('student')
  const [birthYear, setBirthYear] = useState('')
  const [consent, setConsent] = useState(false)
  const year = new Date().getFullYear()

  // Onboarding profili (tarayıcıda): hesaba taşınır; rol tahmini için de kullanılır
  useEffect(() => {
    let p: Profile | null = null
    try { p = parseProfile(localStorage.getItem(LOCAL.profile.key)) } catch { /* yoksay */ }
    setProfile(p)
    if (p?.who === 'cocugum') setRole('parent')
    else if (p?.who === 'okulum') setRole('teacher')
    else if (p?.age && p.age >= 5 && p.age <= 99) setBirthYear(String(year - p.age))
  }, [year])

  const by = Number(birthYear)
  const under16 = !!by && year - by <= 16
  const adultOnly = role !== 'student'
  const tooYoung = adultOnly && !!by && year - by < 18

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (tooYoung) { setError(t('auth.register.adultOnly')); return }
    setBusy(true); setError('')
    const f = new FormData(e.currentTarget)
    const err = await post(t, '/api/auth/register', {
      name: f.get('name'), email: f.get('email'), password: f.get('password'), role, birthYear: by,
      guardianConsent: under16 ? consent : undefined, profile: profile ?? undefined,
    })
    if (!err) { window.location.href = next; return }
    setError(err); setBusy(false)
  }

  const years = Array.from({ length: 97 }, (_, i) => year - 4 - i)
  return (
    <form className="au-form" onSubmit={onSubmit}>
      {fromOnboarding && profile && <p className="au-note">{t('auth.register.planSaved')}</p>}
      <div className="au-field" role="radiogroup" aria-label={t('auth.register.accountType')}>{t('auth.register.accountType')}
        <div className="au-roles">
          {ROLES.map((r) => (
            <button key={r.key} type="button" role="radio" aria-checked={role === r.key} className={`ob-card ${role === r.key ? 'on' : ''}`} onClick={() => setRole(r.key)}>
              <span className="ob-icon" aria-hidden="true">{r.icon}</span><b>{t(r.label)}</b>
            </button>
          ))}
        </div>
      </div>
      <label className="au-field">{t(role === 'student' ? 'auth.register.nameStudent' : 'auth.register.nameAdult')}
        <input name="name" required maxLength={80} autoComplete={role === 'student' ? 'nickname' : 'name'} />
      </label>
      <label className="au-field">{t('auth.register.email')}
        <input name="email" type="email" required autoComplete="email" maxLength={254} />
      </label>
      <label className="au-field">{t('auth.register.password')} <span className="au-hint">{t('auth.register.passwordHint')}</span>
        <input name="password" type="password" required minLength={10} maxLength={200} autoComplete="new-password" />
      </label>
      <label className="au-field">{t('auth.register.birthYear')} <span className="au-hint">{t('auth.register.birthYearHint')}</span>
        <select name="birthYear" required value={birthYear} onChange={(e) => setBirthYear(e.target.value)}>
          <option value="" disabled>{t('auth.register.choose')}</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>
      {tooYoung && <p className="au-error">{t('auth.register.adultOnlyDot')}</p>}
      {under16 && !adultOnly && (
        <label className="au-check">
          <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>{t('auth.register.consentPre')} <b>{t('auth.register.consentGuardian')}</b> {t('auth.register.consentPost')}</span>
        </label>
      )}
      {error && <p role="alert" className="au-error">{error}</p>}
      <button className="v2-btn" disabled={busy || tooYoung}>{busy ? t('auth.register.busy') : t('auth.register.submit')}</button>
      <p className="au-small">{t('auth.register.privacy')}</p>
      <p className="au-alt">{t('auth.register.haveAccount')} <Link href="/giris">{t('auth.register.login')}</Link></p>
    </form>
  )
}

export function QrLogin({ u, k }: { u: string; k: string }) {
  const t = useT()
  const [error, setError] = useState('')
  useEffect(() => {
    let alive = true
    void (async () => {
      const err = u && k ? await post(t, '/api/auth/qr', { u, k }) : t('auth.qr.missing')
      if (!alive) return
      if (!err) { window.location.replace('/'); return } // replace: gizli kod tarayıcı geçmişinde kalmasın
      setError(err)
      try { window.history.replaceState(null, '', '/giris/qr') } catch { /* yoksay */ }
    })()
    return () => { alive = false }
  }, [u, k]) // eslint-disable-line react-hooks/exhaustive-deps -- dil değişince QR girişi yinelenmesin
  return error
    ? <div className="au-form"><p role="alert" className="au-error">{error}</p><Link className="v2-btn" href="/giris">{t('auth.qr.usernameLogin')}</Link></div>
    : <p className="au-alt" aria-live="polite">{t('auth.qr.reading')}</p>
}
