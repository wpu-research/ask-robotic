// Dilkur Akademi ana sayfası (dilkur.macademia.com.tr): okullara anaokulundan liseye Robotik ve Mühendislik yolu.
// Her kademede iki sütun (Robotik · Mühendislik yolu); her ders bağlantısı sitedeki gerçek bir sayfaya gider
// (dilkur-landing.test.ts sınar). Fotoğraflar public/brand/dilkur altında; künyeleri PHOTO_CREDITS'te.

export interface LinkItem { href: string; tr: string; en: string }
export interface Stage { id: 'anaokulu' | 'ilkokul' | 'ortaokul' | 'lise'; icon: string; tr: { title: string; ages: string; text: string }; en: { title: string; ages: string; text: string }; robotik: LinkItem[]; muhendislik: LinkItem[] }

const L = (href: string, tr: string, en: string): LinkItem => ({ href, tr, en })

export const STAGES: readonly Stage[] = [
  { id: 'anaokulu', icon: '🧸',
    tr: { title: 'Anaokulu', ages: '5–6 yaş', text: 'Okuma bilmeden, sesli anlatımla: sıra, tekrar ve neden-sonuç. Karakterlere komut ver, hikâye kur.' },
    en: { title: 'Kindergarten', ages: 'Ages 5–6', text: 'No reading needed, with voice guidance: order, repeat and cause and effect. Give characters commands and build stories.' },
    robotik: [L('/atolye', 'Blok atölyesi', 'Block workshop'), L('/sahne-atolyesi', 'Sahne atölyesi', 'Stage workshop')],
    muhendislik: [L('/oyunlar', 'Öğretici blok oyunları', 'Block puzzle games'), L('/robotun-gozleri', 'Robotun Gözleri: renk ve şekil', 'Robot Eyes: colours and shapes')] },
  { id: 'ilkokul', icon: '🤖',
    tr: { title: 'İlkokul', ages: '1–4. sınıf', text: 'Robotunu bloklarla görevlere gönder, ilk elektronik kartını programla, kendi oyununu yap.' },
    en: { title: 'Primary school', ages: 'Grades 1–4', text: 'Send your robot on missions with blocks, program your first electronics board, make your own game.' },
    robotik: [L('/robot-atolyesi', 'Robot atölyesi', 'Robot workshop'), L('/oyun-atolyesi', 'Oyun atölyesi', 'Game workshop')],
    muhendislik: [L('/mikro-kart', 'Mikro Kart: ışık, ses, sensör', 'Micro Board: light, sound, sensors'), L('/robotun-gozleri', 'Robotun Gözleri: görüntü işleme', 'Robot Eyes: image processing')] },
  { id: 'ortaokul', icon: '🔌',
    tr: { title: 'Ortaokul', ages: '5–8. sınıf', text: 'Gerçek devre ve kod: Arduino, sensörler ve robot tasarımı. Takımla yarışma sezonları.' },
    en: { title: 'Middle school', ages: 'Grades 5–8', text: 'Real circuits and code: Arduino, sensors and robot design. Team competition seasons.' },
    robotik: [L('/robot-atolyesi/tasarla', 'Robotunu Tasarla', 'Design Your Robot'), L('/robot-atolyesi/sezonlar', 'Yarışma sezonları', 'Competition seasons'), L('/moduller/robotik', 'Robotik: sürüş, çizgi, PID', 'Robotics: driving, lines, PID')],
    muhendislik: [L('/moduller/arduino-temelleri', 'Arduino Temelleri', 'Arduino Basics'), L('/moduller/sensorler-ve-projeler', 'Sensörler ve Projeler', 'Sensors and Projects'), L('/laboratuvar', 'Sanal devre laboratuvarı', 'Virtual circuit lab')] },
  { id: 'lise', icon: '🚁',
    tr: { title: 'Lise', ages: '9–12. sınıf', text: 'Mühendislik düzeyi: 128 gerçek parça, robot kolu, drone, yapay zekâ. Hangi mesleğe uygun olduğunu bulma anketi.' },
    en: { title: 'High school', ages: 'Grades 9–12', text: 'Engineering level: 128 real parts, robot arm, drones, AI. A survey to find which career fits.' },
    robotik: [L('/arena', 'Robot arenası', 'Robot arena'), L('/muhendislik/robot-kolu', 'Robot kolu mühendisliği', 'Robot arm engineering'), L('/muhendislik/drone', 'Drone mühendisliği', 'Drone engineering')],
    muhendislik: [L('/muhendislik', 'Mühendislik yolu: 128 parça (3B)', 'Engineering path: 128 parts (3D)'), L('/makine-ogrenmesi', 'Makine öğrenmesi', 'Machine learning'), L('/yol-haritasi/anket', 'Kariyer anketi', 'Career survey')] },
]

export interface PhotoCredit { file: string; title: string; creator: string; license: string; licenseUrl: string; source: string }

export const PHOTO_CREDITS: readonly PhotoCredit[] = [
  { file: '/brand/dilkur/hero.jpg', title: 'VEX Robotics Competition Robot', creator: 'Noah Wulf', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', source: 'https://commons.wikimedia.org/wiki/File:VEX_Robotics_Competition_Robot.jpg' },
  { file: '/brand/dilkur/robotik.jpg', title: 'Ozobot', creator: '-stk', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', source: 'https://commons.wikimedia.org/wiki/File:Ozobot.jpeg' },
  { file: '/img/kariyer/drone-iha.jpg', title: 'Quadcopter camera drone in flight', creator: 'Josh Sorenson', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', source: 'https://commons.wikimedia.org/wiki/File:Quadcopter_camera_drone_in_flight.jpg' },
]
