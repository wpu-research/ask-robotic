'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { JrEditor } from '@/components/jr/jr-editor'
import { LabEditor } from '@/components/lab/lab-editor'
import { getActivity } from '@/lib/jr/activity'
import { getLabActivity } from '@/lib/lab/activity'
import { markDone, unmarkDone, useDoneIds } from '@/lib/progress-store'
import { LessonMarkdown } from './lesson-markdown'

interface Props {
  lesson: { id: number; title: string; durationMin: number; problem: string; contentMd: string; question: string }
  moduleTitle: string
  moduleSlug: string
  trackClass: string
  weekLabel: string
  position: { index: number; total: number }
  prevLessonId: number | null
  nextLessonId: number | null
  callout?: string
  /** Bu derste yazının yanında açılan uygulama etkinliği (yoksa null). */
  activityKey?: string | null
  serverSync: boolean
  serverDone: number[]
}

// Hyvex formatı: problem → kavram/etkinlik → soru → bitir
const STEPS = ['Merak', 'Etkinlik', 'Konuşalım', 'Bitti'] as const

export function LessonPlayer(p: Props) {
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [goalsDone, setGoalsDone] = useState(false)
  const doneIds = useDoneIds()
  const activity = useMemo(() => getActivity(p.activityKey), [p.activityKey])
  const starter = useMemo(() => activity?.starter(), [activity])
  const labActivity = useMemo(() => getLabActivity(p.activityKey), [p.activityKey])
  const labStarter = useMemo(() => labActivity?.starter(), [labActivity])
  const done = doneIds.has(p.lesson.id)

  // Giriş açıkken sunucudaki ilerleme tarayıcıdakiyle birleştirilir
  useEffect(() => { p.serverDone.forEach(markDone) }, [p.serverDone])

  const go = useCallback((n: number) => setStep(Math.max(0, Math.min(STEPS.length - 1, n))), [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return
      if (e.key === 'ArrowRight') go(step + 1)
      if (e.key === 'ArrowLeft') go(step - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, go])

  async function finish() {
    setError('')
    markDone(p.lesson.id)
    if (p.serverSync) {
      const res = await fetch('/api/progress', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lessonId: p.lesson.id }),
      }).catch(() => null)
      if (!res?.ok) setError('Sunucuya kaydedilemedi; ilerleme bu tarayıcıda saklandı.')
    }
  }

  return (
    <div className={`container ${(activity || labActivity) && step === 1 ? 'container-wide' : 'container-narrow'} ${p.trackClass}`}>
      <div className="player-top">
        <p className="crumbs">
          <Link href="/moduller">Modüller</Link> / <Link href={`/moduller/${p.moduleSlug}`}>{p.moduleTitle}</Link> / {p.weekLabel}
        </p>
        <h1 style={{ marginBottom: 8 }}>{p.lesson.title}</h1>
        <div className="meta">
          <span>Ders {p.position.index} / {p.position.total}</span>
          <span>~{p.lesson.durationMin} dakika</span>
          {done && <span className="chip chip-ok">Tamamlandı</span>}
        </div>
      </div>

      <ol className="stepper" aria-label="Ders adımları">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => go(i)} aria-current={i === step ? 'step' : undefined} className={i < step ? 'done' : undefined}>
              <span className="n">{i + 1}</span><span className="label">{s}</span>
            </button>
          </li>
        ))}
      </ol>

      <section className="stage" aria-live="polite">
        {step === 0 && (<><div className="stage-label">Merak</div><p className="stage-big">{p.lesson.problem}</p></>)}
        {step === 1 && (
          <div className={activity ? 'lesson-split' : labActivity ? 'lesson-stack' : undefined}>
            <div>
              {p.callout && (
                <details className="callout" style={{ marginTop: 0 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Bu ders hakkında bilmen gerekenler</summary>
                  <p style={{ margin: '8px 0 0' }}>{p.callout}</p>
                </details>
              )}
              <LessonMarkdown>{p.lesson.contentMd}</LessonMarkdown>
            </div>
            {labActivity && labStarter && (
              <div className="lesson-lab" data-activity={p.activityKey} style={{ gridColumn: '1 / -1' }}>
                {labActivity.intro && <p className="lesson-app-intro">{labActivity.intro}</p>}
                <LabEditor
                  initial={labStarter.circuit}
                  initialCode={labStarter.code}
                  allowedParts={labActivity.allowedParts}
                  goals={labActivity.goals}
                  storageKey={`ask:lab:lesson:${p.lesson.id}`}
                  onGoalsComplete={() => setGoalsDone(true)}
                />
              </div>
            )}
            {activity && starter && (
              <div className="lesson-app" data-activity={p.activityKey}>
                {activity.intro && <p className="lesson-app-intro">{activity.intro}</p>}
                <JrEditor
                  initial={starter}
                  storageKey={`ask:jr:lesson:${p.lesson.id}`}
                  allowedBlocks={activity.allowedBlocks}
                  allowPages={activity.allowPages}
                  allowSprites={activity.allowSprites}
                  goals={activity.goals}
                  onGoalsComplete={() => setGoalsDone(true)}
                />
              </div>
            )}
          </div>
        )}
        {step === 2 && (<><div className="stage-label">Birlikte konuşun</div><p className="stage-big">{p.lesson.question}</p></>)}
        {step === 3 && (
          <div className="done-box">
            {done ? (
              <>
                <div className="check big-check">✓</div>
                <h2>Ders tamamlandı</h2>
                {error && <p role="alert" className="error">{error}</p>}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
                  {p.nextLessonId
                    ? <Link className="btn btn-primary btn-lg" href={`/ders/${p.nextLessonId}`}>Sonraki ders →</Link>
                    : <Link className="btn btn-primary btn-lg" href={`/moduller/${p.moduleSlug}`}>Modül sayfasına dön</Link>}
                  <button type="button" className="btn btn-ghost" onClick={() => unmarkDone(p.lesson.id)}>Tamamlanmadı olarak işaretle</button>
                </div>
              </>
            ) : (
              <>
                <h2>Etkinliği bitirdin mi?</h2>
                {(activity || labActivity) && (
                  <p className="muted">{goalsDone ? 'Uygulamadaki tüm hedefleri tamamladın.' : 'Uygulamadaki hedeflerin hepsi henüz tamamlanmadı; yine de devam edebilirsin.'}</p>
                )}
                <p className="muted">Tamamladığında ilerlemene işlenir.</p>
                <button type="button" className="btn btn-primary btn-lg" onClick={finish}>Dersi tamamladım</button>
              </>
            )}
          </div>
        )}
      </section>

      <div className="player-nav">
        {step > 0
          ? <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)}>← Geri</button>
          : p.prevLessonId ? <Link className="btn btn-ghost" href={`/ders/${p.prevLessonId}`}>← Önceki ders</Link> : <span />}
        {step < STEPS.length - 1
          ? <button type="button" className="btn btn-primary" onClick={() => go(step + 1)}>İleri →</button>
          : <span />}
      </div>
      <p className="kbd-hint">Klavyede ← → tuşlarıyla adımlar arasında gezebilirsin.</p>
    </div>
  )
}
