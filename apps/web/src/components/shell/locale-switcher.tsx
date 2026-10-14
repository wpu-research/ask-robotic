'use client'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useLocale, useT } from '@/i18n/client'
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, LOCALES, type Locale } from '@/i18n'
import { useSession } from '@/lib/session'

/** Çerezi yazar; giriş yapılmışsa users.locale'i de günceller (PUT /api/me/locale), sonra sunucu bileşenlerini yeniler. */
export async function setLocale(next: Locale, loggedIn: boolean) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`
  document.documentElement.lang = next
  if (loggedIn) {
    await fetch('/api/me/locale', { method: 'PUT', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ locale: next }) }).catch(() => null)
  }
}

/** TR | EN dil seçici (üst çubuk, /basla). */
export function LocaleSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale()
  const t = useT()
  const router = useRouter()
  const session = useSession()
  const [pending, start] = useTransition()
  const pick = (l: Locale) => {
    if (l === locale || pending) return
    start(async () => {
      await setLocale(l, session.status === 'user')
      router.refresh()
    })
  }
  return (
    <div className={`locale-switch ${className}`.trim()} role="group" aria-label={t('common.language.label')} aria-busy={pending || undefined}>
      {LOCALES.map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={l === locale} onClick={() => pick(l)}
          title={t('common.language.switchTo', { name: t(`common.language.${l}`) })}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
