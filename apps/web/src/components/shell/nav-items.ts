import type { MessageKey } from '@/i18n'
import type { IconName } from './icons'

export interface NavItem { href: string; /** Türkçe ad (testler ve dil bağımsız tüketiciler); arayüz `key` ile çevirir. */ label: string; key: MessageKey; icon: IconName; soon?: boolean; /** Alt çubukta (mobil) görünür. */ tab?: boolean }
export interface NavGroup { title: string; key: MessageKey; items: NavItem[]; /** Atölyeler panelindeki alt başlık ve renk tonu. */ desc?: MessageKey; tone?: 'kids' | 'adults' | 'learning' }

/** Macademia ana sitesi: MacademiaX onun robotik ve mühendislik programıdır. */
export const MACADEMIA_URL = 'https://www.macademia.com.tr/'

/**
 * Üst menü, macademia.online ile aynı sırada: Anasayfa · Hakkımızda · Yöntemimiz · Eğitimler ▾ · Kurumsal Eğitimler · İletişim.
 * Hakkımızda, Yöntemimiz ve İletişim Macademia'nın kendi bölümleridir; Kurumsal Eğitimler MacademiaX'in okul sayfasıdır.
 * `drop`: Eğitimler mega menüsünün yeri.
 */
export interface MainLink { key: MessageKey; href: string; external?: boolean; drop?: boolean }
export const MAIN_NAV: MainLink[] = [
  { key: 'shell.mnav.home', href: '/' },
  { key: 'shell.mnav.about', href: `${MACADEMIA_URL}#hakkimizda`, external: true },
  { key: 'shell.mnav.method', href: `${MACADEMIA_URL}#yontem`, external: true },
  { key: 'shell.mnav.programs', href: '/konular', drop: true },
  { key: 'shell.mnav.corporate', href: '/okullar' },
  { key: 'shell.mnav.contact', href: `${MACADEMIA_URL}#iletisim`, external: true },
]

/** Eğitimler mega menüsünün son sütunu: Macademia'nın diğer programları. */
export const MACADEMIA_PROGRAMS: Array<{ key: MessageKey; href: string }> = [
  { key: 'shell.macademia.kodlama', href: `${MACADEMIA_URL}#p-kodlama` },
  { key: 'shell.macademia.matematik', href: `${MACADEMIA_URL}#p-matematik` },
  { key: 'shell.macademia.tus', href: `${MACADEMIA_URL}#p-tus` },
  { key: 'shell.macademia.hmgs', href: `${MACADEMIA_URL}#p-hmgs` },
  { key: 'shell.macademia.yds', href: `${MACADEMIA_URL}#p-yds` },
  { key: 'shell.macademia.all', href: MACADEMIA_URL },
]

// `soon: true` işaretli öğeler devre dışı görünür ("Yakında"); şu an hepsi aktiftir.
export const NAV: NavGroup[] = [
  {
    title: 'Öğren', key: 'shell.groups.learn',
    items: [
      { href: '/panel', label: 'Ana sayfa', key: 'shell.nav.home', icon: 'panel', tab: true },
      { href: '/konular', label: 'Konular', key: 'shell.nav.topics', icon: 'moduller', tab: true },
      { href: '/okullar', label: 'Okullar için', key: 'shell.nav.schools', icon: 'book' },
    ],
  },
  {
    title: 'Çocuklar için', key: 'shell.groups.kids', desc: 'shell.groupDesc.kids', tone: 'kids',
    items: [
      { href: '/atolye', label: 'Blok atölyesi', key: 'shell.nav.blocks', icon: 'atolye', tab: true },
      { href: '/robot-atolyesi', label: 'Robot atölyesi', key: 'shell.nav.robotStudio', icon: 'arena' },
      { href: '/mikro-kart', label: 'Mikro Kart atölyesi', key: 'shell.nav.microCard', icon: 'mikro' },
      { href: '/robotun-gozleri', label: 'Robotun Gözleri', key: 'shell.nav.vision', icon: 'eye' },
      { href: '/oyun-atolyesi', label: 'Oyun atölyesi', key: 'shell.nav.gameStudio', icon: 'oyun' },
      { href: '/sahne-atolyesi', label: 'Sahne atölyesi', key: 'shell.nav.stage', icon: 'sahne' },
      { href: '/oyunlar', label: 'Oyunlar', key: 'shell.nav.games', icon: 'oyun' },
    ],
  },
  {
    title: 'Büyükler için', key: 'shell.groups.adults', desc: 'shell.groupDesc.adults', tone: 'adults',
    items: [
      { href: '/laboratuvar', label: 'Devre laboratuvarı', key: 'shell.nav.lab', icon: 'laboratuvar', tab: true },
      { href: '/arena', label: 'Robot arenası', key: 'shell.nav.arena', icon: 'arena', tab: true },
      { href: '/ai-atolyesi', label: 'AI atölyesi', key: 'shell.nav.ai', icon: 'ai' },
      { href: '/makine-ogrenmesi', label: 'Makine öğrenmesi', key: 'shell.nav.ml', icon: 'ai' },
      { href: '/robotun-gozleri/demolar', label: 'Gerçek hayat demoları', key: 'shell.nav.cvDemos', icon: 'eye' },
      { href: '/muhendislik', label: 'Mühendislik yolu', key: 'shell.nav.engineering', icon: 'drone' },
      { href: '/muhendislik/robotik', label: 'Robotik dersi', key: 'shell.nav.robotics', icon: 'book' },
      { href: '/muhendislik/drone', label: 'Drone dersi', key: 'shell.nav.drone', icon: 'drone' },
      { href: '/muhendislik/llm', label: 'LLM uygulamaları', key: 'shell.nav.llm', icon: 'ai' },
      { href: '/programlar', label: 'Programlar', key: 'shell.nav.programs', icon: 'book' },
    ],
  },
  {
    title: 'Öğrenme', key: 'shell.groups.learning', desc: 'shell.groupDesc.learning', tone: 'learning',
    items: [
      { href: '/parcalar', label: 'Parçalar', key: 'shell.nav.parts', icon: 'parcalar' },
      { href: '/testler', label: 'Testlerim', key: 'shell.nav.tests', icon: 'testler' },
      { href: '/ilerleme', label: 'İlerlemem', key: 'shell.nav.progress', icon: 'ilerleme' },
      { href: '/lig', label: 'Sınıf ligi', key: 'shell.nav.league', icon: 'target' },
      { href: '/fiyatlar', label: 'Planlar ve fiyatlar', key: 'shell.nav.pricing', icon: 'spark' },
    ],
  },
]

/** Menüde işaretli öğe: "/" yalnız tam eşleşme, diğerleri önek (ders sayfası Modüller altında sayılır). */
export function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  // Panel: giriş yapmış kullanıcıda "/" da paneldir
  if (href === '/panel') return pathname === '/panel' || pathname === '/'
  if (href === '/konular') return pathname.startsWith('/konular') || pathname.startsWith('/moduller') || pathname.startsWith('/ders')
  // Robotik ve drone dersleri kendi menü öğelerinde işaretlenir, üst "Mühendislik yolu" değil
  if (href === '/muhendislik' && (pathname.startsWith('/muhendislik/robotik') || pathname.startsWith('/muhendislik/drone'))) return false
  if (href === '/muhendislik' && pathname.startsWith('/muhendislik/llm')) return false
  // Gerçek hayat demoları (büyükler) kendi öğesinde işaretlenir, çocukların "Robotun Gözleri" öğesinde değil
  if (href === '/robotun-gozleri' && pathname.startsWith('/robotun-gozleri/demolar')) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}
