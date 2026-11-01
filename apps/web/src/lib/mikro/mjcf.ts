// Tasarlanan robotu MuJoCo modeline (MJCF) çevirir: öğrencinin ızgaraya dizdiği şasi,
// tekerler, motorlar ve sensörler gerçek fizikte koşan bir robot olur.
//
// Tasarımdaki değerler zaten fiziksel: teker çapı (m), motor devri (°/s) ve durma torku
// (Nm), parça kütleleri (g). Burada yapılan iş onları MJCF'in beklediği gövde/eklem/motor
// ağacına yazmaktır — yeni fizik uydurulmaz.
//
// Eksenler: tasarımda ileri +x, sola +y (MuJoCo ile aynı); z yukarı.
import { CARD, CHASSIS, PARTS, PITCH, cardCells, cellXY, deriveDesign, type ChassisSpec, type PlacedPart, type RobotDesign } from './tasarim'
import { MATERIAL_SPEC, blockVolume, govdeMassG, normalizeGovde, resolveSolids, type Block, type PrimitiveShape } from './govde'
import { meshVertexAttr, type MeshShape } from './sekiller'

/** MuJoCo'da yerleşik olan şekiller; kalanlar örgü olarak verilir. */
const PRIMITIVES: string[] = ['kutu', 'silindir', 'kure', 'kapsul', 'elipsoid'] satisfies PrimitiveShape[]

/** Şasi levhasının kalınlığı (m). */
const DECK = 0.004
/** Sarhoş teker bilyesinin yarıçapı (m). */
const CASTER_R = 0.008

const f = (n: number) => (Math.abs(n) < 1e-9 ? '0' : Number(n.toFixed(5)).toString())
const v3 = (x: number, y: number, z: number) => `${f(x)} ${f(y)} ${f(z)}`
/** XML metin değerlerinde ad/başlık kaçışı. */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]!))
/** MJCF adları: harf, rakam, alt çizgi. Türkçe harfler ve boşluk sadeleşir. */
const idOf = (s: string, i: number) => {
  const t = s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  return t ? `${t}_${i}` : `p${i}`
}

/** Bir parçanın hücresinden dünya konumu (şasi merkezine göre). */
function partXY(ch: ChassisSpec, p: PlacedPart): [number, number] {
  return cellXY(ch, p.c, p.r)
}

/** Tekerin yarıçapı; teker yoksa makul bir varsayılan (robot yine de ayakta dursun). */
function wheelRadius(d: RobotDesign): number {
  const w = d.parts.map((p) => PARTS[p.type]).find((s) => s.wheel)
  return (w?.wheel?.d ?? 0.048) / 2
}

export interface MjcfResult {
  xml: string
  /** Üretilen motor adları (ELEK bağlantı paneli bunları gösterir). */
  actuators: string[]
  /** Üretilen sensör adları. */
  sensors: string[]
  /** Çeviride atlanan ya da yaklaşık karşılanan şeyler; arayüz dürüstçe söyler. */
  notes: { tr: string; en: string }[]
}

/**
 * Tasarımı MuJoCo modeline çevirir. Dönen XML doğrudan `MjModel.mj_loadXML` ile derlenir;
 * paket (mesh) gerektirmez, bütün geometri ilkel şekillerden kurulur.
 */
export function designToMjcf(d: RobotDesign): MjcfResult {
  const ch = CHASSIS[d.chassis]
  const der = deriveDesign(d)
  const notes: MjcfResult['notes'] = []
  const actuators: string[] = []
  /** Şafta tutturulmuş tekerler: ızgara görünümünde iki kez çizilmesin diye. */
  const shaftUsed = new Set<string>()
  const sensors: string[] = []

  const r = wheelRadius(d)
  const deckZ = r // şasi levhası teker ekseniyle aynı yükseklikte
  const halfX = (ch.cols * PITCH) / 2
  const halfY = (ch.rows * PITCH) / 2

  // Şasi + kart + sürücü olmayan parçaların kütlesi levhaya yazılır (kg)
  const wheelParts = d.parts.filter((p) => PARTS[p.type].wheel)
  /** Serbest çizilmiş gövde varsa onun blokları, yoksa tek levha. */
  const govde = d.govde ? normalizeGovde(d.govde) : null

  // Gövde çizilmişse kütlesi çizimden gelir (delik açmak gerçekten hafifletir);
  // çizilmemişse şasi tablosundaki kütle kullanılır.
  const partsMassG = d.parts.filter((p) => !PARTS[p.type].wheel).reduce((s, p) => s + PARTS[p.type].massG, 0)
  const deckMassG = govde
    ? govdeMassG(govde) + partsMassG + CARD.massG
    : der.massG - wheelParts.reduce((s, p) => s + PARTS[p.type].massG, 0)
  const deckMass = Math.max(0.02, deckMassG / 1000)

  const geoms: string[] = []
  const assets: string[] = []
  const bodies: string[] = []
  const sites: string[] = []
  const sensorXml: string[] = []
  const actXml: string[] = []

  if (govde) {
    // Çizilen gövde, delikler düşüldükten sonra dışbükey parçalara ayrılır: içbükey
    // gövde MuJoCo'da böyle kurulur. Delik gerçektir, fizik de deliği görür.
    const { pieces, notes: cutNotes } = resolveSolids(govde)
    for (const n of cutNotes) notes.push({ tr: n.tr, en: n.en })
    const totalV = pieces.reduce((s, p) => s + blockVolume({ ...p, id: p.from } as Block), 0) || 1
    pieces.forEach((p, i) => {
      const b: Block = { ...p, id: p.from }
      const m = (deckMass * blockVolume(b)) / totalV
      let meshName: string | undefined
      if (!PRIMITIVES.includes(b.shape)) {
        meshName = `m_govde_${i}`
        const verts = b.shape === 'ozel'
          ? customVertexAttr(b.mesh ?? [], b.size)
          : meshVertexAttr(b.shape as MeshShape, b.size)
        assets.push(`<mesh name="${meshName}" vertex="${verts}"/>`)
      }
      // Malzeme yalnız görüntüdür: parlaklık ve saydamlık MJCF materyaliyle taşınır
      const mt = MATERIAL_SPEC[b.material ?? 'standart']
      let matName = ''
      if (b.material && b.material !== 'standart') {
        matName = `mt_govde_${i}`
        assets.push(`<material name="${matName}" rgba="${hexRgba(p.color, mt.alpha)}" specular="${f(mt.specular)}" shininess="${f(mt.shininess)}" reflectance="${f(mt.reflectance)}"/>`)
      }
      const look = matName ? `material="${matName}"` : `rgba="${hexRgba(p.color)}"`
      geoms.push(`<geom name="govde_${i}" ${blockGeom(b, meshName)} mass="${f(m)}" ${look}/>`)
    })
    if (!pieces.length) {
      notes.push({ tr: 'Gövdenin tamamı delinmiş: geriye katı kalmadı.', en: 'The body is cut away entirely: no solid remains.' })
      geoms.push(`<geom name="govde" type="box" size="${v3(halfX, halfY, DECK / 2)}" pos="${v3(0, 0, 0)}" mass="${f(deckMass)}" rgba=".86 .24 .55 1"/>`)
    }
  } else {
    geoms.push(`<geom name="govde" type="box" size="${v3(halfX, halfY, DECK / 2)}" pos="${v3(0, 0, 0)}" mass="${f(deckMass)}" rgba=".86 .24 .55 1"/>`)
  }

  // Mikro Kart: şasinin ortasında, görünür olsun diye ayrı kutu (kütlesi levhaya dahil)
  const cc = cardCells(ch)
  const [cx0, cy0] = cellXY(ch, cc[0][0], cc[0][1])
  const [cx1, cy1] = cellXY(ch, cc[3][0], cc[3][1])
  geoms.push(`<geom name="kart" type="box" size="${v3(PITCH, PITCH, 0.003)}" pos="${v3((cx0 + cx1) / 2, (cy0 + cy1) / 2, DECK / 2 + 0.003)}" mass="0" rgba=".12 .35 .72 1" contype="0" conaffinity="0"/>`)

  d.parts.forEach((p, i) => {
    const spec = PARTS[p.type]
    const [px, py] = partXY(ch, p)
    const name = idOf(spec.en, i)

    if (spec.wheel) {
      // Şafta tutturulmuşsa teker, kendi hücresinde değil motorun milinde durur:
      // mil boyunca (yanlamasına) uç / orta / dip konumlarından birine oturur.
      let wx = px, wy = py
      const att = p.attach
      if (att) {
        const motor = d.parts.find((q) => q.id === att.motorId && PARTS[q.type].motor)
        if (motor) {
          const [mx, my] = partXY(ch, motor)
          const dir = my >= 0 ? 1 : -1
          const reach = { dip: 0.004, orta: 0.012, uc: 0.02 }[att.snap]
          wx = mx
          wy = my + dir * reach
          shaftUsed.add(p.id)
        } else {
          notes.push({
            tr: `${spec.title}: tutturulduğu motor tasarımda yok, kendi yerinde bırakıldı.`,
            en: `${spec.en}: the motor it was attached to is missing, left in its own cell.`,
          })
        }
      }
      // Teker: kendi gövdesi, y ekseni etrafında döner. Sağ/sol, konumundan belli olur.
      const side = wy >= 0 ? 'sol' : 'sag'
      const wname = `${side}_teker_${i}`
      const jname = `${side}_eklem_${i}`
      const ww = spec.wheel.w
      const yOut = wy + Math.sign(wy || 1) * (ww / 2)
      bodies.push(
        `<body name="${wname}" pos="${v3(wx, yOut, 0)}">
        <joint name="${jname}" type="hinge" axis="0 1 0"/>
        <geom type="cylinder" size="${f(spec.wheel.d / 2)} ${f(ww / 2)}" quat="0.7071068 0.7071068 0 0" mass="${f(spec.massG / 1000)}" rgba=".09 .11 .16 1" friction="${f(spec.wheel.traction)} .005 .0001"/>
      </body>`)
      // Sürüş motoru: tasarımdaki devir ve tork sınırı doğrudan aktarılır
      const motor = d.parts.map((q) => PARTS[q.type]).find((s) => s.motor)?.motor
      const wMax = ((motor?.rpmDeg ?? 800) * Math.PI) / 180
      const tau = motor?.stallNm ?? 0.2
      const aname = `${side}_motor_${i}`
      actXml.push(`<velocity name="${aname}" joint="${jname}" kv="${f(Math.max(0.02, tau / Math.max(wMax, 1e-3)))}" ctrlrange="${f(-wMax)} ${f(wMax)}" forcerange="${f(-tau)} ${f(tau)}"/>`)
      actuators.push(aname)
      sensorXml.push(`<jointvel name="${side}_hiz_${i}" joint="${jname}"/>`)
      sensors.push(`${side}_hiz_${i}`)
      return
    }

    if (p.type === 'sarhos') {
      // Sarhoş teker: sürtünmesi düşük bilye; her yöne kayar
      geoms.push(`<geom name="${name}" type="sphere" size="${f(CASTER_R)}" pos="${v3(px, py, -(deckZ - CASTER_R))}" mass="${f(spec.massG / 1000)}" rgba=".61 .64 .69 1" friction=".05 .005 .0001"/>`)
      return
    }

    const h = Math.max(0.004, Math.abs(spec.h) || 0.008)
    const z = spec.h < 0 ? -(DECK / 2 + h / 2) : DECK / 2 + h / 2
    geoms.push(`<geom name="${name}" type="box" size="${v3(PITCH * 0.42, PITCH * 0.42, h / 2)}" pos="${v3(px, py, z)}" mass="${f(spec.massG / 1000)}" rgba="${hexRgba(spec.color)}"/>`)

    const s = spec.sensor
    if (!s) return
    if (s.kind === 'distance') {
      // Mesafe sensörü ışını: ileri bakar (+x). Menzil metre cinsinden okunur.
      const sname = `mesafe_${i}`
      sites.push(`<site name="${sname}_s" pos="${v3(px + PITCH * 0.45, py, z)}" zaxis="1 0 0" size=".002"/>`)
      sensorXml.push(`<rangefinder name="${sname}" site="${sname}_s" cutoff="${f(s.rangeCm / 100)}"/>`)
      sensors.push(sname)
    } else if (s.kind === 'gyro') {
      const sname = `jiro_${i}`
      sites.push(`<site name="${sname}_s" pos="${v3(px, py, z)}" size=".002"/>`)
      sensorXml.push(`<gyro name="${sname}" site="${sname}_s"/>`)
      sensors.push(sname)
    } else if (s.kind === 'force') {
      const sname = `tampon_${i}`
      sites.push(`<site name="${sname}_s" type="box" size="${v3(0.004, PITCH * 0.45, 0.006)}" pos="${v3(px + PITCH * 0.5, py, z)}"/>`)
      sensorXml.push(`<touch name="${sname}" site="${sname}_s"/>`)
      sensors.push(sname)
    } else {
      // Zemine bakan renk/ışık/çizgi sensörleri: MuJoCo'da renk okuyan sensör yok,
      // yere uzaklık ölçen bir ışınla yaklaşık karşılanır.
      const sname = `zemin_${i}`
      sites.push(`<site name="${sname}_s" pos="${v3(px, py, z)}" zaxis="0 0 -1" size=".002"/>`)
      sensorXml.push(`<rangefinder name="${sname}" site="${sname}_s" cutoff=".2"/>`)
      sensors.push(sname)
      notes.push({
        tr: `${spec.title}: MuJoCo'da zemin rengi okunamaz; yere uzaklık ölçen bir ışınla karşılandı.`,
        en: `${spec.en}: MuJoCo cannot read floor colour; approximated with a ray measuring height above the floor.`,
      })
    }
  })

  if (!wheelParts.length) {
    notes.push({ tr: 'Tasarımda teker yok: robot yerinde durur.', en: 'The design has no wheels: the robot will just sit there.' })
  }

  sensorXml.push(`<framepos name="konum" objtype="body" objname="govde"/>`)
  sensors.push('konum')

  const xml = `<mujoco model="${esc(idOf(d.name || 'robot', 0))}">
  <compiler angle="radian" usethread="false"/>
  <option timestep="0.002" integrator="implicitfast"/>
${assets.length ? `  <asset>\n    ${assets.join('\n    ')}\n  </asset>` : ''}
  <worldbody>
    <light pos="0 0 1.5" dir="0 0 -1" directional="true"/>
    <geom name="zemin" type="plane" size="4 4 .1" pos="0 0 0" rgba=".95 .91 .86 1" friction="1 .005 .0001"/>
    <body name="govde" pos="${v3(0, 0, deckZ)}">
      <freejoint name="serbest"/>
      ${geoms.join('\n      ')}
      ${sites.join('\n      ')}
      ${bodies.join('\n      ')}
    </body>
  </worldbody>
  <actuator>
    ${actXml.join('\n    ')}
  </actuator>
  <sensor>
    ${sensorXml.join('\n    ')}
  </sensor>
  <keyframe>
    <key name="muroko" qpos="${v3(0, 0, deckZ)} 1 0 0 0${wheelParts.map(() => ' 0').join('')}"/>
  </keyframe>
</mujoco>`

  return { xml, actuators, sensors, notes }
}

/**
 * Bir gövde bloğunun MJCF geom niteliklerini üretir. Her blok dışbükeydir, bu yüzden
 * doğrudan çarpışma geometrisi olarak kullanılabilir; ayrıştırmaya gerek yoktur.
 */
function blockGeom(b: Block, meshName?: string): string {
  const [sx, sy, sz] = b.size
  const yaw = (b.yaw * Math.PI) / 180
  const quat = `${f(Math.cos(yaw / 2))} 0 0 ${f(Math.sin(yaw / 2))}`
  const pos = v3(b.pos[0], b.pos[1], b.pos[2])
  switch (b.shape) {
    case 'silindir': return `type="cylinder" size="${f(sx)} ${f(sz)}" pos="${pos}" quat="${quat}"`
    case 'kure': return `type="sphere" size="${f(sx)}" pos="${pos}"`
    case 'kapsul': return `type="capsule" size="${f(sx)} ${f(sz)}" pos="${pos}" quat="${quat}"`
    case 'elipsoid': return `type="ellipsoid" size="${v3(sx, sy, sz)}" pos="${pos}" quat="${quat}"`
    case 'kutu': return `type="box" size="${v3(sx, sy, sz)}" pos="${pos}" quat="${quat}"`
    // Dışbükey çokyüzlü: köşe listesi verilir, MuJoCo dışbükey örtüyü alır —
    // şekil dışbükey olduğu için örtü tam olarak şeklin kendisidir.
    default: return `type="mesh" mesh="${meshName}" pos="${pos}" quat="${quat}"`
  }
}

/** İçe aktarılan modelin köşeleri: birim kutudan gerçek yarı boyutlara ölçeklenir. */
function customVertexAttr(mesh: number[], size: [number, number, number]): string {
  const out: string[] = []
  for (let i = 0; i + 2 < mesh.length; i += 3) {
    out.push(`${f(mesh[i] * size[0])} ${f(mesh[i + 1] * size[1])} ${f(mesh[i + 2] * size[2])}`)
  }
  return out.join(' ')
}

/** '#rrggbb' → MJCF rgba ('r g b a', 0-1). */
function hexRgba(hex: string, alpha = 1): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return `.5 .5 .5 ${f(alpha)}`
  const n = parseInt(m[1], 16)
  return `${f(((n >> 16) & 255) / 255)} ${f(((n >> 8) & 255) / 255)} ${f((n & 255) / 255)} ${f(alpha)}`
}
