// /api/tutor akış sözleşmesi (istemci + sunucu). Yanıt düz metindir; REPLACE görülürse istemci ondan önceki
// metni atar ve sonrasını gösterir (ret ya da yarıda kalan hata için yedek mesaj).
export const REPLACE = '\u001e'
export const REFUSAL_TEXT = 'Bu konuda yardım edemiyorum. Hadi derse dönelim: bu adımda neyi denedin?'
export const ERROR_TEXT = 'Bağlantım koptu. Biraz sonra tekrar sorar mısın?'
export const EMPTY_TEXT = 'Hmm, bunu tam anlayamadım. Sorunu biraz farklı sorar mısın?'
/** Sunucunun akışa yazdığı sabit metinler, arayüz diline göre (tr yukarıdakilerle aynı). */
export const TUTOR_TEXTS = {
  tr: { refusal: REFUSAL_TEXT, error: ERROR_TEXT, empty: EMPTY_TEXT },
  en: {
    refusal: "I can't help with that. Let's get back to the lesson: what did you try on this step?",
    error: 'I lost my connection. Could you ask again in a moment?',
    empty: "Hmm, I didn't quite get that. Could you ask it a bit differently?",
  },
} as const

/** Akış metninden gösterilecek kısım. */
export const visibleText = (raw: string) => { const i = raw.lastIndexOf(REPLACE); return i < 0 ? raw : raw.slice(i + 1) }

/** İstek sınırları: en çok 12 mesaj, her biri en çok 600 karakter. */
export const MAX_MESSAGES = 12
export const MAX_CHARS = 600

/** Mac'in 2 yanlıştan sonra kendiliğinden önerdiği yardım. */
export const PROACTIVE_OFFER = 'Takıldıysan birlikte bakalım mı?'
