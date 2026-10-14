import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { getLessonContext } from '@/lib/content'
import { isUuid, requireClassStaff, staffOrgs } from '@/lib/class-access'
import { requireUserPage } from '@/lib/teacher-page'
import { Presenter } from '@/components/teacher/presenter'
import { getLocale, getT } from '@/i18n/server'
import '../../../ogretmen.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('teacher.present.title') }
}
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ lessonId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

// Projeksiyon: yalnız okul personeli (cevaplar istemciye gider).
export default async function Sunum({ params, searchParams }: Props) {
  const { lessonId } = await params
  const sp = await searchParams
  const user = await requireUserPage(`/ogretmen/sunum/${lessonId}`)
  const db = getDb()
  const classId = typeof sp.sinif === 'string' && isUuid(sp.sinif) ? sp.sinif : null
  const allowed = classId ? (await requireClassStaff(db, user.id, classId)).ok : (await staffOrgs(db, user.id)).length > 0
  if (!allowed) notFound()
  const id = Number(lessonId)
  const ctx = Number.isInteger(id) && id > 0 ? await getLessonContext(db, id) : null
  if (!ctx) notFound()
  const t = await getT()
  return (
    <Presenter
      title={ctx.lesson.title}
      weekLabel={t('teacher.present.weekLabel', { module: ctx.module.title, n: ctx.week.position })}
      steps={((await getLocale()) === 'en' && ctx.lesson.stepsEn?.length ? ctx.lesson.stepsEn : ctx.lesson.steps) ?? []}
      backHref={classId ? `/ogretmen/sinif/${classId}?sekme=odevler` : '/ogretmen'}
    />
  )
}
