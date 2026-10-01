'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { JrEditor } from '@/components/jr/jr-editor'
import { ArenaEditor } from '@/components/arena/arena-editor'
import { LabEditor } from '@/components/lab/lab-editor'
import { getActivity } from '@/lib/jr/activity'
import { getArenaActivity } from '@/lib/arena/activity'
import { getLabActivity } from '@/lib/lab/activity'
import { markDone, unmarkDone, useDoneIds } from '@/lib/progress-store'
import { recordFinished, recordGoals, recordOpen } from '@/lib/activity-store'
import { countDone } from '@/lib/dashboard'
import { Icon } from '@/components/shell/icons'
import { LessonKindBadge } from '@/components/badges'
import type { LessonKind } from '@/lib/module-meta'
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
  prevTitle?: string | null
  nextTitle?: string | null
  /** Modüldeki tüm ders kimlikleri (yan özet için). */
  moduleLessonIds?: number[]
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
  const arenaActivity = useMemo(() => getArenaActivity(p.activityKey), [p.activityKey])
  const arenaCode = useMemo(() => arenaActivity?.starter(), [arenaActivity])
  const done = doneIds.has(p.lesson.id)
  const hasApp = !!(activity || labActivity || arenaActivity)
  const kind: LessonKind = arenaActivity ? 'arena' : labActivity ? 'devre' : activity ? 'blok' : 'metin'
  const goalTexts: string[] = (arenaActivity?.goals ?? labActivity?.goals ?? activity?.goals ?? []).map((g) => g.text)
  const modCount = countDone(p.moduleLessonIds ?? [], doneIds)

  // Son açılan ders kaydı (panelde "kaldığın yerden devam et" için)
  useEffect(() => { recordOpen(p.lesson.id) }, [p.lesson.id])
  const onGoals = useCallback(() => { setGoalsDone(true); recordGoals(p.lesson.id) }, [p.lesson.id])

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
    recordFinished(p.lesson.id)
    if (p.serverSync) {
      const res = await fetch('/api/progress', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lessonId: p.lesson.id }),
      }).catch(() => null)
      if (!res?.ok) setError('Sunucuya kaydedilemedi; ilerleme bu tarayıcıda saklandı.')
    }
  }

  const wide = hasApp && step === 1
  return (
    <div className={`page page-lesson ${hasApp ? 'has-app' : ''} ${wide ? 'wide-step' : ''} ${p.trackClass}`}>
      <nav aria-label="Konum" className="crumbs">
        <Link href="/moduller">Modüller</Link><Icon name="chevronRight" size={14} />
        <Link href={`/moduller/${p.moduleSlug}`}>{p.moduleTitle}</Link><Icon name="chevronRight" size={14} />
        <span>{p.weekLabel}</span><Icon name="chevronRight" size={14} />
        <span aria-current="page" className="crumb-now">{p.lesson.title}</span>
      </nav>

      <div className="lesson-layout">
        <div className="lesson-main">
          <header className="player-top">
            <h1>{p.lesson.title}</h1>
            <div className="meta">
              <LessonKindBadge kind={kind} />
              <span className="meta-i"><Icon name="clock" size={16} />~{p.lesson.durationMin} dakika</span>
              <span>Ders {p.position.index} / {p.position.total}</span>
              {done && <span className="chip chip-ok">Tamamlandı</span>}
            </div>
          </header>

          <ol className="stepper" aria-label="Ders adımları">
            {STEPS.map((s, i) => (
              <li key={s}>
                <button type="button" onClick={() => go(i)} aria-current={i === step ? 'step' : undefined} className={i < step ? 'done' : undefined}>
                  <span className="n">{i < step ? <Icon name="check" size={13} /> : i + 1}</span><span className="label">{s}</span>
                </button>
              </li>
            ))}
          </ol>

      <section className={`stage${wide ? '' : ' stage-read'}`} aria-live="polite">
        {step === 0 && (<><div className="stage-label">Merak</div><p className="stage-big">{p.lesson.problem}</p></>)}
        {step === 1 && (
          <div className={activity ? 'lesson-split' : labActivity || arenaActivity ? 'lesson-stack' : undefined}>
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
                  onGoalsComplete={onGoals}
                />
              </div>
            )}
            {arenaActivity && arenaCode !== undefined && (
              <div className="lesson-lab lesson-arena" data-activity={p.activityKey} style={{ gridColumn: '1 / -1' }}>
                {arenaActivity.intro && <p className="lesson-app-intro">{arenaActivity.intro}</p>}
                <ArenaEditor
                  key={p.lesson.id}
                  scene={arenaActivity.scene}
                  initialCode={arenaCode}
                  goals={arenaActivity.goals}
                  quickSend={arenaActivity.quickSend}
                  storageKey={`ask:arena:lesson:${p.lesson.id}`}
                  onGoalsComplete={onGoals}
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
                  onGoalsComplete={onGoals}
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
                {(activity || labActivity || arenaActivity) && (
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
              ? <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)}><Icon name="arrowLeft" size={18} />Geri</button>
              : p.prevLessonId ? <Link className="btn btn-ghost" href={`/ders/${p.prevLessonId}`}><Icon name="arrowLeft" size={18} />Önceki ders</Link> : <span />}
            {step < STEPS.length - 1
              ? <button type="button" className="btn btn-primary" onClick={() => go(step + 1)}>İleri<Icon name="arrowRight" size={18} /></button>
              : <span />}
          </div>
          <p className="kbd-hint">Klavyede ← → tuşlarıyla adımlar arasında gezebilirsin.</p>
        </div>

        <aside className="lesson-aside" aria-labelledby="bu-derste">
          <h2 id="bu-derste">Bu derste</h2>
          <ol className="aside-steps">
            {STEPS.map((s, i) => (
              <li key={s} data-state={i === step ? 'now' : i < step ? 'done' : 'todo'}>
                <button type="button" onClick={() => go(i)} aria-current={i === step ? 'step' : undefined}>
                  <span className="n" aria-hidden="true">{i < step ? <Icon name="check" size={12} /> : i + 1}</span>{s}
                </button>
              </li>
            ))}
          </ol>
          {goalTexts.length > 0 && (
            <>
              <h3>Hedefler</h3>
              <ul className="aside-goals">
                {goalTexts.map((t) => <li key={t} data-done={goalsDone}><span className="g" aria-hidden="true">{goalsDone ? <Icon name="check" size={12} /> : null}</span>{t}</li>)}
              </ul>
              <p className="aside-note">{goalsDone ? 'Tüm hedefler tamam.' : 'Hedeflerin durumunu Etkinlik adımında canlı görürsün.'}</p>
            </>
          )}
          <h3>Modülde</h3>
          <div className="progress">
            <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={modCount.total} aria-valuenow={modCount.done} aria-label="Modül ilerlemesi"><div className="progress-fill" style={{ width: `${modCount.pct}%` }} /></div>
            <span className="progress-label">{modCount.done} / {modCount.total}</span>
          </div>
          <div className="aside-nav">
            {p.prevLessonId && <Link href={`/ders/${p.prevLessonId}`}><small>Önceki ders</small>{p.prevTitle}</Link>}
            {p.nextLessonId && <Link href={`/ders/${p.nextLessonId}`}><small>Sonraki ders</small>{p.nextTitle}</Link>}
          </div>
        </aside>
      </div>
    </div>
  )
}
