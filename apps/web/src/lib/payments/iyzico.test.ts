import { describe, expect, it } from 'vitest'
import {
  IYZICO_INIT_PATH, IYZICO_RETRIEVE_PATH, buildInitializeRequest, createIyzicoProvider, iyzicoAuthHeader, iyzicoSignature,
  mapRetrieveResponse,
} from './iyzico'
import { activeProviderId } from './index'
import type { CheckoutInit } from './provider'

// Sabit vektör, Node'dan bağımsız olarak openssl ile hesaplandı:
//   R=123456789; U=/payment/iyzipos/checkoutform/auth/ecom/detail; B='{"locale":"tr","conversationId":"c1","token":"tok-1"}'
//   printf '%s' "$R$U$B" | openssl dgst -sha256 -hmac 'sandbox-secret'
//     → 937bb6a4f7f1c3794848204386cf56335523599ddc1d69768255792dedc11096
//   printf '%s' "apiKey:sandbox-key&randomKey:$R&signature:<yukarıdaki hex>" | base64 -w0
const R = '123456789'
const BODY = '{"locale":"tr","conversationId":"c1","token":"tok-1"}'
const SIG = '937bb6a4f7f1c3794848204386cf56335523599ddc1d69768255792dedc11096'
const AUTH = 'IYZWSv2 YXBpS2V5OnNhbmRib3gta2V5JnJhbmRvbUtleToxMjM0NTY3ODkmc2lnbmF0dXJlOjkzN2JiNmE0ZjdmMWMzNzk0ODQ4MjA0Mzg2Y2Y1NjMzNTUyMzU5OWRkYzFkNjk3NjgyNTU3OTJkZWRjMTEwOTY='

const init: CheckoutInit = {
  paymentId: '0b8a3d2e-0000-4000-8000-000000000001',
  user: { id: 'u1', name: 'Ada Nur Yılmaz', email: 'ada@ornek.com' },
  planId: 'premium', period: 'yearly', planTitle: 'Bireysel', amountKurus: 199000,
  callbackUrl: 'https://ornek.com/api/odeme/iyzico/callback', ip: '10.0.0.1',
}

describe('iyzico IYZWSv2 imzası', () => {
  it('sabit vektör', () => {
    expect(iyzicoSignature('sandbox-secret', R, IYZICO_RETRIEVE_PATH, BODY)).toBe(SIG)
    expect(iyzicoAuthHeader('sandbox-key', 'sandbox-secret', R, IYZICO_RETRIEVE_PATH, BODY)).toBe(AUTH)
  })
  it('gövde ya da yol değişince imza değişir', () => {
    expect(iyzicoSignature('sandbox-secret', R, IYZICO_INIT_PATH, BODY)).not.toBe(SIG)
    expect(iyzicoSignature('sandbox-secret', R, IYZICO_RETRIEVE_PATH, BODY + ' ')).not.toBe(SIG)
  })
})

describe('iyzico bağdaştırıcısı (sahte fetch; gerçek sandbox test edilmedi)', () => {
  it('initialize: gövde, başlıklar ve yanıt eşlemesi', async () => {
    const calls: { url: string; init: RequestInit }[] = []
    const fakeFetch = (async (url: string, i: RequestInit) => {
      calls.push({ url, init: i })
      return new Response(JSON.stringify({ status: 'success', token: 'tok-9', paymentPageUrl: 'https://sandbox-cpp.iyzipay.com?token=tok-9', checkoutFormContent: '<script/>' }))
    }) as unknown as typeof fetch
    const p = createIyzicoProvider({ apiKey: 'k', secretKey: 's', baseUrl: 'https://sandbox-api.iyzipay.com/', fetch: fakeFetch, randomKey: () => R })
    const s = await p.initialize(init)
    expect(s).toMatchObject({ providerRef: 'tok-9', redirectUrl: 'https://sandbox-cpp.iyzipay.com?token=tok-9' })
    expect(calls[0].url).toBe('https://sandbox-api.iyzipay.com' + IYZICO_INIT_PATH)
    const h = calls[0].init.headers as Record<string, string>
    const body = calls[0].init.body as string
    expect(h['x-iyzi-rnd']).toBe(R)
    // İmza, gönderilen gövdenin aynısı üzerinden
    expect(h.authorization).toBe(iyzicoAuthHeader('k', 's', R, IYZICO_INIT_PATH, body))
    const json = JSON.parse(body)
    expect(json).toMatchObject({
      conversationId: init.paymentId, basketId: init.paymentId, price: '1990.00', paidPrice: '1990.00', currency: 'TRY',
      callbackUrl: init.callbackUrl, buyer: { name: 'Ada Nur', surname: 'Yılmaz', email: 'ada@ornek.com', ip: '10.0.0.1' },
    })
    expect(json.basketItems).toEqual([expect.objectContaining({ price: '1990.00', itemType: 'VIRTUAL' })])
  })
  it('initialize hatası ProviderError fırlatır', async () => {
    const fakeFetch = (async () => new Response(JSON.stringify({ status: 'failure', errorCode: '1001', errorMessage: 'api bilgileri bulunamadı' }))) as unknown as typeof fetch
    const p = createIyzicoProvider({ apiKey: 'k', secretKey: 's', baseUrl: 'https://x', fetch: fakeFetch })
    await expect(p.initialize(init)).rejects.toThrow(/api bilgileri/)
  })
  it('retrieve: token ile sorar, yanıtı doğrulanmış sonuca çevirir', async () => {
    let sent = ''
    const fakeFetch = (async (_u: string, i: RequestInit) => {
      sent = i.body as string
      return new Response(JSON.stringify({ status: 'success', paymentStatus: 'SUCCESS', fraudStatus: 1, paidPrice: 1990, conversationId: 'p1', token: 'tok-9' }))
    }) as unknown as typeof fetch
    const p = createIyzicoProvider({ apiKey: 'k', secretKey: 's', baseUrl: 'https://x', fetch: fakeFetch })
    expect(await p.retrieve('tok-9')).toMatchObject({ status: 'succeeded', paymentId: 'p1', paidKurus: 199000 })
    expect(JSON.parse(sent)).toEqual({ locale: 'tr', token: 'tok-9' })
  })
  it('retrieve eşlemesi: başarısız, inceleme, ret', () => {
    expect(mapRetrieveResponse({ status: 'success', paymentStatus: 'FAILURE' }).status).toBe('failed')
    expect(mapRetrieveResponse({ status: 'failure', errorCode: '5' }).status).toBe('failed')
    expect(mapRetrieveResponse({ status: 'success', paymentStatus: 'SUCCESS', fraudStatus: 0 }).status).toBe('pending')
    expect(mapRetrieveResponse({ status: 'success', paymentStatus: 'SUCCESS', fraudStatus: -1 }).status).toBe('failed')
    expect(mapRetrieveResponse({ status: 'success', paymentStatus: 'INIT_THREEDS' }).status).toBe('pending')
  })
  it('buildInitializeRequest tek kelimelik adı ad=soyad yapar', () => {
    expect(buildInitializeRequest({ ...init, user: { ...init.user, name: 'Ada', email: null } }).buyer).toMatchObject({ name: 'Ada', surname: 'Ada', email: 'u1@kullanici.invalid' })
  })
})

describe('sağlayıcı seçimi', () => {
  it('geliştirmede varsayılan mock, üretimde kapalı', () => {
    expect(activeProviderId({ NODE_ENV: 'development' })).toBe('mock')
    expect(activeProviderId({ NODE_ENV: 'production' })).toBeNull()
    expect(activeProviderId({ NODE_ENV: 'production', PAYMENTS_PROVIDER: 'iyzico' })).toBe('iyzico')
    expect(activeProviderId({ PAYMENTS_PROVIDER: 'stripe' })).toBeNull()
    expect(activeProviderId({ NODE_ENV: 'production', PAYMENTS_PROVIDER: 'mock' })).toBeNull()
    expect(activeProviderId({ NODE_ENV: 'production', PAYMENTS_PROVIDER: 'mock', MOCK_PAYMENTS_IN_PRODUCTION: 'true' })).toBe('mock')
  })
})
