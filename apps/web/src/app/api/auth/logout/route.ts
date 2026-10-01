import { getDb } from '@/lib/db'
import { clearSessionCookie, isJson, readSessionToken } from '@/lib/auth/http'
import { deleteSession } from '@/lib/auth/session'

export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  await deleteSession(getDb(), await readSessionToken())
  await clearSessionCookie()
  return Response.json({ ok: true })
}
