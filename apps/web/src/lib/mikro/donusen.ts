// Dönüşen Robot: tek beyin (Mikro Kart) + aynı parça takımı, beş farklı modele kurulur (insansı robot, robot kedi, gezgin araç,
// müzik aleti, vinç). Fizik yok: her model kinematik bir durum tutar (konum, kol/kuyruk/kanca açıları, konuşma balonu); bloklar bu
// durumu zamanla değiştirir, görünüm aynı parçaları modele göre dizip eklemleri oynatır. Saf TypeScript; Node'da başsız çalışır.
// Özgün tasarımdır; hiçbir ürünün adı, görseli ya da kodu kullanılmaz.

export type DonusenModelId = 'insansi' | 'kedi' | 'arac' | 'muzik' | 'vinc'

/** Parça takımı: her model aynı 11 parçadan kurulur. */
export type PartId = 'hub' | 'eye' | 'motorA' | 'motorB' | 'beam1' | 'beam2' | 'beam3' | 'beam4' | 'wheel1' | 'wheel2' | 'plate'
export const PARTS: Record<PartId, { label: string; en: string; shape: 'card' | 'eye' | 'motor' | 'beam' | 'short' | 'wheel' | 'plate' }> = {
  hub: { label: 'Mikro Kart (beyin)', en: 'Micro Card (brain)', shape: 'card' },
  eye: { label: 'mesafe sensörü', en: 'distance sensor', shape: 'eye' },
  motorA: { label: 'motor A', en: 'motor A', shape: 'motor' },
  motorB: { label: 'motor B', en: 'motor B', shape: 'motor' },
  beam1: { label: 'uzun kiriş', en: 'long beam', shape: 'beam' },
  beam2: { label: 'uzun kiriş', en: 'long beam', shape: 'beam' },
  beam3: { label: 'kısa kiriş', en: 'short beam', shape: 'short' },
  beam4: { label: 'kısa kiriş', en: 'short beam', shape: 'short' },
  wheel1: { label: 'teker', en: 'wheel', shape: 'wheel' },
  wheel2: { label: 'teker', en: 'wheel', shape: 'wheel' },
  plate: { label: 'taban plakası', en: 'base plate', shape: 'plate' },
}
export const PART_IDS = Object.keys(PARTS) as PartId[]

/** Eklem: görünümde durumdan gelen açıyla döndürülen parça. */
export type Joint = 'armL' | 'armR' | 'legL' | 'legR' | 'head' | 'tail' | 'wheel' | 'string' | 'boom' | 'hook'
/** Parçanın modeldeki yeri (görünüm birimi: 120 x 100 kutu; x, y merkez; r derece). `pivot`: eklemin döndüğü nokta. */
export interface PartPose { x: number; y: number; r?: number; joint?: Joint; pivot?: [number, number] }

export interface BuildStep { parts: PartId[]; text: string; en: string }

export interface DonusenModel {
  id: DonusenModelId
  title: string
  summary: string
  en: { title: string; summary: string }
  /** Bu modelde mesafe sensörü neyi görür: önündeki duvar / yaklaşan el / hiçbiri. */
  sees: 'wall' | 'hand' | 'none'
  poses: Record<PartId, PartPose>
  /** Kurulum adımları: her adım bazı parçaları yerine takar (hepsi bir kez). */
  build: BuildStep[]
}

const step = (parts: PartId[], text: string, en: string): BuildStep => ({ parts, text, en })

export const DONUSEN_MODELS: Record<DonusenModelId, DonusenModel> = {
  insansi: {
    id: 'insansi',
    title: 'İnsansı Robot',
    summary: 'İki bacak üstünde yürür, kollarını sallar, konuşma balonuyla konuşur. Başındaki mesafe sensörü önündeki duvarı görür.',
    en: { title: 'Humanoid Robot', summary: 'Walks on two legs, waves its arms and talks with a speech bubble. The distance sensor on its head sees the wall in front.' },
    sees: 'wall',
    poses: {
      plate: { x: 60, y: 58 },
      hub: { x: 60, y: 45 },
      eye: { x: 60, y: 29, joint: 'head', pivot: [60, 34] },
      motorA: { x: 46, y: 37 },
      motorB: { x: 74, y: 37 },
      beam1: { x: 42, y: 52, r: 90, joint: 'armL', pivot: [42, 38] },
      beam2: { x: 78, y: 52, r: 90, joint: 'armR', pivot: [78, 38] },
      beam3: { x: 54, y: 72, r: 90, joint: 'legL', pivot: [54, 61] },
      beam4: { x: 66, y: 72, r: 90, joint: 'legR', pivot: [66, 61] },
      wheel1: { x: 54, y: 86, joint: 'legL', pivot: [54, 61] },
      wheel2: { x: 66, y: 86, joint: 'legR', pivot: [66, 61] },
    },
    build: [
      step(['plate', 'beam3', 'beam4', 'wheel1', 'wheel2'], 'Taban plakasına iki kısa kirişi bacak olarak tak; tekerleri ayak yap.', 'Attach the two short beams to the base plate as legs; the wheels become feet.'),
      step(['hub'], 'Mikro Kart\'ı (beyin) gövde olarak bacakların üstüne yerleştir.', 'Place the Micro Card (brain) on top of the legs as the body.'),
      step(['motorA', 'motorB', 'beam1', 'beam2'], 'İki motoru omuz yap, uzun kirişleri kol olarak motorlara bağla.', 'Use the two motors as shoulders and connect the long beams to them as arms.'),
      step(['eye'], 'Mesafe sensörünü baş olarak en üste tak. İnsansı robot hazır!', 'Put the distance sensor on top as the head. The humanoid robot is ready!'),
    ],
  },
  kedi: {
    id: 'kedi',
    title: 'Robot Kedi',
    summary: 'Dört ayaklı kedi: elini yaklaştırınca mesafe sensörüyle seni görür; miyavlar, kuyruğunu sallar, oturur ve kalkar.',
    en: { title: 'Robot Cat', summary: 'A four-legged cat: when you bring your hand close, its distance sensor sees you; it meows, wags its tail, sits and stands.' },
    sees: 'hand',
    poses: {
      plate: { x: 60, y: 60 },
      beam2: { x: 60, y: 66 },
      hub: { x: 60, y: 51 },
      motorA: { x: 80, y: 52 },
      motorB: { x: 40, y: 54 },
      eye: { x: 90, y: 44, joint: 'head', pivot: [84, 50] },
      beam3: { x: 78, y: 76, r: 90, joint: 'legR', pivot: [78, 66] },
      beam4: { x: 42, y: 76, r: 90, joint: 'legL', pivot: [42, 66] },
      wheel1: { x: 78, y: 88, joint: 'legR', pivot: [78, 66] },
      wheel2: { x: 42, y: 88, joint: 'legL', pivot: [42, 66] },
      beam1: { x: 24, y: 44, r: -50, joint: 'tail', pivot: [36, 56] },
    },
    build: [
      step(['plate', 'beam2'], 'Taban plakasının altına uzun kirişi omurga olarak tak.', 'Attach a long beam under the base plate as the spine.'),
      step(['beam3', 'beam4', 'wheel1', 'wheel2'], 'Kısa kirişleri ön ve arka bacak yap; tekerler pati olsun.', 'Make the short beams the front and back legs; the wheels become paws.'),
      step(['hub', 'motorA', 'motorB'], 'Mikro Kart\'ı sırta koy; motorlardan biri boyun, öteki kuyruk motoru.', 'Put the Micro Card on the back; one motor is the neck, the other drives the tail.'),
      step(['eye', 'beam1'], 'Mesafe sensörünü baş yap, ikinci uzun kirişi kuyruk olarak tak. Miyav!', 'Use the distance sensor as the head and the second long beam as the tail. Meow!'),
    ],
  },
  arac: {
    id: 'arac',
    title: 'Gezgin Araç',
    summary: 'İki motorlu, iki tekerli araç: ileri geri sürer, arkasını döner; önündeki mesafe sensörü duvarı görür.',
    en: { title: 'Rover Car', summary: 'A two-motor, two-wheel car: drives forward and back and turns around; the distance sensor in front sees the wall.' },
    sees: 'wall',
    poses: {
      plate: { x: 60, y: 62 },
      beam1: { x: 60, y: 68 },
      beam2: { x: 56, y: 56 },
      hub: { x: 58, y: 47 },
      eye: { x: 90, y: 58 },
      motorA: { x: 40, y: 68 },
      motorB: { x: 80, y: 68 },
      wheel1: { x: 40, y: 78, joint: 'wheel' },
      wheel2: { x: 80, y: 78, joint: 'wheel' },
      beam3: { x: 94, y: 68, r: 90 },
      beam4: { x: 28, y: 50, r: 25 },
    },
    build: [
      step(['plate', 'beam1'], 'Taban plakasını uzun kirişle güçlendir: aracın şasisi.', 'Strengthen the base plate with a long beam: the car\'s chassis.'),
      step(['motorA', 'motorB', 'wheel1', 'wheel2'], 'İki motoru şasinin iki ucuna tak, tekerleri motorlara geçir.', 'Attach the two motors at both ends of the chassis and fit the wheels.'),
      step(['beam2', 'hub', 'beam3', 'beam4'], 'Mikro Kart\'ı üste koy; kısa kirişler tampon ve rüzgârlık olsun.', 'Put the Micro Card on top; the short beams become a bumper and a spoiler.'),
      step(['eye'], 'Mesafe sensörünü öne tak. Araç yola çıkmaya hazır!', 'Attach the distance sensor at the front. The car is ready to go!'),
    ],
  },
  muzik: {
    id: 'muzik',
    title: 'Müzik Aleti',
    summary: 'Gitar biçimli çalgı: teli çalınca nota çıkarır. Mesafe sensörü elinin uzaklığını ölçer; el yaklaştıkça nota incelir.',
    en: { title: 'Music Instrument', summary: 'A guitar-shaped instrument: strumming plays a note. The distance sensor measures how far your hand is; the closer the hand, the higher the note.' },
    sees: 'hand',
    poses: {
      plate: { x: 44, y: 64, r: -30 },
      hub: { x: 42, y: 64, r: -30 },
      wheel1: { x: 52, y: 58 },
      beam1: { x: 76, y: 42, r: -30 },
      beam2: { x: 66, y: 48, r: -30, joint: 'string', pivot: [66, 48] },
      motorA: { x: 98, y: 26, r: -30 },
      motorB: { x: 26, y: 74, r: -30 },
      beam3: { x: 36, y: 70, r: 60 },
      beam4: { x: 92, y: 32, r: 60 },
      wheel2: { x: 30, y: 58 },
      eye: { x: 46, y: 82, r: -30 },
    },
    build: [
      step(['plate', 'hub', 'wheel1'], 'Taban plakası ve Mikro Kart gövde olur; bir teker ses deliği.', 'The base plate and the Micro Card form the body; a wheel is the sound hole.'),
      step(['beam1', 'motorA', 'beam4'], 'Uzun kirişi sap yap; ucuna motoru akort burgusu olarak tak.', 'Make a long beam the neck; put a motor at its end as the tuning peg.'),
      step(['beam2', 'beam3', 'motorB', 'wheel2'], 'İkinci uzun kiriş tel olsun; kısa kiriş köprü, motor ve teker düğme.', 'The second long beam is the string; a short beam is the bridge, a motor and a wheel are knobs.'),
      step(['eye'], 'Mesafe sensörünü gövdenin altına, eline bakacak şekilde tak. Çal!', 'Attach the distance sensor under the body, facing your hand. Play!'),
    ],
  },
  vinc: {
    id: 'vinc',
    title: 'Vinç',
    summary: 'Dönen kollu taşıyıcı: kolu istediğin açıya çevirir, kancayı indirip kaldırır, yükü tutup bırakır.',
    en: { title: 'Crane', summary: 'A carrier with a rotating arm: turns the arm to any angle, lowers and raises the hook, grabs and drops the load.' },
    sees: 'none',
    poses: {
      plate: { x: 60, y: 88 },
      hub: { x: 60, y: 77 },
      eye: { x: 76, y: 88 },
      motorA: { x: 60, y: 66 },
      beam1: { x: 60, y: 46, r: 90 },
      motorB: { x: 60, y: 25 },
      beam2: { x: 80, y: 22, joint: 'boom', pivot: [60, 22] },
      beam4: { x: 48, y: 22, joint: 'boom', pivot: [60, 22] },
      wheel2: { x: 38, y: 22, joint: 'boom', pivot: [60, 22] },
      beam3: { x: 98, y: 34, r: 90, joint: 'hook', pivot: [98, 22] },
      wheel1: { x: 98, y: 22, joint: 'boom', pivot: [60, 22] },
    },
    build: [
      step(['plate', 'hub', 'eye'], 'Taban plakasına Mikro Kart\'ı koy; sensör tabanda kalsın.', 'Put the Micro Card on the base plate; the sensor stays on the base.'),
      step(['motorA', 'beam1'], 'Motor A döner tabla olsun; uzun kirişi direk olarak dik tak.', 'Motor A is the turntable; stand a long beam on it as the mast.'),
      step(['motorB', 'beam2', 'beam4', 'wheel2'], 'Direğin tepesine motor B\'yi, ona uzun kirişi kol olarak bağla; teker karşı ağırlık.', 'Put motor B on top of the mast and connect a long beam to it as the arm; a wheel is the counterweight.'),
      step(['wheel1', 'beam3'], 'Kolun ucuna makara teker ve kısa kirişten kanca tak. Vinç hazır!', 'Add a pulley wheel and a short-beam hook at the end of the arm. The crane is ready!'),
    ],
  },
}
export const DONUSEN_IDS = Object.keys(DONUSEN_MODELS) as DonusenModelId[]

// ---------------- benzetim durumu ----------------
/** Yürüyüş/sürüş pisti (cm): robot 0'dan başlar, duvar `WALL_CM`'de. */
export const WALL_CM = 150
export const STEP_CM = 10
/** Başlangıcın arkasındaki ev garajının duvarı (cm). */
export const BACK_CM = -40
/** Gövde ucundan sensöre kadar pay (cm): mesafe okuması duvar - konum - pay. */
const EYE_CM = 6
const MAX_CM = 250
/** Vinç yükleri: kolun açısıyla (derece, 0..180) yerleri. */
export interface CraneLoad { id: string; angle: number; color: string; lifted: boolean }
/** Vinçte boşaltma alanı (derece aralığı). */
export const CRANE_PAD = { from: 165, to: 180 }

export interface Spoken { t: number; text: string; hand: number }

export class DonusenBot {
  readonly model: DonusenModel
  now = 0
  // ---- yürüyüş / sürüş (insansı, araç) ----
  /** Pistteki konum (cm). */
  x = 0
  /** 1: duvara doğru, -1: başlangıca doğru. */
  dir: 1 | -1 = 1
  /** Bacak/teker evresi (görünüm için, derece). */
  phase = 0
  steps = 0
  turns = 0
  /** En ileri konum ve duvara dayanma (çarpma). */
  maxX = 0
  bumped = false
  // ---- kollar, baş, kuyruk ----
  armL = 0
  armR = 0
  waves = 0
  tail = 0
  tailWags = 0
  pose: 'kalk' | 'otur' = 'kalk'
  poseLog: Array<{ t: number; pose: 'kalk' | 'otur'; hand: number }> = []
  // ---- konuşma ----
  speech = ''
  speechUntil = 0
  said: Spoken[] = []
  // ---- müzik ----
  stringAmp = 0
  strums: Array<{ t: number; freq: number; hand: number }> = []
  // ---- vinç ----
  /** Kolun açısı (derece, 0..180). */
  boom = 90
  /** Kanca: 0 yukarıda, 1 yerde. */
  hook = 0
  loads: CraneLoad[] = []
  carrying: string | null = null
  // ---- el (kedi, müzik) ----
  /** Elin sensöre uzaklığı (cm); arayüzdeki kaydırıcı ya da görevin el betiği belirler. */
  handCm = 100
  /** Verilirse el bu betikle (zaman → cm) kendiliğinden hareket eder. */
  handScript: ((tMs: number) => number) | null = null

  constructor(model: DonusenModelId, o: { loads?: CraneLoad[]; handScript?: (tMs: number) => number } = {}) {
    this.model = DONUSEN_MODELS[model]
    this.loads = (o.loads ?? []).map((l) => ({ ...l }))
    this.handScript = o.handScript ?? null
    if (this.handScript) this.handCm = this.handScript(0)
  }

  get id(): DonusenModelId { return this.model.id }
  advanceTo(nowMs: number) {
    this.now = nowMs
    if (this.handScript) this.handCm = this.handScript(nowMs)
    if (this.stringAmp > 0) this.stringAmp = Math.max(0, this.stringAmp - 0.02)
  }

  /** Mesafe sensörü (cm): duvara ya da ele uzaklık. */
  get distanceCm(): number {
    if (this.model.sees === 'hand') return Math.max(0, Math.min(MAX_CM, Math.round(this.handCm)))
    if (this.model.sees === 'wall') {
      const d = this.dir === 1 ? WALL_CM - this.x - EYE_CM : this.x - BACK_CM - EYE_CM
      return Math.max(0, Math.min(MAX_CM, Math.round(d)))
    }
    return MAX_CM
  }
  /** Bir adım/sürüş parçası: ön duvardan ya da arkadaki ev garajının duvarından öteye geçilmez; dayanırsa `bumped`. */
  advance(cm: number) {
    const nx = this.x + cm * this.dir
    const cx = Math.max(BACK_CM + 4, Math.min(WALL_CM - 4, nx))
    if (cx !== nx) this.bumped = true
    this.x = cx
    if (this.x > this.maxX) this.maxX = this.x
  }
  say(text: string, ms = 1500) {
    this.speech = text
    this.speechUntil = this.now + ms
    this.said.push({ t: this.now, text, hand: this.handCm })
  }
  get speaking(): string { return this.now < this.speechUntil ? this.speech : '' }
  setPose(p: 'kalk' | 'otur') { this.pose = p; this.poseLog.push({ t: this.now, pose: p, hand: this.handCm }) }
  /** Elin uzaklığına göre nota: 5 cm'lik bantlar, yakın el ince ses. 40 cm'den uzakta en kalın nota. */
  noteFreq(): number {
    const NOTES = [523, 494, 440, 392, 349, 330, 294, 262]
    return NOTES[Math.max(0, Math.min(NOTES.length - 1, Math.floor(this.handCm / 5)))]
  }
  /** Kanca yerdeyken altındaki yük (açı farkı 8°'den az). */
  loadUnderHook(): CraneLoad | null {
    return this.loads.find((l) => !l.lifted && Math.abs(l.angle - this.boom) < 8) ?? null
  }
  grab() {
    if (this.carrying || this.hook < 0.99) return
    const l = this.loadUnderHook()
    if (l) { l.lifted = true; this.carrying = l.id }
  }
  release() {
    const l = this.loads.find((q) => q.id === this.carrying)
    if (!l) return
    l.lifted = false
    l.angle = this.boom
    this.carrying = null
  }
  /** Yük boşaltma alanında ve yerde mi. */
  loadOnPad(id: string): boolean {
    const l = this.loads.find((q) => q.id === id)
    return !!l && !l.lifted && l.angle >= CRANE_PAD.from - 1 && l.angle <= CRANE_PAD.to + 1
  }
  /** Görünüm için eklem açıları (derece). */
  jointAngle(j: Joint): number {
    switch (j) {
      case 'armL': return -this.armL
      case 'armR': return this.armR
      case 'legL': return this.model.id === 'kedi' ? (this.pose === 'otur' ? -35 : 0) : Math.sin((this.phase * Math.PI) / 180) * 18
      case 'legR': return this.model.id === 'kedi' ? (this.pose === 'otur' ? 10 : 0) : -Math.sin((this.phase * Math.PI) / 180) * 18
      case 'head': return this.model.id === 'kedi' && this.pose === 'otur' ? -12 : 0
      case 'tail': return this.tail
      case 'wheel': return this.phase
      case 'string': return Math.sin(this.now / 18) * this.stringAmp * 3
      case 'boom': return 0
      case 'hook': return 0
    }
  }
}
