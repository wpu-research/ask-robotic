// Sınav rotalarının ortak yardımcıları (yalnız sunucu).
import { cookies } from 'next/headers'
import { getAdminUser } from '@/lib/auth/admin'
import { getDb } from '@/lib/db'
import { attemptByToken, EXAM_COOKIE, ExamError, getSession } from './service'
import './grader'

export const noStore = { 'Cache-Control': 'no-store' }
export const ok = (body: unknown, status = 200) => Response.json(body, { status, headers: noStore })
export const fail = (status: number, error: string) => Response.json({ error }, { status, headers: noStore })

export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try { return await fn() } catch (e) {
    if (e instanceof ExamError) return fail(e.status, e.message)
    console.error('[sinav]', e)
    return fail(500, 'Server error, please try again')
  }
}

export const isJson = (req: Request) => req.headers.get('content-type')?.includes('application/json') ?? false
export const body = async (req: Request) => {
  if (!isJson(req)) throw new ExamError(415, 'JSON expected')
  const b = await req.json().catch(() => null)
  if (!b || typeof b !== 'object') throw new ExamError(400, 'Invalid request')
  return b as Record<string, unknown>
}

export async function examToken() { return (await cookies()).get(EXAM_COOKIE)?.value ?? null }

export async function setExamToken(token: string) {
  (await cookies()).set(EXAM_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24,
  })
}

/** Çerezdeki giriş ve oturumu; yoksa 401. */
export async function currentAttempt() {
  const db = getDb()
  const a = await attemptByToken(db, await examToken())
  if (!a) throw new ExamError(401, 'No active exam on this device')
  const s = await getSession(db, a.sessionId)
  if (!s) throw new ExamError(404, 'Exam not found')
  return { db, a, s }
}

export async function requireAdmin() {
  const u = await getAdminUser()
  if (!u) throw new ExamError(403, 'Instructor login required')
  return u
}
