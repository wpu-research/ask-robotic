import type { MessageKey } from '@/i18n'

// Etiketler Türkçe kalır: /yasal/[slug] sayfası (yalnız Türkçe yayımlanır) da kullanır. Sunucu ve istemci bileşenleri
// ortak kullandığı için 'use client' dosyasında DEĞİL (oradan içe aktarılan dizi sunucuda istemci referansına dönüşür).
export const LEGAL_LINKS = [
  { href: '/yasal/mesafeli-satis', label: 'Mesafeli Satış Sözleşmesi', key: 'pricing.legal.distanceSales' },
  { href: '/yasal/on-bilgilendirme', label: 'Ön Bilgilendirme Formu', key: 'pricing.legal.preInfo' },
  { href: '/yasal/iade-iptal', label: 'İade ve İptal', key: 'pricing.legal.refund' },
  { href: '/yasal/kvkk-aydinlatma', label: 'KVKK Aydınlatma Metni', key: 'pricing.legal.kvkk' },
] satisfies { href: string; label: string; key: MessageKey }[]

