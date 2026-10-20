import { getDb } from '@/lib/db'
import { ipOf, isJson } from '@/lib/auth/http'
import { rateLimited } from '@/lib/auth/rate-limit'
import { resetPassword } from '@/lib/auth/email-tokens'
import { mailEnabled } from '@/lib/mail/config'

export const dynamic = 'force-dynamic'

/** Belirteçle yeni parola belirler; tüm oturumlar kapanır. Oturum açılmaz: kullanıcı yeni parolayla girer. */
export async function POST(req: Request) {
  if (!mailEnabled()) return Response.json({ error: 'Bulunamadı' }, { status: 404 })
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  if (rateLimited(`reset-ip|${ipOf(req)}`, 10)) return Response.json({ error: 'Çok fazla deneme, sonra tekrar dene' }, { status: 429 })
  const r = await resetPassword(getDb(), await req.json().catch(() => null))
  if (!r.ok) return Response.json({ error: r.message, code: r.code }, { status: 400 })
  return Response.json({ ok: true })
}
