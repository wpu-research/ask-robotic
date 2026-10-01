'use client'

import { useState, type FormEvent } from 'react'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const f = new FormData(e.currentTarget)
    const body =
      mode === 'login'
        ? { email: f.get('email'), password: f.get('password') }
        : { email: f.get('email'), password: f.get('password'), name: f.get('name'), role: f.get('role'), adult: f.get('adult') === 'on' }
    const res = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      window.location.href = '/'
      return
    }
    setError((await res.json().catch(() => null))?.error ?? 'Bir hata oluştu')
    setBusy(false)
  }

    return (
    <form onSubmit={onSubmit}>
      {mode === 'register' && (
        <label className="field">Ad<input name="name" required maxLength={80} /></label>
      )}
      <label className="field">E-posta<input name="email" type="email" required autoComplete="email" /></label>
      <label className="field">
        Parola
        <input name="password" type="password" required minLength={mode === 'register' ? 10 : 1}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
      </label>
      {mode === 'register' && (
        <>
          <label className="field">Hesap türü
            <select name="role"><option value="student">Öğrenci</option><option value="parent">Ebeveyn</option></select>
          </label>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <input name="adult" type="checkbox" required /> 16 yaşından büyüğüm
          </label>
        </>
      )}
      {error && <p role="alert" className="error">{error}</p>}
      <button className="btn btn-primary" disabled={busy}>{mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}</button>
    </form>
  )
}
