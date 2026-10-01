import { getDb } from '@/lib/db'
import { readSessionToken } from '@/lib/auth/http'
import { getSessionUser } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSessionUser(getDb(), await readSessionToken())
  return user ? Response.json({ user }) : Response.json({ error: 'Giriş yapılmamış' }, { status: 401 })
}
