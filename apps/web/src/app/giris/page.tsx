import { AuthForm } from '../auth-form'

export default function Giris() {
  return (
    <main style={{ maxWidth: 420, margin: '10vh auto', padding: '0 16px' }}>
      <h1>Giriş</h1>
      <AuthForm mode="login" />
      <p>Hesabın yok mu? <a href="/kayit">Kayıt ol</a></p>
    </main>
  )
}
