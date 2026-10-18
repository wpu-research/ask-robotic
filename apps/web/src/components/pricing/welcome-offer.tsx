import { getDb } from '@/lib/db'
import { welcomeNoticeText, welcomeRemaining } from '@/lib/membership'
import { getT } from '@/i18n/server'

/** Kayıt kampanyası notu (ilk WELCOME_LIMIT kayda WELCOME_MONTHS ay Premium); kontenjan dolunca ya da DB yoksa hiçbir şey çizmez. */
export async function WelcomeOffer({ className }: { className: string }) {
  // getDb, DATABASE_URL yoksa eşzamanlı fırlatır; o yüzden async sarmal
  const remaining = await (async () => welcomeRemaining(getDb()))().catch(() => 0)
  const text = welcomeNoticeText(await getT(), remaining)
  return text ? <p className={className} role="note">{text}</p> : null
}
