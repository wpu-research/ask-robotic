import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import { authEnabled } from '@/lib/flags'
import { getCurrentUser } from '@/lib/auth/current'
import { getCompletedLessonIds, getLessonContext, getModuleTree } from '@/lib/content'
import { MODULE_META } from '@/lib/module-meta'
import { LessonPlayer } from './lesson-player'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const n = Number((await params).id)
  const ctx = Number.isInteger(n) && n > 0 ? await getLessonContext(getDb(), n).catch(() => null) : null
  return { title: ctx?.lesson.title ?? 'Ders' }
}

export default async function Ders({ params }: { params: Promise<{ id: string }> }) {
  const lessonId = Number((await params).id)
  if (!Number.isInteger(lessonId) || lessonId <= 0) notFound()
  const db = getDb()

  const user = authEnabled() ? await getCurrentUser() : null
  if (authEnabled() && !user) redirect('/giris')

  const ctx = await getLessonContext(db, lessonId)
  if (!ctx) notFound()
  let serverDone: number[] = []
  if (user) {
    const tree = await getModuleTree(db, ctx.module.slug)
    const ids = tree?.weeks.flatMap((w) => w.lessons.map((l) => l.id)) ?? []
    serverDone = [...(await getCompletedLessonIds(db, user.id, ids))]
  }

  return (
    <LessonPlayer
      lesson={{
        id: ctx.lesson.id,
        title: ctx.lesson.title,
        durationMin: ctx.lesson.durationMin,
        problem: ctx.lesson.problem ?? '',
        contentMd: ctx.lesson.contentMd ?? '',
        question: ctx.lesson.question ?? '',
      }}
      moduleTitle={ctx.module.title}
      moduleSlug={ctx.module.slug}
      trackClass={`track-${ctx.module.track}`}
      weekLabel={`${ctx.week.position}. hafta: ${ctx.week.title}`}
      position={{ index: ctx.index, total: ctx.total }}
      prevLessonId={ctx.prev?.id ?? null}
      nextLessonId={ctx.next?.id ?? null}
      callout={MODULE_META[ctx.module.slug]?.callout}
      serverSync={!!user}
      serverDone={serverDone}
    />
  )
}
