'use client'
import Link from 'next/link'
import { useMemo } from 'react'
import { useConsent } from '@/lib/consent'
import { useEvents } from '@/lib/events'
import { useFormat, useT } from '@/i18n/client'
import { quizSummaries } from '@/lib/quiz'
import type { QuizLessonInfo } from './progress-view'

/** Testlerim: tamamlanan mini testler ve puanlar; henüz çözülmemiş testler ayrı listelenir. */
export function TestsView({ quizLessons }: { quizLessons: QuizLessonInfo[] }) {
  const t = useT()
  const fmt = useFormat()
  const consent = useConsent()
  const events = useEvents()
  const sums = useMemo(() => quizSummaries(events), [events])
  const byId = useMemo(() => new Map(sums.map((s) => [s.lessonId, s])), [sums])
  const doneList = quizLessons.filter((l) => byId.has(l.id))
  const todo = quizLessons.filter((l) => !byId.has(l.id))
  const recording = !!consent && consent.ack && consent.mode !== 'denied'
  const now = Date.now()
  return (
    <div className="page">
      <header className="page-title">
        <p className="eyebrow">{t('shell.groups.learning')}</p>
        <h1>{t('content.tests.title')}</h1>
        <p className="muted">{t('content.tests.intro')}</p>
      </header>
      {!recording && consent !== undefined && (
        <p className="empty-note" role="note">{t('content.tests.consentBefore')}<Link href="/ilerleme">{t('content.tests.consentLink')}</Link>{t('content.tests.consentAfter')}</p>
      )}
      <section className="panel" aria-labelledby="t-bitti">
        <h2 id="t-bitti" className="panel-title">{t('content.tests.doneTitle')}</h2>
        {doneList.length === 0 ? <p className="muted">{t('content.tests.doneEmpty')}</p> : (
          <ul className="history">
            {doneList.map((l) => {
              const s = byId.get(l.id)!
              return (
                <li key={l.id}>
                  <span><Link href={`/ders/${l.id}`}>{l.title}</Link><small>{l.weekLabel}</small></span>
                  <b>{s.lastScore} / {s.lastTotal}</b>
                  <small>{t('content.tests.best', { best: s.bestScore, n: s.attempts, ago: fmt.timeAgo(s.lastT, now) })}</small>
                </li>
              )
            })}
          </ul>
        )}
      </section>
      <section className="panel" aria-labelledby="t-bekle">
        <h2 id="t-bekle" className="panel-title">{t('content.tests.todoTitle')}</h2>
        {todo.length === 0 ? <p className="muted">{t('content.tests.todoEmpty')}</p> : (
          <ul className="history">
            {todo.map((l) => (
              <li key={l.id}>
                <span><Link href={`/ders/${l.id}`}>{l.title}</Link><small>{l.weekLabel}</small></span>
                <b>{t('content.tests.questions', { n: l.total })}</b>
                <Link className="btn btn-ghost btn-sm" href={`/ders/${l.id}`}>{t('content.tests.goLesson')}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
