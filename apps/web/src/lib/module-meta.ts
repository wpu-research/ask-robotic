export type TrackKey = 'cocuk' | 'maker' | 'ai'

export const TRACKS: Record<TrackKey, { label: string; hint: string }> = {
  cocuk: { label: 'Çocuk hattı', hint: 'Blokla kodlamaya ilk adım' },
  maker: { label: 'Maker hattı', hint: 'Elektronik, sensör ve robotik' },
  ai: { label: 'AI hattı', hint: 'Yapay zekâ mühendisliği' },
}

/** Modül başına kısa tanıtım. Veritabanında olmayan, sunuma yönelik metinler. */
export const MODULE_META: Record<string, { tagline: string; audience: string; ages?: string; callout?: string }> = {
  scratchjr: {
    tagline: 'Blokları sürükle, karakteri programla: sıra, tekrar, olay ve hikâye.',
    audience: '5-7 yaş, yanında bir yetişkinle',
    ages: '5-7 yaş',
    callout: 'Bütün etkinlikler platformun kendi blok uygulamasında, dersin yanında yapılır. Kurulum ya da ek bir şey gerekmez; tarayıcı yeterli.',
  },
  scratch: {
    tagline: 'Animasyon, hikâye ve oyun yap. Değişken, mesajlaşma, klon ve liste öğren.',
    audience: '8-12 yaş',
    ages: '8-12 yaş',
    callout: 'Dersler tarayıcıda çalışan Scratch 3 ile yapılır. Hesap açmadan da kullanılabilir.',
  },
  'arduino-temelleri': {
    tagline: 'LED\'den termostata: giriş/çıkış, analog, PWM, motor, zamanlama ve ekran.',
    audience: '12 yaş ve üzeri, sıfırdan başlayanlar',
    callout: 'Her ders bir devre ve çalışan bir Arduino programı içerir; programlar bir Arduino Uno benzetiminde derlenip çalıştırılarak doğrulandı. Platformun kendi devre simülatörü geliştirme aşamasında; o gelene kadar devreleri kendi kartında ya da Wokwi, Tinkercad gibi bir simülatörde kurabilirsin.',
  },
  'sensorler-ve-projeler': {
    tagline: 'Mesafe, hareket, ortam, ses, gaz ve kimlik sensörleri. Her hafta bir proje.',
    audience: 'Arduino Temelleri\'ni bitirenler',
    callout: 'Programlar sanal sensör modelleriyle sınandı (HC-SR04, DHT, BMP280, MPU6050 vb.). Bazı parçalar (RC522, SD kart, VL53L0X) yalnız derleme düzeyinde doğrulandı; derslerde belirtilir.',
  },
  'mikro-kart': {
    tagline: 'Sanal bir LED kartı programla: 5x5 ekran, düğmeler, sensörler, müzik ve radyo.',
    audience: '8 yaş ve üzeri, sıfırdan başlayanlar',
    ages: '8+ yaş',
    callout: 'Her dersin etkinliği tarayıcıdaki sanal Mikro Kart ile yapılır: bloklarla program yazarsın, kartın 5x5 LED ekranı, düğmeleri ve sensörleri canlı çalışır. Sıcaklık, ışık, ses ve hareket kaydırıcılarla verilir; hiçbir fiziksel parça gerekmez. Radyo derslerinde iki sanal kart yan yana çalışır. Bloklara karşılık gelen JavaScript ve Python kodunu da görebilirsin.',
  },
  'oyun-atolyesi': {
    tagline: 'Bloklarla kendi oyununu yap: sprite, çarpışma, skor, harita, düşman ve platform.',
    audience: '8 yaş ve üzeri, sıfırdan başlayanlar',
    ages: '8+ yaş',
    callout: 'Her dersin etkinliği tarayıcıdaki Oyun Atölyesi ile yapılır: blokları birleştirirsin, sahnede oyunun hemen çalışır. Resim ve harita editörleri aynı sayfadadır; kurulum gerekmez. Çalışırken blok değiştirirsen yeni hâli için sıfırla (↺) düğmesine basman gerekir.',
  },
  robotik: {
    tagline: 'Sanal arenada sürüş, engel, çizgi, enkoder, PID ve denge. Bitirmede kendi robotunu seç.',
    audience: 'Sensörler ve Projeler\'i bitirenler',
    callout: 'Her dersin etkinliği tarayıcıdaki sanal robot arenasında yapılır: Arduino C++ kodunu yazarsın, derlenir ve robot üstten görünüşlü 2B arenada hareket eder. Sensör ışınları, çizgi sensörü değerleri, enkoder ve odometri canlı görünür; hedefler robotun gerçek konumu ve ölçümleriyle denetlenir. Hiçbir fiziksel parça gerekmez. Gerçek robotta kazançlar ve zamanlamalar farklı olabilir; dersler bunu belirtir.',
  },
}

/** Modül türü rozeti: Blok / Devre / Robot. */
export type ModuleKind = 'blok' | 'devre' | 'robot' | 'oyun'
export const KIND_LABEL: Record<ModuleKind, string> = { blok: 'Blok', devre: 'Devre', robot: 'Robot', oyun: 'Oyun' }
export const MODULE_KIND: Record<string, ModuleKind> = {
  scratchjr: 'blok',
  scratch: 'blok',
  'arduino-temelleri': 'devre',
  'sensorler-ve-projeler': 'devre',
  robotik: 'robot',
  'mikro-kart': 'blok',
  'oyun-atolyesi': 'oyun',
}
export const moduleKind = (slug: string): ModuleKind => MODULE_KIND[slug] ?? 'devre'

/** Ders türü rozeti: dersin etkinlik alanında ne açıldığı. */
export type LessonKind = 'metin' | 'blok' | 'devre' | 'arena' | 'oyun'
export const LESSON_KIND_LABEL: Record<LessonKind, string> = { metin: 'Metin', blok: 'Blok', devre: 'Devre', arena: 'Arena', oyun: 'Oyun' }

/**
 * Panelde "Yakında" kartı olarak görünen modüller (veritabanında yok).
 * Modül 6 (Diğer Kartlar) hiç gösterilmez; Modül 8 ve 9 şimdilik gizlidir (docs/plan-moduller.md).
 * Açıklama docs/plan-moduller.md'deki modül listesinden alınmıştır; ayrıntı uydurulmaz.
 */
export const UPCOMING = [
  {
    slug: 'ai-engineering',
    position: 7,
    title: 'AI Engineering + Claude',
    track: 'ai' as TrackKey,
    status: 'Planlandı',
    description: 'Yapay zekâ mühendisliği hattı: AI Engineering ve Claude ile çalışma. Planlandı; içerik henüz yazılmadı.',
  },
]

/** Yaş aralığı etiketi: önce elle girilmiş aralık, yoksa veritabanındaki en küçük yaş. */
export const ageLabel = (slug: string, minAge: number | null): string | null =>
  MODULE_META[slug]?.ages ?? (minAge ? `${minAge}+ yaş` : null)
