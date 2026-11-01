// Geri al / yinele. Tasarım tezgâhında yanlış silinen bloğun dönüşü olsun diye.
//
// Saf veri yapısı: React'e bağlı değil, Node'da sınanır. Değişmez (immutable)
// kullanılır — her işlem yeni bir yığın döndürür, böylece React durumu olarak
// doğrudan tutulabilir.

export interface History<T> {
  /** Geçmiş + şimdi + gelecek. `at` şu anki konum. */
  stack: T[]
  at: number
  /** Yığında tutulacak en çok adım; aşılırsa en eskisi düşer. */
  limit: number
}

export const DEFAULT_LIMIT = 50

export function initHistory<T>(present: T, limit = DEFAULT_LIMIT): History<T> {
  return { stack: [present], at: 0, limit: Math.max(1, limit) }
}

export function present<T>(h: History<T>): T {
  return h.stack[h.at]
}

export function canUndo<T>(h: History<T>): boolean {
  return h.at > 0
}

export function canRedo<T>(h: History<T>): boolean {
  return h.at < h.stack.length - 1
}

/**
 * Yeni bir durum ekler. İleri adımlar (yinele dalı) atılır: yeni bir yol seçildi.
 * Durum bir öncekiyle aynıysa yığın büyümez — ölçü alanında her tuşa basışta
 * yeni adım birikmesin diye çağıran taraf ayrıca `coalesce` kullanabilir.
 */
export function push<T>(h: History<T>, next: T): History<T> {
  if (Object.is(next, present(h))) return h
  const stack = [...h.stack.slice(0, h.at + 1), next]
  const over = stack.length - h.limit
  return over > 0
    ? { ...h, stack: stack.slice(over), at: stack.length - over - 1 }
    : { ...h, stack, at: stack.length - 1 }
}

/**
 * Son adımın yerine yazar (yeni adım açmadan). Sürekli değişen bir alanda
 * (kaydırıcı, sayı kutusu) her değişiklik ayrı bir "geri al" adımı olmasın diye.
 */
export function replace<T>(h: History<T>, next: T): History<T> {
  const stack = [...h.stack]
  stack[h.at] = next
  return { ...h, stack }
}

export function undo<T>(h: History<T>): History<T> {
  return canUndo(h) ? { ...h, at: h.at - 1 } : h
}

export function redo<T>(h: History<T>): History<T> {
  return canRedo(h) ? { ...h, at: h.at + 1 } : h
}

/** Geçmişi şimdiki durumla sıfırlar (ör. başka bir tasarım yüklendi). */
export function resetHistory<T>(h: History<T>, next: T): History<T> {
  return initHistory(next, h.limit)
}
