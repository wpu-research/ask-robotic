'use client'
import Link from 'next/link'
import { useMemo } from 'react'
import { useConsent } from '@/lib/consent'
import { useEvents } from '@/lib/events'
import { timeAgo } from '@/lib/format'
import { quizSummaries } from '@/lib/quiz'
import type { QuizLessonInfo } from './progress-view'

/** Testlerim: tamamlanan mini testler ve puanlar; henüz çözülmemiş testler ayrı listelenir. */
export function TestsView({ quizLessons }: { quizLessons: QuizLessonInfo[] }) {
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
        <h1>Testlerim</h1>
        <p className="muted">Derslerin sonundaki mini testler. Pilot aşamada yalnız Modül 3 Hafta 1 dersleri testlidir.</p>
      </header>
      {!recording && consent !== undefined && (
        <p className="empty-note" role="note">Test sonuçları yalnız kayıt onayı verirsen saklanır. Testleri yine çözebilirsin; puan anında görünür ama bu sayfaya yazılmaz. Onay için <Link href="/ilerleme">İlerlemem</Link> sayfasındaki ayarları kullan.</p>
      )}
      <section className="panel" aria-labelledby="t-bitti">
        <h2 id="t-bitti" className="panel-title">Tamamlanan testler</h2>
        {doneList.length === 0 ? <p className="muted">Henüz tamamlanmış test yok. Aşağıdaki derslerden birinin Test adımını çöz.</p> : (
          <ul className="history">
            {doneList.map((l) => {
              const s = byId.get(l.id)!
              return (
                <li key={l.id}>
                  <span><Link href={`/ders/${l.id}`}>{l.title}</Link><small>{l.weekLabel}</small></span>
                  <b>{s.lastScore} / {s.lastTotal}</b>
                  <small>en iyi {s.bestScore} · {s.attempts} deneme · {timeAgo(s.lastT, now)}</small>
                </li>
              )
            })}
          </ul>
        )}
      </section>
      <section className="panel" aria-labelledby="t-bekle">
        <h2 id="t-bekle" className="panel-title">Çözülebilir testler</h2>
        {todo.length === 0 ? <p className="muted">Tüm testleri en az bir kez çözdün.</p> : (
          <ul className="history">
            {todo.map((l) => (
              <li key={l.id}>
                <span><Link href={`/ders/${l.id}`}>{l.title}</Link><small>{l.weekLabel}</small></span>
                <b>{l.total} soru</b>
                <Link className="btn btn-ghost btn-sm" href={`/ders/${l.id}`}>Derse git</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
