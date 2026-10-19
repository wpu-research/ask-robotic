'use client'
// Sensör-ML dersinin 3B serası: yatakların rengi tahmini sıcaklık dağılımını (lib/sensor-ml/scene bedTemps), direkteki etiket
// gerçek ve tahmin değerini, artık z-skorunu ve uyarı durumunu gösterir; fener normal/izle/uyarı için gri/sarı/kırmızı yanar.
// Bir sütun dizisi son 2 saatin tahmin artığını (|z|) yükseklik olarak çizer: arıza başlayınca sütunlar büyür.
import * as THREE from 'three'
import type { KursMount } from '@/components/kurs/scene3d'
import { GH, makeGreenhouse, textSprite } from '@/components/kurs/greenhouse3d'
import { mesh, std } from '@/components/three/core'
import { tempColor } from '@/lib/iot/scene'
import { bedTemps, type SmlFrame } from '@/lib/sensor-ml/scene'

export interface SmlSceneState { frame: SmlFrame; recent: SmlFrame[]; on: number; reduced: boolean }
export const STATUS_BG: Record<SmlFrame['status'], string> = { normal: '#0f766e', watch: '#b45309', alert: '#b91c1c' }

export const mount: KursMount<SmlSceneState> = (s, lang) => {
  const en = lang === 'en'
  const gh = makeGreenhouse()
  s.scene.add(gh.group)
  s.view([5.2, 4.2, 6.6], [0, 1.2, 0.6])
  s.controls.minDistance = 4
  s.controls.maxDistance = 20

  const main = textSprite(2.8)
  main.sprite.position.set(gh.sensorTop.x, gh.sensorTop.y + 1.25, gh.sensorTop.z)
  s.scene.add(main.sprite)
  const status = textSprite(2)
  status.sprite.position.set(gh.sensorTop.x, gh.sensorTop.y + 0.7, gh.sensorTop.z)
  s.scene.add(status.sprite)

  // artık sütunları: seranın önünde, son 12 örnek
  const N = 12
  const barMat = (c: number) => std(c, { roughness: 0.4 })
  const bars = Array.from({ length: N }, (_, k) => {
    const b = mesh(new THREE.BoxGeometry(0.22, 1, 0.22), barMat(0x0d9488), [-1.65 + k * 0.3, 0.5, GH.d / 2 + 0.9])
    s.scene.add(b)
    return b
  })
  const thr = mesh(new THREE.BoxGeometry(N * 0.3 + 0.1, 0.02, 0.26), new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 }), [0, 1, GH.d / 2 + 0.9])
  s.scene.add(thr)
  const axis = textSprite(1.6)
  axis.sprite.position.set(2.4, 0.3, GH.d / 2 + 0.9)
  axis.set(en ? 'residual |z|' : 'artık |z|', '#334155')
  s.scene.add(axis.sprite)

  const H = 0.28 // |z| başına metre
  return {
    frame(st) {
      const f = st.frame
      const temps = bedTemps(f)
      gh.setBeds((r, c) => tempColor(temps[r][c]))
      gh.setHeater(f.fault)
      gh.setWindow(f.actual > 27 ? 1 : 0)
      gh.setAlarm(f.status === 'alert' ? 2 : f.status === 'watch' ? 1 : 0)
      gh.setSun(Math.max(0, Math.sin(((f.hour - 6) / 12) * Math.PI)), s.scene)
      const hh = String(Math.floor(f.hour)).padStart(2, '0'), mm = String(Math.round((f.hour % 1) * 60) % 60).padStart(2, '0')
      main.set(`${en ? 'day' : 'gün'} ${f.day} ${hh}:${mm}\n${en ? 'actual' : 'gerçek'} ${f.actual.toFixed(1)} °C · ${en ? 'forecast' : 'tahmin'} ${f.pred.toFixed(1)} °C`, '#1f2937')
      status.set(`z = ${f.z.toFixed(1)} · ${f.status === 'alert' ? (en ? 'ALERT' : 'UYARI') : f.status === 'watch' ? (en ? 'watch' : 'izle') : 'normal'}`, STATUS_BG[f.status])
      thr.position.y = st.on * H
      bars.forEach((b, k) => {
        const r = st.recent[st.recent.length - N + k]
        const z = r ? Math.min(10, Math.abs(r.z)) : 0
        b.scale.y = Math.max(0.02, z * H)
        b.position.y = (Math.max(0.02, z * H)) / 2
        ;(b.material as THREE.MeshStandardMaterial).color.setHex(r?.alarm ? 0xef4444 : z >= st.on / 2 ? 0xf59e0b : 0x0d9488)
      })
    },
  }
}
