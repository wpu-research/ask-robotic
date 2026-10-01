import type { Metadata } from 'next'
import { ArenaEditor } from '@/components/arena/arena-editor'
import { FREE_STARTERS, freeScenes } from '@/lib/arena/free'

export const metadata: Metadata = { title: 'Robot arenası' }

export default function Arena() {
  const scenes = freeScenes()
  return (
    <div className="container" style={{ maxWidth: 1280 }}>
      <div className="page-head">
        <p className="eyebrow">Serbest çalışma</p>
        <h1>Robot arenası</h1>
        <p className="muted" style={{ maxWidth: '64ch' }}>
          Arduino C++ kodunu yaz, derle ve sanal robotu üstten görünüşlü arenada sür. Çizgi pisti, engelli alan, tampon duvarı, labirent ve düz yol arasında seçim yap. Çalışman bu tarayıcıda saklanır.
        </p>
      </div>
      <div style={{ paddingBottom: 56 }}>
        <ArenaEditor scene={scenes[0]} scenes={scenes} starters={FREE_STARTERS} initialCode={FREE_STARTERS[scenes[0].id]} storageKey="ask:arena:sandbox" />
      </div>
    </div>
  )
}
