import { beforeAll, describe, expect, it } from 'vitest'
import { createTestDb } from '@/lib/test-db'
import type { Db } from '@ask/db'
import { EXAM_PROJECTS } from './projects'
import { MCQ_BANK } from './questions'
import {
  attemptByToken, createSession, ExamError, extendAttempt, finalize, getAttempt, gradingIdle, listAttempts, saveAttempt,
  setGrader, setSessionStatus, startAttempt, studentView, submitAttempt, allowRelogin, totalScore,
} from './service'

let db: Db
beforeAll(async () => {
  db = await createTestDb()
  // Testte gerçek derleyici yok: proje puanı sabit 50
  setGrader(async (d, id) => {
    const { examAttempts, eq } = await import('@ask/db')
    await d.update(examAttempts).set({ projectScore: 50, gradeStatus: 'done' }).where(eq(examAttempts.id, id))
  })
}, 60_000)

const open = async () => {
  const s = await createSession(db, { title: 'Test', durationMin: 60 })
  await setSessionStatus(db, s.id, 'open')
  return s
}

describe.skipIf(EXAM_PROJECTS.length === 0)('sınav servisi', () => {
  it('taslak sınava girilemez, kod büyük/küçük harf duyarsız', async () => {
    const s = await createSession(db, { title: 'Draft', durationMin: 30 })
    await expect(startAttempt(db, { code: s.code, studentNo: '1', studentName: 'Ali' })).rejects.toThrow(ExamError)
    await setSessionStatus(db, s.id, 'open')
    const r = await startAttempt(db, { code: s.code.toLowerCase(), studentNo: '1001', studentName: 'Ali Veli' })
    expect(r.token.length).toBeGreaterThan(20)
  })

  it('projeler dengeli dağılır, sorular benzersiz, görünümde doğru cevap yok', async () => {
    const s = await open()
    const n = EXAM_PROJECTS.length * 2
    for (let i = 0; i < n; i++) await startAttempt(db, { code: s.code, studentNo: `S${i}`, studentName: `Student ${i}` })
    const rows = await listAttempts(db, s.id)
    const counts = new Map<string, number>()
    for (const r of rows) counts.set(r.projectId, (counts.get(r.projectId) ?? 0) + 1)
    expect([...counts.values()].every((c) => c === 2)).toBe(true)
    const a = rows[0]
    expect(new Set(a.mcq.map((m) => m.id)).size).toBe(10)
    const view = studentView(a, s)
    expect(JSON.stringify(view)).not.toMatch(/"answer"|"why"|"rubric"/)
    expect(view.mcq[0].options).toHaveLength(4)
  })

  it('başka cihazdan giriş engellenir, öğretmen izin verince devralınır', async () => {
    const s = await open()
    const first = await startAttempt(db, { code: s.code, studentNo: '777', studentName: 'Ayşe' })
    const again = await startAttempt(db, { code: s.code, studentNo: '777', studentName: 'Ayşe' }, first.token)
    expect(again.attemptId).toBe(first.attemptId)
    await expect(startAttempt(db, { code: s.code, studentNo: '777', studentName: 'Ayşe' })).rejects.toThrow(/another device/)
    await allowRelogin(db, first.attemptId)
    const taken = await startAttempt(db, { code: s.code, studentNo: '777', studentName: 'Ayşe' })
    expect(taken.attemptId).toBe(first.attemptId)
    expect(await attemptByToken(db, first.token)).toBeNull()
  })

  it('kaydet + teslim: çoktan seçmeli puanı, proje kuyruğu, toplam', async () => {
    const s = await open()
    const r = await startAttempt(db, { code: s.code, studentNo: '42', studentName: 'Zeynep' })
    let a = (await attemptByToken(db, r.token))!
    const right = Object.fromEntries(a.mcq.slice(0, 4).map((m) => [m.id, MCQ_BANK.find((q) => q.id === m.id)!.answer]))
    await saveAttempt(db, a, { mcq: { ...right, bogus: 1 }, definition: 'An interrupt is…', code: 'void setup(){}\nvoid loop(){}', blur: 2 })
    a = (await getAttempt(db, a.id))!
    expect(a.answers.mcq).toEqual(right)
    expect(a.flags.blur).toBe(2)
    await expect(saveAttempt(db, a, { circuit: { parts: 'x' } })).rejects.toThrow(/Invalid circuit/)
    await submitAttempt(db, a, {})
    await gradingIdle()
    a = (await getAttempt(db, a.id))!
    expect(a.submittedAt).not.toBeNull()
    expect(a.mcqScore).toBe(12)
    expect(a.projectScore).toBe(50)
    expect(totalScore(a, s.config)).toEqual({ project: 30, total: 42, max: 100 })
    await expect(saveAttempt(db, a, { definition: 'late' })).rejects.toThrow(/Already submitted/)
  })

  it('süre dolduktan sonra kayıt teslime döner; süre uzatma teslimi geri alır', async () => {
    const s = await open()
    const r = await startAttempt(db, { code: s.code, studentNo: '9', studentName: 'Can' })
    const { examAttempts, eq } = await import('@ask/db')
    await db.update(examAttempts).set({ deadlineAt: new Date(Date.now() - 10 * 60_000) }).where(eq(examAttempts.id, r.attemptId))
    const a = (await getAttempt(db, r.attemptId))!
    await expect(saveAttempt(db, a, { definition: 'x' })).rejects.toThrow(/Time is up/)
    expect((await getAttempt(db, r.attemptId))!.submittedAt).not.toBeNull()
    await extendAttempt(db, r.attemptId, 10)
    const b = (await getAttempt(db, r.attemptId))!
    expect(b.submittedAt).toBeNull()
    expect(b.deadlineAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('sınavı kapatmak açık girişleri teslim eder', async () => {
    const s = await open()
    await startAttempt(db, { code: s.code, studentNo: 'A', studentName: 'Ece Y' })
    await setSessionStatus(db, s.id, 'closed')
    const rows = await listAttempts(db, s.id)
    expect(rows.every((x) => x.submittedAt)).toBe(true)
    await expect(startAttempt(db, { code: s.code, studentNo: 'B', studentName: 'Late K' })).rejects.toThrow(/closed/)
    await finalize(db, rows[0].id) // ikinci kez: etkisiz
  })
})
