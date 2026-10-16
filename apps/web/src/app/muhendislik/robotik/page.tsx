import type { Metadata } from 'next'
import Link from 'next/link'
import { SIM_META } from '@/components/robotik/sim-meta'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { COURSE, WEEKS } from '@/lib/robotik/course'

export const metadata: Metadata = { title: `${COURSE.code} Robotik`, description: 'ESOF 323 Robotics: üniversite robotik dersi, 14 hafta, tarayıcıda simülasyonlar.' }

const TRACKS = {
  tr: [
    ['Otonom kara aracı', 'Webots', 'Şerit takibi, engelden kaçınma ve trafik işareti sınıflandırma (CV + DL), PID direksiyon.'],
    ['Otonom drone görevi', 'Gazebo + PX4 SITL', 'Kaskad denetim, MAVLink ile ara nokta görevi ve işaretçiyle (ArUco) hassas iniş.'],
    ['Görsel kılavuzlu robot kol', 'Webots', 'Kamerayla nesne bulma, ters kinematik ve al-bırak; durum makinesiyle görev akışı.'],
  ],
  en: [
    ['Autonomous ground vehicle', 'Webots', 'Lane following, obstacle avoidance and traffic sign classification (CV + DL) with PID steering.'],
    ['Autonomous drone mission', 'Gazebo + PX4 SITL', 'Cascaded control, a waypoint mission over MAVLink and precision landing on a marker (ArUco).'],
    ['Vision-guided robot arm', 'Webots', 'Find objects with a camera, solve inverse kinematics and pick and place, with a state machine for the task flow.'],
  ],
} as const

export default async function Robotik() {
  const lang = await getLocale()
  const en = lang === 'en'
  const c = COURSE[lang]
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{COURSE.code}</span>
      </nav>
      <header className="rb-hero">
        <p className="rb-code-big">{COURSE.code}</p>
        <div>
          <h1>{c.title}</h1>
          <p className="rb-meta">{COURSE.instructor} · {c.university} · {c.term}</p>
          <p className="lead">{c.lede}</p>
          <p className="rb-actions">
            <Link className="btn btn-primary" href="/muhendislik/robotik/hafta/1">{en ? 'Start with week 1' : '1. haftayla başla'}</Link>
            <Link className="btn btn-ghost" href="/muhendislik/robotik/simulasyon">{en ? 'All simulations' : 'Tüm simülasyonlar'}</Link>
          </p>
        </div>
      </header>

      <section aria-labelledby="rb-plan">
        <h2 id="rb-plan">{en ? 'Weekly plan' : 'Haftalık plan'}</h2>
        <div className="rb-scroll">
          <table className="rb-table">
            <thead><tr><th>{en ? 'Week' : 'Hafta'}</th><th>{en ? 'Topic' : 'Konu'}</th><th>{en ? 'Tools' : 'Araçlar'}</th><th>{en ? 'Simulations' : 'Simülasyonlar'}</th></tr></thead>
            <tbody>
              {WEEKS.map((w) => (
                <tr key={w.n} className={w.exam ? 'exam' : undefined}>
                  <td className="n">{w.n}</td>
                  <td><Link href={`/muhendislik/robotik/hafta/${w.n}`}>{w[lang].title}</Link></td>
                  <td className="rb-tcell">{w[lang].tools}</td>
                  <td className="rb-tcell">{w.sims.map((s) => SIM_META[s][lang].title).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rb-two">
        <section className="panel" aria-labelledby="rb-grade">
          <h2 id="rb-grade" className="panel-title">{en ? 'Assessment' : 'Değerlendirme'}</h2>
          <div className="rb-grade"><div style={{ flex: 40 }}><b>40%</b><span>{en ? 'Midterm component' : 'Ara dönem'}</span></div><div style={{ flex: 60 }}><b>60%</b><span>{en ? 'Final exam' : 'Final sınavı'}</span></div></div>
          <dl className="value-list">
            <div><dt>{en ? 'Midterm exam, week 8' : 'Ara sınav, 8. hafta'}</dt><dd><b>20%</b></dd></div>
            <div><dt>{en ? 'Term project (proposal, progress, demo, report)' : 'Dönem projesi (öneri, ara kontrol, sunum, rapor)'}</dt><dd><b>15%</b></dd></div>
            <div><dt>{en ? 'Lab tasks and homework' : 'Laboratuvar görevleri ve ödevler'}</dt><dd><b>5%</b></dd></div>
          </dl>
        </section>
        <section className="panel" aria-labelledby="rb-tools">
          <h2 id="rb-tools" className="panel-title">{en ? 'Tools (all in simulation)' : 'Araçlar (hepsi simülasyonda)'}</h2>
          <ul className="eng-list">
            <li>{en ? 'This platform: browser simulations and the Uno circuit lab with Hyvex parts' : 'Bu platform: tarayıcı simülasyonları ve Hyvex parçalı Uno devre laboratuvarı'}</li>
            <li>{en ? 'Wokwi for ESP32 and STM32' : 'ESP32 ve STM32 için Wokwi'}</li>
            <li>{en ? 'Webots for the vehicle and arm projects' : 'Araç ve kol projeleri için Webots'}</li>
            <li>{en ? 'Gazebo with PX4 SITL and ROS 2 Jazzy for drones' : 'Drone için Gazebo, PX4 SITL ve ROS 2 Jazzy'}</li>
            <li>{en ? 'Python with NumPy, OpenCV and PyTorch' : 'NumPy, OpenCV ve PyTorch ile Python'}</li>
          </ul>
        </section>
      </div>

      <section aria-labelledby="rb-proj">
        <h2 id="rb-proj">{en ? 'Term project tracks' : 'Dönem projesi kolları'}</h2>
        <p className="muted">{en ? 'Teams of three or four choose one track. Milestones: proposal in week 8, progress check in week 11, demo and report in week 14.' : 'Üç-dört kişilik takımlar bir kol seçer. Ara teslimler: öneri 8. hafta, ara kontrol 11. hafta, sunum ve rapor 14. hafta.'}</p>
        <ul className="eng-grid">
          {TRACKS[lang].map(([title, sim, desc]) => (
            <li key={title}><div className="eng-card"><span className="eng-card-top"><span className="eng-tag eng-tag-lab">{sim}</span></span><b>{title}</b><span className="eng-card-use">{desc}</span></div></li>
          ))}
        </ul>
      </section>

      <section className="panel" aria-labelledby="rb-read">
        <h2 id="rb-read" className="panel-title">{en ? 'Reading' : 'Okuma listesi'}</h2>
        <ul className="eng-list">
          <li>Siegwart, Nourbakhsh, Scaramuzza: <i>Introduction to Autonomous Mobile Robots</i></li>
          <li>Lynch, Park: <i>Modern Robotics</i> {en ? '(free online edition)' : '(ücretsiz çevrimiçi sürüm)'}</li>
          <li>Thrun, Burgard, Fox: <i>Probabilistic Robotics</i></li>
          <li>Corke: <i>Robotics, Vision and Control</i></li>
          <li>{en ? 'PX4, ArduPilot, ROS 2 and Webots official documentation' : 'PX4, ArduPilot, ROS 2 ve Webots resmi belgeleri'}</li>
        </ul>
      </section>
    </div>
  )
}
