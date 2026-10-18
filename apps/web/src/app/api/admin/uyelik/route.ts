import { z } from 'zod'
import { getDb } from '@/lib/db'
import { isJson } from '@/lib/auth/http'
import { getAdminUser } from '@/lib/auth/admin'
import { grantMembership, grantSchema, revokeMembership } from '@/lib/membership'

export const dynamic = 'force-dynamic'

const revokeBody = z.object({ userId: z.string().uuid() })

/** Üyelik ver ya da plan/bitişini değiştir (until: null = süresiz). */
export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  if (!(await getAdminUser())) return Response.json({ error: 'Yetki yok' }, { status: 403 })
  const parsed = grantSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Geçersiz istek' }, { status: 400 })
  const { userId, plan, until } = parsed.data
  const ok = await grantMembership(getDb(), userId, plan, until)
  return ok ? Response.json({ ok: true }) : Response.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
}

/** Elle verilen üyeliği (admin + hoş geldin) kapat. */
export async function DELETE(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  if (!(await getAdminUser())) return Response.json({ error: 'Yetki yok' }, { status: 403 })
  const parsed = revokeBody.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Geçersiz istek' }, { status: 400 })
  const ok = await revokeMembership(getDb(), parsed.data.userId)
  return ok ? Response.json({ ok: true }) : Response.json({ error: 'Elle verilmiş üyelik yok' }, { status: 404 })
}
