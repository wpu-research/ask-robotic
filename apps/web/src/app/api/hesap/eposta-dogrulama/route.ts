import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/current'
import { rateLimited } from '@/lib/auth/rate-limit'
import { sendVerificationEmail } from '@/lib/auth/email-tokens'
import { mailDeps } from '@/lib/auth/mail-deps'
import { mailEnabled } from '@/lib/mail/config'

export const dynamic = 'force-dynamic'

/** Giriş yapmış kullanıcı doğrulama e-postasını yeniden ister. */
export async function POST() {
  if (!mailEnabled()) return Response.json({ error: 'Bulunamadı' }, { status: 404 })
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Giriş yapılmamış' }, { status: 401 })
  if (rateLimited(`hesap-dogrula|${user.id}`, 3)) return Response.json({ error: 'Çok fazla deneme, sonra tekrar dene' }, { status: 429 })
  await sendVerificationEmail(getDb(), user.id, await mailDeps())
  return Response.json({ ok: true })
}
