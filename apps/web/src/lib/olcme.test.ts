import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { events, lessons, modules, seedContent, weeks, eq, type Db, type QuizQuestion } from '@ask/db'
import { computeMastery, FIRST_TRY_WEIGHT, levelOf, RECENCY_DECAY, RETRY_WEIGHT, type AnswerRecord } from './skills'
import { parseEvents, pendingEvents, pushRing, sanitizeEvent, sanitizePayload, type AppEvent } from './events-core'
import { canRecord, canSync, parseConsent } from './consent'
import { answerRecords, isCorrect, parseNumber, quizSummaries } from './quiz'
import { durationLabel, summarizeEvents } from './progress-summary'
import { DEVICE_RE, deleteDeviceEvents, parseBatch, storeEvents } from './events-server'
import { listQuizLessons, resolveLessonKeys } from './content'
import { createTestDb } from './test-db'

const rec = (correct: boolean, t: number, skills = ['elec-ohm'], n = 1): AnswerRecord => ({ skills, correct, t, n })

describe('beceri ustalığı', () => {
  it('veri yoksa "yeni" ve sıfır', () => {
    const m = computeMastery([], ['elec-ohm'])[0]
    expect(m).toMatchObject({ score: 0, attempts: 0, confidence: 0, level: 'yeni' })
  })
  it('hepsi doğruysa 1; hepsi yanlışsa 0', () => {
    expect(computeMastery([rec(true, 1), rec(true, 2), rec(true, 3)], ['elec-ohm'])[0].score).toBe(1)
    expect(computeMastery([rec(false, 1), rec(false, 2)], ['elec-ohm'])[0].score).toBe(0)
  })
  it('yeni cevaplar daha ağırdır: son doğru, ilk yanlışı bastırır', () => {
    const iyiye = computeMastery([rec(false, 1), rec(true, 2)], ['elec-ohm'])[0].score
    const kotuye = computeMastery([rec(true, 1), rec(false, 2)], ['elec-ohm'])[0].score
    expect(iyiye).toBeGreaterThan(0.5)
    expect(kotuye).toBeLessThan(0.5)
    expect(iyiye).toBeCloseTo(1 / (1 + RECENCY_DECAY), 10)
  })
  it('tekrar denemeler ilk denemeden az sayılır', () => {
    // aynı zaman ağırlığı olsun diye tek soru: ilk deneme yanlış, tekrar doğru
    const r = computeMastery([rec(false, 1, ['elec-ohm'], 1), rec(true, 2, ['elec-ohm'], 2)], ['elec-ohm'])[0]
    const expected = (RETRY_WEIGHT) / (RETRY_WEIGHT + RECENCY_DECAY * FIRST_TRY_WEIGHT)
    expect(r.score).toBeCloseTo(expected, 10)
  })
  it('çok becerili cevap her beceriye ayrı yazılır; güven 5 cevapta 1', () => {
    const rs = [rec(true, 1, ['elec-ohm', 'elec-led-resistor']), rec(false, 2, ['elec-led-resistor'])]
    const m = computeMastery(rs, ['elec-ohm', 'elec-led-resistor'])
    expect(m[0].attempts).toBe(1)
    expect(m[1].attempts).toBe(2)
    expect(computeMastery(Array.from({ length: 5 }, (_, i) => rec(true, i)), ['elec-ohm'])[0].confidence).toBe(1)
  })
  it('düzey eşikleri', () => {
    expect(levelOf(0.9, 2)).toBe('gelisiyor') // az veriyle ustalaşılmaz
    expect(levelOf(0.9, 3)).toBe('ustalasti')
    expect(levelOf(0.3, 4)).toBe('baslangic')
    expect(levelOf(0, 0)).toBe('yeni')
  })
  it('girdi sırası sonucu değiştirmez (zamana göre sıralanır)', () => {
    const a = [rec(true, 3), rec(false, 1), rec(true, 2)]
    expect(computeMastery(a, ['elec-ohm'])[0].score).toBe(computeMastery([...a].reverse(), ['elec-ohm'])[0].score)
  })
})

describe('olay günlüğü çekirdeği', () => {
  it('yük: yalnız ilkel değerler, en çok 8 anahtar, 80 karakter', () => {
    const p = sanitizePayload({ a: 'x'.repeat(200), b: 1, c: true, d: { x: 1 }, e: NaN, 'k k': 1, f: [1] })!
    expect(p.a).toHaveLength(80)
    expect(p).toMatchObject({ b: 1, c: true })
    expect(Object.keys(p).sort()).toEqual(['a', 'b', 'c'])
    expect(Object.keys(sanitizePayload(Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`k${i}`, i])))!)).toHaveLength(8)
    expect(sanitizePayload(null)).toBeUndefined()
    expect(sanitizePayload([1])).toBeUndefined()
  })
  it('geçersiz olaylar elenir; fazladan alanlar (PII) atılır', () => {
    expect(sanitizeEvent({ t: 1, type: 'bilinmeyen' })).toBeNull()
    expect(sanitizeEvent({ t: 0, type: 'compile' })).toBeNull()
    expect(sanitizeEvent('x')).toBeNull()
    const e = sanitizeEvent({ t: 5, type: 'compile', lessonId: 3, email: 'a@b.c', p: { ok: true } })!
    expect(e).toEqual({ t: 5, type: 'compile', lessonId: 3, p: { ok: true } })
    expect(sanitizeEvent({ t: 5, type: 'run', lessonId: -1 })).toEqual({ t: 5, type: 'run' })
  })
  it('parseEvents bozuk veriyi boş listeye çevirir', () => {
    expect(parseEvents('{bozuk')).toEqual([])
    expect(parseEvents('{}')).toEqual([])
    expect(parseEvents(JSON.stringify([{ t: 1, type: 'run' }, { t: 2, type: 'x' }]))).toEqual([{ t: 1, type: 'run' }])
  })
  it('halka tamponu en eski kayıtları atar', () => {
    let l: AppEvent[] = []
    for (let i = 1; i <= 7; i++) l = pushRing(l, { t: i, type: 'run' }, 5)
    expect(l.map((e) => e.t)).toEqual([3, 4, 5, 6, 7])
  })
  it('gönderilmemiş olaylar imleçten sonrasıdır ve toplu sınırlıdır', () => {
    const l: AppEvent[] = Array.from({ length: 120 }, (_, i) => ({ t: i + 1, type: 'run' as const }))
    expect(pendingEvents(l, 100)).toHaveLength(20)
    expect(pendingEvents(l, 0)).toHaveLength(50)
    expect(pendingEvents(l, 120)).toHaveLength(0)
  })
})

describe('onay (KVKK)', () => {
  it('bozuk kayıt onay yok sayılır', () => {
    expect(parseConsent(null)).toBeNull()
    expect(parseConsent('x')).toBeNull()
    expect(parseConsent('{"v":1,"mode":"herkes","t":1}')).toBeNull()
  })
  it('kayıt yalnız onay + yaş/veli işaretiyle; sunucu yalnız "sync" ile', () => {
    expect(canRecord(null)).toBe(false)
    expect(canRecord(parseConsent('{"v":1,"mode":"local","t":1,"ack":false}'))).toBe(false)
    expect(canRecord(parseConsent('{"v":1,"mode":"denied","t":1,"ack":true}'))).toBe(false)
    const local = parseConsent('{"v":1,"mode":"local","t":1,"ack":true}')
    const sync = parseConsent('{"v":1,"mode":"sync","t":1,"ack":true}')
    expect(canRecord(local)).toBe(true)
    expect(canSync(local)).toBe(false)
    expect(canRecord(sync)).toBe(true)
    expect(canSync(sync)).toBe(true)
  })
})

describe('mini test mantığı', () => {
  it('parseNumber virgül, birim ve eksi işareti', () => {
    expect(parseNumber('9,1')).toBe(9.1)
    expect(parseNumber(' 5 mA ')).toBe(5)
    expect(parseNumber('500Ω')).toBe(500)
    expect(parseNumber('−3')).toBe(-3)
    expect(parseNumber('on')).toBeNull()
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('1,2,3')).toBeNull()
  })
  it('isCorrect: seçmeli sıra, sayısal tolerans', () => {
    const mcq: QuizQuestion = { id: 'a', kind: 'mcq', prompt: 'p', options: ['x', 'y'], answer: 1, explanation: 'e', skills: ['elec-ohm'] }
    expect(isCorrect(mcq, 1)).toBe(true)
    expect(isCorrect(mcq, 0)).toBe(false)
    const num: QuizQuestion = { id: 'b', kind: 'numeric', prompt: 'p', answer: 9, tolerance: 0.5, explanation: 'e', skills: ['elec-ohm'] }
    expect(isCorrect(num, 9.4)).toBe(true)
    expect(isCorrect(num, 9.6)).toBe(false)
    expect(isCorrect({ ...num, tolerance: undefined }, 9.01)).toBe(false)
  })
  it('answerRecords: deneme sırası aynı sorunun tekrar sayısıdır', () => {
    const ev: AppEvent[] = [
      { t: 3, type: 'quiz_answer', lessonId: 1, p: { q: 'a', ok: true, sk: 'elec-ohm,prog-timing' } },
      { t: 1, type: 'quiz_answer', lessonId: 1, p: { q: 'a', ok: false, sk: 'elec-ohm,prog-timing' } },
      { t: 2, type: 'run' },
      { t: 4, type: 'quiz_answer', lessonId: 2, p: { q: 'a', ok: true, sk: 'elec-ohm' } },
    ]
    const r = answerRecords(ev)
    expect(r.map((x) => x.n)).toEqual([1, 2, 1])
    expect(r[1]).toMatchObject({ correct: true, skills: ['elec-ohm', 'prog-timing'] })
  })
  it('quizSummaries: son puan, en iyi puan, deneme sayısı', () => {
    const ev: AppEvent[] = [
      { t: 1, type: 'quiz_done', lessonId: 7, p: { score: 2, total: 5 } },
      { t: 5, type: 'quiz_done', lessonId: 7, p: { score: 4, total: 5 } },
      { t: 9, type: 'quiz_done', lessonId: 7, p: { score: 3, total: 5 } },
      { t: 6, type: 'quiz_done', lessonId: 8, p: { score: 5, total: 5 } },
      { t: 7, type: 'quiz_done', lessonId: 9, p: { score: 1, total: 0 } },
    ]
    const s = quizSummaries(ev)
    expect(s.map((x) => x.lessonId)).toEqual([7, 8])
    expect(s[0]).toMatchObject({ attempts: 3, lastScore: 3, bestScore: 4, lastTotal: 5 })
  })
  it('summarizeEvents: süre, ders sayısı, test ortalaması; veri yoksa sıfır', () => {
    expect(summarizeEvents([])).toMatchObject({ total: 0, seconds: 0, lessonsViewed: 0, quizAvg: null })
    const s = summarizeEvents([
      { t: 1, type: 'lesson_view', lessonId: 1 }, { t: 2, type: 'lesson_view', lessonId: 1 }, { t: 3, type: 'lesson_view', lessonId: 2 },
      { t: 4, type: 'lesson_leave', lessonId: 1, p: { sec: 90 } }, { t: 5, type: 'lesson_leave', lessonId: 2, p: { sec: 5000 } },
      { t: 6, type: 'quiz_done', lessonId: 1, p: { score: 4, total: 5 } },
    ])
    expect(s.lessonsViewed).toBe(2)
    expect(s.seconds).toBe(90 + 1800)
    expect(s.quizAvg).toBeCloseTo(0.8)
    expect(durationLabel(90)).toBe('2 dk')
    expect(durationLabel(3720)).toBe('1 sa 2 dk')
  })
})

describe('sunucu: /api/events ve depolama', () => {
  const ID = 'a1b2c3d4e5f60718293a4b5c6d7e8f90'
  it('cihaz kimliği biçimi', () => {
    expect(DEVICE_RE.test(ID)).toBe(true)
    expect(DEVICE_RE.test('kisi@mail.com')).toBe(false)
    expect(DEVICE_RE.test('x')).toBe(false)
  })
  it('parseBatch: sınırlar, geçersiz olay, gelecek zamanı eler', () => {
    const now = 1_800_000_000_000
    expect(parseBatch(null).ok).toBe(false)
    expect(parseBatch({ deviceId: 'x', events: [] }).ok).toBe(false)
    expect(parseBatch({ deviceId: ID, events: [] }).ok).toBe(false)
    expect(parseBatch({ deviceId: ID, events: Array.from({ length: 51 }, () => ({ t: now, type: 'run' })) }).ok).toBe(false)
    const r = parseBatch({ deviceId: ID, events: [{ t: now - 10, type: 'run' }, { t: now + 3_600_000, type: 'run' }, { t: now, type: 'sahte' }, { t: now, type: 'compile', email: 'a@b', p: { ok: true } }] }, now)
    expect(r.ok && r.events).toEqual([{ t: now - 10, type: 'run' }, { t: now, type: 'compile', p: { ok: true } }])
    expect(r.ok && r.dropped).toBe(2)
  })

  let db: Db
  beforeAll(async () => { db = await createTestDb(); await seedContent(db) })

  it('olaylar yazılır; yalnız kendi cihazının kayıtları silinir', async () => {
    const other = 'ffffffffffffffffffffffffffffffff'
    await storeEvents(db, ID, [{ t: 1_790_000_000_000, type: 'lesson_view', lessonId: 4, p: { kind: 'devre' } }, { t: 1_790_000_001_000, type: 'quiz_answer', lessonId: 4, p: { q: 'a', ok: true } }])
    await storeEvents(db, other, [{ t: 1_790_000_002_000, type: 'run' }])
    const rows = await db.select().from(events).where(eq(events.deviceId, ID))
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ type: 'lesson_view', lessonId: 4, payload: { kind: 'devre' } })
    expect(Object.keys(rows[0]).sort()).toEqual(['deviceId', 'id', 'lessonId', 'payload', 'ts', 'type']) // kişisel alan yok
    expect(await deleteDeviceEvents(db, ID)).toBe(2)
    expect(await db.select().from(events).where(eq(events.deviceId, ID))).toHaveLength(0)
    expect(await db.select().from(events).where(eq(events.deviceId, other))).toHaveLength(1)
  })

  it('seed: pilot dersler anlatım/kavram/test ve hafta rehberini yazar; diğer dersler null', async () => {
    const rows = await db.select({ pos: lessons.position, e: lessons.explainerMd, c: lessons.concepts, q: lessons.quiz, wp: weeks.position, mod: modules.slug })
      .from(lessons).innerJoin(weeks, eq(weeks.id, lessons.weekId)).innerJoin(modules, eq(modules.id, weeks.moduleId))
    const pilot = rows.filter((r) => r.mod === 'arduino-temelleri' && r.wp === 1)
    expect(pilot).toHaveLength(5)
    for (const r of pilot) { expect(r.e).toBeTruthy(); expect(r.c!.length).toBeGreaterThanOrEqual(3); expect(r.q!.length).toBeGreaterThanOrEqual(3) }
    expect(rows.filter((r) => r.q !== null).length).toBeGreaterThanOrEqual(215)
    const w = await db.select({ g: weeks.guideMd, p: weeks.position, m: modules.slug }).from(weeks).innerJoin(modules, eq(modules.id, weeks.moduleId))
    expect(w.filter((x) => x.g).length).toBeGreaterThanOrEqual(43)
    expect(w.find((x) => x.g && x.m === 'arduino-temelleri' && x.p === 1)).toBeTruthy()
    // seed tekrar çalışınca (idempotent) hata vermez ve sonuç değişmez
    await seedContent(db)
    expect((await listQuizLessons(db)).length).toBeGreaterThanOrEqual(215)
  })

  it('listQuizLessons ve resolveLessonKeys', async () => {
    const ql = await listQuizLessons(db)
    expect(ql.length).toBeGreaterThanOrEqual(215)
    expect(ql.every((l) => l.total >= 3)).toBe(true)
    expect(ql.filter((l) => l.weekLabel.includes('Arduino Temelleri')).length).toBeGreaterThanOrEqual(35)
    const r = await resolveLessonKeys(db, ['arduino-temelleri:1:3', 'arduino-temelleri:9:9', 'kötü anahtar', 'yok:1:1'])
    expect(r).toHaveLength(1)
    expect(r[0].title).toBe('İlk program: Blink')
  })
})

describe('POST/DELETE /api/events', () => {
  const ID = '00112233445566778899aabbccddeeff'
  let db: Db
  const hoisted = vi.hoisted(() => ({ db: null as unknown }))
  vi.mock('@/lib/db', () => ({ getDb: () => hoisted.db }))

  beforeEach(async () => { db = await createTestDb(); hoisted.db = db })

  const call = async (method: 'POST' | 'DELETE', body: unknown, headers: Record<string, string> = { 'content-type': 'application/json' }) => {
    const { POST, DELETE } = await import('../app/api/events/route')
    const req = new Request('http://localhost/api/events', { method, headers, body: typeof body === 'string' ? body : JSON.stringify(body) })
    return (method === 'POST' ? POST : DELETE)(req)
  }

  it('geçerli toplu gönderim 200; yazılır', async () => {
    const res = await call('POST', { deviceId: ID, events: [{ t: Date.now(), type: 'run', p: { kind: 'lab' } }] })
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ ok: true, stored: 1 })
    expect(await db.select().from(events)).toHaveLength(1)
  })
  it('JSON olmayan 415, bozuk gövde 400, büyük gövde 413', async () => {
    expect((await call('POST', 'x', { 'content-type': 'text/plain' })).status).toBe(415)
    expect((await call('POST', '{bozuk')).status).toBe(400)
    expect((await call('POST', { deviceId: ID, events: [{ t: Date.now(), type: 'run', p: { a: 'x'.repeat(40_000) } }] })).status).toBe(413)
    expect((await call('POST', { deviceId: 'kisi@mail.com', events: [{ t: Date.now(), type: 'run' }] })).status).toBe(400)
  })
  it('oran sınırı: aynı cihazdan dakikada 20 istekten sonra 429', async () => {
    const dev = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    const codes: number[] = []
    for (let i = 0; i < 22; i++) codes.push((await call('POST', { deviceId: dev, events: [{ t: Date.now() + i, type: 'run' }] })).status)
    expect(codes.slice(0, 20).every((c) => c === 200)).toBe(true)
    expect(codes.slice(20)).toEqual([429, 429])
  })
  it('DELETE cihazın kayıtlarını siler', async () => {
    const dev = 'cccccccccccccccccccccccccccccccc'
    await call('POST', { deviceId: dev, events: [{ t: Date.now(), type: 'run' }] })
    const res = await call('DELETE', { deviceId: dev })
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ ok: true, deleted: 1 })
    expect(await db.select().from(events)).toHaveLength(0)
    expect((await call('DELETE', { deviceId: 'x' })).status).toBe(400)
  })
})
