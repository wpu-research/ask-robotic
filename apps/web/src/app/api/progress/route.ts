import { z } from 'zod'
import { getDb } from '@/lib/db'
import { isJson } from '@/lib/auth/http'
import { getCurrentUser } from '@/lib/auth/current'
import { completeLesson } from '@/lib/content'

const body = z.object({ lessonId: z.number().int().positive() })

export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Giriş yapılmamış' }, { status: 401 })
  const parsed = body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Geçersiz istek' }, { status: 400 })
  const ok = await completeLesson(getDb(), user.id, parsed.data.lessonId)
  return ok ? Response.json({ ok: true }) : Response.json({ error: 'Ders bulunamadı' }, { status: 404 })
}
