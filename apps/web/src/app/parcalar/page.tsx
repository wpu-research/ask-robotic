import type { Metadata } from 'next'
import { PartsIndex } from '@/components/learn/parts-index'
import { PART_GUIDES } from '@/lib/parca-rehberi'

export const metadata: Metadata = { title: 'Parçalar' }

export default function Parcalar() {
  return (
    <div className="page">
      <header className="page-title">
        <h1>Parça ansiklopedisi</h1>
        <p className="muted">Laboratuvardaki parçaların ne işe yaradığı, nasıl çalıştığı, nasıl bağlandığı ve sık yapılan hatalar. Pilot aşamada {PART_GUIDES.length} parça yazıldı; diğerleri dersler yazıldıkça eklenecek.</p>
      </header>
      <PartsIndex guides={[...PART_GUIDES]} />
    </div>
  )
}
