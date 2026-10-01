import type { Goal } from './analysis'
import type { BlockType, Project } from './types'

/** Bir dersin Etkinlik adımında, yazının yanında açılan uygulamanın yapılandırması. */
export interface Activity {
  /** Kısa yönerge (uygulamanın üstünde gösterilir). */
  intro?: string
  /** Her çağrıda taze (benzersiz kimlikli) başlangıç projesi üretir. */
  starter: () => Project
  /** Yalnız bu bloklar paletle sunulur; verilmezse hepsi. */
  allowedBlocks?: BlockType[]
  allowPages?: boolean
  allowSprites?: boolean
  goals: Goal[]
  /** YALNIZ TEST: tüm hedefleri sağlayan örnek çözüm. Hedeflerin ulaşılabilir olduğunu kanıtlar. */
  solution?: () => Project
}

import { MODUL1_ACTIVITIES } from './activities/modul1'

/** Anahtar: "<modül slug>:<hafta>:<ders>" (hafta ve ders 1 tabanlı konum). */
export const activityKey = (moduleSlug: string, weekPos: number, lessonPos: number) => `${moduleSlug}:${weekPos}:${lessonPos}`

const REGISTRY: Record<string, Activity> = { ...MODUL1_ACTIVITIES }

export const getActivity = (key: string | null | undefined): Activity | null => (key ? REGISTRY[key] ?? null : null)
export const allActivities = () => Object.entries(REGISTRY)
