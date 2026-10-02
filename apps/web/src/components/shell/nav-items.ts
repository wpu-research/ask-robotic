import type { IconName } from './icons'

export interface NavItem { href: string; label: string; icon: IconName; soon?: boolean; /** Alt çubukta (mobil) görünür. */ tab?: boolean }
export interface NavGroup { title: string; items: NavItem[] }

// `soon: true` işaretli öğeler devre dışı görünür ("Yakında"); şu an hepsi aktiftir.
export const NAV: NavGroup[] = [
  {
    title: 'Öğren',
    items: [
      { href: '/', label: 'Panel', icon: 'panel', tab: true },
      { href: '/moduller', label: 'Modüller', icon: 'moduller', tab: true },
    ],
  },
  {
    title: 'Araçlar',
    items: [
      { href: '/atolye', label: 'Blok atölyesi', icon: 'atolye', tab: true },
      { href: '/laboratuvar', label: 'Devre laboratuvarı', icon: 'laboratuvar', tab: true },
      { href: '/arena', label: 'Robot arenası', icon: 'arena', tab: true },
      { href: '/oyunlar', label: 'Oyunlar', icon: 'oyun' },
      { href: '/mikro-kart', label: 'Mikro Kart atölyesi', icon: 'mikro' },
      { href: '/oyun-atolyesi', label: 'Oyun atölyesi', icon: 'oyun' },
      { href: '/sahne-atolyesi', label: 'Sahne atölyesi', icon: 'sahne' },
      { href: '/ai-atolyesi', label: 'AI atölyesi', icon: 'ai' },
    ],
  },
  {
    title: 'Öğrenme',
    items: [
      { href: '/parcalar', label: 'Parçalar', icon: 'parcalar' },
      { href: '/testler', label: 'Testlerim', icon: 'testler' },
      { href: '/ilerleme', label: 'İlerlemem', icon: 'ilerleme' },
    ],
  },
]

/** Menüde işaretli öğe: "/" yalnız tam eşleşme, diğerleri önek (ders sayfası Modüller altında sayılır). */
export function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  if (href === '/moduller') return pathname.startsWith('/moduller') || pathname.startsWith('/ders')
  return pathname === href || pathname.startsWith(`${href}/`)
}
