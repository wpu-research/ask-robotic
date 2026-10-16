'use client'
// Kart önizlemesi: tek paylaşılan WebGL renderer ile sırayla görüntü üretilir (kart başına WebGL bağlamı açılmaz).
// Görünür olunca çizilir (IntersectionObserver); döndürmek için parça sayfasındaki PartViewer kullanılır.
import { useEffect, useRef, useState } from 'react'
import type * as THREE from 'three'
import { hasWebGL } from '../three/core'

const cache = new Map<string, string>()
let renderer: THREE.WebGLRenderer | null = null
let queue: Promise<unknown> = Promise.resolve()
const SIZE = 360

async function render(slug: string, group: string, angle = 0): Promise<string> {
  const key = `${slug}@${angle.toFixed(2)}`
  const hit = cache.get(key); if (hit) return hit
  const job = queue.then(async () => {
    const { makeRenderer, makeScene } = await import('./stage')
    if (!renderer) { renderer = makeRenderer(); renderer.setPixelRatio(1); renderer.setSize(SIZE, SIZE * 0.75, false) }
    const ps = makeScene(renderer, slug, group, 4 / 3, 1.35)
    ps.model.rotation.y = angle - 0.5
    renderer.render(ps.scene, ps.camera)
    const url = renderer.domElement.toDataURL('image/webp', 0.85)
    ps.dispose()
    cache.set(key, url)
    return url
  })
  queue = job.catch(() => undefined)
  return job
}

export function PartThumb({ slug, group }: { slug: string; group: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [src, setSrc] = useState<string | null>(cache.get(`${slug}@0.00`) ?? null)
  useEffect(() => {
    if (src || !hasWebGL()) return
    const el = ref.current!
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); render(slug, group).then(setSrc).catch(() => undefined) }
    }, { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [slug, group, src])
  return (
    <div ref={ref} className="p3d-thumb" aria-hidden="true">
      {src ? <img src={src} alt="" width={SIZE} height={SIZE * 0.75} /> : <span className="p3d-wait" />}
    </div>
  )
}
