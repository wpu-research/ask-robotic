'use client'
import { useRouter } from 'next/navigation'
import { useMemo, useState, type FormEvent } from 'react'
import { useT } from '@/i18n/client'
import { localizeError, sendJson } from './api'

export interface PickModule { id: number; title: string; weeks: { id: number; position: number; title: string; lessons: { id: number; position: number; title: string }[] }[] }
type Kind = 'lesson' | 'week' | 'module'

/** Ödev atama: modül → hafta → ders; hedef tam olarak biri. */
export function AssignForm({ classId, catalog }: { classId: string; catalog: PickModule[] }) {
  const t = useT()
  const router = useRouter()
  const [kind, setKind] = useState<Kind>('lesson')
  const [modId, setModId] = useState(catalog[0]?.id ?? 0)
  const mod = useMemo(() => catalog.find((m) => m.id === modId), [catalog, modId])
  const [weekId, setWeekId] = useState(mod?.weeks[0]?.id ?? 0)
  const week = mod?.weeks.find((w) => w.id === weekId) ?? mod?.weeks[0]
  const [lessonId, setLessonId] = useState(0)
  const lesson = week?.lessons.find((l) => l.id === lessonId) ?? week?.lessons[0]
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const due = String(new FormData(e.currentTarget).get('due') ?? '')
    const target = kind === 'lesson' ? { lessonId: lesson?.id } : kind === 'week' ? { weekId: week?.id } : { moduleId: mod?.id }
    setBusy(true); setError(''); setOk('')
    const r = await sendJson(`/api/ogretmen/sinif/${classId}/odevler`, { ...target, dueAt: due ? new Date(due).toISOString() : null })
    setBusy(false)
    if (!r.ok) { setError(localizeError(t, r.error)); return }
    setOk(t('teacher.assign.assigned'))
    router.refresh()
  }
  if (!catalog.length) return <p className="muted">{t('teacher.assign.noCatalog')}</p>
  return (
    <form className="og-form" onSubmit={onSubmit} style={{ maxWidth: 720 }}>
      <div className="og-seg" role="group" aria-label={t('teacher.assign.kind')}>
        {(['lesson', 'week', 'module'] as const).map((k) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>{t(`teacher.assign.${k}`)}</button>
        ))}
      </div>
      <label className="field">{t('teacher.assign.module')}
        <select value={modId} onChange={(e) => { const m = catalog.find((x) => x.id === Number(e.target.value)); setModId(Number(e.target.value)); setWeekId(m?.weeks[0]?.id ?? 0); setLessonId(0) }}>
          {catalog.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </label>
      {kind !== 'module' && (
        <label className="field">{t('teacher.assign.week')}
          <select value={week?.id ?? 0} onChange={(e) => { setWeekId(Number(e.target.value)); setLessonId(0) }}>
            {mod?.weeks.map((w) => <option key={w.id} value={w.id}>{t('teacher.assign.weekOption', { n: w.position, title: w.title, count: w.lessons.length })}</option>)}
          </select>
        </label>
      )}
      {kind === 'lesson' && (
        <label className="field">{t('teacher.assign.lesson')}
          <select value={lesson?.id ?? 0} onChange={(e) => setLessonId(Number(e.target.value))}>
            {week?.lessons.map((l) => <option key={l.id} value={l.id}>{l.position}. {l.title}</option>)}
          </select>
        </label>
      )}
      <label className="field">{t('teacher.assign.dueLabel')}<input type="datetime-local" name="due" /></label>
      {error && <p role="alert" className="og-err">{error}</p>}
      {ok && <p role="status" className="og-ok">{ok}</p>}
      <button className="v2-btn accent" disabled={busy}>{t('teacher.assign.submit')}</button>
    </form>
  )
}

/** Haftalık plan: modülün haftaları sırayla, ilk teslimden başlayarak `n` haftada bir. */
export function PlanForm({ classId, catalog }: { classId: string; catalog: PickModule[] }) {
  const t = useT()
  const router = useRouter()
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const first = String(f.get('first') ?? '')
    setBusy(true); setError(''); setOk('')
    const r = await sendJson<{ created: number; skipped: number }>(`/api/ogretmen/sinif/${classId}/odevler/plan`, {
      moduleId: Number(f.get('module')),
      firstDue: first ? new Date(first).toISOString() : '',
      everyWeeks: Number(f.get('every')),
    })
    setBusy(false)
    if (!r.ok) { setError(localizeError(t, r.error)); return }
    setOk(t('teacher.plan.created', { created: r.data.created, skipped: r.data.skipped }))
    router.refresh()
  }
  if (!catalog.length) return null
  return (
    <form className="og-form" onSubmit={onSubmit} style={{ maxWidth: 720 }}>
      <p className="muted" style={{ margin: 0 }}>{t('teacher.plan.lead')}</p>
      <label className="field">{t('teacher.assign.module')}
        <select name="module" defaultValue={catalog[0].id}>
          {catalog.map((m) => <option key={m.id} value={m.id}>{m.title} ({m.weeks.length})</option>)}
        </select>
      </label>
      <label className="field">{t('teacher.plan.firstDue')}<input type="datetime-local" name="first" required /></label>
      <label className="field">{t('teacher.plan.every')}
        <select name="every" defaultValue={1}>
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{t('teacher.plan.everyOption', { n })}</option>)}
        </select>
      </label>
      {error && <p role="alert" className="og-err">{error}</p>}
      {ok && <p role="status" className="og-ok">{ok}</p>}
      <button className="v2-btn accent" disabled={busy}>{t('teacher.plan.submit')}</button>
    </form>
  )
}

export function DeleteAssignmentButton({ classId, assignmentId }: { classId: string; assignmentId: string }) {
  const t = useT()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  return (
    <button type="button" className="og-link-btn danger" disabled={busy} onClick={async () => {
      if (!window.confirm(t('teacher.assign.confirmDelete'))) return
      setBusy(true)
      const r = await sendJson(`/api/ogretmen/sinif/${classId}/odevler`, { assignmentId }, 'DELETE')
      setBusy(false)
      if (r.ok) router.refresh(); else window.alert(localizeError(t, r.error))
    }}>{t('teacher.assign.delete')}</button>
  )
}
