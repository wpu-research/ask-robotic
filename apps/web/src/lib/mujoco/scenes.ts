// MuRoKo hazır sahneleri (MJCF). Sayfa XML'i düzenlenebilir bırakır; `<key>` varsa başlangıç durumu oradan alınır.
// Birimler: metre, kilogram, radyan (`compiler angle="radian"`). Z yukarı.
// Sensörler (<sensor>) bloklara, hedeflere, grafiğe ve Python'a kanal olarak açılır (lib/mujoco/sensors.ts).
import type { Goal } from './goals'

interface Text { title: string; desc: string; hint: string }

/** Blockly serileştirme biçiminde örnek blok programı (mujoco-blocks.tsx yükler). */
export interface BlockExample { blocks: { languageVersion: 0; blocks: unknown[] } }
type Blk = { type: string; fields?: Record<string, unknown>; inputs?: Record<string, { block: Blk }>; next?: { block: Blk } }
const seq = (...bs: Blk[]): Blk => bs.reduceRight<Blk | undefined>((acc, b) => (acc ? { ...b, next: { block: acc } } : b), undefined)!
const set = (U: string, V: number): Blk => ({ type: 'muroko_set', fields: { U, V } })
const wait = (S: number): Blk => ({ type: 'muroko_wait', fields: { S } })
const example = (b: Blk): BlockExample => ({ blocks: { languageVersion: 0, blocks: [{ ...b, x: 16, y: 16 }] } })

export interface MjScene {
  id: string
  /** Robot seçici kartındaki simge. */
  icon: string
  /** Bloklar sekmesinde açılışta yüklenen örnek program (yoksa boş çalışma alanı). */
  blocks?: BlockExample
  /** 'gercek': MuJoCo Menagerie'den gerçek robot modeli (mesh); 'robot': basit robot; 'fizik': yalnız fizik deneyi. */
  kind: 'gercek' | 'robot' | 'fizik'
  /** Gerçek model paketi: public/mujoco/models/<pack>.pack.gz (tools/mujoco/pack.mjs). XML bu paketteki dosyalara `<include>` eder. */
  pack?: 'panda' | 'go1' | 'shadow'
  /** Model kaynağı ve lisansı (ekranda gösterilir). */
  credit?: { name: string; license: string; url: string }
  tr: Text
  en: Text
  /** Kamera ve bakış noktası (MuJoCo koordinatı: x, y, z yukarı). */
  cam: [number, number, number]
  look: [number, number, number]
  xml: string
  goals: Goal[]
  /** Python sekmesinin başlangıç kodu (çalışan bir çözüm değil, bir başlangıç). */
  python: { tr: string; en: string }
}


const goal = (id: string, tr: string, en: string, ch: string, cmp: Goal['cmp'], a: number, hold = 0, b?: number): Goal => ({ id, tr, en, ch, cmp, a, hold, ...(b !== undefined ? { b } : {}) })

const FLOOR_Z = (z: number) => `<geom name="zemin" type="plane" size="6 6 .1" pos="0 0 ${z}" rgba=".86 .89 .93 1"/>`

/** Gerçek robot modelleri: MuJoCo Menagerie (https://github.com/google-deepmind/mujoco_menagerie). Her modelin lisansı kendi klasöründe. */
export const MJ_MODEL_SCENES: MjScene[] = [
  {
    id: 'franka-panda',
    icon: '🦾',
    blocks: example(seq(set('actuator8', 255), set('actuator2', 0.06), set('actuator4', -2.36), set('actuator6', 2.4), wait(2.5), set('actuator2', 0.46), set('actuator6', 2.8), wait(2.5), set('actuator8', 0), wait(1.5), set('actuator2', -0.04), set('actuator6', 2.35))),
    kind: 'gercek',
    pack: 'panda',
    credit: { name: 'Franka Emika Panda', license: 'Apache-2.0', url: 'https://github.com/google-deepmind/mujoco_menagerie/tree/main/franka_emika_panda' },
    tr: { title: 'Franka Panda kolu', desc: 'Araştırma laboratuvarlarında kullanılan gerçek 7 eksenli robot kol ve parmaklı tutucu. Eklem motorlarını sür, eli masadaki küpe götür.', hint: 'actuator1–7 eklem açılarıdır (radyan), actuator8 tutucudur (0 kapalı, 255 açık). "el" sensörü tutucunun konumudur.' },
    en: { title: 'Franka Panda arm', desc: 'The real 7-axis research robot arm with a two-finger gripper. Drive the joint motors and bring the hand to the cube on the table.', hint: 'actuator1–7 are the joint angles (radians), actuator8 is the gripper (0 closed, 255 open). The "el" sensor is the hand position.' },
    cam: [1.5, -1.5, 1.0], look: [0.2, 0, 0.4],
    xml: `<mujoco model="panda-sahne">
  <include file="panda.xml"/>
  <compiler usethread="false"/>
  <worldbody>
    <light pos="0 0 1.5" dir="0 0 -1" directional="true"/>
    ${FLOOR_Z(0)}
    <body name="kup" pos=".5 0 .03"><freejoint/><geom type="box" size=".03 .03 .03" mass=".05" rgba=".95 .75 .2 1" friction="1.5 .02 .001"/></body>
  </worldbody>
  <sensor>
    <jointpos name="eklem1" joint="joint1"/>
    <jointpos name="eklem2" joint="joint2"/>
    <jointpos name="eklem4" joint="joint4"/>
    <framepos name="el" objtype="body" objname="hand"/>
    <framepos name="kup" objtype="body" objname="kup"/>
  </sensor>
  <keyframe>
    <key name="muroko" qpos="0 0 0 -1.57079 0 1.57079 -0.7853 0.04 0.04 .5 0 .03 1 0 0 0" ctrl="0 0 0 -1.57079 0 1.57079 -0.7853 255"/>
  </keyframe>
</mujoco>`,
    goals: [
      goal('in', 'Eli küpün hizasına indir (el.z ≤ 0,15) ve 1 sn tut', 'Lower the hand to the cube (el.z ≤ 0.15) and hold 1 s', 'el.z', 'le', 0.15, 1),
      goal('kaldir', 'Küpü tut ve havada 1,5 sn taşı (kup.z ≥ 0,1)', 'Grasp the cube and hold it in the air for 1.5 s (kup.z ≥ 0.1)', 'kup.z', 'ge', 0.1, 1.5),
    ],
    python: {
      tr: `# Küpü tut ve kaldır (Franka Panda). Eklem açıları ters kinematikle bulundu.
from muroko import *

def poz(j2, j4, j6):
    motor("actuator2", j2)
    motor("actuator4", j4)
    motor("actuator6", j6)

motor("actuator8", 255)      # tutucuyu aç
poz(0.06, -2.36, 2.4)        # küpün üstüne gel
await bekle(2.5)
poz(0.46, -2.36, 2.8)        # aşağı in
await bekle(2.5)
motor("actuator8", 0)        # tutucuyu kapat
await bekle(1.5)
poz(-0.04, -2.36, 2.35)      # kaldır
`,
      en: `# Grasp and lift the cube (Franka Panda). The joint angles come from inverse kinematics.
from muroko import *

def pose(j2, j4, j6):
    motor("actuator2", j2)
    motor("actuator4", j4)
    motor("actuator6", j6)

motor("actuator8", 255)      # open the gripper
pose(0.06, -2.36, 2.4)       # come above the cube
await wait(2.5)
pose(0.46, -2.36, 2.8)       # go down
await wait(2.5)
motor("actuator8", 0)        # close the gripper
await wait(1.5)
pose(-0.04, -2.36, 2.35)     # lift
`,
    },
  },
  {
    id: 'unitree-go1',
    icon: '🐕',
    blocks: example(seq(set('FR_thigh', 1.3), set('FR_calf', -2.4), set('FL_thigh', 1.3), set('FL_calf', -2.4), set('RR_thigh', 1.3), set('RR_calf', -2.4), set('RL_thigh', 1.3), set('RL_calf', -2.4))),
    kind: 'gercek',
    pack: 'go1',
    credit: { name: 'Unitree Go1', license: 'BSD-3-Clause', url: 'https://github.com/google-deepmind/mujoco_menagerie/tree/main/unitree_go1' },
    tr: { title: 'Unitree Go1 (dört bacaklı)', desc: 'Gerçek bir dört bacaklı robot köpek: her bacakta kalça, uyluk ve baldır motoru. Ayakta durur; bacak açılarını değiştirip çömel.', hint: 'Her bacak: _hip (yana), _thigh (uyluk), _calf (baldır). Kaydırıcılar başlangıçta ayakta duruş açılarındadır. Duruşu ani değiştirirsen robot devrilir.' },
    en: { title: 'Unitree Go1 (quadruped)', desc: 'A real four-legged robot dog: hip, thigh and calf motors on each leg. It stands; change the leg angles to crouch.', hint: 'Each leg: _hip (sideways), _thigh, _calf. The sliders start at the standing angles. Change the stance abruptly and it falls over.' },
    cam: [1.0, -1.15, 0.5], look: [0, 0, 0.2],
    xml: `<mujoco model="go1-sahne">
  <include file="go1.xml"/>
  <compiler usethread="false"/>
  <worldbody>
    <light pos="0 0 1.5" dir="0 0 -1" directional="true"/>
    ${FLOOR_Z(0)}
  </worldbody>
  <sensor>
    <framepos name="govde" objtype="body" objname="trunk"/>
    <gyro name="jiro" site="imu"/>
  </sensor>
</mujoco>`,
    goals: [
      goal('comel', 'Çömel: gövdeyi 12–20 cm arasına indir ve 2 sn tut', 'Crouch: lower the body to 12–20 cm and hold 2 s', 'govde.z', 'between', 0.12, 2, 0.2),
      goal('yuksel', 'Yüksel: gövdeyi 33 cm üstüne çıkar ve 2 sn tut', 'Stand tall: raise the body above 33 cm and hold 2 s', 'govde.z', 'ge', 0.33, 2),
    ],
    python: {
      tr: `# Çömel, ayakta dur, yüksel: dört bacağa aynı açıları ver.
# Duruşu ani değiştirme, robot devrilir: basamak basamak geç.
from muroko import *

bacaklar = ["FR", "FL", "RR", "RL"]

def durus(uyluk, baldir):
    for b in bacaklar:
        motor(b + "_thigh", uyluk)
        motor(b + "_calf", baldir)

for uyluk, baldir, sure in [(1.3, -2.4, 4), (1.1, -2.1, 2), (0.9, -1.8, 2), (0.75, -1.5, 2), (0.6, -1.2, 4)]:
    durus(uyluk, baldir)
    await bekle(sure)
`,
      en: `# Crouch, stand, rise: give all four legs the same angles.
# Do not change the stance abruptly or the robot falls: go step by step.
from muroko import *

legs = ["FR", "FL", "RR", "RL"]

def stance(thigh, calf):
    for leg in legs:
        motor(leg + "_thigh", thigh)
        motor(leg + "_calf", calf)

for thigh, calf, secs in [(1.3, -2.4, 4), (1.1, -2.1, 2), (0.9, -1.8, 2), (0.75, -1.5, 2), (0.6, -1.2, 4)]:
    stance(thigh, calf)
    await wait(secs)
`,
    },
  },
  {
    id: 'shadow-el',
    icon: '✋',
    blocks: example(seq(set('rh_A_FFJ3', 1.5), set('rh_A_FFJ0', 3), set('rh_A_MFJ3', 1.5), set('rh_A_MFJ0', 3), set('rh_A_RFJ3', 1.5), set('rh_A_RFJ0', 3), set('rh_A_LFJ3', 1.5), set('rh_A_LFJ0', 3))),
    kind: 'gercek',
    pack: 'shadow',
    credit: { name: 'Shadow Dexterous Hand', license: 'Apache-2.0', url: 'https://github.com/google-deepmind/mujoco_menagerie/tree/main/shadow_hand' },
    tr: { title: 'Shadow robot eli', desc: '24 eklemli gerçek robot el: dört parmak, başparmak ve bilek. Parmakları bük, yumruk yap.', hint: 'rh_A_FFJ3 işaret, MFJ3 orta, RFJ3 yüzük, LFJ3 serçe parmağın alt eklemidir (0 düz, 1,57 bükülü).' },
    en: { title: 'Shadow robot hand', desc: 'A real 24-joint robot hand: four fingers, a thumb and a wrist. Curl the fingers and make a fist.', hint: 'rh_A_FFJ3 is the index, MFJ3 middle, RFJ3 ring and LFJ3 little finger base joint (0 straight, 1.57 curled).' },
    cam: [0.55, -0.5, 0.3], look: [0.17, 0, 0.05],
    xml: `<mujoco model="shadow-sahne">
  <include file="right_hand.xml"/>
  <compiler usethread="false"/>
  <statistic extent=".3"/>
  <worldbody>
    <light pos="0 0 1"/>
    <light pos="0.3 0 1.5" dir="0 0 -1" directional="true"/>
    ${FLOOR_Z(-0.1)}
    <body name="nesne" pos="0.3 0 0.1">
      <freejoint/>
      <geom type="ellipsoid" size="0.03 0.04 0.02" rgba="0.5 0.7 0.5 1" condim="6" priority="1" friction="0.5 0.01 0.003"/>
    </body>
  </worldbody>
  <sensor>
    <jointpos name="isaret" joint="rh_FFJ3"/>
    <jointpos name="orta" joint="rh_MFJ3"/>
    <jointpos name="yuzuk" joint="rh_RFJ3"/>
    <jointpos name="serce" joint="rh_LFJ3"/>
    <framepos name="nesne" objtype="body" objname="nesne"/>
  </sensor>
</mujoco>`,
    goals: [
      goal('isaret', 'İşaret parmağını bük (isaret ≥ 1,2) ve 1 sn tut', 'Curl the index finger (isaret ≥ 1.2) and hold 1 s', 'isaret', 'ge', 1.2, 1),
      goal('orta', 'Orta parmağı bük (orta ≥ 1,2)', 'Curl the middle finger (orta ≥ 1.2)', 'orta', 'ge', 1.2),
      goal('serce', 'Serçe parmağı bük (serce ≥ 1,2): yumruk tamam', 'Curl the little finger (serce ≥ 1.2): fist complete', 'serce', 'ge', 1.2),
    ],
    python: {
      tr: `# Yumruk yap, sonra eli aç. J3 parmağın alt eklemi, J0 uç eklemleri birlikte büker.
from muroko import *

parmaklar = ["FF", "MF", "RF", "LF"]

for p in parmaklar:
    motor("rh_A_" + p + "J3", 1.5)
    motor("rh_A_" + p + "J0", 3.0)
await bekle(3)

for p in parmaklar:
    motor("rh_A_" + p + "J3", 0)
    motor("rh_A_" + p + "J0", 0)
`,
      en: `# Make a fist, then open the hand. J3 is the finger base joint, J0 curls the tip joints together.
from muroko import *

fingers = ["FF", "MF", "RF", "LF"]

for f in fingers:
    motor("rh_A_" + f + "J3", 1.5)
    motor("rh_A_" + f + "J0", 3.0)
await wait(3)

for f in fingers:
    motor("rh_A_" + f + "J3", 0)
    motor("rh_A_" + f + "J0", 0)
`,
    },
  },
]

export const MJ_SCENES: MjScene[] = MJ_MODEL_SCENES

export const MJ_REPO = 'https://github.com/google-deepmind/mujoco'
export const MJ_WASM_REPO = 'https://github.com/google-deepmind/mujoco/tree/main/wasm'
