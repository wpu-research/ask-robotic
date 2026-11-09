import { getDb } from '@/lib/db'
import { handle, fail, requireAdmin } from '@/lib/sinav/http'
import { MAX_SVG } from '@/lib/sinav/circuit-image'
import { attemptPdf, pdfName } from '@/lib/sinav/pdf'
import { getAttempt, getSession } from '@/lib/sinav/service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Tek öğrencinin sınav kâğıdı (PDF). */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) { return build(req, ctx, {}) }

/** Devre görüntüsü öğretmenin tarayıcısında üretilip gönderilir: { svgs: { girişKimliği: svg } }. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) { return build(req, ctx, await readSvgs(req)) }

async function build(_req: Request, { params }: { params: Promise<{ id: string }> }, svgs: Record<string, string>) {
  return handle(async () => {
    await requireAdmin()
    const { id } = await params
    const db = getDb()
    const a = await getAttempt(db, id)
    if (!a) return fail(404, 'Not found')
    const s = (await getSession(db, a.sessionId))!
    const bytes = await attemptPdf(s, a, svgs[a.id])
    return new Response(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${pdfName(s, a)}"`, 'Cache-Control': 'no-store' } })
  })
}

async function readSvgs(req: Request): Promise<Record<string, string>> {
  const b = await req.json().catch(() => null) as { svgs?: unknown } | null
  const out: Record<string, string> = {}
  if (b?.svgs && typeof b.svgs === 'object') {
    for (const [k, v] of Object.entries(b.svgs as Record<string, unknown>).slice(0, 300)) if (typeof v === 'string' && v.length <= MAX_SVG) out[k] = v
  }
  return out
}
