import { notFound } from 'next/navigation'
import { authEnabled } from '@/lib/flags'
import { AuthForm } from '../auth-form'

export default function Sayfa() {
  if (!authEnabled()) notFound() // giriş şimdilik kapalı
  return (
    <div className="container">
      <div className="card form-card">
        <h1 style={{ fontSize: '1.6rem' }}>Giriş</h1>
        <AuthForm mode="login" />
        <p className="muted">Hesabın yok mu? <a href="/kayit">Kayıt ol</a></p>
      </div>
    </div>
  )
}
