import { getDb } from '@/lib/db'
import { handle, fail, requireAdmin } from '@/lib/sinav/http'
import { examProject } from '@/lib/sinav/projects'
import { getSession, listAttempts, totalScore } from '@/lib/sinav/service'

export const dynamic = 'force-dynamic'

const cell = (v: unknown) => {
  const s = v == null ? '' : String(v)
  // Excel formül enjeksiyonuna karşı
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
  return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireAdmin()
    const { id } = await params
    const db = getDb()
    const s = await getSession(db, id)
    if (!s) return fail(404, 'Not found')
    const head = ['Student No', 'Name', 'Project', 'MCQ', 'Definition', 'Project (0-100)', 'Project (weighted)', 'Total', 'Max', 'Submitted', 'Tab switches', 'Pastes', 'Note']
    const rows = (await listAttempts(db, id)).map((a) => {
      const t = totalScore(a, s.config)
      return [a.studentNo, a.studentName, `${a.projectId} ${examProject(a.projectId)?.title ?? ''}`, a.mcqScore, a.definitionScore, a.projectScore, t.project, t.total, t.max,
        a.submittedAt?.toISOString() ?? '', a.flags.blur, a.flags.pastes, a.teacherNote]
    })
    const csv = '﻿' + [head, ...rows].map((r) => r.map(cell).join(',')).join('\r\n')
    return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="exam-${s.code}.csv"`, 'Cache-Control': 'no-store' } })
  })
}
