// MuRoKo sahnelerinin İngilizce arayüzde görünen adları: bizim eklediğimiz sensör ve nesne adları (XML, hedefler, Python şablonu, örnek bloklar tek eşlemeden).
// Menagerie modellerinin kendi adları (actuator1, FR_hip, rh_A_FFJ3…) zaten İngilizcedir. Türkçe sahneler olduğu gibi kalır; İngilizcede `localizeScene` aynı sahneyi İngilizce adlarla üretir. Yalnız TAM sözcük eşleşir (aci ≠ aci_hizi).
import type { MjScene } from './scenes'

export const NAMES_EN: Record<string, string> = {
  // Franka Panda sahnesi
  el: 'hand', eklem1: 'joint_1', eklem2: 'joint_2', eklem4: 'joint_4', kup: 'cube', zemin: 'floor',
  // Unitree Go1 sahnesi
  govde: 'body', jiro: 'gyro',
  // Shadow Hand sahnesi
  nesne: 'object', isaret: 'index', orta: 'middle', yuzuk: 'ring', serce: 'little',
  // anahtar kareler
  baslangic: 'start',
}

const TOKEN = /(?<![A-Za-z0-9_])[A-Za-z_][A-Za-z0-9_]*/g
export const toEn = (s: string): string => s.replace(TOKEN, (m) => (Object.prototype.hasOwnProperty.call(NAMES_EN, m) ? NAMES_EN[m] : m))

const deep = <T,>(v: T): T => {
  if (typeof v === 'string') return toEn(v) as unknown as T
  if (Array.isArray(v)) return v.map(deep) as unknown as T
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)])) as T
  return v
}

/** Sahneyi İngilizce adlarla üretir (XML, hedef kanalları ve metinleri, Python şablonu, örnek bloklar, İngilizce açıklama). Türkçe metinler değişmez. */
export function localizeScene(s: MjScene): MjScene {
  return {
    ...s,
    xml: toEn(s.xml.replace(/model="([a-z0-9-]+)"/, (_m, name: string) => `model="${name}"`)),
    goals: s.goals.map((g) => ({ ...g, ch: toEn(g.ch), en: toEn(g.en) })),
    python: { tr: s.python.tr, en: toEn(s.python.en) },
    blocks: s.blocks ? deep(s.blocks) : undefined,
    en: { title: s.en.title, desc: toEn(s.en.desc), hint: toEn(s.en.hint) },
  }
}
