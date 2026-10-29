import type { Metadata } from 'next'
import Link from 'next/link'
import { MujocoLab } from '@/components/mujoco/mujoco-lab'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import './mujoco.css'

export const metadata: Metadata = { title: 'MuRoKo fizik laboratuvarı' }

export default async function MujocoPage() {
  const en = (await getLocale()) === 'en'
  const L = (tr: string, e: string) => (en ? e : tr)
  return (
    <div className="page eng">
      <nav aria-label={L('Konum', 'Breadcrumb')} className="crumbs">
        <Link href="/muhendislik">{L('Mühendislik yolu', 'Engineering path')}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">MuRoKo</span>
      </nav>
      <header className="page-title">
        <h1>{L('MuRoKo fizik laboratuvarı', 'MuRoKo physics lab')}</h1>
        <p className="lead">{L(
          'MuRoKo, MuJoCo fizik motoruyla çalışır: robotik araştırmacıların kullandığı gerçek motor, kurulum olmadan tarayıcında. Hazır sahneyi çalıştır, kaydırıcılarla motorları sür, sonra modelin XML\'ini değiştirip yeniden derle.',
          'MuRoKo runs on MuJoCo, the physics engine robotics researchers use, in your browser with no install. Run a preset, drive the motors with sliders, then edit the model XML and recompile.')}</p>
      </header>
      <MujocoLab />
      <section className="mj-learn">
        <h2>{L('Burada ne öğrenirsin?', 'What will you learn here?')}</h2>
        <ul>
          <li>{L('Bir robotun gövde, eklem ve motor ağacı olarak tarif edilmesi (MJCF).', 'Describing a robot as a tree of bodies, joints and actuators (MJCF).')}</li>
          <li>{L('Konum motoru ile kuvvet motoru arasındaki fark: kol ve arabalı sarkaç.', 'Position vs. force actuators: the arm and the cart-pole.')}</li>
          <li>{L('Kaos, sürtünme ve çarpışma: küçük bir değişiklik neden her şeyi değiştirir?', 'Chaos, friction and contact: why a tiny change alters everything.')}</li>
          <li>{L('Simülasyonda denenen kontrolün gerçek robota taşınması (sim-to-real) fikri.', 'The sim-to-real idea: test control in simulation before real hardware.')}</li>
        </ul>
      </section>
    </div>
  )
}
