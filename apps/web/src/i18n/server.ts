// Sunucu bileşenleri ve route handler'lar için dil: çerez → users.locale → 'tr' (resolveLocale; tarayıcı dili kullanılmaz).
import { cache } from 'react'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/auth/current'
import { authEnabled } from '@/lib/flags'
import { createT, LOCALE_COOKIE, resolveLocale, type Locale, type TFunction } from './index'

/** İstek başına bir kez çözülür (React cache). Çerez varsa DB'ye gidilmez. */
export const getLocale = cache(async (): Promise<Locale> => {
  const jar = await cookies()
  const cookie = jar.get(LOCALE_COOKIE)?.value
  if (cookie === 'tr' || cookie === 'en') return cookie
  const user = authEnabled() ? await getCurrentUser().catch(() => null) : null
  return resolveLocale({ cookie, userLocale: user?.locale })
})

export async function getT(): Promise<TFunction> {
  return createT(await getLocale())
}
