'use client'
// Drone dersi 3B uçuş sahnesi kutusu: three.js ve sahne modülü yalnız istemcide, dinamik import ile yüklenir. Piksel oranı ≤ 1,5,
// sekme gizliyken / ekran dışındayken döngü durur, kaldırılınca her şey serbest bırakılır (createP3Stage). Hareket azaltma
// tercihinde kendiliğinden oynamaz. Parametreler 2B simülasyonun denetimlerinden SimLink ile gelir.
import { useEffect, useRef, useState } from 'react'
import type { SimLink } from './link'
import type { DroneScene } from './scene3d/scenes'
import type { CamMode } from './scene3d/kit'

const SPEEDS = [0.5, 1, 2, 4, 8]
const CAMS: Array<[CamMode, string, string]> = [['chase', 'Takip', 'Chase'], ['top', 'Üstten', 'Top'], ['free', 'Serbest', 'Free']]

export function Drone3D({ id, link, lang, cfg }: { id: string; link: SimLink; lang: 'tr' | 'en'; cfg?: Record<string, string> }) {
  const t = (tr: string, en: string) => (lang === 'en' ? en : tr)
  const host = useRef<HTMLDivElement>(null)
  const hudRef = useRef<HTMLPreElement>(null)
  const [gl, setGl] = useState<'wait' | 'ok' | 'none'>('wait')
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [cam, setCam] = useState<CamMode>('free')
  const [ctl, setCtl] = useState<Record<string, string>>({})
  const [scene, setScene] = useState<DroneScene | null>(null)
  const live = useRef({ playing, speed })
  live.current = { playing, speed }
  const cfgKey = JSON.stringify(cfg ?? {})

  useEffect(() => {
    let disposed = false, cleanup: (() => void) | null = null
    ;(async () => {
      const [{ createP3Stage, webglOk }, { DRONE_SCENES }] = await Promise.all([import('@/components/ml/projeler/stage3d'), import('./scene3d/scenes')])
      if (disposed || !host.current) return
      const mount = DRONE_SCENES[id]
      if (!mount || !webglOk()) { setGl('none'); return }
      const stage = createP3Stage(host.current, { shadows: false })
      const sc = mount({ s: stage, link, lang, cfg: JSON.parse(cfgKey) })
      sc.cam.onUser = () => setCam('free')
      let last = 0
      stage.onFrame = (dt) => {
        const { playing: p, speed: v } = live.current
        sc.frame(dt * v, p, dt)
        const n = performance.now()
        if (n - last > 150 && hudRef.current) { last = n; hudRef.current.textContent = sc.hud() }
      }
      if (hudRef.current) { sc.frame(0, false, 0); hudRef.current.textContent = sc.hud() }
      setScene(sc)
      setSpeed(sc.speed ?? 1)
      setCtl(Object.fromEntries((sc.controls ?? []).map((c) => [c.key, c.value])))
      setGl('ok')
      // hareket azaltma tercihi yoksa kendiliğinden oynar
      if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setPlaying(true)
      cleanup = () => { sc.dispose?.(); stage.dispose() }
    })()
    return () => { disposed = true; cleanup?.(); setScene(null) }
  }, [id, link, lang, cfgKey])

  const pickCam = (m: CamMode) => { setCam(m); scene?.cam.setMode(m) }

  return (
    <div className="dr-3d" data-testid={`drone-3d-${id}`} data-gl={gl}>
      <div className="dr-3d-view" ref={host}>
        {gl === 'wait' && <p className="dr-3d-msg">{t('3B sahne yükleniyor…', 'Loading the 3D scene…')}</p>}
        {gl === 'none' && <p className="dr-3d-msg">{t('3B görünüm için WebGL gerekli; aşağıdaki 2B grafikler yine de çalışır.', '3D view needs WebGL; the 2D charts below still work.')}</p>}
        {gl === 'ok' && <pre className="dr-3d-hud" ref={hudRef} aria-live="off" />}
      </div>
      {gl === 'ok' && scene && (
        <div className="dr-3d-bar">
          <button type="button" className="sbtn" data-testid="drone-3d-play" onClick={() => setPlaying((x) => !x)}>{playing ? t('Duraklat', 'Pause') : t('Oynat', 'Play')}</button>
          <button type="button" className="sbtn ghost" onClick={() => scene.restart()}>{t('Baştan', 'Restart')}</button>
          <div className="dr-seg" role="group" aria-label={t('Hız', 'Speed')}>
            {SPEEDS.map((v) => <button key={v} type="button" aria-pressed={speed === v} onClick={() => setSpeed(v)}>{String(v).replace('.', lang === 'en' ? '.' : ',')}×</button>)}
          </div>
          <div className="dr-seg" role="group" aria-label={t('Kamera', 'Camera')}>
            {CAMS.map(([m, tr, en]) => <button key={m} type="button" aria-pressed={cam === m} onClick={() => pickCam(m)} data-testid={`drone-3d-cam-${m}`}>{t(tr, en)}</button>)}
          </div>
          {(scene.controls ?? []).map((c) => (
            <label key={c.key} className="dr-3d-sel">
              <span>{c.label[lang]}</span>
              <select value={ctl[c.key] ?? c.value} onChange={(e) => { const v = e.target.value; setCtl((o) => ({ ...o, [c.key]: v })); scene.set?.(c.key, v) }}>
                {c.options.map(([v, l]) => <option key={v} value={v}>{l[lang]}</option>)}
              </select>
            </label>
          ))}
          <span className="dr-3d-hint">{t('Sürükle: döndür · iki parmak / tekerlek: yakınlaş', 'Drag: orbit · pinch / wheel: zoom')}</span>
        </div>
      )}
    </div>
  )
}
