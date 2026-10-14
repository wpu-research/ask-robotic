'use client'
import { useMemo } from 'react'
import { JrEditor } from '@/components/jr/jr-editor'
import { ArenaEditor } from '@/components/arena/arena-editor'
import { LabEditor } from '@/components/lab/lab-editor'
import { MikroEditor } from '@/components/mikro/mikro-editor'
import { OyunEditor } from '@/components/oyun/oyun-editor'
import { SahneEditor } from '@/components/sahne/sahne-editor'
import { AiEditor } from '@/components/ai/ai-editor'
import { getActivity } from '@/lib/jr/activity'
import { getArenaActivity } from '@/lib/arena/activity'
import { getLabActivity } from '@/lib/lab/activity'
import { getMikroActivity } from '@/lib/mikro/activities'
import { getOyunActivity } from '@/lib/oyun/activities/ders-registry'
import { getSahneActivity } from '@/lib/sahne/activities'
import { getAiActivity } from '@/lib/ai/activities'

/** Dersin simülatör etkinliği (laboratuvar, arena, blok atölyeleri, AI atölyesi); etkinlik yoksa null. Klasik ve v2 oynatıcı ortak kullanır. */
export function LessonActivity({ activityKey, lessonId, onGoals }: { activityKey: string | null | undefined; lessonId: number; onGoals: () => void }) {
  const jr = useMemo(() => getActivity(activityKey), [activityKey])
  const jrStarter = useMemo(() => jr?.starter(), [jr])
  const lab = useMemo(() => getLabActivity(activityKey), [activityKey])
  const labStarter = useMemo(() => lab?.starter(), [lab])
  const arena = useMemo(() => getArenaActivity(activityKey), [activityKey])
  const arenaCode = useMemo(() => arena?.starter(), [arena])
  const mikro = useMemo(() => getMikroActivity(activityKey), [activityKey])
  const oyun = useMemo(() => getOyunActivity(activityKey), [activityKey])
  const sahne = useMemo(() => getSahneActivity(activityKey), [activityKey])
  const ai = useMemo(() => getAiActivity(activityKey), [activityKey])

  if (lab && labStarter) return (
    <div className="lesson-lab" data-activity={activityKey}>
      {lab.intro && <p className="lesson-app-intro">{lab.intro}</p>}
      <LabEditor initial={labStarter.circuit} initialCode={labStarter.code} allowedParts={lab.allowedParts} goals={lab.goals} storageKey={`ask:lab:lesson:${lessonId}`} onGoalsComplete={onGoals} />
    </div>
  )
  if (arena && arenaCode !== undefined) return (
    <div className="lesson-lab lesson-arena" data-activity={activityKey}>
      {arena.intro && <p className="lesson-app-intro">{arena.intro}</p>}
      <ArenaEditor key={lessonId} scene={arena.scene} initialCode={arenaCode} goals={arena.goals} quickSend={arena.quickSend} storageKey={`ask:arena:lesson:${lessonId}`} onGoalsComplete={onGoals} />
    </div>
  )
  if (mikro) return (
    <div className="lesson-lab lesson-mikro" data-activity={activityKey}>
      <div className="mk-page-body"><MikroEditor key={lessonId} activity={mikro} storageKey={`ask:mikro:ders:${activityKey}`} onGoalsChange={(_s, all) => { if (all) onGoals() }} /></div>
    </div>
  )
  if (oyun) return (
    <div className="lesson-lab lesson-oyun" data-activity={activityKey}>
      <div className="oy-tool-body"><OyunEditor key={lessonId} activity={oyun} storageKey={`ask:oyun:ders:${activityKey}`} onGoalsChange={(_r, all) => { if (all) onGoals() }} /></div>
    </div>
  )
  if (sahne) return (
    <div className="lesson-lab lesson-sahne" data-activity={activityKey}>
      <SahneEditor key={lessonId} activity={sahne} storageKey={`ask:sahne:ders:${activityKey}`} onGoalsChange={(_r, all) => { if (all) onGoals() }} />
    </div>
  )
  if (ai) return (
    <div className="lesson-lab lesson-ai" data-activity={activityKey}>
      <AiEditor key={lessonId} activity={ai} storageKey={`ask:ai:ders:${activityKey}`} onGoalsChange={(_r, all) => { if (all) onGoals() }} />
    </div>
  )
  if (jr && jrStarter) return (
    <div className="lesson-app" data-activity={activityKey}>
      {jr.intro && <p className="lesson-app-intro">{jr.intro}</p>}
      <JrEditor initial={jrStarter} storageKey={`ask:jr:lesson:${lessonId}`} allowedBlocks={jr.allowedBlocks} allowPages={jr.allowPages} allowSprites={jr.allowSprites} goals={jr.goals} onGoalsComplete={onGoals} />
    </div>
  )
  return null
}
