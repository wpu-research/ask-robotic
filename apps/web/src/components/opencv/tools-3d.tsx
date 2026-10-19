'use client'
// OpenCV 3B: masada bir belge ve sanal kamera. Görüntü lib/opencv/camera3d ile bu kameradan üretilir; 9. ünitenin köşe bulma +
// perspektif düzeltme hattı aynı görüntüye uygulanır. 3B sahne yalnız masayı, belgeyi, kamerayı ve görüş piramidini çizer.
import { useCallback, useMemo, useState } from 'react'
import { CAM_DEFAULT, cameraPose, DESK, DOC_H, DOC_W, docCorners, docTexture, frustum, renderPhoto, type CamParams, type V3 } from '@/lib/opencv/camera3d'
import { findDocument, perspectiveTransform, warpPerspective } from '@/lib/opencv/geom'
import { adaptiveThreshold, gaussianBlur, toGray } from '@/lib/opencv/ops'
import { Stage3DHost, type Mount3D } from '@/components/kurs/stage3d-host'
import { Check, Img, Pair, Readout, Slider, Stage, tx, type L } from './cv-ui'

/** Dünya (Z yukarı) → three.js (Y yukarı). */
const w3 = (v: V3): [number, number, number] => [v[0], v[2], -v[1]]

const mountDesk: Mount3D<CamParams> = (T, stage, p0) => {
  const S = stage.scene
  const desk = new T.Mesh(new T.BoxGeometry(DESK.w, 0.03, DESK.h), new T.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.8 }))
  desk.position.y = -0.016; S.add(desk)
  const tex = docTexture(), cv = document.createElement('canvas'); cv.width = tex.w; cv.height = tex.h
  cv.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(tex.data), tex.w, tex.h), 0, 0)
  const map = new T.CanvasTexture(cv); map.colorSpace = T.SRGBColorSpace
  const doc = new T.Mesh(new T.PlaneGeometry(DOC_W, DOC_H), new T.MeshStandardMaterial({ map }))
  doc.rotation.x = -Math.PI / 2; doc.position.y = 0.001; S.add(doc)
  // kamera gövdesi ve görüş piramidi
  const cam = new T.Group(); S.add(cam)
  const body = new T.Mesh(new T.BoxGeometry(0.06, 0.04, 0.04), new T.MeshStandardMaterial({ color: 0x263238 })); cam.add(body)
  const lens = new T.Mesh(new T.CylinderGeometry(0.012, 0.014, 0.025, 20), new T.MeshStandardMaterial({ color: 0x111111 }))
  lens.rotation.x = Math.PI / 2; lens.position.z = 0.03; body.add(lens) // lookAt +Z eksenini hedefe çevirir
  const lineMat = new T.LineBasicMaterial({ color: 0xd33682 })
  const lines = new T.LineSegments(new T.BufferGeometry(), lineMat); S.add(lines)
  const rayMat = new T.LineDashedMaterial({ color: 0x00a152, dashSize: 0.01, gapSize: 0.008 })
  const rays = new T.LineSegments(new T.BufferGeometry(), rayMat); S.add(rays)
  const update = (p: CamParams) => {
    doc.rotation.z = (p.docYaw * Math.PI) / 180
    const pose = cameraPose(p)
    cam.position.set(...w3(pose.C))
    cam.lookAt(new T.Vector3(...w3([0, 0, 0])))
    const fr = frustum(p, 0.14), C = w3(pose.C), pts: number[] = []
    fr.forEach((v, i) => { const a = w3(v), b = w3(fr[(i + 1) % 4]); pts.push(...C, ...a, ...a, ...b) })
    lines.geometry.dispose(); lines.geometry = new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(pts, 3))
    // belge köşelerinden kameraya ışınlar: görüntüdeki köşeler bu ışınların görüntü düzlemini kestiği yerlerdir
    const rp: number[] = []
    for (const X of docCorners(p.docYaw)) rp.push(...w3(X), ...C)
    rays.geometry.dispose(); rays.geometry = new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(rp, 3)); rays.computeLineDistances()
  }
  update(p0)
  return { update }
}

export function Camera3DTool({ lang, scan = false }: { lang: L; scan?: boolean }) {
  const [p, setP] = useState<CamParams>({ ...CAM_DEFAULT })
  const [bin, setBin] = useState(scan)
  const set = (k: keyof CamParams) => (v: number) => setP((q) => ({ ...q, [k]: v }))
  const shot = useMemo(() => renderPhoto(p), [p])
  const found = useMemo(() => findDocument(shot.img), [shot])
  const flat = useMemo(() => {
    if (!found.quad) return null
    const w = 168, h = Math.round(w * 1.414)
    const H = perspectiveTransform(found.quad, [{ x: 0, y: 0 }, { x: w - 1, y: 0 }, { x: w - 1, y: h - 1 }, { x: 0, y: h - 1 }])
    if (!H) return null
    const f = warpPerspective(shot.img, H, w, h)
    return bin ? adaptiveThreshold(gaussianBlur(toGray(f), 3, 0), 21, 10) : f
  }, [shot, found, bin])
  const err = found.quad ? Math.max(...shot.corners.map((c, i) => (c ? Math.min(...found.quad!.map((q) => Math.hypot(q.x - c.x, q.y - c.y))) : 0 * i))) : null
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#ff1744'
    for (const c of shot.corners) if (c) { ctx.beginPath(); ctx.arc(c.x, c.y, 3, 0, 7); ctx.fill() }
    if (found.quad) { ctx.strokeStyle = '#00e676'; ctx.lineWidth = 2; ctx.beginPath(); found.quad.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.stroke() }
  }, [shot, found])
  return (
    <Stage side={<>
      <Slider label={tx(lang, 'Kamera yüksekliği açısı (°)', 'Camera elevation (°)')} value={p.elev} min={25} max={90} onChange={set('elev')} />
      <Slider label={tx(lang, 'Kamera yönü (°)', 'Camera azimuth (°)')} value={p.azim} min={-60} max={60} onChange={set('azim')} />
      <Slider label={tx(lang, 'Uzaklık (m)', 'Distance (m)')} value={p.dist} min={0.4} max={1} step={0.01} onChange={set('dist')} fmt={(v) => v.toFixed(2)} />
      <Slider label={tx(lang, 'Odak uzaklığı f (px)', 'Focal length f (px)')} value={p.f} min={180} max={500} step={10} onChange={set('f')} />
      <Slider label={tx(lang, 'Belgenin dönüşü (°)', 'Document rotation (°)')} value={p.docYaw} min={-40} max={40} onChange={set('docYaw')} />
      <Check label={tx(lang, 'Taramayı siyah-beyaz yap (uyarlamalı eşik)', 'Make the scan black and white (adaptive threshold)')} value={bin} onChange={setBin} />
      <Readout testId="cv-cam3d">{`${tx(lang, 'gerçek köşeler (kırmızı) ile bulunanlar (yeşil)', 'true corners (red) vs found (green)')}\n${err === null ? tx(lang, 'belge bulunamadı', 'document not found') : `${tx(lang, 'en büyük hata', 'max error')}: ${err.toFixed(1)} px`}\nK = [[${p.f}, 0, ${p.w / 2}], [0, ${p.f}, ${p.h / 2}], [0, 0, 1]]`}</Readout>
    </>}>
      <Stage3DHost lang={lang} mount={mountDesk} state={p} view={{ pos: [0.75, 0.75, 0.85], target: [0, 0.05, 0] }} label={tx(lang, 'Masa, belge ve sanal kamera (pembe: görüş piramidi, yeşil: köşe ışınları)', 'Desk, document and virtual camera (pink: view frustum, green: corner rays)')} testId="cv-3d-desk" />
      <Pair>
        <Img img={shot.img} draw={draw} label={tx(lang, 'Sanal kameranın görüntüsü (iğne deliği modeli)', 'The virtual camera image (pinhole model)')} testId="cv-out" />
        {flat ? <Img img={flat} label={tx(lang, 'Köşe bulma + warpPerspective (A4)', 'Corner finding + warpPerspective (A4)')} /> : <div />}
      </Pair>
    </Stage>
  )
}
