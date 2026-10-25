import { getDb } from '@/lib/db'
import { clientKey, ipOf, isJson } from '@/lib/auth/http'
import { rateLimited } from '@/lib/auth/rate-limit'
import { getBrand } from '@/lib/brand-server'
import { leadSchema } from '@/lib/okul-teklif'
import { leadNotifyMail, leadNotifyTo, storeLead } from '@/lib/okul-teklif-server'
import { getMailer } from '@/lib/mail/send'

// Okul teklif formu. Hangi markadan geldiği alan adından çözülür (istemciye güvenilmez). Oran sınırı: IP başına saatte 5,
// IP+e-posta başına saatte 2 (bellek içi, tek örnek). Kayıttan sonra LEAD_NOTIFY_TO adreslerine bildirim gider
// (SMTP ayarlıysa); gönderim yanıtı bekletmez, hatası kaydı etkilemez.
export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const parsed = leadSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Eksik ya da geçersiz bilgi' }, { status: 400 })
  if (rateLimited(`teklif-ip|${ipOf(req)}`, 5, 3_600_000) || rateLimited(`teklif|${clientKey(req, parsed.data.email)}`, 2, 3_600_000)) {
    return Response.json({ error: 'Çok sık istek, biraz sonra tekrar deneyin' }, { status: 429 })
  }
  try {
    const brand = await getBrand()
    await storeLead(getDb(), parsed.data, brand.id)
    const mailer = getMailer()
    const to = leadNotifyTo()
    if (mailer && to.length) {
      const mail = leadNotifyMail(parsed.data, brand.tr.name, `${brand.siteUrl}/admin#okul-teklif`)
      void Promise.allSettled(to.map((addr) => mailer.send(addr, mail)))
    }
    return Response.json({ ok: true }, { status: 201 })
  } catch {
    return Response.json({ error: 'Kaydedilemedi, biraz sonra tekrar deneyin' }, { status: 503 })
  }
}
