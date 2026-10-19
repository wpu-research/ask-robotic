// Tasarım yarışmaları: gönderilen tasarım + program sunucuda yeniden puanlanır (runDesignChallenge). Giriş yapmış kullanıcının
// sonucu Sanal Beceri'nin skill_runs tablosuna `tasarim:<id>` kimliğiyle yazılır (yeni tablo/göç gerekmez).
import { and, eq, inArray, skillRuns, sql, type Db } from '@ask/db'
import { DESIGN_CHALLENGE_BY_ID, designRunId, runDesignChallenge, type DesignResult } from './mikro/tasarim-gorevleri'
import { importDesign } from './mikro/tasarim'
import { validateProject } from './mikro/storage'
import type { MikroProject } from './mikro/types'

export const MAX_DESIGN_BYTES = 220_000

export type DesignSubmit = ({ ok: true; best: number | null; saved: boolean } & DesignResult) | { ok: false; error: string }

/** Tasarımı ve programı doğrular, puanlar; `db` ve `userId` verilirse kaydeder. */
export async function submitDesignRun(db: Db | null, userId: string | null, challengeId: string, rawDesign: unknown, rawProject: unknown): Promise<DesignSubmit> {
  const ch = DESIGN_CHALLENGE_BY_ID[challengeId]
  if (!ch) return { ok: false, error: 'Böyle bir tasarım yarışması yok' }
  if (JSON.stringify({ rawDesign, rawProject }).length > MAX_DESIGN_BYTES) return { ok: false, error: 'Gönderim çok büyük' }
  const d = importDesign(rawDesign)
  if (!d.ok) return { ok: false, error: `Tasarım okunamadı: ${d.error}` }
  const v = validateProject(rawProject)
  if (!v.ok) return { ok: false, error: `Program okunamadı: ${v.error}` }
  const project: MikroProject = { version: 1, name: v.project.name.slice(0, 60), workspace: v.project.workspace }
  const r = runDesignChallenge(ch, d.design, project)
  if (!db || !userId) return { ok: true, ...r, best: null, saved: false }
  const id = designRunId(ch.id)
  await db.insert(skillRuns).values({ userId, challengeId: id, score: r.score, finishMs: r.finishMs, program: { ...project, design: d.design } as unknown as Record<string, unknown> })
  const [best] = await db.select({ s: sql<number>`max(${skillRuns.score})::int` }).from(skillRuns).where(and(eq(skillRuns.userId, userId), eq(skillRuns.challengeId, id)))
  return { ok: true, ...r, best: Number(best?.s ?? r.score), saved: true }
}

/** Kullanıcının yarışma başına en iyi puanı. */
export async function myDesignBest(db: Db, userId: string, ids: string[]): Promise<Record<string, number>> {
  if (!ids.length) return {}
  const rows = await db.select({ c: skillRuns.challengeId, s: sql<number>`max(${skillRuns.score})::int` }).from(skillRuns)
    .where(and(eq(skillRuns.userId, userId), inArray(skillRuns.challengeId, ids.map(designRunId)))).groupBy(skillRuns.challengeId)
  return Object.fromEntries(rows.map((r) => [r.c.replace(/^tasarim:/, ''), Number(r.s)]))
}
