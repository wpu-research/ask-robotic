import { getDb } from '@/lib/db'
import { getAdminUser } from '@/lib/auth/admin'
import { careerOf } from '@/lib/kariyer'
import { listSurveys, surveysCsv } from '@/lib/kariyer-anket-server'

export const dynamic = 'force-dynamic'

/** Admin: kariyer anketi cevapları CSV olarak (Excel'de açılır). */
export async function GET() {
  if (!(await getAdminUser())) return new Response('Bulunamadı', { status: 404 })
  const csv = surveysCsv(await listSurveys(getDb(), 10_000), (s) => careerOf(s)?.tr.title ?? s)
  const day = new Date().toISOString().slice(0, 10)
  return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="kariyer-anketi-${day}.csv"`, 'cache-control': 'no-store' } })
}
