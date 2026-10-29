// MuRoKo hazır sahneleri (MJCF). Sayfa XML'i düzenlenebilir bırakır; `<key>` varsa başlangıç durumu oradan alınır.
// Birimler: metre, kilogram, radyan (`compiler angle="radian"`). Z yukarı.
// Sensörler (<sensor>) bloklara, hedeflere, grafiğe ve Python'a kanal olarak açılır (lib/mujoco/sensors.ts).
import type { Goal } from './goals'

interface Text { title: string; desc: string; hint: string }

export interface MjScene {
  id: string
  /** 'robot': gerçek bir robot gövdesi; 'fizik': yalnız fizik deneyi. */
  kind: 'robot' | 'fizik'
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

const HEAD = `<compiler angle="radian"/>
  <option timestep="0.002" gravity="0 0 -9.81"/>`
const FLOOR = `<geom name="zemin" type="plane" size="6 6 .1" rgba=".86 .89 .93 1"/>`
const LIGHT = `<light pos="1 -2 4" dir="-.2 .4 -1"/>`

const goal = (id: string, tr: string, en: string, ch: string, cmp: Goal['cmp'], a: number, hold = 0, b?: number): Goal => ({ id, tr, en, ch, cmp, a, hold, ...(b !== undefined ? { b } : {}) })

export const MJ_SCENES: MjScene[] = [
  {
    id: 'kol',
    kind: 'robot',
    tr: { title: 'İki eksenli robot kol', desc: 'Omuz ve dirsek eklemleri konum motoruyla sürülüyor. Kaydırıcılar hedef açıdır (radyan).', hint: 'Uçtaki kürenin yüksekliğini sensörden (uc.z) izle: ters kinematiği elle çözüyorsun.' },
    en: { title: 'Two-joint robot arm', desc: 'Shoulder and elbow are driven by position actuators. The sliders are target angles (radians).', hint: 'Watch the height of the end sphere on the sensor (uc.z): you are solving inverse kinematics by hand.' },
    cam: [0, -2.6, 1.1], look: [0, 0, .7],
    xml: `<mujoco model="kol">
  ${HEAD}
  <default>
    <joint damping="3" limited="true" range="-2.9 2.9"/>
    <position kp="60" ctrllimited="true" ctrlrange="-2.9 2.9"/>
  </default>
  <worldbody>
    ${LIGHT}
    ${FLOOR}
    <geom type="cylinder" pos="0 0 .2" size=".14 .2" rgba=".35 .38 .45 1"/>
    <body name="baglanti1" pos="0 0 .4" gravcomp="1">
      <joint name="omuz" type="hinge" axis="0 1 0"/>
      <geom type="capsule" fromto="0 0 0 0 0 .55" size=".045" rgba=".2 .5 .9 1"/>
      <body name="baglanti2" pos="0 0 .55" gravcomp="1">
        <joint name="dirsek" type="hinge" axis="0 1 0"/>
        <geom type="capsule" fromto="0 0 0 0 0 .45" size=".038" rgba=".95 .5 .2 1"/>
        <geom name="uc" type="sphere" pos="0 0 .47" size=".055" rgba=".95 .3 .25 1" mass=".1"/>
        <site name="ucnokta" pos="0 0 .47" size=".01"/>
      </body>
    </body>
  </worldbody>
  <actuator>
    <position name="omuz_motoru" joint="omuz"/>
    <position name="dirsek_motoru" joint="dirsek"/>
  </actuator>
  <sensor>
    <jointpos name="omuz_aci" joint="omuz"/>
    <jointpos name="dirsek_aci" joint="dirsek"/>
    <framepos name="uc" objtype="site" objname="ucnokta"/>
  </sensor>
</mujoco>`,
    goals: [
      goal('indir', 'Ucu 0,6 m yüksekliğin altına indir', 'Lower the tip below 0.6 m', 'uc.z', 'le', 0.6),
      goal('tut', 'Ucu 1 sn boyunca 0,8 m (±5 cm) yükseklikte tut', 'Hold the tip at 0.8 m (±5 cm) for 1 s', 'uc.z', 'between', 0.75, 1, 0.85),
      goal('uzan', 'Ucu öne doğru 0,7 m uzat', 'Reach the tip 0.7 m forward', 'uc.x', 'ge', 0.7),
    ],
    python: {
      tr: `# Oransal (P) denetleyici: hedef yüksekliğe doğru omuzu çevir.
# Python'da bekle'nin önüne await yazılır.
from muroko import *

hedef = 1.0
while True:
    hata = hedef - sensor("uc.z")
    motor("omuz_motoru", 1.2 * hata)
    motor("dirsek_motoru", 0.6 * hata)
    await bekle(0.02)
`,
      en: `# Proportional (P) controller: turn the shoulder toward a target height.
# In Python, write await before wait.
from muroko import *

target = 1.0
while True:
    error = target - sensor("uc.z")
    motor("omuz_motoru", 1.2 * error)
    motor("dirsek_motoru", 0.6 * error)
    await wait(0.02)
`,
    },
  },
  {
    id: 'arabali-sarkac',
    kind: 'robot',
    tr: { title: 'Arabalı ters sarkaç', desc: 'Klasik kontrol problemi: arabayı iterek dik sarkacı ayakta tutmaya çalış.', hint: 'Sarkaç hangi yana devriliyorsa o yana it. Dengeyi bloklarla ya da Python PD denetleyicisiyle kurmayı dene.' },
    en: { title: 'Cart-pole', desc: 'The classic control problem: push the cart to keep the upright pole from falling.', hint: 'Push toward the side the pole leans. Try balancing with blocks or a Python PD controller.' },
    cam: [0, -3.2, 1], look: [0, 0, .5],
    xml: `<mujoco model="arabali-sarkac">
  ${HEAD}
  <worldbody>
    ${LIGHT}
    ${FLOOR}
    <geom type="box" pos="0 0 .05" size="1.7 .05 .02" rgba=".5 .53 .6 1"/>
    <body name="araba" pos="0 0 .25">
      <joint name="ray" type="slide" axis="1 0 0" limited="true" range="-1.5 1.5" damping=".3"/>
      <geom type="box" size=".2 .1 .08" mass="1" rgba=".2 .5 .9 1"/>
      <body name="cubuk">
        <joint name="mafsal" type="hinge" axis="0 1 0" damping=".005"/>
        <geom type="capsule" fromto="0 0 0 0 0 .6" size=".025" mass=".1" rgba=".95 .45 .2 1"/>
        <geom type="sphere" pos="0 0 .62" size=".05" mass=".05" rgba=".95 .3 .25 1"/>
      </body>
    </body>
  </worldbody>
  <actuator>
    <motor name="itme" joint="ray" gear="10" ctrllimited="true" ctrlrange="-1 1"/>
  </actuator>
  <sensor>
    <jointpos name="aci" joint="mafsal"/>
    <jointvel name="aci_hizi" joint="mafsal"/>
    <jointpos name="konum" joint="ray"/>
    <jointvel name="konum_hizi" joint="ray"/>
  </sensor>
  <keyframe>
    <key name="baslangic" qpos="0 .15"/>
  </keyframe>
</mujoco>`,
    goals: [
      goal('dengele', 'Sarkacı 5 sn dik tut (açı ±0,3 rad)', 'Keep the pole upright for 5 s (angle ±0.3 rad)', 'aci', 'abs_le', 0.3, 5),
      goal('uzun', 'Sarkacı 15 sn dik tut', 'Keep the pole upright for 15 s', 'aci', 'abs_le', 0.3, 15),
    ],
    python: {
      tr: `# PD denetleyici: sarkaç hangi yana eğiliyorsa arabayı o yana it.
# Açı, açısal hız ve araba hızı sensörden gelir. Kazançları (k1, k2, k3) değiştirerek dene.
from muroko import *

k1, k2, k3 = 3.0, 0.6, 0.5
while True:
    u = k1 * sensor("aci") + k2 * sensor("aci_hizi") + k3 * sensor("konum_hizi")
    motor("itme", u)
    await bekle(0.01)
`,
      en: `# PD controller: push the cart toward the side the pole leans.
# Pole angle, angular velocity and cart velocity come from the sensors. Tune the gains (k1, k2, k3).
from muroko import *

k1, k2, k3 = 3.0, 0.6, 0.5
while True:
    u = k1 * sensor("aci") + k2 * sensor("aci_hizi") + k3 * sensor("konum_hizi")
    motor("itme", u)
    await wait(0.01)
`,
    },
  },
  {
    id: 'tekerlekli',
    kind: 'robot',
    tr: { title: 'Tekerlekli robot', desc: 'İki tekerlekli, öne bakan mesafe sensörlü ve tamponlu robot. Tekerlek hızlarını farklı ver, dönsün.', hint: 'Mesafe sensörü duvara yaklaşınca küçülür. "Eğer mesafe < 0,3 ise motorları 0 yap" bloğuyla durdur.' },
    en: { title: 'Wheeled robot', desc: 'A two-wheeled robot with a forward distance sensor and a bumper. Give the wheels different speeds to turn.', hint: 'The distance sensor shrinks near the wall. Stop with "if distance < 0.3 then set motors to 0".' },
    cam: [.3, -2.3, 1.1], look: [.3, 0, .1],
    xml: `<mujoco model="tekerlekli">
  ${HEAD}
  <default>
    <geom friction="1.1 .01 .001"/>
  </default>
  <worldbody>
    ${LIGHT}
    ${FLOOR}
    <geom name="duvar" type="box" pos="1.3 0 .15" size=".03 .7 .15" rgba=".95 .5 .2 1"/>
    <body name="sasi" pos="-1 0 .065">
      <freejoint/>
      <geom type="box" size=".12 .08 .03" mass="1.2" rgba=".2 .5 .9 1"/>
      <geom name="tampon" type="box" pos=".13 0 0" size=".012 .08 .02" mass=".02" rgba=".95 .3 .25 1"/>
      <site name="goz" pos=".145 0 .01" size=".008" euler="0 1.5708 0" rgba="1 1 0 1"/>
      <site name="tamponalan" type="box" pos=".135 0 0" size=".02 .09 .03" rgba="0 0 0 0"/>
      <site name="merkez" pos="0 0 0" size=".008"/>
      <geom type="sphere" pos=".1 0 -.05" size=".015" condim="1" priority="1" friction="0" mass=".02"/>
      <geom type="sphere" pos="-.1 0 -.05" size=".015" condim="1" priority="1" friction="0" mass=".02"/>
      <body name="sol" pos="0 .1 -.005">
        <joint name="sol_teker" type="hinge" axis="0 1 0" damping=".002" armature=".02"/>
        <geom type="cylinder" size=".06 .012" euler="1.5708 0 0" mass=".15" rgba=".25 .25 .3 1"/>
      </body>
      <body name="sag" pos="0 -.1 -.005">
        <joint name="sag_teker" type="hinge" axis="0 1 0" damping=".002" armature=".02"/>
        <geom type="cylinder" size=".06 .012" euler="1.5708 0 0" mass=".15" rgba=".25 .25 .3 1"/>
      </body>
    </body>
  </worldbody>
  <actuator>
    <velocity name="sol_motor" joint="sol_teker" kv=".15" ctrllimited="true" ctrlrange="-15 15" forcelimited="true" forcerange="-1.5 1.5"/>
    <velocity name="sag_motor" joint="sag_teker" kv=".15" ctrllimited="true" ctrlrange="-15 15" forcelimited="true" forcerange="-1.5 1.5"/>
  </actuator>
  <sensor>
    <rangefinder name="mesafe" site="goz"/>
    <touch name="dokunma" site="tamponalan"/>
    <framepos name="konum" objtype="site" objname="merkez"/>
    <gyro name="jiro" site="merkez"/>
  </sensor>
</mujoco>`,
    goals: [
      goal('ilerle', 'Robotu 0,5 m ileri götür (konum.x ≥ -0,5)', 'Drive the robot 0.5 m forward (konum.x ≥ -0.5)', 'konum.x', 'ge', -0.5),
      goal('dur', 'Duvara 8–30 cm kala 1,5 sn dur', 'Stop 8–30 cm from the wall and stay 1.5 s', 'mesafe', 'between', 0.08, 1.5, 0.3),
    ],
    python: {
      tr: `# Duvara yaklaşınca dur: mesafe sensörünü oku, yakınsa motorları durdur.
from muroko import *

while True:
    if sensor("mesafe") > 0.3:
        motor("sol_motor", 8)
        motor("sag_motor", 8)
    else:
        motor("sol_motor", 0)
        motor("sag_motor", 0)
    await bekle(0.02)
`,
      en: `# Stop near the wall: read the distance sensor and stop the motors when close.
from muroko import *

while True:
    if sensor("mesafe") > 0.3:
        motor("sol_motor", 8)
        motor("sag_motor", 8)
    else:
        motor("sol_motor", 0)
        motor("sag_motor", 0)
    await wait(0.02)
`,
    },
  },
  {
    id: 'kol-pence',
    kind: 'robot',
    tr: { title: 'Pençeli robot kol', desc: 'Dönen tabanlı, omuz-dirsek eklemli ve iki parmaklı kol. Masadaki küpe uzan, tabanı çevirip küpü it.', hint: 'Taban motoru kolu sağa sola çevirir. Parmakları 0 (kapalı) ile 0,05 (açık) arasında sür.' },
    en: { title: 'Gripper robot arm', desc: 'A rotating base, shoulder and elbow joints and two fingers. Reach the cube on the table and swing the base to push it.', hint: 'The base motor swings the arm. Drive the fingers between 0 (closed) and 0.05 (open).' },
    cam: [1.6, -2.2, 1.2], look: [.2, 0, .5],
    xml: `<mujoco model="kol-pence">
  ${HEAD}
  <default>
    <joint damping="2.5"/>
    <position kp="70"/>
    <geom friction="1.5 .02 .001"/>
  </default>
  <worldbody>
    ${LIGHT}
    ${FLOOR}
    <geom name="masa" type="box" pos=".55 0 .15" size=".25 .35 .15" rgba=".7 .6 .5 1"/>
    <body name="kup" pos=".55 0 .34"><freejoint/><geom type="box" size=".035 .035 .035" mass=".05" rgba=".95 .75 .2 1"/></body>
    <geom type="cylinder" pos="0 0 .1" size=".13 .1" rgba=".35 .38 .45 1"/>
    <body name="taban" pos="0 0 .2" gravcomp="1">
      <joint name="taban_don" type="hinge" axis="0 0 1" range="-3 3" limited="true"/>
      <geom type="cylinder" size=".07 .06" pos="0 0 .06" rgba=".4 .45 .55 1"/>
      <body name="omuzgov" pos="0 0 .12" gravcomp="1">
        <joint name="omuz" type="hinge" axis="0 1 0" range="-1.8 1.8" limited="true"/>
        <geom type="capsule" fromto="0 0 0 0 0 .4" size=".04" rgba=".2 .5 .9 1"/>
        <body name="dirsekgov" pos="0 0 .4" gravcomp="1">
          <joint name="dirsek" type="hinge" axis="0 1 0" range="-2.4 2.4" limited="true"/>
          <geom type="capsule" fromto="0 0 0 0 0 .35" size=".034" rgba=".95 .5 .2 1"/>
          <body name="bilek" pos="0 0 .35" gravcomp="1">
            <geom type="box" pos="0 0 .02" size=".05 .05 .02" rgba=".3 .3 .35 1"/>
            <site name="ucnokta" pos="0 0 .07" size=".01"/>
            <body name="parmaksol" pos="0 .03 .05" gravcomp="1">
              <joint name="parmak_sol" type="slide" axis="0 1 0" range="0 .05" limited="true"/>
              <geom type="box" pos="0 .01 .04" size=".012 .008 .045" rgba=".15 .15 .2 1"/>
            </body>
            <body name="parmaksag" pos="0 -.03 .05" gravcomp="1">
              <joint name="parmak_sag" type="slide" axis="0 -1 0" range="0 .05" limited="true"/>
              <geom type="box" pos="0 -.01 .04" size=".012 .008 .045" rgba=".15 .15 .2 1"/>
            </body>
          </body>
        </body>
      </body>
    </body>
  </worldbody>
  <actuator>
    <position name="taban_motoru" joint="taban_don" ctrllimited="true" ctrlrange="-3 3"/>
    <position name="omuz_motoru" joint="omuz" ctrllimited="true" ctrlrange="-1.8 1.8"/>
    <position name="dirsek_motoru" joint="dirsek" ctrllimited="true" ctrlrange="-2.4 2.4"/>
    <position name="parmak_sol_motoru" joint="parmak_sol" kp="300" ctrllimited="true" ctrlrange="0 .05"/>
    <position name="parmak_sag_motoru" joint="parmak_sag" kp="300" ctrllimited="true" ctrlrange="0 .05"/>
  </actuator>
  <sensor>
    <jointpos name="taban_aci" joint="taban_don"/>
    <jointpos name="omuz_aci" joint="omuz"/>
    <jointpos name="dirsek_aci" joint="dirsek"/>
    <framepos name="uc" objtype="site" objname="ucnokta"/>
    <framepos name="kup" objtype="body" objname="kup"/>
  </sensor>
</mujoco>`,
    goals: [
      goal('uzan', 'Ucu küpün üstüne getir (uc.x ≥ 0,45)', 'Bring the tip over the cube (uc.x ≥ 0.45)', 'uc.x', 'ge', 0.45),
      goal('it', 'Küpü yana it: tabanı çevirerek küpü 10 cm kaydır (|kup.y| ≥ 0,1)', 'Push the cube sideways by swinging the base (|kup.y| ≥ 0.1)', 'kup.y', 'abs_ge', 0.1),
    ],
    python: {
      tr: `# Kolu masaya uzat, sonra tabanı çevirip küpü yana it.
from muroko import *

motor("omuz_motoru", 1.3)
motor("dirsek_motoru", 0.4)
motor("parmak_sol_motoru", 0.05)
motor("parmak_sag_motoru", 0.05)
await bekle(3)
motor("taban_motoru", 0.5)
`,
      en: `# Reach over the table, then swing the base to push the cube sideways.
from muroko import *

motor("omuz_motoru", 1.3)
motor("dirsek_motoru", 0.4)
motor("parmak_sol_motoru", 0.05)
motor("parmak_sag_motoru", 0.05)
await wait(3)
motor("taban_motoru", 0.5)
`,
    },
  },
  {
    id: 'dort-bacak',
    kind: 'robot',
    tr: { title: 'Dört bacaklı robot', desc: 'Dört bacağı (kalça + diz) olan robot. Sekiz motoru oynatarak ayakta durdur, eğil, kaldır.', hint: 'Bacakları hizalı tutarsan ayakta kalır. Gövde yüksekliğini sensörden (govde.z) izle.' },
    en: { title: 'Four-legged robot', desc: 'A robot with four legs (hip + knee). Use the eight motors to stand, crouch and lift.', hint: 'It stands if the legs are aligned. Watch the body height on the sensor (govde.z).' },
    cam: [1.4, -1.8, .7], look: [0, 0, .2],
    xml: `<mujoco model="dort-bacak">
  ${HEAD}
  <default>
    <joint damping=".4" limited="true"/>
    <position kp="30" ctrllimited="true" ctrlrange="-1.2 1.2"/>
    <geom friction="1.3 .02 .002"/>
  </default>
  <worldbody>
    ${LIGHT}
    ${FLOOR}
    <body name="govde" pos="0 0 .3">
      <freejoint/>
      <geom type="box" size=".18 .09 .04" mass="2" rgba=".2 .5 .9 1"/>
      <geom type="sphere" pos=".2 0 .02" size=".04" mass=".05" rgba=".95 .5 .2 1"/>
      <site name="merkez" pos="0 0 0" size=".01"/>
      <body name="on_sol" pos=".14 .1 0">
        <joint name="on_sol_kalca" type="hinge" axis="0 1 0" range="-1 1"/>
        <geom type="capsule" fromto="0 0 0 0 0 -.14" size=".02" mass=".15" rgba=".95 .5 .2 1"/>
        <body pos="0 0 -.14"><joint name="on_sol_diz" type="hinge" axis="0 1 0" range="-1.6 .3"/>
          <geom type="capsule" fromto="0 0 0 0 0 -.14" size=".018" mass=".1" rgba=".3 .3 .35 1"/>
          <geom type="sphere" pos="0 0 -.14" size=".024" mass=".02" rgba=".15 .15 .2 1"/></body>
      </body>
      <body name="on_sag" pos=".14 -.1 0">
        <joint name="on_sag_kalca" type="hinge" axis="0 1 0" range="-1 1"/>
        <geom type="capsule" fromto="0 0 0 0 0 -.14" size=".02" mass=".15" rgba=".95 .5 .2 1"/>
        <body pos="0 0 -.14"><joint name="on_sag_diz" type="hinge" axis="0 1 0" range="-1.6 .3"/>
          <geom type="capsule" fromto="0 0 0 0 0 -.14" size=".018" mass=".1" rgba=".3 .3 .35 1"/>
          <geom type="sphere" pos="0 0 -.14" size=".024" mass=".02" rgba=".15 .15 .2 1"/></body>
      </body>
      <body name="arka_sol" pos="-.14 .1 0">
        <joint name="arka_sol_kalca" type="hinge" axis="0 1 0" range="-1 1"/>
        <geom type="capsule" fromto="0 0 0 0 0 -.14" size=".02" mass=".15" rgba=".95 .5 .2 1"/>
        <body pos="0 0 -.14"><joint name="arka_sol_diz" type="hinge" axis="0 1 0" range="-1.6 .3"/>
          <geom type="capsule" fromto="0 0 0 0 0 -.14" size=".018" mass=".1" rgba=".3 .3 .35 1"/>
          <geom type="sphere" pos="0 0 -.14" size=".024" mass=".02" rgba=".15 .15 .2 1"/></body>
      </body>
      <body name="arka_sag" pos="-.14 -.1 0">
        <joint name="arka_sag_kalca" type="hinge" axis="0 1 0" range="-1 1"/>
        <geom type="capsule" fromto="0 0 0 0 0 -.14" size=".02" mass=".15" rgba=".95 .5 .2 1"/>
        <body pos="0 0 -.14"><joint name="arka_sag_diz" type="hinge" axis="0 1 0" range="-1.6 .3"/>
          <geom type="capsule" fromto="0 0 0 0 0 -.14" size=".018" mass=".1" rgba=".3 .3 .35 1"/>
          <geom type="sphere" pos="0 0 -.14" size=".024" mass=".02" rgba=".15 .15 .2 1"/></body>
      </body>
    </body>
  </worldbody>
  <actuator>
    <position name="on_sol_kalca" joint="on_sol_kalca"/><position name="on_sol_diz" joint="on_sol_diz"/>
    <position name="on_sag_kalca" joint="on_sag_kalca"/><position name="on_sag_diz" joint="on_sag_diz"/>
    <position name="arka_sol_kalca" joint="arka_sol_kalca"/><position name="arka_sol_diz" joint="arka_sol_diz"/>
    <position name="arka_sag_kalca" joint="arka_sag_kalca"/><position name="arka_sag_diz" joint="arka_sag_diz"/>
  </actuator>
  <sensor>
    <framepos name="govde" objtype="body" objname="govde"/>
    <gyro name="jiro" site="merkez"/>
  </sensor>
</mujoco>`,
    goals: [
      goal('ayakta', 'Ayakta kal: gövde 5 sn boyunca 20 cm üstünde', 'Stay up: body above 20 cm for 5 s', 'govde.z', 'ge', 0.2, 5),
      goal('egil', 'Eğil: gövdeyi 12–24 cm arasına indir ve 2 sn tut', 'Crouch: lower the body to 12–24 cm and hold 2 s', 'govde.z', 'between', 0.12, 2, 0.24),
    ],
    python: {
      tr: `# Hepsi sıfır: bacaklar düz, robot ayakta. Dizleri bükerek eğil.
from muroko import *

for ad in ["on_sol", "on_sag", "arka_sol", "arka_sag"]:
    motor(ad + "_kalca", 0)
    motor(ad + "_diz", 0)
await bekle(3)
for ad in ["on_sol", "on_sag", "arka_sol", "arka_sag"]:
    motor(ad + "_kalca", 0.7)
    motor(ad + "_diz", -1.3)
`,
      en: `# All zero: legs straight, robot standing. Bend the knees to crouch.
from muroko import *

for name in ["on_sol", "on_sag", "arka_sol", "arka_sag"]:
    motor(name + "_kalca", 0)
    motor(name + "_diz", 0)
await wait(3)
for name in ["on_sol", "on_sag", "arka_sol", "arka_sag"]:
    motor(name + "_kalca", 0.7)
    motor(name + "_diz", -1.3)
`,
    },
  },
  {
    id: 'cift-sarkac',
    kind: 'fizik',
    tr: { title: 'Çift sarkaç', desc: 'İki bağlantılı sarkaç: başlangıç açısını 0,001 rad değiştirince hareket tamamen farklılaşır (kaos).', hint: 'Sıfırla\'ya basıp XML\'deki <key qpos> değerini azıcık değiştir, iki koşuyu grafikte karşılaştır.' },
    en: { title: 'Double pendulum', desc: 'A two-link pendulum: change the start angle by 0.001 rad and the motion diverges completely (chaos).', hint: 'Press Reset, change the <key qpos> value in the XML slightly and compare the two runs on the graph.' },
    cam: [0, -4.2, 1.9], look: [0, 0, 1.5],
    xml: `<mujoco model="cift-sarkac">
  ${HEAD}
  <worldbody>
    ${LIGHT}
    ${FLOOR}
    <geom type="cylinder" fromto="0 .08 2.2 0 -.08 2.2" size=".05" rgba=".35 .38 .45 1"/>
    <body name="ust" pos="0 0 2.2">
      <joint name="omuz" type="hinge" axis="0 1 0"/>
      <geom type="capsule" fromto="0 0 0 0 0 -.6" size=".03" rgba=".2 .5 .9 1"/>
      <body name="alt" pos="0 0 -.6">
        <joint name="dirsek" type="hinge" axis="0 1 0"/>
        <geom type="capsule" fromto="0 0 0 0 0 -.6" size=".03" rgba=".95 .5 .2 1"/>
        <geom type="sphere" pos="0 0 -.6" size=".07" mass=".6" rgba=".95 .35 .25 1"/>
      </body>
    </body>
  </worldbody>
  <sensor>
    <jointpos name="ust_aci" joint="omuz"/>
    <jointpos name="alt_aci" joint="dirsek"/>
    <jointvel name="alt_hiz" joint="dirsek"/>
  </sensor>
  <keyframe>
    <key name="baslangic" qpos="2.2 0"/>
  </keyframe>
</mujoco>`,
    goals: [
      goal('devir', 'Alt sarkaç tepeye ulaşsın (|alt_aci| ≥ 3)', 'Make the lower pendulum swing over the top (|alt_aci| ≥ 3)', 'alt_aci', 'abs_ge', 3),
    ],
    python: {
      tr: `# Motor yok: yalnız sensörleri okuyup yazdırabilirsin.
from muroko import *

for i in range(10):
    print(round(zaman(), 1), "sn  alt açı:", round(sensor("alt_aci"), 2))
    await bekle(0.5)
`,
      en: `# No motors here: you can only read and print the sensors.
from muroko import *

for i in range(10):
    print(round(time(), 1), "s  lower angle:", round(sensor("alt_aci"), 2))
    await wait(0.5)
`,
    },
  },
  {
    id: 'duserken',
    kind: 'fizik',
    tr: { title: 'Düşen cisimler', desc: 'Küre, kutu, silindir ve kapsül bir rampaya düşüyor: çarpışma, sürtünme ve zıplama.', hint: 'Karıştır düğmesi cisimlere rastgele hız verir. XML\'de friction değerini 0,1 ile 1 arasında dene.' },
    en: { title: 'Falling objects', desc: 'A sphere, box, cylinder and capsule drop onto a ramp: collision, friction and bounce.', hint: 'The Shake button gives the objects random velocities. Try friction between 0.1 and 1 in the XML.' },
    cam: [3.4, -4.2, 2.4], look: [0, 0, .5],
    xml: `<mujoco model="duserken">
  ${HEAD}
  <default>
    <geom friction=".6 .005 .0001" solref=".01 .6"/>
  </default>
  <worldbody>
    ${LIGHT}
    ${FLOOR}
    <geom type="box" pos="2.4 0 .15" size=".05 1.6 .15" rgba=".55 .6 .7 1"/>
    <geom type="box" pos="-2.4 0 .15" size=".05 1.6 .15" rgba=".55 .6 .7 1"/>
    <geom type="box" pos="0 1.6 .15" size="2.4 .05 .15" rgba=".55 .6 .7 1"/>
    <geom type="box" pos="0 -1.6 .15" size="2.4 .05 .15" rgba=".55 .6 .7 1"/>
    <geom name="rampa" type="box" pos="-.6 0 .35" euler="0 .45 0" size=".9 .6 .04" rgba=".55 .6 .7 1"/>
    <body name="kure" pos="-1.2 .1 1.6"><freejoint/><geom type="sphere" size=".12" rgba=".95 .4 .3 1"/></body>
    <body name="kutu" pos="-.7 -.15 1.9"><freejoint/><geom type="box" size=".12 .12 .12" rgba=".25 .6 .95 1"/></body>
    <body name="silindir" pos="-.3 .15 2.2"><freejoint/><geom type="cylinder" size=".1 .14" rgba=".3 .75 .45 1"/></body>
    <body name="kapsul" pos=".1 -.1 2.5"><freejoint/><geom type="capsule" size=".08 .14" rgba=".95 .75 .25 1"/></body>
    <body name="kure2" pos="-.9 -.05 2.9"><freejoint/><geom type="sphere" size=".09" rgba=".7 .4 .9 1"/></body>
  </worldbody>
  <sensor>
    <framepos name="kure" objtype="body" objname="kure"/>
    <framepos name="kutu" objtype="body" objname="kutu"/>
  </sensor>
</mujoco>`,
    goals: [
      goal('yuvarla', 'Küre rampadan inip 1 m ileri yuvarlansın (kure.x ≥ 1)', 'Let the sphere roll 1 m off the ramp (kure.x ≥ 1)', 'kure.x', 'ge', 1),
    ],
    python: {
      tr: `# Kürenin ve kutunun yüksekliğini her saniye yazdır.
from muroko import *

for i in range(8):
    print(round(zaman(), 1), "sn  küre z:", round(sensor("kure.z"), 2), " kutu z:", round(sensor("kutu.z"), 2))
    await bekle(1)
`,
      en: `# Print the height of the sphere and the box every second.
from muroko import *

for i in range(8):
    print(round(time(), 1), "s  sphere z:", round(sensor("kure.z"), 2), " box z:", round(sensor("kutu.z"), 2))
    await wait(1)
`,
    },
  },
]

export const MJ_REPO = 'https://github.com/google-deepmind/mujoco'
export const MJ_WASM_REPO = 'https://github.com/google-deepmind/mujoco/tree/main/wasm'
