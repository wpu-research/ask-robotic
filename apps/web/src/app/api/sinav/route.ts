import { cookies } from 'next/headers'
import { LOCALE_COOKIE } from '@/i18n'
import { getDb } from '@/lib/db'
import { rateLimited } from '@/lib/auth/rate-limit'
import { body, currentAttempt, examToken, handle, ok, fail, setExamToken } from '@/lib/sinav/http'
import { startAttempt, studentView } from '@/lib/sinav/service'

export const dynamic = 'force-dynamic'

/** Öğrenci girişi: sınav kodu + öğrenci no + ad soyad. */
export async function POST(req: Request) {
  return handle(async () => {
    const b = await body(req)
    const code = String(b.code ?? ''), studentNo = String(b.studentNo ?? ''), studentName = String(b.studentName ?? '')
    if (!/^[A-Za-z0-9]{6}$/.test(code.trim())) return fail(400, 'Enter the 6-character exam code')
    if (!/^[A-Za-z0-9-]{3,20}$/.test(studentNo.trim())) return fail(400, 'Enter a valid student number')
    if (studentName.trim().length < 3 || studentName.length > 80) return fail(400, 'Enter your full name')
    if (rateLimited(`sinav-start|${studentNo.trim()}`, 10, 10 * 60_000)) return fail(429, 'Too many attempts, wait a minute')
    const r = await startAttempt(getDb(), { code, studentNo, studentName }, await examToken())
    await setExamToken(r.token)
    // Sınav İngilizce: laboratuvar arayüzü de İngilizce açılsın
    ;(await cookies()).set(LOCALE_COOKIE, 'en', { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
    return ok({ ok: true })
  })
}

/** Öğrencinin sınav görünümü (doğru cevaplar olmadan). */
export async function GET() {
  return handle(async () => {
    const { a, s } = await currentAttempt()
    return ok(studentView(a, s))
  })
}
