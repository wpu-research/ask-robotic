import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { authEnabled } from '@/lib/flags'
import { getCurrentUser } from '@/lib/auth/current'
import { getCompletedLessonIds, getLessonContext, getModuleTree } from '@/lib/content'
import { activityKey } from '@/lib/jr/activity'
import { LessonPlayer } from './lesson-player'
import { LessonV2Player } from '@/components/lesson-v2/lesson-v2-player'
import { Paywall } from '@/components/paywall/paywall'
import { checkLessonAccess } from '@/lib/paywall'
import { paywallEnabled } from '@/lib/entitlements'
import { getLocale, getT } from '@/i18n/server'
import { moduleCallout, moduleTitle, weekTitle } from '@/lib/catalog-en'
import { lessonTitle } from '@/lib/lesson-titles-en'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const n = Number((await params).id)
  const ctx = Number.isInteger(n) && n > 0 ? await getLessonContext(getDb(), n).catch(() => null) : null
  if (!ctx) return { title: (await getT())('common.lessonFallbackTitle') }
  return { title: lessonTitle(ctx.module.slug, ctx.week.position, ctx.lesson.position, ctx.lesson.title, await getLocale()) }
}

export default async function Ders({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ klasik?: string }> }) {
  const lessonId = Number((await params).id)
  const classic = (await searchParams).klasik === '1'
  if (!Number.isInteger(lessonId) || lessonId <= 0) notFound()
  const db = getDb()

  // Misafir de öğrenebilir: giriş zorunlu değil (ilerleme yalnız tarayıcıda tutulur). Paywall açıkken oturum okunur.
  const user = authEnabled() || paywallEnabled() ? await getCurrentUser() : null

  const ctx = await getLessonContext(db, lessonId)
  if (!ctx) notFound()

  // PAYWALL_ENABLED=true ise yetki kontrolü; açılan ders giriş yapmış kullanıcı için progress'e 'started' yazılır
  if (paywallEnabled()) {
    const gate = await checkLessonAccess(db, user?.id, lessonId)
    if (!gate.decision.ok) {
      return <Paywall reason={gate.decision.reason} loggedIn={!!user} trialAvailable={gate.trialAvailable} lessonTitle={lessonTitle(ctx.module.slug, ctx.week.position, ctx.lesson.position, ctx.lesson.title, await getLocale())} />
    }
  }
  const tree = await getModuleTree(db, ctx.module.slug)
  const ids = tree?.weeks.flatMap((w) => w.lessons.map((l) => l.id)) ?? []
  let serverDone: number[] = []
  if (user) serverDone = [...(await getCompletedLessonIds(db, user.id, ids))]

  const key = activityKey(ctx.module.slug, ctx.week.position, ctx.lesson.position)
  const locale = await getLocale()
  const t = await getT()
  // Başlık, modül ve hafta adı dile göre (lib/lesson-titles-en.ts, lib/catalog-en.ts); ders gövdesi Türkçe kalabilir
  const slug = ctx.module.slug
  const weekPosOf = new Map(tree?.weeks.map((w) => [w.id, w.position]) ?? [])
  const titleOf = (l: { title: string; weekId: number; position: number } | null) =>
    l ? lessonTitle(slug, weekPosOf.get(l.weekId) ?? 0, l.position, l.title, locale) : null
  const title = lessonTitle(slug, ctx.week.position, ctx.lesson.position, ctx.lesson.title, locale)
  const modTitle = moduleTitle(slug, ctx.module.title, locale)
  const wkTitle = weekTitle(slug, ctx.week.position, ctx.week.title, locale)
  // Arayüz İngilizceyse ve dersin İngilizcesi varsa onu; yoksa Türkçe adımlar + küçük not
  const english = locale === 'en' && !!ctx.lesson.stepsEn?.length
  // Klasik dersin İngilizcesi (content_en): arayüz İngilizceyse ve çeviri varsa
  const en = locale === 'en' ? ctx.lesson.contentEn ?? null : null
  const steps = english ? ctx.lesson.stepsEn : ctx.lesson.steps
  if (steps?.length && !classic) {
    return (
      <LessonV2Player
        lesson={{ id: ctx.lesson.id, title, steps }}
        notice={locale === 'en' && !english ? t('common.lessonOnlyTurkish') : undefined}
        moduleSlug={ctx.module.slug}
        moduleTitle={modTitle}
        weekLabel={t('common.weekLabel', { n: ctx.week.position, title: wkTitle })}
        nextLessonId={ctx.next?.id ?? null}
        nextTitle={titleOf(ctx.next)}
        activityKey={key}
        serverSync={!!user}
        classicHref={`/ders/${ctx.lesson.id}?klasik=1`}
      />
    )
  }

  return (
    <>
      {locale === 'en' && !en && <p className="lesson-lang-note" role="note">{t('common.lessonOnlyTurkish')}</p>}
      <LessonPlayer
        lesson={{
          id: ctx.lesson.id,
          title,
          durationMin: ctx.lesson.durationMin,
          problem: (en ?? ctx.lesson).problem ?? '',
          contentMd: (en ?? ctx.lesson).contentMd ?? '',
          question: (en ?? ctx.lesson).question ?? '',
          explainerMd: en ? (en.explainerMd ?? null) : (ctx.lesson.explainerMd ?? null),
          concepts: en ? (en.concepts ?? null) : (ctx.lesson.concepts ?? null),
          quiz: en ? (en.quiz ?? null) : (ctx.lesson.quiz ?? null),
        }}
        moduleTitle={modTitle}
        moduleSlug={ctx.module.slug}
        trackClass={`track-${ctx.module.track}`}
        weekLabel={t('common.weekLabelClassic', { n: ctx.week.position, title: wkTitle })}
        position={{ index: ctx.index, total: ctx.total }}
        prevLessonId={ctx.prev?.id ?? null}
        nextLessonId={ctx.next?.id ?? null}
        prevTitle={titleOf(ctx.prev)}
        nextTitle={titleOf(ctx.next)}
        moduleLessonIds={ids}
        activityKey={key}
        callout={moduleCallout(ctx.module.slug, locale)}
        serverSync={!!user}
        serverDone={serverDone}
      />
    </>
  )
}
