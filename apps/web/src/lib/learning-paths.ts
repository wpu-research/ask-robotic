// Öğrenme yolları: yaş bantları → konular → kurslar (modüller). Katalog (/konular), onboarding (/basla) ve panel kullanır.
// Strateji: docs/strateji-okul-platformu.tr.md §4. Öğrenci modül numarası görmez; bant → konu → kurs görür.

export type BandKey = 'minikler' | 'kasifler' | 'yapicilar' | 'muhendis-adaylari' | 'muhendisler'
export type Interest = 'kodlama' | 'oyun' | 'elektronik' | 'robotik' | 'ai'

/** Bandın İngilizce metinleri (arayüz dili 'en'); Türkçe alanlar kaynak olarak kalır. */
export interface BandText { title: string; grades: string; ages: string; blurb: string }
export interface Band extends BandText { key: BandKey; minAge: number; maxAge: number; en: BandText }

export const BANDS: Band[] = [
  { key: 'minikler', title: 'Minikler', grades: 'Anaokulu – 2. sınıf', ages: '5–7 yaş', minAge: 5, maxAge: 7, blurb: 'Okuma bilmeden blokla kodlama: sıra, tekrar ve hikâye.', en: { title: 'Little Ones', grades: 'Kindergarten – Grade 2', ages: 'Ages 5–7', blurb: 'Block coding without reading: order, repeat and stories.' } },
  { key: 'kasifler', title: 'Kâşifler', grades: '3 – 4. sınıf', ages: '8–10 yaş', minAge: 8, maxAge: 10, blurb: 'Kendi oyununu yap, ilk elektronik kartını programla.', en: { title: 'Explorers', grades: 'Grades 3–4', ages: 'Ages 8–10', blurb: 'Make your own game and program your first electronics board.' } },
  { key: 'yapicilar', title: 'Yapıcılar', grades: '5 – 6. sınıf', ages: '10–12 yaş', minAge: 10, maxAge: 12, blurb: 'Oyun tasarımı, kart projeleri ve yapay zekâyı tanıma.', en: { title: 'Builders', grades: 'Grades 5–6', ages: 'Ages 10–12', blurb: 'Game design, board projects and meeting AI.' } },
  { key: 'muhendis-adaylari', title: 'Mühendis Adayları', grades: '7 – 8. sınıf', ages: '12–14 yaş', minAge: 12, maxAge: 14, blurb: 'Arduino, devreler ve sensörlerle gerçek mühendislik.', en: { title: 'Future Engineers', grades: 'Grades 7–8', ages: 'Ages 12–14', blurb: 'Real engineering with Arduino, circuits and sensors.' } },
  { key: 'muhendisler', title: 'Mühendisler', grades: 'Lise', ages: '14–18 yaş', minAge: 14, maxAge: 18, blurb: 'Robotik, kontrol ve yapay zekâ mühendisliği.', en: { title: 'Engineers', grades: 'High school', ages: 'Ages 14–18', blurb: 'Robotics, control and AI engineering.' } },
]

export interface Topic {
  key: string
  section: 'Kodlama' | 'Elektronik' | 'Robotik' | 'Yapay Zekâ'
  title: string
  /** Tek cümlelik vaat (Brilliant'ın "Speak the language of computers" satırı gibi). */
  promise: string
  /** Seviye etiketi: yaş/sınıf aralığı. */
  label: string
  bands: BandKey[]
  /** Kurslar, önerilen sırayla (modül slug'ları). */
  courses: string[]
  /** Modül olmayan bağlantılı içerik (Mühendislik yolu, üniversite dersi); kursların ardından listelenir. */
  links?: TopicLink[]
  /** Henüz yazılmamış kurslar (katalogda "Yakında"). */
  soon?: string[]
  interests: Interest[]
  /** İngilizce metinler (arayüz dili 'en'). `soon` sırası Türkçedekiyle aynı. */
  en: { title: string; promise: string; label: string; soon?: string[] }
}

export interface TopicLink { href: string; title: string; text: string; en: { title: string; text: string } }

const ENG_PATH: TopicLink = { href: '/muhendislik', title: 'Mühendislik yolu (Hyvex)', text: '128 gerçek parça, 7 seviye: temel bileşenden drone\'a; 49\'u laboratuvarda takılı açılır.', en: { title: 'Engineering path (Hyvex)', text: '128 real parts in 7 levels, from basic components to drones; 49 open wired up in the lab.' } }
const ESOF323: TopicLink = { href: '/muhendislik/robotik', title: 'Robotik dersi (ESOF 323)', text: 'Üniversite düzeyi 14 hafta: PID, kinematik, planlama, görü, derin öğrenme, ROS 2 ve drone.', en: { title: 'Robotics course (ESOF 323)', text: 'University-level, 14 weeks: PID, kinematics, planning, vision, deep learning, ROS 2 and drones.' } }

export const TOPICS: Topic[] = [
  { key: 'blokla-kodlama', section: 'Kodlama', title: 'Blokla Kodlama', promise: 'Komut ver, karakter yapsın.', label: '5–7 YAŞ', bands: ['minikler'], courses: ['scratchjr'], interests: ['kodlama', 'oyun'], en: { title: 'Block Coding', promise: 'Give a command, watch your character do it.', label: 'AGES 5–7' } },
  { key: 'oyun-yapimi', section: 'Kodlama', title: 'Oyun Yapımı', promise: 'Hayal ettiğin oyunu bloklarla kur.', label: '8–12 YAŞ', bands: ['kasifler', 'yapicilar'], courses: ['scratch', 'oyun-atolyesi'], interests: ['kodlama', 'oyun'], en: { title: 'Game Making', promise: 'Build the game you dream of with blocks.', label: 'AGES 8–12' } },
  { key: 'mikro-kart', section: 'Elektronik', title: 'Mikro Kart', promise: 'Işık, ses ve sensörlerle ilk kartını programla.', label: '8–12 YAŞ', bands: ['kasifler', 'yapicilar'], courses: ['mikro-kart'], interests: ['elektronik', 'robotik', 'kodlama'], en: { title: 'Micro Board', promise: 'Program your first board with light, sound and sensors.', label: 'AGES 8–12' } },
  { key: 'arduino', section: 'Elektronik', title: 'Arduino ve Sensörler', promise: 'Devre kur, kodla, dünyayı ölç.', label: '12–14 YAŞ', bands: ['muhendis-adaylari'], courses: ['arduino-temelleri', 'sensorler-ve-projeler'], interests: ['elektronik', 'robotik', 'kodlama'], en: { title: 'Arduino and Sensors', promise: 'Build circuits, write code, measure the world.', label: 'AGES 12–14' } },
  { key: 'elektronik-muhendisligi', section: 'Elektronik', title: 'Elektronik Mühendisliği', promise: 'Gerçek sensör, sürücü ve kartlarla temelden drone\'a.', label: '14+ YAŞ', bands: ['muhendisler'], courses: ['arduino-temelleri', 'sensorler-ve-projeler'], links: [ENG_PATH], interests: ['elektronik', 'robotik', 'kodlama'], en: { title: 'Electronics Engineering', promise: 'Real sensors, drivers and boards, from the basics to drones.', label: 'AGES 14+' } },
  { key: 'robotik', section: 'Robotik', title: 'Robotik', promise: 'Robotunu sür, engelden kaçır, çizgiyi izlet.', label: '12–14 YAŞ', bands: ['muhendis-adaylari'], courses: ['robotik'], interests: ['robotik'], en: { title: 'Robotics', promise: 'Drive your robot, dodge obstacles, follow the line.', label: 'AGES 12–14' } },
  { key: 'robotik-muhendisligi', section: 'Robotik', title: 'Robotik Mühendisliği', promise: 'Kontrol, kinematik, görü ve drone: üniversite düzeyinde robotik.', label: '14+ YAŞ', bands: ['muhendisler'], courses: ['robotik'], links: [ESOF323], interests: ['robotik'], en: { title: 'Robotics Engineering', promise: 'Control, kinematics, vision and drones: university-level robotics.', label: 'AGES 14+' } },
  { key: 'yapay-zeka', section: 'Yapay Zekâ', title: 'Yapay Zekâ Mühendisliği', promise: 'Dil modellerinin içine bak, kendi AI uygulamanı kur.', label: '13+ YAŞ', bands: ['muhendis-adaylari', 'muhendisler'], courses: ['ai-muhendisligi'], soon: ['AI Keşif (10–12 yaş)'], interests: ['ai'], en: { title: 'AI Engineering', promise: 'Look inside language models and build your own AI app.', label: 'AGES 13+', soon: ['AI Discovery (ages 10–12)'] } },
]

export const SECTIONS: Topic['section'][] = ['Kodlama', 'Elektronik', 'Robotik', 'Yapay Zekâ']

type Lang = 'tr' | 'en'
const SECTION_EN: Record<Topic['section'], string> = { Kodlama: 'Coding', Elektronik: 'Electronics', Robotik: 'Robotics', 'Yapay Zekâ': 'Artificial Intelligence' }

/** Bant metinleri arayüz diline göre. */
export const bandText = (b: Band, locale: Lang): BandText => (locale === 'en' ? b.en : b)
/** Konu metinleri arayüz diline göre (soon: yakında gelecek kurslar). */
export const topicText = (t: Topic, locale: Lang): { title: string; promise: string; label: string; soon?: string[] } =>
  (locale === 'en' ? { ...t.en, soon: t.en.soon ?? t.soon } : { title: t.title, promise: t.promise, label: t.label, soon: t.soon })
/** Bölüm adı arayüz diline göre. */
export const sectionLabel = (s: Topic['section'], locale: Lang) => (locale === 'en' ? SECTION_EN[s] : s)
/** Öneri gerekçesi arayüz diline göre. */
export const reasonText = (r: Recommendation, locale: Lang) => (locale === 'en' ? r.reasonEn : r.reason)

export function bandForAge(age: number): Band {
  if (age <= 7) return BANDS[0]
  if (age <= 9) return BANDS[1]
  if (age <= 11) return BANDS[2]
  if (age <= 13) return BANDS[3]
  return BANDS[4]
}

export type Level = 'yeni' | 'acemi' | 'orta' | 'ileri'

export interface Recommendation { band: Band; topic: Topic; course: string; reason: string; reasonEn: string }

/**
 * Onboarding cevaplarından başlangıç önerisi. Yaş kapısı önce gelir (modül minAge), sonra ilgi ve seviye.
 * Saf işlev; testler: learning-paths.test.ts.
 */
export function recommend(input: { age: number; interests: Interest[]; level: Level }): Recommendation {
  const band = bandForAge(input.age)
  const wants = (i: Interest) => input.interests.includes(i)
  const topic = (k: string) => TOPICS.find((t) => t.key === k)!
  // Lise bandında (14+) Arduino ve Robotik konuları mühendislik karşılıklarıyla gösterilir (aynı kurslar)
  const LISE: Record<string, string> = { arduino: 'elektronik-muhendisligi', robotik: 'robotik-muhendisligi' }
  const pick = (k: string, course: string, reason: string, reasonEn: string): Recommendation => ({ band, topic: topic(band.key === 'muhendisler' ? (LISE[k] ?? k) : k), course, reason, reasonEn })

  if (input.age <= 7) return pick('blokla-kodlama', 'scratchjr', 'Okuma gerektirmeyen bloklarla, hikâye kurarak başlıyoruz.', 'We start with blocks that need no reading, by telling stories.')
  if (input.age <= 11) {
    if ((wants('elektronik') || wants('robotik')) && !wants('oyun')) return pick('mikro-kart', 'mikro-kart', 'Işık, ses ve sensörlerle elektroniğe bloklarla giriyoruz.', 'We step into electronics with blocks, using light, sound and sensors.')
    if (input.level === 'orta' || input.level === 'ileri') return pick('oyun-yapimi', 'oyun-atolyesi', 'Blokları biliyorsun: sprite, çarpışma ve skorla gerçek oyun tasarımına geçiyoruz.', 'You already know blocks: now on to real game design with sprites, collisions and scores.')
    return pick('oyun-yapimi', 'scratch', 'Kendi oyununu yaparak olayları, döngüleri ve değişkenleri öğreniyoruz.', 'We learn events, loops and variables by making your own game.')
  }
  if (wants('ai') && input.age >= 13 && !wants('elektronik') && !wants('robotik')) {
    return pick('yapay-zeka', 'ai-muhendisligi', 'Dil modellerinin nasıl çalıştığını kendi ellerinle deneyerek başlıyoruz.', 'We start by trying out, hands-on, how language models work.')
  }
  if (wants('robotik') && input.age >= 13 && input.level === 'ileri') return pick('robotik', 'robotik', 'Kod yazmayı biliyorsun: doğrudan sanal robot arenasına geçiyoruz.', 'You already know how to code: straight to the virtual robot arena.')
  if (input.level === 'ileri') return pick('arduino', 'sensorler-ve-projeler', 'Temeller hazır: sensörlerle her hafta bir proje yapıyoruz.', 'The basics are done: we build a sensor project every week.')
  return pick('arduino', 'arduino-temelleri', 'Robotun ve yapay zekânın temeli olan devre ve mikrodenetleyiciden başlıyoruz.', 'We start with circuits and microcontrollers, the foundation of robots and AI.')
}
