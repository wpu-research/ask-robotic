import { body, currentAttempt, handle, ok } from '@/lib/sinav/http'
import { saveAttempt, type SaveInput } from '@/lib/sinav/service'

export const dynamic = 'force-dynamic'

/** Otomatik kayıt (yalnız gönderilen alanlar güncellenir). */
export async function PUT(req: Request) {
  return handle(async () => {
    const b = await body(req)
    const { db, a } = await currentAttempt()
    await saveAttempt(db, a, b as SaveInput)
    return ok({ ok: true, savedAt: new Date().toISOString() })
  })
}
