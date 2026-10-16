'use client'
import Link from 'next/link'
import { useMemo } from 'react'
import { useActivity } from '@/lib/activity-store'
import { useConsent } from '@/lib/consent'
import { useEvents } from '@/lib/events'
import { useFormat, useLocale, useT } from '@/i18n/client'
import type { MessageKey } from '@/i18n'
import { useDoneIds } from '@/lib/progress-store'
import { summarizeEvents } from '@/lib/progress-summary'
import { answerRecords } from '@/lib/quiz'
import { computeMastery, SKILLS } from '@/lib/skills'
import { ConsentSettings } from './consent-banner'

export interface QuizLessonInfo { id: number; title: string; total: number; weekLabel: string }

/** Beceri alanı adlarının İngilizcesi (lib/skills.ts area). Beceri adları ve açıklamaları şimdilik yalnız Türkçe. */
const AREA_EN: Record<string, string> = {
  'Arayüz': 'Interface', 'Bellek': 'Memory', 'Blokla kodlama': 'Block coding', 'Donanım': 'Hardware', 'Elektrik': 'Electricity',
  'Elektronik': 'Electronics', 'Girdi': 'Input', 'Güvenlik': 'Security', 'Haberleşme': 'Communication', 'Hata ayıklama': 'Debugging',
  'Kontrol': 'Control', 'Mikro Kart': 'Micro Board', 'Oyun': 'Games', 'Oyun fiziği': 'Game physics', 'Oyun mantığı': 'Game logic',
  'Oyun programlama': 'Game programming', 'Oyun tasarımı': 'Game design', 'Oyun yapımı': 'Game making', 'Programlama': 'Programming',
  'Proje': 'Project', 'Prompt mühendisliği': 'Prompt engineering', 'Raporlama': 'Reporting', 'Robotik': 'Robotics',
  'Sahne Atölyesi': 'Stage Workshop', 'Sensör': 'Sensors', 'Sensörler': 'Sensors', 'Sistem tasarımı': 'System design',
  'Tasarım': 'Design', 'Yapay zekâ': 'Artificial intelligence', 'Zaman ve veri': 'Time and data',
}

/** İlerlemem: gerçek veriden özetler, beceri haritası ve test geçmişi. Veri yoksa boş durum gösterir. */
export function ProgressView({ quizLessons }: { quizLessons: QuizLessonInfo[] }) {
  const t = useT()
  const locale = useLocale()
  const fmt = useFormat()
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
  // 90 sn -> "2 dk", 3700 sn -> "1 sa 2 dk" (lib/progress-summary.ts durationLabel ile aynı)
  const duration = (sec: number) => {
    const m = Math.round(sec / 60)
    return m < 60 ? t('content.progress.durMin', { m }) : t('content.progress.durHour', { h: Math.floor(m / 60), m: m % 60 })
  }
  const pct = (n: number) => t('content.progress.percent', { n })

  return (
    <div className="page">
      <header className="page-title">
        <h1>{t('content.progress.title')}</h1>
        <p className="muted">{t('content.progress.intro')}</p>
      </header>

      <ul className="stat-tiles" aria-label={t('content.progress.summary')}>
        <li><b>{done.size}</b><span>{t('content.progress.lessonsDone')}</span></li>
        <li><b>{goalsDone}</b><span>{t('content.progress.goalsDone')}</span></li>
        <li><b>{recording ? duration(sum.seconds) : '—'}</b><span>{t('content.progress.timeOnScreen')}</span></li>
        <li><b>{recording ? sum.quizzes.length : '—'}</b><span>{t('content.progress.quizzesDone')}</span></li>
        <li><b>{recording && sum.quizAvg !== null ? pct(Math.round(sum.quizAvg * 100)) : '—'}</b><span>{t('content.progress.quizAvg')}</span></li>
      </ul>
      {!recording && consent !== undefined && (
        <p className="empty-note" role="note">{t('content.progress.consentNeeded')} {consent?.mode === 'denied' ? t('content.progress.consentDenied') : t('content.progress.consentPending')} {t('content.progress.consentLocal')}</p>
      )}

      <section className="panel" aria-labelledby="beceri-h">
        <h2 id="beceri-h" className="panel-title">{t('content.progress.skillsTitle')}</h2>
        {withData.length === 0 ? (
          <p className="muted">{recording ? t('content.progress.skillsEmptyRecording') : t('content.progress.skillsEmptyOff')} {t('content.progress.pilotLessons')} <Link href="/moduller/arduino-temelleri">{t('content.progress.pilotLink')}</Link>.</p>
        ) : (
          <ul className="skill-map">
            {withData.map((m) => {
              const s = SKILLS.find((x) => x.id === m.skill)!
              return (
                <li key={m.skill} data-level={m.level}>
                  <div className="skill-top"><b>{s.label}</b><span className="chip">{locale === 'en' ? AREA_EN[s.area] ?? s.area : s.area}</span></div>
                  <div className="progress-track" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(m.score * 100)} aria-label={t('content.progress.mastery', { skill: s.label })}><div className="progress-fill" style={{ width: `${Math.round(m.score * 100)}%` }} /></div>
                  <p className="skill-meta">{t('content.progress.skillMeta', { pct: Math.round(m.score * 100), level: t(`content.level.${m.level}` as MessageKey), n: m.attempts })}{m.confidence < 1 ? t('content.progress.lowData') : ''}</p>
                  <p className="skill-desc">{s.description}</p>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="panel" aria-labelledby="gecmis-h">
        <h2 id="gecmis-h" className="panel-title">{t('content.progress.historyTitle')}</h2>
        {sum.quizzes.length === 0 ? <p className="muted">{t('content.progress.historyEmpty')}</p> : (
          <ul className="history">
            {sum.quizzes.slice(0, 10).map((q) => {
              const l = lessonById.get(q.lessonId)
              return (
                <li key={q.lessonId}>
                  <span>{l ? <Link href={`/ders/${l.id}`}>{l.title}</Link> : t('content.progress.lessonN', { n: q.lessonId })}<small>{l?.weekLabel}</small></span>
                  <b>{q.lastScore} / {q.lastTotal}</b>
                  <small>{t('content.progress.attempts', { n: q.attempts, ago: fmt.timeAgo(q.lastT, now) })}</small>
                </li>
              )
            })}
          </ul>
        )}
        <p><Link href="/testler">{t('content.progress.allTests')}</Link></p>
      </section>

      {recording && sum.total > 0 && (
        <section className="panel" aria-labelledby="olay-h">
          <h2 id="olay-h" className="panel-title">{t('content.progress.eventsTitle')}</h2>
          <ul className="event-counts">
            <li><b>{sum.lessonsViewed}</b> {t('content.progress.evLessons', { n: sum.lessonsViewed })}</li>
            <li><b>{sum.counts.activity_start ?? 0}</b> {t('content.progress.evActivities', { n: sum.counts.activity_start ?? 0 })}</li>
            <li><b>{sum.counts.goal_done ?? 0}</b> {t('content.progress.evGoals', { n: sum.counts.goal_done ?? 0 })}</li>
            <li><b>{sum.counts.compile ?? 0}</b> {t('content.progress.evCompile', { n: sum.counts.compile ?? 0 })} <b>{sum.counts.run ?? 0}</b> {t('content.progress.evRun', { n: sum.counts.run ?? 0 })}</li>
            <li><b>{sum.counts.quiz_answer ?? 0}</b> {t('content.progress.evAnswers', { n: sum.counts.quiz_answer ?? 0 })}</li>
          </ul>
        </section>
      )}

      <ConsentSettings />
    </div>
  )
}
