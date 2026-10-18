'use client'
// Robot Atölyesi: görev seçici + Mikro Kart editörü (kart bir robot gövdesine takılı).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MikroEditor } from './mikro-editor'
import { MISSION_CHAPTERS, ROBOT_MISSIONS, chapterProgress, freeScene, type RobotMission } from '@/lib/mikro/robot-missions'
import { ROBOT_PROFILES, type RobotProfileId } from '@/lib/mikro/robot'
import { onStart, project } from '@/lib/mikro/program'
import { SKILL_CHALLENGES } from '@/lib/mikro/beceri'
import type { MikroProject } from '@/lib/mikro/types'
import { SkillPanel } from './skill-panel'
import { PROFILE_EN } from '@/lib/mikro/en'
import { useI18n } from '@/i18n/client'
import './robot.css'

const DONE_KEY = 'ask:robot:done:v1'
const FREE_PROFILES: RobotProfileId[] = ['blok', 'gezgin', 'kiskac']
const SENSOR_KEY = { blok: 'mikro.studio.sensorsBlok', gezgin: 'mikro.studio.sensorsGezgin', kiskac: 'mikro.studio.sensorsKiskac' } as const
type Pick = { kind: 'mission'; id: string } | { kind: 'free'; profile: RobotProfileId } | { kind: 'skill'; id: string }

function loadDone(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]') as string[]) } catch { return new Set() }
}

export function RobotStudio() {
  const { locale, t } = useI18n()
  const en = locale === 'en'
  const robotTitle = (p: RobotProfileId) => (en ? PROFILE_EN[p].title : ROBOT_PROFILES[p].title)
  const [pick, setPick] = useState<Pick>({ kind: 'mission', id: ROBOT_MISSIONS[0].id })
  const [done, setDone] = useState<Set<string>>(new Set())
  useEffect(() => { setDone(loadDone()) }, [])

  const [current, setCurrent] = useState<MikroProject | null>(null)
  const mission: RobotMission | null = pick.kind === 'mission' ? ROBOT_MISSIONS.find((m) => m.id === pick.id) ?? null : null
  const skill = pick.kind === 'skill' ? SKILL_CHALLENGES.find((c) => c.id === pick.id) ?? null : null
  const profile: RobotProfileId = mission ? mission.profile : skill ? skill.profile : pick.kind === 'free' ? pick.profile : 'blok'
  const robot = useMemo(() => ({ profile, scene: mission ? mission.scene : skill ? skill.scene : freeScene }), [profile, mission, skill])
  const key = mission ? `m:${mission.id}` : skill ? `s:${skill.id}` : `f:${profile}`
  const freeStart = useMemo(() => project(skill ? (en ? skill.en.title : skill.title) : t('mikro.studio.freeName', { robot: en ? PROFILE_EN[profile].title : ROBOT_PROFILES[profile].title }), [onStart()]), [profile, skill, en, t])

  const onGoals = useCallback((_: unknown, allDone: boolean) => {
    if (!allDone || !mission) return
    setDone((d) => {
      if (d.has(mission.id)) return d
      const n = new Set(d).add(mission.id)
      try { localStorage.setItem(DONE_KEY, JSON.stringify([...n])) } catch { /* gizli pencere */ }
      return n
    })
  }, [mission])

  const card = (id: string, title: string, sub: string, active: boolean, onClick: () => void, testid: string, isDone = false) => (
    <li key={id}>
      <button className="rb-card" aria-current={active} onClick={onClick} data-testid={testid}>
        <b>{title}{isDone && <span className="rb-done" aria-label={t('mikro.studio.done')}> ✓</span>}</b>
        <small>{sub}</small>
      </button>
    </li>
  )

  return (
    <div className="rb-studio">
      <nav className="rb-pick" aria-label={t('mikro.studio.missions')}>        {MISSION_CHAPTERS.map((ch) => {
          const pr = chapterProgress(ch.id, done)
          return (
            <div className="rb-row" key={ch.id} data-testid={`robot-chapter-${ch.id}`}>
              <div className="rb-chap">
                <h2>{en ? ch.en.title : ch.title}</h2>
                <small>{en ? ch.en.concept : ch.concept}</small>
                <meter min={0} max={pr.missions.length} value={pr.done} aria-label={t('mikro.studio.chapterProgress', { done: pr.done, n: pr.missions.length })} />
                <small className="rb-prog">{t('mikro.studio.chapterProgress', { done: pr.done, n: pr.missions.length })}</small>
              </div>
              <ul>{pr.missions.map((m) => card(m.id, en ? m.en.title : m.title, robotTitle(m.profile), pick.kind === 'mission' && pick.id === m.id, () => setPick({ kind: 'mission', id: m.id }), `robot-mission-${m.id}`, done.has(m.id)))}</ul>
            </div>
          )
        })}
        <details className="rb-notes" data-testid="robot-notes">
          <summary>{t('mikro.studio.notesTitle')}</summary>
          <p>{t('mikro.studio.notesIntro')}</p>
          <dl>{MISSION_CHAPTERS.map((ch) => (
            <div key={ch.id}><dt>{en ? ch.en.title : ch.title} <span>· {en ? ch.en.concept : ch.concept}</span></dt><dd>{en ? ch.en.note : ch.note}</dd></div>
          ))}</dl>
        </details>
        <div className="rb-row">
          <h2>{t('mikro.studio.skills')}</h2>
          <ul>{SKILL_CHALLENGES.map((c) => card(c.id, en ? c.en.title : c.title, t('mikro.studio.skillSub', { robot: robotTitle(c.profile), s: c.timeLimitS }), pick.kind === 'skill' && pick.id === c.id, () => setPick({ kind: 'skill', id: c.id }), `robot-skill-${c.id}`))}</ul>
        </div>
        <div className="rb-row">
          <h2>{t('mikro.studio.free')}</h2>
          <ul>{FREE_PROFILES.map((p) => card(p, robotTitle(p), t(SENSOR_KEY[p]), pick.kind === 'free' && pick.profile === p, () => setPick({ kind: 'free', profile: p }), `robot-free-${p}`))}</ul>
        </div>
      </nav>
      <div className="rb-ed">
        {skill && <SkillPanel challenge={skill} project={current} />}
        <MikroEditor onProjectChange={setCurrent} key={key} storageKey={`ask:robot:${key}:v1`} activity={mission ?? undefined} robot={robot} initialProject={mission ? undefined : freeStart} onGoalsChange={onGoals} />
      </div>
    </div>
  )
}
