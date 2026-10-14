// QR kartla giriş (küçük öğrenciler, e-postasız). Kartta kullanıcı adı + gizli kod basılıdır; DB'de yalnız
// gizli kodun SHA-256 özeti (users.login_secret_hash) durur. Kart kaybolursa öğretmen yeni kod üretir (eskisi geçersizleşir).
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { sql, users, type Db } from '@ask/db'
import { z } from 'zod'
import { rateLimited } from './rate-limit'
import type { AuthResult } from './service'
import { createSession } from './session'

export const hashQrSecret = (secret: string) => createHash('sha256').update(secret).digest('hex')

/** Yeni kart kodu: `secret` karta/QR'a basılır (bir kez gösterilir), `hash` users.loginSecretHash'e yazılır. */
export function createQrCredentials(): { secret: string; hash: string } {
  // 10 karakter (60 bit): karta elle de yazılabilsin; tahmin, kullanıcı başı hız sınırıyla (10 / 15 dk) olanaksız
  const secret = randomBytes(8).toString('base64url').slice(0, 10)
  return { secret, hash: hashQrSecret(secret) }
}

/** QR'a gömülecek adres: `${base}/giris/qr?u=<kullanıcı adı>&k=<gizli kod>`. */
export function qrLoginUrl(base: string, username: string, secret: string): string {
  const q = new URLSearchParams({ u: username, k: secret })
  return `${base.replace(/\/+$/, '')}/giris/qr?${q}`
}

const qrInput = z.object({
  u: z.string().trim().min(1).max(64),
  k: z.string().min(8).max(128).regex(/^[\w-]+$/),
})

// Kullanıcı yokken de aynı karşılaştırma yapılır
const DUMMY = hashQrSecret('yok')

export const QR_LIMIT = { perIp: 30, perUser: 10, windowMs: 15 * 60 * 1000 }

export async function loginWithQr(db: Db, input: unknown, ip: string, now = Date.now()): Promise<AuthResult> {
  const parsed = qrInput.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'invalid_input', message: 'QR kod okunamadı' }
  const username = parsed.data.u.toLowerCase()
  if (rateLimited(`qr-ip|${ip}`, QR_LIMIT.perIp, QR_LIMIT.windowMs, now) || rateLimited(`qr-u|${username}`, QR_LIMIT.perUser, QR_LIMIT.windowMs, now)) {
    return { ok: false, code: 'rate_limited', message: 'Çok fazla deneme. Biraz bekleyip öğretmenine haber ver.' }
  }
  const [user] = await db.select().from(users).where(sql`lower(${users.username}) = ${username}`).limit(1)
  const expected = Buffer.from(user?.loginSecretHash ?? DUMMY, 'hex')
  const actual = Buffer.from(hashQrSecret(parsed.data.k), 'hex')
  const match = expected.length === actual.length && timingSafeEqual(expected, actual)
  // Yalnız öğrenci hesapları kartla girer (öğretmen/veli hesabı kart kaybıyla ele geçmesin)
  if (!user || !user.loginSecretHash || !match || user.role !== 'student') {
    return { ok: false, code: 'bad_credentials', message: 'Bu QR kart geçerli değil. Öğretmeninden yeni kart iste.' }
  }
  const { token, expiresAt } = await createSession(db, user.id)
  return { ok: true, token, expiresAt, user: { id: user.id, email: user.email, username: user.username, name: user.name, role: user.role } }
}
