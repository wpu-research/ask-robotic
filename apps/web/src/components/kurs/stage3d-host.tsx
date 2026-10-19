'use client'
// OpenCV/PyTorch derslerindeki 3B sahnelerin ortak kabı. three.js ve ML projelerinin sahne altyapısı (stage3d: piksel oranı
// en çok 1,5; sekme ya da tuval görünmezken döngü durur; kaldırılınca dispose; orbit/pinch/zoom) yalnız istemcide, dinamik
// olarak yüklenir. Sahne durumu saf TS mantığından gelir; 3B yalnız görselleştirmedir. WebGL yoksa açıklayıcı bir not çıkar.
import { useEffect, useRef, useState } from 'react'
import type { P3Stage } from '@/components/ml/projeler/stage3d'
import { tx, type L } from '@/components/opencv/cv-ui'

export type Three = typeof import('three')
/** Sahneyi kurar; her karede `frame` çağrılır. `update` dış durum değişince (kaydırıcı) çağrılır. */
export type Mount3D<S> = (T: Three, stage: P3Stage, state: S) => { update(state: S): void; frame?(dt: number): void; dispose?(): void }

export const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function Stage3DHost<S>({ lang, mount, state, view, label, height = 320, testId }: {
  lang: L; mount: Mount3D<S>; state: S; view: { pos: [number, number, number]; target: [number, number, number] }; label: string; height?: number; testId?: string
}) {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<ReturnType<Mount3D<S>> | null>(null)
  const live = useRef(state); live.current = state
  const [status, setStatus] = useState<'loading' | 'ok' | 'nogl'>('loading')
  useEffect(() => {
    let alive = true, stage: P3Stage | null = null
    ;(async () => {
      const [T, s3] = await Promise.all([import('three'), import('@/components/ml/projeler/stage3d')])
      if (!alive || !host.current) return
      if (!s3.webglOk()) { setStatus('nogl'); return }
      stage = s3.createP3Stage(host.current, { background: 0xe8edf3 })
      stage.view(view.pos, view.target)
      api.current = mount(T, stage, live.current)
      stage.onFrame = (dt) => api.current?.frame?.(dt)
      setStatus('ok')
    })()
    return () => { alive = false; api.current?.dispose?.(); api.current = null; stage?.dispose() }
  }, [mount]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { api.current?.update(state) }, [state])
  return (
    <figure className="kurs-3d" data-testid={testId}>
      <div ref={host} className="kurs-3d-host" style={{ height }} role="img" aria-label={label} data-state={status} />
      <figcaption>
        {status === 'nogl' ? tx(lang, 'Bu tarayıcıda WebGL yok; 3B görünüm gösterilemiyor (2B araçlar çalışır).', 'WebGL is not available in this browser; the 3D view cannot be shown (the 2D tools still work).')
          : `${label} · ${tx(lang, 'sürükle: döndür, iki parmak / tekerlek: yakınlaş', 'drag: rotate, two fingers / wheel: zoom')}`}
      </figcaption>
    </figure>
  )
}
