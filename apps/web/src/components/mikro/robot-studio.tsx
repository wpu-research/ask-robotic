'use client'
// Robot Atölyesi: görev seçici + Mikro Kart editörü (kart bir robot gövdesine takılı).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MikroEditor } from './mikro-editor'
import { ROBOT_MISSIONS, freeScene, type RobotMission } from '@/lib/mikro/robot-missions'
import { ROBOT_PROFILES, type RobotProfileId } from '@/lib/mikro/robot'
import { onStart, project } from '@/lib/mikro/program'
import './robot.css'

const DONE_KEY = 'ask:robot:done:v1'
type Pick = { kind: 'mission'; id: string } | { kind: 'free'; profile: RobotProfileId }

function loadDone(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]') as string[]) } catch { return new Set() }
}

export function RobotStudio() {
  const [pick, setPick] = useState<Pick>({ kind: 'mission', id: ROBOT_MISSIONS[0].id })
  const [done, setDone] = useState<Set<string>>(new Set())
  useEffect(() => { setDone(loadDone()) }, [])

  const mission: RobotMission | null = pick.kind === 'mission' ? ROBOT_MISSIONS.find((m) => m.id === pick.id) ?? null : null
  const profile: RobotProfileId = mission ? mission.profile : pick.kind === 'free' ? pick.profile : 'blok'
  const robot = useMemo(() => ({ profile, scene: mission ? mission.scene : freeScene }), [profile, mission])
  const key = mission ? `m:${mission.id}` : `f:${profile}`
  const freeStart = useMemo(() => project(`${ROBOT_PROFILES[profile].title} serbest`, [onStart()]), [profile])

  const onGoals = useCallback((_: unknown, allDone: boolean) => {
    if (!allDone || !mission) return
    setDone((d) => {
      if (d.has(mission.id)) return d
      const n = new Set(d).add(mission.id)
      try { localStorage.setItem(DONE_KEY, JSON.stringify([...n])) } catch { /* gizli pencere */ }
      return n
    })
  }, [mission])

  return (
    <div className="rb-studio">
      <nav className="rb-pick" aria-label="Görevler">
        <h2>Görevler</h2>
        <ul>
          {ROBOT_MISSIONS.map((m) => (
            <li key={m.id}>
              <button aria-current={pick.kind === 'mission' && pick.id === m.id} onClick={() => setPick({ kind: 'mission', id: m.id })} data-testid={`robot-mission-${m.id}`}>
                <b>{m.title} {done.has(m.id) && <span className="rb-done" aria-label="tamamlandı">✓</span>}</b>
                <small>{ROBOT_PROFILES[m.profile].title}</small>
              </button>
            </li>
          ))}
        </ul>
        <h2>Serbest arena</h2>
        <ul>
          {(['blok', 'gezgin'] as const).map((p) => (
            <li key={p}>
              <button aria-current={pick.kind === 'free' && pick.profile === p} onClick={() => setPick({ kind: 'free', profile: p })} data-testid={`robot-free-${p}`}>
                <b>{ROBOT_PROFILES[p].title}</b>
                <small>Çizgi pisti, renkli alanlar, engel</small>
              </button>
            </li>
          ))}
        </ul>
        <div className="rb-profiles">
          <h2>Gövdeler</h2>
          {(['blok', 'gezgin'] as const).map((p) => <p key={p} className="rb-profile"><b>{ROBOT_PROFILES[p].title}:</b> {ROBOT_PROFILES[p].summary}</p>)}
        </div>
      </nav>
      <div className="rb-ed">
        <MikroEditor key={key} storageKey={`ask:robot:${key}:v1`} activity={mission ?? undefined} robot={robot} initialProject={mission ? undefined : freeStart} onGoalsChange={onGoals} />
      </div>
    </div>
  )
}
