// Tasarım yarışmaları: POST { challengeId, design, project } tasarımı ve programı sunucuda puanlar (giriş yapılmışsa kaydeder);
// GET en iyi puanları döner. İstemcinin bildirdiği puana güvenilmez.
import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/current'
import { rateLimited } from '@/lib/auth/rate-limit'
import { ipOf, isJson } from '@/lib/auth/http'
import { MAX_DESIGN_BYTES, myDesignBest, submitDesignRun } from '@/lib/tasarim-server'
import { DESIGN_CHALLENGES } from '@/lib/mikro/tasarim-gorevleri'

export const dynamic = 'force-dynamic'

const HOUR = 60 * 60 * 1000

export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const user = await getCurrentUser().catch(() => null)
  if (rateLimited(`tasarim:${user?.id ?? ipOf(req)}`, 40, HOUR)) return Response.json({ error: 'Çok sık gönderdin; biraz sonra yeniden dene' }, { status: 429 })
  const text = await req.text().catch(() => '')
  if (text.length > MAX_DESIGN_BYTES + 1000) return Response.json({ error: 'Gönderim çok büyük' }, { status: 413 })
  let body: { challengeId?: unknown; design?: unknown; project?: unknown }
  try { body = JSON.parse(text) } catch { return Response.json({ error: 'Geçersiz istek' }, { status: 400 }) }
  const r = await submitDesignRun(user ? getDb() : null, user?.id ?? null, String(body.challengeId ?? ''), body.design, body.project)
  return r.ok ? Response.json(r) : Response.json({ error: r.error }, { status: 400 })
}

export async function GET() {
  const user = await getCurrentUser().catch(() => null)
  if (!user) return Response.json({ signedIn: false, best: {} })
  return Response.json({ signedIn: true, best: await myDesignBest(getDb(), user.id, DESIGN_CHALLENGES.map((c) => c.id)) })
}
