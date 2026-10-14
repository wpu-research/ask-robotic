import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { authEnabled } from '@/lib/flags'
import { getCurrentUser } from '@/lib/auth/current'
import { getCompletedLessonIds, getLessonContext, getModuleTree } from '@/lib/content'
import { activityKey } from '@/lib/jr/activity'
import { MODULE_META } from '@/lib/module-meta'
import { LessonPlayer } from './lesson-player'
import { LessonV2Player } from '@/components/lesson-v2/lesson-v2-player'
import { Paywall } from '@/components/paywall/paywall'
import { checkLessonAccess } from '@/lib/paywall'
import { paywallEnabled } from '@/lib/entitlements'
import { getLocale, getT } from '@/i18n/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const n = Number((await params).id)
  const ctx = Number.isInteger(n) && n > 0 ? await getLessonContext(getDb(), n).catch(() => null) : null
  return { title: ctx?.lesson.title ?? (await getT())('common.lessonFallbackTitle') }
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
      return <Paywall reason={gate.decision.reason} loggedIn={!!user} trialAvailable={gate.trialAvailable} lessonTitle={ctx.lesson.title} />
    }
  }
  const tree = await getModuleTree(db, ctx.module.slug)
  const ids = tree?.weeks.flatMap((w) => w.lessons.map((l) => l.id)) ?? []
  let serverDone: number[] = []
  if (user) serverDone = [...(await getCompletedLessonIds(db, user.id, ids))]

  const key = activityKey(ctx.module.slug, ctx.week.position, ctx.lesson.position)
  const locale = await getLocale()
  const t = await getT()
  // Arayüz İngilizceyse ve dersin İngilizcesi varsa onu; yoksa Türkçe adımlar + küçük not
  const english = locale === 'en' && !!ctx.lesson.stepsEn?.length
  const steps = english ? ctx.lesson.stepsEn : ctx.lesson.steps
  if (steps?.length && !classic) {
    return (
      <LessonV2Player
        lesson={{ id: ctx.lesson.id, title: ctx.lesson.title, steps }}
        notice={locale === 'en' && !english ? t('common.lessonOnlyTurkish') : undefined}
        moduleSlug={ctx.module.slug}
        moduleTitle={ctx.module.title}
        weekLabel={t('common.weekLabel', { n: ctx.week.position, title: ctx.week.title })}
        nextLessonId={ctx.next?.id ?? null}
        nextTitle={ctx.next?.title ?? null}
        activityKey={key}
        serverSync={!!user}
        classicHref={`/ders/${ctx.lesson.id}?klasik=1`}
      />
    )
  }

  return (
    <>
      {locale === 'en' && <p className="lesson-lang-note" role="note">{t('common.lessonOnlyTurkish')}</p>}
      <LessonPlayer
        lesson={{
          id: ctx.lesson.id,
          title: ctx.lesson.title,
          durationMin: ctx.lesson.durationMin,
          problem: ctx.lesson.problem ?? '',
          contentMd: ctx.lesson.contentMd ?? '',
          question: ctx.lesson.question ?? '',
          explainerMd: ctx.lesson.explainerMd ?? null,
          concepts: ctx.lesson.concepts ?? null,
          quiz: ctx.lesson.quiz ?? null,
        }}
        moduleTitle={ctx.module.title}
        moduleSlug={ctx.module.slug}
        trackClass={`track-${ctx.module.track}`}
        weekLabel={t('common.weekLabelClassic', { n: ctx.week.position, title: ctx.week.title })}
        position={{ index: ctx.index, total: ctx.total }}
        prevLessonId={ctx.prev?.id ?? null}
        nextLessonId={ctx.next?.id ?? null}
        prevTitle={ctx.prev?.title ?? null}
        nextTitle={ctx.next?.title ?? null}
        moduleLessonIds={ids}
        activityKey={key}
        callout={MODULE_META[ctx.module.slug]?.callout}
        serverSync={!!user}
        serverDone={serverDone}
      />
    </>
  )
}
