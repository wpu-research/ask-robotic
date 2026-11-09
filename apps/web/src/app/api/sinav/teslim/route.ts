import { body, currentAttempt, handle, ok } from '@/lib/sinav/http'
import { submitAttempt, type SaveInput } from '@/lib/sinav/service'

export const dynamic = 'force-dynamic'

/** Son kayıt + teslim. Proje puanlaması arka planda yapılır. */
export async function POST(req: Request) {
  return handle(async () => {
    const b = await body(req)
    const { db, a } = await currentAttempt()
    await submitAttempt(db, a, b as SaveInput)
    return ok({ ok: true })
  })
}
