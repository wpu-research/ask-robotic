import { notFound } from 'next/navigation'
import { authEnabled } from '@/lib/flags'
import { AuthForm } from '../auth-form'

export default function Sayfa() {
  if (!authEnabled()) notFound() // giriş şimdilik kapalı
  return (
    <div className="page">
      <div className="panel form-card">
        <h1 style={{ fontSize: '1.6rem' }}>Kayıt ol</h1>
        <AuthForm mode="register" />
        <p className="muted">Zaten hesabın var mı? <a href="/giris">Giriş yap</a></p>
      </div>
    </div>
  )
}
