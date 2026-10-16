// Oyun listesi için SAF meta (oyun kodunu yüklemez): kart, komut paleti ve sayfa yönlendirmesi bunu kullanır.
import type { GameSlug } from './types'

export interface GameMeta { slug: GameSlug; title: string; tagline: string; keywords: string; /** İngilizce ad ve kısa açıklama. */ titleEn: string; taglineEn: string }

export const GAME_META: GameMeta[] = [
  { slug: 'bulmaca', title: 'Bulmaca', tagline: 'Hayvan resimlerini doğru bloklarla eşleştirerek blokların nasıl birleştiğini öğren.', keywords: 'puzzle parça eşleştir', titleEn: 'Puzzle', taglineEn: 'Match animal pictures with the right blocks and learn how blocks fit together.' },
  { slug: 'labirent', title: 'Labirent', tagline: 'Küçük yolcuyu bloklarla yönlendirip labirentin çıkışına ulaştır.', keywords: 'maze yol döngü koşul', titleEn: 'Maze', taglineEn: 'Guide the little traveler through the maze to the exit with blocks.' },
  { slug: 'kus', title: 'Kuş', tagline: 'Kuşu solucana götür, sonra yuvasına geri döndür.', keywords: 'bird uçuş açı koşul', titleEn: 'Bird', taglineEn: 'Take the bird to the worm, then fly it back to its nest.' },
  { slug: 'kaplumbaga', title: 'Kaplumbağa', tagline: 'Kaplumbağayla ekrana şekiller ve renkli desenler çiz.', keywords: 'turtle çizim şekil renk', titleEn: 'Turtle', taglineEn: 'Draw shapes and colorful patterns on the screen with the turtle.' },
  { slug: 'film', title: 'Film', tagline: 'Matematikle hareketli resimler çizip kendi kısa filmini yap.', keywords: 'movie animasyon çizim', titleEn: 'Movie', taglineEn: 'Draw moving pictures with math and make your own short movie.' },
  { slug: 'muzik', title: 'Müzik', tagline: 'Notaları dizip tekrarlayarak kendi melodini besteler.', keywords: 'music nota melodi', titleEn: 'Music', taglineEn: 'Line up and repeat notes to compose your own tune.' },
  { slug: 'golet-egitmeni', title: 'Gölet Eğitmeni', tagline: 'Gölet\'e hazırlan: ördeğini yönlendirmeyi adım adım öğren.', keywords: 'pond tutor ördek eğitmen', titleEn: 'Pond Tutor', taglineEn: 'Get ready for Pond: learn to steer your duck step by step.' },
  { slug: 'golet', title: 'Gölet', tagline: 'Ördeğini programla ve rakip ördeklerle yarış.', keywords: 'pond ördek rekabet', titleEn: 'Pond', taglineEn: 'Program your duck and race against rival ducks.' },
]

export const GAME_SLUGS: GameSlug[] = GAME_META.map((g) => g.slug)
export const isGameSlug = (s: string): s is GameSlug => GAME_SLUGS.includes(s as GameSlug)
export const metaOf = (slug: string): GameMeta | undefined => GAME_META.find((g) => g.slug === slug)
export const LEVEL_COUNT = 10
