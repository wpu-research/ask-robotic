import { getDb } from '@/lib/db'
import { getAdminUser } from '@/lib/auth/admin'
import { leadsCsv, listLeads } from '@/lib/okul-teklif-server'

export const dynamic = 'force-dynamic'

/** Admin: okul teklif talepleri CSV olarak (Excel'de açılır). */
export async function GET() {
  if (!(await getAdminUser())) return new Response('Bulunamadı', { status: 404 })
  const csv = leadsCsv(await listLeads(getDb(), 10_000))
  const day = new Date().toISOString().slice(0, 10)
  return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="okul-teklif-${day}.csv"`, 'cache-control': 'no-store' } })
}
