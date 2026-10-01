import { eq, users, type Db } from '@ask/db'
import { z } from 'zod'
import { DUMMY_HASH, hashPassword, verifyPassword } from './password'
import { createSession } from './session'

const email = z.string().trim().toLowerCase().email().max(254)

export const registerSchema = z.object({
  email,
  password: z.string().min(10, 'Parola en az 10 karakter olmalı').max(200),
  name: z.string().trim().min(1).max(80),
  // Çocuk hesapları (16 yaş altı) ebeveyn hesabı üzerinden açılacak; burada kendi kaydı yalnız şu rollerle
  role: z.enum(['student', 'parent']).default('student'),
  adult: z.literal(true, { errorMap: () => ({ message: '16 yaşından büyük olduğunu onaylamalısın' }) }),
})

export const loginSchema = z.object({ email, password: z.string().min(1).max(200) })

export type AuthResult =
  | { ok: true; token: string; expiresAt: Date; user: { id: string; email: string; name: string; role: string } }
  | { ok: false; code: 'invalid_input' | 'email_taken' | 'bad_credentials'; message: string }

export async function registerUser(db: Db, input: unknown): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: 'invalid_input', message: parsed.error.issues[0]?.message ?? 'Geçersiz bilgi' }
  }
  const { email, password, name, role } = parsed.data
  const taken = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (taken.length) return { ok: false, code: 'email_taken', message: 'Bu e-posta zaten kayıtlı' }

  const passwordHash = await hashPassword(password)
  try {
    const [user] = await db.insert(users).values({ email, passwordHash, name, role }).returning()
    const { token, expiresAt } = await createSession(db, user.id)
    return { ok: true, token, expiresAt, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
  } catch (err) {
    // Eşzamanlı iki kayıtta unique ihlali (23505)
    if ((err as { code?: string }).code === '23505') {
      return { ok: false, code: 'email_taken', message: 'Bu e-posta zaten kayıtlı' }
    }
    throw err
  }
}

export async function loginUser(db: Db, input: unknown): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'invalid_input', message: 'E-posta veya parola geçersiz' }
  const { email, password } = parsed.data
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !valid) return { ok: false, code: 'bad_credentials', message: 'E-posta veya parola hatalı' }
  const { token, expiresAt } = await createSession(db, user.id)
  return { ok: true, token, expiresAt, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
}
