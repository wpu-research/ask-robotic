'use client'
// Robot Atölyesi: görev seçici + Mikro Kart editörü (kart bir robot gövdesine takılı).
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MikroEditor } from './mikro-editor'
import { MISSION_CHAPTERS, ROBOT_MISSIONS, chapterProgress, freeScene, type RobotMission } from '@/lib/mikro/robot-missions'
import { ROBOT_PROFILES, type RobotProfileId } from '@/lib/mikro/robot'
import { onStart, project } from '@/lib/mikro/program'
import { SKILL_CHALLENGES } from '@/lib/mikro/beceri'
import { SEASONS, SEASON_FIELDS } from '@/lib/mikro/sezon'
import type { MikroProject } from '@/lib/mikro/types'
import { SkillPanel } from './skill-panel'
import { BuildSteps } from './donusen-stage'
import { DONUSEN_IDS, DONUSEN_MODELS, type DonusenModelId } from '@/lib/mikro/donusen'
import { DONUSEN_MISSIONS, donusenSetup, missionsOf, type DonusenMission } from '@/lib/mikro/donusen-missions'
import { PROFILE_EN } from '@/lib/mikro/en'
import { useI18n } from '@/i18n/client'
import './robot.css'

const DONE_KEY = 'ask:robot:done:v1'
const FREE_PROFILES: RobotProfileId[] = ['blok', 'gezgin', 'kiskac']
const SENSOR_KEY = { blok: 'mikro.studio.sensorsBlok', gezgin: 'mikro.studio.sensorsGezgin', kiskac: 'mikro.studio.sensorsKiskac' } as const
type Pick = { kind: 'mission'; id: string } | { kind: 'free'; profile: RobotProfileId } | { kind: 'skill'; id: string } | { kind: 'donusen'; model: DonusenModelId; id: string }
/** Dönüşen Robot görevlerinin tamamlandı kaydı (robot görev kimlikleriyle karışmasın diye önekli). */
const dnKey = (id: string) => `d:${id}`
/** Bölüm simgeleri ve renk tonları (robot.css: .rb-chapter.t-*). */
const CHAPTER_LOOK: Record<string, { icon: string; tone: string }> = {
  baslangic: { icon: '🚦', tone: 'sun' }, sensorler: { icon: '📡', tone: 'sky' }, algoritmalar: { icon: '🧩', tone: 'grape' }, yarisma: { icon: '🏆', tone: 'coral' },
}
/** Robot türü simgesi (görev kartının alt satırı). */
const PROFILE_ICON: Record<RobotProfileId, string> = { blok: '🟨', gezgin: '🛞', kiskac: '🦾' }
/** Sanal Beceri sahaları + yarışma sezonu alanları (ikisi de SkillPanel ile puanlanır). */
const ALL_SKILLS = [...SKILL_CHALLENGES, ...SEASON_FIELDS]

function loadDone(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]') as string[]) } catch { return new Set() }
}

/** `initialSkill`: açılışta seçilecek beceri sahası ya da sezon alanı (ör. /robot-atolyesi?saha=sezon-1-akilli-sehir). */
export function RobotStudio({ initialSkill }: { initialSkill?: string } = {}) {
  const { locale, t } = useI18n()
  const en = locale === 'en'
  const robotTitle = (p: RobotProfileId) => (en ? PROFILE_EN[p].title : ROBOT_PROFILES[p].title)
  const [pick, setPick] = useState<Pick>(() => (initialSkill && ALL_SKILLS.some((c) => c.id === initialSkill) ? { kind: 'skill', id: initialSkill } : { kind: 'mission', id: ROBOT_MISSIONS[0].id }))
  const [done, setDone] = useState<Set<string>>(new Set())
  useEffect(() => { setDone(loadDone()) }, [])

  const [current, setCurrent] = useState<MikroProject | null>(null)
  const mission: RobotMission | null = pick.kind === 'mission' ? ROBOT_MISSIONS.find((m) => m.id === pick.id) ?? null : null
  const skill = pick.kind === 'skill' ? ALL_SKILLS.find((c) => c.id === pick.id) ?? null : null
  const profile: RobotProfileId = mission ? mission.profile : skill ? skill.profile : pick.kind === 'free' ? pick.profile : 'blok'
  const robot = useMemo(() => ({ profile, scene: mission ? mission.scene : skill ? skill.scene : freeScene }), [profile, mission, skill])
  const dnMission: DonusenMission | null = pick.kind === 'donusen' ? DONUSEN_MISSIONS.find((m) => m.id === pick.id) ?? null : null
  const dnModel: DonusenModelId | null = pick.kind === 'donusen' ? pick.model : null
  const donusen = useMemo(() => (dnModel ? donusenSetup(dnModel, dnMission) : undefined), [dnModel, dnMission])
  const key = dnMission ? `d:${dnMission.id}` : mission ? `m:${mission.id}` : skill ? `s:${skill.id}` : `f:${profile}`
  const freeStart = useMemo(() => project(skill ? (en ? skill.en.title : skill.title) : t('mikro.studio.freeName', { robot: en ? PROFILE_EN[profile].title : ROBOT_PROFILES[profile].title }), [onStart()]), [profile, skill, en, t])

  const onGoals = useCallback((_: unknown, allDone: boolean) => {
    const id = dnMission ? dnKey(dnMission.id) : mission?.id
    if (!allDone || !id) return
    setDone((d) => {
      if (d.has(id)) return d
      const n = new Set(d).add(id)
      try { localStorage.setItem(DONE_KEY, JSON.stringify([...n])) } catch { /* gizli pencere */ }
      return n
    })
  }, [mission, dnMission])

  // `mark`: kartın solundaki işaret (görevlerde sıra numarası, diğerlerinde simge); bitince ✓ olur
  const card = (id: string, title: string, sub: string, active: boolean, onClick: () => void, testid: string, isDone = false, mark?: string) => (
    <li key={id}>
      <button className="rb-card" aria-current={active} onClick={onClick} data-testid={testid} data-done={isDone || undefined}>
        {mark !== undefined && <span className="rb-mark" aria-hidden="true">{isDone ? '✓' : mark}</span>}
        <span className="rb-card-txt">
          <b>{title}{isDone && <span className="sr-only"> ({t('mikro.studio.done')})</span>}</b>
          <small>{sub}</small>
        </span>
      </button>
    </li>
  )

  return (
    <div className="rb-studio">
      <nav className="rb-pick" aria-label={t('mikro.studio.missions')}>
        <div className="rb-chapters">
        {MISSION_CHAPTERS.map((ch) => {
          const pr = chapterProgress(ch.id, done)
          const look = CHAPTER_LOOK[ch.id] ?? { icon: '⭐', tone: 'sky' }
          return (
            <section className={`rb-chapter t-${look.tone}`} key={ch.id} data-testid={`robot-chapter-${ch.id}`} aria-labelledby={`rb-ch-${ch.id}`}>
              <div className="rb-chap">
                <span className="rb-chap-ic" aria-hidden="true">{look.icon}</span>
                <span className="rb-chap-txt">
                  <h2 id={`rb-ch-${ch.id}`}>{en ? ch.en.title : ch.title}</h2>
                  <small>{en ? ch.en.concept : ch.concept}</small>
                </span>
                <span className="rb-chap-prog">
                  <span className="rb-bar" aria-hidden="true"><span style={{ width: `${(100 * pr.done) / Math.max(1, pr.missions.length)}%` }} /></span>
                  <small className="rb-prog">{t('mikro.studio.chapterProgress', { done: pr.done, n: pr.missions.length })}</small>
                </span>
              </div>
              <ul className="rb-steps">{pr.missions.map((m, i) => card(m.id, en ? m.en.title : m.title, `${PROFILE_ICON[m.profile]} ${robotTitle(m.profile)}`, pick.kind === 'mission' && pick.id === m.id, () => setPick({ kind: 'mission', id: m.id }), `robot-mission-${m.id}`, done.has(m.id), String(i + 1)))}</ul>
            </section>
          )
        })}
        </div>
        <details className="rb-notes" data-testid="robot-notes">
          <summary>{t('mikro.studio.notesTitle')}</summary>
          <p>{t('mikro.studio.notesIntro')}</p>
          <dl>{MISSION_CHAPTERS.map((ch) => (
            <div key={ch.id}><dt>{en ? ch.en.title : ch.title} <span>· {en ? ch.en.concept : ch.concept}</span></dt><dd>{en ? ch.en.note : ch.note}</dd></div>
          ))}</dl>
        </details>
        <h2 className="rb-more-title">{en ? 'More to explore' : 'Daha fazlası'}</h2>
        <div className="rb-row" data-testid="robot-donusen-row">
          <h2>{t('mikro.donusen.row')}</h2>
          <ul>{DONUSEN_IDS.map((id) => card(id, en ? DONUSEN_MODELS[id].en.title : DONUSEN_MODELS[id].title, t('mikro.donusen.rowSub', { n: missionsOf(id).length }), dnModel === id,
            () => setPick({ kind: 'donusen', model: id, id: missionsOf(id)[0].id }), `robot-donusen-${id}`, missionsOf(id).every((m) => done.has(dnKey(m.id))), '🤖'))}</ul>
        </div>
        <div className="rb-row">
          <h2>{t('mikro.studio.skills')}</h2>
          <ul>{SKILL_CHALLENGES.map((c) => card(c.id, en ? c.en.title : c.title, t('mikro.studio.skillSub', { robot: robotTitle(c.profile), s: c.timeLimitS }), pick.kind === 'skill' && pick.id === c.id, () => setPick({ kind: 'skill', id: c.id }), `robot-skill-${c.id}`, false, '⏱️'))}</ul>
        </div>
        <div className="rb-row" data-testid="robot-season-row">
          <h2>{t('mikro.studio.seasons')}</h2>
          <ul>{SEASONS.map((s) => card(s.field.id, en ? s.en.title : s.title, t('mikro.studio.seasonSub', { robot: robotTitle(s.field.profile), s: s.field.timeLimitS }), pick.kind === 'skill' && pick.id === s.field.id, () => setPick({ kind: 'skill', id: s.field.id }), `robot-season-${s.id}`, false, '🏁'))}
            <li className="rb-season-link"><Link href="/robot-atolyesi/sezonlar">{t('mikro.studio.seasonRules')}</Link></li></ul>
        </div>
        <div className="rb-row">
          <h2>{t('mikro.studio.free')}</h2>
          <ul>{FREE_PROFILES.map((p) => card(p, robotTitle(p), t(SENSOR_KEY[p]), pick.kind === 'free' && pick.profile === p, () => setPick({ kind: 'free', profile: p }), `robot-free-${p}`, false, PROFILE_ICON[p]))}</ul>
        </div>
        <div className="rb-row" data-testid="robot-design-row">
          <h2>{en ? 'Design' : 'Tasarla'}</h2>
          <ul><li><Link className="rb-card" href="/robot-atolyesi/tasarla" data-testid="robot-design-link"><span className="rb-mark" aria-hidden="true">🛠️</span><span className="rb-card-txt"><b>{en ? 'Design your robot' : 'Robotunu Tasarla'}</b><small>{en ? 'Wheels, motors, sensors: build it, then run missions' : 'Teker, motor, sensör: kur, sonra görevde dene'}</small></span></Link></li></ul>
        </div>
      </nav>
      <div className="rb-ed">
        {skill && <SkillPanel challenge={skill} project={current} />}
        {dnModel && (
          <section className="dn-panel" aria-label={t('mikro.donusen.row')} data-testid="donusen-panel">
            <BuildSteps model={dnModel} />
            <div className="dn-side">
              <h2>{en ? DONUSEN_MODELS[dnModel].en.title : DONUSEN_MODELS[dnModel].title}</h2>
              <p>{en ? DONUSEN_MODELS[dnModel].en.summary : DONUSEN_MODELS[dnModel].summary}</p>
              <p className="dn-intro">{t('mikro.donusen.intro')}</p>
              <h3>{t('mikro.donusen.missions', { model: en ? DONUSEN_MODELS[dnModel].en.title : DONUSEN_MODELS[dnModel].title })}</h3>
              <ul className="dn-missions">{missionsOf(dnModel).map((m) => card(m.id, en ? m.en.title : m.title, en ? m.en.goals?.[m.goals[m.goals.length - 1].id]?.text ?? '' : m.goals[m.goals.length - 1].text,
                dnMission?.id === m.id, () => setPick({ kind: 'donusen', model: dnModel, id: m.id }), `donusen-mission-${m.id}`, done.has(dnKey(m.id))))}</ul>
            </div>
          </section>
        )}
        <MikroEditor onProjectChange={setCurrent} key={key} storageKey={`ask:robot:${key}:v1`} activity={dnMission ?? mission ?? undefined} robot={dnModel ? undefined : robot} donusen={donusen} initialProject={mission || dnMission ? undefined : freeStart} onGoalsChange={onGoals} />
      </div>
    </div>
  )
}
