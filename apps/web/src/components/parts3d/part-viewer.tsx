'use client'
// Parça sayfasındaki döndürülebilir 3B model: sürükle döndür, tekerlekle yakınlaş; dokunulana kadar kendi döner.
import { useEffect, useRef, useState } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { hasWebGL } from '../three/core'
import { makeRenderer, makeScene } from './stage'

export function PartViewer({ slug, group, name, lang = 'tr' }: { slug: string; group: string; name: string; lang?: 'tr' | 'en' }) {
  const host = useRef<HTMLDivElement>(null)
  const [ok, setOk] = useState(true)
  useEffect(() => {
    const el = host.current!
    if (!hasWebGL()) { setOk(false); return }
    const canvas = document.createElement('canvas'); el.appendChild(canvas)
    const renderer = makeRenderer(canvas)
    const w = () => el.clientWidth, h = () => el.clientHeight
    renderer.setSize(w(), h(), false)
    const ps = makeScene(renderer, slug, group, w() / h())
    const controls = new OrbitControls(ps.camera, canvas)
    const ty = ((ps.model.userData.height as number) ?? 1) * 0.35
    controls.target.set(0, ty, 0); controls.enableDamping = true; controls.autoRotate = true; controls.autoRotateSpeed = 1.6
    controls.minDistance = 1.4; controls.maxDistance = 9; controls.maxPolarAngle = Math.PI * 0.49
    controls.addEventListener('start', () => { controls.autoRotate = false })
    let raf = 0
    const tick = () => { controls.update(); renderer.render(ps.scene, ps.camera); raf = requestAnimationFrame(tick) }
    tick()
    const ro = new ResizeObserver(() => { renderer.setSize(w(), h(), false); ps.camera.aspect = w() / h(); ps.camera.updateProjectionMatrix() })
    ro.observe(el)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); ps.dispose(); renderer.dispose(); canvas.remove() }
  }, [slug, group])
  return (
    <figure className="p3d" data-testid="part-viewer">
      <div ref={host} className="p3d-stage" role="img" aria-label={lang === 'en' ? `3D model of ${name}` : `${name} 3B modeli`} />
      <figcaption>{ok ? (lang === 'en' ? 'Drag to rotate · scroll to zoom · illustrative model' : 'Sürükle: döndür · tekerlek: yakınlaş · temsilî model') : (lang === 'en' ? '3D needs WebGL' : '3B için WebGL gerekir')}</figcaption>
    </figure>
  )
}
