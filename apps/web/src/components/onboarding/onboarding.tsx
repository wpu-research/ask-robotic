'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Mascot } from '@/components/lesson-v2/mascot'
import { bandText, reasonText, recommend, TOPICS, topicText, type Interest, type Level } from '@/lib/learning-paths'
import { useLocale, useT } from '@/i18n/client'
import { LocaleSwitcher } from '@/components/shell/locale-switcher'
import { saveProfile, type DayTime, type Who } from '@/lib/profile'
import { useSession } from '@/lib/session'

export interface CourseInfo { slug: string; title: string; firstLessonId: number | null; lessons: number }

type Screen = 'hello' | 'who' | 'school' | 'age' | 'interests' | 'level' | 'goal' | 'time' | 'building' | 'plan'

const INTERESTS: { key: Interest; icon: string }[] = [
  { key: 'kodlama', icon: '⌨️' },
  { key: 'oyun', icon: '🎮' },
  { key: 'elektronik', icon: '💡' },
  { key: 'robotik', icon: '🤖' },
  { key: 'ai', icon: '🧠' },
]

const LEVEL_KEYS: Level[] = ['yeni', 'acemi', 'orta', 'ileri']
// Büyükler için örnek kod (dil bağımsız; 'yeni' örneği sözlükte: onboarding.sampleHello)
const SAMPLE_CODE: Record<Level, string> = { yeni: '', acemi: 'digitalWrite(13, HIGH);', orta: 'for (int i = 0; i < 4; i++)', ileri: 'void dur(int ms) { … }' }

/**
 * Karşılama akışı (Brilliant'taki gibi kayıttan önce): her ekran tek soru, büyük kartlar, Mac konuşur.
 * Sonunda yaş + ilgi + seviyeye göre öğrenme planı ve "Buradan başla". Cevaplar tarayıcıda (lib/profile.ts); misafire
 * "Planını kaydet" (/kayit?from=basla) önerilir, kayıtta profil hesaba taşınır. Oturum açıksa session-sync sunucuya yazar.
 */
export function Onboarding({ courses }: { courses: CourseInfo[] }) {
  const router = useRouter()
  const session = useSession()
  const t = useT()
  const locale = useLocale()
  const [screen, setScreen] = useState<Screen>('hello')
  const [history, setHistory] = useState<Screen[]>([])
  const [who, setWho] = useState<Who | null>(null)
  const [ageText, setAgeText] = useState('')
  const [interests, setInterests] = useState<Interest[]>([])
  const [level, setLevel] = useState<Level | null>(null)
  const [goalMin, setGoalMin] = useState<number | null>(null)
  const [time, setTime] = useState<DayTime | null>(null)

  const age = Math.max(5, Math.min(18, Number(ageText) || 0))
  const ageOk = /^\d{1,2}$/.test(ageText) && Number(ageText) >= 4 && Number(ageText) <= 99
  const young = age <= 7
  const rec = useMemo(() => recommend({ age, interests: interests.length ? interests : ['kodlama'], level: level ?? 'yeni' }), [age, interests, level])
  const course = (slug: string) => courses.find((c) => c.slug === slug)
  const pct = { hello: 5, who: 15, school: 30, age: 30, interests: 45, level: 60, goal: 75, time: 88, building: 96, plan: 100 }[screen]

  const go = (s: Screen) => { setHistory((h) => [...h, screen]); setScreen(s) }
  const back = () => { const h = [...history]; const prev = h.pop(); if (prev) { setHistory(h); setScreen(prev) } }
  const afterAge = () => go(young ? 'goal' : 'interests')

  useEffect(() => {
    if (screen !== 'building') return
    const timer = setTimeout(() => {
      saveProfile({ who: who ?? 'kendim', age, interests, level: level ?? 'yeni', goalMin: goalMin ?? 15, time: time ?? 'farketmez', course: rec.course, createdAt: Date.now() })
      setScreen('plan')
    }, 1400)
    return () => clearTimeout(timer)
  }, [screen]) // eslint-disable-line react-hooks/exhaustive-deps

  const levels = LEVEL_KEYS.map((key) => age < 12
    ? { key, title: t(`onboarding.level.${key}`), sample: t(`onboarding.sampleYoung.${key}`), desc: t(`onboarding.levelYoung.${key}`) }
    : { key, title: t(`onboarding.level.${key}`), sample: key === 'yeni' ? t('onboarding.sampleHello') : SAMPLE_CODE[key], desc: t(`onboarding.levelDesc.${key}`) })
  const start = course(rec.course)
  const recBand = bandText(rec.band, locale)
  const recTopic = topicText(rec.topic, locale)

  return (
    <section className="ob" aria-label={t('onboarding.dialogLabel')}>
      <header className="ob-top">
        {history.length > 0 && screen !== 'building' && screen !== 'plan'
          ? <button type="button" className="v2-icon-btn" onClick={back} aria-label={t('onboarding.back')}>←</button>
          : <Link href="/" className="v2-icon-btn" aria-label={t('onboarding.close')}>✕</Link>}
        <div className="v2-progress" aria-hidden="true"><div style={{ width: `${pct}%` }} /></div>
        <LocaleSwitcher className="ob-locale" />
      </header>

      <div className="ob-body" key={screen}>
        {screen === 'hello' && (
          <div className="ob-center">
            <Mascot size={120} mood="happy" />
            <h1>{t('onboarding.helloTitle')}</h1>
            <p className="ob-lead">{t('onboarding.helloLead')}</p>
          </div>
        )}

        {screen === 'who' && (
          <Ask title={t('onboarding.whoTitle')}>
            <div className="ob-cards">
              <Card icon="🙋" label={t('onboarding.whoMe')} on={who === 'kendim'} onClick={() => setWho('kendim')} />
              <Card icon="👨‍👧" label={t('onboarding.whoChild')} on={who === 'cocugum'} onClick={() => setWho('cocugum')} />
              <Card icon="🏫" label={t('onboarding.whoSchool')} on={who === 'okulum'} onClick={() => setWho('okulum')} />
            </div>
          </Ask>
        )}

        {screen === 'school' && (
          <div className="ob-center">
            <div className="v2-art" aria-hidden="true">🏫</div>
            <h1>{t('onboarding.schoolTitle')}</h1>
            <p className="ob-lead">{t('onboarding.schoolLead')}</p>
            <div className="ob-row">
              <Link className="v2-btn" href="/okullar">{t('onboarding.schoolOffers')}</Link>
              <button type="button" className="v2-btn ghost" onClick={() => go('age')}>{t('onboarding.schoolTry')}</button>
            </div>
          </div>
        )}

        {screen === 'age' && (
          <Ask title={who === 'cocugum' ? t('onboarding.ageTitleChild') : t('onboarding.ageTitle')} note={t('onboarding.ageNote')}>
            <input className="ob-input" inputMode="numeric" value={ageText} onChange={(e) => setAgeText(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder={t('onboarding.agePlaceholder')} autoFocus aria-label={t('onboarding.agePlaceholder')} onKeyDown={(e) => { if (e.key === 'Enter' && ageOk) afterAge() }} />
          </Ask>
        )}

        {screen === 'interests' && (
          <Ask title={who === 'cocugum' ? t('onboarding.interestsTitleChild') : t('onboarding.interestsTitle')} note={t('onboarding.interestsNote')}>
            <div className="ob-cards five">
              {INTERESTS.map((x) => (
                <Card key={x.key} icon={x.icon} label={t(`onboarding.interest.${x.key}`)} on={interests.includes(x.key)} multi
                  onClick={() => setInterests((s) => (s.includes(x.key) ? s.filter((k) => k !== x.key) : [...s, x.key]))} />
              ))}
            </div>
          </Ask>
        )}

        {screen === 'level' && (
          <Ask title={age < 12 ? t('onboarding.levelTitleYoung') : t('onboarding.levelTitle')}>
            <div className="ob-cards four">
              {levels.map((l) => (
                <button key={l.key} type="button" className={`ob-card level ${level === l.key ? 'on' : ''}`} aria-pressed={level === l.key} onClick={() => setLevel(l.key)}>
                  <code>{l.sample}</code><b>{l.title}</b><span>{l.desc}</span>
                </button>
              ))}
            </div>
          </Ask>
        )}

        {screen === 'goal' && (
          <Ask title={t('onboarding.goalTitle')}>
            <div className="ob-cards four">
              {[10, 15, 20, 30].map((m) => <Card key={m} icon="⏱️" label={t('onboarding.minutes', { n: m })} sub={m <= 10 ? t('onboarding.goalEasy') : m <= 15 ? t('onboarding.goalRegular') : m <= 20 ? t('onboarding.goalSerious') : t('onboarding.goalIntense')} on={goalMin === m} onClick={() => setGoalMin(m)} />)}
            </div>
          </Ask>
        )}

        {screen === 'time' && (
          <Ask title={t('onboarding.timeTitle')}>
            <div className="ob-cards four">
              <Card icon="🌅" label={t('onboarding.timeMorning')} on={time === 'sabah'} onClick={() => setTime('sabah')} />
              <Card icon="🎒" label={t('onboarding.timeAfterSchool')} on={time === 'ogle'} onClick={() => setTime('ogle')} />
              <Card icon="🌙" label={t('onboarding.timeEvening')} on={time === 'aksam'} onClick={() => setTime('aksam')} />
              <Card icon="🔄" label={t('onboarding.timeAny')} on={time === 'farketmez'} onClick={() => setTime('farketmez')} />
            </div>
          </Ask>
        )}

        {screen === 'building' && (
          <div className="ob-center">
            <Mascot size={96} mood="think" />
            <h2>{t('onboarding.building')}</h2>
          </div>
        )}

        {screen === 'plan' && (
          <div className="ob-plan">
            <p className="v2-eyebrow">{t('onboarding.planEyebrow', { band: recBand.title, ages: recBand.ages })}</p>
            <h1>{recTopic.title}</h1>
            <p className="ob-lead">{reasonText(rec, locale)}</p>
            <ol className="ob-path" aria-label={t('onboarding.pathLabel')}>
              {rec.topic.courses.map((slug) => {
                const c = course(slug)
                const here = slug === rec.course
                return (
                  <li key={slug} className={here ? 'here' : ''}>
                    {here && <span className="ob-here">{t('onboarding.startHere')}</span>}
                    <b>{c?.title ?? slug}</b>
                    <span>{c ? t('onboarding.lessons', { n: c.lessons }) : ''}</span>
                  </li>
                )
              })}
              {recTopic.soon?.map((s) => <li key={s} className="soon"><b>{s}</b><span>{t('onboarding.soon')}</span></li>)}
            </ol>
            <div className="ob-loop">
              <div><b>{t('onboarding.loopLearn')}</b><span>{t('onboarding.loopLearnSub')}</span></div>
              <div><b>{t('onboarding.loopPractice')}</b><span>{t('onboarding.loopPracticeSub')}</span></div>
              <div><b>{t('onboarding.loopMeasure')}</b><span>{t('onboarding.loopMeasureSub')}</span></div>
            </div>
            <p className="muted ob-small">{t('onboarding.later', { list: TOPICS.filter((x) => x.bands.includes(rec.band.key) && x.key !== rec.topic.key).map((x) => topicText(x, locale).title).join(' · ') || t('onboarding.laterFallback') })}</p>
          </div>
        )}
      </div>

      <footer className="ob-foot">
        {screen === 'hello' && <button type="button" className="v2-btn" onClick={() => go('who')}>{t('onboarding.letsGo')}</button>}
        {screen === 'who' && <button type="button" className="v2-btn" disabled={!who} onClick={() => go(who === 'okulum' ? 'school' : 'age')}>{t('onboarding.continue')}</button>}
        {screen === 'age' && <button type="button" className="v2-btn" disabled={!ageOk} onClick={afterAge}>{t('onboarding.continue')}</button>}
        {screen === 'interests' && <button type="button" className="v2-btn" disabled={!interests.length} onClick={() => go('level')}>{t('onboarding.continue')}</button>}
        {screen === 'level' && <button type="button" className="v2-btn" disabled={!level} onClick={() => go('goal')}>{t('onboarding.continue')}</button>}
        {screen === 'goal' && <button type="button" className="v2-btn" disabled={!goalMin} onClick={() => go('time')}>{t('onboarding.continue')}</button>}
        {screen === 'time' && <button type="button" className="v2-btn" disabled={!time} onClick={() => go('building')}>{t('onboarding.buildPlan')}</button>}
        {screen === 'plan' && (
          <div className="ob-row">
            {session.status === 'guest'
              ? <Link className="v2-btn ghost" href="/kayit?from=basla">{t('onboarding.savePlan')}</Link>
              : <Link className="v2-btn ghost" href="/konular">{t('onboarding.allTopics')}</Link>}
            <button type="button" className="v2-btn" onClick={() => router.push(start?.firstLessonId ? `/ders/${start.firstLessonId}` : `/moduller/${rec.course}`)}>{t('onboarding.startLearning')}</button>
          </div>
        )}
      </footer>
    </section>
  )
}

function Ask({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="ob-ask">
      <div className="ob-q"><Mascot size={56} /><div><h1>{title}</h1>{note && <p className="muted">{note}</p>}</div></div>
      {children}
    </div>
  )
}

function Card({ icon, label, sub, on, multi, onClick }: { icon: string; label: string; sub?: string; on: boolean; multi?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`ob-card ${on ? 'on' : ''}`} role={multi ? 'checkbox' : undefined} aria-checked={multi ? on : undefined} aria-pressed={multi ? undefined : on} onClick={onClick}>
      <span className="ob-icon" aria-hidden="true">{icon}</span><b>{label}</b>{sub && <span>{sub}</span>}
    </button>
  )
}
