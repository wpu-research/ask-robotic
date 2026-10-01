import { getDb } from '@/lib/db'
import { readSessionToken } from '@/lib/auth/http'
import { getSessionUser } from '@/lib/auth/session'
import { LogoutButton } from './logout-button'

export const dynamic = 'force-dynamic'

async function currentUser() {
  try {
    return await getSessionUser(getDb(), await readSessionToken())
  } catch {
    return null // DB yoksa (yerel geliştirme) ana sayfa yine açılsın
  }
}

export default async function Home() {
  const user = await currentUser()
  return (
    <main style={{ maxWidth: 720, margin: '10vh auto', padding: '0 16px' }}>
      <h1>ASK Robotic</h1>
      <p>0&apos;dan AI Robotik Mühendisliğine.</p>
      {user ? (
        <p>Merhaba {user.name}. <LogoutButton /></p>
      ) : (
        <p><a href="/giris">Giriş</a> · <a href="/kayit">Kayıt ol</a></p>
      )}
    </main>
  )
}
