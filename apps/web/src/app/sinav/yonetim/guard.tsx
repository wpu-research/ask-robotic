import Link from 'next/link'
import { getAdminUser } from '@/lib/auth/admin'

/** Öğretmen sayfaları: admin değilse giriş bağlantısı gösterir. */
export async function adminOrLogin(next: string) {
  const u = await getAdminUser().catch(() => null)
  if (u) return null
  return (
    <div className="exam-admin" lang="en">
      <h1>Instructor login required</h1>
      <p>Sign in with the instructor (admin) account to manage exams.</p>
      <p><Link className="btn btn-primary" href={`/giris?next=${encodeURIComponent(next)}`}>Sign in</Link></p>
    </div>
  )
}
