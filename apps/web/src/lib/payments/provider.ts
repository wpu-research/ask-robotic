// Ödeme sağlayıcısı soyutlaması. Akış (barındırılan ödeme sayfası):
//   1) POST /api/odeme/baslat → payments satırı 'pending' → provider.initialize → redirectUrl (sağlayıcının sayfası)
//   2) Kullanıcı ödeme sayfasında öder → sağlayıcı callback'imize döner (yalnız bir token/ref ile)
//   3) Callback gövdesine GÜVENİLMEZ: provider.retrieve(ref) ile sunucudan sunucuya durum sorulur → completeCheckout
// Seçim: PAYMENTS_PROVIDER (bkz. index.ts → getProvider).
import type { BillingPeriod, PaidPlanId } from '@/lib/pricing'

export type ProviderId = 'mock' | 'iyzico'

export interface CheckoutInit {
  /** payments.id; sağlayıcıda conversationId/basketId olarak taşınır */
  paymentId: string
  user: { id: string; name: string; email: string | null }
  planId: PaidPlanId
  period: BillingPeriod
  planTitle: string
  amountKurus: number
  /** Sağlayıcının ödeme sonrası döneceği mutlak adres */
  callbackUrl: string
  ip: string
}

export interface CheckoutSession {
  /** Sağlayıcıdaki referans (iyzico: token). payments.provider_ref'e yazılır. */
  providerRef: string
  /** Kullanıcının yönlendirileceği ödeme sayfası */
  redirectUrl: string
  raw?: Record<string, unknown>
}

export interface VerifiedPayment {
  status: 'succeeded' | 'failed' | 'pending'
  /** Sağlayıcının bildirdiği bizim ödeme kimliğimiz (iyzico: conversationId); varsa payments.id ile eşleşmeli */
  paymentId?: string
  /** Sağlayıcının bildirdiği tahsil edilen tutar; varsa payments.amount ile eşleşmeli */
  paidKurus?: number
  raw: Record<string, unknown>
}

export interface PaymentProvider {
  id: ProviderId
  initialize(init: CheckoutInit): Promise<CheckoutSession>
  /** Sunucudan sunucuya doğrulama. Callback gövdesindeki durum asla kullanılmaz. */
  retrieve(providerRef: string): Promise<VerifiedPayment>
}

export class ProviderError extends Error {
  constructor(message: string, readonly raw?: unknown) {
    super(message)
  }
}

/** Callback için dışarıdan görünen kök adres: PUBLIC_BASE_URL, yoksa vekil başlıkları, yoksa istek adresi. */
export function publicOrigin(req: Request) {
  const env = process.env.PUBLIC_BASE_URL?.replace(/\/+$/, '')
  if (env) return env
  const host = req.headers.get('x-forwarded-host')
  if (host) return `${req.headers.get('x-forwarded-proto') ?? 'https'}://${host.split(',')[0].trim()}`
  return new URL(req.url).origin
}

export const clientIp = (req: Request) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
