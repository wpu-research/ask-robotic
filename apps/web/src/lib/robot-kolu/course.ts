// Robot Kolu Mühendisliği dersi (büyükler için, 16+): 10 ünite, TR/EN. Bu ders bağımsızdır: hiçbir robot üreticisinin resmî eğitimi,
// yazılımı ya da dili değildir; ders sanal bir kol ve platformun kendi dili ArmScript üzerinden kavramları öğretir. Kinematik, hareket,
// çarpışma, planlama ve güvenlik hesapları lib/robot-kolu içindedir (saf TypeScript, testli); dersteki sayılar bu koddan gelir.
// Yapı Drone ve LLM dersleriyle aynı (kod bloğu ve test bileşenleri ESOF 323'ten).
import type { RobotSimId } from '@/components/robot-kolu/sim-meta'
import type { SimId as EsofSimId } from '@/components/robotik/sim-meta'
import type { CodeBlock, QuizItem } from '@/lib/robotik/course'
import { UNITS_DATA } from './units'

export type Lang = 'tr' | 'en'
export interface UnitText {
  title: string
  /** Kart ve tablo için tek cümle. */
  summary: string
  goals: string[]
  /** Ders notu (HTML, depodaki sabit içerik). */
  notes: string
  code: CodeBlock[]
  /** "Kendin dene": simülasyonda yapılacak görev. */
  lab: string
  pitfalls: string[]
  /** Yazılım mühendisliği bağlantısı (HTML). */
  se: string
  quiz: QuizItem[]
}
/** Sitenin mevcut sayfalarına bağlantı (ESOF 323, parça kataloğu, drone dersi). */
export interface Related { href: string; tr: string; en: string }
export interface Unit {
  n: number
  sims: RobotSimId[]
  /** Bu üniteye gömülen ESOF 323 simülasyonları (yeniden yazılmadı, aynı bileşen). */
  esofSims?: EsofSimId[]
  /** Ünitede simülasyona verilen başlangıç ayarı (örn. hangi ArmScript örneği). */
  simCfg?: Partial<Record<RobotSimId, Record<string, string>>>
  related: Related[]
  tr: UnitText
  en: UnitText
}

export const UNITS: readonly Unit[] = UNITS_DATA
export const unitOf = (n: number): Unit | undefined => UNITS.find((u) => u.n === n)

/** ESOF 323'teki ön koşul içeriği: 7. hafta (manipülatör kinematiği), "arm" simülasyonu, robot kol dönem projesi. */
export const PREREQ = {
  week: '/muhendislik/robotik/hafta/7',
  project: '/muhendislik/robotik/proje/robot-kol',
  sim: 'arm' as const satisfies EsofSimId,
}

/** Ders künyesi. */
export const ROBOT_COURSE = {
  hours: 40,
  tr: {
    title: 'Robot Kolu Mühendisliği',
    lede: 'Sanal bir 6 eksenli robot kolunu tarayıcıda 3B sahnede sür: ileri ve ters kinematik, eklem uzayı ve kartezyen hareket, tutucu ve al-bırak, çarpışmasız yörünge planlama ve basit hücre güvenliği. Kolu programlamak için platformun kendi küçük dili ArmScript\'i öğrenirsin; program tarayıcıda, yalıtılmış bir yorumlayıcıda koşar, sunucuda hiçbir kod çalışmaz.',
    level: 'Büyükler için · 16 yaş ve üstü, lise son sınıf, üniversite ve meslekten öğrenenler',
    prereq: 'Ön koşul: ESOF 323 robotik dersinin 7. haftası (iki eklemli kolun ileri ve ters kinematiği) ve temel bir programlama dili. Vektör ve matris çarpımını bilmek yardımcıdır; derste dönüş matrisleri sıfırdan anlatılır.',
    outcomes: [
      'Altı eksenli bir kolun eksenlerini, uzuv uzunluklarını ve çalışma alanını okumak',
      'Dönüş matrisleriyle ileri kinematiği hesaplayıp TCP konumunu bulmak',
      'Küresel bilekli bir kol için ters kinematiği kapalı biçimde çözmek, çoklu çözümü ve tekilliği yorumlamak',
      'Eklem uzayı (PTP) ve kartezyen (LIN) hareketin farkını sayılarla göstermek',
      'Tutucu kuralını ve bir al-bırak sırasını tasarlamak',
      'ArmScript ile değişken, döngü, yordam ve sensör kullanan robot programı yazmak',
      'Engelli bir hücrede çarpışma denetimi yapıp RRT ile çarpışmasız yol planlamak',
      'Yasak bölge, hız sınırı, insan yakınlığı ve acil durdurma ile basit bir hücre güvenliği kurmak',
    ],
    cert: 'Üniteleri ve bitirme projesini tamamlayana Macademia katılım belgesi verilir.',
    teaching: 'Öğretim modeli: sanal kol bu dersin kendi modelidir. Uzuv ölçüleri, eklem sınırları, hız ve ivme değerleri ve güvenlik eşikleri bu sayfadaki kodda tanımlı ders sabitleridir; hiçbir robot üreticisinin ürünü, dili ya da eğitim içeriği değildir ve ders resmî bir üretici eğitimi değildir. Gerçek bir hücrede ölçüler üreticinin belgelerinden, güvenlik değerleri risk değerlendirmesinden gelir.',
  },
  en: {
    title: 'Robot Arm Engineering',
    lede: 'Drive a virtual six-axis robot arm in a 3D scene in your browser: forward and inverse kinematics, joint-space and Cartesian motion, a gripper and pick-and-place, collision-free trajectory planning and simple cell safety. To program the arm you learn ArmScript, this platform\'s own small language; programs run in an isolated interpreter in the browser, and no code runs on a server.',
    level: 'For adults · age 16 and up, final-year high school, university and working learners',
    prereq: 'Prerequisites: week 7 of the ESOF 323 robotics course (forward and inverse kinematics of a two-link arm) and one programming language. Knowing vector and matrix products helps; the course explains rotation matrices from scratch.',
    outcomes: [
      'Read the axes, link lengths and workspace of a six-axis arm',
      'Compute forward kinematics with rotation matrices and find the TCP position',
      'Solve inverse kinematics in closed form for an arm with a spherical wrist, and interpret multiple solutions and singularities',
      'Show the difference between joint-space (PTP) and Cartesian (LIN) motion with numbers',
      'Design the gripper rule and a pick-and-place sequence',
      'Write a robot program in ArmScript with variables, loops, procedures and sensors',
      'Check collisions in a cell with obstacles and plan a collision-free path with RRT',
      'Build simple cell safety with restricted zones, speed limits, human proximity and an emergency stop',
    ],
    cert: 'Learners who complete the units and the capstone receive a Macademia certificate of participation.',
    teaching: 'Teaching model: the virtual arm is this course\'s own model. Link lengths, joint limits, speed and acceleration values and safety thresholds are course constants defined in the code behind this page; none of it is any manufacturer\'s product, language or training content, and the course is not official manufacturer training. In a real cell, dimensions come from the manufacturer\'s documents and safety values from a risk assessment.',
  },
} as const
