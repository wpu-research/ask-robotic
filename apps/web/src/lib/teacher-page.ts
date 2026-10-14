// Sayfa/API yardımcıları: oturum kullanıcısı, girişe yönlendirme, JSON gövdesi.
import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from './auth/current'
import { requireClassStaff } from './class-access'
import { getDb } from './db'

/** Giriş yoksa /giris?next=… sayfasına yönlendirir. */
export async function requireUserPage(next: string) {
  const user = await getCurrentUser().catch(() => null)
  if (!user) redirect(`/giris?next=${encodeURIComponent(next)}`)
  return user
}

export const currentUserId = async () => (await getCurrentUser().catch(() => null))?.id ?? null

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  if (!req.headers.get('content-type')?.includes('application/json')) return null
  const text = await req.text().catch(() => '')
  if (text.length > 64_000) return null
  try {
    const v = JSON.parse(text)
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null
  } catch { return null }
}

export const bad = (error: string, status = 400) => Response.json({ error }, { status })

/** Öğretmen sınıf sayfası: giriş yoksa yönlendirir; sınıf yoksa ya da yetki yoksa 404 (varlığı sızdırmaz). */
export async function requireClassPage(classId: string, next: string) {
  const user = await requireUserPage(next)
  const g = await requireClassStaff(getDb(), user.id, classId)
  if (!g.ok) notFound()
  return { user, cls: g.cls, role: g.role }
}
