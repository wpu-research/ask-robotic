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

  const field = { display: 'block', width: '100%', padding: 8, margin: '4px 0 12px', boxSizing: 'border-box' as const }
  return (
    <form onSubmit={onSubmit}>
      {mode === 'register' && (
        <label>Ad<input name="name" required maxLength={80} style={field} /></label>
      )}
      <label>E-posta<input name="email" type="email" required autoComplete="email" style={field} /></label>
      <label>
        Parola
        <input name="password" type="password" required minLength={mode === 'register' ? 10 : 1}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'} style={field} />
      </label>
      {mode === 'register' && (
        <>
          <label>Hesap türü
            <select name="role" style={field}><option value="student">Öğrenci</option><option value="parent">Ebeveyn</option></select>
          </label>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <input name="adult" type="checkbox" required /> 16 yaşından büyüğüm
          </label>
        </>
      )}
      {error && <p role="alert" style={{ color: '#b00020' }}>{error}</p>}
      <button disabled={busy} style={{ padding: '8px 16px' }}>{mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}</button>
    </form>
  )
}
