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
  { id: 'p:drone', group: 'Sayfa', title: 'Drone dersi', subtitle: 'Büyükler için: parça, simülasyon, yazılım; 10 ünite', href: '/muhendislik/drone', keywords: 'drone İHA multirotor quadcopter quad uçuş fırçasız motor esc pervane lipo batarya pdb bec uçuş kontrolcüsü stm32 imu jiroskop barometre pusula gps px4 ardupilot mavlink mavsdk ros 2 gazebo sitl pid itki ağırlık uçuş süresi karıştırıcı tamamlayıcı süzgeç aruco hassas iniş failsafe shgm' },
  { id: 'p:drone-sim', group: 'Sayfa', title: 'Drone simülasyonları', subtitle: 'İtki/ağırlık, uçuş süresi, PID, karıştırıcı, füzyon, görev', href: '/muhendislik/drone/simulasyon', keywords: 'drone simülasyon itki ağırlık askıda gaz uçuş süresi irtifa pid roll yönelim motor karıştırıcı mixer tamamlayıcı süzgeç ara nokta görev gps' },
  { id: 'p:raspberry-pi', group: 'Sayfa', title: 'Raspberry Pi ile Robotik Programlama', subtitle: 'Büyükler için: Linux, GPIO, OpenCV, Flask, ROS 2; 10 ünite', href: '/muhendislik/raspberry-pi', keywords: 'raspberry pi rpi tek kartlı bilgisayar linux terminal bash ssh apt systemd gpio gpiozero led buton servo pwm i2c spi 1-wire ds18b20 picamera2 kamera opencv l298n enkoder motor diferansiyel sürüş odometri flask web panel ros 2 keşif robotu' },
  { id: 'p:arm-stm32', group: 'Sayfa', title: 'ARM (STM32) ile Gömülü Programlama', subtitle: 'Büyükler için: yazmaçlar, HAL, PWM, kesmeler, FreeRTOS; 11 ünite', href: '/muhendislik/arm-stm32', keywords: 'stm32 arm cortex-m gömülü embedded c hal register yazmaç moder odr idr bsrr rcc pll saat timer zamanlayıcı pwm psc arr nvic exti kesme uart usart adc dma i2c spi düşük güç stop standby freertos rtos cubeide platformio wokwi nucleo' },
  { id: 'p:drone-parca', group: 'Sayfa', title: 'Drone parçaları', subtitle: 'Gövde, motor, ESC, pervane, LiPo, FC, sensörler', href: '/muhendislik/drone/parcalar', keywords: 'drone parça gövde frame fırçasız motor kv esc dshot pervane lipo pdb bec uçuş kontrolcüsü f4 f7 h7 imu barometre manyetometre gps alıcı elrs telemetri kamera vtx lidar' },
  { id: 'p:llm', group: 'Sayfa', title: 'Büyük Dil Modeli Uygulamaları', subtitle: 'Büyükler için LLM dersi: 10 ünite', href: '/muhendislik/llm', keywords: 'llm büyük dil modeli yapay zeka claude anthropic api token bpe gömme embedding prompt json şema rag ajan agent araç tool değerlendirme eval hakem uydurma halüsinasyon kişisel veri kvkk enjeksiyon maliyet önbellek akış streaming sse sohbet chatbot python javascript' },
  { id: 'p:llm-sim', group: 'Sayfa', title: 'LLM simülasyonları', subtitle: 'BPE, gömme, prompt, şema, RAG, ajan, eval, süzgeç, maliyet, akış', href: '/muhendislik/llm/simulasyon', keywords: 'llm simülasyon bpe tokenlaştırıcı gömme benzerlik prompt kalıbı json şema doğrulayıcı mini rag ajan döngüsü değerlendirme kişisel veri maskeleme maliyet hesaplayıcı akışlı sohbet' },
  { id: 'p:programlar', group: 'Sayfa', title: 'Programlar', subtitle: 'Büyükler için 6 çok dersli program', href: '/programlar', keywords: 'program sertifika yol hat track robotik programlama gömülü sistemler nesnelerin interneti iot veri yapay zeka uygulama geliştirme görüntü işleme otonom sistemler büyükler yetişkin' },
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
  { id: 'a:cv-demolar', group: 'Araç', title: 'Gerçek hayat demoları', subtitle: 'Görüntü işleme: düşme, bölge ihlali, nabız, trafik, meyve olgunluğu', href: '/robotun-gozleri/demolar', keywords: 'görüntü işleme bilgisayarlı görü computer vision opencv mediapipe kamera düşme tespiti bölge ihlali güvenlik gece kamera iş güvenliği el ocak duruş postür nabız rppg trafik araç sayma hız meyve olgunluk hsv yorgunluk esneme ear sürücü' },
  { id: 'a:robotun-gozleri', group: 'Araç', title: 'Robotun Gözleri', subtitle: 'Çocuklar için görüntü işleme ve kamera oyunları', href: '/robotun-gozleri', keywords: 'kamera oyun piksel renk maske yüz el vücut çocuk' },
  { id: 'a:ai-atolyesi', group: 'Araç', title: 'AI atölyesi', subtitle: 'Token, prompt, RAG, ajan ve eval araçları', href: '/ai-atolyesi', keywords: 'yapay zekâ ai llm token bpe prompt rag embedding ajan eval injection dil modeli' },
]
