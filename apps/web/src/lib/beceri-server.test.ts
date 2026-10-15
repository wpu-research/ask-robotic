import { beforeAll, describe, expect, it } from 'vitest'
import { classMembers, classes, organizations, skillRuns, users, eq, type Db } from '@ask/db'
import { createTestDb } from './test-db'
import { bestRuns, classBoard, myBest, myBoards, submitSkillRun } from './beceri-server'
import { SKILL_CHALLENGES } from './mikro/beceri'
import { onStart, project } from './mikro/program'
import { exportUserData } from './account-data'

let db: Db
const ch = SKILL_CHALLENGES[0]
const user = async (name: string) => (await db.insert(users).values({ name, email: `${crypto.randomUUID()}@t.co` }).returning())[0]

beforeAll(async () => { db = await createTestDb() })

describe('sanal beceri gönderimi', () => {
  it('puanı sunucuda hesaplar; istemcinin yazdığı puan yok sayılır', async () => {
    const u = await user('Ada Kaya')
    const r = await submitSkillRun(db, u.id, ch.id, { ...ch.sample(), score: 999 })
    expect(r).toMatchObject({ ok: true })
    if (!r.ok) return
    expect(r.score).toBeGreaterThanOrEqual(60)
    expect(r.score).toBeLessThan(999)
    const [row] = await db.select().from(skillRuns).where(eq(skillRuns.userId, u.id))
    expect(row.score).toBe(r.score)
    expect((row.program as { name?: string }).name).toBe('Kontrol turu')
  })

  it('bilinmeyen saha, bozuk ve dev program reddedilir', async () => {
    const u = await user('Can')
    expect(await submitSkillRun(db, u.id, 'yok', ch.sample())).toMatchObject({ ok: false })
    expect(await submitSkillRun(db, u.id, ch.id, { version: 1, name: 'x' })).toMatchObject({ ok: false })
    expect(await submitSkillRun(db, u.id, ch.id, { version: 1, name: 'x', workspace: { blocks: { blocks: [] } }, pad: 'x'.repeat(250_000) })).toMatchObject({ ok: false })
  })

  it('sınıf tablosu: kişi başına en iyi kayıt, puana göre sıralı; yalnız o sınıfın öğrencileri', async () => {
    const [org] = await db.insert(organizations).values({ name: 'Okul', slug: `o-${crypto.randomUUID()}` }).returning()
    const [cls] = await db.insert(classes).values({ organizationId: org.id, name: '7-B', joinCode: crypto.randomUUID().slice(0, 6) }).returning()
    const [a, b2, out, teacher] = [await user('Ali Can'), await user('Zeynep Er'), await user('Başka Sınıf'), await user('Öğretmen')]
    await db.insert(classMembers).values([{ classId: cls.id, userId: a.id }, { classId: cls.id, userId: b2.id }, { classId: cls.id, userId: teacher.id, role: 'teacher' }])
    await submitSkillRun(db, a.id, ch.id, project('boş', [onStart()]))
    await submitSkillRun(db, a.id, ch.id, ch.sample())
    await submitSkillRun(db, b2.id, ch.id, project('boş', [onStart()]))
    await submitSkillRun(db, out.id, ch.id, ch.sample())
    await submitSkillRun(db, teacher.id, ch.id, ch.sample())
    const board = await classBoard(db, cls.id, ch.id)
    expect(board.map((r) => [r.name, r.attempts, r.rank])).toEqual([['Ali C.', 2, 1], ['Zeynep E.', 1, 2]])
    expect(board[0].score).toBeGreaterThan(board[1].score)
    const mine = await myBoards(db, b2.id, ch.id)
    expect(mine.map((m) => m.className)).toEqual(['7-B'])
    expect(await myBoards(db, out.id, ch.id)).toEqual([])
    expect((await myBest(db, a.id, [ch.id]))[ch.id]).toBe(board[0].score)
    expect(await bestRuns(db, [], ch.id)).toEqual([])
  })

  it('hesap verisi dışa aktarımında gönderimler yer alır', async () => {
    const u = await user('Dışa Aktar')
    await submitSkillRun(db, u.id, ch.id, ch.sample())
    const data = await exportUserData(db, u.id)
    expect((data as unknown as { skillRuns: unknown[] }).skillRuns).toHaveLength(1)
  })
})
