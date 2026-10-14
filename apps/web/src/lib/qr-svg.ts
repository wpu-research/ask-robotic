// QR kodu SVG metni olarak (sunucuda; `qrcode` kütüphanesi). Kart basımı: ogretmen/sinif/[id]/kartlar.
import QRCode from 'qrcode'

export const qrSvg = (text: string) => QRCode.toString(text, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })

/** Basılacak giriş kartı: ad, kullanıcı adı, gizli kod, QR (SVG). Gizli kod yalnız bu yanıtta bulunur. */
export interface LoginCard { id: string; name: string; username: string; secret: string; url: string; svg: string }

/** İsteğin dış adresi (Railway vekili arkasında x-forwarded-* başlıkları). */
export const requestOrigin = (req: Request) => originFromHeaders(req.headers, new URL(req.url).origin)

export function originFromHeaders(h: Headers, fallback = 'http://localhost:3000'): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL
  if (env) return env.replace(/\/$/, '')
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto')?.split(',')[0] ?? (host?.startsWith('localhost') ? 'http' : 'https')
  return host ? `${proto}://${host}` : fallback
}
