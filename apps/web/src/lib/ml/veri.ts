// Makine Öğrenmesi kursunun veri setleri: hepsi sabit tohumlu ve sentetik (dışarıdan indirilmiş veri yok, lisans sorunu yok).
// Dersin sahnesindeki veriyle birebir aynıdır: CSV'ler buradaki üreteçlerden yazılır (public/veri/ml/<dosya>.csv) ve test,
// dosyaların üreteçle aynı olduğunu denetler. Yeniden yazmak için: ML_VERI_YAZ=1 npx vitest run src/lib/ml/veri.test.ts
import { gauss, rng, type Bi } from './core'
import { motorData } from './regression'
import { sharpData } from './overfit'
import { creditData, lineData } from './tree'
import { brakeData } from './perceptron'
import { colorData } from './knn'
import { moons } from './mlp'
import { obstacleData } from './naive-bayes'
import { lidarScan } from './kmeans'
import { imuData } from './pca'
import { WORDS, inbox } from './spam-filtresi'
import { makeItems } from './projeler/depo-siniflandirma'
import { lidarCloud } from './projeler/nokta-bulutu'
import { castRay, roadIndex, track } from './projeler/otonom-arac'

export interface DataCol { name: string; desc: Bi }
export interface DataSet {
  id: string
  /** public/veri/ml altındaki dosya adı; Python kodu da bu adla açar. */
  file: string
  title: Bi
  desc: Bi
  cols: DataCol[]
  rows(): Array<Array<number | string>>
}

export const VERI_DIZIN = '/veri/ml'
const c = (name: string, tr: string, en: string): DataCol => ({ name, desc: { tr, en } })
const r4 = (x: number) => Math.round(x * 1e4) / 1e4
const GRUP = (tr: string, en: string) => c('grup', tr, en)

/** Sürücü kayıtları: elle yazılmış basit bir sürücü (sağ ve sol ışın farkıyla direksiyon) pistte 400 adım sürer. */
function driverLog(): Array<Array<number>> {
  const T = track(), C = T.center, A = [-60, -30, 0, 30, 60].map((a) => (a * Math.PI) / 180)
  let x = C[0], z = C[1], h = Math.atan2(C[3] - C[1], C[2] - C[0]), v = 2
  const r = rng(23)
  const out: number[][] = []
  for (let t = 0; t < 400; t++) {
    const rays = A.map((a) => castRay(T, x, z, h + a))
    const steer = Math.max(-1, Math.min(1, 0.9 * (rays[3] + rays[4] - rays[0] - rays[1]) + 0.05 * gauss(r)))
    const gas = Math.max(-1, Math.min(1, (rays[2] - 2) / 2))
    out.push([...rays.map(r4), r4(v), r4(steer), r4(gas)])
    v += (2.5 + 1.5 * gas - v) * 0.15
    h += 2.5 * steer * 0.05
    x += Math.cos(h) * v * 0.05; z += Math.sin(h) * v * 0.05
    if (roadIndex(T, x, z) < 0) break
  }
  return out
}

export const DATASETS: DataSet[] = [
  {
    id: 'motor-pwm', file: 'motor-pwm.csv',
    title: { tr: 'Motor PWM ve tekerlek hızı', en: 'Motor PWM and wheel speed' },
    desc: { tr: '40 ölçüm: motora verilen PWM ve tekerleğin ölçülen hızı. Doğrusal ilişki ve gürültü.', en: '40 measurements: PWM sent to the motor and the measured wheel speed. A linear relation plus noise.' },
    cols: [c('pwm', 'PWM değeri (0–255)', 'PWM value (0–255)'), c('hiz', 'tekerlek hızı, cm/s', 'wheel speed, cm/s')],
    rows: () => { const { pwm, speed } = motorData(); return pwm.map((p, i) => [p, r4(speed[i])]) },
  },
  {
    id: 'sharp-ir', file: 'sharp-ir.csv',
    title: { tr: 'Sharp IR mesafe sensörü', en: 'Sharp IR distance sensor' },
    desc: { tr: 'Uzaklık ve çıkış gerilimi: 15 eğitim, 30 doğrulama ölçümü. Kalibrasyon eğrisi ve aşırı öğrenme için.', en: 'Distance and output voltage: 15 training and 30 validation measurements. For a calibration curve and overfitting.' },
    cols: [c('uzaklik', 'uzaklık, cm', 'distance, cm'), c('gerilim', 'çıkış gerilimi, V', 'output voltage, V'), GRUP('0 eğitim, 1 doğrulama', '0 training, 1 validation')],
    rows: () => { const D = sharpData(); return [...D.d.map((d, i) => [r4(d), r4(D.v[i]), 0]), ...D.dt.map((d, i) => [r4(d), r4(D.vt[i]), 1])] },
  },
  {
    id: 'cizgi-izleyen', file: 'cizgi-izleyen.csv',
    title: { tr: 'Çizgi izleyen robot: uzman sürüşü', en: 'Line follower: expert driving' },
    desc: { tr: 'Uzman elle sürerken kaydedilen anlar: iki çizgi sensörü ve seçilen eylem. 160 eğitim, 80 test anı; %6 yanlış etiket.', en: 'Moments recorded while an expert drove: two line sensors and the action chosen. 160 training and 80 test moments; 6% wrong labels.' },
    cols: [c('sol', 'sol sensör (0–1023)', 'left sensor (0–1023)'), c('sag', 'sağ sensör (0–1023)', 'right sensor (0–1023)'), c('eylem', '0 sola, 1 düz, 2 sağa', '0 left, 1 straight, 2 right'), GRUP('0 eğitim, 1 test', '0 training, 1 test')],
    rows: () => [...lineData().map((p) => [p.x, p.y, p.c, 0]), ...lineData(57, 80).map((p) => [p.x, p.y, p.c, 1])],
  },
  {
    id: 'kredi-basvurulari', file: 'kredi-basvurulari.csv',
    title: { tr: 'Kredi başvuruları', en: 'Loan applications' },
    desc: { tr: 'Simüle banka: 500 müşterinin aylık geliri, kaçırdığı ödeme sayısı ve krediyi ödeyip ödemediği. İlk 400 eğitim, son 100 yeni müşteri; %12 sürpriz.', en: 'A simulated bank: 500 customers’ monthly income, missed payments and whether they repaid. First 400 for training, last 100 new customers; 12% surprises.' },
    cols: [c('gelir', 'aylık gelir', 'monthly income'), c('kacan', 'kaçırılan ödeme sayısı (0–5)', 'missed payments (0–5)'), c('odedi', '1 ödedi, 0 ödemedi', '1 repaid, 0 defaulted'), GRUP('0 eğitim, 1 yeni müşteri', '0 training, 1 new customer')],
    rows: () => creditData().map((p, i) => [p.x, p.y, p.c, i < 400 ? 0 : 1]),
  },
  {
    id: 'surus-fren', file: 'surus-fren.csv',
    title: { tr: 'Fren kararı: mesafe ve hız', en: 'Braking decision: distance and speed' },
    desc: { tr: '80 an: öndeki engele mesafe, aracın hızı ve fren gerekip gerekmediği. Bir doğruyla ayrılabilir.', en: '80 moments: distance to the obstacle ahead, speed, and whether to brake. Separable by a straight line.' },
    cols: [c('mesafe', 'engele mesafe, m', 'distance to obstacle, m'), c('hiz', 'hız, m/s', 'speed, m/s'), c('fren', '1 fren, 0 devam', '1 brake, 0 keep going')],
    rows: () => brakeData().map((p) => [r4(p.x), r4(p.y), p.c]),
  },
  {
    id: 'renk-sensoru', file: 'renk-sensoru.csv',
    title: { tr: 'Renk sensörü: üç nesne', en: 'Colour sensor: three objects' },
    desc: { tr: 'Ton ve parlaklık: kırmızı top, mavi silindir, sarı küp. 90 etiketli ölçüm ve 45 test ölçümü.', en: 'Hue and brightness: red ball, blue cylinder, yellow cube. 90 labelled readings and 45 test readings.' },
    cols: [c('ton', 'ton', 'hue'), c('parlaklik', 'parlaklık', 'brightness'), c('sinif', '0 kırmızı top, 1 mavi silindir, 2 sarı küp', '0 red ball, 1 blue cylinder, 2 yellow cube'), GRUP('0 etiketli, 1 test', '0 labelled, 1 test')],
    rows: () => [...colorData().map((p) => [r4(p.x), r4(p.y), p.c, 0]), ...colorData(99, 15).map((p) => [r4(p.x), r4(p.y), p.c, 1])],
  },
  {
    id: 'pist-konum', file: 'pist-konum.csv',
    title: { tr: 'Pistte mi? İki hilal', en: 'On the track? Two moons' },
    desc: { tr: '200 konum ve konumun pistin üstünde olup olmadığı. Doğruyla ayrılamaz; küçük bir sinir ağı gerekir.', en: '200 positions and whether each is on the track. Not separable by a line; it takes a small neural network.' },
    cols: [c('x', 'x, m', 'x, m'), c('y', 'y, m', 'y, m'), c('pistte', '1 pistte, 0 dışında', '1 on track, 0 off track')],
    rows: () => moons().map((p) => [r4(p.x), r4(p.y), p.c]),
  },
  {
    id: 'engel-sensoru', file: 'engel-sensoru.csv',
    title: { tr: 'Engel sensörleri: ultrasonik ve IR', en: 'Obstacle sensors: ultrasonic and IR' },
    desc: { tr: '120 eğitim ölçümü (70 boş yol, 50 engel) ve 30 test ölçümü: ultrasonik mesafe ve IR yansıması.', en: '120 training readings (70 free path, 50 obstacle) and 30 test readings: ultrasonic distance and IR reflection.' },
    cols: [c('mesafe', 'ultrasonik mesafe, cm', 'ultrasonic distance, cm'), c('ir', 'IR yansıması (0–100)', 'IR reflection (0–100)'), c('engel', '1 engel, 0 boş yol', '1 obstacle, 0 free path'), GRUP('0 eğitim, 1 test', '0 training, 1 test')],
    rows: () => [...obstacleData().map((p) => [r4(p.x), r4(p.y), p.c, 0]), ...obstacleData(77, 18, 12).map((p) => [r4(p.x), r4(p.y), p.c, 1])],
  },
  {
    id: 'lidar-2b', file: 'lidar-2b.csv',
    title: { tr: 'Oda taraması (2B LiDAR)', en: 'Room scan (2D LiDAR)' },
    desc: { tr: 'Süpürge robotunun 600 LiDAR noktası: duvar, kanepe ve masa. Etiket yok; gruplar k-ortalamalarla bulunur.', en: 'A robot vacuum’s 600 LiDAR points: a wall, a sofa and a table. No labels; the groups are found with k-means.' },
    cols: [c('x', 'x, m', 'x, m'), c('y', 'y, m', 'y, m')],
    rows: () => lidarScan().map((p) => [r4(p.x), r4(p.y)]),
  },
  {
    id: 'imu', file: 'imu.csv',
    title: { tr: 'IMU ivme ölçümleri', en: 'IMU acceleration readings' },
    desc: { tr: '200 ölçüm: iki eksende ivme. İki sayı neredeyse tek bir yönde değişir; PCA bu yönü bulur.', en: '200 readings: acceleration on two axes. The two numbers change almost along one direction; PCA finds it.' },
    cols: [c('ax', 'x ivmesi, m/s²', 'x acceleration, m/s²'), c('ay', 'y ivmesi, m/s²', 'y acceleration, m/s²')],
    rows: () => imuData().map(([a, b]) => [r4(a), r4(b)]),
  },
  {
    id: 'spam-epostalar', file: 'spam-epostalar.csv',
    title: { tr: 'Spam e-postalar', en: 'Spam e-mails' },
    desc: { tr: '400 e-posta (kelime listesi olarak), yarısı spam; aralarında kılık değiştirmiş spam ve mağaza bültenleri var. İlk 300 eğitim, son 100 test.', en: '400 e-mails (as word lists), half of them spam, including disguised spam and shop newsletters. First 300 for training, last 100 for testing.' },
    cols: [c('metin', 'kelimeler (Türkçe), boşlukla ayrılmış', 'words (Turkish), space separated'), c('text', 'aynı e-posta, İngilizce kelimelerle', 'the same e-mail in English words'), c('spam', '1 spam, 0 normal', '1 spam, 0 normal'), c('tur', '0 spam, 1 kılık değiştirmiş spam, 2 kişisel, 3 bülten', '0 spam, 1 disguised spam, 2 personal, 3 newsletter')],
    rows: () => inbox().map((m) => [m.w.map((w) => WORDS[w][0]).join(' '), m.w.map((w) => WORDS[w][1]).join(' '), m.spam ? 1 : 0, m.kind]),
  },
  {
    id: 'depo-nesneleri', file: 'depo-nesneleri.csv',
    title: { tr: 'Depo konveyörü: nesneler', en: 'Warehouse conveyor: objects' },
    desc: { tr: 'Kamera ve lazerin okuduğu üç sayı (yuvarlaklık, ton, boy) ve nesnenin gideceği kutu. 120 etiketli örnek ve banttan gelen 200 yeni nesne.', en: 'Three numbers read by the camera and laser (roundness, hue, size) and the destination bin. 120 labelled examples and 200 new objects from the belt.' },
    cols: [c('yuvarlaklik', 'yuvarlaklık (0 köşeli – 1 küre)', 'roundness (0 boxy – 1 sphere)'), c('ton', 'renk tonu (0–1)', 'colour hue (0–1)'), c('boy', 'boy, cm', 'size, cm'), c('kutu', '0 oyuncak, 1 elektronik, 2 gıda, 3 büyük koli', '0 toys, 1 electronics, 2 food, 3 large parcel'), GRUP('0 etiketli, 1 yeni', '0 labelled, 1 new')],
    rows: () => [...makeItems(rng(7), 120, 0.3).map((o) => [...o.f.map(r4), o.c, 0]), ...makeItems(rng(1007), 200, 0.3).map((o) => [...o.f.map(r4), o.c, 1])],
  },
  {
    id: 'lidar-3b', file: 'lidar-3b.csv',
    title: { tr: 'Depo taraması (3B nokta bulutu)', en: 'Warehouse scan (3D point cloud)' },
    desc: { tr: '360° LiDAR taraması: zemin halkaları, beş nesne (koli yığını, varil, insan, palet, dolap) ve havada sahte yansımalar. Gerçek etiket yalnız değerlendirme için.', en: 'A 360° LiDAR scan: floor rings, five objects (box stack, barrel, person, pallet, cabinet) and false reflections in the air. The true label is only for evaluation.' },
    cols: [c('x', 'x ileri, m', 'x forward, m'), c('y', 'y sol, m', 'y left, m'), c('z', 'z yukarı, m', 'z up, m'), c('nesne', '−2 zemin, −1 sahte yansıma, 0–4 nesne', '−2 floor, −1 false reflection, 0–4 object')],
    rows: () => { const C = lidarCloud(7); return Array.from({ length: C.n }, (_, i) => [r4(C.pos[3 * i]), r4(C.pos[3 * i + 1]), r4(C.pos[3 * i + 2]), C.truth[i]]) },
  },
  {
    id: 'pist-orta-cizgi', file: 'pist-orta-cizgi.csv',
    title: { tr: 'Yarış pisti: orta çizgi', en: 'Race track: centre line' },
    desc: { tr: 'Kapalı pistin orta çizgisi: eşit aralıklı 300 nokta (57 m). Yol yarı genişliği 0,65 m; yol mu, ışın ve ilerleme bundan hesaplanır.', en: 'The closed track’s centre line: 300 evenly spaced points (57 m). Road half-width 0.65 m; on-road, rays and progress are computed from it.' },
    cols: [c('x', 'x, m', 'x, m'), c('z', 'z, m', 'z, m')],
    rows: () => { const T = track(); return Array.from({ length: T.n }, (_, k) => [r4(T.center[2 * k]), r4(T.center[2 * k + 1])]) },
  },
  {
    id: 'surucu-kayitlari', file: 'surucu-kayitlari.csv',
    title: { tr: 'Sürücü sensör kayıtları', en: 'Driver sensor logs' },
    desc: { tr: 'Basit bir sürücü pistte 400 adım (20 s) sürerken her adımda beş mesafe ışını, hız, direksiyon ve gaz. Davranış klonlama (taklit ederek öğrenme) için.', en: 'A simple driver on the track for 400 steps (20 s): five distance rays, speed, steering and throttle at every step. For behaviour cloning (learning by imitation).' },
    cols: [c('isin1', 'ışın −60°, m', 'ray −60°, m'), c('isin2', 'ışın −30°, m', 'ray −30°, m'), c('isin3', 'ışın 0°, m', 'ray 0°, m'), c('isin4', 'ışın 30°, m', 'ray 30°, m'), c('isin5', 'ışın 60°, m', 'ray 60°, m'), c('hiz', 'hız, m/s', 'speed, m/s'), c('direksiyon', '−1 sol … +1 sağ', '−1 left … +1 right'), c('gaz', '−1 … +1', '−1 … +1')],
    rows: driverLog,
  },
  {
    id: 'ev-fiyatlari', file: 'ev-fiyatlari.csv',
    title: { tr: 'Ev fiyatları', en: 'House prices' },
    desc: { tr: '200 sentetik ev: alan, oda sayısı, bina yaşı ve fiyat. Regresyonu başka bir veriyle denemek için.', en: '200 synthetic houses: floor area, rooms, building age and price. To try regression on different data.' },
    cols: [c('alan', 'alan, m²', 'floor area, m²'), c('oda', 'oda sayısı', 'number of rooms'), c('yas', 'bina yaşı, yıl', 'building age, years'), c('fiyat', 'fiyat, bin TL', 'price, thousand TL')],
    rows: () => {
      const r = rng(61)
      return Array.from({ length: 200 }, () => {
        const alan = Math.round(45 + 155 * r()), oda = Math.max(1, Math.min(6, Math.round(alan / 35 + gauss(r) * 0.6))), yas = Math.round(40 * r())
        return [alan, oda, yas, Math.round(900 + 28 * alan + 60 * oda - 18 * yas + 180 * gauss(r))]
      })
    },
  },
  {
    id: 'cicek-olculeri', file: 'cicek-olculeri.csv',
    title: { tr: 'Çiçek ölçüleri (iris benzeri)', en: 'Flower measurements (iris-like)' },
    desc: { tr: 'Üç türden 150 sentetik çiçek: çanak ve taç yaprağı boyu ve eni (cm). Ünlü iris verisine benzer ama sabit tohumla burada üretildi.', en: '150 synthetic flowers of three species: sepal and petal length and width (cm). Similar to the famous iris data, but generated here with a fixed seed.' },
    cols: [c('canak_boy', 'çanak yaprağı boyu, cm', 'sepal length, cm'), c('canak_en', 'çanak yaprağı eni, cm', 'sepal width, cm'), c('tac_boy', 'taç yaprağı boyu, cm', 'petal length, cm'), c('tac_en', 'taç yaprağı eni, cm', 'petal width, cm'), c('tur', '0 setosa benzeri, 1 versicolor benzeri, 2 virginica benzeri', '0 setosa-like, 1 versicolor-like, 2 virginica-like')],
    rows: () => {
      const r = rng(150)
      const M = [[5.0, 3.4, 1.5, 0.25], [5.9, 2.8, 4.3, 1.3], [6.6, 3.0, 5.5, 2.0]], S = [[0.35, 0.38, 0.17, 0.1], [0.5, 0.31, 0.47, 0.2], [0.63, 0.32, 0.55, 0.27]]
      return [0, 1, 2].flatMap((t) => Array.from({ length: 50 }, () => [...M[t].map((m, j) => Math.max(0.1, Math.round((m + S[t][j] * gauss(r)) * 10) / 10)), t]))
    },
  },
]

/**
 * Ders / proje → kullandığı veri setleri. İlk set, dersin Python kodunun açtığı settir; sonrakiler alıştırma için.
 * Boş liste: kod verisini kendi içinde üretir (ör. sıralama, bellek, Git dersleri).
 */
export const LESSON_DATA: Record<string, string[]> = {
  'dogrusal-regresyon': ['motor-pwm', 'ev-fiyatlari'],
  'lojistik-noron': [],
  perceptron: ['surus-fren'],
  'sinir-agi': ['pist-konum', 'surucu-kayitlari'],
  'asiri-ogrenme': ['sharp-ir'],
  'ayni-kod-uc-urun': [],
  'aktivasyon-fonksiyonlari': [],
  'gradyan-inisi': ['ev-fiyatlari'],
  'geri-yayilim': [],
  'zincir-kurali': [],
  'k-en-yakin-komsu': ['renk-sensoru', 'cicek-olculeri'],
  'naive-bayes': ['engel-sensoru', 'cicek-olculeri'],
  'spam-filtresi': ['spam-epostalar'],
  'karar-agaci': ['cizgi-izleyen', 'kredi-basvurulari'],
  'rastgele-orman': ['kredi-basvurulari'],
  'gradyan-artirma': [],
  'destek-vektor-makinesi': [],
  'k-means': ['lidar-2b', 'cicek-olculeri'],
  dbscan: [],
  pca: ['imu', 'cicek-olculeri'],
  'rakam-tanima': [],
  'mini-dil-modeli': [],
  'goruntu-ureteci': [],
  'q-ogrenme': [],
  'oneri-sistemi': [],
  'kesinlik-duyarlilik': [],
  'shap-degerleri': [],
  boruta: [],
  'nesne-takibi': [],
  'dusme-tespiti': [],
  'bolge-ihlali': [],
  'yuz-dogrulama': [],
  'kelime-vektorleri': [],
  'dikkat-mekanizmasi': [],
  rag: [],
  'yapay-zeka-ajani': [],
  'model-damitma': [],
  'ikili-arama': [],
  'siralama-algoritmalari': [],
  onbellek: [],
  'cop-toplama': [],
  'yigin-ve-obek': [],
  'olay-dongusu': [],
  kilitlenme: [],
  'git-dallari': [],
  'ci-cd-hatti': [],
  'konteyner-olcekleme': [],
  'hiz-siniri': [],
  'otonom-arac': ['pist-orta-cizgi', 'surucu-kayitlari'],
  'robot-kol': [],
  'drone-inis': [],
  'depo-siniflandirma': ['depo-nesneleri'],
  'nokta-bulutu': ['lidar-3b'],
}

export const datasetById = (id: string): DataSet | undefined => DATASETS.find((d) => d.id === id)
export const datasetsFor = (slug: string): DataSet[] => (LESSON_DATA[slug] ?? []).map((id) => datasetById(id)!).filter(Boolean)
/** Bu seti kullanan ders/proje slug'ları. */
export const usersOf = (id: string): string[] => Object.entries(LESSON_DATA).filter(([, ids]) => ids.includes(id)).map(([s]) => s)

const cell = (v: number | string) => (typeof v === 'number' ? String(v) : /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
/** CSV metni: başlık satırı + satırlar, sonda yeni satır. */
export const csvOf = (d: DataSet): string => [d.cols.map((x) => x.name).join(','), ...d.rows().map((row) => row.map(cell).join(','))].join('\n') + '\n'
