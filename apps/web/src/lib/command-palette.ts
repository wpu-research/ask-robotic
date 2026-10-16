// Komut paleti: öğe üretimi ve süzme. Saf (DOM yok), Türkçe büyük/küçük harf ve aksan duyarsız.
export type PaletteGroup = 'Sayfa' | 'Araç' | 'Modül' | 'Ders' | 'Parça'

export interface PaletteItem {
  id: string
  group: PaletteGroup
  title: string
  subtitle?: string
  href: string
  /** Aramada eşleşen ek sözcükler (görünmez). */
  keywords?: string
}

export const GROUP_ORDER: PaletteGroup[] = ['Sayfa', 'Araç', 'Modül', 'Ders', 'Parça']

/** "İ", "ı", "ö", "ş"… → ASCII küçük harf; tire/eğik çizgi boşluk olur. */
export function normTr(s: string): string {
  return s
    .replace(/İ/g, 'i').replace(/I/g, 'i')
    .toLocaleLowerCase('tr-TR')
    .replace(/[ıöüşçğâîû]/g, (c) => ({ ı: 'i', ö: 'o', ü: 'u', ş: 's', ç: 'c', ğ: 'g', â: 'a', î: 'i', û: 'u' })[c]!)
    .replace(/[-_/.,:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function score(item: PaletteItem, words: string[]): number {
  const title = normTr(item.title)
  const rest = normTr(`${item.subtitle ?? ''} ${item.keywords ?? ''}`)
  let total = 0
  for (const w of words) {
    if (title.startsWith(w)) total += 4
    else if (title.split(' ').some((t) => t.startsWith(w))) total += 3
    else if (title.includes(w)) total += 2
    else if (rest.includes(w)) total += 1
    else return -1 // her sözcük bir yerde geçmeli
  }
  return total
}

/** Boş sorguda her gruptan ilk birkaç öğe; doluda puan sırasına göre en çok `limit` sonuç (grup sırası korunur). */
export function filterPalette(items: PaletteItem[], query: string, limit = 24): PaletteItem[] {
  const words = normTr(query).split(' ').filter(Boolean)
  if (!words.length) {
    const quota: Record<PaletteGroup, number> = { Sayfa: 6, Araç: 6, Modül: 5, Ders: 0, Parça: 0 }
    return GROUP_ORDER.flatMap((g) => items.filter((i) => i.group === g).slice(0, quota[g]))
  }
  const scored = items.map((item, idx) => ({ item, idx, s: score(item, words) })).filter((x) => x.s >= 0)
  scored.sort((a, b) => b.s - a.s || GROUP_ORDER.indexOf(a.item.group) - GROUP_ORDER.indexOf(b.item.group) || a.idx - b.idx)
  const top = scored.slice(0, limit)
  // Gruplar bitişik görünsün: grup sırasına göre yeniden diz, grup içinde puan sırası kalsın.
  return GROUP_ORDER.flatMap((g) => top.filter((x) => x.item.group === g).map((x) => x.item))
}

export const STATIC_ITEMS: PaletteItem[] = [
  { id: 'p:panel', group: 'Sayfa', title: 'Panel', subtitle: 'Ana sayfa', href: '/panel', keywords: 'ana sayfa devam ilerleme' },
  { id: 'p:moduller', group: 'Sayfa', title: 'Modüller', subtitle: 'Tüm modüller', href: '/moduller', keywords: 'müfredat dersler' },
  { id: 'p:parcalar', group: 'Sayfa', title: 'Parçalar', subtitle: 'Parça ansiklopedisi', href: '/parcalar', keywords: 'led direnç buton potansiyometre buzzer arduino uno ansiklopedi bileşen' },
  { id: 'p:muhendislik', group: 'Sayfa', title: 'Mühendislik yolu', subtitle: 'Büyükler için robotik: 128 parça, 7 seviye', href: '/muhendislik', keywords: 'büyükler yetişkin üniversite mühendislik hyvex sensör motor sürücü l298n esc drone step servo mq gaz lidar imu güç batarya' },
  { id: 'p:robotik', group: 'Sayfa', title: 'Robotik dersi (ESOF 323)', subtitle: 'Üniversite robotik dersi, 14 hafta', href: '/muhendislik/robotik', keywords: 'esof 323 robotics üniversite ders hafta pid kinematik slam a* parçacık filtresi ros drone webots gazebo opencv derin öğrenme gömülü' },
  { id: 'p:testler', group: 'Sayfa', title: 'Testlerim', subtitle: 'Mini testler ve puanlar', href: '/testler', keywords: 'sınav quiz soru puan' },
  { id: 'p:ilerleme', group: 'Sayfa', title: 'İlerlemem', subtitle: 'Beceri haritası ve özet', href: '/ilerleme', keywords: 'beceri ustalık süre hedef veri verilerimi sil' },
  { id: 'a:atolye', group: 'Araç', title: 'Blok atölyesi', subtitle: 'Serbest blok programlama', href: '/atolye', keywords: 'blok scratch karakter' },
  { id: 'a:lab', group: 'Araç', title: 'Devre laboratuvarı', subtitle: 'Sanal Arduino ve devre', href: '/laboratuvar', keywords: 'arduino uno devre simülatör' },
  { id: 'a:arena', group: 'Araç', title: 'Robot arenası', subtitle: 'Sanal robot sürüşü', href: '/arena', keywords: 'robot çizgi labirent' },
  { id: 'a:oyunlar', group: 'Araç', title: 'Oyunlar', subtitle: 'Bloklarla 8 öğretici oyun', href: '/oyunlar', keywords: 'blockly games bulmaca labirent kuş kaplumbağa film müzik gölet' },
  { id: 'a:mikro-kart', group: 'Araç', title: 'Mikro Kart atölyesi', subtitle: 'Sanal LED kartı bloklarla programla', href: '/mikro-kart', keywords: 'mikro kart led düğme sensör radyo ivme pusula sanal kart' },
  { id: 'a:robot-atolyesi', group: 'Araç', title: 'Robot atölyesi', subtitle: 'Mikro Kart\'ı robota tak, bloklarla görev yap', href: '/robot-atolyesi', keywords: 'robot lego spike vincibot blok robotu mini gezgin çizgi izleyen mesafe sensörü renk sensörü motor' },
  { id: 'a:oyun-atolyesi', group: 'Araç', title: 'Oyun atölyesi', subtitle: 'Bloklarla kendi oyununu yap', href: '/oyun-atolyesi', keywords: 'oyun yap sprite harita piksel karakter platform' },
  { id: 'a:sahne-atolyesi', group: 'Araç', title: 'Sahne atölyesi', subtitle: 'Karakterlerini bloklarla canlandır', href: '/sahne-atolyesi', keywords: 'sahne sprite kostüm animasyon hikâye karakter arka plan ses scratch' },
  { id: 'a:ai-atolyesi', group: 'Araç', title: 'AI atölyesi', subtitle: 'Token, prompt, RAG, ajan ve eval araçları', href: '/ai-atolyesi', keywords: 'yapay zekâ ai llm token bpe prompt rag embedding ajan eval injection dil modeli' },
]
