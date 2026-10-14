'use client'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LessonStep } from '@ask/db'
import { recordFinished, recordOpen } from '@/lib/activity-store'
import { logEvent, setEventLesson, startLessonTimer } from '@/lib/events'
import { gainLesson, gainStep, useGame } from '@/lib/gamification'
import { streak, XP } from '@/lib/gamification-core'
import { markDone } from '@/lib/progress-store'
import { isInteractive } from '@/lib/steps'
import { useT } from '@/i18n/client'
import type { MessageKey } from '@/i18n'
import { InlineMd, plain } from './inline-md'
import { Mascot, type Mood } from './mascot'
import { ActivityView, ChoiceView, CodeBlock, FillView, NumericView, OrderView, WidgetView } from './step-views'
import { TutorPanel } from './tutor'
import { useVoice } from './voice'

export interface V2Props {
  lesson: { id: number; title: string; steps: LessonStep[] }
  moduleSlug: string
  moduleTitle: string
  weekLabel: string
  nextLessonId: number | null
  nextTitle: string | null
  activityKey: string | null
  serverSync: boolean
  /** Klasik görünüm bağlantısı (anlatım, kavram kartları, mini test). */
  classicHref: string
  /** Küçük bilgi notu (ör. arayüz İngilizce ama ders yalnız Türkçe). */
  notice?: string
}

type Status = 'idle' | 'wrong' | 'correct' | 'revealed'

const PRAISE: MessageKey[] = ['lesson.player.praise1', 'lesson.player.praise2', 'lesson.player.praise3', 'lesson.player.praise4', 'lesson.player.praise5', 'lesson.player.praise6']
const ART: Record<string, string> = { chip: '🔲', led: '💡', bolt: '⚡', robot: '🤖', clock: '⏱️', traffic: '🚦', brain: '🧠', code: '⌨️', search: '🔍', spark: '✨', wave: '〰️', gear: '⚙️' }
const art = (k?: string) => (k ? ART[k] ?? k : null)

function narration(s: LessonStep): string {
  switch (s.kind) {
    case 'intro': return `${s.title}. ${plain(s.body)}`
    case 'explain': return plain(s.body)
    default: return 'prompt' in s ? plain(s.prompt) : ''
  }
}

/**
 * Etkileşimli ders oynatıcısı (v2): tam ekran, adım adım. Kısa metin → etkileşim → "Kontrol et" → doğruysa yeşil şerit,
 * "Neden?" ve XP; yanlışsa ipucu, ikinci yanlıştan sonra "Cevabı göster". Tasarım: docs/analiz-brilliant.md §11.4.
 */
export function LessonV2Player(p: V2Props) {
  const steps = p.lesson.steps
  const [i, setI] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [attempts, setAttempts] = useState(0)
  const [showWhy, setShowWhy] = useState(false)
  const [earned, setEarned] = useState(0)
  const [firstTry, setFirstTry] = useState(0)
  const [finished, setFinished] = useState(false)
  const [syncError, setSyncError] = useState('')
  const checker = useRef<(() => boolean) | null>(null)
  const [ready, setReady] = useState(false)
  const [tutorOpen, setTutorOpen] = useState(false)
  const [snapshot, setSnapshot] = useState('')
  const voice = useVoice()
  const t = useT()
  const { state: game, today } = useGame()
  const step = steps[i]
  const interactive = isInteractive(step)
  const locked = status === 'correct' || status === 'revealed'

  const onReady = useCallback((c: (() => boolean) | null) => { checker.current = c; setReady(!!c) }, [])
  const onSnapshot = useCallback((s: string) => setSnapshot(s), [])
  const closeTutor = useCallback(() => setTutorOpen(false), [])

  useEffect(() => { recordOpen(p.lesson.id) }, [p.lesson.id])
  useEffect(() => {
    setEventLesson(p.lesson.id)
    logEvent('lesson_view', { lessonId: p.lesson.id, p: { kind: 'v2' } })
    const stop = startLessonTimer(p.lesson.id)
    return () => { stop(); setEventLesson(null) }
  }, [p.lesson.id])
  useEffect(() => { if (!finished) voice.say(narration(step)) }, [i, finished]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => voice.stop(), []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = prev } }, [])

  const praise = useMemo(() => t(PRAISE[(i * 7 + p.lesson.id) % PRAISE.length]), [i, p.lesson.id, t])

  async function finish() {
    setFinished(true)
    markDone(p.lesson.id)
    recordFinished(p.lesson.id)
    gainLesson(p.lesson.id)
    setEarned((e) => e + XP.lesson)
    logEvent('lesson_done', { lessonId: p.lesson.id, p: { v2: true, firstTry, steps: steps.length } })
    voice.say(t('lesson.player.doneSay'))
    if (p.serverSync) {
      const res = await fetch('/api/progress', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lessonId: p.lesson.id }) }).catch(() => null)
      if (!res?.ok) setSyncError(t('lesson.player.syncError'))
    }
  }

  function next() {
    if (i + 1 >= steps.length) { void finish(); return }
    setI(i + 1); setStatus('idle'); setAttempts(0); setShowWhy(false); checker.current = null; setReady(false); setSnapshot('')
  }

  function check() {
    if (!checker.current) return
    const ok = checker.current()
    const skills = 'skills' in step && step.skills ? step.skills.join(',') : ''
    logEvent('quiz_answer', { lessonId: p.lesson.id, p: { q: `v2-${i}`, ok, k: step.kind, sk: skills, a: attempts + 1 } })
    if (ok) {
      setStatus('correct')
      gainStep(attempts === 0)
      setEarned((e) => e + (attempts === 0 ? XP.firstTry : XP.retry))
      if (attempts === 0) setFirstTry((n) => n + 1)
      voice.say(praise)
    } else {
      setStatus('wrong')
      setAttempts((a) => a + 1)
      voice.say(step.kind === 'activity' ? t('lesson.player.goalsNotMet') : t('lesson.player.notQuiteSay'))
    }
  }

  // Enter: birincil eylem
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey || finished) return
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'TEXTAREA' || el.closest('.tutor-panel') || (el.tagName === 'BUTTON' && !el.closest('.v2-foot')))) return
      e.preventDefault()
      if (!interactive || locked) next()
      else if (status === 'wrong') setStatus('idle')
      else if (ready) check()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const pct = finished ? 100 : Math.round((i / steps.length) * 100)
  const mood: Mood = status === 'correct' ? 'happy' : status === 'wrong' ? 'oops' : interactive ? 'think' : 'idle'
  const hint = 'hint' in step ? step.hint : undefined
  const why = 'why' in step ? step.why : undefined

  return (
    <div className={`v2-player ${step.kind === 'activity' && !finished ? 'v2-wide' : ''}`} role="dialog" aria-modal="true" aria-label={t('lesson.player.dialogLabel', { title: p.lesson.title })}>
      <header className="v2-top">
        <Link href={`/moduller/${p.moduleSlug}`} className="v2-icon-btn" aria-label={t('lesson.player.exit')}>✕</Link>
        <div className="v2-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={t('lesson.player.progress')}><div style={{ width: `${pct}%` }} /></div>
        {voice.supported && (
          <button type="button" className="v2-icon-btn" onClick={voice.toggle} aria-pressed={voice.on} aria-label={voice.on ? t('lesson.player.voiceOff') : t('lesson.player.voiceOn')} title={t('lesson.player.voiceTitle')}>{voice.on ? '🔊' : '🔈'}</button>
        )}
        <span className="v2-xp" aria-label={t('lesson.player.xpLabel', { n: earned })}>✦ {earned}</span>
      </header>
      {p.notice && <p className="v2-notice" role="note" style={{ margin: '6px auto 0', maxWidth: 720, padding: '4px 12px', fontSize: '.85rem', textAlign: 'center', color: 'var(--muted)' }}>{p.notice}</p>}

      <main className="v2-body" key={finished ? 'end' : i}>
        {finished ? (
          <div className="v2-end">
            <Mascot mood="happy" size={96} />
            <h1>{t('lesson.player.doneTitle')}</h1>
            <p className="muted">{p.lesson.title}</p>
            <div className="v2-stats">
              <div><b>+{earned}</b><span>XP</span></div>
              <div><b>{firstTry}</b><span>{t('lesson.player.statFirstTry')}</span></div>
              <div><b>{today ? streak(game, today) : '–'}</b><span>{t('lesson.player.statStreak')}</span></div>
            </div>
            {syncError && <p role="alert" className="error">{syncError}</p>}
          </div>
        ) : (
          <>
            {step.kind === 'intro' && (
              <div className="v2-intro">
                {art(step.art) && <div className="v2-art" aria-hidden="true">{art(step.art)}</div>}
                <p className="v2-eyebrow">{p.weekLabel}</p>
                <h1>{step.title}</h1>
                <p className="v2-lead"><InlineMd text={step.body} /></p>
              </div>
            )}
            {step.kind === 'explain' && (
              <div className="v2-explain">
                {art(step.art) && <div className="v2-art small" aria-hidden="true">{art(step.art)}</div>}
                <p className="v2-lead"><InlineMd text={step.body} /></p>
                {step.code && <CodeBlock code={step.code} />}
              </div>
            )}
            {step.kind === 'reflect' && (
              <div className="v2-explain">
                <p className="v2-eyebrow">{t('lesson.player.reflectEyebrow')}</p>
                <p className="v2-lead"><InlineMd text={step.prompt} /></p>
                <textarea className="v2-reflect" rows={3} placeholder={t('lesson.player.reflectPlaceholder')} aria-label={t('lesson.player.reflectLabel')} />
              </div>
            )}
            {step.kind === 'choice' && <ChoiceView key={i} step={step} seed={p.lesson.id * 31 + i} locked={locked} reveal={status === 'revealed'} onReady={onReady} onSnapshot={onSnapshot} />}
            {step.kind === 'numeric' && <NumericView key={i} step={step} seed={i} locked={locked} reveal={status === 'revealed'} onReady={onReady} onSnapshot={onSnapshot} />}
            {step.kind === 'fill' && <FillView key={i} step={step} seed={p.lesson.id * 31 + i} locked={locked} reveal={status === 'revealed'} onReady={onReady} onSnapshot={onSnapshot} />}
            {step.kind === 'order' && <OrderView key={i} step={step} seed={p.lesson.id * 31 + i} locked={locked} reveal={status === 'revealed'} onReady={onReady} onSnapshot={onSnapshot} />}
            {step.kind === 'widget' && <WidgetView key={i} step={step} seed={i} locked={locked} reveal={status === 'revealed'} onReady={onReady} onSnapshot={onSnapshot} />}
            {step.kind === 'activity' && <ActivityView key={i} step={step} seed={i} locked={locked} reveal={false} onReady={onReady} activityKey={p.activityKey} lessonId={p.lesson.id} />}
            {showWhy && why && <div className="v2-why" role="note"><b>{t('lesson.player.why')}</b> <InlineMd text={why} /></div>}
          </>
        )}
      </main>

      <footer className={`v2-foot v2-${finished ? 'end' : status}`} aria-live="polite">
        <div className="v2-foot-in">
          <div className="v2-coach">
            <Mascot mood={finished ? 'happy' : mood} size={44} />
            {!finished && status === 'correct' && <p className="v2-bubble ok">{praise}</p>}
            {!finished && status === 'wrong' && (
              <p className="v2-bubble bad">
                {step.kind === 'activity' ? t('lesson.player.goalsNotMet') : t('lesson.player.notQuite')}
                {hint && <> <InlineMd text={hint} /></>}
              </p>
            )}
            {!finished && status === 'revealed' && <p className="v2-bubble">{t('lesson.player.revealed')}</p>}
            {!finished && status === 'wrong' && attempts >= 2 && !tutorOpen && (
              <button type="button" className="tutor-offer" onClick={() => setTutorOpen(true)}>{t('lesson.player.proactiveOffer')}</button>
            )}
            {!finished && (
              <button type="button" className="tutor-open" onClick={() => setTutorOpen((o) => !o)} aria-expanded={tutorOpen} aria-label={t('lesson.player.askRobi')}>
                <span aria-hidden="true">💬</span> {t('lesson.player.askRobi')}
              </button>
            )}
          </div>
          <div className="v2-actions">
            {finished ? (
              <>
                <Link className="v2-btn ghost" href={`/moduller/${p.moduleSlug}`}>{t('lesson.player.backToCourse')}</Link>
                {p.nextLessonId ? <Link className="v2-btn" href={`/ders/${p.nextLessonId}`}>{t('lesson.player.nextLesson')}</Link> : <Link className="v2-btn" href="/panel">{t('lesson.player.backToDashboard')}</Link>}
              </>
            ) : !interactive ? (
              <button type="button" className="v2-btn" onClick={next}>{i === 0 ? t('lesson.player.start') : t('lesson.player.continue')}</button>
            ) : status === 'idle' ? (
              <button type="button" className="v2-btn" disabled={!ready} onClick={check}>{t('lesson.player.check')}</button>
            ) : status === 'wrong' ? (
              <>
                {step.kind === 'activity'
                  ? <button type="button" className="v2-btn ghost" onClick={() => setStatus('revealed')}>{t('lesson.player.skipForNow')}</button>
                  : attempts >= 2 && <button type="button" className="v2-btn ghost" onClick={() => { setStatus('revealed'); setShowWhy(true) }}>{t('lesson.player.showAnswer')}</button>}
                <button type="button" className="v2-btn" onClick={() => setStatus('idle')}>{t('lesson.player.tryAgain')}</button>
              </>
            ) : (
              <>
                {why && !showWhy && <button type="button" className="v2-btn ghost" onClick={() => setShowWhy(true)}>{t('lesson.player.why')}</button>}
                <button type="button" className="v2-btn ok" onClick={next}>{t('lesson.player.continue')}</button>
              </>
            )}
          </div>
        </div>
        {!finished && i === 0 && <p className="v2-classic"><Link href={p.classicHref}>{t('lesson.player.classic')}</Link></p>}
      </footer>
      {!finished && (
        <TutorPanel
          open={tutorOpen} onClose={closeTutor} lessonId={p.lesson.id} stepIndex={i} status={status} attempts={attempts}
          snapshot={snapshot} interactive={interactive} say={voice.say}
        />
      )}
    </div>
  )
}
