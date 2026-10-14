import { z } from 'zod'
import { getDb } from '@/lib/db'
import { clearSessionCookie, isJson } from '@/lib/auth/http'
import { getCurrentUser } from '@/lib/auth/current'
import { DELETE_CONFIRM_PHRASE, deleteUserAccount } from '@/lib/account-data'

export const dynamic = 'force-dynamic'

const body = z.object({ confirm: z.string().max(40) })

/** Hesabı sil (KVKK). Onay için gövdede { confirm: "HESABIMI SİL" } gerekir. */
export async function DELETE(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Giriş yapılmamış' }, { status: 401 })
  const parsed = body.safeParse(await req.json().catch(() => null))
  const r = await deleteUserAccount(getDb(), user.id, parsed.success ? parsed.data.confirm : null)
  if (!r.ok) {
    return r.code === 'confirm_required'
      ? Response.json({ error: `Onaylamak için "${DELETE_CONFIRM_PHRASE}" yaz` }, { status: 400 })
      : Response.json({ error: 'Hesap bulunamadı' }, { status: 404 })
  }
  await clearSessionCookie()
  return Response.json({ ok: true })
}
