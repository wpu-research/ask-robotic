import type { IconName } from './icons'

export interface NavItem { href: string; label: string; icon: IconName; soon?: boolean; /** Alt çubukta (mobil) görünür. */ tab?: boolean }
export interface NavGroup { title: string; items: NavItem[] }

// "Yakında" öğeler şimdilik devre dışı; menüde yerleri ayrılmıştır.
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
    ],
  },
  {
    title: 'Yakında',
    items: [
      { href: '#parcalar', label: 'Parçalar', icon: 'parcalar', soon: true },
      { href: '#testlerim', label: 'Testlerim', icon: 'testler', soon: true },
      { href: '#ilerlemem', label: 'İlerlemem', icon: 'ilerleme', soon: true },
    ],
  },
]

/** Menüde işaretli öğe: "/" yalnız tam eşleşme, diğerleri önek (ders sayfası Modüller altında sayılır). */
export function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  if (href === '/moduller') return pathname.startsWith('/moduller') || pathname.startsWith('/ders')
  return pathname === href || pathname.startsWith(`${href}/`)
}
