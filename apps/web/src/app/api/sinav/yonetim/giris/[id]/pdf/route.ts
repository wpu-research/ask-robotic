import { getDb } from '@/lib/db'
import { handle, fail, requireAdmin } from '@/lib/sinav/http'
import { attemptPdf, pdfName } from '@/lib/sinav/pdf'
import { getAttempt, getSession } from '@/lib/sinav/service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Tek öğrencinin sınav kâğıdı (PDF). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireAdmin()
    const { id } = await params
    const db = getDb()
    const a = await getAttempt(db, id)
    if (!a) return fail(404, 'Not found')
    const s = (await getSession(db, a.sessionId))!
    const bytes = await attemptPdf(s, a)
    return new Response(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${pdfName(s, a)}"`, 'Cache-Control': 'no-store' } })
  })
}
