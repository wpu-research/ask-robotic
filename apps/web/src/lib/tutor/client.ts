// Robi sohbet panelinin saf yardımcıları (tarayıcı). Sunucu sınırları: lib/tutor/request.ts.
import { MAX_CHARS, MAX_MESSAGES } from './protocol'
import { translate, type Locale, type MessageKey } from '@/i18n'

export interface ChatMsg { role: 'user' | 'assistant'; content: string; /** Yerel bildirim (hata/çevrimdışı): sunucuya gönderilmez. */ local?: boolean }

/** İstek geçmişi: yerel bildirimler ve boşlar atılır, son 12 mesaj, her biri ≤ 600 karakter, öğrenciyle başlar. */
export function historyForRequest(msgs: ChatMsg[]): { role: 'user' | 'assistant'; content: string }[] {
  const out = msgs
    .filter((m) => !m.local && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }))
    .slice(-MAX_MESSAGES)
  while (out.length && out[0].role !== 'user') out.shift()
  return out
}

export const OFFLINE_TEXT = 'Robi şu an çevrimdışı. Biraz sonra yine dene!'

/** Sunucu hata kodu → çocuğa uygun mesaj (arayüz dilinde; varsayılan Türkçe). Metinler: i18n lesson.tutor.err. */
export function tutorErrorText(code: string | undefined, locale: Locale = 'tr'): string {
  const k = (key: MessageKey) => translate(locale, key)
  switch (code) {
    case 'tutor_disabled': return k('lesson.tutor.err.offline')
    case 'daily_limit': return k('lesson.tutor.err.dailyLimit')
    case 'too_fast': return k('lesson.tutor.err.tooFast')
    case 'tutor_not_allowed': return k('lesson.tutor.err.notAllowed')
    case 'tutor_busy': return k('lesson.tutor.err.busy')
    default: return k('lesson.tutor.err.generic')
  }
}
