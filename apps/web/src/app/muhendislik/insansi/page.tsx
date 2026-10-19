import type { Metadata } from 'next'
import Link from 'next/link'
import { InsansiLab } from '@/components/insansi/insansi-lab'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === 'en'
  return {
    title: en ? 'Humanoid robot: advanced' : 'İnsansı Robot: ileri seviye',
    description: en
      ? 'A 3D biped in the browser: forward kinematics, two-link inverse kinematics, center of mass and support polygon, an LIPM walking gait with joint charts, servo limits and a pose program.'
      : 'Tarayıcıda 3B iki ayaklı robot: ileri kinematik, iki bağlı ters kinematik, ağırlık merkezi ve destek çokgeni, eklem grafikli LIPM yürüyüşü, servo sınırları ve poz programı.',
  }
}

export default async function InsansiPage() {
  const en = (await getLocale()) === 'en'
  return (
    <div className="page page-tool">
      <nav className="crumbs" aria-label={en ? 'Breadcrumb' : 'Konum'}>
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <span>{en ? 'Humanoid robot' : 'İnsansı robot'}</span>
      </nav>
      <header className="page-title">
        <p className="eyebrow">{en ? 'Advanced · teens and adults' : 'İleri seviye · gençler ve yetişkinler'}</p>
        <h1>{en ? 'Humanoid robot: kinematics, balance and walking' : 'İnsansı robot: kinematik, denge ve yürüyüş'}</h1>
        <p className="muted">
          {en
            ? 'A 60 cm, 16-servo biped. Move the joints (forward kinematics), drag a foot target (inverse kinematics), watch the center of mass against the support polygon, generate a walking gait with the linear inverted pendulum and sequence poses with blocks or code.'
            : '60 cm boyunda, 16 servolu iki ayaklı robot. Eklemleri oynat (ileri kinematik), ayak hedefini sürükle (ters kinematik), ağırlık merkezini destek çokgeniyle karşılaştır, doğrusal ters sarkaçla yürüyüş üret ve pozları blok ya da kodla sırala.'}
        </p>
      </header>
      <div className="tool-body">
        <InsansiLab />
      </div>
    </div>
  )
}
