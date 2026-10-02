'use client'
// Yüzen öğretici kartı: yönerge + adım noktaları; her hedef bir adım, yapılınca ✓ ve otomatik sonraki adım. Küçült / Kapat.
import { useEffect, useRef, useState } from 'react'
import type { GoalResult } from '@/lib/sahne/activity'

export function GoalsCard({ intro, results, error, open, onOpenChange, onShowBlock }: {
  intro: string
  results: GoalResult[] | null
  error: string | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onShowBlock?: () => void
}) {
  const [mini, setMini] = useState(false)
  const [step, setStep] = useState(-1) // -1 = yönerge
  const req = results?.filter((g) => !g.optional) ?? []
  const done = req.filter((g) => g.ok).length
  const all = !!results && req.length > 0 && done === req.length
  const doneSig = results?.map((g) => (g.ok ? 1 : 0)).join('') ?? ''
  const prev = useRef(doneSig)
  // bir hedef tamamlanınca (ya da ilk açılışta) ilk bitmemiş adıma geç
  useEffect(() => {
    if (!results) return
    if (prev.current !== '' && prev.current !== doneSig) {
      const next = results.findIndex((g) => !g.ok && !g.optional)
      setStep(next >= 0 ? next : results.length)
    }
    prev.current = doneSig
  }, [doneSig, results])

  if (!results) return null
  if (!open) return null
  const n = results.length
  const cur = step >= 0 && step < n ? results[step] : null
  const go = (s: number) => setStep(Math.max(-1, Math.min(n, s)))

  if (mini) {
    return (
      <button type="button" className="sh-goalpill" data-complete={all} onClick={() => setMini(false)} aria-label="Hedef kartını aç" data-testid="sahne-goals-pill">
        <span aria-hidden="true">{all ? '★' : '◎'}</span> {done}/{req.length}
      </button>
    )
  }
  return (
    <aside className="sh-goalcard" data-complete={all} aria-label="Öğretici kartı" data-testid="sahne-goals">
      <header className="sh-gc-head">
        <div className="sh-dots" role="tablist" aria-label="Adımlar">
          <button type="button" role="tab" aria-selected={step === -1} className="sh-dot sh-dot-i" onClick={() => go(-1)} aria-label="Yönerge" title="Yönerge">i</button>
          {results.map((g, i) => (
            <button key={g.id} type="button" role="tab" aria-selected={step === i} className="sh-dot" data-done={g.ok} data-optional={!!g.optional} onClick={() => go(i)} aria-label={`Adım ${i + 1}${g.ok ? ' (tamam)' : ''}`} title={g.label} data-testid={`sahne-goal-dot-${g.id}`} />
          ))}
        </div>
        <span className="sh-gc-count">{done}/{req.length}</span>
        <button type="button" className="sh-gc-btn" onClick={() => setMini(true)} title="Küçült" aria-label="Küçült">▁</button>
        <button type="button" className="sh-gc-btn" onClick={() => onOpenChange(false)} title="Kapat" aria-label="Kapat">✕</button>
      </header>
      <div className="sh-gc-body" aria-live="polite">
        {step === -1 && <p className="sh-gc-intro" data-testid="sahne-intro">{intro}</p>}
        {cur && (
          <div className="sh-gc-step" data-done={cur.ok}>
            <span className="sh-gc-mark" aria-hidden="true">{cur.ok ? '✓' : step + 1}</span>
            <div>
              <b>{cur.label}</b>{cur.optional && <em className="sh-gc-opt"> (isteğe bağlı)</em>}
              {!cur.ok && cur.hint && <small>{cur.hint}</small>}
              {cur.detail && !cur.ok && <small className="sh-gc-detail">Şu an: {cur.detail}</small>}
            </div>
          </div>
        )}
        {step >= n && <p className="sh-gc-ok" data-testid="sahne-goals-ok">{all ? 'Tüm hedefler tamam. Harika iş!' : 'Zorunlu hedeflerin hepsi için ilerle; isteğe bağlı olanlar bonus.'}</p>}
        {error && <p className="sh-gc-err" role="alert">Program hata verdi: {error}</p>}
      </div>
      <footer className="sh-gc-foot">
        <button type="button" className="sh-gc-nav" onClick={() => go(step - 1)} disabled={step <= -1} aria-label="Önceki adım">◀</button>
        <span className="muted">{step < 0 ? 'Yönerge' : step >= n ? 'Bitti' : `Adım ${step + 1} / ${n}`}</span>
        <button type="button" className="sh-gc-nav" onClick={() => go(step + 1)} disabled={step >= n} aria-label="Sonraki adım" data-testid="sahne-goal-next">▶</button>
        {onShowBlock && <span />}
      </footer>
    </aside>
  )
}
