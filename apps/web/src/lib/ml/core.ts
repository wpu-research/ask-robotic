// Makine Öğrenmesi (sıfırdan) dersleri: ortak tipler, sabit tohumlu rastgele sayılar, küçük vektör yardımcıları.
// Algoritmalar saf fonksiyondur (DOM yok): bir parametre kümesinden baştan sona bir "iz" (Frame dizisi) üretir; oynatıcı bu izi
// kare kare çizer ve her karede kodun hangi satırının çalıştığını vurgular. Aynı tohum her zaman aynı sayıları verir.

import type { EgitimRaporu } from './egitim/rapor'

export type Lang = 'tr' | 'en'
export type Bi = { tr: string; en: string }
/** İki dilli kısa metin: [Türkçe, İngilizce]. */
export type Cap = [string, string]

export interface Frame {
  /** Vurgulanan kod satırı (0'dan başlar). */
  line: number
  /** Sahnenin altındaki sol yazı (ör. "deneme 5 · tur 6") ve sağ yazı (ör. "600 nokta · k = 3"). */
  cap: Cap
  stat?: Cap
  /** Göreli süre (1 = normal kare). */
  hold?: number
}

export interface Pt { x: number; y: number; c: number }

/** mulberry32: küçük, hızlı, tekrarlanabilir 32 bit üreteç. [0, 1) döndürür. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Standart normal (Box-Muller). */
export function gauss(r: () => number): number {
  let u = 0, v = 0
  while (u === 0) u = r()
  while (v === 0) v = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** Dizide tekrarsız k indeks (Fisher-Yates'in ilk k adımı). */
export function choice(r: () => number, n: number, k: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i)
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(r() * (n - i))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx.slice(0, k)
}

export const mean = (a: readonly number[]): number => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0)
export const variance = (a: readonly number[]): number => { const m = mean(a); return mean(a.map((x) => (x - m) ** 2)) }
export const std = (a: readonly number[]): number => Math.sqrt(variance(a))
export const d2 = (ax: number, ay: number, bx: number, by: number): number => (ax - bx) ** 2 + (ay - by) ** 2
export const round = (x: number, d = 2): number => { const f = 10 ** d; return Math.round(x * f) / f }

/** Sayıyı arayüz diline göre biçimler (Türkçede ondalık virgül). */
export function fmt(x: number, d: number, lang: Lang): string {
  const s = x.toFixed(d)
  return lang === 'tr' ? s.replace('.', ',') : s
}
/** İki dilli başlık yardımcı: aynı sayılarla iki metin. */
export const cap = (tr: string, en: string): Cap => [tr, en]

export type CodeLine = [code: string, tr?: string, en?: string]

/** Bir ders: metinler, Python kodu, parametreler ve iz üreteci. Çizim components/ml/draw.ts'te (ders slug'ına göre). */
export interface ParamDef { key: string; label: Bi; min: number; max: number; step: number; value: number }
export interface Lesson<F extends Frame = Frame> {
  slug: string
  /** Kurs içindeki sıra numarası; lessons.ts bölüm sırasına göre yeniden verir. */
  n: number
  /** Bölüm kimliği (lib/ml/sections.ts); lessons.ts doldurur. */
  section?: string
  title: Bi
  /** Kartta ve başlıkta tek satır. */
  sub: Bi
  /** Veri kümesinin hikâyesi (robotik bağlam). */
  story: Bi
  /** "Nasıl çalışır" maddeleri. */
  how: Bi[]
  /** "Neden önemli" paragrafı. */
  why: Bi
  /** Kod dosyasının adı ve satırları (Python + NumPy): [kod, Türkçe yorum, İngilizce yorum]; yorumlar dile göre eklenir. */
  file: string
  code: CodeLine[]
  params: ParamDef[]
  run: (p: Record<string, number>) => F[]
  /**
   * Eğitim paneli: aynı parametrelerle gerçek eğitimi çalıştırıp geçmişi, son ölçümleri ve grafik tariflerini döndürür
   * (lib/ml/egitim/rapor.ts). Model eğitmeyen / değerlendirmeyen derslerde yoktur.
   */
  report?: (p: Record<string, number>) => EgitimRaporu
}

/**
 * Kod listesinde `at` satırından sonra `k` satır eklendiyse, iz karelerinin vurguladığı satırları kaydırır. Veri setini CSV'den
 * açan satırlar eklenince her dersin `run`'ı yeniden numaralanmasın diye kullanılır.
 */
export const shifted = <F extends Frame>(run: (p: Record<string, number>) => F[], at: number, k: number) =>
  (p: Record<string, number>): F[] => run(p).map((f) => (f.line > at ? { ...f, line: f.line + k } : f))
