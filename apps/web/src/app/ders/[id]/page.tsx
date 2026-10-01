import { notFound, redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/current'
import { getCompletedLessonIds, getLessonContext } from '@/lib/content'
import { LessonPlayer } from './lesson-player'

export const dynamic = 'force-dynamic'

export default async function Ders({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lessonId = Number(id)
  if (!Number.isInteger(lessonId) || lessonId <= 0) notFound()
  const user = await getCurrentUser()
  if (!user) redirect('/giris')
  const db = getDb()
  const ctx = await getLessonContext(db, lessonId)
  if (!ctx) notFound()
  const done = (await getCompletedLessonIds(db, user.id, [lessonId])).has(lessonId)

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
      weekLabel={`${ctx.week.position}. Hafta: ${ctx.week.title}`}
      position={{ index: ctx.index, total: ctx.total }}
      nextLessonId={ctx.next?.id ?? null}
      alreadyDone={done}
    />
  )
}
