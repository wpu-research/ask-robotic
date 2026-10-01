export type TrackKey = 'cocuk' | 'maker' | 'ai'

export const TRACKS: Record<TrackKey, { label: string; hint: string }> = {
  cocuk: { label: 'Çocuk hattı', hint: 'Blokla kodlamaya ilk adım' },
  maker: { label: 'Maker hattı', hint: 'Elektronik, sensör ve robotik' },
  ai: { label: 'AI hattı', hint: 'Yapay zekâ mühendisliği' },
}

/** Modül başına kısa tanıtım. Veritabanında olmayan, sunuma yönelik metinler. */
export const MODULE_META: Record<string, { tagline: string; audience: string; callout?: string }> = {
  scratchjr: {
    tagline: 'Blokları sürükle, karakteri programla: sıra, tekrar, olay ve hikâye.',
    audience: '5-7 yaş, yanında bir yetişkinle',
    callout: 'Bütün etkinlikler platformun kendi blok uygulamasında, dersin yanında yapılır. Kurulum ya da ek bir şey gerekmez; tarayıcı yeterli.',
  },
  scratch: {
    tagline: 'Animasyon, hikâye ve oyun yap. Değişken, mesajlaşma, klon ve liste öğren.',
    audience: '8-12 yaş',
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
  robotik: {
    tagline: 'Sürüş, engel, çizgi, enkoder, PID ve denge. Bitirmede kendi robotunu seç.',
    audience: 'Sensörler ve Projeler\'i bitirenler',
    callout: 'Robotlar 2B bir benzetimde sınandı. Gerçek robotta kazançlar ve zamanlamalar farklı olabilir; dersler bunu belirtir.',
  },
}

/** Henüz veritabanında olmayan modüller (sunum amaçlı). */
export const UPCOMING = [
  { slug: 'robotik', title: 'Robotik', track: 'maker' as TrackKey, status: 'Yazılıyor' },
  { slug: 'diger-kartlar', title: 'Diğer Kartlar (ESP32, RP2040, Raspberry Pi)', track: 'maker' as TrackKey, status: 'Planlandı' },
  { slug: 'ai-engineering', title: 'AI Engineering + Claude', track: 'ai' as TrackKey, status: 'Planlandı' },
]
