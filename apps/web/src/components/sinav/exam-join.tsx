'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ExamJoin({ resume }: { resume: { title: string; student: string } | null }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [no, setNo] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const r = await fetch('/api/sinav', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code, studentNo: no, studentName: name }) })
      const b = await r.json().catch(() => ({}))
      if (!r.ok) { setError(b.error ?? 'Could not start the exam'); return }
      window.location.assign('/sinav/oturum')
    } catch { setError('Network error, try again') } finally { setBusy(false) }
  }

  return (
    <div className="exam-join" lang="en">
      <div className="exam-join-card">
        <p className="exam-eyebrow">ESOF 323 · Robotics</p>
        <h1>Online exam</h1>
        {resume && (
          <div className="exam-resume">
            <p>You have an exam in progress: <b>{resume.title}</b> ({resume.student}).</p>
            <button type="button" className="btn btn-primary" onClick={() => window.location.assign('/sinav/oturum')}>Continue exam</button>
          </div>
        )}
        <form onSubmit={submit} className="exam-form">
          <label>Exam code
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} autoComplete="off" spellCheck={false} placeholder="e.g. R7K2QF" required className="exam-code-input" />
          </label>
          <label>Student number
            <input value={no} onChange={(e) => setNo(e.target.value)} maxLength={20} inputMode="numeric" autoComplete="off" required />
          </label>
          <label>Full name
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" required />
          </label>
          {error && <p className="exam-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Starting…' : 'Start exam'}</button>
        </form>
        <ul className="exam-rules">
          <li>You get one robot project: build its circuit and write its Arduino code in the lab.</li>
          <li>Your answers are saved automatically. If your laptop restarts, open this page again on the same browser.</li>
          <li>Leaving the exam window is recorded and reported to the instructor.</li>
          <li>When time is up, your last saved answers are submitted automatically.</li>
        </ul>
      </div>
    </div>
  )
}
