import type { Metadata } from 'next'
import Link from 'next/link'
import { DRONE_SIM_META, type DroneSimId } from '@/components/drone/sim-meta'
import { SIM_META } from '@/components/robotik/sim-meta'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { DRONE_COURSE, PILLAR_TEXT, UNITS } from '@/lib/drone/course'
import { DRONE_PARTS } from '@/lib/drone/parts'
import { CAPSTONE } from '@/lib/drone/project'

export const metadata: Metadata = {
  title: 'Drone mühendisliği',
  description: 'Büyükler için drone dersi: parça, simülasyon ve yazılım birlikte. 10 ünite, tarayıcıda 7 simülasyon, PX4, MAVLink, MAVSDK ve ROS 2.',
}

export default async function DroneDersi() {
  const lang = await getLocale()
  const en = lang === 'en'
  const c = DRONE_COURSE[lang]
  const sims = Object.keys(DRONE_SIM_META) as DroneSimId[]
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{c.title}</span>
      </nav>
      <header className="eng-hero">
        <p className="eyebrow">{en ? 'For adults · parts + simulation + software' : 'Büyükler için · parça + simülasyon + yazılım'}</p>
        <h1>{c.title}</h1>
        <p className="lead">{c.lede}</p>
        <p className="dr-meta">{c.level}. {c.prereq}</p>
        <dl className="eng-stats">
          <div><dt>{en ? 'Units' : 'Ünite'}</dt><dd>{UNITS.length}</dd></div>
          <div><dt>{en ? 'Simulations' : 'Simülasyon'}</dt><dd>{sims.length}</dd></div>
          <div><dt>{en ? 'Parts' : 'Parça'}</dt><dd>{DRONE_PARTS.length}</dd></div>
        </dl>
        <p className="rb-actions">
          <Link className="btn btn-primary" href="/muhendislik/drone/unite/1" data-testid="drone-start">{en ? 'Start with unit 1' : '1. üniteyle başla'}</Link>
          <Link className="btn btn-ghost" href="/muhendislik/drone/simulasyon">{en ? 'All simulations' : 'Tüm simülasyonlar'}</Link>
        </p>
      </header>

      <section aria-labelledby="dr-three">
        <h2 id="dr-three">{en ? 'Three pillars, together' : 'Üç ayak, birlikte'}</h2>
        <div className="dr-pillars">
          <Link href="/muhendislik/drone/parcalar" className="dr-pillar" data-testid="drone-pillar-parts">
            <small>{PILLAR_TEXT.parca[lang]}</small>
            <b>{en ? 'What a drone is made of' : 'Drone neyden yapılır'}</b>
            <span>{en ? 'Frame, brushless motor, ESC, propeller, LiPo, PDB/BEC, flight controller, IMU, barometer, compass, GPS, receiver, telemetry, camera. Linked to the Hyvex parts, 3D models and lab kits.' : 'Gövde, fırçasız motor, ESC, pervane, LiPo, PDB/BEC, uçuş kontrolcüsü, IMU, barometre, pusula, GPS, alıcı, telemetri, kamera. Hyvex parçalarına, 3B modellere ve laboratuvar kitlerine bağlı.'}</span>
          </Link>
          <Link href="/muhendislik/drone/simulasyon" className="dr-pillar" data-testid="drone-pillar-sims">
            <small>{PILLAR_TEXT.sim[lang]}</small>
            <b>{en ? 'Physics you can turn the knobs of' : 'Düğmeleri çevrilebilen fizik'}</b>
            <span>{en ? 'Thrust-to-weight, flight time, altitude and attitude PID, motor mixer, sensor fusion and a waypoint mission with precision landing. Real units, deterministic results.' : 'İtki/ağırlık, uçuş süresi, irtifa ve yönelim PID\'i, motor karıştırıcı, sensör füzyonu ve hassas inişli ara nokta görevi. Gerçek birimler, deterministik sonuçlar.'}</span>
          </Link>
          <Link href="/muhendislik/drone/unite/8" className="dr-pillar" data-testid="drone-pillar-software">
            <small>{PILLAR_TEXT.yazilim[lang]}</small>
            <b>{en ? 'Code that flies' : 'Uçan kod'}</b>
            <span>{en ? 'PID and filters in C++ and Python, PX4 architecture and flight modes, MAVLink, MAVSDK-Python, ROS 2 over uXRCE-DDS, PX4 SITL + Gazebo, ArUco precision landing, failsafes.' : 'C++ ve Python\'da PID ve süzgeçler, PX4 mimarisi ve uçuş kipleri, MAVLink, MAVSDK-Python, uXRCE-DDS ile ROS 2, PX4 SITL + Gazebo, ArUco ile hassas iniş, failsafe\'ler.'}</span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="dr-plan">
        <h2 id="dr-plan">{en ? 'Units' : 'Üniteler'}</h2>
        <div className="rb-scroll">
          <table className="rb-table">
            <thead><tr><th>{en ? 'Unit' : 'Ünite'}</th><th>{en ? 'Topic' : 'Konu'}</th><th>{en ? 'Pillars' : 'Ayaklar'}</th><th>{en ? 'Simulations' : 'Simülasyonlar'}</th></tr></thead>
            <tbody>
              {UNITS.map((u) => (
                <tr key={u.n}>
                  <td className="n">{u.n}</td>
                  <td><Link href={`/muhendislik/drone/unite/${u.n}`} data-testid={`drone-unit-${u.n}`}>{u[lang].title}</Link><br /><span className="rb-tcell">{u[lang].summary}</span></td>
                  <td><span className="dr-tags">{u.pillars.map((p) => <span key={p} className="eng-tag">{PILLAR_TEXT[p][lang]}</span>)}</span></td>
                  <td className="rb-tcell">{[...u.sims.map((s) => DRONE_SIM_META[s][lang].title), ...(u.esofSims ?? []).map((s) => `${SIM_META[s][lang].title} (ESOF 323)`)].join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rb-two">
        <section className="panel" aria-labelledby="dr-cap">
          <h2 id="dr-cap" className="panel-title">{en ? 'Capstone project' : 'Bitirme projesi'}</h2>
          <p>{CAPSTONE[lang].summary}</p>
          <Link className="btn btn-primary" href="/muhendislik/drone/proje" data-testid="drone-capstone">{en ? 'Project and deliverables' : 'Proje ve teslimler'} <Icon name="arrowRight" size={16} /></Link>
        </section>
        <section className="panel" aria-labelledby="dr-tools">
          <h2 id="dr-tools" className="panel-title">{en ? 'Tools (all in simulation)' : 'Araçlar (hepsi simülasyonda)'}</h2>
          <ul className="eng-list">
            <li>{en ? 'This platform: seven drone simulations, ESOF 323 quadrotor and ROS 2 simulations, the Uno circuit lab (ESC, LiPo, IMU, barometer kits)' : 'Bu platform: yedi drone simülasyonu, ESOF 323 quadrotor ve ROS 2 simülasyonları, Uno devre laboratuvarı (ESC, LiPo, IMU, barometre kitleri)'}</li>
            <li>{en ? 'Advanced: PX4 SITL + Gazebo Harmonic, QGroundControl' : 'İleri: PX4 SITL + Gazebo Harmonic, QGroundControl'}</li>
            <li>{en ? 'Python with MAVSDK, pymavlink, OpenCV; ROS 2 Jazzy/Humble with px4_msgs' : 'MAVSDK, pymavlink ve OpenCV ile Python; px4_msgs ile ROS 2 Jazzy/Humble'}</li>
          </ul>
        </section>
      </div>

      <section className="panel" aria-labelledby="dr-rel">
        <h2 id="dr-rel" className="panel-title">{en ? 'Related' : 'İlgili'}</h2>
        <ul className="eng-list">
          <li><Link href="/muhendislik/robotik/hafta/13">{en ? 'ESOF 323, week 13: aerial robots, flight control and swarms' : 'ESOF 323, 13. hafta: hava robotları, uçuş denetimi ve sürüler'}</Link></li>
          <li><Link href="/muhendislik/robotik/proje/drone-gorevi">{en ? 'ESOF 323 term project: autonomous drone mission' : 'ESOF 323 dönem projesi: otonom drone görevi'}</Link></li>
          <li><Link href="/muhendislik/seviye/7">{en ? 'Engineering path, level 7: drone and autonomy preparation' : 'Mühendislik yolu, 7. seviye: drone ve otonomi hazırlığı'}</Link></li>
        </ul>
      </section>
    </div>
  )
}
