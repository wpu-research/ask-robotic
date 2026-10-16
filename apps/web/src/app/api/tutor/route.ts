import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/current'
import { isJson } from '@/lib/auth/http'
import { rateLimited } from '@/lib/auth/rate-limit'
import { streamTutor, tutorEnabled, tutorErrorInfo, type TutorResult } from '@/lib/tutor/claude'
import { GUEST_DAILY, GUEST_IP_DAILY, refundDaily, takeDaily, USER_DAILY } from '@/lib/tutor/limits'
import { ageBandFor, buildTutorContext } from '@/lib/tutor/prompt'
import { REPLACE, TUTOR_TEXTS } from '@/lib/tutor/protocol'
import { MAX_BODY_BYTES, parseTutorRequest } from '@/lib/tutor/request'
import { countUserMessagesToday, loadPageSource, loadTutorLesson, loadTutorUser, saveTutorExchange, tutorGate } from '@/lib/tutor/server'
import { buildPageContext, ROBI_PAGE_SYSTEM, type PageSource } from '@/lib/tutor/page-context'
import { TUTOR_SYSTEM } from '@/lib/tutor/prompt'

// Mac: AI öğretmen. İki kip: ders oynatıcısında adım bağlamı (lessonId/stepIndex) ya da her sayfada sayfa bağlamı (page).
// Yanıt düz metin akışıdır (text/plain); sözleşme: lib/tutor/protocol.ts.
// Ayrıntı: lib/tutor/*. Adım verisi her zaman DB'den yüklenir; istemciden yalnız kimlik ve öğrencinin durumu gelir.
export const dynamic = 'force-dynamic'

const ipOf = (req: Request) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
const json = (body: unknown, status: number, headers?: Record<string, string>) => Response.json(body, { status, headers })

export async function POST(req: Request) {
  if (!tutorEnabled()) return json({ error: 'tutor_disabled' }, 503)
  if (!isJson(req)) return json({ error: 'JSON bekleniyor' }, 415)
  const raw = await req.text().catch(() => null)
  if (raw === null) return json({ error: 'Geçersiz istek' }, 400)
  if (raw.length > MAX_BODY_BYTES) return json({ error: 'İstek çok büyük' }, 413)
  let body: unknown
  try { body = JSON.parse(raw) } catch { return json({ error: 'Geçersiz JSON' }, 400) }
  const parsed = parseTutorRequest(body)
  if (!parsed.ok) return json({ error: parsed.error }, 400)
  const q = parsed.data
  const lessonReq = parsed.mode === 'lesson' ? parsed.data : null
  const pageReq = parsed.mode === 'page' ? parsed.data : null

  const user = await getCurrentUser().catch(() => null)
  const deviceId = user ? null : q.deviceId ?? null
  if (!user && !deviceId) return json({ error: 'Cihaz kimliği gerekli' }, 400)
  const who = user ? `u|${user.id}` : `d|${deviceId}`
  const ip = ipOf(req)
  if (rateLimited(`tutor|${who}`, 8, 60_000) || rateLimited(`tutor-ip|${ip}`, 40, 60_000)) {
    return json({ error: 'too_fast' }, 429, { 'retry-after': '20' })
  }

  const db = getDb()
  let lesson: Awaited<ReturnType<typeof loadTutorLesson>> = null
  let source: PageSource | null = null
  let gate
  try {
    if (lessonReq) {
      lesson = await loadTutorLesson(db, lessonReq.lessonId)
      if (!lesson) return json({ error: 'Ders bulunamadı' }, 404)
      if (lessonReq.stepIndex >= lesson.steps.length) return json({ error: 'Geçersiz adım' }, 400)
    } else source = await loadPageSource(db, pageReq!.page, !!user)
    gate = await tutorGate(db, user?.id ?? null)
  } catch {
    return json({ error: 'tutor_unavailable' }, 503)
  }
  if (!gate.ok) return json({ error: 'tutor_not_allowed', reason: gate.reason }, 403)

  // Günlük kota: kullanıcıda DB sayımı kalıcı taban; misafirde cihaz + IP
  const now = new Date()
  const keys: string[] = []
  let remaining: number
  if (user) {
    const dbUsed = await countUserMessagesToday(db, user.id, now).catch(() => 0)
    const r = takeDaily(`tutor-day|${who}`, USER_DAILY, now, dbUsed)
    if (!r.ok) return json({ error: 'daily_limit', limit: USER_DAILY }, 429)
    keys.push(`tutor-day|${who}`); remaining = r.remaining
  } else {
    const r = takeDaily(`tutor-day|${who}`, GUEST_DAILY, now)
    if (!r.ok) return json({ error: 'daily_limit', limit: GUEST_DAILY }, 429)
    keys.push(`tutor-day|${who}`); remaining = r.remaining
    if (!takeDaily(`tutor-day-ip|${ip}`, GUEST_IP_DAILY, now).ok) { refundDaily(keys[0], now); return json({ error: 'daily_limit', limit: GUEST_DAILY }, 429) }
    keys.push(`tutor-day-ip|${ip}`)
  }
  const refund = () => keys.forEach((k) => refundDaily(k, now))

  const profile = user ? await loadTutorUser(db, user.id, now).catch(() => null) : null
  // Arayüz dili (istekteki) öncelikli, yoksa hesabın dili. İngilizcede dersin İngilizce adımları varsa onlar bağlam olur
  // (aynı sıra ve yapı: tools/content/ek.mjs mirrorSteps).
  const locale = (q.locale ?? profile?.locale) === 'en' ? 'en' : 'tr'
  const { refusal: REFUSAL_TEXT, error: ERROR_TEXT, empty: EMPTY_TEXT } = TUTOR_TEXTS[locale]
  let context: string
  let system: string
  let savedLessonId: number | null
  if (lesson && lessonReq) {
    const steps = locale === 'en' && lesson.stepsEn?.length === lesson.steps.length ? lesson.stepsEn : lesson.steps
    context = buildTutorContext({
      lesson: { id: lesson.id, title: lesson.title, moduleTitle: lesson.moduleTitle, steps },
      stepIndex: lessonReq.stepIndex,
      status: lessonReq.status,
      attempts: lessonReq.attempts,
      answerSnapshot: lessonReq.answerSnapshot,
      ageBand: ageBandFor(profile?.age ?? q.age, lesson.minAge),
      locale,
    })
    system = TUTOR_SYSTEM
    savedLessonId = lesson.id
  } else {
    const src = source!
    const minAge = src.kind === 'lesson' || src.kind === 'module' ? src.minAge : null
    context = buildPageContext({ source: src, ageBand: ageBandFor(profile?.age ?? q.age, minAge), locale })
    system = ROBI_PAGE_SYSTEM
    savedLessonId = src.kind === 'lesson' ? src.lessonId : null
  }
  const question = q.messages[q.messages.length - 1].content

  // İlk parçayı yanıt açılmadan bekle: erken API hataları doğru HTTP durumuyla dönsün
  const gen = streamTutor(context, q.messages, req.signal, system)
  let first: IteratorResult<string, TutorResult>
  try {
    first = await gen.next()
  } catch (err) {
    refund()
    const info = tutorErrorInfo(err)
    if (info.status >= 500 && info.status !== 503) console.error('[tutor]', err)
    return json({ error: info.error }, info.status)
  }

  const enc = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let text = ''
      let flag: string | null = null
      let shown = ''
      const send = (s: string) => { try { controller.enqueue(enc.encode(s)) } catch { /* istemci gitti */ } }
      try {
        let step = first
        while (!step.done) {
          text += step.value
          send(step.value)
          step = await gen.next()
        }
        const result = step.value
        if (result.stopReason === 'refusal') {
          // Yedek model zinciri dahil reddedildi: kısmi metni at, nazik yönlendirme göster
          flag = 'refusal'; shown = REFUSAL_TEXT
          send(REPLACE + REFUSAL_TEXT)
        } else if (!text.trim()) {
          flag = 'empty'; shown = EMPTY_TEXT
          send(REPLACE + EMPTY_TEXT)
        } else shown = text
      } catch (err) {
        const info = tutorErrorInfo(err)
        flag = info.error === 'aborted' ? 'aborted' : 'error'
        if (flag === 'error') console.error('[tutor] akış', err)
        shown = text ? `${text}\n${ERROR_TEXT}` : ERROR_TEXT
        send(REPLACE + ERROR_TEXT)
      } finally {
        try { controller.close() } catch { /* zaten kapalı */ }
      }
      await saveTutorExchange(db, {
        userId: user?.id ?? null, deviceId, lessonId: savedLessonId, question,
        answer: flag === 'refusal' ? `${REFUSAL_TEXT}${text ? `\n[kısmi: ${text.slice(0, 500)}]` : ''}` : shown,
        flag,
      }).catch((e) => console.error('[tutor] kayıt', e))
    },
    cancel() { void gen.return?.(undefined as never) },
  })

  return new Response(stream, {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-tutor-remaining': String(remaining) },
  })
}
