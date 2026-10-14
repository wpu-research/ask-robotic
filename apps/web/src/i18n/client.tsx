'use client'
// İstemci i18n: app/layout.tsx bir kez <I18nProvider locale> ile sarar. Sağlayıcı yoksa (testler) Türkçe.
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { createT, type Locale, type TFunction } from './index'
import { formatDate, formatDateTime, formatDuration, formatMoney, formatNumber, formatTimeAgo } from './format'

interface I18nValue { locale: Locale; t: TFunction }
const TR: I18nValue = { locale: 'tr', t: createT('tr') }
const Ctx = createContext<I18nValue>(TR)

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<I18nValue>(() => (locale === 'tr' ? TR : { locale, t: createT(locale) }), [locale])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useT = (): TFunction => useContext(Ctx).t
export const useLocale = (): Locale => useContext(Ctx).locale
export const useI18n = (): I18nValue => useContext(Ctx)

/** Dile bağlı biçimleyiciler. */
export function useFormat() {
  const locale = useLocale()
  return useMemo(() => ({
    number: (n: number, o?: Intl.NumberFormatOptions) => formatNumber(locale, n, o),
    money: (n: number, o?: Intl.NumberFormatOptions) => formatMoney(locale, n, o),
    date: (d: Date | number | string, o?: Intl.DateTimeFormatOptions) => formatDate(locale, d, o),
    dateTime: (d: Date | number | string) => formatDateTime(locale, d),
    timeAgo: (at: number, now?: number) => formatTimeAgo(locale, at, now),
    duration: (min: number) => formatDuration(locale, min),
  }), [locale])
}
