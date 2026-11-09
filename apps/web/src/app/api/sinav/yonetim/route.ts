import { getDb } from '@/lib/db'
import { body, handle, ok, fail, requireAdmin } from '@/lib/sinav/http'
import { createSession, listSessions } from '@/lib/sinav/service'

export const dynamic = 'force-dynamic'

export async function GET() {
  return handle(async () => {
    await requireAdmin()
    return ok({ sessions: await listSessions(getDb()) })
  })
}

/** Yeni sınav oturumu (taslak). */
export async function POST(req: Request) {
  return handle(async () => {
    const u = await requireAdmin()
    const b = await body(req)
    const title = String(b.title ?? '').trim()
    const durationMin = Number(b.durationMin)
    if (title.length < 3 || title.length > 120) return fail(400, 'Title is required')
    if (!Number.isInteger(durationMin) || durationMin < 10 || durationMin > 300) return fail(400, 'Duration must be 10-300 minutes')
    const c = (b.config ?? {}) as Record<string, unknown>
    const num = (v: unknown, min: number, max: number) => (typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max ? v : undefined)
    const config = {
      mcqCount: num(c.mcqCount, 0, 42), mcqPoints: num(c.mcqPoints, 0, 20),
      definitionPoints: num(c.definitionPoints, 0, 50), projectPoints: num(c.projectPoints, 0, 100),
    }
    const s = await createSession(getDb(), { title, durationMin, createdBy: u.id, config: Object.fromEntries(Object.entries(config).filter(([, v]) => v !== undefined)) })
    return ok({ session: s }, 201)
  })
}
