// Sanal Beceri: gönderim ve sınıf puan tabloları (DB). Puan her zaman sunucuda yeniden hesaplanır (runSkill).
// Erişim: sınıf kodu ile katılınan sınıflar. Öğrenci kendi sınıflarının tablosunu, öğretmen sınıfının tablosunu görür.
import { and, asc, classes, classMembers, eq, inArray, skillRuns, sql, users, type Db } from '@ask/db'
import { SKILL_BY_ID, runSkill, type ScorePart } from './mikro/beceri'
import { validateProject } from './mikro/storage'
import type { MikroProject } from './mikro/types'
import { shortName } from './roster'
import { SEASON_BY_FIELD } from './mikro/sezon'

/** Sanal Beceri sahası ya da yarışma sezonu alanı. */
export const challengeById = (id: string) => SKILL_BY_ID[id] ?? SEASON_BY_FIELD[id]?.field

/** Gönderilen programın JSON boyutu sınırı (bayt). */
export const MAX_SKILL_PROGRAM_BYTES = 200_000

export type SubmitResult =
  | { ok: true; score: number; parts: ScorePart[]; finishMs: number | null; best: number; error: string | null }
  | { ok: false; error: string }

export async function submitSkillRun(db: Db, userId: string, challengeId: string, raw: unknown): Promise<SubmitResult> {
  const ch = challengeById(challengeId)
  if (!ch) return { ok: false, error: 'Böyle bir beceri sahası yok' }
  if (JSON.stringify(raw ?? null).length > MAX_SKILL_PROGRAM_BYTES) return { ok: false, error: 'Program çok büyük' }
  const v = validateProject(raw)
  if (!v.ok) return { ok: false, error: `Program okunamadı: ${v.error}` }
  const project: MikroProject = { version: 1, name: v.project.name.slice(0, 60), workspace: v.project.workspace }
  const r = runSkill(ch, project)
  await db.insert(skillRuns).values({ userId, challengeId, score: r.score, finishMs: r.finishMs, program: project as unknown as Record<string, unknown> })
  const [best] = await db.select({ s: sql<number>`max(${skillRuns.score})::int` }).from(skillRuns)
    .where(and(eq(skillRuns.userId, userId), eq(skillRuns.challengeId, challengeId)))
  return { ok: true, score: r.score, parts: r.parts, finishMs: r.finishMs, best: Number(best?.s ?? r.score), error: r.error }
}

export interface BoardRow { userId: string; name: string; score: number; finishMs: number | null; attempts: number; lastAt: Date; rank: number }

/** Verilen kullanıcıların bu sahadaki en iyi kaydı: puan ↓, bitiş süresi ↑, ilk gönderen önde. */
export async function bestRuns(db: Db, userIds: string[], challengeId: string): Promise<BoardRow[]> {
  if (!userIds.length) return []
  const rows = await db.execute(sql`
    select b.user_id, b.score, b.finish_ms, c.attempts, c.last_at, u.name
    from (
      select distinct on (user_id) user_id, score, finish_ms, created_at
      from ${skillRuns}
      where challenge_id = ${challengeId} and user_id in (${sql.join(userIds.map((id) => sql`${id}::uuid`), sql`, `)})
      order by user_id, score desc, finish_ms asc nulls last, created_at asc
    ) b
    join (
      select user_id, count(*)::int as attempts, max(created_at) as last_at
      from ${skillRuns} where challenge_id = ${challengeId} group by user_id
    ) c on c.user_id = b.user_id
    join ${users} u on u.id = b.user_id
    order by b.score desc, b.finish_ms asc nulls last, b.created_at asc`)
  const list = (Array.isArray(rows) ? rows : (rows as { rows: unknown[] }).rows) as Array<Record<string, unknown>>
  return list.map((x, i) => ({
    userId: String(x.user_id), name: shortName(String(x.name)), score: Number(x.score),
    finishMs: x.finish_ms == null ? null : Number(x.finish_ms), attempts: Number(x.attempts), lastAt: new Date(String(x.last_at)), rank: i + 1,
  }))
}

/** Sınıfın öğrencileri için puan tablosu (öğretmen sayfası). */
export async function classBoard(db: Db, classId: string, challengeId: string): Promise<BoardRow[]> {
  const members = await db.select({ id: classMembers.userId }).from(classMembers)
    .where(and(eq(classMembers.classId, classId), eq(classMembers.role, 'student')))
  return bestRuns(db, members.map((m) => m.id), challengeId)
}

export interface MyBoard { classId: string; className: string; rows: BoardRow[] }

/** Kullanıcının öğrenci olduğu (arşivlenmemiş) sınıfların tabloları. */
export async function myBoards(db: Db, userId: string, challengeId: string): Promise<MyBoard[]> {
  const mine = await db.select({ id: classes.id, name: classes.name }).from(classMembers)
    .innerJoin(classes, eq(classes.id, classMembers.classId))
    .where(and(eq(classMembers.userId, userId), eq(classMembers.role, 'student'), eq(classes.archived, false)))
    .orderBy(asc(classes.name))
  const out: MyBoard[] = []
  for (const c of mine) out.push({ classId: c.id, className: c.name, rows: await classBoard(db, c.id, challengeId) })
  return out
}

export async function myBest(db: Db, userId: string, challengeIds: string[]): Promise<Record<string, number>> {
  if (!challengeIds.length) return {}
  const rows = await db.select({ c: skillRuns.challengeId, s: sql<number>`max(${skillRuns.score})::int` }).from(skillRuns)
    .where(and(eq(skillRuns.userId, userId), inArray(skillRuns.challengeId, challengeIds))).groupBy(skillRuns.challengeId)
  return Object.fromEntries(rows.map((r) => [r.c, Number(r.s)]))
}
