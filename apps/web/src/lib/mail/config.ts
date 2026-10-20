// SMTP ayarları yalnız ortam değişkenlerinden okunur. Biri eksikse e-posta özellikleri tamamen kapalıdır
// (kayıt/giriş etkilenmez, doğrulama zorunlu değildir, "şifremi unuttum" sayfası görünmez).
export interface MailConfig {
  host: string
  port: number
  user: string
  pass: string
  from: string
  appUrl: string
}

export function mailConfig(env: Record<string, string | undefined> = process.env): MailConfig | null {
  const host = env.SMTP_HOST?.trim()
  const user = env.SMTP_USER?.trim()
  const pass = env.SMTP_PASS
  const from = env.MAIL_FROM?.trim()
  const appUrl = env.APP_URL?.trim().replace(/\/+$/, '')
  const port = Number(env.SMTP_PORT?.trim() || 465)
  if (!host || !user || !pass || !from || !appUrl) return null
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null
  if (!/^https?:\/\//i.test(appUrl)) return null
  return { host, port, user, pass, from, appUrl }
}

export const mailEnabled = (env?: Record<string, string | undefined>) => mailConfig(env) !== null
