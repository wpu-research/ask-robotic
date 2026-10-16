'use client'
// Robot Atölyesi: görev seçici + Mikro Kart editörü (kart bir robot gövdesine takılı).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MikroEditor } from './mikro-editor'
import { ROBOT_MISSIONS, freeScene, type RobotMission } from '@/lib/mikro/robot-missions'
import { ROBOT_PROFILES, type RobotProfileId } from '@/lib/mikro/robot'
import { onStart, project } from '@/lib/mikro/program'
import { SKILL_CHALLENGES } from '@/lib/mikro/beceri'
import type { MikroProject } from '@/lib/mikro/types'
import { SkillPanel } from './skill-panel'
import './robot.css'

const DONE_KEY = 'ask:robot:done:v1'
type Pick = { kind: 'mission'; id: string } | { kind: 'free'; profile: RobotProfileId } | { kind: 'skill'; id: string }

function loadDone(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]') as string[]) } catch { return new Set() }
}

export function RobotStudio() {
  const [pick, setPick] = useState<Pick>({ kind: 'mission', id: ROBOT_MISSIONS[0].id })
  const [done, setDone] = useState<Set<string>>(new Set())
  useEffect(() => { setDone(loadDone()) }, [])

  const [current, setCurrent] = useState<MikroProject | null>(null)
  const mission: RobotMission | null = pick.kind === 'mission' ? ROBOT_MISSIONS.find((m) => m.id === pick.id) ?? null : null
  const skill = pick.kind === 'skill' ? SKILL_CHALLENGES.find((c) => c.id === pick.id) ?? null : null
  const profile: RobotProfileId = mission ? mission.profile : skill ? skill.profile : pick.kind === 'free' ? pick.profile : 'blok'
  const robot = useMemo(() => ({ profile, scene: mission ? mission.scene : skill ? skill.scene : freeScene }), [profile, mission, skill])
  const key = mission ? `m:${mission.id}` : skill ? `s:${skill.id}` : `f:${profile}`
  const freeStart = useMemo(() => project(skill ? skill.title : `${ROBOT_PROFILES[profile].title} serbest`, [onStart()]), [profile, skill])

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
        <b>{title}{isDone && <span className="rb-done" aria-label="tamamlandı"> ✓</span>}</b>
        <small>{sub}</small>
      </button>
    </li>
  )

  return (
    <div className="rb-studio">
      <nav className="rb-pick" aria-label="Görevler">
        <div className="rb-row">
          <h2>Görevler</h2>
          <ul>{ROBOT_MISSIONS.map((m) => card(m.id, m.title, ROBOT_PROFILES[m.profile].title, pick.kind === 'mission' && pick.id === m.id, () => setPick({ kind: 'mission', id: m.id }), `robot-mission-${m.id}`, done.has(m.id)))}</ul>
        </div>
        <div className="rb-row">
          <h2>Sanal beceri</h2>
          <ul>{SKILL_CHALLENGES.map((c) => card(c.id, c.title, `${ROBOT_PROFILES[c.profile].title} · ${c.timeLimitS} sn · puanlı`, pick.kind === 'skill' && pick.id === c.id, () => setPick({ kind: 'skill', id: c.id }), `robot-skill-${c.id}`))}</ul>
        </div>
        <div className="rb-row">
          <h2>Serbest arena</h2>
          <ul>{(['blok', 'gezgin'] as const).map((p) => card(p, ROBOT_PROFILES[p].title, ROBOT_PROFILES[p].sensors.length === 3 ? 'mesafe · renk · tampon' : 'mesafe · iki çizgi sensörü', pick.kind === 'free' && pick.profile === p, () => setPick({ kind: 'free', profile: p }), `robot-free-${p}`))}</ul>
        </div>
      </nav>
      <div className="rb-ed">
        {skill && <SkillPanel challenge={skill} project={current} />}
        <MikroEditor onProjectChange={setCurrent} key={key} storageKey={`ask:robot:${key}:v1`} activity={mission ?? undefined} robot={robot} initialProject={mission ? undefined : freeStart} onGoalsChange={onGoals} />
      </div>
    </div>
  )
}
