import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { and, eq, events } from '@ask/db'
import { getDb } from '@/lib/db'
import { getCatalog } from '@/lib/catalog'
import { classStudents } from '@/lib/classroom'
import { getCompletedLessonIds } from '@/lib/content'
import { skillHeatmap } from '@/lib/class-insights'
import { buildReportCard, loadXpStats } from '@/lib/karne'
import { skillById } from '@/lib/skills'
import { isUuid } from '@/lib/class-access'
import { requireClassPage } from '@/lib/teacher-page'
import { PrintButton } from '@/components/teacher/print-button'
import { intlTag } from '@/i18n'
import { getLocale, getT } from '@/i18n/server'
import '../../../../../ogretmen.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('teacher.report.title') }
}
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string; ogrenci: string }> }

export default async function Karne({ params }: Props) {
  const { id, ogrenci } = await params
  const { cls } = await requireClassPage(id, `/ogretmen/sinif/${id}/karne/${ogrenci}`)
  if (!isUuid(ogrenci)) notFound()
  const db = getDb()
  const student = (await classStudents(db, id)).find((s) => s.id === ogrenci)
  if (!student) notFound()

  const catalog = await getCatalog(db)
  const lessonIds = catalog.flatMap((m) => m.weeks.flatMap((w) => w.lessons.map((l) => l.id)))
  const [done, answers, xp] = await Promise.all([
    getCompletedLessonIds(db, student.id, lessonIds),
    db.select({ lessonId: events.lessonId, ts: events.ts, payload: events.payload }).from(events)
      .where(and(eq(events.userId, student.id), eq(events.type, 'quiz_answer'))),
    loadXpStats(db, student.id),
  ])
  const mastery = Object.values(skillHeatmap(answers.map((a) => ({ ...a, userId: student.id }))).byUser[student.id] ?? {})
  const card = buildReportCard(catalog, done, mastery, xp)

  const t = await getT()
  const date = new Date().toLocaleDateString(intlTag(await getLocale()), { dateStyle: 'long', timeZone: 'Europe/Istanbul' })
  const label = (skill: string) => skillById(skill)?.label ?? skill

  return (
    <div className="page og">
      <div className="og-head og-no-print">
        <p className="v2-eyebrow"><Link href={`/ogretmen/sinif/${id}?sekme=ilerleme`}>{cls.name}</Link></p>
        <PrintButton />
      </div>
      <article className="panel og-print og-report">
        <header className="og-head">
          <div>
            <p className="v2-eyebrow">{t('teacher.report.title')}</p>
            <h1 style={{ margin: 0 }}>{student.name}</h1>
            <p className="muted" style={{ margin: 0 }}>{cls.name} · {date}</p>
          </div>
        </header>

        <div className="og-stats og-report-stats">
          <div><b>{card.lessonsDone}</b><span>{t('teacher.report.lessons')}</span></div>
          <div><b>{card.weeksDone}</b><span>{t('teacher.report.projects')}</span></div>
          <div><b>{card.mastered.length}</b><span>{t('teacher.report.skillsMastered')}</span></div>
          <div><b>{card.activeDays}</b><span>{t('teacher.report.activeDays')}</span></div>
          <div><b>{card.xp}</b><span>XP</span></div>
        </div>

        <section>
          <h2 className="panel-title">{t('teacher.report.badges')}</h2>
          <ul className="og-badges">
            {card.achievements.map((a) => (
              <li key={a.id} className={`og-badge${a.tier ? ` tier-${a.tier}` : ' locked'}`}>
                <b>{t(`teacher.report.badge.${a.id}.title`)}</b>
                <span>{a.tier ? t(`teacher.report.tier.${a.tier}`) : t('teacher.report.notYet')}</span>
                <small>{t(`teacher.report.badge.${a.id}.desc`, { n: a.value })}{a.next != null ? ` · ${t('teacher.report.nextAt', { n: a.next })}` : ''}</small>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="panel-title">{t('teacher.report.modules')}</h2>
          {card.modules.length ? (
            <table className="og-table">
              <thead><tr><th>{t('teacher.report.module')}</th><th>{t('teacher.report.lessons')}</th><th>{t('teacher.report.projects')}</th></tr></thead>
              <tbody>
                {card.modules.map((m) => (
                  <tr key={m.slug}><td>{m.title}</td><td>{m.done}/{m.total}</td><td>{m.weeksDone}/{m.weeks}</td></tr>
                ))}
              </tbody>
            </table>
          ) : <p className="muted">{t('teacher.report.none')}</p>}
        </section>

        <section className="og-report-cols">
          <div>
            <h2 className="panel-title">{t('teacher.report.skillsMastered')}</h2>
            {card.mastered.length ? <ul>{card.mastered.slice(0, 12).map((s) => <li key={s.skill}>{label(s.skill)}</li>)}</ul> : <p className="muted">{t('teacher.report.none')}</p>}
          </div>
          <div>
            <h2 className="panel-title">{t('teacher.report.skillsDeveloping')}</h2>
            {card.developing.length ? <ul>{card.developing.slice(0, 12).map((s) => <li key={s.skill}>{label(s.skill)}</li>)}</ul> : <p className="muted">{t('teacher.report.none')}</p>}
          </div>
        </section>

        <section>
          <h2 className="panel-title">{t('teacher.report.values')}</h2>
          {card.values.length ? (
            <ul className="og-report-values">
              {card.values.map((v) => <li key={v.deger}><b>{v.label}</b>: {v.outcomes.join(' ')}</li>)}
            </ul>
          ) : <p className="muted">{t('teacher.report.valuesNone')}</p>}
        </section>
        <p className="muted og-matrix-note">{t('teacher.report.method')}</p>
      </article>
    </div>
  )
}
