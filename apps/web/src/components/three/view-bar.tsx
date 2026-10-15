'use client'
// 3B / 2B görünüm seçimi ve kamera kipi. Tercih tarayıcıda saklanır; WebGL yoksa 2B'de kalır ve seçici gösterilmez.
import { useEffect, useState } from 'react'
import { hasWebGL, type CamMode } from './core'

const KEY = 'ask:view3d:v1'

export interface ViewState { is3d: boolean; supported: boolean; mode: CamMode; set3d(v: boolean): void; setMode(m: CamMode): void }

export function useView3D(): ViewState {
  const [supported, setSupported] = useState(false)
  const [is3d, setIs3d] = useState(false)
  const [mode, setMode] = useState<CamMode>('genel')
  useEffect(() => {
    const ok = hasWebGL()
    setSupported(ok)
    let pref = true
    try { pref = localStorage.getItem(KEY) !== '0' } catch { /* gizli pencere */ }
    setIs3d(ok && pref)
  }, [])
  const set3d = (v: boolean) => {
    setIs3d(v)
    try { localStorage.setItem(KEY, v ? '1' : '0') } catch { /* gizli pencere */ }
  }
  return { is3d: supported && is3d, supported, mode, set3d, setMode }
}

const MODES: [CamMode, string, string][] = [
  ['genel', 'Genel', 'Sürükleyerek döndür, tekerlekle yakınlaştır'],
  ['takip', 'Takip', 'Kamera robotu arkadan izler'],
  ['ustten', 'Üstten', 'Kuşbakışı'],
]

/** `cams`: kamera kipleri gösterilsin mi (yalnız arenada gezen robotlar için anlamlı). */
export function ViewBar({ v, cams = true }: { v: ViewState; cams?: boolean }) {
  if (!v.supported) return null
  return (
    <div className="v3-bar" role="group" aria-label="Görünüm">
      <div className="v3-seg">
        <button type="button" aria-pressed={v.is3d} onClick={() => v.set3d(true)} data-testid="view-3d">3B</button>
        <button type="button" aria-pressed={!v.is3d} onClick={() => v.set3d(false)} data-testid="view-2d">2B</button>
      </div>
      {v.is3d && cams && (
        <div className="v3-seg">
          {MODES.map(([m, label, tip]) => (
            <button key={m} type="button" title={tip} aria-pressed={v.mode === m} onClick={() => v.setMode(m)} data-testid={`view-cam-${m}`}>{label}</button>
          ))}
        </div>
      )}
    </div>
  )
}
