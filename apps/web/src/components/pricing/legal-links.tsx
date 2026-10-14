'use client'
import Link from 'next/link'
import { useLocale, useT } from '@/i18n/client'
import type { MessageKey } from '@/i18n'

// Etiketler Türkçe kalır: /yasal/[slug] sayfası (yalnız Türkçe yayımlanır) da kullanır.
export const LEGAL_LINKS = [
  { href: '/yasal/mesafeli-satis', label: 'Mesafeli Satış Sözleşmesi', key: 'pricing.legal.distanceSales' },
  { href: '/yasal/on-bilgilendirme', label: 'Ön Bilgilendirme Formu', key: 'pricing.legal.preInfo' },
  { href: '/yasal/iade-iptal', label: 'İade ve İptal', key: 'pricing.legal.refund' },
  { href: '/yasal/kvkk-aydinlatma', label: 'KVKK Aydınlatma Metni', key: 'pricing.legal.kvkk' },
] satisfies { href: string; label: string; key: MessageKey }[]

/** Yasal metin bağlantıları; İngilizcede metinlerin yalnız Türkçe olduğu notuyla. */
export function LegalLinks() {
  const t = useT()
  const locale = useLocale()
  return (
    <nav className="pr-legal" aria-label={t('pricing.legal.nav')}>
      {LEGAL_LINKS.map((l) => <Link key={l.href} href={l.href} hrefLang="tr">{t(l.key)}</Link>)}
      {locale !== 'tr' && <small className="muted">{t('common.legalOnlyTurkish')}</small>}
    </nav>
  )
}
