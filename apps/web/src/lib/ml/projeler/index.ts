// Makine Öğrenmesi kursunun son bölümü: 3B benzetimli beş proje. Her proje lib/ml/projeler/<slug>.ts'te (saf mantık),
// sahnesi components/ml/projeler/scenes/<slug>.ts'te. Sıra burada; bölüm bilgisi lib/ml/sections.ts'teki PROJE_BOLUMU'nde.
import type { ProjectDef } from './core'
import { OTONOM_ARAC } from './otonom-arac'
import { ROBOT_KOL } from './robot-kol'
import { DRONE_INIS } from './drone-inis'
import { DEPO_SINIFLANDIRMA } from './depo-siniflandirma'
import { NOKTA_BULUTU } from './nokta-bulutu'

export const PROJECTS: ProjectDef[] = [OTONOM_ARAC, ROBOT_KOL, DRONE_INIS, DEPO_SINIFLANDIRMA, NOKTA_BULUTU].map((p) => p as unknown as ProjectDef)
export const projectBySlug = (slug: string): ProjectDef | undefined => PROJECTS.find((p) => p.slug === slug)
