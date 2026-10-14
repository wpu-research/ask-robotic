import { getDb } from '@/lib/db'
import { completeCheckout, loadPaymentByRef } from '@/lib/billing'
import { getProvider, publicOrigin } from '@/lib/payments'

export const dynamic = 'force-dynamic'

// iyzico ödeme sayfası bitince tarayıcıyı buraya form POST'uyla (token=...) gönderir. Çapraz site POST olduğu için
// oturum çerezi gelmez; ödeme token'la bulunur. Gövdedeki hiçbir durum alanına güvenilmez: token ile iyzico'ya
// sunucudan sunucuya sorulur (retrieve) ve yalnız o yanıt işlenir. ⚠ Gerçek sandbox'a karşı test edilmedi.
export async function POST(req: Request) {
  const origin = publicOrigin(req)
  const back = (q: string) => Response.redirect(`${origin}/hesap?odeme=${q}`, 303)

  const form = await req.formData().catch(() => null)
  const token = form?.get('token')
  if (typeof token !== 'string' || !token || token.length > 200) return back('hata')
  const provider = getProvider('iyzico')
  if (!provider) return back('hata')
  const db = getDb()
  if (!(await loadPaymentByRef(db, 'iyzico', token))) return back('hata')

  try {
    const verified = await provider.retrieve(token)
    const r = await completeCheckout(db, 'iyzico', token, verified)
    return back(r.ok ? 'basarili' : r.status === 'pending' ? 'bekliyor' : 'hata')
  } catch (e) {
    console.error('iyzico callback', e)
    return back('bekliyor')
  }
}
