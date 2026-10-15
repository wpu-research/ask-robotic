import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { getDb } from '@/lib/db'
import { getCatalog } from '@/lib/catalog'
import { classStudents, listAssignments } from '@/lib/classroom'
import { lastActivity, loadProgressMatrix, loadSkillHeatmap, loadStuck, loadTutorMessages } from '@/lib/class-insights'
import { skillById } from '@/lib/skills'
import { qrSvg, originFromHeaders } from '@/lib/qr-svg'
import { requireClassPage } from '@/lib/teacher-page'
import { BulkAddForm, RosterTable } from '@/components/teacher/cards'
import { AssignForm, DeleteAssignmentButton, PlanForm } from '@/components/teacher/assign-form'
import { AutoRefresh } from '@/components/teacher/auto-refresh'
import { intlTag, type TFunction } from '@/i18n'
import { getLocale, getT } from '@/i18n/server'
import '../../../ogretmen.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('teacher.class.title') }
}
export const dynamic = 'force-dynamic'

const TABS = [{ id: 'ogrenciler' }, { id: 'odevler' }, { id: 'ilerleme' }, { id: 'beceriler' }, { id: 'sohbetler' }] as const
type Tab = (typeof TABS)[number]['id']

/** Sayfa dili: çevirici + tarih biçimi (istek başına). */
async function i18n() {
  const t = await getT()
  const tag = intlTag(await getLocale())
  const when = (d: Date | null) => (d ? d.toLocaleString(tag, { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Istanbul' }) : '—')
  return { t, when }
}
type I18n = { t: TFunction; when: (d: Date | null) => string }

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function Sinif({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams
  const tab: Tab = TABS.some((t) => t.id === sp.sekme) ? (sp.sekme as Tab) : 'ogrenciler'
  const { cls } = await requireClassPage(id, `/ogretmen/sinif/${id}?sekme=${tab}`)
  const tx = await i18n()
  const { t } = tx
  return (
    <div className="page og">
      <div className="og-head">
        <div>
          <p className="v2-eyebrow"><Link href="/ogretmen">{t('teacher.myClasses')}</Link></p>
          <h1>{cls.name}{cls.gradeLevel != null && <span className="muted" style={{ fontSize: '1rem', marginLeft: 8 }}>{cls.gradeLevel === 0 ? t('teacher.kindergarten') : t('teacher.grade', { n: cls.gradeLevel })}</span>}</h1>
        </div>
        <span className="chip">{t('teacher.class.classCode')} <b className="og-code">{cls.joinCode}</b></span>
      </div>
      <nav className="og-tabs" aria-label={t('teacher.class.sections')}>
        {TABS.map((x) => <Link key={x.id} href={`/ogretmen/sinif/${id}?sekme=${x.id}`} aria-current={x.id === tab ? 'page' : undefined}>{t(`teacher.class.tabs.${x.id}`)}</Link>)}
      </nav>
      {tab === 'ogrenciler' && <Students classId={id} className={cls.name} joinCode={cls.joinCode} tx={tx} />}
      {tab === 'odevler' && <Assignments classId={id} tx={tx} />}
      {tab === 'ilerleme' && <ProgressTab classId={id} tx={tx} />}
      {tab === 'beceriler' && <SkillsTab classId={id} tx={tx} />}
      {tab === 'sohbetler' && <ChatsTab classId={id} studentId={typeof sp.ogrenci === 'string' ? sp.ogrenci : undefined} tx={tx} />}
    </div>
  )
}

async function Students({ classId, className, joinCode, tx: { t } }: { classId: string; className: string; joinCode: string; tx: I18n }) {
  const db = getDb()
  const students = await classStudents(db, classId)
  const last = await lastActivity(db, students.map((s) => s.id))
  const joinUrl = `${originFromHeaders(await headers())}/sinif/katil?kod=${joinCode}`
  const svg = await qrSvg(joinUrl)
  return (
    <>
      <section className="panel">
        <div className="og-head">
          <h2 className="panel-title" style={{ margin: 0 }}>{t('teacher.class.studentsCount', { n: students.length })}</h2>
          <Link className="btn btn-ghost btn-sm" href={`/ogretmen/sinif/${classId}/kartlar`}>{t('teacher.class.qrPage')}</Link>
        </div>
        <div style={{ marginTop: 12 }}>
          <RosterTable classId={classId} className={className}
            rows={students.map((s) => ({ id: s.id, name: s.name, username: s.username, loginMode: s.loginMode, lastActive: last[s.id]?.toISOString() ?? null }))} />
        </div>
      </section>
      <section className="panel">
        <h2 className="panel-title">{t('teacher.class.bulkAdd')}</h2>
        <BulkAddForm classId={classId} className={className} />
      </section>
      <section className="panel" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
        <div className="og-card" style={{ border: 0 }} aria-label={t('teacher.class.joinQr')} dangerouslySetInnerHTML={{ __html: svg }} />
        <div>
          <h2 className="panel-title">{t('teacher.class.joinCodeTitle')}</h2>
          <p className="og-code og-code-big" style={{ margin: 0 }}>{joinCode}</p>
          <p className="muted">{t('teacher.class.joinHelpBefore')} <b>/sinif/katil</b> {t('teacher.class.joinHelpAfter')}</p>
        </div>
      </section>
    </>
  )
}

async function Assignments({ classId, tx: { t, when } }: { classId: string; tx: I18n }) {
  const db = getDb()
  const [list, catalog] = await Promise.all([listAssignments(db, classId), getCatalog(db)])
  const pick = catalog.map((m) => ({ id: m.id, title: m.title, weeks: m.weeks.map((w) => ({ id: w.id, position: w.position, title: w.title, lessons: w.lessons.map((l) => ({ id: l.id, position: l.position, title: l.title })) })) }))
  return (
    <>
      <section className="panel">
        <h2 className="panel-title">{t('teacher.assign.listTitle', { n: list.length })}</h2>
        {list.length ? (
          <ul className="og-list">
            {list.map((a) => (
              <li key={a.id}>
                <span>
                  <span className="chip" style={{ marginRight: 8 }}>{t(a.target === 'lesson' ? 'teacher.assign.lesson' : a.target === 'week' ? 'teacher.assign.week' : 'teacher.assign.module')}</span>
                  <b>{a.label}</b> <span className="muted">· {t('teacher.assign.lessons', { n: a.lessonIds.length })}</span>
                </span>
                <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="muted">{a.dueAt ? t('teacher.assign.due', { date: when(a.dueAt) }) : t('teacher.assign.noDue')}</span>
                  {a.target === 'lesson' && <Link className="og-link-btn" href={`/ogretmen/sunum/${a.targetId}?sinif=${classId}`}>{t('teacher.assign.present')}</Link>}
                  <DeleteAssignmentButton classId={classId} assignmentId={a.id} />
                </span>
              </li>
            ))}
          </ul>
        ) : <p className="muted">{t('teacher.assign.none')}</p>}
      </section>
      <section className="panel">
        <h2 className="panel-title">{t('teacher.assign.newTitle')}</h2>
        <AssignForm classId={classId} catalog={pick} />
      </section>
      <section className="panel">
        <h2 className="panel-title">{t('teacher.plan.title')}</h2>
        <PlanForm classId={classId} catalog={pick} />
      </section>
    </>
  )
}

async function ProgressTab({ classId, tx: { t, when } }: { classId: string; tx: I18n }) {
  const db = getDb()
  const [m, stuck] = await Promise.all([loadProgressMatrix(db, classId), loadStuck(db, classId)])
  return (
    <>
      <AutoRefresh seconds={30} />
      <section className="panel og-stuck" aria-live="polite">
        <h2 className="panel-title">{t('teacher.progress.stuckTitle')}</h2>
        <p className="muted" style={{ marginTop: -8 }}>
          {t('teacher.progress.stuckHelpBase')}{stuck.current ? <>{t('teacher.progress.stuckHelpCurrentBefore')}<b>{stuck.current.label}</b>{t('teacher.progress.stuckHelpCurrentAfter')}</> : ''}{t('teacher.progress.stuckHelpRefresh')}
        </p>
        {stuck.stuck.length ? (
          <ul>
            {stuck.stuck.map((s) => (
              <li key={s.id}>
                <b>{s.name}</b>
                <span style={{ display: 'flex', gap: 6 }}>
                  {s.reasons.includes('wrong') && <span className="og-tag">{t('teacher.progress.wrong', { n: s.wrong })}</span>}
                  {s.reasons.includes('idle') && <span className="og-tag">{s.lastOnCurrent ? t('teacher.progress.idleMin', { n: Math.round((Date.now() - s.lastOnCurrent.getTime()) / 60000) }) : t('teacher.progress.notStarted')}</span>}
                </span>
              </li>
            ))}
          </ul>
        ) : <p className="og-ok">{t('teacher.progress.noneStuck')}</p>}
      </section>
      <section className="panel">
        <h2 className="panel-title">{t('teacher.progress.matrixTitle')}</h2>
        {!m.students.length ? <p className="muted">{t('teacher.noStudents')}</p> : (
          <div className="og-table-wrap">
            <table className="og-table">
              <thead>
                <tr><th>{t('teacher.progress.student')}</th>{m.assignments.map((a) => <th key={a.id} className="rot" title={a.label}>{a.label.split(' › ').pop()}</th>)}<th>{t('teacher.progress.lastActivity')}</th></tr>
              </thead>
              <tbody>
                {m.students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    {m.assignments.map((a) => {
                      const c = m.cells[s.id][a.id]
                      return <td key={a.id}><span className={`og-cell${c.total && c.done === c.total ? ' full' : c.done ? ' part' : ''}`}>{c.done}/{c.total}</span></td>
                    })}
                    <td className="muted">{when(m.lastActivity[s.id])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!m.assignments.length && m.students.length > 0 && <p className="muted">{t('teacher.progress.afterAssign')}</p>}
      </section>
    </>
  )
}

const heat = (score: number) => `hsl(${Math.round(score * 120)} 70% 72%)`

async function SkillsTab({ classId, tx: { t } }: { classId: string; tx: I18n }) {
  const { students, map } = await loadSkillHeatmap(getDb(), classId)
  if (!map.skills.length) return <section className="panel"><h2 className="panel-title">{t('teacher.skills.title')}</h2><p className="muted">{t('teacher.skills.noData')}</p></section>
  const label = (id: string) => skillById(id)?.label ?? id
  return (
    <section className="panel">
      <h2 className="panel-title">{t('teacher.skills.title')}</h2>
      <div className="og-legend" style={{ marginBottom: 12 }}>
        <span><i style={{ background: heat(0) }} />{t('teacher.skills.struggling')}</span>
        <span><i style={{ background: heat(0.5) }} />{t('teacher.skills.developing')}</span>
        <span><i style={{ background: heat(1) }} />{t('teacher.skills.mastered')}</span>
        <span><i style={{ background: 'var(--surface-2)' }} />{t('teacher.skills.none')}</span>
        <span>{t('teacher.skills.legend')}</span>
      </div>
      <div className="og-table-wrap">
        <table className="og-table">
          <thead><tr><th>{t('teacher.progress.student')}</th>{map.skills.map((s) => <th key={s} className="rot" title={skillById(s)?.description}>{label(s)}</th>)}</tr></thead>
          <tbody>
            <tr>
              <th>{t('teacher.skills.classAvg')}</th>
              {map.skills.map((s) => { const a = map.classAvg[s]; return <td key={s}><span className="og-heat" style={{ background: heat(a.score) }} title={t('teacher.skills.avgTitle', { students: a.students, attempts: a.attempts })}>{Math.round(a.score * 100)}</span></td> })}
            </tr>
            {students.map((st) => (
              <tr key={st.id}>
                <td>{st.name}</td>
                {map.skills.map((s) => {
                  const v = map.byUser[st.id]?.[s]
                  return <td key={s}>{v
                    ? <span className="og-heat" style={{ background: heat(v.score), opacity: 0.55 + 0.45 * v.confidence }} title={t('teacher.skills.cellTitle', { level: t(`teacher.skills.levels.${v.level}`), attempts: v.attempts })}>{Math.round(v.score * 100)}</span>
                    : <span className="og-heat none">–</span>}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

async function ChatsTab({ classId, studentId, tx: { t, when } }: { classId: string; studentId?: string; tx: I18n }) {
  const db = getDb()
  const [students, msgs] = await Promise.all([classStudents(db, classId), loadTutorMessages(db, classId, { studentId })])
  return (
    <section className="panel">
      <div className="og-head">
        <h2 className="panel-title" style={{ margin: 0 }}>{t('teacher.chats.title')}</h2>
        <form method="get" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="hidden" name="sekme" value="sohbetler" />
          <select name="ogrenci" defaultValue={studentId ?? ''} aria-label={t('teacher.chats.student')} className="og-select" style={{ padding: 8, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
            <option value="">{t('teacher.chats.all')}</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm">{t('teacher.chats.filter')}</button>
        </form>
      </div>
      <p className="muted">{t('teacher.chats.readOnly')}</p>
      {msgs.length ? (
        <div className="og-chat">
          {msgs.map((m) => (
            <article key={m.id} className={`og-msg ${m.role === 'assistant' ? 'assistant' : ''}`}>
              <header>
                <b>{m.role === 'assistant' ? `AI → ${m.studentName}` : m.studentName}</b>
                {m.lessonTitle && <span>· {m.lessonTitle}</span>}
                <span>· {when(m.createdAt)}</span>
                {m.flag && <span className="og-flag">· {m.flag === 'refusal' || m.flag === 'empty' ? t(`teacher.chats.flags.${m.flag}`) : m.flag}</span>}
              </header>
              <p>{m.content}</p>
            </article>
          ))}
        </div>
      ) : <p className="muted">{t('teacher.chats.none')}</p>}
    </section>
  )
}
