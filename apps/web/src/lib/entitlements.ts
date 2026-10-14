// Tek yetki (entitlement) sistemi: okul lisansı + bireysel/aile aboneliği + ücretsiz plan aynı fonksiyondan geçer.
// Saf mantık; DB erişimi yok. Bağlamı entitlements-db.ts (loadAccessContext) toplar. Ayrıntı: docs/altyapi-okul-uyelik.md
//
// PAYWALL_ENABLED (env, varsayılan kapalı): kapalıyken her ders herkese açık ve öğrenci özellikleri herkese verilir.
// Bugün ürün böyle çalışıyor; aşağıdaki kurallar yalnız PAYWALL_ENABLED=true olduğunda kısıtlar.
import type { LicenseScope } from '@ask/db'

export type PlanId = 'free' | 'premium' | 'family' | 'school'
export type AccessPlan = 'guest' | PlanId

export const FEATURES = ['unlimited_lessons', 'ai_tutor', 'personal_practice', 'no_ads', 'teacher_dashboard', 'class_leagues'] as const
export type Feature = (typeof FEATURES)[number]

/** Paywall kapalıyken herkese açılan öğrenci özellikleri (öğretmen paneli/ligler rol ve okul üyeliğine bağlı kalır). */
const LEARNER_FEATURES: Feature[] = ['unlimited_lessons', 'ai_tutor', 'personal_practice', 'no_ads']

/** DB'deki plans.features ile aynı (0003 migrasyonu); bağlamda features gelmezse bunlar kullanılır. */
export const DEFAULT_PLAN_FEATURES: Record<PlanId, Feature[]> = {
  free: [],
  premium: LEARNER_FEATURES,
  family: LEARNER_FEATURES,
  school: [...LEARNER_FEATURES, 'class_leagues'],
}

const PLAN_RANK: Record<AccessPlan, number> = { guest: 0, free: 1, premium: 2, family: 3, school: 4 }

export const paywallEnabled = () => process.env.PAYWALL_ENABLED === 'true'

export interface FreeRules {
  /** Ücretsiz planda günde açılabilecek yeni ders sayısı (ilk hafta hariç) */
  lessonsPerDay: number
  /** Her modülün 1. haftası herkese (misafir dahil) açık mı */
  firstWeekOpen: boolean
}
export const DEFAULT_FREE_RULES: FreeRules = { lessonsPerDay: 1, firstWeekOpen: true }

export interface AccessUser {
  id: string
  role: 'student' | 'parent' | 'teacher' | 'admin'
}

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired'

export interface SubscriptionInput {
  planId: PlanId
  status: SubscriptionStatus
  /** null = süresiz (yalnız 'manual') */
  currentPeriodEnd: Date | null
  /** plans.features; yoksa DEFAULT_PLAN_FEATURES */
  features?: readonly string[]
}

export interface OrgLicenseInput {
  organizationId: string
  planId: PlanId
  seats: number
  startsAt: Date
  endsAt: Date
  scope: LicenseScope | null
  /** Kullanıcının bu kurumdaki rolü (organization_members ya da sınıf üyeliğinden türetilir) */
  memberRole: 'owner' | 'admin' | 'teacher' | 'student' | 'parent'
  features?: readonly string[]
}

export interface AccessContext {
  /** null = misafir (giriş yok) */
  user: AccessUser | null
  orgLicenses?: OrgLicenseInput[]
  /** Kullanıcının sahibi ya da üyesi olduğu abonelikler (aile üyeliği dahil) */
  subscriptions?: SubscriptionInput[]
  now?: Date
  freeRules?: FreeRules
  /** Verilmezse PAYWALL_ENABLED env'inden okunur */
  paywall?: boolean
}

/** Erişimi sorulan ders. band: modülün yaş bandı anahtarı (lisans kapsamı bantla verilmişse gerekir). */
export interface LessonRef {
  lessonId: number
  moduleSlug: string
  /** 1'den başlar */
  weekPosition: number
  band?: string
}

/** Bugün (Europe/Istanbul günü) açılmış, ilk hafta dışındaki dersler. Sayım çağıranın işi (bkz. loadLessonUsage). */
export interface LessonUsage {
  openedToday: readonly number[]
  /** Daha önce (herhangi bir gün) açılmış ya da bitirilmiş dersler: kota bir kez harcanır, ders sonra hep açık kalır. */
  openedBefore?: readonly number[]
}

export type LessonDecision =
  | { ok: true; reason: 'paywall_off' | 'plan' | 'license' | 'first_week' | 'already_opened' | 'free_quota'; remainingToday?: number }
  | { ok: false; reason: 'login_required' | 'daily_limit' }

export interface Access {
  plan: AccessPlan
  features: ReadonlySet<Feature>
  paywall: boolean
  has(f: Feature): boolean
  canOpenLesson(ref: LessonRef, usage?: LessonUsage): LessonDecision
}

const ACTIVE_SUB: ReadonlySet<SubscriptionStatus> = new Set(['trialing', 'active', 'past_due', 'canceled'])

/**
 * Abonelik etkin mi: 'expired' hiçbir zaman; diğerleri dönem sonuna kadar.
 * 'canceled' = yenileme kapatıldı, ödenen dönem bitene kadar sürer; 'past_due' = ödeme denemesi sürerken tanınan süre.
 */
export function subscriptionActive(s: SubscriptionInput, now: Date): boolean {
  return ACTIVE_SUB.has(s.status) && (s.currentPeriodEnd === null || s.currentPeriodEnd > now)
}

export const licenseActive = (l: Pick<OrgLicenseInput, 'startsAt' | 'endsAt'>, now: Date) => l.startsAt <= now && now < l.endsAt

const unscoped = (scope: LicenseScope | null) => !scope || (!scope.modules?.length && !scope.bands?.length)

/** Kapsam null ya da iki eksen de boşsa sınır yok; aksi halde modül ya da bant eşleşmeli (bandı bilinmeyen ders bantla açılmaz). */
export function scopeCovers(scope: LicenseScope | null, ref: Pick<LessonRef, 'moduleSlug' | 'band'>): boolean {
  if (!scope || unscoped(scope)) return true
  return (scope.modules ?? []).includes(ref.moduleSlug) || (!!ref.band && (scope.bands ?? []).includes(ref.band))
}

/** Koltuk sayımı erişim anında değil, sınıfa/kuruma öğrenci eklenirken yapılır. */
export const seatsAvailable = (seats: number, usedSeats: number) => Math.max(0, seats - usedSeats)

const isFeature = (f: string): f is Feature => (FEATURES as readonly string[]).includes(f)
const featuresOf = (planId: PlanId, list?: readonly string[]): Feature[] => (list ? list.filter(isFeature) : DEFAULT_PLAN_FEATURES[planId])

// Lisanstan ders erişimi alan roller; veli kurum üyesi olsa da içerik lisansı almaz
const LICENSED_ROLES = new Set<OrgLicenseInput['memberRole']>(['owner', 'admin', 'teacher', 'student'])
const STAFF_ROLES = new Set<OrgLicenseInput['memberRole']>(['owner', 'admin', 'teacher'])

export function resolveAccess(ctx: AccessContext): Access {
  const now = ctx.now ?? new Date()
  const rules = ctx.freeRules ?? DEFAULT_FREE_RULES
  const paywall = ctx.paywall ?? paywallEnabled()
  const user = ctx.user

  let plan: AccessPlan = user ? 'free' : 'guest'
  const features = new Set<Feature>()
  const bump = (p: AccessPlan) => { if (PLAN_RANK[p] > PLAN_RANK[plan]) plan = p }

  // Kapsamsız sınırsız erişim (abonelik ya da kapsamı null okul lisansı)
  let unlimited = false
  const scopedLicenses: OrgLicenseInput[] = []

  if (user) {
    for (const s of ctx.subscriptions ?? []) {
      if (!subscriptionActive(s, now)) continue
      bump(s.planId)
      const fs = featuresOf(s.planId, s.features)
      for (const f of fs) features.add(f)
      if (fs.includes('unlimited_lessons')) unlimited = true
    }
    for (const l of ctx.orgLicenses ?? []) {
      if (!licenseActive(l, now)) continue
      // Öğretmen paneli yalnız etkin lisanslı kurumun personeline
      if (STAFF_ROLES.has(l.memberRole)) features.add('teacher_dashboard')
      if (!LICENSED_ROLES.has(l.memberRole)) continue
      bump(l.planId)
      const fs = featuresOf(l.planId, l.features)
      for (const f of fs) if (f !== 'unlimited_lessons') features.add(f)
      if (fs.includes('unlimited_lessons')) {
        if (unscoped(l.scope)) unlimited = true
        else scopedLicenses.push(l)
      }
    }
    if (unlimited) features.add('unlimited_lessons')
  }

  if (!paywall) for (const f of LEARNER_FEATURES) features.add(f)

  const canOpenLesson = (ref: LessonRef, usage?: LessonUsage): LessonDecision => {
    if (!paywall) return { ok: true, reason: 'paywall_off' }
    if (unlimited) return { ok: true, reason: 'plan' }
    if (scopedLicenses.some((l) => scopeCovers(l.scope, ref))) return { ok: true, reason: 'license' }
    if (rules.firstWeekOpen && ref.weekPosition === 1) return { ok: true, reason: 'first_week' }
    if (!user) return { ok: false, reason: 'login_required' }
    const opened = usage?.openedToday ?? []
    if (opened.includes(ref.lessonId) || usage?.openedBefore?.includes(ref.lessonId)) return { ok: true, reason: 'already_opened' }
    if (opened.length < rules.lessonsPerDay) {
      return { ok: true, reason: 'free_quota', remainingToday: rules.lessonsPerDay - opened.length - 1 }
    }
    return { ok: false, reason: 'daily_limit' }
  }

  return { plan, features, paywall, has: (f) => features.has(f), canOpenLesson }
}
