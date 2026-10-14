import { eq, users } from '@ask/db'
import { getDb } from '@/lib/db'
import { createSchool, validateClassInput } from '@/lib/classroom'
import { bad, currentUserId, readJson } from '@/lib/teacher-page'

export const dynamic = 'force-dynamic'

// Öğretmen okulunu + ilk sınıfını açar (owner olur).
export async function POST(req: Request) {
  const userId = await currentUserId()
  if (!userId) return bad('Giriş yapmalısın', 401)
  const body = await readJson(req)
  if (!body) return bad('JSON bekleniyor', 415)
  const schoolName = typeof body.schoolName === 'string' ? body.schoolName.trim() : ''
  if (schoolName.length < 2 || schoolName.length > 120) return bad('Okul adı 2-120 karakter olmalı')
  const cls = validateClassInput({ name: body.className, gradeLevel: body.gradeLevel })
  if (!cls) return bad('Sınıf adı (1-40 karakter) ve düzeyi (0-12) geçersiz')
  const db = getDb()
  const [u] = await db.select({ loginMode: users.loginMode }).from(users).where(eq(users.id, userId)).limit(1)
  if (!u || u.loginMode !== 'email') return bad('Okul hesabını yalnız e-postayla giriş yapan öğretmen açabilir', 403)
  const { org, cls: c } = await createSchool(db, userId, { schoolName, ...cls })
  return Response.json({ ok: true, orgId: org.id, classId: c.id })
}
