import { getCurrentUser } from '@/lib/auth/current'
import { getDb } from '@/lib/db'
import { loadMe } from '@/lib/me'

export const dynamic = 'force-dynamic'

// Misafirde de 200: { user: null, ... } (istemci giriş durumunu buradan öğrenir)
export async function GET() {
  const user = await getCurrentUser().catch(() => null)
  const me = await loadMe(getDb(), user).catch(() => null)
  return me ? Response.json(me, { headers: { 'cache-control': 'no-store' } }) : Response.json({ error: 'Okunamadı' }, { status: 503 })
}
