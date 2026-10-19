'use client'
// Ünite tabanlı derslerin 3B sahne kutusu. three.js, sahne altyapısı (ML projelerinin stage3d'si: DPR ≤ 1,5, görünmezken
// döngü durur, kaldırılınca her şey serbest bırakılır, orbit/pinch/zoom) ve sahne modülü yalnız istemcide, dinamik yüklenir.
// Sahne durumu dışarıdan, saf TS mantığından gelir; sahne yalnız çizer.
import { useEffect, useRef, useState } from 'react'
import type { P3Stage } from '@/components/ml/projeler/stage3d'
import type { Lang } from './ui'

export interface KursScene<S> { frame(state: S, dt: number): void; dispose?(): void }
export type KursMount<S> = (stage: P3Stage, lang: Lang) => KursScene<S>
export type SceneLoader<S> = () => Promise<{ mount: KursMount<S> }>

export function Scene3D<S>({ load, state, lang, testid }: { load: SceneLoader<S>; state: S; lang: Lang; testid: string }) {
  const host = useRef<HTMLDivElement>(null)
  const live = useRef(state)
  live.current = state
  const loader = useRef(load)
  const [gl, setGl] = useState<'wait' | 'ok' | 'none'>('wait')
  const en = lang === 'en'

  useEffect(() => {
    let disposed = false
    let cleanup: (() => void) | null = null
    ;(async () => {
      const [{ createP3Stage, webglOk }, mod] = await Promise.all([import('@/components/ml/projeler/stage3d'), loader.current()])
      if (disposed || !host.current) return
      if (!webglOk()) { setGl('none'); return }
      const stage = createP3Stage(host.current, { shadows: true, background: 0xe6eef2 })
      const sc = mod.mount(stage, lang)
      stage.onFrame = (dt) => sc.frame(live.current, dt)
      sc.frame(live.current, 0)
      setGl('ok')
      cleanup = () => { sc.dispose?.(); stage.dispose() }
    })()
    return () => { disposed = true; cleanup?.() }
  }, [lang])

  return (
    <div className="ks-3d-wrap">
      <div className="ks-3d" ref={host} data-testid={testid} data-gl={gl}>
        {gl === 'none' && <p className="ks-3d-msg">{en ? 'The 3D view needs WebGL; the readings below still update.' : '3B görünüm için WebGL gerekli; aşağıdaki değerler yine de güncellenir.'}</p>}
        {gl === 'wait' && <p className="ks-3d-msg">{en ? 'Loading the 3D scene…' : '3B sahne yükleniyor…'}</p>}
      </div>
      <p className="ks-3d-hint">{en ? 'Drag: orbit · pinch / wheel: zoom · right drag: pan' : 'Sürükle: döndür · iki parmak / tekerlek: yakınlaş · sağ tuş: kaydır'}</p>
    </div>
  )
}
