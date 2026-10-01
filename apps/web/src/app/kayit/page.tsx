import { AuthForm } from '../auth-form'

export default function Kayit() {
  return (
    <main style={{ maxWidth: 420, margin: '10vh auto', padding: '0 16px' }}>
      <h1>Kayıt ol</h1>
      <AuthForm mode="register" />
      <p>Zaten hesabın var mı? <a href="/giris">Giriş yap</a></p>
    </main>
  )
}
