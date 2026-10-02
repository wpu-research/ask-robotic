// Oyun listesi için SAF meta (oyun kodunu yüklemez): kart, komut paleti ve sayfa yönlendirmesi bunu kullanır.
import type { GameSlug } from './types'

export interface GameMeta { slug: GameSlug; title: string; tagline: string; keywords: string }

export const GAME_META: GameMeta[] = [
  { slug: 'bulmaca', title: 'Bulmaca', tagline: 'Hayvan resimlerini doğru bloklarla eşleştirerek blokların nasıl birleştiğini öğren.', keywords: 'puzzle parça eşleştir' },
  { slug: 'labirent', title: 'Labirent', tagline: 'Küçük yolcuyu bloklarla yönlendirip labirentin çıkışına ulaştır.', keywords: 'maze yol döngü koşul' },
  { slug: 'kus', title: 'Kuş', tagline: 'Kuşu solucana götür, sonra yuvasına geri döndür.', keywords: 'bird uçuş açı koşul' },
  { slug: 'kaplumbaga', title: 'Kaplumbağa', tagline: 'Kaplumbağayla ekrana şekiller ve renkli desenler çiz.', keywords: 'turtle çizim şekil renk' },
  { slug: 'film', title: 'Film', tagline: 'Matematikle hareketli resimler çizip kendi kısa filmini yap.', keywords: 'movie animasyon çizim' },
  { slug: 'muzik', title: 'Müzik', tagline: 'Notaları dizip tekrarlayarak kendi melodini besteler.', keywords: 'music nota melodi' },
  { slug: 'golet-egitmeni', title: 'Gölet Eğitmeni', tagline: 'Gölet\'e hazırlan: ördeğini yönlendirmeyi adım adım öğren.', keywords: 'pond tutor ördek eğitmen' },
  { slug: 'golet', title: 'Gölet', tagline: 'Ördeğini programla ve rakip ördeklerle yarış.', keywords: 'pond ördek rekabet' },
]

export const GAME_SLUGS: GameSlug[] = GAME_META.map((g) => g.slug)
export const isGameSlug = (s: string): s is GameSlug => GAME_SLUGS.includes(s as GameSlug)
export const metaOf = (slug: string): GameMeta | undefined => GAME_META.find((g) => g.slug === slug)
export const LEVEL_COUNT = 10
