import { getDb } from '@/lib/db'
import { ipOf, isJson } from '@/lib/auth/http'
import { rateLimited } from '@/lib/auth/rate-limit'
import { requestPasswordReset } from '@/lib/auth/email-tokens'
import { mailDeps } from '@/lib/auth/mail-deps'
import { mailEnabled } from '@/lib/mail/config'

export const dynamic = 'force-dynamic'

/** "Şifremi unuttum": hesap var/yok fark etmeksizin hep aynı yanıt. SMTP ayarsızsa özellik kapalı (404). */
export async function POST(req: Request) {
  if (!mailEnabled()) return Response.json({ error: 'Bulunamadı' }, { status: 404 })
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const body = await req.json().catch(() => null)
  const email = String(body?.email ?? '').toLowerCase()
  // IP başına ve e-posta başına ayrı sınır (başkasının kutusunu e-postayla boğmayı da zorlaştırır)
  if (rateLimited(`forgot-ip|${ipOf(req)}`, 10) || rateLimited(`forgot-mail|${email}`, 3)) {
    return Response.json({ error: 'Çok fazla deneme, sonra tekrar dene' }, { status: 429 })
  }
  await requestPasswordReset(getDb(), body, await mailDeps())
  return Response.json({ ok: true })
}
