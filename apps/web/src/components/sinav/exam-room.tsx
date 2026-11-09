'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LabEditor } from '@/components/lab/lab-editor'
import type { Circuit } from '@/lib/lab/contract'
import type { StudentView } from '@/lib/sinav/service'

type Tab = 'mcq' | 'definition' | 'project'
type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const fmt = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  return `${h ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function ExamRoom() {
  const router = useRouter()
  const [view, setView] = useState<StudentView | null>(null)
  const [loadError, setLoadError] = useState('')
  const [tab, setTab] = useState<Tab>('mcq')
  const [mcq, setMcq] = useState<Record<string, number>>({})
  const [definition, setDefinition] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [save, setSave] = useState<{ state: SaveState; at?: string; msg?: string }>({ state: 'idle' })
  const [submitted, setSubmitted] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [briefOpen, setBriefOpen] = useState(true)

  // Kaydedilmemiş değişiklikler ref'lerde (LabEditor her tuşta onChange çağırır)
  const work = useRef<{ circuit?: Circuit; code?: string; labDirty: boolean; ansDirty: boolean; blur: number; pastes: number }>({ labDirty: false, ansDirty: false, blur: 0, pastes: 0 })
  const answers = useRef({ mcq, definition }); answers.current = { mcq, definition }
  const inflight = useRef(false)
  const done = useRef(false)

  useEffect(() => {
    // Laboratuvar arayüzü İngilizce olmalı: sayfa Türkçe çizildiyse dili çevirip bir kez yeniden yükle
    if (document.documentElement.lang !== 'en' && !sessionStorage.getItem('exam-lang-reload')) {
      try { sessionStorage.setItem('exam-lang-reload', '1') } catch { /* gizli pencere */ }
      document.cookie = 'ask-locale=en; path=/; max-age=31536000; samesite=lax'
      window.location.reload()
      return
    }
    fetch('/api/sinav', { cache: 'no-store' }).then(async (r) => {
      const b = await r.json().catch(() => ({}))
      if (r.status === 401) { router.replace('/sinav'); return }
      if (!r.ok) { setLoadError(b.error ?? 'Could not load the exam'); return }
      const v = b as StudentView
      setView(v); setMcq(v.answers.mcq ?? {}); setDefinition(v.answers.definition ?? '')
      if (v.submitted) { setSubmitted(true); done.current = true }
    }).catch(() => setLoadError('Network error. Reload the page.'))
  }, [router])

  const payload = useCallback(() => {
    const w = work.current
    const p: Record<string, unknown> = { mcq: answers.current.mcq, definition: answers.current.definition, blur: w.blur, pastes: w.pastes }
    if (w.labDirty) { p.circuit = w.circuit; p.code = w.code }
    return p
  }, [])

  const flush = useCallback(async () => {
    const w = work.current
    if (done.current || inflight.current || (!w.labDirty && !w.ansDirty && !w.blur && !w.pastes)) return
    inflight.current = true
    const p = payload()
    const sent = { blur: w.blur, pastes: w.pastes }
    w.labDirty = false; w.ansDirty = false
    setSave({ state: 'saving' })
    try {
      const r = await fetch('/api/sinav/kaydet', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(p) })
      const b = await r.json().catch(() => ({}))
      if (r.ok) {
        w.blur -= sent.blur; w.pastes -= sent.pastes
        setSave({ state: 'saved', at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) })
      } else {
        if ('circuit' in p) w.labDirty = true
        w.ansDirty = true
        if (r.status === 409) { done.current = true; setSubmitted(true) }
        setSave({ state: 'error', msg: b.error ?? 'Save failed' })
      }
    } catch {
      if ('circuit' in p) w.labDirty = true
      w.ansDirty = true
      setSave({ state: 'error', msg: 'Offline – will retry' })
    } finally { inflight.current = false }
  }, [payload])

  const doSubmit = useCallback(async () => {
    if (done.current) return
    setSubmitting(true)
    for (let i = 0; i < 5 && inflight.current; i++) await new Promise((r) => setTimeout(r, 400))
    const w = work.current
    w.labDirty = w.labDirty || !!w.code
    try {
      const r = await fetch('/api/sinav/teslim', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload()) })
      const b = await r.json().catch(() => ({}))
      if (r.ok || r.status === 409) { done.current = true; setSubmitted(true); setConfirm(false) }
      else setSave({ state: 'error', msg: b.error ?? 'Submit failed, try again' })
    } catch { setSave({ state: 'error', msg: 'Network error – submit again' }) } finally { setSubmitting(false) }
  }, [payload])

  // Saat, otomatik kayıt, süre bitince teslim
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    const s = setInterval(() => { void flush() }, 10_000)
    return () => { clearInterval(t); clearInterval(s) }
  }, [flush])
  const left = view ? new Date(view.deadlineAt).getTime() - now : Infinity
  useEffect(() => { if (view && !submitted && left <= 0) void doSubmit() }, [left, view, submitted, doSubmit])

  // Cevap değişince kısa gecikmeyle kaydet
  useEffect(() => {
    if (!view) return
    work.current.ansDirty = true
    const t = setTimeout(() => { void flush() }, 1500)
    return () => clearTimeout(t)
  }, [mcq, definition, view, flush])

  // Pencereden çıkma ve yapıştırma sayacı; kapatırken uyarı
  useEffect(() => {
    let hidden = false
    const leave = () => { if (!hidden && !done.current) { hidden = true; work.current.blur++ } }
    const back = () => { hidden = false }
    const vis = () => (document.hidden ? leave() : back())
    const paste = (e: ClipboardEvent) => { if (!done.current && (e.clipboardData?.getData('text').length ?? 0) > 40) work.current.pastes++ }
    const unload = (e: BeforeUnloadEvent) => { if (!done.current) { void flush(); e.preventDefault() } }
    window.addEventListener('blur', leave); window.addEventListener('focus', back)
    document.addEventListener('visibilitychange', vis); document.addEventListener('paste', paste, true)
    window.addEventListener('beforeunload', unload)
    return () => {
      window.removeEventListener('blur', leave); window.removeEventListener('focus', back)
      document.removeEventListener('visibilitychange', vis); document.removeEventListener('paste', paste, true)
      window.removeEventListener('beforeunload', unload)
    }
  }, [flush])

  const onLabChange = useCallback((circuit: Circuit, code: string) => {
    const w = work.current
    if (w.circuit !== undefined) w.labDirty = true
    w.circuit = circuit; w.code = code
  }, [])

  if (loadError) return <div className="exam-join" lang="en"><div className="exam-join-card"><p className="exam-error">{loadError}</p></div></div>
  if (!view) return <div className="exam-join" lang="en"><div className="exam-join-card"><p>Loading exam…</p></div></div>
  if (submitted) {
    return (
      <div className="exam-join" lang="en"><div className="exam-join-card">
        <p className="exam-eyebrow">ESOF 323 · Robotics</p>
        <h1>Exam submitted</h1>
        <p>Thank you, {view.student.name}. Your answers have been recorded. Your project will be graded automatically and reviewed by the instructor.</p>
        <p className="muted">You can close this window now.</p>
      </div></div>
    )
  }

  const answered = view.mcq.filter((q) => mcq[q.id] !== undefined).length
  const cfg = view.session.config
  const lowTime = left < 5 * 60_000

  return (
    <div className="exam-room" lang="en">
      <header className="exam-bar">
        <div className="exam-bar-id">
          <b>{view.session.title}</b>
          <span>{view.student.no} · {view.student.name}</span>
        </div>
        <nav className="exam-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'mcq'} onClick={() => setTab('mcq')}>A · Multiple choice <small>{answered}/{view.mcq.length}</small></button>
          <button role="tab" aria-selected={tab === 'definition'} onClick={() => setTab('definition')}>B · Definition <small>{definition.trim() ? '✓' : '–'}</small></button>
          <button role="tab" aria-selected={tab === 'project'} onClick={() => setTab('project')}>C · Project <small>{cfg.projectPoints} pts</small></button>
        </nav>
        <div className="exam-bar-right">
          <span className={`exam-save exam-save-${save.state}`} title={save.msg}>
            {save.state === 'saving' ? 'Saving…' : save.state === 'saved' ? `Saved ${save.at}` : save.state === 'error' ? save.msg : 'Autosave on'}
          </span>
          <span className={`exam-timer${lowTime ? ' low' : ''}`} aria-live="polite">{fmt(left)}</span>
          <button className="btn btn-primary" onClick={() => setConfirm(true)}>Submit</button>
        </div>
      </header>

      <div className="exam-body">
        {tab === 'mcq' && (
          <section className="exam-section">
            <h2>Part A · Multiple choice <small>{cfg.mcqPoints} pts each · no negative marking</small></h2>
            <ol className="exam-mcq">
              {view.mcq.map((q, i) => (
                <li key={q.id}>
                  <p className="exam-q"><span>{i + 1}.</span> <span className="exam-q-text">{q.q}</span></p>
                  <div className="exam-options">
                    {q.options.map((o, j) => (
                      <label key={o.value} className={mcq[q.id] === o.value ? 'on' : ''}>
                        <input type="radio" name={q.id} checked={mcq[q.id] === o.value} onChange={() => setMcq((m) => ({ ...m, [q.id]: o.value }))} />
                        <b>{'ABCD'[j]}</b> <span className="exam-q-text">{o.text}</span>
                      </label>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
            <div className="exam-next"><button className="btn btn-secondary" onClick={() => setTab('definition')}>Next: Part B →</button></div>
          </section>
        )}

        {tab === 'definition' && (
          <section className="exam-section">
            <h2>Part B · Definition <small>{view.definition.points} pts</small></h2>
            <p className="exam-def-prompt">{view.definition.prompt}</p>
            <textarea className="exam-def" value={definition} onChange={(e) => setDefinition(e.target.value)} maxLength={6000} rows={14}
              placeholder="Write your answer here. Define the concept precisely and give a concrete robotics example." spellCheck />
            <p className="muted exam-count">{definition.trim().split(/\s+/).filter(Boolean).length} words</p>
            <div className="exam-next"><button className="btn btn-secondary" onClick={() => setTab('project')}>Next: Part C →</button></div>
          </section>
        )}

        {/* Proje sekmesi gizlenince editör sökülmesin (benzetim ve geri alma geçmişi korunur) */}
        <section className="exam-section exam-project" hidden={tab !== 'project'}>
          <div className="exam-brief">
            <button className="exam-brief-toggle" onClick={() => setBriefOpen((o) => !o)} aria-expanded={briefOpen}>
              <h2>Part C · {view.project.title}</h2><span>{briefOpen ? 'Hide task ▲' : 'Show task ▼'}</span>
            </button>
            {briefOpen && (
              <div className="exam-brief-body">
                <p className="exam-story">{view.project.story}</p>
                <div className="exam-brief-text">{view.project.brief}</div>
                <h3>Requirements (graded automatically)</h3>
                <ul className="exam-reqs">
                  {view.project.requirements.map((r) => <li key={r.id}><span className={`exam-kind exam-kind-${r.kind}`}>{r.kind}</span>{r.text}<b>{r.points}</b></li>)}
                </ul>
                <p className="muted">Build the circuit, write the code, press <b>Run</b> to test it in the simulator. Your circuit and code are saved automatically. The grader compiles your code and runs it on your circuit with its own test inputs. Code that does not compile gets no behaviour points.</p>
              </div>
            )}
          </div>
          <div className="exam-lab">
            <LabEditor initial={view.circuit} initialCode={view.code} allowedParts={view.project.allowedParts} onChange={onLabChange} />
          </div>
        </section>
      </div>

      {confirm && (
        <div className="exam-modal" role="dialog" aria-modal="true" aria-labelledby="exam-confirm-title">
          <div className="exam-modal-card">
            <h2 id="exam-confirm-title">Submit the exam?</h2>
            <ul>
              <li>Multiple choice: {answered} of {view.mcq.length} answered{answered < view.mcq.length ? ' ⚠' : ''}</li>
              <li>Definition: {definition.trim() ? `${definition.trim().split(/\s+/).length} words` : 'empty ⚠'}</li>
              <li>Project: your current circuit and code will be graded.</li>
            </ul>
            <p>You cannot change your answers after submitting.</p>
            <div className="exam-modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirm(false)} disabled={submitting}>Back to exam</button>
              <button className="btn btn-primary" onClick={() => void doSubmit()} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit now'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
