'use client'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { LabEditor } from '@/components/lab/lab-editor'
import type { Circuit, PartType } from '@/lib/lab/contract'

const api = async (url: string, init?: RequestInit & { json?: unknown }) => {
  const r = await fetch(url, { ...init, cache: 'no-store', headers: init?.json !== undefined ? { 'content-type': 'application/json' } : undefined, body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body })
  const b = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(b.error ?? `HTTP ${r.status}`)
  return b
}
const time = (d: string | null | undefined) => (d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '–')

interface Session { id: string; code: string; title: string; status: string; durationMin: number; createdAt: string; config: { mcqCount: number; mcqPoints: number; definitionPoints: number; projectPoints: number } }

// ---------------------------------------------------------------- oturum listesi
export function ExamSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [err, setErr] = useState('')
  const [f, setF] = useState({ title: 'ESOF 323 Midterm', durationMin: 90, mcqCount: 0, mcqPoints: 0, definitionPoints: 0, projectPoints: 100 })
  const load = useCallback(() => api('/api/sinav/yonetim').then((b) => setSessions(b.sessions)).catch((e) => setErr(e.message)), [])
  useEffect(() => { void load() }, [load])
  const total = f.mcqCount * f.mcqPoints + f.definitionPoints + f.projectPoints

  async function create(e: React.FormEvent) {
    e.preventDefault(); setErr('')
    try {
      await api('/api/sinav/yonetim', { method: 'POST', json: { title: f.title, durationMin: f.durationMin, config: { mcqCount: f.mcqCount, mcqPoints: f.mcqPoints, definitionPoints: f.definitionPoints, projectPoints: f.projectPoints } } })
      await load()
    } catch (e) { setErr((e as Error).message) }
  }
  const num = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((x) => ({ ...x, [k]: Number(e.target.value) }))

  return (
    <div className="exam-admin" lang="en">
      <div className="exam-actions"><h1>ESOF 323 · Online exams</h1><Link className="btn btn-secondary" href="/sinav/yonetim/projeler">Preview the 25 projects</Link></div>
      <form className="card exam-admin-form" onSubmit={create}>
        <label>Title<input className="wide" value={f.title} onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))} /></label>
        <label>Duration (min)<input type="number" min={10} max={300} value={f.durationMin} onChange={num('durationMin')} /></label>
        <label>MCQ count<input type="number" min={0} max={42} value={f.mcqCount} onChange={num('mcqCount')} /></label>
        <label>Pts / MCQ<input type="number" min={0} max={20} value={f.mcqPoints} onChange={num('mcqPoints')} /></label>
        <label>Definition pts<input type="number" min={0} max={50} value={f.definitionPoints} onChange={num('definitionPoints')} /></label>
        <label>Project pts<input type="number" min={0} max={100} value={f.projectPoints} onChange={num('projectPoints')} /></label>
        <span className={total === 100 ? 'muted' : 'exam-pill warn'}>Total {total}</span>
        <button className="btn btn-primary">Create exam</button>
      </form>
      {err && <p className="exam-error">{err}</p>}
      <div className="card exam-table-wrap">
        <table className="exam-table">
          <thead><tr><th>Code</th><th>Title</th><th>Status</th><th>Duration</th><th>Created</th><th /></tr></thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td><b style={{ fontFamily: 'monospace', letterSpacing: '.1em' }}>{s.code}</b></td>
                <td>{s.title}</td><td><span className={`exam-pill ${s.status}`}>{s.status}</span></td>
                <td>{s.durationMin} min</td><td>{new Date(s.createdAt).toLocaleString()}</td>
                <td><Link href={`/sinav/yonetim/${s.id}`}>Manage →</Link></td>
              </tr>
            ))}
            {!sessions.length && <tr><td colSpan={6} className="muted">No exams yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- canlı izleme
interface Row {
  id: string; studentNo: string; studentName: string; projectId: string; startedAt: string; savedAt: string | null; submittedAt: string | null; deadlineAt: string
  flags: { blur: number; pastes: number }; gradeStatus: string; mcqScore: number | null; definitionScore: number | null; projectScore: number | null
  allowRelogin: boolean; answered: number; definitionChars: number; project: number | null; total: number; max: number
}

export function ExamLive({ id, projectTitles }: { id: string; projectTitles: Record<string, string> }) {
  const [data, setData] = useState<{ session: Session; attempts: Row[]; now: string } | null>(null)
  const [err, setErr] = useState('')
  const load = useCallback(() => api(`/api/sinav/yonetim/${id}`).then((b) => { setData(b); setErr('') }).catch((e) => setErr(e.message)), [id])
  useEffect(() => { void load(); const t = setInterval(() => void load(), 5000); return () => clearInterval(t) }, [load])

  const act = async (fn: () => Promise<unknown>, ask?: string) => {
    if (ask && !confirm(ask)) return
    try { await fn(); await load() } catch (e) { alert((e as Error).message) }
  }
  const status = (s: string, ask?: string) => act(() => api(`/api/sinav/yonetim/${id}`, { method: 'PATCH', json: { status: s } }), ask)
  const attempt = (aid: string, json: unknown, ask?: string) => act(() => api(`/api/sinav/yonetim/giris/${aid}`, { method: 'POST', json }), ask)

  if (!data) return <div className="exam-admin" lang="en">{err ? <p className="exam-error">{err}</p> : <p>Loading…</p>}</div>
  const { session: s, attempts } = data
  const submitted = attempts.filter((a) => a.submittedAt).length
  const now = new Date(data.now).getTime()

  return (
    <div className="exam-admin" lang="en">
      <p><Link href="/sinav/yonetim">← All exams</Link></p>
      <div className="card exam-actions" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1>{s.title}</h1>
          <p className="muted">{s.durationMin} min · {s.config.mcqCount} MCQ × {s.config.mcqPoints} + definition {s.config.definitionPoints} + project {s.config.projectPoints}</p>
          <p>Students go to <b>/sinav</b> and enter:</p>
          <div className="exam-code-big">{s.code}</div>
        </div>
        <div className="exam-actions">
          <span className={`exam-pill ${s.status}`}>{s.status}</span>
          {s.status !== 'open' && <button className="btn btn-primary" onClick={() => status('open', s.status === 'closed' ? 'Re-open this exam? Students who already submitted stay submitted.' : undefined)}>Open exam</button>}
          {s.status === 'open' && <button className="btn btn-secondary" onClick={() => status('closed', 'Close the exam? Every unsubmitted attempt is submitted with its last saved answers.')}>Close & submit all</button>}
          <a className="btn btn-secondary" href={`/api/sinav/yonetim/${id}/csv`}>Download CSV</a>
        </div>
      </div>
      {err && <p className="exam-error">{err}</p>}
      <p className="muted">{attempts.length} started · {submitted} submitted · refreshes every 5 s</p>
      <div className="card exam-table-wrap">
        <table className="exam-table">
          <thead><tr><th>No</th><th>Name</th><th>Project</th><th title="MCQ answered">Ans.</th><th title="Definition length (characters)">Def. chars</th><th>Last save</th><th>Left</th><th>Leaves</th><th>Status</th><th>MCQ</th><th>Def</th><th>Proj %</th><th>Total</th><th /></tr></thead>
          <tbody>
            {attempts.map((a) => {
              const left = Math.round((new Date(a.deadlineAt).getTime() - now) / 60000)
              return (
                <tr key={a.id}>
                  <td>{a.studentNo}</td><td>{a.studentName}</td>
                  <td title={projectTitles[a.projectId]}>{a.projectId} {projectTitles[a.projectId]?.slice(0, 22)}</td>
                  <td className="num">{a.answered}</td><td className="num">{a.definitionChars}</td>
                  <td>{time(a.savedAt)}</td>
                  <td className="num">{a.submittedAt ? '–' : `${left}m`}</td>
                  <td className="num">{a.flags.blur ? <span className={`exam-pill${a.flags.blur > 3 ? ' warn' : ''}`}>{a.flags.blur}{a.flags.pastes ? ` · ${a.flags.pastes}p` : ''}</span> : a.flags.pastes ? `${a.flags.pastes}p` : 0}</td>
                  <td>{a.submittedAt ? <span className="exam-pill">{a.gradeStatus === 'done' ? `submitted ${time(a.submittedAt)}` : a.gradeStatus}</span> : <span className="exam-pill open">writing</span>}{a.allowRelogin && <span className="exam-pill warn"> relogin</span>}</td>
                  <td className="num">{a.mcqScore ?? '–'}</td><td className="num">{a.definitionScore ?? '–'}</td><td className="num">{a.projectScore ?? '–'}</td>
                  <td className="num"><b>{a.submittedAt ? `${a.total}/${a.max}` : '–'}</b></td>
                  <td className="exam-row-actions">
                    <Link href={`/sinav/yonetim/giris/${a.id}`}>Open</Link>
                    <button className="exam-mini" title="Allow the student to log in again on another device" onClick={() => attempt(a.id, { action: 'relogin' })}>Relogin</button>
                    <button className="exam-mini" onClick={() => { const m = prompt('Extra minutes?', '10'); if (m) void attempt(a.id, { action: 'extend', minutes: Number(m) }) }}>+Time</button>
                    {!a.submittedAt && <button className="exam-mini" onClick={() => attempt(a.id, { action: 'submit' }, `Submit ${a.studentName}'s exam now?`)}>Submit</button>}
                  </td>
                </tr>
              )
            })}
            {!attempts.length && <tr><td colSpan={14} className="muted">No student has started yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="muted">“Leaves” counts how often the student left the exam window (tab switch, other app). “p” counts large pastes (over 40 characters).</p>
    </div>
  )
}

// ---------------------------------------------------------------- tek öğrenci
interface Detail {
  attempt: { id: string; sessionId: string; studentNo: string; studentName: string; projectId: string; answers: { definition: string }; circuit: Circuit | null; code: string | null; submittedAt: string | null; startedAt: string; flags: { blur: number; pastes: number }; gradeStatus: string; mcqScore: number | null; definitionScore: number | null; projectScore: number | null; teacherNote: string | null; projectGrade: { compiled?: boolean; compileError?: string; serialTail?: string; goals?: { id: string; text: string; kind: string; points: number; earned: number }[]; error?: string } | null }
  session: Session; total: number; max: number
  mcq: { id: string; week: number; q: string; options: string[]; answer: number; why: string; given: number | null }[]
  definition: { term: string; prompt: string; rubric: string[]; points: number } | null
  projectInfo: { id: string; title: string; brief: string; allowedParts: PartType[] } | null
}

export function ExamAttemptDetail({ id }: { id: string }) {
  const [d, setD] = useState<Detail | null>(null)
  const [def, setDef] = useState('')
  const [pscore, setPscore] = useState('')
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState('')
  const load = useCallback(() => api(`/api/sinav/yonetim/giris/${id}`).then((b: Detail) => {
    setD(b)
    setDef(b.attempt.definitionScore?.toString() ?? ''); setPscore(b.attempt.projectScore?.toString() ?? ''); setNote(b.attempt.teacherNote ?? '')
  }).catch((e) => setMsg(e.message)), [id])
  useEffect(() => { void load() }, [load])

  if (!d) return <div className="exam-admin" lang="en">{msg ? <p className="exam-error">{msg}</p> : <p>Loading…</p>}</div>
  const proj = d.projectInfo
  const a = d.attempt, g = a.projectGrade
  const save = async () => {
    try {
      await api(`/api/sinav/yonetim/giris/${id}`, { method: 'PATCH', json: { definitionScore: def === '' ? null : Number(def), projectScore: pscore === '' ? null : Number(pscore), teacherNote: note } })
      setMsg('Saved'); await load()
    } catch (e) { setMsg((e as Error).message) }
  }
  const regrade = async () => { try { await api(`/api/sinav/yonetim/giris/${id}`, { method: 'POST', json: { action: 'regrade' } }); setMsg('Regrading… reload in a few seconds'); setTimeout(() => void load(), 6000) } catch (e) { setMsg((e as Error).message) } }
  const t = d

  return (
    <div className="exam-admin" lang="en">
      <p><Link href={`/sinav/yonetim/${a.sessionId}`}>← Back to exam</Link></p>
      <div className="card">
        <h1>{a.studentName} <span className="muted">· {a.studentNo}</span></h1>
        <p>Total <b>{t.total}/{t.max}</b> · MCQ {a.mcqScore ?? '–'} · Definition {a.definitionScore ?? '–'} · Project {a.projectScore ?? '–'}% ({a.gradeStatus}) · left window {a.flags.blur}× · large pastes {a.flags.pastes}</p>
        <p className="muted">Started {new Date(a.startedAt).toLocaleString()} · submitted {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '—'}</p>
      </div>

      <div className="card">
        <h2>Part B · Definition{d.definition ? `: ${d.definition.term}` : ''}</h2>
        {d.definition && <p className="muted">{d.definition.prompt}</p>}
        <div className="exam-pre" style={{ maxHeight: 'none', fontFamily: 'inherit', fontSize: 15 }}>{a.answers.definition || '(empty)'}</div>
        {d.definition && <><h3>Rubric</h3><ul>{d.definition.rubric.map((r) => <li key={r}>{r}</li>)}</ul></>}
        <div className="exam-admin-form">
          <label>Definition score (0-{d.session.config.definitionPoints})<input type="number" min={0} max={d.session.config.definitionPoints} value={def} onChange={(e) => setDef(e.target.value)} /></label>
          <label>Project % override (0-100)<input type="number" min={0} max={100} value={pscore} onChange={(e) => setPscore(e.target.value)} /></label>
          <label>Note<input className="wide" value={note} onChange={(e) => setNote(e.target.value)} /></label>
          <button className="btn btn-primary" onClick={() => void save()}>Save</button>
          {msg && <span className="muted">{msg}</span>}
        </div>
      </div>

      <div className="card">
        <div className="exam-actions" style={{ justifyContent: 'space-between' }}>
          <h2>Part C · {proj ? `${proj.id} ${proj.title}` : a.projectId}</h2>
          <button className="btn btn-secondary" onClick={() => void regrade()}>Regrade</button>
        </div>
        {g?.compileError && <p className="exam-error">{g.compileError}</p>}
        {g?.error && <p className="exam-error">{g.error}</p>}
        {g?.goals?.map((x) => (
          <div key={x.id} className="exam-goal-row"><span className={x.earned ? 'ok' : 'no'}>{x.earned ? '✓' : '✗'}</span><span className={`exam-kind exam-kind-${x.kind}`}>{x.kind}</span><span>{x.text}</span><b>{x.earned}/{x.points}</b></div>
        ))}
        {g?.serialTail && <><h3>Serial output during grading</h3><div className="exam-pre">{g.serialTail}</div></>}
        {proj && <details><summary>Task text</summary><div className="exam-brief-text">{proj.brief}</div></details>}
        <h3>Student circuit and code (you can run it)</h3>
        <div className="exam-lab">
          {a.circuit && <LabEditor initial={a.circuit} initialCode={a.code ?? ''} allowedParts={proj?.allowedParts} />}
        </div>
      </div>

      <div className="card exam-mcq-review">
        <h2>Part A · Multiple choice ({a.mcqScore ?? 0} pts)</h2>
        <ol>
          {d.mcq.map((q) => (
            <li key={q.id}>
              <p className="exam-q-text"><b>[{q.id} · week {q.week}]</b> {q.q}</p>
              <p className={q.given === q.answer ? 'right' : 'wrong'}>
                Answer: {q.given == null ? '(blank)' : q.options[q.given]} {q.given === q.answer ? '✓' : `✗ → correct: ${q.options[q.answer]}`}
              </p>
              <p className="muted">{q.why}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- proje önizleme
export interface ProjectPreview {
  id: string; title: string; story: string; brief: string; weeks: number[]; allowedParts: PartType[]
  goals: { id: string; text: string; kind: string; points: number }[]
  solution: { circuit: Circuit; code: string }; starter: { circuit: Circuit; code: string }
}

export function ExamProjectsPreview({ projects }: { projects: ProjectPreview[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const [mode, setMode] = useState<'solution' | 'starter'>('solution')
  return (
    <div className="exam-admin" lang="en">
      <p><Link href="/sinav/yonetim">← All exams</Link></p>
      <h1>{projects.length} exam projects</h1>
      <p className="muted">Each student gets one project at random; projects are spread evenly within an exam. Open a project to run the reference solution in the lab.</p>
      {projects.map((p) => (
        <div key={p.id} className="card">
          <div className="exam-actions" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>{p.id} · {p.title} <small className="muted">weeks {p.weeks.join(', ')}</small></h2>
            <div className="exam-actions">
              <button className="btn btn-secondary" onClick={() => { setMode('solution'); setOpen(open === p.id && mode === 'solution' ? null : p.id) }}>Reference solution</button>
              <button className="btn btn-ghost" onClick={() => { setMode('starter'); setOpen(open === p.id && mode === 'starter' ? null : p.id) }}>Student view</button>
            </div>
          </div>
          <p className="exam-story">{p.story}</p>
          <details><summary>Task and graded requirements</summary>
            <div className="exam-brief-text">{p.brief}</div>
            <ul className="exam-reqs">{p.goals.map((g) => <li key={g.id}><span className={`exam-kind exam-kind-${g.kind}`}>{g.kind}</span>{g.text}<b>{g.points}</b></li>)}</ul>
            <p className="muted">Parts offered: {p.allowedParts.join(', ')}</p>
          </details>
          {open === p.id && (
            <div className="exam-lab">
              <LabEditor key={`${p.id}-${mode}`} initial={p[mode].circuit} initialCode={p[mode].code} allowedParts={p.allowedParts} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
