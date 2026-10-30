'use client'

import Link from 'next/link'
import { useLocale } from '@/i18n/client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { JrEditor } from '@/components/jr/jr-editor'
import { ArenaEditor } from '@/components/arena/arena-editor'
import { LabEditor } from '@/components/lab/lab-editor'
import { MikroEditor } from '@/components/mikro/mikro-editor'
import { OyunEditor } from '@/components/oyun/oyun-editor'
import { SahneEditor } from '@/components/sahne/sahne-editor'
import { AiEditor } from '@/components/ai/ai-editor'
import { getActivity } from '@/lib/jr/activity'
import { getArenaActivity } from '@/lib/arena/activity'
import { getLabActivity } from '@/lib/lab/activity'
import { getMikroActivity } from '@/lib/mikro/activities'
import { getOyunActivity } from '@/lib/oyun/activities/ders-registry'
import { getSahneActivity } from '@/lib/sahne/activities'
import { getAiActivity } from '@/lib/ai/activities'
import { markDone, unmarkDone, useDoneIds } from '@/lib/progress-store'
import { recordFinished, recordGoals, recordOpen } from '@/lib/activity-store'
import { countDone } from '@/lib/dashboard'
import { Icon } from '@/components/shell/icons'
import { LessonKindBadge } from '@/components/badges'
import { ConceptCards } from '@/components/learn/concept-cards'
import { QuizPlayer } from '@/components/learn/quiz-player'
import { logEvent, setEventLesson, startLessonTimer } from '@/lib/events'
import type { Concept, QuizQuestion } from '@ask/db'
import type { LessonKind } from '@/lib/module-meta'
import { LessonMarkdown } from './lesson-markdown'
import { GuestBar, useMemberGate } from '@/components/paywall/member-gate'

interface Props {
  lesson: { id: number; title: string; durationMin: number; problem: string; contentMd: string; question: string; explainerMd?: string | null; concepts?: Concept[] | null; quiz?: QuizQuestion[] | null }
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
  /** Üye olmayan ziyaretçi: içeriği okur; etkinlik, test ve bitirme eylemlerinde "üye ol" penceresi çıkar. */
  guest?: boolean
  /** Kayıt kampanyası metni (kontenjan dolmadıysa). */
  promo?: string | null
}

// Hyvex formatı: problem → kavram/etkinlik → soru → bitir. Öğrenme platformu katmanı: dersin anlatımı/testi varsa
// "Anlatım" (Merak'tan sonra) ve "Test" (Etkinlik'ten sonra) adımları eklenir; yoksa eski 4 adım aynen kalır.
type StepId = 'merak' | 'anlatim' | 'etkinlik' | 'test' | 'konusalim' | 'bitti'
const STEP_LABEL: Record<StepId, string> = { merak: 'Merak', anlatim: 'Anlatım', etkinlik: 'Etkinlik', test: 'Test', konusalim: 'Konuşalım', bitti: 'Bitti' }
const STEP_LABEL_EN: Record<StepId, string> = { merak: 'Wonder', anlatim: 'Explainer', etkinlik: 'Activity', test: 'Quiz', konusalim: 'Discuss', bitti: 'Done' }

export function LessonPlayer(p: Props) {
  const en = useLocale() === 'en'
  const gate = useMemberGate(!!p.guest, `/ders/${p.lesson.id}?klasik=1`, p.promo)
  const hasExplainer = !!(p.lesson.explainerMd || p.lesson.concepts?.length)
  const hasQuiz = !!p.lesson.quiz?.length
  const STEPS = useMemo<StepId[]>(
    () => ['merak', ...(hasExplainer ? ['anlatim' as const] : []), 'etkinlik', ...(hasQuiz ? ['test' as const] : []), 'konusalim', 'bitti'],
    [hasExplainer, hasQuiz],
  )
  const [step, setStep] = useState(0)
  const cur = STEPS[step]
  const [error, setError] = useState('')
  const [goalsDone, setGoalsDone] = useState(false)
  const doneIds = useDoneIds()
  const activity = useMemo(() => getActivity(p.activityKey), [p.activityKey])
  const starter = useMemo(() => activity?.starter(), [activity])
  const labActivity = useMemo(() => getLabActivity(p.activityKey), [p.activityKey])
  const labStarter = useMemo(() => labActivity?.starter(), [labActivity])
  const arenaActivity = useMemo(() => getArenaActivity(p.activityKey), [p.activityKey])
  const arenaCode = useMemo(() => arenaActivity?.starter(), [arenaActivity])
  const mikroActivity = useMemo(() => getMikroActivity(p.activityKey), [p.activityKey])
  const oyunActivity = useMemo(() => getOyunActivity(p.activityKey), [p.activityKey])
  const sahneActivity = useMemo(() => getSahneActivity(p.activityKey), [p.activityKey])
  const aiActivity = useMemo(() => getAiActivity(p.activityKey), [p.activityKey])
  const done = doneIds.has(p.lesson.id)
  const hasApp = !!(activity || labActivity || arenaActivity || mikroActivity || oyunActivity || sahneActivity || aiActivity)
  const kind: LessonKind = aiActivity ? 'ai' : arenaActivity ? 'arena' : labActivity ? 'devre' : oyunActivity ? 'oyun' : activity || mikroActivity || sahneActivity ? 'blok' : 'metin'
  const goalTexts: string[] = (
    arenaActivity?.goals.map((g) => g.text) ?? labActivity?.goals.map((g) => g.text) ?? mikroActivity?.goals.map((g) => g.text)
    ?? oyunActivity?.goals.map((g) => g.label) ?? sahneActivity?.goals.filter((g) => !g.optional).map((g) => g.label) ?? aiActivity?.goals.map((g) => g.label) ?? activity?.goals.map((g) => g.text) ?? []
  )
  const modCount = countDone(p.moduleLessonIds ?? [], doneIds)

  // Son açılan ders kaydı (panelde "kaldığın yerden devam et" için)
  useEffect(() => { recordOpen(p.lesson.id) }, [p.lesson.id])
  // Ölçme verisi (yalnız onayla kaydedilir): ders görüntüleme, ekranda geçen süre
  useEffect(() => {
    setEventLesson(p.lesson.id)
    logEvent('lesson_view', { lessonId: p.lesson.id, p: { kind } })
    const stop = startLessonTimer(p.lesson.id)
    return () => { stop(); setEventLesson(null) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.lesson.id])
  const started = useRef(false)
  useEffect(() => {
    if (cur === 'etkinlik' && hasApp && !started.current) { started.current = true; logEvent('activity_start', { lessonId: p.lesson.id, p: { kind } }) }
    if (cur === 'anlatim' && p.lesson.concepts?.length) logEvent('concept_view', { lessonId: p.lesson.id, p: { n: p.lesson.concepts.length } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur])
  const onGoals = useCallback(() => { setGoalsDone(true); recordGoals(p.lesson.id); logEvent('goal_done', { lessonId: p.lesson.id }) }, [p.lesson.id])

  // Giriş açıkken sunucudaki ilerleme tarayıcıdakiyle birleştirilir
  useEffect(() => { p.serverDone.forEach(markDone) }, [p.serverDone])

  // Misafir yalnız ilk adımı (Merak) görür; adım değiştirmek de bir eylemdir
  const go = useCallback((n: number) => { if (p.guest) { gate.ask(); return } setStep(Math.max(0, Math.min(STEPS.length - 1, n))) }, [STEPS, p.guest, gate.ask]) // eslint-disable-line react-hooks/exhaustive-deps
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
    if (p.guest) { gate.ask(); return }
    setError('')
    markDone(p.lesson.id)
    recordFinished(p.lesson.id)
    logEvent('lesson_done', { lessonId: p.lesson.id, p: { goals: goalsDone } })
    if (p.serverSync) {
      const res = await fetch('/api/progress', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lessonId: p.lesson.id }),
      }).catch(() => null)
      if (!res?.ok) setError(en ? 'Could not save to the server; your progress is kept in this browser.' : 'Sunucuya kaydedilemedi; ilerleme bu tarayıcıda saklandı.')
    }
  }

  const wide = hasApp && cur === 'etkinlik'
  return (
    <div className={`page page-lesson ${hasApp ? 'has-app' : ''} ${wide ? 'wide-step' : ''} ${p.trackClass}`}>
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/moduller">{en ? 'Modules' : 'Modüller'}</Link><Icon name="chevronRight" size={14} />
        <Link href={`/moduller/${p.moduleSlug}`}>{p.moduleTitle}</Link><Icon name="chevronRight" size={14} />
        <span>{p.weekLabel}</span><Icon name="chevronRight" size={14} />
        <span aria-current="page" className="crumb-now">{p.lesson.title}</span>
      </nav>

      {p.guest && <GuestBar next={`/ders/${p.lesson.id}?klasik=1`} promo={p.promo} />}
      <div className="lesson-layout">
        <div className="lesson-main">
          <header className="player-top">
            <h1>{p.lesson.title}</h1>
            <div className="meta">
              <LessonKindBadge kind={kind} />
              <span className="meta-i"><Icon name="clock" size={16} />~{p.lesson.durationMin} dakika</span>
              <span>Ders {p.position.index} / {p.position.total}</span>
              {done && <span className="chip chip-ok">{en ? 'Completed' : 'Tamamlandı'}</span>}
            </div>
          </header>

          <ol className="stepper" aria-label={en ? 'Lesson steps' : 'Ders adımları'}>
            {STEPS.map((s, i) => (
              <li key={s}>
                <button type="button" onClick={() => go(i)} aria-current={i === step ? 'step' : undefined} className={i < step ? 'done' : undefined}>
                  <span className="n">{i < step ? <Icon name="check" size={13} /> : i + 1}</span><span className="label">{(en ? STEP_LABEL_EN : STEP_LABEL)[s]}</span>
                </button>
              </li>
            ))}
          </ol>

      <section className={`stage${wide ? '' : ' stage-read'}`} aria-live="polite">
        {cur === 'merak' && (<><div className="stage-label">{en ? 'Wonder' : 'Merak'}</div><p className="stage-big">{p.lesson.problem}</p></>)}
        {cur === 'anlatim' && (
          <div className="lesson-explainer">
            <div className="stage-label">{en ? 'Explainer' : 'Konu anlatımı'}</div>
            {p.lesson.explainerMd && <LessonMarkdown>{p.lesson.explainerMd}</LessonMarkdown>}
            {p.lesson.concepts && p.lesson.concepts.length > 0 && <ConceptCards concepts={p.lesson.concepts} />}
          </div>
        )}
        {cur === 'test' && p.lesson.quiz && <div {...gate.capture}><QuizPlayer key={p.lesson.id} lessonId={p.lesson.id} questions={p.lesson.quiz} /></div>}
        {cur === 'etkinlik' && (
          <div className={activity ? 'lesson-split' : labActivity || arenaActivity || mikroActivity || oyunActivity || sahneActivity || aiActivity ? 'lesson-stack' : undefined}>
            <div>
              {p.callout && (
                <details className="callout" style={{ marginTop: 0 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700 }}>{en ? 'What you need to know about this lesson' : 'Bu ders hakkında bilmen gerekenler'}</summary>
                  <p style={{ margin: '8px 0 0' }}>{p.callout}</p>
                </details>
              )}
              <LessonMarkdown>{p.lesson.contentMd}</LessonMarkdown>
            </div>
            {labActivity && labStarter && (
              <div className="lesson-lab" data-activity={p.activityKey} style={{ gridColumn: '1 / -1' }} {...gate.capture}>
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
              <div className="lesson-lab lesson-arena" data-activity={p.activityKey} style={{ gridColumn: '1 / -1' }} {...gate.capture}>
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
            {mikroActivity && (
              <div className="lesson-lab lesson-mikro" data-activity={p.activityKey} style={{ gridColumn: '1 / -1' }} {...gate.capture}>
                <div className="mk-page-body">
                  <MikroEditor
                    key={p.lesson.id}
                    activity={mikroActivity}
                    storageKey={`ask:mikro:ders:${p.activityKey}`}
                    onGoalsChange={(_s, all) => { if (all) onGoals() }}
                  />
                </div>
              </div>
            )}
            {oyunActivity && (
              <div className="lesson-lab lesson-oyun" data-activity={p.activityKey} style={{ gridColumn: '1 / -1' }} {...gate.capture}>
                <div className="oy-tool-body">
                  <OyunEditor
                    key={p.lesson.id}
                    activity={oyunActivity}
                    storageKey={`ask:oyun:ders:${p.activityKey}`}
                    onGoalsChange={(_r, all) => { if (all) onGoals() }}
                  />
                </div>
              </div>
            )}
            {sahneActivity && (
              <div className="lesson-lab lesson-sahne" data-activity={p.activityKey} style={{ gridColumn: '1 / -1' }} {...gate.capture}>
                <SahneEditor
                  key={p.lesson.id}
                  activity={sahneActivity}
                  storageKey={`ask:sahne:ders:${p.activityKey}`}
                  onGoalsChange={(_r, all) => { if (all) onGoals() }}
                />
              </div>
            )}
            {aiActivity && (
              <div className="lesson-lab lesson-ai" data-activity={p.activityKey} style={{ gridColumn: '1 / -1' }} {...gate.capture}>
                <AiEditor
                  key={p.lesson.id}
                  activity={aiActivity}
                  storageKey={`ask:ai:ders:${p.activityKey}`}
                  onGoalsChange={(_r, all) => { if (all) onGoals() }}
                />
              </div>
            )}
            {activity && starter && (
              <div className="lesson-app" data-activity={p.activityKey} {...gate.capture}>
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
        {cur === 'konusalim' && (<><div className="stage-label">{en ? 'Talk it over together' : 'Birlikte konuşun'}</div><p className="stage-big">{p.lesson.question}</p></>)}
        {cur === 'bitti' && (
          <div className="done-box">
            {done ? (
              <>
                <div className="check big-check">✓</div>
                <h2>{en ? 'Lesson complete' : 'Ders tamamlandı'}</h2>
                {error && <p role="alert" className="error">{error}</p>}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
                  {p.nextLessonId
                    ? <Link className="btn btn-primary btn-lg" href={`/ders/${p.nextLessonId}`}>{en ? 'Next lesson →' : 'Sonraki ders →'}</Link>
                    : <Link className="btn btn-primary btn-lg" href={`/moduller/${p.moduleSlug}`}>{en ? 'Back to the module page' : 'Modül sayfasına dön'}</Link>}
                  <button type="button" className="btn btn-ghost" onClick={() => unmarkDone(p.lesson.id)}>{en ? 'Mark as not completed' : 'Tamamlanmadı olarak işaretle'}</button>
                </div>
              </>
            ) : (
              <>
                <h2>{en ? 'Have you finished the activity?' : 'Etkinliği bitirdin mi?'}</h2>
                {hasApp && (
                  <p className="muted">{en ? (goalsDone ? 'You completed every goal in the activity.' : 'Not all goals in the activity are complete yet; you can still continue.') : goalsDone ? 'Uygulamadaki tüm hedefleri tamamladın.' : 'Uygulamadaki hedeflerin hepsi henüz tamamlanmadı; yine de devam edebilirsin.'}</p>
                )}
                <p className="muted">{en ? 'When you complete it, it is added to your progress.' : 'Tamamladığında ilerlemene işlenir.'}</p>
                <button type="button" className="btn btn-primary btn-lg" onClick={finish}>{en ? 'I completed the lesson' : 'Dersi tamamladım'}</button>
              </>
            )}
          </div>
        )}
      </section>

          <div className="player-nav">
            {step > 0
              ? <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)}><Icon name="arrowLeft" size={18} />{en ? 'Back' : 'Geri'}</button>
              : p.prevLessonId ? <Link className="btn btn-ghost" href={`/ders/${p.prevLessonId}`}><Icon name="arrowLeft" size={18} />{en ? 'Previous lesson' : 'Önceki ders'}</Link> : <span />}
            {step < STEPS.length - 1
              ? <button type="button" className="btn btn-primary" onClick={() => go(step + 1)}>{en ? 'Next' : 'İleri'}<Icon name="arrowRight" size={18} /></button>
              : <span />}
          </div>
          <p className="kbd-hint">{en ? 'You can move between steps with the ← → keys.' : 'Klavyede ← → tuşlarıyla adımlar arasında gezebilirsin.'}</p>
        </div>

        <aside className="lesson-aside" aria-labelledby="bu-derste">
          <h2 id="bu-derste">{en ? 'In this lesson' : 'Bu derste'}</h2>
          <ol className="aside-steps">
            {STEPS.map((s, i) => (
              <li key={s} data-state={i === step ? 'now' : i < step ? 'done' : 'todo'}>
                <button type="button" onClick={() => go(i)} aria-current={i === step ? 'step' : undefined}>
                  <span className="n" aria-hidden="true">{i < step ? <Icon name="check" size={12} /> : i + 1}</span>{(en ? STEP_LABEL_EN : STEP_LABEL)[s]}
                </button>
              </li>
            ))}
          </ol>
          {goalTexts.length > 0 && (
            <>
              <h3>{en ? 'Goals' : 'Hedefler'}</h3>
              <ul className="aside-goals">
                {goalTexts.map((t) => <li key={t} data-done={goalsDone}><span className="g" aria-hidden="true">{goalsDone ? <Icon name="check" size={12} /> : null}</span>{t}</li>)}
              </ul>
              <p className="aside-note">{en ? (goalsDone ? 'All goals complete.' : 'You see the goals live in the Activity step.') : goalsDone ? 'Tüm hedefler tamam.' : 'Hedeflerin durumunu Etkinlik adımında canlı görürsün.'}</p>
            </>
          )}
          <h3>{en ? 'In the module' : 'Modülde'}</h3>
          <div className="progress">
            <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={modCount.total} aria-valuenow={modCount.done} aria-label={en ? 'Module progress' : 'Modül ilerlemesi'}><div className="progress-fill" style={{ width: `${modCount.pct}%` }} /></div>
            <span className="progress-label">{modCount.done} / {modCount.total}</span>
          </div>
          <div className="aside-nav">
            {p.prevLessonId && <Link href={`/ders/${p.prevLessonId}`}><small>{en ? 'Previous lesson' : 'Önceki ders'}</small>{p.prevTitle}</Link>}
            {p.nextLessonId && <Link href={`/ders/${p.nextLessonId}`}><small>{en ? 'Next lesson' : 'Sonraki ders'}</small>{p.nextTitle}</Link>}
          </div>
        </aside>
      </div>
      {gate.dialog}
    </div>
  )
}
