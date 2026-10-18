// Drone dersinin kod örnekleri. Kod aynı, yalnız yorumlar dile göre: c(tr, en). Sayılar simülasyonlarla tutarlı.
import type { CodeBlock } from '@/lib/robotik/course'
import type { Lang } from './course'

type Src = (c: (tr: string, en: string) => string) => string
const block = (lang: Lang, tr: string, en: string, src: Src): CodeBlock => ({ title: lang === 'en' ? en : tr, src: src((a, b) => (lang === 'en' ? b : a)) })

export const mixerCpp = (l: Lang) => block(l, 'C++: Quad X karıştırıcı, doyum yönetimiyle', 'C++: Quad X mixer with saturation handling', (c) => `// ${c('PX4 Quad X: M1 sağ ön (CCW), M2 sol arka (CCW), M3 sol ön (CW), M4 sağ arka (CW)', 'PX4 Quad X: M1 front right (CCW), M2 rear left (CCW), M3 front left (CW), M4 rear right (CW)')}
// ${c('roll > 0 sağa yatış, pitch > 0 burun yukarı, yaw > 0 yukarıdan saat yönü; çıkış 0..1', 'roll > 0 right, pitch > 0 nose up, yaw > 0 clockwise from above; output 0..1')}
#include <algorithm>
#include <array>

constexpr float R[4] = {-1, +1, +1, -1}, P[4] = {+1, -1, +1, -1}, Y[4] = {+1, +1, -1, -1};

std::array<float, 4> mix(float thrust, float roll, float pitch, float yaw) {
  std::array<float, 4> rp{}, out{};
  float hi = -1e9f, lo = 1e9f;
  for (int i = 0; i < 4; ++i) { rp[i] = R[i] * roll + P[i] * pitch; hi = std::max(hi, rp[i]); lo = std::min(lo, rp[i]); }
  if (hi - lo > 1.f) { const float k = 1.f / (hi - lo); for (auto& v : rp) v *= k; hi *= k; lo *= k; }  // ${c('1) yönelimi ölçekle', '1) scale attitude')}
  if (thrust + hi > 1.f) thrust = 1.f - hi;                       // ${c('2) gazı aşağı kaydır', '2) shift throttle down')}
  else if (thrust + lo < 0.f) thrust = -lo;                       // ${c('   ya da yukarı (airmode)', '   or up (airmode)')}
  float s = 1.f;                                                  // ${c('3) sapmaya kalan pay', '3) headroom left for yaw')}
  for (int i = 0; i < 4; ++i) {
    float base = thrust + rp[i], y = Y[i] * yaw;
    if (y > 0) s = std::min(s, std::max(0.f, (1.f - base) / y));
    if (y < 0) s = std::min(s, std::max(0.f, base / -y));
  }
  for (int i = 0; i < 4; ++i) out[i] = std::clamp(thrust + rp[i] + s * Y[i] * yaw, 0.f, 1.f);
  return out;   // ${c('DShot değeri: 48 + out × 1999', 'DShot value: 48 + out × 1999')}
}`)

export const hoverPy = (l: Lang) => block(l, 'Python: itki tablosundan askıda kalma noktası', 'Python: hover point from a thrust table', (c) => `# ${c('Örnek itki tablosu: 2216 920KV + 10x4.5 pervane + 4S sınıfı için tipik değerler; gerçek tabloyu üreticiden al. Gaz %, itki gf, akım A', 'Example thrust table: typical values for a 2216 920KV + 10x4.5 prop + 4S class; get the real table from the manufacturer. Throttle %, thrust gf, current A')}
import numpy as np

throttle = np.array([30, 40, 50, 60, 70, 80, 90, 100])
thrust_g = np.array([180, 300, 430, 560, 690, 820, 930, 1010])
current_a = np.array([1.1, 2.0, 3.3, 4.9, 6.8, 9.0, 11.3, 13.6])

mass_kg, motors = 1.6, 4
hover_g = mass_kg * 1000 / motors                    # ${c('motor başına gereken itki', 'thrust needed per motor')}
u = np.interp(hover_g, thrust_g, throttle)           # ${c('tablodan doğrusal ara değer', 'linear interpolation in the table')}
i = np.interp(hover_g, thrust_g, current_a)
twr = motors * thrust_g[-1] / (mass_kg * 1000)
print(f"${c('itki/ağırlık', 'thrust/weight')} = {twr:.2f}")
print(f"${c('askıda gaz', 'hover throttle')} ≈ {u:.0f}%, ${c('motor başına', 'per motor')} {i:.1f} A, ${c('verim', 'efficiency')} {hover_g / (i * 14.8):.1f} gf/W")
# ${c('PX4 THR_MDL_FAC: tablodan (1-f)·u + f·u² eğrisine en küçük kareler uydur', 'PX4 THR_MDL_FAC: least-squares fit of (1-f)·u + f·u² to the table')}
x, r = throttle / 100, thrust_g / thrust_g[-1]
f = float(np.clip(np.sum((r - x) * (x**2 - x)) / np.sum((x**2 - x) ** 2), 0, 1))
print(f"THR_MDL_FAC ≈ {f:.2f}")`)

export const flightPy = (l: Lang) => block(l, 'Python: momentum teorisiyle uçuş süresi', 'Python: flight time from momentum theory', (c) => `import math

RHO, G = 1.225, 9.81          # ${c('kg/m³, m/s²', 'kg/m³, m/s²')}

def flight_time(dry_kg, cells, mah, prop_in, motors=4, fm=0.65, drive=0.8, avionics_a=0.6, usable=0.8, wh_per_kg=140):
    batt_kg = cells * 3.7 * mah / 1000 / wh_per_kg      # ${c('paket kütlesi', 'pack mass')}
    m = dry_kg + batt_kg
    area = math.pi * (prop_in * 0.0254 / 2) ** 2         # ${c('disk alanı, m²', 'disk area, m²')}
    t = m * G / motors                                    # ${c('motor başına itki, N', 'thrust per motor, N')}
    p_ideal = t ** 1.5 / math.sqrt(2 * RHO * area)        # ${c('momentum teorisi, W', 'momentum theory, W')}
    p_elec = motors * p_ideal / (fm * drive)
    amps = p_elec / (cells * 3.7) + avionics_a
    return usable * mah / 1000 / amps * 60, m, amps

for mah in (3000, 5000, 8000, 12000):
    minutes, m, a = flight_time(1.1, 4, mah, 10)
    print(f"{mah:>6} mAh  {m:.2f} kg  {a:5.1f} A  {minutes:5.1f} ${c('dk', 'min')}")
# ${c('Kapasite 4 katına çıkar, süre 4 katına çıkmaz: paket de taşınır.', 'Capacity grows 4×, time does not: the pack has to be carried too.')}`)

export const batteryPy = (l: Lang) => block(l, 'Python: gerilim sarkmasını düzelten batarya izleyici', 'Python: battery monitor that corrects for voltage sag', (c) => `# ${c('Yük altında gerilim iç direnç yüzünden düşer: V_dinlenme ≈ V + I·R_iç. PX4: BAT1_R_INTERNAL', 'Under load voltage drops because of internal resistance: V_rest ≈ V + I·R_int. PX4: BAT1_R_INTERNAL')}
CELLS, R_INT = 4, 0.012        # ${c('hücre başına iç direnç, Ω', 'internal resistance per cell, Ω')}
EMPTY, FULL = 3.5, 4.2         # ${c('hücre başına V (dinlenme)', 'V per cell (at rest)')}
LOW, CRIT = 0.25, 0.10         # ${c('kalan oran eşikleri', 'remaining-fraction thresholds')}

def remaining(v_pack, amps):
    v_cell = v_pack / CELLS + amps * R_INT
    return min(1.0, max(0.0, (v_cell - EMPTY) / (FULL - EMPTY)))

def battery_state(v_pack, amps):
    r = remaining(v_pack, amps)
    if r < CRIT:
        return "CRITICAL", r   # ${c('hemen in', 'land now')}
    if r < LOW:
        return "LOW", r        # ${c('eve dön', 'return home')}
    return "OK", r

print(battery_state(14.4, 12.0))   # ${c('yük altında 3,6 V/hücre ama aslında yarı dolu', '3.6 V/cell under load but actually half full')}`)

export const compCpp = (l: Lang) => block(l, 'C++: tamamlayıcı süzgeç (yuvarlanma ve yunuslama)', 'C++: complementary filter (roll and pitch)', (c) => `#include <cmath>

struct Attitude { float roll = 0, pitch = 0; };   // ${c('radyan', 'radians')}

// ${c('gx, gy: jiroskop rad/s; ax, ay, az: ivmeölçer m/s²; dt: s; tau: süzgeç zaman sabiti, s', 'gx, gy: gyro rad/s; ax, ay, az: accelerometer m/s²; dt: s; tau: filter time constant, s')}
void complementary(Attitude& a, float gx, float gy, float ax, float ay, float az, float dt, float tau = 0.5f) {
  const float alpha = tau / (tau + dt);              // ${c('250 Hz, τ = 0,5 s → α ≈ 0,992', '250 Hz, τ = 0.5 s → α ≈ 0.992')}
  const float accRoll = std::atan2(ay, az);
  const float accPitch = std::atan2(-ax, std::sqrt(ay * ay + az * az));
  // ${c('ivme büyüklüğü 1 g\'den çok farklıysa ivmeölçere güvenme (manevra ya da titreşim)', 'if |a| is far from 1 g, do not trust the accelerometer (manoeuvre or vibration)')}
  const float g = std::sqrt(ax * ax + ay * ay + az * az);
  const float k = std::fabs(g - 9.81f) < 1.5f ? 1.f - alpha : 0.f;
  a.roll  = (1.f - k) * (a.roll + gx * dt) + k * accRoll;
  a.pitch = (1.f - k) * (a.pitch + gy * dt) + k * accPitch;
}
// ${c('Not: büyük açılarda ve sapma (yaw) için kuaterniyonlu Mahony/Madgwick ya da EKF kullanılır.', 'Note: for large angles and yaw use quaternion Mahony/Madgwick or an EKF.')}`)

export const pidCpp = (l: Lang) => block(l, 'C++: anti-windup ve türev süzgeçli PID', 'C++: PID with anti-windup and a filtered derivative', (c) => `#include <algorithm>
#include <cmath>

class Pid {
 public:
  Pid(float kp, float ki, float kd, float outMin, float outMax, float dCutoffHz)
      : kp_(kp), ki_(ki), kd_(kd), min_(outMin), max_(outMax), fc_(dCutoffHz) {}

  // ${c('sp: hedef, meas: ölçüm, dt: s, ff: ileri besleme (ör. askıda itki m·g)', 'sp: setpoint, meas: measurement, dt: s, ff: feedforward (e.g. hover thrust m·g)')}
  float update(float sp, float meas, float dt, float ff = 0.f) {
    const float e = sp - meas;
    // ${c('türev ölçümden: hedef sıçrayınca "türev tekmesi" olmaz', 'derivative on measurement: no "derivative kick" when the setpoint jumps')}
    const float raw = first_ ? 0.f : -(meas - prev_) / dt;
    prev_ = meas; first_ = false;
    const float a = dt / (dt + 1.f / (2.f * float(M_PI) * fc_));   // ${c('birinci derece alçak geçiren', 'first-order low-pass')}
    d_ += a * (raw - d_);
    const float iNew = i_ + ki_ * e * dt;
    const float u = ff + kp_ * e + iNew + kd_ * d_;
    const float us = std::clamp(u, min_, max_);
    // ${c('koşullu integrasyon: doymuşken integrali yalnız doymayı azaltan yönde güncelle', 'conditional integration: while saturated, only let the integral move out of saturation')}
    if (u == us || (u > us && e < 0) || (u < us && e > 0)) i_ = iNew;
    return us;
  }
  void reset() { i_ = 0; d_ = 0; first_ = true; }

 private:
  float kp_, ki_, kd_, min_, max_, fc_;
  float i_ = 0, d_ = 0, prev_ = 0;
  bool first_ = true;
};

// ${c('İrtifa tutma, 500 Hz: thrust = pid.update(z_sp, z_est, 0.002f, m * 9.81f);', 'Altitude hold, 500 Hz: thrust = pid.update(z_sp, z_est, 0.002f, m * 9.81f);')}`)

export const pidPy = (l: Lang) => block(l, 'Python: aynı PID ve basamak yanıtı ölçütleri', 'Python: the same PID and step-response metrics', (c) => `import math

class PID:
    def __init__(self, kp, ki, kd, out_min, out_max, d_cutoff_hz=20.0):
        self.kp, self.ki, self.kd = kp, ki, kd
        self.lo, self.hi, self.fc = out_min, out_max, d_cutoff_hz
        self.i = self.d = 0.0
        self.prev = None

    def update(self, sp, meas, dt, ff=0.0):
        e = sp - meas
        raw = 0.0 if self.prev is None else -(meas - self.prev) / dt
        self.prev = meas
        a = dt / (dt + 1 / (2 * math.pi * self.fc))
        self.d += a * (raw - self.d)
        i_new = self.i + self.ki * e * dt
        u = ff + self.kp * e + i_new + self.kd * self.d
        us = min(self.hi, max(self.lo, u))
        if u == us or (u > us and e < 0) or (u < us and e > 0):
            self.i = i_new
        return us

# ${c('1,2 kg drone, ek yük 0,3 kg, 500 Hz', '1.2 kg drone, 0.3 kg payload, 500 Hz')}
m_ff, m, g, dt = 1.2, 1.5, 9.81, 0.002
pid = PID(8, 2, 5, -m_ff * g, 2 * m_ff * g - m_ff * g)
z = v = 0.0
thrust = m_ff * g
log = []
for k in range(5000):
    sp = 2.0 if k * dt >= 0.5 else 0.0
    cmd = m_ff * g + pid.update(sp, z, dt)
    thrust += (cmd - thrust) * dt / 0.05          # ${c('motor gecikmesi τ = 50 ms', 'motor lag τ = 50 ms')}
    v += (thrust - m * g - 0.3 * v) / m * dt
    z = max(0.0, z + v * dt)
    log.append(z)
print(f"${c('aşım', 'overshoot')} {max(0, (max(log) - 2) / 2 * 100):.1f}%, ${c('son hata', 'final error')} {2 - log[-1]:.3f} m")`)

export const cascadeCpp = (l: Lang) => block(l, 'C++: kaskad yönelim kontrolü (açı P → hız PID)', 'C++: cascaded attitude control (angle P → rate PID)', (c) => `// ${c('PX4 düzeninde: mc_att_control (açı) → mc_rate_control (hız) → control_allocator (karıştırıcı)', 'The PX4 layout: mc_att_control (angle) → mc_rate_control (rate) → control_allocator (mixer)')}
struct Biquad {   // ${c('2. derece alçak geçiren (D terimi ve jiroskop için)', '2nd-order low-pass (for the D term and the gyro)')}
  float b0, b1, b2, a1, a2, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  Biquad(float fc, float fs) {
    const float k = std::tan(float(M_PI) * fc / fs), q = 0.7071f, n = 1.f / (1.f + k / q + k * k);
    b0 = k * k * n; b1 = 2 * b0; b2 = b0; a1 = 2 * (k * k - 1) * n; a2 = (1 - k / q + k * k) * n;
  }
  float apply(float x) { float y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; }
};

constexpr float RATE_HZ = 1000.f, DT = 1.f / RATE_HZ;
Biquad gyroLpf(80.f, RATE_HZ);                       // ${c('jiroskop süzgeci', 'gyro filter')}
Pid ratePid(0.15f, 0.2f, 0.003f, -0.6f, 0.6f, 30.f);  // ${c('N·m çıkış; D süzgeci 30 Hz', 'N·m output; D filter 30 Hz')}
const float ANGLE_P = 6.f, RATE_MAX = 220.f * float(M_PI) / 180.f;

// ${c('1 kHz kesmesinde (ya da RTOS görevinde) çağrılır', 'called from a 1 kHz interrupt (or RTOS task)')}
float rollStep(float rollSp, float rollEst, float gyroX) {
  float rateSp = std::clamp(ANGLE_P * (rollSp - rollEst), -RATE_MAX, RATE_MAX);   // ${c('dış döngü', 'outer loop')}
  float rate = gyroLpf.apply(gyroX);
  return ratePid.update(rateSp, rate, DT);                                          // ${c('iç döngü → tork', 'inner loop → torque')}
}`)

export const navPy = (l: Lang) => block(l, 'Python: ara nokta takibi (konum P → hız PI)', 'Python: waypoint tracking (position P → velocity PI)', (c) => `import math

G, MAX_TILT = 9.81, math.radians(25)
A_MAX = G * math.tan(MAX_TILT)          # ${c('azami yatay ivme ≈ 4,6 m/s²', 'max horizontal acceleration ≈ 4.6 m/s²')}

class Navigator:
    def __init__(self, waypoints, cruise=6.0, pos_p=0.9, vel_p=1.8, vel_i=0.3, accept=1.0):
        self.wps, self.i = waypoints, 0
        self.cruise, self.pos_p, self.vel_p, self.vel_i, self.accept = cruise, pos_p, vel_p, vel_i, accept
        self.vi = [0.0, 0.0]

    def step(self, est, vel, dt):
        """est: ${c('kestirilen konum (m)', 'estimated position (m)')}, vel: ${c('hız (m/s)', 'velocity (m/s)')} → ${c('ivme komutu', 'acceleration command')}"""
        tx, ty = self.wps[self.i]
        if math.hypot(tx - est[0], ty - est[1]) < self.accept and self.i < len(self.wps) - 1:
            self.i += 1                                     # ${c('varış: sonraki ara nokta', 'arrived: next waypoint')}
            tx, ty = self.wps[self.i]
        vx, vy = self.pos_p * (tx - est[0]), self.pos_p * (ty - est[1])
        n = math.hypot(vx, vy)
        if n > self.cruise:
            vx, vy = vx * self.cruise / n, vy * self.cruise / n
        ex, ey = vx - vel[0], vy - vel[1]
        ax, ay = self.vel_p * ex + self.vi[0], self.vel_p * ey + self.vi[1]
        a = math.hypot(ax, ay)
        if a > A_MAX:
            ax, ay = ax * A_MAX / a, ay * A_MAX / a          # ${c('doyum: integrali dondur', 'saturated: freeze the integral')}
        else:
            self.vi[0] += self.vel_i * ex * dt
            self.vi[1] += self.vel_i * ey * dt
        # ${c('ivme → eğim açıları (küçük açı): pitch ≈ -ax/g, roll ≈ ay/g (gövde eksenine çevrilir)', 'acceleration → tilt (small angle): pitch ≈ -ax/g, roll ≈ ay/g (rotated into the body frame)')}
        return ax, ay`)

export const mavsdkPy = (l: Lang) => block(l, 'MAVSDK-Python: görev yükle, uç, izle (PX4 SITL)', 'MAVSDK-Python: upload, fly and monitor a mission (PX4 SITL)', (c) => `# pip install mavsdk      ${c('(MAVSDK 2.x; eski sürümlerde vehicle_action alanı yok)', '(MAVSDK 2.x; older versions lack the vehicle_action field)')}
import asyncio
from mavsdk import System
from mavsdk.mission import MissionItem, MissionPlan

def wp(lat, lon, alt=15.0, speed=6.0):
    nan = float("nan")
    return MissionItem(latitude_deg=lat, longitude_deg=lon, relative_altitude_m=alt, speed_m_s=speed,
                       is_fly_through=True, gimbal_pitch_deg=nan, gimbal_yaw_deg=nan,
                       camera_action=MissionItem.CameraAction.NONE, loiter_time_s=nan,
                       camera_photo_interval_s=nan, acceptance_radius_m=1.0, yaw_deg=nan,
                       camera_photo_distance_m=nan, vehicle_action=MissionItem.VehicleAction.NONE)

async def main():
    drone = System()
    await drone.connect(system_address="udpin://0.0.0.0:14540")   # ${c('SITL offboard API portu', 'SITL offboard API port')}
    async for s in drone.core.connection_state():
        if s.is_connected:
            break
    async for h in drone.telemetry.health():                        # ${c('EKF ve GPS hazır mı?', 'EKF and GPS ready?')}
        if h.is_global_position_ok and h.is_home_position_ok:
            break
    home = await anext(drone.telemetry.home())
    d = 0.0002                                                      # ${c('≈ 22 m kuzey / 15 m doğu', '≈ 22 m north / 15 m east')}
    items = [wp(home.latitude_deg + d, home.longitude_deg),
             wp(home.latitude_deg + d, home.longitude_deg + d),
             wp(home.latitude_deg, home.longitude_deg + d)]
    await drone.mission.set_return_to_launch_after_mission(True)
    await drone.mission.upload_mission(MissionPlan(items))
    await drone.action.arm()
    await drone.mission.start_mission()
    async for p in drone.mission.mission_progress():
        print(f"${c('görev', 'mission')} {p.current}/{p.total}")
        if p.current == p.total:
            break

asyncio.run(main())`)

export const pymavlinkPy = (l: Lang) => block(l, 'pymavlink: HEARTBEAT, telemetri ve ARM komutu', 'pymavlink: HEARTBEAT, telemetry and an ARM command', (c) => `# pip install pymavlink    ${c('(QGroundControl ya da MAVSDK aynı portu dinliyorsa kapat)', '(close QGroundControl or MAVSDK if they listen on the same port)')}
from pymavlink import mavutil

m = mavutil.mavlink_connection("udpin:0.0.0.0:14540")
m.wait_heartbeat()                                     # HEARTBEAT (#0)
print("${c('sistem', 'system')}", m.target_system, "${c('bileşen', 'component')}", m.target_component)

# MAV_CMD_COMPONENT_ARM_DISARM (400), param1 = 1 → ARM
m.mav.command_long_send(m.target_system, m.target_component,
                        mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM, 0, 1, 0, 0, 0, 0, 0, 0)
ack = m.recv_match(type="COMMAND_ACK", blocking=True, timeout=3)
print("ACK:", ack)

for _ in range(20):
    msg = m.recv_match(type=["ATTITUDE", "GLOBAL_POSITION_INT", "SYS_STATUS"], blocking=True)
    if msg.get_type() == "ATTITUDE":                   # #30, ${c('radyan', 'radians')}
        print(f"roll {msg.roll:.3f} pitch {msg.pitch:.3f}")
    elif msg.get_type() == "GLOBAL_POSITION_INT":      # #33, ${c('derece × 1e7, mm', 'degrees × 1e7, mm')}
        print(msg.lat / 1e7, msg.lon / 1e7, msg.relative_alt / 1000, "m")
    else:                                              # #1
        print("${c('batarya', 'battery')}", msg.voltage_battery / 1000, "V", msg.battery_remaining, "%")`)

export const sitlBash = (l: Lang) => block(l, 'Kabuk: PX4 SITL + Gazebo + ROS 2 kurulumu (Ubuntu 24.04)', 'Shell: PX4 SITL + Gazebo + ROS 2 setup (Ubuntu 24.04)', (c) => `# ${c('1) PX4 ve Gazebo Harmonic (Ubuntu 22.04/24.04 ya da WSL2)', '1) PX4 and Gazebo Harmonic (Ubuntu 22.04/24.04 or WSL2)')}
git clone https://github.com/PX4/PX4-Autopilot.git --recursive
bash ./PX4-Autopilot/Tools/setup/ubuntu.sh        # ${c('bitince oturumu kapatıp aç', 'log out and back in afterwards')}
cd PX4-Autopilot
make px4_sitl gz_x500                            # ${c('x500 quad Gazebo\'da; "pxh>" kabuğu açılır', 'x500 quad in Gazebo; the "pxh>" shell opens')}
# pxh> commander takeoff     pxh> commander land
# ${c('Aşağı bakan kameralı model (hassas iniş): make px4_sitl gz_x500_mono_cam_down', 'Model with a down-facing camera (precision landing): make px4_sitl gz_x500_mono_cam_down')}

# ${c('2) QGroundControl: AppImage indir, çalıştır; UDP 14550\'den kendiliğinden bağlanır', '2) QGroundControl: download the AppImage and run it; it connects on UDP 14550 by itself')}

# ${c('3) ROS 2 Jazzy (24.04) ya da Humble (22.04) kurulu olsun; ardından Micro XRCE-DDS Agent', '3) Have ROS 2 Jazzy (24.04) or Humble (22.04) installed; then the Micro XRCE-DDS Agent')}
git clone https://github.com/eProsima/Micro-XRCE-DDS-Agent.git     # ${c('PX4 belgesindeki sürüm etiketini kullan', 'use the version tag from the PX4 docs')}
cd Micro-XRCE-DDS-Agent && mkdir build && cd build && cmake .. && make && sudo make install && sudo ldconfig /usr/local/lib/
MicroXRCEAgent udp4 -p 8888                      # ${c('SITL istemcisi buna kendiliğinden bağlanır', 'the SITL client connects to it automatically')}

# ${c('4) px4_msgs (PX4 sürümünle aynı dal) ve örnekler', '4) px4_msgs (same branch as your PX4) and examples')}
mkdir -p ~/px4_ws/src && cd ~/px4_ws/src
git clone https://github.com/PX4/px4_msgs.git
git clone https://github.com/PX4/px4_ros_com.git
cd ~/px4_ws && colcon build && source install/setup.bash
ros2 topic list | grep fmu                       # /fmu/out/vehicle_status ...`)

export const offboardPy = (l: Lang) => block(l, 'ROS 2 (rclpy): offboard kipinde 5 m\'ye çık ve bekle', 'ROS 2 (rclpy): climb to 5 m in offboard mode and hold', (c) => `# ${c('PX4 v1.16+ bazı konu adlarına sürüm eki ekler (ör. vehicle_status_v1): "ros2 topic list" ile kontrol et.', 'PX4 v1.16+ adds a version suffix to some topic names (e.g. vehicle_status_v1): check with "ros2 topic list".')}
import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy, HistoryPolicy
from px4_msgs.msg import OffboardControlMode, TrajectorySetpoint, VehicleCommand

QOS = QoSProfile(reliability=ReliabilityPolicy.BEST_EFFORT, durability=DurabilityPolicy.TRANSIENT_LOCAL,
                 history=HistoryPolicy.KEEP_LAST, depth=1)

class Offboard(Node):
    def __init__(self):
        super().__init__("offboard_demo")
        self.mode = self.create_publisher(OffboardControlMode, "/fmu/in/offboard_control_mode", QOS)
        self.sp = self.create_publisher(TrajectorySetpoint, "/fmu/in/trajectory_setpoint", QOS)
        self.cmd = self.create_publisher(VehicleCommand, "/fmu/in/vehicle_command", QOS)
        self.n = 0
        self.create_timer(0.1, self.tick)              # ${c('10 Hz: offboard en az 2 Hz akış ister', '10 Hz: offboard needs a stream of at least 2 Hz')}

    def us(self):
        return self.get_clock().now().nanoseconds // 1000

    def command(self, command, p1=0.0, p2=0.0):
        m = VehicleCommand(command=command, param1=p1, param2=p2, target_system=1, target_component=1,
                           source_system=1, source_component=1, from_external=True, timestamp=self.us())
        self.cmd.publish(m)

    def tick(self):
        self.mode.publish(OffboardControlMode(position=True, timestamp=self.us()))
        self.sp.publish(TrajectorySetpoint(position=[0.0, 0.0, -5.0], yaw=0.0, timestamp=self.us()))  # ${c('NED: z aşağı', 'NED: z down')}
        if self.n == 10:                                # ${c('1 s akıştan sonra kip ve ARM', 'mode and ARM after 1 s of streaming')}
            self.command(VehicleCommand.VEHICLE_CMD_DO_SET_MODE, 1.0, 6.0)   # ${c('6 = OFFBOARD', '6 = OFFBOARD')}
            self.command(VehicleCommand.VEHICLE_CMD_COMPONENT_ARM_DISARM, 1.0)
        self.n += 1

def main():
    rclpy.init()
    rclpy.spin(Offboard())

if __name__ == "__main__":
    main()`)

export const arucoPy = (l: Lang) => block(l, 'Python + OpenCV: ArUco ile hassas iniş hatası ve hız komutu', 'Python + OpenCV: precision-landing error from ArUco and a velocity command', (c) => `# pip install opencv-contrib-python   (OpenCV ≥ 4.7)
import cv2
import numpy as np

MARKER = 0.30                                    # ${c('işaretçi kenarı, m', 'marker side, m')}
K = np.array([[410.0, 0, 320], [0, 410.0, 240], [0, 0, 1]])   # ${c('kamera matrisi (kalibrasyondan)', 'camera matrix (from calibration)')}
DIST = np.zeros(5)
OBJ = np.array([[-1, 1, 0], [1, 1, 0], [1, -1, 0], [-1, -1, 0]], dtype=np.float32) * MARKER / 2
det = cv2.aruco.ArucoDetector(cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50), cv2.aruco.DetectorParameters())

def landing_command(gray, k=0.6, v_max=1.0):
    """${c('Aşağı bakan kamera görüntüsü → (vx, vy, vz) gövde hızı, m/s; işaretçi yoksa None', 'Down-facing camera image → (vx, vy, vz) body velocity, m/s; None if no marker')}"""
    corners, ids, _ = det.detectMarkers(gray)
    if ids is None:
        return None                              # ${c('ARAMA durumuna dön', 'go back to the SEARCH state')}
    ok, rvec, tvec = cv2.solvePnP(OBJ, corners[0][0].astype(np.float32), K, DIST, flags=cv2.SOLVEPNP_IPPE_SQUARE)
    ex, ey, h = tvec.ravel()                     # ${c('kamera çerçevesinde işaretçi: x sağ, y aşağı (görüntüde), z ileri = yükseklik', 'marker in the camera frame: x right, y down (in the image), z forward = height')}
    # ${c('Kamera aşağı bakıyor: görüntü yukarısı = gövde ileri (montaja göre işaretleri doğrula)', 'Camera looks down: image up = body forward (verify the signs for your mounting)')}
    vx, vy = np.clip(-k * ey, -v_max, v_max), np.clip(k * ex, -v_max, v_max)
    vz = 0.5 if np.hypot(ex, ey) < 0.15 else 0.0  # ${c('hizalıysa alçal (NED: + aşağı)', 'descend when aligned (NED: + down)')}
    return float(vx), float(vy), float(vz)
# ${c('Alternatif: konumu LANDING_TARGET (#149) olarak gönder, PX4 Precision Land kipi gerisini yapar.', 'Alternative: send the pose as LANDING_TARGET (#149) and let PX4 Precision Land do the rest.')}`)

export const failsafeTxt = (l: Lang) => block(l, 'PX4 parametreleri: failsafe ve sanal çit (QGroundControl → Parameters)', 'PX4 parameters: failsafes and geofence (QGroundControl → Parameters)', (c) => `# ${c('Kumanda (RC) kaybı', 'RC loss')}
COM_RC_LOSS_T   0.5      # ${c('s: bu kadar sinyal yoksa kayıp sayılır', 's: no signal for this long counts as lost')}
NAV_RCL_ACT     2        # ${c('2 = Return (eve dön), 3 = Land', '2 = Return, 3 = Land')}
# ${c('Telemetri (yer istasyonu) kaybı', 'Data link (ground station) loss')}
COM_DL_LOSS_T   10       # s
NAV_DLL_ACT     2        # ${c('görevde bağlantı kesilirse Return', 'Return if the link drops during a mission')}
# ${c('Batarya (kalan oran)', 'Battery (remaining fraction)')}
BAT_LOW_THR     0.25     # ${c('uyarı', 'warning')}
BAT_CRIT_THR    0.12     # ${c('COM_LOW_BAT_ACT eylemi (Return)', 'COM_LOW_BAT_ACT action (Return)')}
BAT_EMERGEN_THR 0.06     # ${c('hemen in', 'land immediately')}
COM_LOW_BAT_ACT 3        # ${c('3 = kritikte Return, acil durumda Land', '3 = Return at critical, Land at emergency')}
# ${c('Sanal çit', 'Geofence')}
GF_ACTION       3        # ${c('3 = Return', '3 = Return')}
GF_MAX_HOR_DIST 200      # ${c('m, eve uzaklık', 'm, from home')}
GF_MAX_VER_DIST 100      # ${c('m, yasal irtifa sınırının altında tut', 'm, keep below the legal altitude limit')}
RTL_RETURN_ALT  30       # ${c('m: eve dönüş irtifası (engellerin üstünde)', 'm: return altitude (above obstacles)')}
COM_OBL_RC_ACT  0        # ${c('offboard sinyali kesilirse: 0 = Position', 'offboard signal lost: 0 = Position')}`)

export const missionFsmPy = (l: Lang) => block(l, 'Python: bitirme projesi görev durum makinesi (failsafe geçişleriyle)', 'Python: capstone mission state machine (with failsafe transitions)', (c) => `from enum import Enum, auto

class S(Enum):
    TAKEOFF = auto(); ROUTE = auto(); SEARCH = auto(); ALIGN = auto(); LAND = auto(); RETURN = auto(); DONE = auto()

def next_state(s, ev):
    """${c('Saf geçiş fonksiyonu: birim testle her geçiş doğrulanır. ev: o adımın olayları (dict)', 'Pure transition function: every transition is unit-tested. ev: the events of this step (dict)')}"""
    if ev.get("link_lost") or ev.get("battery") == "CRITICAL":     # ${c('failsafe her durumdan önce gelir', 'failsafes win over every state')}
        return S.RETURN if s not in (S.LAND, S.DONE) else s
    if s is S.TAKEOFF and ev.get("alt_reached"):
        return S.ROUTE
    if s is S.ROUTE and ev.get("last_wp_reached"):
        return S.SEARCH
    if s is S.SEARCH:
        if ev.get("marker_seen"):
            return S.ALIGN
        if ev.get("search_timeout"):                                # ${c('işaretçi yoksa GPS\'le in', 'no marker: land on GPS')}
            return S.LAND
    if s is S.ALIGN:
        if not ev.get("marker_seen"):
            return S.SEARCH
        if ev.get("aligned"):
            return S.LAND
    if s in (S.LAND, S.RETURN) and ev.get("landed"):
        return S.DONE
    return s

assert next_state(S.ROUTE, {"link_lost": True}) is S.RETURN
assert next_state(S.SEARCH, {"marker_seen": True}) is S.ALIGN
assert next_state(S.ALIGN, {}) is S.SEARCH
assert next_state(S.LAND, {"battery": "CRITICAL"}) is S.LAND   # ${c('inişi bölme', 'do not interrupt a landing')}`)
