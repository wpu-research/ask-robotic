import { getDb } from '@/lib/db'
import { handle, ok, requireAdmin } from '@/lib/sinav/http'
import { listAttempts } from '@/lib/sinav/service'

export const dynamic = 'force-dynamic'

/** Tüm girişlerin devreleri (öğretmenin tarayıcısı sınav kâğıdı için devre görüntüsü çizer). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireAdmin()
    const { id } = await params
    return ok({ items: (await listAttempts(getDb(), id)).map((a) => ({ id: a.id, circuit: a.circuit })) })
  })
}
