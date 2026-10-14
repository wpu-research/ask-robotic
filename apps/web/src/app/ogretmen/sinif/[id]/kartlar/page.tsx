import type { Metadata } from 'next'
import Link from 'next/link'
import { getDb } from '@/lib/db'
import { classStudents } from '@/lib/classroom'
import { lastActivity } from '@/lib/class-insights'
import { requireClassPage } from '@/lib/teacher-page'
import { RosterTable } from '@/components/teacher/cards'
import { getT } from '@/i18n/server'
import '../../../../ogretmen.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('teacher.cards.pageTitle') }
}
export const dynamic = 'force-dynamic'

// Gizli kodlar DB'de yalnız özet olarak durur; basılı kart için kod yenilenir (eski kart geçersiz olur).
export default async function Kartlar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { cls } = await requireClassPage(id, `/ogretmen/sinif/${id}/kartlar`)
  const db = getDb()
  const students = await classStudents(db, id)
  const last = await lastActivity(db, students.map((s) => s.id))
  const t = await getT()
  return (
    <div className="page og">
      <div className="og-head">
        <div>
          <p className="v2-eyebrow"><Link href={`/ogretmen/sinif/${id}`}>{cls.name}</Link></p>
          <h1>{t('teacher.cards.pageTitle')}</h1>
          <p className="muted">{t('teacher.cards.pageLead')}</p>
        </div>
      </div>
      <section className="panel">
        <RosterTable classId={id} className={cls.name} selectable
          rows={students.map((s) => ({ id: s.id, name: s.name, username: s.username, loginMode: s.loginMode, lastActive: last[s.id]?.toISOString() ?? null }))} />
      </section>
    </div>
  )
}
