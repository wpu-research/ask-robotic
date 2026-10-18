// Yarışma sezonları: robot yarışmalarındaki gibi temalı bir görev alanı, birkaç puanlı alt görev, süre sınırı ve cezalar.
// Alan, Sanal Beceri ile aynı motorla (runSkill: tohum 1, sabit adım sınırı) başsız çalıştırılır; puan sunucuda yeniden hesaplanır.
// Alt görevler yalnız mevcut benzetim öğelerinden kurulur: bölgeler, küpler, renk alanları, ışıklar, duvarlar.
import { rectWalls } from '../arena/geometry'
import { runSkill, type ScorePart, type SkillChallenge, type SkillResult } from './beceri'
import { b, onStart, project } from './program'
import { grip, lights, move, turn } from './robot-missions'
import type { DriveBase, RobotScene } from './robot'
import type { MikroProject } from './types'

/** Rakam ve metin TR + EN. */
interface Bi { title: string; how: string }

/** Kurallar sayfasındaki puan tablosunun bir satırı; `score` aynı satırın puanını robot durumundan hesaplar. */
export interface SeasonSubMission extends Bi {
  id: string
  /** Tabloda gösterilen puan yazısı (ör. "5 + 5 + 5"). */
  points: string
  /** Bu alt görevden alınabilecek en yüksek puan. */
  max: number
  en: Bi
  score(r: DriveBase, finishMs: number | null): number
}

export interface SeasonPenalty extends Bi {
  id: string
  /** Bir kez uygulanan ceza ya da her olay için. */
  per: 'once' | 'each'
  /** Ceza puanı (eksi). */
  points: number
  en: Bi
  /** Kaç kez uygulanacağı. */
  count(r: DriveBase): number
}

export interface Season {
  /** URL parçası. */
  id: string
  number: number
  title: string
  theme: string
  /** Sezon penceresi (ISO). Lig yalnız bu aralıktaki gönderimleri sayar. */
  startsAt: string
  endsAt: string
  /** Takım puanını oluşturan en iyi öğrenci sayısı. */
  teamTop: number
  field: SkillChallenge
  subMissions: SeasonSubMission[]
  penalties: SeasonPenalty[]
  en: { title: string; theme: string }
}

/** Bitirince kalan her 2 saniye için +1 (Sanal Beceri ile aynı kural). */
export const seasonTimeBonus = (finishMs: number | null, limitS: number) => (finishMs == null ? 0 : Math.max(0, Math.floor((limitS * 1000 - finishMs) / 2000)))

const W = 2.4
const H = 1.6
/** Hastane çağrısı: ilk bu kadar ms içinde ulaşılmalı. */
const HOSPITAL_MS = 20_000
const CITY_LIMIT_S = 90

/** Akıllı Şehir alanı: Kıskaçlı Robot başlangıçta sol alt köşede, doğuya bakar. */
function cityScene(): RobotScene {
  return {
    id: 'sezon-1-akilli-sehir',
    title: 'Akıllı Şehir',
    width: W,
    height: H,
    walls: [
      ...rectWalls(0, 0, W, H),
      // Binalar (rotanın dışında; çarpmak ceza)
      ...rectWalls(1.35, 0.15, 1.75, 0.45),
      ...rectWalls(0.25, 0.98, 0.6, 1.08),
    ],
    lines: [],
    patches: [
      { x1: 0.8, y1: 0.86, x2: 1.0, y2: 1.06, color: 'sari' },     // kargo deposu
      { x1: 1.15, y1: 0.6, x2: 1.3, y2: 0.8, color: 'mavi' },      // kavşak
      { x1: 1.44, y1: 0.8, x2: 1.66, y2: 1.0, color: 'yesil' },    // geri dönüşüm merkezi
    ],
    zones: [
      { id: 'hastane', label: 'hastane', kind: 'checkpoint', x: 0.65, y: 0.25, r: 0.1 },
      { id: 'okul', label: 'okul', kind: 'checkpoint', x: 1.45, y: 0.7, r: 0.1 },
      { id: 'kutuphane', label: 'kütüphane', kind: 'checkpoint', x: 1.9, y: 0.7, r: 0.1 },
      { id: 'santral', label: 'santral', kind: 'checkpoint', x: 1.2, y: 1.25, r: 0.1 },
      { id: 'yesil-alan', label: 'yeşil alan', kind: 'penalty', x: 0.4, y: 0.72, r: 0.15 },
      { id: 'otopark', label: 'otopark', kind: 'goal', x: 0.3, y: 1.25, r: 0.1 },
    ],
    objects: [
      { id: 'paket', x: 1.0, y: 0.25, color: 'sari' },
      { id: 'atik', x: 2.0, y: 1.0, color: 'yesil' },
    ],
    pose: { x: 0.25, y: 0.25, theta: 0 },
  }
}

/** Küp bırakılmış (tutulmuyor) ve altındaki zemin bu renkte. */
const cubeOn = (r: DriveBase, id: string, color: string) => r.held !== id && r.objectFloor(id) === color
const inOrder = (r: DriveBase, a: string, z: string) => r.visitedAt.has(a) && r.visitedAt.has(z) && r.visitedAt.get(a)! < r.visitedAt.get(z)!

const CITY_SUBS: SeasonSubMission[] = [
  {
    id: 'hastane', points: '15', max: 15,
    title: 'Acil çağrı', how: `İlk ${HOSPITAL_MS / 1000} saniye içinde hastane noktasına ulaş.`,
    en: { title: 'Emergency call', how: `Reach the hospital point within the first ${HOSPITAL_MS / 1000} seconds.` },
    score: (r) => ((r.visitedAt.get('hastane') ?? Infinity) <= HOSPITAL_MS ? 15 : 0),
  },
  {
    id: 'kargo', points: '20', max: 20,
    title: 'Kargo teslimatı', how: 'Sarı paketi kıskaçla al, sarı depoya bırak.',
    en: { title: 'Parcel delivery', how: 'Pick up the yellow parcel with the gripper and drop it in the yellow depot.' },
    score: (r) => (cubeOn(r, 'paket', 'sari') ? 20 : 0),
  },
  {
    id: 'kavsak', points: '10', max: 10,
    title: 'Yeşil dalga', how: 'Mavi kavşaktan ışıkların yeşil yanarken geç.',
    en: { title: 'Green wave', how: 'Cross the blue junction with your lights shining green.' },
    score: (r) => (r.colorLights.includes('mavi:yesil') ? 10 : 0),
  },
  {
    id: 'servis', points: '5 + 5 + 5', max: 15,
    title: 'Okul servisi', how: 'Okul ve kütüphane noktalarından geç (her biri 5); önce okul sonra kütüphane sırası +5.',
    en: { title: 'School bus', how: 'Pass the school and library points (5 each); school first, then library: +5.' },
    score: (r) => (r.visited.has('okul') ? 5 : 0) + (r.visited.has('kutuphane') ? 5 : 0) + (inOrder(r, 'okul', 'kutuphane') ? 5 : 0),
  },
  {
    id: 'geri-donusum', points: '20', max: 20,
    title: 'Geri dönüşüm', how: 'Yeşil atık küpünü yeşil geri dönüşüm merkezine bırak.',
    en: { title: 'Recycling', how: 'Drop the green waste cube in the green recycling centre.' },
    score: (r) => (cubeOn(r, 'atik', 'yesil') ? 20 : 0),
  },
  {
    id: 'santral', points: '10', max: 10,
    title: 'Enerji kontrolü', how: 'Güneş santrali noktasına uğra.',
    en: { title: 'Energy check', how: 'Visit the solar plant point.' },
    score: (r) => (r.visited.has('santral') ? 10 : 0),
  },
  {
    id: 'otopark', points: '20', max: 20,
    title: 'Otoparka dönüş', how: 'Otopark dairesinde dur. Durduğun an çalıştırma biter; ondan önceki görevler sayılır.',
    en: { title: 'Back to the car park', how: 'Stop inside the car park circle. The run ends the moment you stop there; tasks done before that count.' },
    score: (_r, finishMs) => (finishMs != null ? 20 : 0),
  },
  {
    id: 'zaman', points: '+1 / 2 sn', max: CITY_LIMIT_S / 2,
    title: 'Zaman bonusu', how: 'Otoparkta bitirirsen kalan her 2 saniye için +1.',
    en: { title: 'Time bonus', how: 'If you finish in the car park, +1 for every 2 seconds left.' },
    score: (_r, finishMs) => seasonTimeBonus(finishMs, CITY_LIMIT_S),
  },
]

const CITY_PENALTIES: SeasonPenalty[] = [
  {
    id: 'carpma', per: 'each', points: -5,
    title: 'Çarpma', how: 'Duvara, binaya ya da küpe her çarpma.',
    en: { title: 'Crash', how: 'Every crash into a wall, building or cube.' },
    count: (r) => r.collisions,
  },
  {
    id: 'yesil-alan', per: 'once', points: -10,
    title: 'Yeşil alana girme', how: 'Robotun merkezi parkın (yeşil alan dairesi) içine girerse.',
    en: { title: 'Entering the green space', how: 'If the robot\'s center enters the park (green space circle).' },
    count: (r) => (r.visited.has('yesil-alan') ? 1 : 0),
  },
  {
    id: 'kirmizi', per: 'once', points: -10,
    title: 'Kırmızı ışıkta geçiş', how: 'Mavi kavşaktan ışıklar kırmızı yanarken geçmek.',
    en: { title: 'Running a red light', how: 'Crossing the blue junction with your lights shining red.' },
    count: (r) => (r.colorLights.includes('mavi:kirmizi') ? 1 : 0),
  },
  {
    id: 'yanlis-teslim', per: 'each', points: -10,
    title: 'Yanlış teslimat', how: 'Bir küp kendi renginden başka bir teslim alanında bırakılırsa (küp başına).',
    en: { title: 'Wrong delivery', how: 'A cube left on a delivery area of another colour (per cube).' },
    count: (r) => (cubeOn(r, 'paket', 'yesil') ? 1 : 0) + (cubeOn(r, 'atik', 'sari') ? 1 : 0),
  },
]

/** Alt görev ve ceza satırlarını puan dökümüne çevirir (sıra kurallar tablosuyla aynı). */
export function seasonParts(subs: readonly SeasonSubMission[], pens: readonly SeasonPenalty[], r: DriveBase, finishMs: number | null): ScorePart[] {
  return [
    ...subs.map((s) => ({ label: s.title, en: s.en.title, points: s.score(r, finishMs) })),
    ...pens.map((p) => {
      const n = p.count(r)
      return { label: `${p.title} (${n} × ${p.points})`, en: `${p.en.title} (${n} × ${p.points})`, points: n * p.points }
    }),
  ]
}

const CITY_FIELD: SkillChallenge = {
  id: 'sezon-1-akilli-sehir',
  title: 'Sezon 1: Akıllı Şehir',
  profile: 'kiskac',
  summary: `Kıskaçlı Robot ile şehrin işlerini yap: acil çağrı, kargo, yeşil dalga, okul servisi, geri dönüşüm, enerji kontrolü; sonunda otoparka dön. ${CITY_LIMIT_S} saniyen var.`,
  rules: [
    ...CITY_SUBS.map((s) => `${s.title} (${s.points}): ${s.how}`),
    ...CITY_PENALTIES.map((p) => `${p.title} (${p.points}${p.per === 'each' ? ' / her biri' : ''}): ${p.how}`),
    'Puan sıfırın altına düşmez.',
  ],
  en: {
    title: 'Season 1: Smart City',
    summary: `Run the city with the Gripper Robot: emergency call, parcel delivery, green wave, school bus, recycling, energy check, then back to the car park. You have ${CITY_LIMIT_S} seconds.`,
    rules: [
      ...CITY_SUBS.map((s) => `${s.en.title} (${s.points.replace('sn', 's')}): ${s.en.how}`),
      ...CITY_PENALTIES.map((p) => `${p.en.title} (${p.points}${p.per === 'each' ? ' each' : ''}): ${p.en.how}`),
      'The score never goes below zero.',
    ],
  },
  timeLimitS: CITY_LIMIT_S,
  scene: cityScene,
  finished: (r) => r.inZone('otopark') && r.stopped,
  parts: (r, finishMs) => seasonParts(CITY_SUBS, CITY_PENALTIES, r, finishMs),
  sample: () => project('Akıllı Şehir', [onStart(
    b('rb_speed', { i: { P: 80 } }),
    lights('yesil'),
    // hastane → paket → depo
    move(65), grip('close'), turn(90), move(60), grip('open'), move(15, 'back'),
    // kavşak → okul → kütüphane
    turn(90, 'right'), move(110),
    // atık → geri dönüşüm
    turn(90), move(20), grip('close'), turn(90), move(35), grip('open'), move(15, 'back'),
    // santral → otopark
    turn(90, 'right'), move(35), turn(90), move(150),
  )]),
}

export const SEASONS: Season[] = [
  {
    id: 'akilli-sehir',
    number: 1,
    title: 'Sezon 1: Akıllı Şehir',
    theme: 'Şehrin robotu ol: acil durumlara yetiş, paketleri ve atıkları doğru yere taşı, trafiği aksatma.',
    startsAt: '2026-09-01T00:00:00+03:00',
    endsAt: '2027-01-31T23:59:59+03:00',
    teamTop: 3,
    field: CITY_FIELD,
    subMissions: CITY_SUBS,
    penalties: CITY_PENALTIES,
    en: { title: 'Season 1: Smart City', theme: 'Be the city\'s robot: answer emergencies, carry parcels and waste to the right place, keep the traffic flowing.' },
  },
]

export const SEASON_BY_ID: Record<string, Season> = Object.fromEntries(SEASONS.map((s) => [s.id, s]))
/** Alan (skill_runs.challenge_id) kimliğiyle sezon. */
export const SEASON_BY_FIELD: Record<string, Season> = Object.fromEntries(SEASONS.map((s) => [s.field.id, s]))
export const SEASON_FIELDS: SkillChallenge[] = SEASONS.map((s) => s.field)

/** Sezonun en yüksek olası puanı (cezasız, tam süre bonusu hariç değil: bonusun üst sınırı dahil). */
export const seasonMaxScore = (s: Season) => s.subMissions.reduce((n, x) => n + x.max, 0)

export type SeasonPhase = 'yakinda' | 'acik' | 'bitti'
export function seasonPhase(s: Season, now = new Date()): SeasonPhase {
  if (now < new Date(s.startsAt)) return 'yakinda'
  return now > new Date(s.endsAt) ? 'bitti' : 'acik'
}

/** Resmi alan puanı (sunucu ve tarayıcı aynı işlevi çağırır). */
export const runSeasonField = (s: Season, p: MikroProject): SkillResult => runSkill(s.field, p)
