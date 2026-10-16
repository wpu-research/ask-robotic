// Ortak metin yardımcıları: Türkçe küçük harf, kelime ayırma, çok basit gövdeleme, rastgelelik.

export const trLower = (s: string): string => s.toLocaleLowerCase('tr-TR')

/** Örnek metinlerin / hesapların dili. Ders etkinlikleri her zaman 'tr'; serbest atölye site diline uyar. */
export type ContentLang = 'tr' | 'en'
/** Dile göre küçük harf (Türkçede I → ı; İngilizcede I → i). */
export const lowerOf = (s: string, lang: ContentLang = 'tr'): string => (lang === 'en' ? s.toLocaleLowerCase('en-US') : trLower(s))

/** Harf ve rakam dizilerini kelime sayar. */
export function words(s: string, lang: ContentLang = 'tr'): string[] {
  return lowerOf(s, lang).match(/[\p{L}\p{N}]+/gu) ?? []
}

/** Çok basit "gövdeleme": kelimenin ilk 5 harfini tutar. Gerçek bir Türkçe çözümleyici DEĞİLDİR (ders için sadeleştirildi). */
export function stem(w: string): string {
  return w.length > 5 ? w.slice(0, 5) : w
}

export const STOP_WORDS: ReadonlySet<string> = new Set([
  've', 'bir', 'bu', 'şu', 'o', 'için', 'ile', 'de', 'da', 'mi', 'mı', 'mu', 'mü', 'ne', 'nasıl', 'kadar', 'en', 'çok', 'gibi', 'ama', 'veya', 'ya', 'ki', 'her', 'olarak', 'kaç', 'hangi',
])

/** İngilizce bağlaç/edat listesi (serbest atölyenin İngilizce örnekleri için). */
export const STOP_WORDS_EN: ReadonlySet<string> = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'is', 'are', 'was', 'be', 'it', 'its', 'this', 'that', 'as', 'how', 'what', 'which', 'when', 'do', 'does', 'can', 'very', 'so', 'if', 'than', 'then', 'into', 'each', 'every', 'much', 'many',
])
export const stopWordsOf = (lang: ContentLang = 'tr'): ReadonlySet<string> => (lang === 'en' ? STOP_WORDS_EN : STOP_WORDS)

/** Tohumlu, deterministik rastgele sayı üreteci (mulberry32). 0 <= x < 1. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x))
export const round = (x: number, d = 2): number => { const m = 10 ** d; return Math.round(x * m) / m }
