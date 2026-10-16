// Mac'in DB katmanı: ders/adım yükleme (istemciye güvenilmez), yetki, günlük sayım ve sohbet kaydı.
import { and, eq, lessons, modules, sql, tutorMessages, users, weeks, type Db, type LessonStep } from '@ask/db'
import { loadAccessContext } from '@/lib/entitlements-db'
import { resolveAccess } from '@/lib/entitlements'
import { aiTutorAllowedForUser } from '@/lib/org-settings'
import { dayStart } from './limits'
import { getLessonContext, getModuleTree } from '@/lib/content'
import { guideBySlug } from '@/lib/parca-rehberi'
import { routeForPath, type PageSource } from './page-context'

export interface TutorLessonRow { id: number; title: string; moduleTitle: string; minAge: number | null; steps: LessonStep[]; stepsEn?: LessonStep[] | null }

/** Yayındaki dersi adımlarıyla yükler; adımı yoksa null. */
export async function loadTutorLesson(db: Db, lessonId: number): Promise<TutorLessonRow | null> {
  const [row] = await db
    .select({ id: lessons.id, title: lessons.title, steps: lessons.steps, stepsEn: lessons.stepsEn, moduleTitle: modules.title, minAge: modules.minAge })
    .from(lessons)
    .innerJoin(weeks, eq(weeks.id, lessons.weekId))
    .innerJoin(modules, eq(modules.id, weeks.moduleId))
    .where(and(eq(lessons.id, lessonId), eq(modules.published, true)))
    .limit(1)
  if (!row?.steps?.length) return null
  return { ...row, steps: row.steps }
}

/** Sayfa yolundan Mac bağlamı: ders/parça/kurs içeriği sunucuda yüklenir; bulunamazsa genel bölüm. */
export async function loadPageSource(db: Db, path: string, loggedIn: boolean): Promise<PageSource> {
  const r = routeForPath(path, loggedIn)
  if (r.kind === 'lesson') {
    const ctx = await getLessonContext(db, r.id)
    if (ctx) {
      const l = ctx.lesson
      return { kind: 'lesson', lessonId: l.id, title: l.title, moduleTitle: ctx.module.title, weekTitle: ctx.week.title, minAge: ctx.module.minAge, problem: l.problem, contentMd: l.contentMd, explainerMd: l.explainerMd, question: l.question }
    }
    return { kind: 'section', key: 'courses' }
  }
  if (r.kind === 'part') {
    const g = guideBySlug(r.slug)
    return g ? { kind: 'part', ...g } : { kind: 'section', key: 'parts' }
  }
  if (r.kind === 'module') {
    const tree = await getModuleTree(db, r.slug)
    return tree ? { kind: 'module', title: tree.module.title, minAge: tree.module.minAge, weeks: tree.weeks.map((w) => w.title) } : { kind: 'section', key: 'courses' }
  }
  return r
}

/** Kullanıcının dil/yaş bilgisi (doğum yılı → yaş). */
export async function loadTutorUser(db: Db, userId: string, now = new Date()): Promise<{ age: number | null; locale: string }> {
  const [u] = await db.select({ birthYear: users.birthYear, locale: users.locale }).from(users).where(eq(users.id, userId)).limit(1)
  return { age: u?.birthYear ? now.getUTCFullYear() - u.birthYear : null, locale: u?.locale ?? 'tr' }
}

export type TutorGate = { ok: true } | { ok: false; reason: 'org_disabled' | 'not_entitled' }

/** Kurum ayarı (okul kapattıysa hayır) + yetki ('ai_tutor' özelliği). Misafir: yalnız paywall kapalıyken. */
export async function tutorGate(db: Db, userId: string | null): Promise<TutorGate> {
  if (userId && !(await aiTutorAllowedForUser(db, userId))) return { ok: false, reason: 'org_disabled' }
  const access = resolveAccess(await loadAccessContext(db, userId))
  return access.has('ai_tutor') ? { ok: true } : { ok: false, reason: 'not_entitled' }
}

/** Kullanıcının bugün (Türkiye günü) gönderdiği mesaj sayısı. */
export async function countUserMessagesToday(db: Db, userId: string, now = new Date()): Promise<number> {
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(tutorMessages)
    .where(and(eq(tutorMessages.userId, userId), eq(tutorMessages.role, 'user'), sql`${tutorMessages.createdAt} >= ${dayStart(now).toISOString()}`))
  return Number(r?.n ?? 0)
}

export interface SaveInput {
  userId: string | null
  deviceId: string | null
  /** Ders oynatıcısı ya da ders sayfasındaki sohbette ders; diğer sayfalarda null. */
  lessonId: number | null
  question: string
  answer: string
  /** 'refusal' | 'error' | null */
  flag: string | null
}

/** Öğrenci sorusu + Mac cevabı. Ret durumunda iki satır da işaretlenir. */
export async function saveTutorExchange(db: Db, s: SaveInput) {
  // KVKK: girişsiz (anonim) sohbetler saklanmaz; yalnız hesaplı öğrencinin kaydı öğretmen/veli görsün diye tutulur
  if (!s.userId) return
  const base = { userId: s.userId, deviceId: s.userId ? null : s.deviceId, lessonId: s.lessonId, flag: s.flag }
  await db.insert(tutorMessages).values([
    { ...base, role: 'user', content: s.question },
    { ...base, role: 'assistant', content: s.answer },
  ])
}
