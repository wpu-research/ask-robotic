// Kariyer anketi: "ne olmak istediğini bilmeyenler" için dokuz soru. Her seçenek bir ya da birkaç hedefe (lib/kariyer.ts
// CAREERS) puan verir; sonuç her hedefin alabileceği en yüksek puana oranla yüzde uyumdur. Hesap hem istemcide hem
// sunucuda aynı fonksiyonla yapılır, kaydedilen sonuç sunucunun hesabıdır. Son soru (haftalık saat) puan vermez,
// yalnız planın kaç hafta süreceğini hesaplar.
import { z } from 'zod'
import { CAREERS } from './kariyer'

type Slug = (typeof CAREERS)[number]['slug']
export interface Opt { id: string; tr: string; en: string; w: Partial<Record<Slug, number>> }
export interface Question { id: string; tr: string; en: string; opts: Opt[] }

const O = (id: string, tr: string, en: string, w: Partial<Record<Slug, number>> = {}): Opt => ({ id, tr, en, w })

export const QUESTIONS: readonly Question[] = [
  { id: 'an', tr: 'Hangi an seni en çok heyecanlandırırdı?', en: 'Which moment would excite you most?', opts: [
    O('robot', 'Yaptığın robot ilk kez kendi başına yol bulduğunda', 'When a robot you built finds its own way for the first time', { 'robotik-yazilim': 3, 'endustriyel-robot': 1, 'robotik-arastirmaci': 2 }),
    O('kart', 'Yazdığın kod bir kartın üstündeki ışığı yaktığında', 'When your code lights up an LED on a board', { 'gomulu-yazilim': 3, iot: 2 }),
    O('drone', 'Bir drone senin kodunla havalandığında', 'When a drone takes off with your code', { 'drone-iha': 3, 'otonom-arac': 1 }),
    O('kamera', 'Kamera bir nesneyi kendi başına tanıdığında', 'When a camera recognises an object by itself', { 'bilgisayarli-goru': 3, 'otonom-arac': 1, 'makine-ogrenmesi': 1 }),
    O('tahmin', 'Eğittiğin bir model bir şeyi doğru tahmin ettiğinde', 'When a model you trained predicts something correctly', { 'makine-ogrenmesi': 3, 'yapay-zeka-uygulama': 1, iot: 1 }),
    O('asistan', 'Bir yapay zekâ asistanı gerçek bir işi senin yerine çözdüğünde', 'When an AI assistant solves a real task for you', { 'yapay-zeka-uygulama': 3, 'makine-ogrenmesi': 1 }),
  ] },
  { id: 'hafta', tr: 'Boş bir hafta sonunda büyük ihtimalle ne yaparsın?', en: 'What would you most likely do on a free weekend?', opts: [
    O('sok', 'Bir cihazı söker, içine bakarım', 'Take a device apart and look inside', { 'gomulu-yazilim': 2, 'endustriyel-robot': 2, 'drone-iha': 1 }),
    O('kod', 'Bir oyun ya da uygulama kodlarım', 'Code a game or an app', { 'yapay-zeka-uygulama': 2, 'robotik-yazilim': 1, iot: 1 }),
    O('rc', 'Model uçak, RC araba ya da drone uçururum', 'Fly a model plane, an RC car or a drone', { 'drone-iha': 3, 'otonom-arac': 2 }),
    O('bulmaca', 'Bulmaca, grafik ya da istatistikle uğraşırım', 'Play with puzzles, charts or statistics', { 'makine-ogrenmesi': 3, 'bilgisayarli-goru': 1 }),
    O('arastir', 'Bilim videosu izler, makale okurum', 'Watch science videos and read articles', { 'robotik-arastirmaci': 3, 'makine-ogrenmesi': 1 }),
    O('akilli', 'Evde akıllı bir şey kurarım (sensör, lamba, priz)', 'Build something smart at home (sensor, lamp, plug)', { iot: 3, 'gomulu-yazilim': 1 }),
  ] },
  { id: 'ders', tr: 'Okulda en çok hangi konuyu severdin?', en: 'Which subject did you like most at school?', opts: [
    O('fizik', 'Fizik', 'Physics', { 'drone-iha': 2, 'robotik-arastirmaci': 2, 'robotik-yazilim': 1, 'endustriyel-robot': 1 }),
    O('mat', 'Matematik', 'Maths', { 'makine-ogrenmesi': 2, 'robotik-arastirmaci': 2, 'bilgisayarli-goru': 1 }),
    O('bilgisayar', 'Bilgisayar ve programlama', 'Computers and programming', { 'yapay-zeka-uygulama': 2, 'robotik-yazilim': 2, 'gomulu-yazilim': 1 }),
    O('elektronik', 'Elektrik ve elektronik', 'Electricity and electronics', { 'gomulu-yazilim': 3, iot: 2 }),
    O('biyoloji', 'Biyoloji ve insan', 'Biology and the human body', { 'robotik-arastirmaci': 2, 'bilgisayarli-goru': 1, 'yapay-zeka-uygulama': 1 }),
    O('gorsel', 'Resim ve görsel tasarım', 'Art and visual design', { 'bilgisayarli-goru': 2, 'yapay-zeka-uygulama': 1 }),
  ] },
  { id: 'ekran', tr: 'İş gününün ne kadarı donanımla, ne kadarı ekranda geçsin?', en: 'How much of your work day should be hardware, and how much screen?', opts: [
    O('donanim', 'Çoğu elimde tuttuğum donanımla', 'Mostly hardware I can hold', { 'gomulu-yazilim': 2, 'endustriyel-robot': 2, 'drone-iha': 2 }),
    O('yari', 'Yarı yarıya', 'Half and half', { 'robotik-yazilim': 2, iot: 2, 'otonom-arac': 2, 'robotik-arastirmaci': 1 }),
    O('ekran', 'Çoğu ekranda', 'Mostly on screen', { 'bilgisayarli-goru': 2, 'makine-ogrenmesi': 2, 'yapay-zeka-uygulama': 2 }),
  ] },
  { id: 'yer', tr: 'Nerede çalışmak isterdin?', en: 'Where would you like to work?', opts: [
    O('fabrika', 'Fabrikada, üretim hattında', 'In a factory, on a production line', { 'endustriyel-robot': 3, 'gomulu-yazilim': 1 }),
    O('savunma', 'Savunma ya da havacılıkta', 'In defence or aerospace', { 'drone-iha': 3, 'gomulu-yazilim': 2 }),
    O('yazilim', 'Bir yazılım şirketinde ya da girişimde', 'At a software company or a start-up', { 'yapay-zeka-uygulama': 3, 'makine-ogrenmesi': 2 }),
    O('universite', 'Üniversitede ya da araştırma merkezinde', 'At a university or a research centre', { 'robotik-arastirmaci': 3, 'makine-ogrenmesi': 1 }),
    O('otomotiv', 'Otomotivde, ulaşımda', 'In automotive or transport', { 'otonom-arac': 3, 'bilgisayarli-goru': 1 }),
    O('sehir', 'Akıllı şehir, tarım ya da enerji alanında', 'In smart cities, farming or energy', { iot: 3, 'drone-iha': 1 }),
  ] },
  { id: 'sorun', tr: 'Hangi sorunu çözmek isterdin?', en: 'Which problem would you like to solve?', opts: [
    O('agir', 'İnsanların ağır ve tekrarlı işini robota devretmek', 'Hand people\'s heavy, repetitive work to robots', { 'endustriyel-robot': 3, 'robotik-yazilim': 2 }),
    O('trafik', 'Trafikte kazaları azaltmak', 'Reduce traffic accidents', { 'otonom-arac': 3, 'bilgisayarli-goru': 2 }),
    O('tarla', 'Tarlada su ve enerjiyi verimli kullanmak', 'Use water and energy efficiently on farms', { iot: 3, 'drone-iha': 1, 'makine-ogrenmesi': 1 }),
    O('teshis', 'Görüntüden hastalık ya da üretim hatası yakalamak', 'Spot illness or production faults in images', { 'bilgisayarli-goru': 3, 'makine-ogrenmesi': 2 }),
    O('asistan', 'İnsanların sorusunu yanıtlayan akıllı bir asistan', 'A smart assistant that answers people\'s questions', { 'yapay-zeka-uygulama': 3 }),
    O('yuruyen', 'İnsan gibi yürüyen bir robot', 'A robot that walks like a human', { 'robotik-arastirmaci': 3, 'robotik-yazilim': 1 }),
  ] },
  { id: 'matematik', tr: 'Matematikle aran nasıl?', en: 'How do you get on with maths?', opts: [
    O('severim', 'Severim, zor problemler beni çeker', 'I like it; hard problems draw me in', { 'makine-ogrenmesi': 2, 'robotik-arastirmaci': 2, 'otonom-arac': 1, 'drone-iha': 1 }),
    O('idare', 'İdare eder, gerekince öğrenirim', 'It\'s fine; I learn what I need', { 'robotik-yazilim': 1, 'bilgisayarli-goru': 1, 'endustriyel-robot': 1, iot: 1 }),
    O('uygulama', 'Pek sevmem, uygulamayı severim', 'Not really; I prefer hands-on work', { 'yapay-zeka-uygulama': 2, iot: 1, 'gomulu-yazilim': 1 }),
  ] },
  { id: 'tarz', tr: 'Nasıl çalışmayı seversin?', en: 'How do you like to work?', opts: [
    O('derin', 'Tek başıma, bir konuya derinlemesine', 'Alone, deep in one topic', { 'robotik-arastirmaci': 2, 'gomulu-yazilim': 2, 'makine-ogrenmesi': 1 }),
    O('saha', 'Takımla, sahada deneyerek', 'With a team, testing in the field', { 'drone-iha': 2, 'otonom-arac': 2, 'robotik-yazilim': 1 }),
    O('urun', 'Kullanıcılarla konuşup ürün yaparak', 'Talking to users and building products', { 'yapay-zeka-uygulama': 2, iot: 2 }),
    O('plan', 'Süreci ve güvenliği planlayarak', 'Planning the process and safety', { 'endustriyel-robot': 2, 'gomulu-yazilim': 1 }),
  ] },
  { id: 'saat', tr: 'Haftada kaç saat ayırabilirsin?', en: 'How many hours a week can you spare?', opts: [
    O('3', '2-4 saat', '2-4 hours'), O('6', '5-8 saat', '5-8 hours'), O('12', '9-15 saat', '9-15 hours'), O('18', '16 saat ve üstü', '16 hours or more'),
  ] },
]

export type Answers = Record<string, string>
export interface Match { slug: string; pct: number }

const optOf = (q: Question, id: string | undefined) => q.opts.find((o) => o.id === id)

/** Her hedefin alabileceği en yüksek puan (soru başına en yüksek ağırlık). */
const MAX: Record<string, number> = Object.fromEntries(CAREERS.map((c) => [c.slug, QUESTIONS.reduce((s, q) => s + Math.max(0, ...q.opts.map((o) => o.w[c.slug as Slug] ?? 0)), 0)]))

/** Bütün hedefler, uyum yüzdesine göre azalan (eşitlikte ham puan, sonra CAREERS sırası). */
export function rank(a: Answers): Match[] {
  const raw = Object.fromEntries(CAREERS.map((c) => [c.slug, 0]))
  for (const q of QUESTIONS) for (const [s, w] of Object.entries(optOf(q, a[q.id])?.w ?? {})) raw[s] += w ?? 0
  return CAREERS.map((c, i) => ({ slug: c.slug, raw: raw[c.slug], pct: Math.round((100 * raw[c.slug]) / MAX[c.slug]), i }))
    .sort((x, y) => y.pct - x.pct || y.raw - x.raw || x.i - y.i)
    .map(({ slug, pct }) => ({ slug, pct }))
}

export const top3 = (a: Answers): Match[] => rank(a).slice(0, 3)
export const weeklyHours = (a: Answers): number => Number(a.saat) || 6
export const complete = (a: Answers): boolean => QUESTIONS.every((q) => !!optOf(q, a[q.id]))

/** API gövdesi: ad, e-posta, eksiksiz cevaplar ve zorunlu KVKK onayı. */
export const surveySchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  answers: z.record(z.string().max(32), z.string().max(32)).refine(complete, 'Bütün soruları cevapla').transform((a) => Object.fromEntries(QUESTIONS.map((q) => [q.id, a[q.id]])) as Answers),
  consentKvkk: z.literal(true),
  consentContact: z.boolean().default(false),
  locale: z.enum(['tr', 'en']).default('tr'),
})
export type SurveyInput = z.infer<typeof surveySchema>
