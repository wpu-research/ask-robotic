import { getDb } from '@/lib/db'
import { guardResponse, isUuid, requireClassStaff } from '@/lib/class-access'
import { regenerateStudentCard } from '@/lib/classroom'
import { qrLoginUrl } from '@/lib/auth/qr'
import { qrSvg, requestOrigin, type LoginCard } from '@/lib/qr-svg'
import { bad, currentUserId, readJson } from '@/lib/teacher-page'

export const dynamic = 'force-dynamic'

// Seçilen öğrencilerin QR kartlarını yeniler (eski kartlar geçersiz olur): { userIds: string[] }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()
  const g = await requireClassStaff(db, await currentUserId(), id)
  if (!g.ok) return guardResponse(g)
  const body = await readJson(req)
  const ids = Array.isArray(body?.userIds) ? body.userIds.filter((x): x is string => typeof x === 'string' && isUuid(x)) : []
  if (!ids.length || ids.length > 200) return bad('1-200 öğrenci seç')
  const base = requestOrigin(req)
  const cards: LoginCard[] = []
  for (const sid of ids) {
    const s = await regenerateStudentCard(db, id, sid)
    if (!s) continue
    const url = qrLoginUrl(base, s.username, s.secret)
    cards.push({ ...s, url, svg: await qrSvg(url) })
  }
  return Response.json({ ok: true, cards }, { headers: { 'cache-control': 'no-store' } })
}
