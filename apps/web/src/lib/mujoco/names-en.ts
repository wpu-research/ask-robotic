// MuRoKo sahnelerinin İngilizce arayüzde görünen adları: model/eklem/motor/sensör adları (XML, hedefler, Python şablonu, örnek bloklar tek eşlemeden).
// Türkçe sahneler olduğu gibi kalır; İngilizcede `localizeScene` aynı sahneyi İngilizce adlarla üretir. Yalnız TAM sözcük eşleşir (aci ≠ aci_hizi).
import type { MjScene } from './scenes'

export const NAMES_EN: Record<string, string> = {
  // kol
  omuz: 'shoulder', dirsek: 'elbow', baglanti1: 'link1', baglanti2: 'link2', omuz_motoru: 'shoulder_motor', dirsek_motoru: 'elbow_motor',
  omuz_aci: 'shoulder_angle', dirsek_aci: 'elbow_angle', uc: 'tip', ucnokta: 'tip_site', zemin: 'floor',
  // arabalı sarkaç
  araba: 'cart', cubuk: 'pole', ray: 'rail', mafsal: 'hinge', itme: 'push', aci: 'angle', aci_hizi: 'angle_rate', konum: 'position', konum_hizi: 'position_rate',
  // tekerlekli robot
  sasi: 'chassis', tampon: 'bumper', goz: 'eye', tamponalan: 'bumper_zone', merkez: 'center', sol: 'left', sag: 'right',
  sol_teker: 'left_wheel', sag_teker: 'right_wheel', sol_motor: 'left_motor', sag_motor: 'right_motor', mesafe: 'distance', dokunma: 'touch', jiro: 'gyro', duvar: 'wall',
  // pençeli kol
  taban: 'base', taban_don: 'base_turn', omuzgov: 'shoulder_body', dirsekgov: 'elbow_body', bilek: 'wrist', parmaksol: 'finger_left_body', parmaksag: 'finger_right_body',
  parmak_sol: 'finger_left', parmak_sag: 'finger_right', taban_motoru: 'base_motor', parmak_sol_motoru: 'finger_left_motor', parmak_sag_motoru: 'finger_right_motor',
  taban_aci: 'base_angle', kup: 'cube', masa: 'table',
  // dört bacaklı robot
  govde: 'body', on_sol: 'front_left', on_sag: 'front_right', arka_sol: 'rear_left', arka_sag: 'rear_right',
  on_sol_kalca: 'front_left_hip', on_sol_diz: 'front_left_knee', on_sag_kalca: 'front_right_hip', on_sag_diz: 'front_right_knee',
  arka_sol_kalca: 'rear_left_hip', arka_sol_diz: 'rear_left_knee', arka_sag_kalca: 'rear_right_hip', arka_sag_diz: 'rear_right_knee',
  // fizik deneyleri
  ust: 'upper', alt: 'lower', ust_aci: 'upper_angle', alt_aci: 'lower_angle', alt_hiz: 'lower_rate',
  kure: 'ball', kutu: 'box', silindir: 'cylinder', kapsul: 'capsule', kure2: 'ball2', rampa: 'ramp',
  // gerçek modeller (Menagerie sahnelerine eklenen adlar)
  el: 'hand', eklem1: 'joint_1', eklem2: 'joint_2', eklem4: 'joint_4', nesne: 'object', isaret: 'index', orta: 'middle', yuzuk: 'ring', serce: 'little',
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
