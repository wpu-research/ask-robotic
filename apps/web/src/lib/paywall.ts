// Ders sayfası paywall kararı. PAYWALL_ENABLED kapalıyken DB'ye hiç gitmez, her ders açık.
// Açıkken: resolveAccess (entitlements) → kilitliyse paywall ekranı; ücretsiz kotayla açıldıysa giriş yapmış kullanıcı
// için progress satırı ('started', started_at) yazılır — günlük sayaç bu satırdan sayılır.
import { progress, type Db } from '@ask/db'
import { paywallEnabled, resolveAccess, type AccessPlan, type LessonDecision } from './entitlements'
import { loadAccessContext, loadLessonRef, loadLessonUsage } from './entitlements-db'
import { trialUsed } from './billing'

export type LockReason = 'login_required' | 'daily_limit'

export interface LessonGate {
  decision: LessonDecision
  plan: AccessPlan
  /** Giriş yapmış ve denemesini kullanmamış */
  trialAvailable: boolean
}

/** Ders açılışını kaydeder; satır zaten varsa (açılmış ya da tamamlanmış) dokunmaz. */
export async function recordLessonOpen(db: Db, userId: string, lessonId: number, now = new Date()) {
  await db.insert(progress).values({ userId, lessonId, status: 'started', startedAt: now })
    .onConflictDoNothing({ target: [progress.userId, progress.lessonId] })
}

export async function checkLessonAccess(
  db: Db, userId: string | null | undefined, lessonId: number,
  opts: { now?: Date; paywall?: boolean } = {},
): Promise<LessonGate> {
  const now = opts.now ?? new Date()
  const paywall = opts.paywall ?? paywallEnabled()
  if (!paywall) return { decision: { ok: true, reason: 'paywall_off' }, plan: userId ? 'free' : 'guest', trialAvailable: false }

  const ctx = await loadAccessContext(db, userId)
  const access = resolveAccess({ ...ctx, now, paywall: true })
  const ref = await loadLessonRef(db, lessonId)
  if (!ref) return { decision: { ok: true, reason: 'plan' }, plan: access.plan, trialAvailable: false } // ders yok → sayfa 404 verir
  const uid = ctx.user?.id
  const usage = uid ? await loadLessonUsage(db, uid, now) : undefined
  const decision = access.canOpenLesson(ref, usage)
  // Yalnız ücretsiz kotayla açılışlar yazılır. Plan/lisansla açılanlar yazılsaydı, deneme bitince o dersler
  // (started_at eski güne düştüğü için) günlük hakka hiç sayılmadan sonsuza dek açık kalırdı.
  // Not: daha önce açılmış bir ders sonraki günlerde yeniden açılınca günlük hakkı tüketmez (ilk açılış sayılır).
  if (uid && decision.ok && (decision.reason === 'free_quota' || decision.reason === 'first_week')) {
    await recordLessonOpen(db, uid, lessonId, now)
  }
  const trialAvailable = !!uid && !decision.ok && !(await trialUsed(db, uid))
  return { decision, plan: access.plan, trialAvailable }
}

export interface PaywallCopy {
  title: string
  lead: string
  primary: { label: string; action: 'trial' | 'register' | 'plans' }
  secondary: { label: string; href: string }
  /** "Yarın tekrar gel" notu */
  comeBack: boolean
}

/** Kilit nedenine göre paywall metni (saf; testli). */
export function paywallCopy(reason: LockReason, o: { loggedIn: boolean; trialAvailable: boolean }): PaywallCopy {
  const primary: PaywallCopy['primary'] = !o.loggedIn
    ? { label: '7 gün ücretsiz dene', action: 'register' }
    : o.trialAvailable ? { label: '7 gün ücretsiz dene', action: 'trial' } : { label: 'Planları gör', action: 'plans' }
  const secondary = primary.action === 'plans' ? { label: 'Ana sayfaya dön', href: '/' } : { label: 'Planları gör', href: '/fiyatlar' }
  if (reason === 'daily_limit') {
    return {
      title: 'Bugünkü ücretsiz dersini kullandın',
      lead: 'Ücretsiz planda her gün 1 yeni ders açılır. Premium ile dilediğin kadar ders, Robi AI öğretmen ve kişisel pratik seni bekliyor.',
      primary, secondary, comeBack: true,
    }
  }
  return {
    title: 'Bu ders Premium\'da',
    lead: o.loggedIn
      ? 'Her modülün ilk haftası herkese açık. Devamı için Premium\'u 7 gün ücretsiz dene.'
      : 'Her modülün ilk haftası herkese açık. Devam etmek için ücretsiz hesap aç: her gün 1 yeni ders senin, Premium\'la sınırsız.',
    primary, secondary, comeBack: false,
  }
}
