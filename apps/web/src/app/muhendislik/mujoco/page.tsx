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
          'Bir robot seç, bloklarla ya da Python ile programla, hedefleri tamamla. Fizik tarayıcında gerçek zamanlı çalışır.',
          'Pick a robot, program it with blocks or Python and complete the goals. The physics runs live in your browser.')}</p>
      </header>
      <MujocoLab />
      <section className="mj-learn">
        <h2>{L('Burada ne öğrenirsin?', 'What will you learn here?')}</h2>
        <ul>
          <li>{L('Bir robotun gövde, eklem ve motor ağacı olarak tarif edilmesi (MJCF).', 'Describing a robot as a tree of bodies, joints and actuators (MJCF).')}</li>
          <li>{L('Gerçek robotların (kol, dört bacaklı, el) eklem ve motor yapısı; sensörlerden okuyup motoru sürmek.', 'The joint and motor structure of real robots (arm, quadruped, hand); reading sensors to drive the motors.')}</li>
          <li>{L('Hedefleri tamamlamak için bloklarla ya da Python ile geri beslemeli (sensörden okuyup tepki veren) kontrol yazmak.', 'Writing feedback control (read a sensor, react) with blocks or Python to complete the goals.')}</li>
          <li>{L('Simülasyonda denenen kontrolün gerçek robota taşınması (sim-to-real) fikri.', 'The sim-to-real idea: test control in simulation before real hardware.')}</li>
        </ul>
      </section>
    </div>
  )
}
