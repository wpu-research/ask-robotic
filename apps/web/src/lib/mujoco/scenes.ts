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
  pack?: 'panda' | 'go1' | 'shadow' | 'iiwa' | 'lite6' | 'so101' | 'crazyflie' | 'x2' | 'op3' | 'spot' | 'anymal'
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


const MODEL_SCENES_2: MjScene[] = [
  {
    id: 'kuka-iiwa',
    icon: '🦾',
    kind: 'gercek',
    pack: 'iiwa',
    credit: { name: 'KUKA iiwa 14', license: 'BSD-3-Clause', url: 'https://github.com/google-deepmind/mujoco_menagerie/tree/main/kuka_iiwa_14' },
    tr: { title: 'KUKA iiwa 14 (7 eksenli)', desc: 'Fabrikalarda ve laboratuvarlarda kullanılan 7 eksenli endüstriyel kol. Eklem motorlarını sür, ucu istediğin yere götür.', hint: 'actuator1–7 eklem açılarıdır (radyan). "uc" sensörü kolun ucunun konumudur (metre).' },
    en: { title: 'KUKA iiwa 14 (7-axis)', desc: 'A 7-axis industrial arm used in factories and labs. Drive the joint motors and bring the tip where you want it.', hint: 'actuator1–7 are the joint angles (radians). The "uc" sensor is the position of the arm tip (metres).' },
    cam: [1.6, -1.6, 1.1], look: [0, 0, 0.6],
    xml: `<mujoco model="iiwa-sahne">
  <include file="iiwa14.xml"/>
  <compiler usethread="false"/>
  <worldbody>
    <light pos="0 0 2.5" dir="0 0 -1" directional="true"/>
    ${FLOOR_Z(0)}
  </worldbody>
  <sensor>
    <jointpos name="eklem1" joint="joint1"/>
    <jointpos name="eklem2" joint="joint2"/>
    <jointpos name="eklem4" joint="joint4"/>
    <framepos name="uc" objtype="site" objname="attachment_site"/>
  </sensor>
</mujoco>`,
    goals: [
      goal('yuksel', 'Yüksel: kolun ucunu 90 cm üstüne çıkar ve 1 sn tut', 'Reach up: raise the arm tip above 90 cm and hold 1 s', 'uc.z', 'ge', 0.9, 1),
      goal('uzan', 'Uzan: kolun ucunu ileri 90 cm ötesine götür ve 1 sn tut', 'Reach out: move the arm tip more than 90 cm forward and hold 1 s', 'uc.x', 'ge', 0.9, 1),
    ],
    python: {
      tr: `# Önce yukarı uzan, sonra ileri uzan: eklem açıları radyandır.
from muroko import *

motor("actuator2", 0.2)
motor("actuator4", -0.6)
await bekle(3)

motor("actuator2", 1.5)
motor("actuator4", 0)
await bekle(3)
`,
      en: `# Reach up first, then reach forward: joint angles are in radians.
from muroko import *

motor("actuator2", 0.2)
motor("actuator4", -0.6)
await wait(3)

motor("actuator2", 1.5)
motor("actuator4", 0)
await wait(3)
`,
    },
    blocks: example(seq(set('actuator2', 0.2), set('actuator4', -0.6), wait(3), set('actuator2', 1.5), set('actuator4', 0))),
  },
  {
    id: 'ufactory-lite6',
    icon: '🦾',
    kind: 'gercek',
    pack: 'lite6',
    credit: { name: 'UFactory Lite 6', license: 'BSD-3-Clause', url: 'https://github.com/google-deepmind/mujoco_menagerie/tree/main/ufactory_lite6' },
    tr: { title: 'UFactory Lite 6 (masaüstü kol)', desc: 'Okullarda ve atölyelerde kullanılan 6 eksenli küçük masaüstü robot kol.', hint: 'actuator1–6 eklem açılarıdır (radyan). "uc" sensörü kolun ucunun konumudur (metre).' },
    en: { title: 'UFactory Lite 6 (desktop arm)', desc: 'A small 6-axis desktop robot arm used in schools and workshops.', hint: 'actuator1–6 are the joint angles (radians). The "uc" sensor is the position of the arm tip (metres).' },
    cam: [0.9, -0.9, 0.6], look: [0, 0, 0.3],
    xml: `<mujoco model="lite6-sahne">
  <include file="lite6.xml"/>
  <compiler usethread="false"/>
  <worldbody>
    <light pos="0 0 2" dir="0 0 -1" directional="true"/>
    ${FLOOR_Z(0)}
  </worldbody>
  <sensor>
    <jointpos name="eklem1" joint="joint1"/>
    <jointpos name="eklem2" joint="joint2"/>
    <jointpos name="eklem3" joint="joint3"/>
    <framepos name="uc" objtype="site" objname="attachment_site"/>
  </sensor>
</mujoco>`,
    goals: [
      goal('kalk', 'Kaldır: kolun ucunu 60 cm üstüne çıkar ve 1 sn tut', 'Lift: raise the arm tip above 60 cm and hold 1 s', 'uc.z', 'ge', 0.6, 1),
      goal('don', 'Dön: kolun ucunu yana 15 cm götür ve 1 sn tut', 'Turn: swing the arm tip 15 cm to the side and hold 1 s', 'uc.y', 'ge', 0.15, 1),
    ],
    python: {
      tr: `# Kolu kaldır, sonra dirseği eski haline getirip tabanından döndür.
from muroko import *

motor("actuator3", 2.5)
await bekle(3)

motor("actuator3", 1.57)
motor("actuator1", 1.0)
await bekle(3)
`,
      en: `# Lift the arm, then bring the elbow back and turn it on its base.
from muroko import *

motor("actuator3", 2.5)
await wait(3)

motor("actuator3", 1.57)
motor("actuator1", 1.0)
await wait(3)
`,
    },
    blocks: example(seq(set('actuator3', 2.5), wait(3), set('actuator3', 1.57), set('actuator1', 1))),
  },
  {
    id: 'so101',
    icon: '🤖',
    kind: 'gercek',
    pack: 'so101',
    credit: { name: 'SO-101 (RobotStudio / TheRobotStudio)', license: 'Apache-2.0', url: 'https://github.com/google-deepmind/mujoco_menagerie/tree/main/robotstudio_so101' },
    tr: { title: 'SO-101 (açık kaynak kol)', desc: 'Açık kaynaklı, ucuz 3B yazıcıyla yapılabilen 6 motorlu kol. Gerçek donanımı kendin kurabilirsin.', hint: 'shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll ve gripper motorları. "uc" sensörü tutucunun konumudur (metre).' },
    en: { title: 'SO-101 (open-source arm)', desc: 'An open-source, low-cost 6-motor arm you can 3D-print. You can build the real hardware yourself.', hint: 'Motors: shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll and gripper. The "uc" sensor is the gripper position (metres).' },
    cam: [0.7, -0.7, 0.4], look: [0, 0, 0.15],
    xml: `<mujoco model="so101-sahne">
  <include file="so101.xml"/>
  <compiler usethread="false"/>
  <worldbody>
    <light pos="0 0 2" dir="0 0 -1" directional="true"/>
    ${FLOOR_Z(0)}
  </worldbody>
  <sensor>
    <jointpos name="taban" joint="shoulder_pan"/>
    <jointpos name="omuz" joint="shoulder_lift"/>
    <jointpos name="dirsek" joint="elbow_flex"/>
    <framepos name="uc" objtype="site" objname="gripperframe"/>
  </sensor>
</mujoco>`,
    goals: [
      goal('kalk', 'Kaldır: tutucuyu 40 cm üstüne çıkar ve 1 sn tut', 'Lift: raise the gripper above 40 cm and hold 1 s', 'uc.z', 'ge', 0.4, 1),
      goal('don', 'Dön: tutucuyu yana 25 cm götür ve 1 sn tut', 'Turn: swing the gripper 25 cm to the side and hold 1 s', 'uc.y', 'le', -0.25, 1),
      goal('indir', 'İndir: tutucuyu masaya 5 cm kadar yaklaştır ve 1 sn tut', 'Lower: bring the gripper within 5 cm of the table and hold 1 s', 'uc.z', 'le', 0.05, 1),
    ],
    python: {
      tr: `# Kolu kaldır, yana döndür, sonra masaya indir.
from muroko import *

motor("shoulder_lift", -1)
await bekle(2.5)

motor("shoulder_pan", 1)
await bekle(2.5)

motor("shoulder_lift", 1)
await bekle(3)
`,
      en: `# Lift the arm, swing it sideways, then lower it to the table.
from muroko import *

motor("shoulder_lift", -1)
await wait(2.5)

motor("shoulder_pan", 1)
await wait(2.5)

motor("shoulder_lift", 1)
await wait(3)
`,
    },
    blocks: example(seq(set('shoulder_lift', -1), wait(2.5), set('shoulder_pan', 1), wait(2.5), set('shoulder_lift', 1))),
  },
  {
    id: 'crazyflie',
    icon: '🚁',
    kind: 'gercek',
    pack: 'crazyflie',
    credit: { name: 'Bitcraze Crazyflie 2', license: 'MIT', url: 'https://github.com/google-deepmind/mujoco_menagerie/tree/main/bitcraze_crazyflie_2' },
    tr: { title: 'Crazyflie 2 (mini drone)', desc: '27 gramlık mini drone. Tek bir itki motoruyla (body_thrust) havalanır; yüksekliği sen tutarsın.', hint: 'body_thrust yukarı itkidir (N). 0,265 N havada asılı tutar; daha fazlası yükseltir. "konum.z" yüksekliktir.' },
    en: { title: 'Crazyflie 2 (mini drone)', desc: 'A 27-gram mini drone. It lifts off with one thrust motor (body_thrust); you hold the altitude.', hint: 'body_thrust is upward thrust (N). 0.265 N holds it in the air; more lifts it. "konum.z" is the height.' },
    cam: [1.2, -1.2, 0.8], look: [0, 0, 0.4],
    xml: `<mujoco model="crazyflie-sahne">
  <include file="cf2.xml"/>
  <compiler usethread="false"/>
  <worldbody>
    <light pos="0 0 3" dir="0 0 -1" directional="true"/>
    ${FLOOR_Z(0)}
  </worldbody>
  <sensor>
    <framepos name="konum" objtype="body" objname="cf2"/>
    <framelinvel name="hiz" objtype="body" objname="cf2"/>
  </sensor>
</mujoco>`,
    goals: [
      goal('havalan', 'Havalan: dronu 50 cm üstüne çıkar ve 2 sn tut', 'Take off: raise the drone above 50 cm and hold 2 s', 'konum.z', 'ge', 0.5, 2),
      goal('in', 'İn: dronu yere indir (5 cm altı) ve 1 sn tut', 'Land: bring the drone down (below 5 cm) and hold 1 s', 'konum.z', 'le', 0.05, 1),
    ],
    python: {
      tr: `# Yüksekliği sensörle ölç, itkiyi ona göre ayarla (P kontrol): drone 60 cm'de asılı kalır.
from muroko import *

hedef = 0.6
for i in range(200):          # 10 sn havada kal
    z = sensor("konum.z")
    hiz = sensor("hiz.z")
    itki = 0.265 + 1.0 * (hedef - z) - 0.7 * hiz
    motor("body_thrust", min(0.35, max(0.2, itki)))
    await bekle(0.05)

motor("body_thrust", 0.0)     # motoru kapat: drone iner
await bekle(3)
`,
      en: `# Measure the height with the sensor and adjust thrust (P control): the drone hovers at 60 cm.
from muroko import *

target = 0.6
for i in range(200):          # stay airborne for 10 s
    z = sensor("konum.z")
    speed = sensor("hiz.z")
    thrust = 0.265 + 1.0 * (target - z) - 0.7 * speed
    motor("body_thrust", min(0.35, max(0.2, thrust)))
    await wait(0.05)

motor("body_thrust", 0.0)     # motor off: the drone lands
await wait(3)
`,
    },
    blocks: example(seq(set('body_thrust', 0.3), wait(3), set('body_thrust', 0), wait(4))),
  },
  {
    id: 'skydio-x2',
    icon: '🚁',
    kind: 'gercek',
    pack: 'x2',
    credit: { name: 'Skydio X2', license: 'Apache-2.0', url: 'https://github.com/google-deepmind/mujoco_menagerie/tree/main/skydio_x2' },
    tr: { title: 'Skydio X2 (quadrotor)', desc: 'Dört pervaneli gerçek bir drone. Dört itki motorunu (thrust1–4) birlikte ayarlayıp havalan ve yüksekliği tut.', hint: 'Her motor 0–13 N itki verir. Hepsi eşitse düz yükselir; fark verirsen yatar. "konum.z" yüksekliktir.' },
    en: { title: 'Skydio X2 (quadrotor)', desc: 'A real four-propeller drone. Set the four thrust motors (thrust1–4) together to lift off and hold altitude.', hint: 'Each motor gives 0–13 N. If all are equal it rises straight; a difference tilts it. "konum.z" is the height.' },
    cam: [2.5, -2.5, 1.6], look: [0, 0, 0.8],
    xml: `<mujoco model="x2-sahne">
  <include file="x2.xml"/>
  <compiler usethread="false"/>
  <worldbody>
    <light pos="0 0 4" dir="0 0 -1" directional="true"/>
    ${FLOOR_Z(0)}
  </worldbody>
  <sensor>
    <framepos name="konum" objtype="body" objname="x2"/>
    <framelinvel name="hiz" objtype="body" objname="x2"/>
  </sensor>
  <keyframe>
    <key name="muroko" qpos="0 0 0.1 1 0 0 0" ctrl="0 0 0 0"/>
  </keyframe>
</mujoco>`,
    goals: [
      goal('havalan', 'Havalan: dronu 1 m üstüne çıkar ve 2 sn tut', 'Take off: raise the drone above 1 m and hold 2 s', 'konum.z', 'ge', 1, 2),
      goal('in', 'İn: dronu yere indir (10 cm altı) ve 1 sn tut', 'Land: bring the drone down (below 10 cm) and hold 1 s', 'konum.z', 'le', 0.1, 1),
    ],
    python: {
      tr: `# Dört motora aynı itkiyi ver; yüksekliği sensörle ölç ve itkiyi ayarla: drone 1,2 m'de asılı kalır.
from muroko import *

hedef = 1.2
for i in range(200):          # 10 sn havada kal
    z = sensor("konum.z")
    hiz = sensor("hiz.z")
    itki = 3.25 + 2.0 * (hedef - z) - 1.2 * hiz
    itki = min(13, max(0, itki))
    for m in ["thrust1", "thrust2", "thrust3", "thrust4"]:
        motor(m, itki)
    await bekle(0.05)

for m in ["thrust1", "thrust2", "thrust3", "thrust4"]:
    motor(m, 0)               # motorları kapat: drone iner
await bekle(3)
`,
      en: `# Give all four motors the same thrust; measure the height and adjust it: the drone hovers at 1.2 m.
from muroko import *

target = 1.2
for i in range(200):          # stay airborne for 10 s
    z = sensor("konum.z")
    speed = sensor("hiz.z")
    thrust = 3.25 + 2.0 * (target - z) - 1.2 * speed
    thrust = min(13, max(0, thrust))
    for m in ["thrust1", "thrust2", "thrust3", "thrust4"]:
        motor(m, thrust)
    await wait(0.05)

for m in ["thrust1", "thrust2", "thrust3", "thrust4"]:
    motor(m, 0)               # motors off: the drone lands
await wait(3)
`,
    },
    blocks: example(seq(set('thrust1', 3.5), set('thrust2', 3.5), set('thrust3', 3.5), set('thrust4', 3.5), wait(3), set('thrust1', 0), set('thrust2', 0), set('thrust3', 0), set('thrust4', 0), wait(5))),
  },
]

const MODEL_SCENES_3: MjScene[] = [
  {
    id: 'robotis-op3',
    icon: '🤖',
    kind: 'gercek',
    pack: 'op3',
    credit: { name: 'ROBOTIS OP3', license: 'Apache-2.0', url: 'https://github.com/google-deepmind/mujoco_menagerie/tree/main/robotis_op3' },
    tr: { title: 'ROBOTIS OP3 (iki ayaklı robot)', desc: 'Robot yarışmalarında futbol oynayan, 20 eklemli küçük iki ayaklı robot. Dizlerini bükerek çömel, dengeni koru.', hint: 'Eklemler açı motorudur (radyan). Her ayağa (l_ ve r_) aynı açıyı vermezsen devrilir. "govde.z" gövdenin yüksekliğidir (metre).' },
    en: { title: 'ROBOTIS OP3 (biped robot)', desc: 'A small 20-joint biped that plays soccer in robot contests. Bend its knees to crouch and keep your balance.', hint: 'Joints are angle motors (radians). If the l_ and r_ legs do not get the same angle it falls. "govde.z" is the body height (metres).' },
    cam: [0.9, -0.9, 0.45], look: [0, 0, 0.22],
    xml: `<mujoco model="op3-sahne">
  <include file="op3.xml"/>
  <compiler usethread="false"/>
  <worldbody>
    <light pos="0 0 2" dir="0 0 -1" directional="true"/>
    ${FLOOR_Z(0)}
  </worldbody>
  <sensor>
    <framepos name="govde" objtype="body" objname="body_link"/>
    <gyro name="jiro" site="torso"/>
    <jointpos name="kol" joint="l_sho_pitch"/>
  </sensor>
</mujoco>`,
    goals: [
      goal('comel', 'Çömel: gövdeyi 22–28 cm arasına indir ve 2 sn tut', 'Crouch: lower the body to 22–28 cm and hold 2 s', 'govde.z', 'between', 0.22, 2, 0.28),
      goal('kol', 'Kolunu kaldır: sol omuz açısı 1,2 radyanı geçsin ve 1 sn tut', 'Raise your arm: left shoulder angle beyond 1.2 rad, hold 1 s', 'kol', 'abs_ge', 1.2, 1),
    ],
    python: {
      tr: `# Çömel ve kollarını kaldır. Duruşu ani değiştirme, robot devrilir: basamak basamak geç.
# Sol ve sağ bacağın eksenleri ters yönlüdür: sağ bacağa sol bacağın eksi işaretlisini ver.
from muroko import *

def comel(a):
    motor("l_hip_pitch_act", -a)
    motor("r_hip_pitch_act", a)
    motor("l_knee_act", 2 * a)
    motor("r_knee_act", -2 * a)
    motor("l_ank_pitch_act", a)
    motor("r_ank_pitch_act", -a)

for a in [0.2, 0.4, 0.6, 0.8, 1.0]:
    comel(a)
    await bekle(1)

await bekle(2)                      # çömelmiş hâlde 2 sn dur
motor("l_sho_pitch_act", -1.5)      # kollar yukarı
motor("r_sho_pitch_act", 1.5)
await bekle(2)
`,
      en: `# Crouch and raise your arms. Do not change the stance abruptly or the robot falls: go step by step.
# The left and right leg axes point in opposite directions: give the right leg the negative of the left leg.
from muroko import *

def crouch(a):
    motor("l_hip_pitch_act", -a)
    motor("r_hip_pitch_act", a)
    motor("l_knee_act", 2 * a)
    motor("r_knee_act", -2 * a)
    motor("l_ank_pitch_act", a)
    motor("r_ank_pitch_act", -a)

for a in [0.2, 0.4, 0.6, 0.8, 1.0]:
    crouch(a)
    await wait(1)

await wait(2)                       # hold the crouch for 2 s
motor("l_sho_pitch_act", -1.5)      # arms up
motor("r_sho_pitch_act", 1.5)
await wait(2)
`,
    },
    blocks: example(seq(set('l_hip_pitch_act', -0.4), set('r_hip_pitch_act', 0.4), set('l_knee_act', 0.8), set('r_knee_act', -0.8), set('l_ank_pitch_act', 0.4), set('r_ank_pitch_act', -0.4), wait(1.5), set('l_hip_pitch_act', -0.8), set('r_hip_pitch_act', 0.8), set('l_knee_act', 1.6), set('r_knee_act', -1.6), set('l_ank_pitch_act', 0.8), set('r_ank_pitch_act', -0.8), wait(1.5), set('l_hip_pitch_act', -1.0), set('r_hip_pitch_act', 1.0), set('l_knee_act', 2.0), set('r_knee_act', -2.0), set('l_ank_pitch_act', 1.0), set('r_ank_pitch_act', -1.0), wait(1.5), set('l_sho_pitch_act', -1.5), set('r_sho_pitch_act', 1.5))),
  },
]

const MODEL_SCENES_4: MjScene[] = [
  {
    id: 'boston-spot',
    icon: '🐕',
    kind: 'gercek',
    pack: 'spot',
    credit: { name: 'Boston Dynamics Spot', license: 'BSD-3-Clause', url: 'https://github.com/google-deepmind/mujoco_menagerie/tree/main/boston_dynamics_spot' },
    tr: { title: 'Boston Dynamics Spot', desc: 'Fabrikalarda ve inşaat sahalarında devriye gezen ünlü dört bacaklı robot. Her bacakta kalça ve diz motoru var; çömel ve yüksel.', hint: 'Her bacak: _hx (yana), _hy (kalça), _kn (diz). fl/fr ön, hl/hr arka bacaklardır. "govde.z" gövdenin yüksekliğidir (metre).' },
    en: { title: 'Boston Dynamics Spot', desc: 'The famous four-legged robot that patrols factories and construction sites. Each leg has hip and knee motors; crouch and rise.', hint: 'Each leg: _hx (sideways), _hy (hip), _kn (knee). fl/fr are front, hl/hr hind legs. "govde.z" is the body height (metres).' },
    cam: [1.6, -1.8, 0.8], look: [0, 0, 0.35],
    xml: `<mujoco model="boston-spot-sahne">
  <include file="spot.xml"/>
  <compiler usethread="false"/>
  <worldbody>
    <light pos="0 0 2" dir="0 0 -1" directional="true"/>
    ${FLOOR_Z(0)}
  </worldbody>
  <sensor>
    <framepos name="govde" objtype="body" objname="body"/>
  </sensor>
</mujoco>`,
    goals: [
      goal('comel', 'Çömel: gövdeyi 20–30 cm arasına indir ve 2 sn tut', 'Crouch: lower the body to 20–30 cm and hold 2 s', 'govde.z', 'between', 0.2, 2, 0.3),
      goal('yuksel', 'Yüksel: gövdeyi 55 cm üstüne çıkar ve 2 sn tut', 'Stand tall: raise the body above 55 cm and hold 2 s', 'govde.z', 'ge', 0.55, 2),
    ],
    python: {
      tr: `# Spot'u çömelt, sonra yükselt: dört bacağa aynı açıları ver.
# Duruşu ani değiştirme, robot devrilir: basamak basamak geç.
from muroko import *

bacaklar = ["fl", "fr", "hl", "hr"]

def durus(kalca, diz):
    for b in bacaklar:
        motor(b + "_hy", kalca)
        motor(b + "_kn", diz)

for kalca, diz, sure in [(1.2, -2.1, 1.5), (1.4, -2.4, 3), (1.04, -1.8, 1.5), (0.9, -1.5, 1.5), (0.8, -1.3, 1.5), (0.7, -1.1, 3)]:
    durus(kalca, diz)
    await bekle(sure)
`,
      en: `# Crouch Spot, then raise it: give all four legs the same angles.
# Do not change the stance abruptly or the robot falls: go step by step.
from muroko import *

legs = ["fl", "fr", "hl", "hr"]

def stance(hip, knee):
    for leg in legs:
        motor(leg + "_hy", hip)
        motor(leg + "_kn", knee)

for hip, knee, secs in [(1.2, -2.1, 1.5), (1.4, -2.4, 3), (1.04, -1.8, 1.5), (0.9, -1.5, 1.5), (0.8, -1.3, 1.5), (0.7, -1.1, 3)]:
    stance(hip, knee)
    await wait(secs)
`,
    },
    blocks: example(seq(set('fl_hy', 1.2), set('fl_kn', -2.1), set('fr_hy', 1.2), set('fr_kn', -2.1), set('hl_hy', 1.2), set('hl_kn', -2.1), set('hr_hy', 1.2), set('hr_kn', -2.1), wait(1.5), set('fl_hy', 1.4), set('fl_kn', -2.4), set('fr_hy', 1.4), set('fr_kn', -2.4), set('hl_hy', 1.4), set('hl_kn', -2.4), set('hr_hy', 1.4), set('hr_kn', -2.4), wait(3), set('fl_hy', 1.04), set('fl_kn', -1.8), set('fr_hy', 1.04), set('fr_kn', -1.8), set('hl_hy', 1.04), set('hl_kn', -1.8), set('hr_hy', 1.04), set('hr_kn', -1.8), wait(1.5), set('fl_hy', 0.9), set('fl_kn', -1.5), set('fr_hy', 0.9), set('fr_kn', -1.5), set('hl_hy', 0.9), set('hl_kn', -1.5), set('hr_hy', 0.9), set('hr_kn', -1.5), wait(1.5), set('fl_hy', 0.8), set('fl_kn', -1.3), set('fr_hy', 0.8), set('fr_kn', -1.3), set('hl_hy', 0.8), set('hl_kn', -1.3), set('hr_hy', 0.8), set('hr_kn', -1.3), wait(1.5), set('fl_hy', 0.7), set('fl_kn', -1.1), set('fr_hy', 0.7), set('fr_kn', -1.1), set('hl_hy', 0.7), set('hl_kn', -1.1), set('hr_hy', 0.7), set('hr_kn', -1.1), wait(3))),
  },
  {
    id: 'anymal-c',
    icon: '🐕',
    kind: 'gercek',
    pack: 'anymal',
    credit: { name: 'ANYbotics ANYmal C', license: 'BSD-3-Clause', url: 'https://github.com/google-deepmind/mujoco_menagerie/tree/main/anybotics_anymal_c' },
    tr: { title: 'ANYmal C', desc: 'ANYbotics firmasının petrol platformlarında ve madenlerde çalışan, yük taşıyan büyük dört bacaklı robotu. Bacaklarını bükerek çömel.', hint: 'Her bacak: _HAA (yana), _HFE (kalça), _KFE (diz). LF/RF ön, LH/RH arka bacaklardır. Önde ve arkada bükme yönü terstir. "govde.z" gövdenin yüksekliğidir (metre).' },
    en: { title: 'ANYmal C', desc: 'The large load-carrying four-legged robot that ANYbotics deploys on oil rigs and in mines. Bend its legs to crouch.', hint: 'Each leg: _HAA (sideways), _HFE (hip), _KFE (knee). LF/RF are front, LH/RH hind legs. Front and hind legs bend in opposite directions. "govde.z" is the body height (metres).' },
    cam: [1.6, -1.8, 0.8], look: [0, 0, 0.35],
    xml: `<mujoco model="anymal-c-sahne">
  <include file="anymal_c.xml"/>
  <compiler usethread="false"/>
  <worldbody>
    <light pos="0 0 2" dir="0 0 -1" directional="true"/>
    ${FLOOR_Z(0)}
  </worldbody>
  <sensor>
    <framepos name="govde" objtype="body" objname="base"/>
  </sensor>
</mujoco>`,
    goals: [
      goal('comel', 'Çömel: gövdeyi 30 cm altına indir ve 2 sn tut', 'Crouch: lower the body below 30 cm and hold 2 s', 'govde.z', 'le', 0.3, 2),
      goal('derin', 'Derin çömel: gövdeyi 23 cm altına indir ve 2 sn tut', 'Deep crouch: lower the body below 23 cm and hold 2 s', 'govde.z', 'le', 0.23, 2),
    ],
    python: {
      tr: `# ANYmal'i çömelt: ön bacaklar bir yöne, arka bacaklar ters yöne bükülür.
# Duruşu ani değiştirme, robot devrilir: basamak basamak geç.
from muroko import *

def comel(a):
    for b in ["LF", "RF"]:
        motor(b + "_HFE", a)
        motor(b + "_KFE", -2 * a)
    for b in ["LH", "RH"]:
        motor(b + "_HFE", -a)
        motor(b + "_KFE", 2 * a)

for a, sure in [(0.5, 1.5), (0.7, 1.5), (0.9, 3), (1.1, 3)]:
    comel(a)
    await bekle(sure)
`,
      en: `# Crouch ANYmal: the front legs bend one way, the hind legs the opposite way.
# Do not change the stance abruptly or the robot falls: go step by step.
from muroko import *

def crouch(a):
    for leg in ["LF", "RF"]:
        motor(leg + "_HFE", a)
        motor(leg + "_KFE", -2 * a)
    for leg in ["LH", "RH"]:
        motor(leg + "_HFE", -a)
        motor(leg + "_KFE", 2 * a)

for a, secs in [(0.5, 1.5), (0.7, 1.5), (0.9, 3), (1.1, 3)]:
    crouch(a)
    await wait(secs)
`,
    },
    blocks: example(seq(set('LF_HFE', 0.5), set('LF_KFE', -1.0), set('RF_HFE', 0.5), set('RF_KFE', -1.0), set('LH_HFE', -0.5), set('LH_KFE', 1.0), set('RH_HFE', -0.5), set('RH_KFE', 1.0), wait(1.5), set('LF_HFE', 0.7), set('LF_KFE', -1.4), set('RF_HFE', 0.7), set('RF_KFE', -1.4), set('LH_HFE', -0.7), set('LH_KFE', 1.4), set('RH_HFE', -0.7), set('RH_KFE', 1.4), wait(1.5), set('LF_HFE', 0.9), set('LF_KFE', -1.8), set('RF_HFE', 0.9), set('RF_KFE', -1.8), set('LH_HFE', -0.9), set('LH_KFE', 1.8), set('RH_HFE', -0.9), set('RH_KFE', 1.8), wait(3), set('LF_HFE', 1.1), set('LF_KFE', -2.2), set('RF_HFE', 1.1), set('RF_KFE', -2.2), set('LH_HFE', -1.1), set('LH_KFE', 2.2), set('RH_HFE', -1.1), set('RH_KFE', 2.2), wait(3))),
  },
]

export const MJ_SCENES: MjScene[] = [...MJ_MODEL_SCENES, ...MODEL_SCENES_2, ...MODEL_SCENES_3, ...MODEL_SCENES_4]

export const MJ_REPO = 'https://github.com/google-deepmind/mujoco'
export const MJ_WASM_REPO = 'https://github.com/google-deepmind/mujoco/tree/main/wasm'
