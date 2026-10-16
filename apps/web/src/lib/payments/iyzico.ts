// iyzico Checkout Form (ortak ödeme sayfası) bağdaştırıcısı.
//
// ⚠ GERÇEK SANDBOX'A KARŞI TEST EDİLMEDİ. İmza (IYZWSv2) sabit bir vektörle, istek/yanıt eşlemesi sahte fetch ile
//   test edildi (iyzico.test.ts). Canlıya almadan önce sandbox anahtarlarıyla uçtan uca denenmeli; özellikle
//   buyer/adres zorunlu alanları ve tutar biçimi ("1990.00") iyzico doğrulamasından geçmeli.
//
// Akış: initialize → paymentPageUrl'e yönlendir → iyzico callbackUrl'e POST (token) → retrieve(token) ile durum doğrula.
// Kimlik doğrulama (IYZWSv2):
//   signature = hex(HMAC-SHA256(secretKey, randomKey + uriPath + jsonBody))
//   Authorization = "IYZWSv2 " + base64("apiKey:" + apiKey + "&randomKey:" + randomKey + "&signature:" + signature)
//   x-iyzi-rnd = randomKey
import { createHmac, randomInt } from 'node:crypto'
import { toDecimalString } from '@/lib/pricing'
import { ProviderError, type CheckoutInit, type CheckoutSession, type PaymentProvider, type VerifiedPayment } from './provider'

export const IYZICO_INIT_PATH = '/payment/iyzipos/checkoutform/initialize/auth/ecom'
export const IYZICO_RETRIEVE_PATH = '/payment/iyzipos/checkoutform/auth/ecom/detail'

export function iyzicoSignature(secretKey: string, randomKey: string, uriPath: string, body: string) {
  return createHmac('sha256', secretKey).update(randomKey + uriPath + body).digest('hex')
}

export function iyzicoAuthHeader(apiKey: string, secretKey: string, randomKey: string, uriPath: string, body: string) {
  const sig = iyzicoSignature(secretKey, randomKey, uriPath, body)
  return 'IYZWSv2 ' + Buffer.from(`apiKey:${apiKey}&randomKey:${randomKey}&signature:${sig}`).toString('base64')
}

export interface IyzicoConfig {
  apiKey: string
  secretKey: string
  baseUrl: string
  fetch?: typeof fetch
  randomKey?: () => string
}

const defaultRandomKey = () => `${Date.now()}${randomInt(100_000_000, 999_999_999)}`

function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2) return { name: parts[0] || 'Kullanıcı', surname: parts[0] || 'Kullanıcı' }
  return { name: parts.slice(0, -1).join(' '), surname: parts[parts.length - 1] }
}

/** Initialize isteği gövdesi. Alan sırası imzaya girer; gövde bir kez serileştirilip aynı metin gönderilir. */
export function buildInitializeRequest(init: CheckoutInit) {
  const price = toDecimalString(init.amountKurus)
  const { name, surname } = splitName(init.user.name)
  // YER TUTUCU: iyzico buyer.identityNumber, adres ve şehir zorunlu. Bireysel dijital abonelikte TCKN/adres
  // toplamıyoruz; iyzico'nun kabul ettiği varsayılan değerler kullanılıyor. Hukuk/muhasebe ile netleşmeli.
  const address = 'Dijital hizmet — adres alınmadı'
  return {
    locale: 'tr',
    conversationId: init.paymentId,
    price,
    paidPrice: price,
    currency: 'TRY',
    basketId: init.paymentId,
    paymentGroup: 'PRODUCT',
    callbackUrl: init.callbackUrl,
    enabledInstallments: [1],
    buyer: {
      id: init.user.id,
      name,
      surname,
      email: init.user.email ?? `${init.user.id}@kullanici.invalid`,
      identityNumber: '11111111111',
      registrationAddress: address,
      ip: init.ip,
      city: 'Istanbul',
      country: 'Turkey',
    },
    billingAddress: { contactName: `${name} ${surname}`, city: 'Istanbul', country: 'Turkey', address },
    basketItems: [{
      id: `${init.planId}-${init.period}`,
      name: `MacademiaX ${init.planTitle} (${init.period === 'yearly' ? '12 ay' : '1 ay'})`,
      category1: 'Eğitim',
      itemType: 'VIRTUAL',
      price,
    }],
  }
}

/** Retrieve yanıtını doğrulanmış sonuca çevirir. fraudStatus: 1 onay, 0 inceleme (bekliyor), -1 ret. */
export function mapRetrieveResponse(r: Record<string, unknown>): VerifiedPayment {
  const ok = r.status === 'success' && r.paymentStatus === 'SUCCESS'
  const fraud = r.fraudStatus === undefined ? 1 : Number(r.fraudStatus)
  const status: VerifiedPayment['status'] = !ok ? (r.status === 'success' && typeof r.paymentStatus === 'string' && r.paymentStatus !== 'FAILURE' ? 'pending' : 'failed')
    : fraud === 1 ? 'succeeded' : fraud === 0 ? 'pending' : 'failed'
  const paid = r.paidPrice !== undefined ? Math.round(Number(r.paidPrice) * 100) : undefined
  return {
    status,
    paymentId: typeof r.conversationId === 'string' ? r.conversationId : typeof r.basketId === 'string' ? r.basketId : undefined,
    paidKurus: Number.isFinite(paid) ? paid : undefined,
    raw: r,
  }
}

export function createIyzicoProvider(cfg: IyzicoConfig): PaymentProvider {
  const doFetch = cfg.fetch ?? fetch
  const rnd = cfg.randomKey ?? defaultRandomKey
  const base = cfg.baseUrl.replace(/\/+$/, '')

  async function call(path: string, payload: unknown): Promise<Record<string, unknown>> {
    const body = JSON.stringify(payload)
    const randomKey = rnd()
    const res = await doFetch(base + path, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        authorization: iyzicoAuthHeader(cfg.apiKey, cfg.secretKey, randomKey, path, body),
        'x-iyzi-rnd': randomKey,
      },
      body,
    })
    const json = (await res.json().catch(() => null)) as Record<string, unknown> | null
    if (!json) throw new ProviderError(`iyzico yanıtı okunamadı (HTTP ${res.status})`)
    return json
  }

  return {
    id: 'iyzico',
    async initialize(init: CheckoutInit): Promise<CheckoutSession> {
      const r = await call(IYZICO_INIT_PATH, buildInitializeRequest(init))
      if (r.status !== 'success' || typeof r.token !== 'string' || typeof r.paymentPageUrl !== 'string') {
        throw new ProviderError(`iyzico başlatılamadı: ${String(r.errorMessage ?? r.errorCode ?? 'bilinmeyen hata')}`, r)
      }
      // checkoutFormContent (gömülü form betiği) saklanmaz; yönlendirmeli sayfa kullanılıyor
      return { providerRef: r.token, redirectUrl: r.paymentPageUrl, raw: { token: r.token, tokenExpireTime: r.tokenExpireTime } }
    },
    async retrieve(token: string): Promise<VerifiedPayment> {
      const r = await call(IYZICO_RETRIEVE_PATH, { locale: 'tr', token })
      return mapRetrieveResponse(r)
    },
  }
}
