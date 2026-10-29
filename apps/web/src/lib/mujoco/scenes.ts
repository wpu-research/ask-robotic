// MuJoCo sayfasının hazır sahneleri (MJCF). Sayfa XML'i düzenlenebilir bırakır; `<key>` varsa başlangıç durumu oradan alınır.
// Birimler: metre, kilogram, radyan (`compiler angle="radian"`). Z yukarı.

export interface MjScene {
  id: string
  tr: { title: string; desc: string; hint: string }
  en: { title: string; desc: string; hint: string }
  /** Kamera ve bakış noktası (MuJoCo koordinatı: x, y, z yukarı). */
  cam: [number, number, number]
  look: [number, number, number]
  xml: string
}

const HEAD = `<compiler angle="radian"/>
  <option timestep="0.002" gravity="0 0 -9.81"/>`
const FLOOR = `<geom name="zemin" type="plane" size="6 6 .1" rgba=".86 .89 .93 1"/>`

export const MJ_SCENES: MjScene[] = [
  {
    id: 'cift-sarkac',
    tr: { title: 'Çift sarkaç', desc: 'İki bağlantılı sarkaç: başlangıç açısını 0,001 rad değiştirince hareket tamamen farklılaşır (kaos).', hint: 'Sıfırla\'ya basıp XML\'deki <key qpos> değerini azıcık değiştir, iki koşuyu karşılaştır.' },
    en: { title: 'Double pendulum', desc: 'A two-link pendulum: change the start angle by 0.001 rad and the motion diverges completely (chaos).', hint: 'Press Reset, change the <key qpos> value in the XML slightly and compare the two runs.' },
    cam: [0, -4.2, 1.9], look: [0, 0, 1.5],
    xml: `<mujoco model="cift-sarkac">
  ${HEAD}
  <worldbody>
    <light pos="1 -2 4" dir="-.2 .4 -1"/>
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
  <keyframe>
    <key name="baslangic" qpos="2.2 0"/>
  </keyframe>
</mujoco>`,
  },
  {
    id: 'duserken',
    tr: { title: 'Düşen cisimler', desc: 'Küre, kutu, silindir ve kapsül bir rampaya düşüyor: çarpışma, sürtünme ve zıplama.', hint: 'Karıştır düğmesi cisimlere rastgele hız verir. XML\'de friction değerini 0,1 ile 1 arasında dene.' },
    en: { title: 'Falling objects', desc: 'A sphere, box, cylinder and capsule drop onto a ramp: collision, friction and bounce.', hint: 'The Shake button gives the objects random velocities. Try friction between 0.1 and 1 in the XML.' },
    cam: [3.4, -4.2, 2.4], look: [0, 0, .5],
    xml: `<mujoco model="duserken">
  ${HEAD}
  <default>
    <geom friction=".6 .005 .0001" solref=".01 .6"/>
  </default>
  <worldbody>
    <light pos="2 -2 5" dir="-.3 .3 -1"/>
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
</mujoco>`,
  },
  {
    id: 'kol',
    tr: { title: 'İki eksenli robot kol', desc: 'Omuz ve dirsek eklemleri konum motoruyla sürülüyor. Kaydırıcılar hedef açıdır (radyan).', hint: 'Uçtaki kürenin yüksekliğini iki kaydırıcıyla ayarlamaya çalış: ters kinematiği elle çözüyorsun.' },
    en: { title: 'Two-joint robot arm', desc: 'Shoulder and elbow are driven by position actuators. The sliders are target angles (radians).', hint: 'Try setting the height of the end sphere with the two sliders: you are solving inverse kinematics by hand.' },
    cam: [0, -2.6, 1.1], look: [0, 0, .7],
    xml: `<mujoco model="kol">
  ${HEAD}
  <default>
    <joint damping="3" limited="true" range="-2.9 2.9"/>
    <position kp="60" ctrllimited="true" ctrlrange="-2.9 2.9"/>
  </default>
  <worldbody>
    <light pos="1 -2 4" dir="-.2 .4 -1"/>
    ${FLOOR}
    <geom type="cylinder" pos="0 0 .2" size=".14 .2" rgba=".35 .38 .45 1"/>
    <body name="baglanti1" pos="0 0 .4" gravcomp="1">
      <joint name="omuz" type="hinge" axis="0 1 0"/>
      <geom type="capsule" fromto="0 0 0 0 0 .55" size=".045" rgba=".2 .5 .9 1"/>
      <body name="baglanti2" pos="0 0 .55" gravcomp="1">
        <joint name="dirsek" type="hinge" axis="0 1 0"/>
        <geom type="capsule" fromto="0 0 0 0 0 .45" size=".038" rgba=".95 .5 .2 1"/>
        <geom name="uc" type="sphere" pos="0 0 .47" size=".055" rgba=".95 .3 .25 1" mass=".1"/>
      </body>
    </body>
  </worldbody>
  <actuator>
    <position name="omuz_motoru" joint="omuz"/>
    <position name="dirsek_motoru" joint="dirsek"/>
  </actuator>
</mujoco>`,
  },
  {
    id: 'arabali-sarkac',
    tr: { title: 'Arabalı ters sarkaç', desc: 'Klasik kontrol problemi: arabayı iterek dik sarkacı ayakta tutmaya çalış.', hint: 'Kaydırıcı arabaya uygulanan kuvvettir. Sarkaç devrilmeye başladığı yöne doğru it, dengeyi sağlamak PID/pekiştirmeli öğrenmenin ilk sınavıdır.' },
    en: { title: 'Cart-pole', desc: 'The classic control problem: push the cart to keep the upright pole from falling.', hint: 'The slider is the force on the cart. Push toward the side the pole leans: balancing is the first test for PID and reinforcement learning.' },
    cam: [0, -3.2, 1], look: [0, 0, .5],
    xml: `<mujoco model="arabali-sarkac">
  ${HEAD}
  <worldbody>
    <light pos="1 -2 4" dir="-.2 .4 -1"/>
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
  <keyframe>
    <key name="baslangic" qpos="0 .15"/>
  </keyframe>
</mujoco>`,
  },
]

export const MJ_REPO = 'https://github.com/google-deepmind/mujoco'
export const MJ_WASM_REPO = 'https://github.com/google-deepmind/mujoco/tree/main/wasm'
