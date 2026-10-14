import { getDb } from '@/lib/db'
import { guardResponse, requireClassStaff } from '@/lib/class-access'
import { addStudents, SeatLimitError } from '@/lib/classroom'
import { qrLoginUrl } from '@/lib/auth/qr'
import { qrSvg, requestOrigin, type LoginCard } from '@/lib/qr-svg'
import { MAX_ROSTER, parseRoster } from '@/lib/roster'
import { bad, currentUserId, readJson } from '@/lib/teacher-page'

export const dynamic = 'force-dynamic'

// Toplu öğrenci: { text: "Ad Soyad\n…" ya da "ad,soyad" CSV }. Yanıttaki gizli kodlar bir kez gösterilir.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()
  const g = await requireClassStaff(db, await currentUserId(), id)
  if (!g.ok) return guardResponse(g)
  const body = await readJson(req)
  if (!body || typeof body.text !== 'string') return bad('Öğrenci listesi bekleniyor')
  const names = parseRoster(body.text)
  if (!names.length) return bad('Listede geçerli ad bulunamadı')
  if (names.length > MAX_ROSTER) return bad(`Tek seferde en çok ${MAX_ROSTER} öğrenci`)
  try {
    const created = await addStudents(db, g.cls, names)
    const base = requestOrigin(req)
    const cards: LoginCard[] = await Promise.all(created.map(async (s) => {
      const url = qrLoginUrl(base, s.username, s.secret)
      return { ...s, url, svg: await qrSvg(url) }
    }))
    return Response.json({ ok: true, cards }, { headers: { 'cache-control': 'no-store' } })
  } catch (e) {
    if (e instanceof SeatLimitError) return bad(e.message, 409)
    throw e
  }
}
