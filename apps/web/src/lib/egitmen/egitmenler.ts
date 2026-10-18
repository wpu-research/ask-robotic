// Eğitmen profilleri (/egitmen/[slug]) ve ders sayfalarındaki eğitmen kartı. Kişiye özgü metin burada TR/EN;
// sayfa etiketleri (başlıklar, düğmeler) i18n sözlüğünde (instructor ad alanı).
import { SITE_URL } from '@/lib/site'

export type Lang = 'tr' | 'en'

export interface Publication {
  title: string
  venue: string
  year: number
  kind: 'journal' | 'conference'
}

export interface InstructorText {
  /** Profil başlığının altındaki uzun görev tanımı. */
  role: string
  /** Kartta görünen kısa görev. */
  short: string
  /** Biyografi paragrafları. */
  bio: string[]
  expertise: string[]
  theses: Array<{ degree: string; title: string; year: number }>
}

export interface Instructor {
  slug: string
  /** Unvanıyla ad, dile göre (TR: Dr. Öğr. Üyesi, EN: Asst. Prof. Dr.). */
  name: { tr: string; en: string }
  /** Ad soyad (JSON-LD givenName/familyName). */
  given: string
  family: string
  honorific: { tr: string; en: string }
  photo: { webp480: string; jpg480: string; webp160: string; jpg160: string }
  affiliation: { tr: string; en: string }
  alumni: { tr: string; en: string }
  publications: Publication[]
  /** Bu sitedeki dersleri: href + iki dilde ad. */
  courses: Array<{ href: string; code?: string; tr: string; en: string }>
  tr: InstructorText
  en: InstructorText
}

const MURAT: Instructor = {
  slug: 'murat-arslan',
  name: { tr: 'Dr. Öğr. Üyesi Murat Arslan', en: 'Asst. Prof. Dr. Murat ARSLAN' },
  given: 'Murat',
  family: 'Arslan',
  honorific: { tr: 'Dr. Öğr. Üyesi', en: 'Asst. Prof. Dr.' },
  photo: {
    webp480: '/img/egitmen/murat-arslan-480.webp',
    jpg480: '/img/egitmen/murat-arslan-480.jpg',
    webp160: '/img/egitmen/murat-arslan-160.webp',
    jpg160: '/img/egitmen/murat-arslan-160.jpg',
  },
  affiliation: { tr: 'Nişantaşı Üniversitesi', en: 'Nişantaşı University' },
  alumni: { tr: 'Yakın Doğu Üniversitesi', en: 'Near East University' },
  publications: [
    { title: 'Vehicle Detection Systems with Deep CNN', venue: 'Discover AI 3(1)', year: 2023, kind: 'journal' },
    { title: 'Student Performance Prediction (systematic literature review)', venue: 'Applied Sciences 11(22)', year: 2021, kind: 'journal' },
    { title: 'Identification of Epileptic EEG Signals Using CNN', venue: 'Applied Sciences 10(12)', year: 2020, kind: 'journal' },
    { title: 'Head Mouse Control System', venue: 'Expert Systems 37(1)', year: 2020, kind: 'journal' },
    { title: 'Sign Language Translation with Deep CNN', venue: 'KSII TIIS 14(2)', year: 2020, kind: 'journal' },
    { title: 'Vision-Based Drowsiness Detection (CNN)', venue: 'ICECCE', year: 2020, kind: 'conference' },
    { title: 'Impact of ML on Hand Gesture Recognition', venue: 'J. Intelligent & Fuzzy Systems 37(3)', year: 2019, kind: 'journal' },
    { title: 'Fuzzy Neural System for Erythemato-Squamous diseases', venue: 'Cyprus J. Med. Sci. 3(2)', year: 2018, kind: 'journal' },
    { title: 'Robot Pathfinding (vision-based)', venue: 'IEEE CYBCONF', year: 2017, kind: 'conference' },
    { title: 'NEUIslanders 2016 Team Description Paper', venue: 'RoboCup Small Size League', year: 2016, kind: 'conference' },
  ],
  courses: [
    { href: '/muhendislik/robotik', code: 'ESOF 323', tr: 'Robotik', en: 'Robotics' },
    { href: '/muhendislik', tr: 'Mühendislik yolu', en: 'Engineering path' },
    { href: '/makine-ogrenmesi', tr: 'Makine öğrenmesi, sıfırdan', en: 'Machine learning from scratch' },
    { href: '/robotun-gozleri', tr: 'Robotun Gözleri', en: 'Robot Eyes' },
  ],
  tr: {
    role: 'Nişantaşı Üniversitesi Yazılım Mühendisliği öğretim üyesi. ESOF 323 Robotik dersini veriyor; Macademia ve MacademiaX\'in kurucusu.',
    short: 'Nişantaşı Üniversitesi öğretim üyesi · Macademia ve MacademiaX kurucusu',
    bio: [
      'Yapay zekâ, bilgisayarlı görü ve robotik üzerine çalışan bir yazılım mühendisi ve akademisyen. Yüksek lisansını engel algılama ve yol bulma (2016), doktorasını CNN tabanlı, kafa hareketiyle fare kontrolü (2021) üzerine Yakın Doğu Üniversitesi\'nde tamamladı. Öğrenciyken NEUIslanders takımıyla RoboCup Small Size League\'de yarıştı.',
      'Çalışmaları derin öğrenmeyle işaret dili çevirisinden EEG sinyallerinde epilepsi tespitine, sürücü yorgunluğundan araç tespitine ve el hareketi tanımaya uzanıyor.',
      'Bugün Nişantaşı Üniversitesi\'nde robotik dersi veriyor. Macademia\'da da çocuklardan üniversite öğrencilerine kadar herkesin bilimi deneyerek öğrenebileceği bir platform kuruyor.',
    ],
    expertise: ['Robotik', 'Gömülü sistemler', 'Bilgisayarlı görü', 'Derin öğrenme', 'İnsan–bilgisayar etkileşimi', 'Eğitim teknolojileri'],
    theses: [
      { degree: 'Doktora', title: 'CNN tabanlı kafa hareketiyle fare kontrolü', year: 2021 },
      { degree: 'Yüksek lisans', title: 'Engel algılama ve yol bulma', year: 2016 },
    ],
  },
  en: {
    role: 'Faculty member in Software Engineering at Nişantaşı University. He teaches ESOF 323 Robotics and is the founder of Macademia and MacademiaX.',
    short: 'Faculty member, Nişantaşı University · Founder of Macademia and MacademiaX',
    bio: [
      'A software engineer and academic working on artificial intelligence, computer vision and robotics. He completed his master\'s degree on obstacle detection and pathfinding (2016) and his PhD on CNN-based mouse control through head movement (2021) at Near East University. As a student he competed in the RoboCup Small Size League with the NEUIslanders team.',
      'His work ranges from sign language translation with deep learning and epilepsy detection in EEG signals to driver drowsiness, vehicle detection and hand gesture recognition.',
      'Today he teaches robotics at Nişantaşı University. At Macademia he is building a platform where everyone, from children to university students, can learn science by experimenting.',
    ],
    expertise: ['Robotics', 'Embedded systems', 'Computer vision', 'Deep learning', 'Human–computer interaction', 'Educational technology'],
    theses: [
      { degree: 'PhD', title: 'CNN-Based Head-Mouse Control', year: 2021 },
      { degree: 'MSc', title: 'Obstacle Detection & Pathfinding', year: 2016 },
    ],
  },
}

export const INSTRUCTORS: readonly Instructor[] = [MURAT]
export const instructorBySlug = (slug: string): Instructor | undefined => INSTRUCTORS.find((i) => i.slug === slug)
export const instructorHref = (i: Instructor) => `/egitmen/${i.slug}`

/** schema.org Person (JSON-LD). Mutlak adresler SITE_URL'den. */
export function personJsonLd(i: Instructor, lang: Lang) {
  const t = i[lang]
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: i.name[lang],
    givenName: i.given,
    familyName: i.family,
    honorificPrefix: i.honorific[lang],
    url: `${SITE_URL}${instructorHref(i)}`,
    image: `${SITE_URL}${i.photo.jpg480}`,
    description: t.role,
    jobTitle: lang === 'en' ? 'Assistant Professor, Software Engineering' : 'Yazılım Mühendisliği Dr. Öğretim Üyesi',
    worksFor: { '@type': 'CollegeOrUniversity', name: i.affiliation[lang] },
    alumniOf: { '@type': 'CollegeOrUniversity', name: i.alumni[lang] },
    knowsAbout: t.expertise,
  }
}

/** JSON-LD'yi <script> içine güvenle gömmek için (`</script>` kaçışı). */
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
