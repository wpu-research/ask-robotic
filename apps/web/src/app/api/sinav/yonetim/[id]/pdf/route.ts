import { getDb } from '@/lib/db'
import { handle, fail, requireAdmin } from '@/lib/sinav/http'
import { pdfName, sessionPdf } from '@/lib/sinav/pdf'
import { getSession, listAttempts } from '@/lib/sinav/service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Tüm öğrencilerin sınav kâğıtları tek PDF'te. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireAdmin()
    const { id } = await params
    const db = getDb()
    const s = await getSession(db, id)
    if (!s) return fail(404, 'Not found')
    const bytes = await sessionPdf(s, await listAttempts(db, id))
    return new Response(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${pdfName(s)}"`, 'Cache-Control': 'no-store' } })
  })
}
