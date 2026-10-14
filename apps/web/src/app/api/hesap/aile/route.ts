import { z } from 'zod'
import { getDb } from '@/lib/db'
import { isJson } from '@/lib/auth/http'
import { getCurrentUser } from '@/lib/auth/current'
import { addFamilyMember, removeFamilyMember } from '@/lib/billing'

export const dynamic = 'force-dynamic'

const addBody = z.object({ identifier: z.string().trim().min(1).max(254) })
const removeBody = z.object({ userId: z.string().uuid() })

/** Aile planına üye ekle (kullanıcı adı ya da e-posta). */
export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Giriş yapılmamış' }, { status: 401 })
  const parsed = addBody.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Kullanıcı adı ya da e-posta yaz' }, { status: 400 })
  const r = await addFamilyMember(getDb(), user.id, parsed.data.identifier)
  if (!r.ok) return Response.json({ error: r.message, code: r.code }, { status: r.code === 'not_found' ? 404 : 409 })
  return Response.json({ ok: true, member: r.member })
}

/** Aile planından üye çıkar. */
export async function DELETE(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Giriş yapılmamış' }, { status: 401 })
  const parsed = removeBody.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Geçersiz istek' }, { status: 400 })
  const ok = await removeFamilyMember(getDb(), user.id, parsed.data.userId)
  return ok ? Response.json({ ok: true }) : Response.json({ error: 'Üye bulunamadı' }, { status: 404 })
}
