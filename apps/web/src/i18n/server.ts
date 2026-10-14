// Sunucu bileşenleri ve route handler'lar için dil: çerez → users.locale → Accept-Language → 'tr' (resolveLocale).
import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import { getCurrentUser } from '@/lib/auth/current'
import { authEnabled } from '@/lib/flags'
import { createT, LOCALE_COOKIE, resolveLocale, type Locale, type TFunction } from './index'

/** İstek başına bir kez çözülür (React cache). Çerez varsa DB'ye gidilmez. */
export const getLocale = cache(async (): Promise<Locale> => {
  const jar = await cookies()
  const cookie = jar.get(LOCALE_COOKIE)?.value
  if (cookie === 'tr' || cookie === 'en') return cookie
  const user = authEnabled() ? await getCurrentUser().catch(() => null) : null
  const acceptLanguage = (await headers()).get('accept-language')
  return resolveLocale({ cookie, userLocale: user?.locale, acceptLanguage })
})

export async function getT(): Promise<TFunction> {
  return createT(await getLocale())
}
