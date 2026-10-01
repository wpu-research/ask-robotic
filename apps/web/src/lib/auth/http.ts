import { cookies } from 'next/headers'
import { SESSION_COOKIE } from './session'

export async function setSessionCookie(token: string, expiresAt: Date) {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

export async function readSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value
}

export function clientKey(req: Request, email: string) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  return `${ip}|${email.toLowerCase()}`
}

// SameSite=lax + yalnız JSON kabulü: form tabanlı çapraz site POST'ları reddedilir
export function isJson(req: Request) {
  return req.headers.get('content-type')?.includes('application/json') ?? false
}
