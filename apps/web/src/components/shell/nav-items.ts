import type { MessageKey } from '@/i18n'
import type { IconName } from './icons'

export interface NavItem { href: string; /** Türkçe ad (testler ve dil bağımsız tüketiciler); arayüz `key` ile çevirir. */ label: string; key: MessageKey; icon: IconName; soon?: boolean; /** Alt çubukta (mobil) görünür. */ tab?: boolean }
export interface NavGroup { title: string; key: MessageKey; items: NavItem[] }

/** Üst menüde doğrudan görünen bağlantılar; geri kalanı "Atölyeler" açılır panelinde ve çekmecede. */
export const TOP_NAV: NavItem[] = [
  { href: '/panel', label: 'Ana sayfa', key: 'shell.nav.home', icon: 'panel' },
  { href: '/konular', label: 'Konular', key: 'shell.nav.topics', icon: 'moduller' },
  { href: '/okullar', label: 'Okullar için', key: 'shell.nav.schools', icon: 'book' },
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
    title: 'Araçlar', key: 'shell.groups.tools',
    items: [
      { href: '/atolye', label: 'Blok atölyesi', key: 'shell.nav.blocks', icon: 'atolye', tab: true },
      { href: '/laboratuvar', label: 'Devre laboratuvarı', key: 'shell.nav.lab', icon: 'laboratuvar', tab: true },
      { href: '/arena', label: 'Robot arenası', key: 'shell.nav.arena', icon: 'arena', tab: true },
      { href: '/oyunlar', label: 'Oyunlar', key: 'shell.nav.games', icon: 'oyun' },
      { href: '/mikro-kart', label: 'Mikro Kart atölyesi', key: 'shell.nav.microCard', icon: 'mikro' },
      { href: '/robot-atolyesi', label: 'Robot atölyesi', key: 'shell.nav.robotStudio', icon: 'arena' },
      { href: '/oyun-atolyesi', label: 'Oyun atölyesi', key: 'shell.nav.gameStudio', icon: 'oyun' },
      { href: '/sahne-atolyesi', label: 'Sahne atölyesi', key: 'shell.nav.stage', icon: 'sahne' },
      { href: '/ai-atolyesi', label: 'AI atölyesi', key: 'shell.nav.ai', icon: 'ai' },
    ],
  },
  {
    title: 'Öğrenme', key: 'shell.groups.learning',
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
  return pathname === href || pathname.startsWith(`${href}/`)
}
