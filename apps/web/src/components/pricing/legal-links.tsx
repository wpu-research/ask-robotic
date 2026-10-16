'use client'
import Link from 'next/link'
import { useLocale, useT } from '@/i18n/client'
import { LEGAL_LINKS } from '@/lib/legal-links'

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
