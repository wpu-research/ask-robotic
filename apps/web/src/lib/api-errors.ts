// API hata metinleri (sunucu Türkçe döndürür; testler bu metinleri doğrular) → sözlük anahtarı. İstemci, arayüz diline
// çevirir; bilinmeyen metin olduğu gibi gösterilir. Kaynaklar: lib/auth/service.ts, lib/auth/qr.ts, lib/billing.ts, app/api/**.
import type { MessageKey, TFunction } from '@/i18n'

const EXACT: Record<string, MessageKey> = {
  // Kimlik
  'Bağlantı kurulamadı. İnternetini kontrol et.': 'auth.errors.network',
  'Bir hata oluştu': 'auth.errors.generic',
  'Çok fazla deneme, sonra tekrar dene': 'auth.errors.tooManyTries',
  'Kullanıcı adı/e-posta ya da parola hatalı': 'auth.errors.badCredentials',
  'Giriş bilgileri geçersiz': 'auth.errors.invalidLogin',
  'Geçersiz bilgi': 'auth.errors.invalidInput',
  'Bu e-posta zaten kayıtlı': 'auth.errors.emailTaken',
  'Parola en az 10 karakter olmalı': 'auth.errors.passwordShort',
  'Adını yaz': 'auth.errors.nameRequired',
  'Doğum yılını seç': 'auth.errors.birthYearRequired',
  'Doğum yılı geçersiz': 'auth.errors.birthYearInvalid',
  'Veli ve öğretmen hesabı için 18 yaşından büyük olmalısın': 'auth.register.adultOnly',
  '16 yaşından küçüksen velinin onayı gerekli': 'auth.errors.guardianConsent',
  'QR kod okunamadı': 'auth.errors.qrUnreadable',
  'QR kod eksik ya da bozuk.': 'auth.qr.missing',
  'Çok fazla deneme. Biraz bekleyip öğretmenine haber ver.': 'auth.errors.qrRateLimited',
  'Bu QR kart geçerli değil. Öğretmeninden yeni kart iste.': 'auth.errors.qrInvalid',
  'JSON bekleniyor': 'auth.errors.expectJson',
  // Ödeme
  'Ödeme şu an kapalı': 'pricing.errors.closed',
  'Satın almak için giriş yap': 'pricing.errors.loginToBuy',
  'Plan seç ve sözleşmeleri onayla': 'pricing.errors.acceptTerms',
  'Geçersiz plan': 'pricing.errors.invalidPlan',
  'Kullanıcı bulunamadı': 'pricing.errors.noUser',
  'Ödeme sayfası açılamadı, lütfen tekrar dene': 'pricing.errors.providerError',
  'Ödeme bulunamadı': 'pricing.errors.paymentNotFound',
  'Sahte ödeme kapalı': 'pricing.errors.mockClosed',
  // Hesap / aile
  'Etkin bir Aile planın yok': 'account.errors.noFamilyPlan',
  'Bu kullanıcı adı ya da e-postayla bir hesap bulunamadı': 'account.errors.notFound',
  'Kendini üye olarak ekleyemezsin; plan zaten senin': 'account.errors.self',
  'Bu kişi zaten ailende': 'account.errors.alreadyMember',
  'Üye bulunamadı': 'account.errors.memberNotFound',
  'Kullanıcı adı ya da e-posta yaz': 'account.errors.enterId',
  'Hesap bulunamadı': 'account.errors.accountNotFound',
  'Çok sık istek': 'account.errors.tooFrequent',
  'Giriş yapılmamış': 'account.errors.notLoggedIn',
  'Geçersiz istek': 'account.errors.badRequest',
}

const PATTERNS: { re: RegExp; key: MessageKey; params: (m: RegExpMatchArray) => Record<string, string> }[] = [
  { re: /^Aile planı en fazla (\d+) kişi \(sen \+ (\d+)\)$/, key: 'account.errors.seatsFull', params: (m) => ({ total: m[1], limit: m[2] }) },
  { re: /^Onaylamak için "(.+)" yaz$/, key: 'account.errors.confirmPhrase', params: (m) => ({ phrase: m[1] }) },
]

/** Sunucu hata metnini arayüz diline çevirir. Metin yoksa `fallback` anahtarı; bilinmiyorsa sunucu metni. */
export function apiErrorText(t: TFunction, serverText: string | null | undefined, fallback: MessageKey): string {
  if (!serverText) return t(fallback)
  const k = EXACT[serverText]
  if (k) return t(k)
  for (const p of PATTERNS) {
    const m = serverText.match(p.re)
    if (m) return t(p.key, p.params(m))
  }
  return serverText
}
