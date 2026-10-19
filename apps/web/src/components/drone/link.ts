// 2B simülasyon denetimleri (sims.ts) ile 3B sahne arasındaki köprü: sim, kaydırıcı her değiştiğinde güncel parametreleri
// yazar; 3B sahne her karede rev'e bakar, değiştiyse kendi koşusunu yeniden kurar. three.js içermez.
export interface SimLink {
  data: Record<string, unknown>
  rev: number
  set(d: Record<string, unknown>): void
}

export function createLink(): SimLink {
  const l: SimLink = { data: {}, rev: 0, set(d) { l.data = { ...l.data, ...d }; l.rev++ } }
  return l
}
