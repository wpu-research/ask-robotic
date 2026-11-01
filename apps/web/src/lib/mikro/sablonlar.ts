// Hazır şablonlar: boş ekrandan başlamak caydırıcıdır. Öğrenci çalışan bir
// robotla başlar, sonra üstünde oynar.
//
// Her şablon tam bir tasarımdır: gövde blokları + ızgaradaki parçalar. Hepsi
// MJCF'e çevrilip MuJoCo'da derlenebilir olmalıdır (sablonlar.test.ts bunu sınar).
import type { Govde } from './govde'
import { CHASSIS, placePart, type ChassisId, type RobotDesign } from './tasarim'

export interface Sablon {
  id: string
  icon: string
  tr: string
  en: string
  trDesc: string
  enDesc: string
  build(): RobotDesign
}

/** Blok kısaltması: merkez (m) ve yarı boyut (m). */
const blk = (id: string, pos: [number, number, number], size: [number, number, number], color = '#c2410c', shape: Govde['blocks'][number]['shape'] = 'kutu') =>
  ({ id, shape, pos, size, yaw: 0, color })

function base(name: string, chassis: ChassisId, govde: Govde): RobotDesign {
  return { v: 1, name, chassis, parts: [], govde }
}

/** İki tekerlekli, sarhoş tekerli klasik şasi. */
function ikiTeker(): RobotDesign {
  const ch = CHASSIS.orta
  let d = base('İki tekerlekli şasi', 'orta', {
    v: 1,
    blocks: [blk('b1', [0, 0, 0], [(ch.cols * 0.02) / 2, (ch.rows * 0.02) / 2, 0.002])],
  })
  d = placePart(d, 'teker-buyuk', 2, 0)
  d = placePart(d, 'teker-buyuk', 2, ch.rows - 1)
  d = placePart(d, 'motor-std', 1, 1)
  d = placePart(d, 'motor-std', 1, ch.rows - 2)
  d = placePart(d, 'sarhos', ch.cols - 1, Math.floor(ch.rows / 2))
  d = placePart(d, 'pil-4aa', 0, Math.floor(ch.rows / 2))
  return d
}

/** Dört tekerlekli, daha ağır ve dengeli gövde. */
function dortTeker(): RobotDesign {
  const ch = CHASSIS.buyuk
  let d = base('Dört tekerlekli şasi', 'buyuk', {
    v: 1,
    blocks: [blk('b1', [0, 0, 0], [(ch.cols * 0.02) / 2, (ch.rows * 0.02) / 2, 0.003])],
  })
  d = placePart(d, 'teker-buyuk', 1, 0)
  d = placePart(d, 'teker-buyuk', 1, ch.rows - 1)
  d = placePart(d, 'teker-buyuk', ch.cols - 2, 0)
  d = placePart(d, 'teker-buyuk', ch.cols - 2, ch.rows - 1)
  d = placePart(d, 'motor-guclu', 2, 1)
  d = placePart(d, 'motor-guclu', 2, ch.rows - 2)
  d = placePart(d, 'pil-6aa', 0, Math.floor(ch.rows / 2))
  return d
}

/** Önünde ultrasonik göz olan, engelden kaçan robot. */
function engeldenKacan(): RobotDesign {
  const ch = CHASSIS.orta
  let d = base('Engelden kaçan', 'orta', {
    v: 1,
    blocks: [
      blk('b1', [0, 0, 0], [(ch.cols * 0.02) / 2, (ch.rows * 0.02) / 2, 0.002]),
      // Sensör kulesi: ultrasonik göz yukarıdan baksın
      blk('b2', [(ch.cols * 0.02) / 2 - 0.01, 0, 0.015], [0.012, 0.02, 0.013], '#7c3aed'),
    ],
  })
  d = placePart(d, 'teker-buyuk', 2, 0)
  d = placePart(d, 'teker-buyuk', 2, ch.rows - 1)
  d = placePart(d, 'motor-std', 1, 1)
  d = placePart(d, 'motor-std', 1, ch.rows - 2)
  d = placePart(d, 'sarhos', ch.cols - 1, Math.floor(ch.rows / 2))
  d = placePart(d, 'ultrasonik', ch.cols - 1, 1)
  d = placePart(d, 'pil-4aa', 0, Math.floor(ch.rows / 2))
  return d
}

/** Çizgi izleyen: altta çizgi sensörü, küçük ve çevik. */
function cizgiIzleyen(): RobotDesign {
  const ch = CHASSIS.kucuk
  let d = base('Çizgi izleyen', 'kucuk', {
    v: 1,
    blocks: [blk('b1', [0, 0, 0], [(ch.cols * 0.02) / 2, (ch.rows * 0.02) / 2, 0.002], '#0f766e')],
  })
  d = placePart(d, 'teker-kucuk', 2, 0)
  d = placePart(d, 'teker-kucuk', 2, ch.rows - 1)
  d = placePart(d, 'motor-mini', 1, 1)
  d = placePart(d, 'motor-mini', 1, ch.rows - 2)
  d = placePart(d, 'sarhos', ch.cols - 1, Math.floor(ch.rows / 2))
  d = placePart(d, 'cizgi', ch.cols - 1, 1)
  d = placePart(d, 'lipo-2s', 0, Math.floor(ch.rows / 2))
  return d
}

/** Delikli hafif gövde: çıkarmanın ne işe yaradığını gösterir. */
function delikliHafif(): RobotDesign {
  const ch = CHASSIS.orta
  const hx = (ch.cols * 0.02) / 2, hy = (ch.rows * 0.02) / 2
  let d = base('Delikli hafif gövde', 'orta', {
    v: 1,
    blocks: [
      blk('b1', [0, 0, 0], [hx, hy, 0.003]),
      { ...blk('c1', [0.02, 0.02, 0], [0.012, 0.012, 0.02], '#5b3a24'), cut: true },
      { ...blk('c2', [0.02, -0.02, 0], [0.012, 0.012, 0.02], '#5b3a24'), cut: true },
      { ...blk('c3', [-0.02, 0.02, 0], [0.012, 0.012, 0.02], '#5b3a24'), cut: true },
      { ...blk('c4', [-0.02, -0.02, 0], [0.012, 0.012, 0.02], '#5b3a24'), cut: true },
    ],
  })
  d = placePart(d, 'teker-buyuk', 2, 0)
  d = placePart(d, 'teker-buyuk', 2, ch.rows - 1)
  d = placePart(d, 'motor-std', 1, 1)
  d = placePart(d, 'motor-std', 1, ch.rows - 2)
  d = placePart(d, 'sarhos', ch.cols - 1, Math.floor(ch.rows / 2))
  d = placePart(d, 'lipo-2s', 0, Math.floor(ch.rows / 2))
  return d
}

/** Kıskaçlı: önde tutucu kol. */
function kiskacli(): RobotDesign {
  const ch = CHASSIS.orta
  let d = base('Kıskaçlı robot', 'orta', {
    v: 1,
    blocks: [
      blk('b1', [0, 0, 0], [(ch.cols * 0.02) / 2, (ch.rows * 0.02) / 2, 0.002]),
      blk('b2', [(ch.cols * 0.02) / 2 + 0.008, 0, 0.004], [0.01, 0.03, 0.006], '#f59e0b'),
    ],
  })
  d = placePart(d, 'teker-buyuk', 2, 0)
  d = placePart(d, 'teker-buyuk', 2, ch.rows - 1)
  d = placePart(d, 'motor-std', 1, 1)
  d = placePart(d, 'motor-std', 1, ch.rows - 2)
  d = placePart(d, 'sarhos', ch.cols - 1, Math.floor(ch.rows / 2))
  d = placePart(d, 'kiskac', ch.cols - 1, Math.floor(ch.rows / 2) - 1)
  d = placePart(d, 'pil-4aa', 0, Math.floor(ch.rows / 2))
  return d
}

export const SABLONLAR: Sablon[] = [
  { id: 'iki-teker', icon: '🚗', tr: 'İki tekerlekli şasi', en: '2-wheel chassis', trDesc: 'Klasik başlangıç: iki motor, sarhoş teker.', enDesc: 'The classic starter: two motors and a caster.', build: ikiTeker },
  { id: 'dort-teker', icon: '🚙', tr: 'Dört tekerlekli şasi', en: '4-wheel chassis', trDesc: 'Ağır ve dengeli; güçlü motorlar.', enDesc: 'Heavy and stable; strong motors.', build: dortTeker },
  { id: 'engelden-kacan', icon: '📡', tr: 'Engelden kaçan', en: 'Obstacle avoider', trDesc: 'Önde ultrasonik göz, sensör kulesi.', enDesc: 'An ultrasonic eye on a sensor tower.', build: engeldenKacan },
  { id: 'cizgi-izleyen', icon: '🛣️', tr: 'Çizgi izleyen', en: 'Line follower', trDesc: 'Küçük, çevik, altta çizgi sensörü.', enDesc: 'Small and nimble, line sensor underneath.', build: cizgiIzleyen },
  { id: 'delikli', icon: '🕳️', tr: 'Delikli hafif gövde', en: 'Lightened body', trDesc: 'Dört delik açılmış gövde: daha hafif.', enDesc: 'Four holes cut out: lighter body.', build: delikliHafif },
  { id: 'kiskacli', icon: '🦾', tr: 'Kıskaçlı robot', en: 'Gripper robot', trDesc: 'Önde tutucu kol.', enDesc: 'A gripper arm up front.', build: kiskacli },
]

