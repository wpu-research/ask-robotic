// Sanal Beceri: POST { challengeId, project } programı sunucuda puanlar ve kaydeder; GET ?challengeId= puan tablolarını döner.
import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/current'
import { rateLimited } from '@/lib/auth/rate-limit'
import { isJson } from '@/lib/auth/http'
import { MAX_SKILL_PROGRAM_BYTES, myBest, myBoards, submitSkillRun } from '@/lib/beceri-server'
import { SKILL_BY_ID, SKILL_CHALLENGES } from '@/lib/mikro/beceri'

export const dynamic = 'force-dynamic'

const HOUR = 60 * 60 * 1000

export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const user = await getCurrentUser().catch(() => null)
  if (!user) return Response.json({ error: 'Puanını sınıf tablosuna göndermek için giriş yap' }, { status: 401 })
  if (rateLimited(`beceri:${user.id}`, 30, HOUR)) return Response.json({ error: 'Çok sık gönderdin; biraz sonra yeniden dene' }, { status: 429 })
  const text = await req.text().catch(() => '')
  if (text.length > MAX_SKILL_PROGRAM_BYTES + 1000) return Response.json({ error: 'Program çok büyük' }, { status: 413 })
  let body: { challengeId?: unknown; project?: unknown }
  try { body = JSON.parse(text) } catch { return Response.json({ error: 'Geçersiz istek' }, { status: 400 }) }
  const r = await submitSkillRun(getDb(), user.id, String(body.challengeId ?? ''), body.project)
  return r.ok ? Response.json(r) : Response.json({ error: r.error }, { status: 400 })
}

export async function GET(req: Request) {
  const challengeId = new URL(req.url).searchParams.get('challengeId') ?? ''
  if (!SKILL_BY_ID[challengeId]) return Response.json({ error: 'Böyle bir beceri sahası yok' }, { status: 404 })
  const user = await getCurrentUser().catch(() => null)
  if (!user) return Response.json({ signedIn: false, best: {}, boards: [] })
  const db = getDb()
  const [best, boards] = await Promise.all([myBest(db, user.id, SKILL_CHALLENGES.map((c) => c.id)), myBoards(db, user.id, challengeId)])
  return Response.json({
    signedIn: true,
    me: user.id,
    best,
    boards: boards.map((bd) => ({ ...bd, rows: bd.rows.map(({ userId, ...row }) => ({ ...row, me: userId === user.id })) })),
  })
}
