// Öğrencinin tasarladığı robotu MuRoKo laboratuvarında bir sahneye çevirir.
// Tasarım `/mikro-kart` tarafında kurulur ve tarayıcıda saklanır; burada okunup
// MJCF'e çevrilir, böylece aynı robot gerçek fizikte koşar ve kablolanabilir.
import { designToMjcf } from '@/lib/mikro/mjcf'
import { CHASSIS, type RobotDesign } from '@/lib/mikro/tasarim'
import type { MjScene } from './scenes'
import { isAssembly } from '@/lib/mikro/assembly'

/** Tasarım tezgâhının tarayıcıdaki anahtarı (components/mikro/robot-tasarla.tsx ile aynı). */
export const DESIGN_KEY = 'ask:tasarim:current:v1'
export const DESIGN_SCENE_ID = 'tasarimim'

/** Boş başlangıç tasarımı: orta şasi, parçasız. Öğrenci üstüne kurar. */
export function emptyDesign(): RobotDesign {
  return { v: 1, name: 'Robotum', chassis: 'orta', parts: [] }
}

/** Tasarımı tarayıcıya yazar; tasarım tezgâhı sayfası da aynı robotu görür. */
export function saveDesign(d: RobotDesign): boolean {
  try {
    localStorage.setItem(DESIGN_KEY, JSON.stringify(d))
    return true
  } catch {
    return false
  }
}

/** Kayıtlı tasarımı okur; yoksa ya da bozuksa null. */
export function loadDesign(): RobotDesign | null {
  try {
    const raw = localStorage.getItem(DESIGN_KEY)
    if (!raw) return null
    const d = JSON.parse(raw) as RobotDesign
    if (!d || d.v !== 1 || !CHASSIS[d.chassis] || !Array.isArray(d.parts)) return null
    if (d.assembly !== undefined && !isAssembly(d.assembly)) return null
    return d
  } catch {
    return null // gizli pencere ya da bozuk kayıt
  }
}

/**
 * Tasarımdan sahne üretir. Hedef konmaz: bu robotu ne yapacağına öğrenci karar verir.
 * Üretim başarısızsa (ör. tanınmayan parça) null döner, arayüz sessizce listeye eklemez.
 */
export function designScene(d: RobotDesign): (MjScene & { notes: { tr: string; en: string }[] }) | null {
  let built: ReturnType<typeof designToMjcf>
  try {
    built = designToMjcf(d)
  } catch {
    return null
  }
  const name = d.name?.trim() || 'Tasarımım'
  const ch = CHASSIS[d.chassis]
  const motors = built.actuators.length
  const servos = d.assembly?.filter((node) => node.type === 'servo').length ?? 0
  const count = d.parts.length + (d.assembly?.length ?? 0)

  return {
    id: DESIGN_SCENE_ID,
    icon: '🛠️',
    kind: 'robot',
    tr: {
      title: name,
      desc: `Senin tasarladığın robot: ${ch.title.toLowerCase()}, ${motors - servos} sürüş motoru${servos ? `, ${servos} servo eklemi` : ''}, ${count} parça.`,
      hint: motors
        ? 'ELEK rafından devreni kur, motorları bağla ve Arduino ile sür. Ya da bloklarla doğrudan dene.'
        : 'Tasarım sekmesinden teker ve motor ekle veya Montaj sekmesinden servo ekle.',
    },
    en: {
      title: name,
      desc: `The robot you designed: ${ch.en.toLowerCase()}, ${motors - servos} drive motors${servos ? `, ${servos} servo joints` : ''}, ${count} parts.`,
      hint: motors
        ? 'Build your circuit under ELEC, link the motors and drive it with Arduino. Or try it with blocks.'
        : 'Add wheels and a motor under Design, or add a servo under Assembly.',
    },
    cam: [0.22, -0.22, 0.18],
    look: [0, 0, 0.03],
    xml: built.xml,
    goals: [],
    python: {
      tr: `# Tasarladığın robot. Motor adları: ${built.actuators.join(', ') || '(yok)'}
from muroko import *

${built.actuators.map((a) => `motor("${a}", 6)`).join('\n') || '# Önce tasarıma teker ve motor ekle'}
wait(2)
${built.actuators.map((a) => `motor("${a}", 0)`).join('\n')}
`,
      en: `# The robot you designed. Motor names: ${built.actuators.join(', ') || '(none)'}
from muroko import *

${built.actuators.map((a) => `motor("${a}", 6)`).join('\n') || '# Add wheels and a motor to the design first'}
wait(2)
${built.actuators.map((a) => `motor("${a}", 0)`).join('\n')}
`,
    },
    notes: built.notes,
  }
}
