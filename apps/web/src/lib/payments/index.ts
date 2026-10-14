// Sağlayıcı seçimi: PAYMENTS_PROVIDER = 'mock' | 'iyzico'.
// Geliştirmede varsayılan 'mock'; üretimde (NODE_ENV=production) varsayılan yok → ödeme kapalı (503).
// iyzico: IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL (varsayılan sandbox).
import { createIyzicoProvider } from './iyzico'
import { mockProvider } from './mock'
import type { PaymentProvider, ProviderId } from './provider'

export * from './provider'
export { mockProvider }

/** Etkin sağlayıcı kimliği; null = ödeme kapalı. */
export function activeProviderId(env: Record<string, string | undefined> = process.env): ProviderId | null {
  const v = env.PAYMENTS_PROVIDER?.trim()
  const prod = env.NODE_ENV === 'production'
  if (v === 'iyzico') return v
  // Sahte sağlayıcı herkese bedava Premium verir: üretimde ayrıca MOCK_PAYMENTS_IN_PRODUCTION=true istenir
  if (v === 'mock') return !prod || env.MOCK_PAYMENTS_IN_PRODUCTION === 'true' ? 'mock' : null
  if (v) return null
  return prod ? null : 'mock'
}

export function getProvider(id: ProviderId | null = activeProviderId()): PaymentProvider | null {
  if (id === 'mock') return mockProvider
  if (id === 'iyzico') {
    const apiKey = process.env.IYZICO_API_KEY
    const secretKey = process.env.IYZICO_SECRET_KEY
    if (!apiKey || !secretKey) return null
    return createIyzicoProvider({ apiKey, secretKey, baseUrl: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com' })
  }
  return null
}

