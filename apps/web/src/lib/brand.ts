// Marka katmanı: aynı uygulama alan adına göre MacademiaX ya da bir iş ortağı (Dilkur Akademi) kılığında açılır.
// Dersler, laboratuvar, hesaplar ve öğretmen paneli ortaktır; değişen logo, renk (html[data-brand] → app/brand-*.css),
// üst menünün dış bağlantıları, alt bilgi ve ana sayfadır. Saf veri; sunucu tarafı çözüm lib/brand-server.ts'te.
import type { Locale } from '@/i18n'

export type BrandId = 'macademiax' | 'dilkur'

interface BrandText { name: string; title: string; topbar: string; footDesc: string; copy: string; kidsGroup: string; adultsGroup: string }

export interface Brand {
  id: BrandId
  /** Kanonik site adresi (metadataBase, paylaşım). */
  siteUrl: string
  tr: BrandText
  en: BrandText
  /** Üst menüde Hakkımızda / İletişim'in gittiği yer (iş ortağının kendi sitesi). */
  aboutHref: string
  contactHref: string
  /** Mega menünün son sütunu (Macademia'nın diğer programları) gösterilsin mi. */
  macademiaPrograms: boolean
  /** Alt bilgide kurucu kartı. */
  founderCard: boolean
  /** Alt bilgide "X altyapısıyla" notu (iş ortağı markalarında). */
  poweredBy: boolean
  logo?: { badge: string; footer: string; icon: string }
  contact?: { phone: string; phoneHref: string; whatsapp: string; email: string; address: string; social: Array<{ label: string; href: string }> }
}

const MACADEMIA_URL = 'https://www.macademia.com.tr/'
const DILKUR_URL = 'https://www.dilkurakademi.com/'

export const BRANDS: Record<BrandId, Brand> = {
  macademiax: {
    id: 'macademiax', siteUrl: 'https://robotix.macademia.com.tr',
    tr: { name: 'MacademiaX', title: 'MacademiaX', topbar: '', footDesc: '', copy: '', kidsGroup: '', adultsGroup: '' },
    en: { name: 'MacademiaX', title: 'MacademiaX', topbar: '', footDesc: '', copy: '', kidsGroup: '', adultsGroup: '' },
    aboutHref: `${MACADEMIA_URL}#hakkimizda`, contactHref: `${MACADEMIA_URL}#iletisim`,
    macademiaPrograms: true, founderCard: true, poweredBy: false,
  },
  dilkur: {
    id: 'dilkur', siteUrl: 'https://dilkur.macademia.com.tr',
    tr: {
      name: 'Dilkur Akademi', title: 'Dilkur Akademi Robotik',
      topbar: 'Okullar için Robotik ve Mühendislik · anaokulundan liseye',
      footDesc: 'Dilkur Akademi Robotik ve Mühendislik: anaokulunda blokla kodlamadan lisede sensörlere, yapay zekâya ve drone\'lara. Her şey tarayıcıda, kit gerekmez.',
      copy: '© 2026 Dilkur Akademi. Tüm hakları saklıdır.',
      kidsGroup: 'Çocuklar için Robotik', adultsGroup: 'Mühendislik Yolu',
    },
    en: {
      name: 'Dilkur Akademi', title: 'Dilkur Akademi Robotics',
      topbar: 'Robotics and Engineering for schools · from kindergarten to high school',
      footDesc: 'Dilkur Akademi Robotics and Engineering: from block coding in kindergarten to sensors, AI and drones in high school. Everything runs in the browser, no kit needed.',
      copy: '© 2026 Dilkur Akademi. All rights reserved.',
      kidsGroup: 'Robotics for Kids', adultsGroup: 'Engineering Path',
    },
    aboutHref: `${DILKUR_URL}hakkimizda`, contactHref: '/#teklif',
    macademiaPrograms: false, founderCard: false, poweredBy: true,
    logo: { badge: '/brand/dilkur/logo.png', footer: '/brand/dilkur/logo-beyaz.png', icon: '/brand/dilkur/icon.png' },
    contact: {
      phone: '+90 546 689 86 66', phoneHref: 'tel:+905466898666', whatsapp: 'https://wa.me/905466898666', email: 'info@dilkurakademi.com',
      address: 'İpekyolu İş Merkezi 10. Kat No:60, 68100 Aksaray / Merkez',
      social: [
        { label: 'Instagram', href: 'https://www.instagram.com/dilkurakademi' },
        { label: 'Facebook', href: 'https://www.facebook.com/dilkurakademi' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/company/dilkurakademi' },
      ],
    },
  },
}

/** Alan adından marka: dilkur.* → Dilkur, geri kalanı MacademiaX. `override` (BRAND ortam değişkeni) yerel geliştirme içindir. */
export function brandForHost(host: string | null | undefined, override?: string): Brand {
  if (override && override in BRANDS) return BRANDS[override as BrandId]
  const h = (host ?? '').toLowerCase().split(':')[0]
  if (h === 'dilkur.macademia.com.tr' || h.startsWith('dilkur.')) return BRANDS.dilkur
  return BRANDS.macademiax
}

export const brandText = (b: Brand, locale: Locale): BrandText => b[locale]
