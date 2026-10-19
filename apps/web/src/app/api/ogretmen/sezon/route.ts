// Yarışma sezonu takım kaydı: POST { seasonId, classId, team } kaydeder/adı günceller, DELETE { seasonId, classId } kaydı siler.
// Yetki lib/sezon-server.ts içinde (requireClassStaff): yalnız sınıfın kurumundaki öğretmen/yönetici/sahip.
import { getDb } from '@/lib/db'
import { registerTeam, withdrawTeam } from '@/lib/sezon-server'
import { bad, currentUserId, readJson } from '@/lib/teacher-page'

export const dynamic = 'force-dynamic'

const str = (v: unknown) => (typeof v === 'string' ? v : '')

export async function POST(req: Request) {
  const body = await readJson(req)
  if (!body) return bad('JSON bekleniyor', 415)
  const r = await registerTeam(getDb(), await currentUserId(), str(body.seasonId), str(body.classId), body.team)
  return r.ok ? Response.json(r) : bad(r.error, r.status)
}

export async function DELETE(req: Request) {
  const body = await readJson(req)
  if (!body) return bad('JSON bekleniyor', 415)
  const r = await withdrawTeam(getDb(), await currentUserId(), str(body.seasonId), str(body.classId))
  return r.ok ? Response.json(r) : bad(r.error, r.status)
}
