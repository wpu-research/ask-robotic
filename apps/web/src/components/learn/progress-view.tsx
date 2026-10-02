'use client'
import Link from 'next/link'
import { useMemo } from 'react'
import { useActivity } from '@/lib/activity-store'
import { useConsent } from '@/lib/consent'
import { useEvents } from '@/lib/events'
import { timeAgo } from '@/lib/format'
import { useDoneIds } from '@/lib/progress-store'
import { durationLabel, summarizeEvents } from '@/lib/progress-summary'
import { answerRecords } from '@/lib/quiz'
import { computeMastery, LEVEL_LABEL, SKILLS } from '@/lib/skills'
import { ConsentSettings } from './consent-banner'

export interface QuizLessonInfo { id: number; title: string; total: number; weekLabel: string }

/** İlerlemem: gerçek veriden özetler, beceri haritası ve test geçmişi. Veri yoksa boş durum gösterir. */
export function ProgressView({ quizLessons }: { quizLessons: QuizLessonInfo[] }) {
  const consent = useConsent()
  const events = useEvents()
  const done = useDoneIds()
  const act = useActivity()
  const sum = useMemo(() => summarizeEvents(events), [events])
  const mastery = useMemo(() => computeMastery(answerRecords(events)), [events])
  const lessonById = useMemo(() => new Map(quizLessons.map((l) => [l.id, l])), [quizLessons])
  const withData = mastery.filter((m) => m.attempts > 0)
  const recording = !!consent && consent.ack && consent.mode !== 'denied'
  const goalsDone = Object.keys(act.goals).length
  const now = Date.now()

  return (
    <div className="page">
      <header className="page-title">
        <h1>İlerlemem</h1>
        <p className="muted">Ders, hedef, süre ve mini test sonuçlarından çıkan gerçek özet. Pilot aşamada yalnız Modül 3 Hafta 1 mini testleri beceri haritasına katkı verir.</p>
      </header>

      <ul className="stat-tiles" aria-label="Özet">
        <li><b>{done.size}</b><span>tamamlanan ders</span></li>
        <li><b>{goalsDone}</b><span>hedefi biten ders</span></li>
        <li><b>{recording ? durationLabel(sum.seconds) : '—'}</b><span>ekranda geçen süre</span></li>
        <li><b>{recording ? sum.quizzes.length : '—'}</b><span>çözülen mini test</span></li>
        <li><b>{recording && sum.quizAvg !== null ? `%${Math.round(sum.quizAvg * 100)}` : '—'}</b><span>test başarısı (en iyi puan)</span></li>
      </ul>
      {!recording && consent !== undefined && (
        <p className="empty-note" role="note">Süre, test ve beceri verisi için kayıt onayı gerekiyor. {consent?.mode === 'denied' ? 'Şu an "Kaydetme" seçili; aşağıdan değiştirebilirsin.' : 'Sayfanın altındaki banttan ya da aşağıdaki ayarlardan onay verebilirsin.'} Ders ve hedef sayıları onaysız da bu tarayıcıdaki ilerlemeden gelir.</p>
      )}

      <section className="panel" aria-labelledby="beceri-h">
        <h2 id="beceri-h" className="panel-title">Beceri haritası</h2>
        {withData.length === 0 ? (
          <p className="muted">{recording ? 'Henüz hiç mini test çözmedin. Bir dersin Test adımını çözünce becerilerin burada belirir.' : 'Beceri haritası mini test sonuçlarından hesaplanır; kayıt kapalı olduğu için boş.'} Pilot dersler: <Link href="/moduller/arduino-temelleri">Arduino Temelleri, 1. hafta</Link>.</p>
        ) : (
          <ul className="skill-map">
            {withData.map((m) => {
              const s = SKILLS.find((x) => x.id === m.skill)!
              return (
                <li key={m.skill} data-level={m.level}>
                  <div className="skill-top"><b>{s.label}</b><span className="chip">{s.area}</span></div>
                  <div className="progress-track" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(m.score * 100)} aria-label={`${s.label} ustalığı`}><div className="progress-fill" style={{ width: `${Math.round(m.score * 100)}%` }} /></div>
                  <p className="skill-meta">%{Math.round(m.score * 100)} · {LEVEL_LABEL[m.level]} · {m.attempts} cevap{m.confidence < 1 ? ' (az veri)' : ''}</p>
                  <p className="skill-desc">{s.description}</p>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="panel" aria-labelledby="gecmis-h">
        <h2 id="gecmis-h" className="panel-title">Test geçmişi</h2>
        {sum.quizzes.length === 0 ? <p className="muted">Henüz tamamlanmış mini test yok.</p> : (
          <ul className="history">
            {sum.quizzes.slice(0, 10).map((q) => {
              const l = lessonById.get(q.lessonId)
              return (
                <li key={q.lessonId}>
                  <span>{l ? <Link href={`/ders/${l.id}`}>{l.title}</Link> : `Ders ${q.lessonId}`}<small>{l?.weekLabel}</small></span>
                  <b>{q.lastScore} / {q.lastTotal}</b>
                  <small>{q.attempts} deneme · {timeAgo(q.lastT, now)}</small>
                </li>
              )
            })}
          </ul>
        )}
        <p><Link href="/testler">Tüm testlerim →</Link></p>
      </section>

      {recording && sum.total > 0 && (
        <section className="panel" aria-labelledby="olay-h">
          <h2 id="olay-h" className="panel-title">Etkinlik özeti</h2>
          <ul className="event-counts">
            <li><b>{sum.lessonsViewed}</b> farklı ders açıldı</li>
            <li><b>{sum.counts.activity_start ?? 0}</b> etkinlik başlatıldı</li>
            <li><b>{sum.counts.goal_done ?? 0}</b> hedef tamamlandı</li>
            <li><b>{sum.counts.compile ?? 0}</b> derleme, <b>{sum.counts.run ?? 0}</b> çalıştırma</li>
            <li><b>{sum.counts.quiz_answer ?? 0}</b> test cevabı</li>
          </ul>
        </section>
      )}

      <ConsentSettings />
    </div>
  )
}
