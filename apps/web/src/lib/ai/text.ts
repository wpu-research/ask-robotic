// Ortak metin yardımcıları: Türkçe küçük harf, kelime ayırma, çok basit gövdeleme, rastgelelik.

export const trLower = (s: string): string => s.toLocaleLowerCase('tr-TR')

/** Harf ve rakam dizilerini kelime sayar. */
export function words(s: string): string[] {
  return trLower(s).match(/[\p{L}\p{N}]+/gu) ?? []
}

/** Çok basit "gövdeleme": kelimenin ilk 5 harfini tutar. Gerçek bir Türkçe çözümleyici DEĞİLDİR (ders için sadeleştirildi). */
export function stem(w: string): string {
  return w.length > 5 ? w.slice(0, 5) : w
}

export const STOP_WORDS: ReadonlySet<string> = new Set([
  've', 'bir', 'bu', 'şu', 'o', 'için', 'ile', 'de', 'da', 'mi', 'mı', 'mu', 'mü', 'ne', 'nasıl', 'kadar', 'en', 'çok', 'gibi', 'ama', 'veya', 'ya', 'ki', 'her', 'olarak', 'kaç', 'hangi',
])

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
