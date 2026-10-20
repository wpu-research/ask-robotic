'use client'
import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { useT } from '@/i18n/client'
import { post } from './auth-forms'

export function ForgotForm() {
  const t = useT()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true); setError('')
    const err = await post(t, '/api/auth/forgot', { email: new FormData(e.currentTarget).get('email') })
    setBusy(false)
    if (err) setError(err)
    else setSent(true)
  }

  if (sent) {
    return (
      <div className="au-form">
        <p role="status" className="au-note">{t('auth.forgot.sent')}</p>
        <p className="au-alt"><Link href="/giris">{t('auth.forgot.back')}</Link></p>
      </div>
    )
  }
  return (
    <form className="au-form" onSubmit={onSubmit}>
      <label className="au-field">{t('auth.forgot.email')}
        <input name="email" type="email" required autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} autoFocus />
      </label>
      {error && <p role="alert" className="au-error">{error}</p>}
      <button className="v2-btn" disabled={busy}>{busy ? t('auth.forgot.busy') : t('auth.forgot.submit')}</button>
      <p className="au-alt"><Link href="/giris">{t('auth.forgot.back')}</Link></p>
    </form>
  )
}

export function ResetForm({ token }: { token: string }) {
  const t = useT()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  // Adreste kalan belirteç tarayıcı geçmişinde dursun istemiyoruz
  useEffect(() => { try { window.history.replaceState(null, '', '/sifre-sifirla') } catch { /* yoksay */ } }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const password = String(f.get('password') ?? '')
    if (password !== String(f.get('confirm') ?? '')) { setError(t('auth.reset.mismatch')); return }
    setBusy(true); setError('')
    const err = await post(t, '/api/auth/reset', { token, password })
    setBusy(false)
    if (err) setError(err)
    else setDone(true)
  }

  if (done) {
    return (
      <div className="au-form">
        <p role="status" className="au-note">{t('auth.reset.done')}</p>
        <Link className="v2-btn" href="/giris">{t('auth.reset.goLogin')}</Link>
      </div>
    )
  }
  if (!token) {
    return (
      <div className="au-form">
        <p role="alert" className="au-error">{t('auth.reset.invalid')}</p>
        <Link className="v2-btn" href="/sifremi-unuttum">{t('auth.reset.requestNew')}</Link>
      </div>
    )
  }
  return (
    <form className="au-form" onSubmit={onSubmit}>
      <label className="au-field">{t('auth.reset.password')} <span className="au-hint">{t('auth.reset.passwordHint')}</span>
        <input name="password" type="password" required minLength={10} maxLength={200} autoComplete="new-password" autoFocus />
      </label>
      <label className="au-field">{t('auth.reset.confirm')}
        <input name="confirm" type="password" required minLength={10} maxLength={200} autoComplete="new-password" />
      </label>
      {error && <p role="alert" className="au-error">{error}</p>}
      <button className="v2-btn" disabled={busy}>{busy ? t('auth.reset.busy') : t('auth.reset.submit')}</button>
      <p className="au-alt"><Link href="/sifremi-unuttum">{t('auth.reset.requestNew')}</Link></p>
    </form>
  )
}

export function VerifyEmail({ token }: { token: string }) {
  const t = useT()
  const [state, setState] = useState<'busy' | 'ok' | 'failed'>('busy')
  useEffect(() => {
    let alive = true
    void (async () => {
      const err = token ? await post(t, '/api/auth/verify', { token }) : 'x'
      if (!alive) return
      setState(err ? 'failed' : 'ok')
      try { window.history.replaceState(null, '', '/eposta-dogrula') } catch { /* yoksay */ }
    })()
    return () => { alive = false }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps -- dil değişince doğrulama yinelenmesin (belirteç tek kullanımlık)
  return (
    <div className="au-form">
      {state === 'busy' && <p className="au-alt" aria-live="polite">{t('auth.verify.busy')}</p>}
      {state === 'ok' && <p role="status" className="au-note">{t('auth.verify.ok')}</p>}
      {state === 'failed' && <p role="alert" className="au-error">{t('auth.verify.failed')}</p>}
      {state !== 'busy' && <Link className="v2-btn" href="/">{t('auth.verify.home')}</Link>}
    </div>
  )
}
