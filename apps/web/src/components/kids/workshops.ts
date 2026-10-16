// Atölye listesi (saf veri: sunucu ve istemci bileşenleri birlikte kullanır).
import type { ArtKind } from './art'

export interface Workshop { href: string; art: ArtKind; k: string; age: string }

/** Çocukların en çok kullandığı atölyeler önce. */
export const WORKSHOPS: Workshop[] = [
  { href: '/robot-atolyesi', art: 'robot', k: 'robot', age: '8+' },
  { href: '/mikro-kart', art: 'mikro', k: 'micro', age: '8+' },
  { href: '/oyun-atolyesi', art: 'oyun', k: 'gameStudio', age: '8+' },
  { href: '/atolye', art: 'blok', k: 'blocks', age: '5+' },
  { href: '/sahne-atolyesi', art: 'sahne', k: 'stage', age: '8+' },
  { href: '/oyunlar', art: 'oyunlar', k: 'games', age: '5+' },
  { href: '/laboratuvar', art: 'devre', k: 'lab', age: '12+' },
  { href: '/arena', art: 'arena', k: 'arena', age: '13+' },
  { href: '/ai-atolyesi', art: 'ai', k: 'ai', age: '13+' },
  { href: '/parcalar', art: 'parcalar', k: 'parts', age: '10+' },
]
