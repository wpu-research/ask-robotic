// Sanal robot arenası: sahne, anlık görüntü (snapshot) ve hedef tipleri. Birimler: metre, saniye, radyan.
import type { Polyline, RoverConfig, Wall } from '@ask/sim'

/** Daire biçimli bölge: başlangıç, bitiş bandı, kontrol noktası, hedef. */
export interface Zone {
  id: string
  label?: string
  kind: 'start' | 'goal' | 'checkpoint' | 'target'
  x: number
  y: number
  r: number
}

/** Sensör donanımı (standart pinler; bkz. Modül 5 yazar rehberi). */
export interface SceneSensors {
  /** 5'li çizgi dizisi A0 (en sol) … A4 (en sağ). */
  line?: boolean
  /** HC-SR04 (TRIG D11, ECHO D12) + tarama servosu D4. */
  ultrasonic?: boolean
  /** Enkoder sol D2 / sağ D3. `bumpers` ile aynı anda kullanılamaz. */
  encoders?: boolean
  /** Tamponlar sol D2 / sağ D3 (INPUT_PULLUP, basılı = LOW). */
  bumpers?: boolean
  /** MPU6050 (0x68). */
  imu?: boolean
}

export interface Pose { x: number; y: number; theta: number }

/** Hareketli duvar: `keys` zaman çizelgesi (sn); aralarda doğrusal geçiş, sonra son değerde kalır. */
export interface Mover {
  id: string
  wall: Wall
  keys: Array<{ t: number; dx: number; dy: number }>
}

export interface RoverScene {
  kind: 'rover'
  id: string
  title: string
  description?: string
  /** Arena boyutu (m). */
  width: number
  height: number
  walls: Wall[]
  lines: Polyline[]
  lineWidth?: number
  pose: Pose
  sensors: SceneSensors
  /** Robot fiziği ayarları (gain, noiseCm, seed, deadband, gyroBiasDps…). */
  extra?: Partial<Pick<RoverConfig, 'gain' | 'noiseCm' | 'seed' | 'deadband' | 'wheelBase' | 'wheelRadius' | 'radius' | 'maxOmega' | 'tau' | 'slots' | 'gyroBiasDps' | 'gyroNoiseDps'>>
  zones: Zone[]
  /** Zamana bağlı hareket eden duvar parçaları (ör. takip edilecek hedef tahtası). Konum = wall + doğrusal ara değerli (dx, dy). */
  movers?: Mover[]
  /** true: robot elle taşınabilir/kaydırılabilir (sürükleyerek ya da düğmelerle); sensör derslerinde kullanılır. */
  movable?: boolean
  /** Elle basılan düğmeler (INPUT_PULLUP: basılı = LOW). Tampon/enkoder pinleriyle çakışmamalı. */
  buttons?: Array<{ pin: number; label: string }>
  /** Hiçbir çizgi sensörü çizgiyi görmeden bu kadar ms geçerse "çizgi kaybı" sayılır (varsayılan 250). */
  lostHoldMs?: number
  /** Etkinlik süresi (sn): dolunca arayüz duraklatır; testlerde çalıştırma süresi. */
  timeLimitS?: number
}

export interface ArmObject { id: string; label?: string; x: number; y: number }
export interface ArmZone { id: string; label?: string; x: number; y: number; r: number }

/** İki eklemli düzlemsel robot kol sahnesi (omuz D9, dirsek D10, tutucu D11). x ileri, y yukarı (cm). */
export interface ArmScene {
  kind: 'arm'
  id: string
  title: string
  description?: string
  /** Üst kol / ön kol uzunluğu (cm). */
  l1: number
  l2: number
  /** Omuz eksenini sahnede nerede göstereceğiz (cm; yalnız çizim). */
  objects: ArmObject[]
  zones: ArmZone[]
  /** Tutucu bu açının altındayken kapalı sayılır (°). */
  gripClosedBelowDeg: number
  /** Sunucuya gidecek sınır (cm) – çizim penceresi. */
  view: { xMin: number; xMax: number; yMin: number; yMax: number }
  /** Servo hız sınırı (°/sn). */
  servoDegPerSec?: number
  timeLimitS?: number
}

/** Dengelenen robot (ters sarkaç): tekerlek komutu u ∈ [-1,1], θ'' = A·sinθ − B·u − C·θ'. MPU6050 (0x68) ham verisi. */
export interface BalancerScene {
  kind: 'balancer'
  id: string
  title: string
  description?: string
  /** İlk eğim (°, + = ileri). */
  theta0Deg: number
  A?: number
  B?: number
  C?: number
  deadband?: number
  /** Bu eğimin üstünde robot "düştü" sayılır (varsayılan 45°). */
  fallDeg?: number
  gyroBiasDps?: number
  timeLimitS?: number
}

export type ArenaScene = RoverScene | ArmScene | BalancerScene

export interface LineSensorReading { pin: number; on: boolean; adc: number; x: number; y: number }

/** Çalışma anındaki durum özeti: hedefler ve arayüz bunu okur. */
export interface RoverSnapshot {
  kind: 'rover'
  /** Benzetim zamanı (sn). */
  timeS: number
  x: number
  y: number
  theta: number
  thetaDeg: number
  /** Çizgisel hız (m/s) ve dönme hızı (rad/s): son birkaç yüz ms üzerinden. */
  v: number
  omega: number
  distanceM: number
  /** Gezilen 25 cm'lik hücre sayısı (kapsama). */
  coverCells: number
  /** Toplam dönüş (° , mutlak değer toplamı) ve işaretli yön değişimi (° , sola +). */
  turnedDeg: number
  headingChangeDeg: number
  ticksL: number
  ticksR: number
  wL: number
  wR: number
  frontCm: number
  /** Gürültüsüz gerçek ön mesafe (cm, servo yönünde) ve çalışma boyunca görülen en küçük değeri. */
  frontTrueCm: number
  minFrontTrueCm: number
  collided: boolean
  /** Duvara çarpma sayısı (her temas bir kez). */
  collisions: number
  line: LineSensorReading[]
  /** Çizgi sensörlerinden en az biri çizgide mi. */
  onLine: boolean
  /** Çizgiyi kaybetme sayısı (hepsi `lostHoldMs` boyunca çizgi dışı). */
  lineExits: number
  /** Şu an çizgi dışında geçen kesintisiz süre (ms). */
  offLineMs: number
  /** Toplam çizgi dışı süre (ms) ve en uzun kesinti (ms). */
  totalOffLineMs: number
  longestOffLineMs: number
  bumperL: boolean
  bumperR: boolean
  /** Robot merkezinin en yakın duvara en küçük gerçek açıklığı (m, gövde yarıçapı düşülmüş). */
  minClearanceM: number
  visited: ReadonlySet<string>
  inZone: ReadonlySet<string>
  /** Tüm kontrol noktaları geçilip bitiş bölgesine girildiği an (sn). */
  finishedAtS: number | null
  serial: string
  /** Son seri çıktıdan bu yana geçen süre (sn): "hareket oturdu mu" kararı için. */
  serialAgeS: number
  /** Hareketli duvarların şimdiki konumu. */
  movers: Array<{ id: string; wall: Wall }>
  /** Dişli sayacından (yalnız ileri tıklar) tahmini konum – odometri paneli için. */
  odo: { x: number; y: number; theta: number; distanceM: number }
}

export interface ArmSnapshot {
  kind: 'arm'
  timeS: number
  /** Servo açıları (°): gerçek (servo hızıyla sınırlı) değerler. */
  q1: number
  q2: number
  grip: number
  /** Servoya yazılan son komut (°). */
  cmd: { q1: number; q2: number; grip: number }
  tipX: number
  tipY: number
  gripClosed: boolean
  held: string | null
  /** Nesne konumları. */
  objects: Array<{ id: string; x: number; y: number }>
  /** Bırakıldığı bölgeler: nesne id → bölge id. */
  placed: Record<string, string>
  /** Servo sinyalinde görülen darbe sayısı (µs → atlama bilgisi). */
  maxJumpDeg: number
  serial: string
  serialAgeS: number
  inZone: ReadonlySet<string>
}

export interface BalancerSnapshot {
  kind: 'balancer'
  timeS: number
  /** Eğim (°, + = ileri) ve eğim hızı (°/s). */
  thetaDeg: number
  rateDps: number
  /** Konum (m) ve hız (m/s). */
  x: number
  v: number
  fell: boolean
  /** Düştüyse düştüğü an (sn). */
  fellAtS: number | null
  /** Düşmeden geçen süre (sn). */
  uprightS: number
  maxAbsDeg: number
  serial: string
  serialAgeS: number
}

export type ArenaSnapshot = RoverSnapshot | ArmSnapshot | BalancerSnapshot

export interface ArenaGoalCtx<S extends ArenaSnapshot = ArenaSnapshot> {
  /** Henüz çalıştırılmadıysa başlangıç anının görüntüsü. */
  snap: S
  /** Çalışma başladı mı (hedeflerin ilerleme saymasına izin verir). */
  started: boolean
  code: string
  scene: ArenaScene
}

export interface ArenaGoal {
  id: string
  text: string
  hint?: string
  /** true: davranış hedefi, bir kez sağlanınca kod değişene kadar "tamam" kalır. */
  behavior?: boolean
  check: (ctx: ArenaGoalCtx<any>) => boolean // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface ArenaGoalResult { id: string; text: string; done: boolean; hint: string | undefined }

export interface ArenaActivity {
  /** Kısa yönerge (arenanın üstünde gösterilir). */
  intro?: string
  /** Her çağrıda başlangıç kodunu üretir. */
  starter: () => string
  /** Seri monitörün altında tek tıkla gönderilen komutlar (ör. W200, X). */
  quickSend?: Array<{ label: string; text: string }>
  scene: ArenaScene
  goals: ArenaGoal[]
  /** YALNIZ TEST: tüm hedefleri sağlayan örnek çözüm kodu. */
  solution?: () => string
  /** YALNIZ TEST: `solution` yoksa çözüm olarak bu dersin metnindeki sketch kullanılır (`// sketch: ad`). Derleme-doğrulanmış sketch'i çoğaltmamak için. */
  solutionSketch?: string
  /** YALNIZ TEST: çözüm çalışırken yapılacak etkileşimler. Verilmezse `runSeconds` (ya da sahnenin süresi) kadar çalıştırılır. */
  scenario?: (s: ArenaScenario) => void
  /** YALNIZ TEST: çalıştırma süresi (sn). */
  runSeconds?: number
}

/** YALNIZ TEST: çözümü çalıştırırken öğrencinin yapacağı etkileşimler. */
export interface ArenaScenario {
  advance(ms: number): void
  /** Düğmeye bas / bırak (sahnede `buttons` varsa). */
  press(pin: number, down: boolean): void
  /** Robotu verilen konuma ışınlar (öğrencinin robotu elle kaydırmasını taklit eder). */
  place(pose: Partial<Pose>): void
  sendSerial(text: string): void
  /** Koşul sağlanana ya da süre dolana kadar ilerler; koşul sağlandı mı döner. */
  until(pred: (s: ArenaSnapshot) => boolean, maxMs: number): boolean
  readonly snapshot: ArenaSnapshot
  readonly serial: string
}
