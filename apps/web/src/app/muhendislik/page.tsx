import type { Metadata } from 'next'
import Link from 'next/link'
import { InstructorCard } from '@/components/egitmen/instructor-card'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { ENG_PARTS, LEVELS, labHref, levelText, partText, partsOfLevel } from '@/lib/muhendislik/catalog'

export const metadata: Metadata = {
  title: 'Mühendislik yolu',
  description: 'Büyükler için robotik: Hyvex Academy elektronik serisindeki 128 parça, temel bileşenden drone\'a 7 seviyede.',
}

const pad = (n: number) => String(n).padStart(2, '0')

export default async function Muhendislik() {
  const en = (await getLocale()) === 'en'
  const lang = en ? 'en' : 'tr'
  const withLab = ENG_PARTS.filter((p) => p.lab)
  return (
    <div className="page eng">
      <header className="eng-hero">
        <p className="eyebrow">{en ? 'Robotics for adults' : 'Büyükler için robotik'}</p>
        <h1>{en ? 'Engineering path: from basic components to drones' : 'Mühendislik yolu: temel bileşenden drone\'a'}</h1>
        <p className="lead">
          {en
            ? 'The parts of the Hyvex Academy electronics series, in seven levels. Every part that can be simulated on the Uno opens in the circuit lab already connected: wires attached, starter code written, just compile and run.'
            : 'Hyvex Academy elektronik serisindeki parçalar yedi seviyede. Uno\'da benzetilebilen her parça devre laboratuvarında takılı açılır: kablolar bağlı, başlangıç kodu yazılı, derleyip çalıştırman yeterli.'}
        </p>
        <dl className="eng-stats">
          <div><dt>{en ? 'Parts' : 'Parça'}</dt><dd>{ENG_PARTS.length}</dd></div>
          <div><dt>{en ? 'In the lab' : 'Laboratuvarda'}</dt><dd>{withLab.length}</dd></div>
          <div><dt>{en ? 'Levels' : 'Seviye'}</dt><dd>{LEVELS.length}</dd></div>
        </dl>
      </header>

      <Link href="/muhendislik/robotik" className="eng-course" data-testid="eng-course">
        <span className="eng-course-code">ESOF 323</span>
        <span className="eng-level-body">
          <b>{en ? 'University course: Robotics' : 'Üniversite dersi: Robotik'}</b>
          <span className="eng-level-text">{en ? '14 weeks: embedded programming, sensors and filters, PID, kinematics, planning, computer vision, deep learning, ROS 2 and drones. 15 in-browser simulations, Webots and Gazebo projects.' : '14 hafta: gömülü programlama, sensör ve filtreler, PID, kinematik, planlama, bilgisayarlı görü, derin öğrenme, ROS 2 ve drone\'lar. Tarayıcıda 15 simülasyon, Webots ve Gazebo projeleri.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/muhendislik/drone" className="eng-course" data-testid="eng-drone">
        <span className="eng-course-code">DRONE</span>
        <span className="eng-level-body">
          <b>{en ? 'Course: Drone engineering' : 'Ders: Drone mühendisliği'}</b>
          <span className="eng-level-text">{en ? '10 units with parts, simulation and software together: frame, motor, ESC, LiPo and flight controller; thrust, PID and sensor fusion; PX4, MAVLink, MAVSDK and ROS 2. 7 in-browser simulations and a capstone mission with precision landing.' : 'Parça, simülasyon ve yazılım birlikte 10 ünite: gövde, motor, ESC, LiPo ve uçuş kontrolcüsü; itki, PID ve sensör füzyonu; PX4, MAVLink, MAVSDK ve ROS 2. Tarayıcıda 7 simülasyon ve hassas inişli bir bitirme görevi.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/muhendislik/iot" className="eng-course" data-testid="eng-iot">
        <span className="eng-course-code">IOT</span>
        <span className="eng-level-body">
          <b>{en ? 'Course: Internet of Things with the ESP32' : 'Ders: ESP32 ile Nesnelerin İnterneti'}</b>
          <span className="eng-level-text">{en ? '10 units: ESP32 vs Uno, Wi-Fi, REST and JSON, MQTT with QoS, retained messages and last will, sensors to the cloud, remote actuators, a live dashboard, deep sleep, OTA, TLS and BLE. 14 in-browser simulations including a 3D smart greenhouse where MQTT packets fly between devices, and a capstone with a rules engine.' : '10 ünite: ESP32 ile Uno, Wi-Fi, REST ve JSON, QoS, kalıcı mesaj ve son vasiyetle MQTT, sensörden buluta, uzaktan eyleyici, canlı pano, derin uyku, OTA, TLS ve BLE. MQTT paketlerinin cihazlar arasında uçtuğu 3B akıllı sera dahil tarayıcıda 14 simülasyon ve kural motorlu bitirme projesi.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/muhendislik/sensor-ml" className="eng-course" data-testid="eng-sensor-ml">
        <span className="eng-course-code">SENSÖR-ML</span>
        <span className="eng-level-body">
          <b>{en ? 'Course: Machine learning forecasting from sensor data' : 'Ders: Sensör verisinden makine öğrenmesi tahmini'}</b>
          <span className="eng-level-text">{en ? '8 units: logging a time series, cleaning outliers and gaps, the Kalman filter, embedded analysis and visualisation, feature engineering, honest evaluation, C code from trained weights and an anomaly alert. Python runs in the browser on the greenhouse dataset; a 3D greenhouse shows forecast and anomaly.' : '8 ünite: zaman serisi kaydı, aykırı değer ve boşluk temizleme, Kalman süzgeci, gömülü analiz ve görselleştirme, özellik mühendisliği, dürüst değerlendirme, eğitilmiş ağırlıklardan C kodu ve anomali uyarısı. Python, sera veri setiyle tarayıcıda çalışır; 3B serada tahmin ve anomali görünür.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <InstructorCard slug="murat-arslan" labelKey="instructor.eyebrow" />

      <section aria-labelledby="eng-levels">
        <h2 id="eng-levels" className="sr-only">{en ? 'Levels' : 'Seviyeler'}</h2>
        <ol className="eng-path">
          {LEVELS.map((l) => {
            const parts = partsOfLevel(l.n)
            const lab = parts.filter((p) => p.lab).length
            const lt = levelText(l, lang)
            return (
              <li key={l.n}>
                <Link href={`/muhendislik/seviye/${l.n}`} className="eng-level" data-testid={`eng-level-${l.n}`}>
                  <span className="eng-level-n" aria-hidden="true">{pad(l.n)}</span>
                  <span className="eng-level-body">
                    <b>{lt.title}</b>
                    <span className="eng-level-text">{lt.summary}</span>
                    <span className="eng-level-meta">{en ? `${parts.length} parts · ${lab > 0 ? `${lab} in the lab` : 'overview'}` : `${parts.length} parça · ${lab > 0 ? `${lab} laboratuvarda` : 'tanıtım'}`}</span>
                  </span>
                  <Icon name="chevronRight" size={18} className="eng-level-go" />
                </Link>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="panel" aria-labelledby="eng-lab">
        <h2 id="eng-lab" className="panel-title">{en ? 'Open in the lab right away' : 'Laboratuvarda hemen aç'}</h2>
        <p className="muted eng-note">{en ? 'Click a part: the lab opens with it wired to the Uno and with starter code.' : 'Parçaya tıkla: laboratuvar o parça Uno\'ya bağlı ve başlangıç koduyla açılır.'}</p>
        <ul className="eng-chips">
          {withLab.map((p) => (
            <li key={p.slug}><Link className="eng-chip" href={labHref(p)!}><span className="eng-chip-lv">{en ? 'L' : 'S'}{p.level}</span>{partText(p, lang).name}</Link></li>
          ))}
        </ul>
      </section>

      <p className="eng-source">{en ? 'Part information: Hyvex Academy electronics series (Asst. Prof. Dr. Murat Arslan · Hyvex Defense).' : 'Parça bilgileri: Hyvex Academy elektronik serisi (Dr. Öğr. Üyesi Murat Arslan · Hyvex Defense).'}</p>
    </div>
  )
}
