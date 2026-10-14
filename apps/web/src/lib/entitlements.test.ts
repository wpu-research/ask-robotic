import { describe, expect, it } from 'vitest'
import { assignmentColumns, assignmentTarget } from './assignments'
import {
  resolveAccess, scopeCovers, seatsAvailable, type AccessContext, type LessonRef, type OrgLicenseInput,
} from './entitlements'
import { istanbulDayStart } from './entitlements-db'

const now = new Date('2026-10-14T10:00:00Z')
const gun = 24 * 60 * 60 * 1000
const ogrenci = { id: 'u1', role: 'student' as const }
const ref = (lessonId: number, weekPosition = 3, moduleSlug = 'arduino-temelleri', band?: string): LessonRef =>
  ({ lessonId, moduleSlug, weekPosition, band })
const ctx = (c: Partial<AccessContext>): AccessContext => ({ user: ogrenci, now, paywall: true, ...c })
const lisans = (o: Partial<OrgLicenseInput> = {}): OrgLicenseInput => ({
  organizationId: 'org1', planId: 'school', seats: 30, scope: null, memberRole: 'student',
  startsAt: new Date(now.getTime() - 30 * gun), endsAt: new Date(now.getTime() + 30 * gun), ...o,
})

describe('paywall kapalı (bugünkü durum)', () => {
  it('misafir dahil her ders açık, öğrenci özellikleri verilir', () => {
    const a = resolveAccess({ user: null, now, paywall: false })
    expect(a.plan).toBe('guest')
    expect(a.canOpenLesson(ref(9, 7))).toEqual({ ok: true, reason: 'paywall_off' })
    expect(a.has('unlimited_lessons') && a.has('ai_tutor')).toBe(true)
    expect(a.has('teacher_dashboard')).toBe(false)
  })
  it('env verilmezse PAYWALL_ENABLED kapalı sayılır', () => {
    const old = process.env.PAYWALL_ENABLED
    delete process.env.PAYWALL_ENABLED
    expect(resolveAccess({ user: null, now }).paywall).toBe(false)
    process.env.PAYWALL_ENABLED = 'true'
    expect(resolveAccess({ user: null, now }).paywall).toBe(true)
    if (old === undefined) delete process.env.PAYWALL_ENABLED
    else process.env.PAYWALL_ENABLED = old
  })
})

describe('misafir ve ücretsiz plan', () => {
  it('misafir: ilk hafta açık, gerisi giriş ister', () => {
    const a = resolveAccess(ctx({ user: null }))
    expect(a.plan).toBe('guest')
    expect(a.canOpenLesson(ref(1, 1)).ok).toBe(true)
    expect(a.canOpenLesson(ref(2, 2))).toEqual({ ok: false, reason: 'login_required' })
    expect(a.features.size).toBe(0)
  })
  it('ilk hafta kuralı kapatılabilir', () => {
    const a = resolveAccess(ctx({ user: null, freeRules: { lessonsPerDay: 1, firstWeekOpen: false } }))
    expect(a.canOpenLesson(ref(1, 1))).toEqual({ ok: false, reason: 'login_required' })
  })
  it('ücretsiz: ilk hafta her zaman açık, sayaca bakmaz', () => {
    const a = resolveAccess(ctx({}))
    expect(a.plan).toBe('free')
    expect(a.canOpenLesson(ref(1, 1), { openedToday: [5, 6, 7] })).toEqual({ ok: true, reason: 'first_week' })
  })
  it('ücretsiz: günlük sınır, bugün açılan ders yeniden açılır', () => {
    const a = resolveAccess(ctx({}))
    expect(a.canOpenLesson(ref(10), { openedToday: [] })).toEqual({ ok: true, reason: 'free_quota', remainingToday: 0 })
    expect(a.canOpenLesson(ref(11), { openedToday: [10] })).toEqual({ ok: false, reason: 'daily_limit' })
    expect(a.canOpenLesson(ref(10), { openedToday: [10] })).toEqual({ ok: true, reason: 'already_opened' })
  })
  it('günlük sınır yapılandırılabilir', () => {
    const a = resolveAccess(ctx({ freeRules: { lessonsPerDay: 3, firstWeekOpen: true } }))
    expect(a.canOpenLesson(ref(12), { openedToday: [10, 11] }).ok).toBe(true)
    expect(a.canOpenLesson(ref(13), { openedToday: [10, 11, 12] }).ok).toBe(false)
  })
})

describe('bireysel / aile aboneliği', () => {
  const sub = (o: Partial<NonNullable<AccessContext['subscriptions']>[number]> = {}) =>
    ({ planId: 'premium' as const, status: 'active' as const, currentPeriodEnd: new Date(now.getTime() + gun), ...o })

  it('premium: sınırsız ders ve öğrenci özellikleri', () => {
    const a = resolveAccess(ctx({ subscriptions: [sub()] }))
    expect(a.plan).toBe('premium')
    expect(a.canOpenLesson(ref(99), { openedToday: [1, 2, 3] })).toEqual({ ok: true, reason: 'plan' })
    expect(a.has('ai_tutor') && a.has('no_ads') && a.has('personal_practice')).toBe(true)
    expect(a.has('teacher_dashboard')).toBe(false)
  })
  it('süresi geçmiş ya da expired abonelik ücretsize düşer', () => {
    for (const s of [sub({ currentPeriodEnd: new Date(now.getTime() - 1) }), sub({ status: 'expired' })]) {
      const a = resolveAccess(ctx({ subscriptions: [s] }))
      expect(a.plan).toBe('free')
      expect(a.canOpenLesson(ref(11), { openedToday: [10] }).ok).toBe(false)
    }
  })
  it('iptal edilen abonelik dönem sonuna kadar sürer; manual süresiz', () => {
    expect(resolveAccess(ctx({ subscriptions: [sub({ status: 'canceled' })] })).plan).toBe('premium')
    expect(resolveAccess(ctx({ subscriptions: [sub({ currentPeriodEnd: null })] })).plan).toBe('premium')
  })
  it('aile üyesi sahibin aboneliğinden yararlanır', () => {
    // Yükleyici subscription_members üzerinden üyenin aboneliğini de bağlama koyar
    const a = resolveAccess(ctx({ user: { id: 'cocuk', role: 'student' }, subscriptions: [sub({ planId: 'family' })] }))
    expect(a.plan).toBe('family')
    expect(a.has('unlimited_lessons')).toBe(true)
  })
  it('DB plans.features verilirse varsayılanın yerine geçer, bilinmeyenler atılır', () => {
    const a = resolveAccess(ctx({ subscriptions: [sub({ features: ['ai_tutor', 'uydurma'] })] }))
    expect([...a.features]).toEqual(['ai_tutor'])
    expect(a.canOpenLesson(ref(11), { openedToday: [10] }).ok).toBe(false)
  })
  it('misafire abonelik bağlamı verilse de uygulanmaz', () => {
    expect(resolveAccess(ctx({ user: null, subscriptions: [sub()] })).plan).toBe('guest')
  })
})

describe('okul lisansı', () => {
  it('kapsamsız lisans: öğrenci her derse girer, sınıf ligi açılır, öğretmen paneli yok', () => {
    const a = resolveAccess(ctx({ orgLicenses: [lisans()] }))
    expect(a.plan).toBe('school')
    expect(a.canOpenLesson(ref(50, 9))).toEqual({ ok: true, reason: 'plan' })
    expect(a.has('class_leagues')).toBe(true)
    expect(a.has('teacher_dashboard')).toBe(false)
  })
  it('kapsamlı lisans: kapsam içi açık, dışı ücretsiz kurala düşer', () => {
    const a = resolveAccess(ctx({ orgLicenses: [lisans({ scope: { modules: ['arduino-temelleri'], bands: ['kasifler'] } })] }))
    expect(a.has('unlimited_lessons')).toBe(false)
    expect(a.canOpenLesson(ref(50, 9))).toEqual({ ok: true, reason: 'license' })
    expect(a.canOpenLesson(ref(51, 4, 'scratch', 'kasifler'))).toEqual({ ok: true, reason: 'license' })
    expect(a.canOpenLesson(ref(52, 4, 'robotik'), { openedToday: [1] })).toEqual({ ok: false, reason: 'daily_limit' })
    expect(a.canOpenLesson(ref(53, 1, 'robotik')).ok).toBe(true)
  })
  it('süresi dolmuş ya da başlamamış lisans erişim vermez', () => {
    for (const l of [
      lisans({ endsAt: new Date(now.getTime() - 1) }),
      lisans({ startsAt: new Date(now.getTime() + gun) }),
    ]) {
      const a = resolveAccess(ctx({ orgLicenses: [l] }))
      expect(a.plan).toBe('free')
      expect(a.canOpenLesson(ref(11), { openedToday: [10] }).ok).toBe(false)
    }
  })
  it('öğretmen ve yönetici öğretmen paneli alır; lisans bitince almaz', () => {
    const ogretmen = { id: 't1', role: 'teacher' as const }
    expect(resolveAccess(ctx({ user: ogretmen, orgLicenses: [lisans({ memberRole: 'teacher' })] })).has('teacher_dashboard')).toBe(true)
    expect(resolveAccess(ctx({ user: ogretmen, orgLicenses: [lisans({ memberRole: 'admin' })] })).has('teacher_dashboard')).toBe(true)
    expect(resolveAccess(ctx({ user: ogretmen, orgLicenses: [lisans({ memberRole: 'teacher', endsAt: now })] })).has('teacher_dashboard')).toBe(false)
  })
  it('kurumdaki veli içerik lisansı almaz', () => {
    const a = resolveAccess(ctx({ user: { id: 'p', role: 'parent' }, orgLicenses: [lisans({ memberRole: 'parent' })] }))
    expect(a.plan).toBe('free')
    expect(a.features.size).toBe(0)
  })
  it('okul + premium birlikte: plan en yüksek kaynak, özellikler birleşir', () => {
    const a = resolveAccess(ctx({
      orgLicenses: [lisans({ scope: { modules: ['scratch'] } })],
      subscriptions: [{ planId: 'premium', status: 'active', currentPeriodEnd: null }],
    }))
    expect(a.plan).toBe('school')
    expect(a.canOpenLesson(ref(70, 5, 'robotik'))).toEqual({ ok: true, reason: 'plan' })
  })
})

describe('yardımcılar', () => {
  it('scopeCovers: null ve boş kapsam her şeyi kapsar, bandı bilinmeyen ders bantla açılmaz', () => {
    expect(scopeCovers(null, { moduleSlug: 'x' })).toBe(true)
    expect(scopeCovers({}, { moduleSlug: 'x' })).toBe(true)
    expect(scopeCovers({ bands: ['kasifler'] }, { moduleSlug: 'x' })).toBe(false)
  })
  it('seatsAvailable negatife düşmez', () => {
    expect(seatsAvailable(30, 28)).toBe(2)
    expect(seatsAvailable(30, 31)).toBe(0)
  })
  it('istanbulDayStart: TR gece yarısı = 21:00 UTC', () => {
    expect(istanbulDayStart(new Date('2026-10-14T10:00:00Z')).toISOString()).toBe('2026-10-13T21:00:00.000Z')
    expect(istanbulDayStart(new Date('2026-10-14T22:30:00Z')).toISOString()).toBe('2026-10-14T21:00:00.000Z')
  })
  it('ödev hedefi tam olarak bir tane olmalı', () => {
    expect(assignmentTarget({ lessonId: 5 })).toEqual({ lessonId: 5 })
    expect(assignmentTarget({ weekId: 2, moduleId: null })).toEqual({ weekId: 2 })
    expect(assignmentTarget({})).toBeNull()
    expect(assignmentTarget({ lessonId: 5, weekId: 2 })).toBeNull()
    expect(assignmentTarget({ moduleId: 0 })).toBeNull()
    expect(assignmentColumns({ weekId: 2 })).toEqual({ lessonId: null, weekId: 2, moduleId: null })
  })
})

describe('ücretsiz plan: önceden açılmış ders', () => {
  it('kota dolsa da daha önce açılan ders açık kalır', () => {
    const prev = process.env.PAYWALL_ENABLED
    process.env.PAYWALL_ENABLED = 'true'
    try {
      const a = resolveAccess({ user: { id: 'u', role: 'student' }, now: new Date('2026-10-14T10:00:00Z') })
      const ref = { lessonId: 7, moduleSlug: 'arduino-temelleri', weekPosition: 3 }
      expect(a.canOpenLesson(ref, { openedToday: [9] }).ok).toBe(false)
      expect(a.canOpenLesson(ref, { openedToday: [9], openedBefore: [7, 9] })).toMatchObject({ ok: true, reason: 'already_opened' })
    } finally { if (prev === undefined) delete process.env.PAYWALL_ENABLED; else process.env.PAYWALL_ENABLED = prev }
  })
})
