'use client'
// IoT dersinin 3B akıllı serası: kural motoru benzetiminin o anki değerleri (pencere, fan, ısıtıcı, sulama, alarm) ve MQTT
// paketleri. Paketler sensörden, eyleyiciden ya da panodan çıkar, her zaman broker'dan geçerek abonelere gider (lib/iot/scene).
import * as THREE from 'three'
import type { KursMount } from '@/components/kurs/scene3d'
import { makeGreenhouse, textSprite } from '@/components/kurs/greenhouse3d'
import { mesh, std } from '@/components/three/core'
import { NODES, tempColor, type GreenhouseFrame, type LivePacket, type NodeId, type PacketKind } from '@/lib/iot/scene'

export interface IotSceneState { frame: GreenhouseFrame; packets: LivePacket[]; reduced: boolean }

export const PACKET_COLOR: Record<PacketKind, number> = { telemetry: 0x0d9488, command: 0xf97316, state: 0x8b5cf6 }
const MAX_PACKETS = 24

export const mount: KursMount<IotSceneState> = (s, lang) => {
  const en = lang === 'en'
  const gh = makeGreenhouse()
  s.scene.add(gh.group)
  s.view([5.6, 4.4, 6.6], [0, 1.6, -0.6])
  s.controls.minDistance = 4
  s.controls.maxDistance = 22

  // düğümler
  const addLabel = (id: NodeId, y: number, w = 2) => { const l = textSprite(w); l.sprite.position.set(NODES[id][0], NODES[id][1] + y, NODES[id][2]); s.scene.add(l.sprite); return l }
  // eyleyici kutusu (röle + ESP32) duvarda
  s.scene.add(mesh(new THREE.BoxGeometry(0.3, 0.4, 0.12), std(0x1e293b), [...NODES.actuator] as [number, number, number]))
  // broker: havada süzülen sunucu
  const broker = new THREE.Group()
  broker.position.set(...NODES.broker)
  s.scene.add(broker)
  broker.add(mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.5, 32), std(0x334155, { metalness: 0.4, roughness: 0.35 })))
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x14b8a6, emissive: 0x0d9488, emissiveIntensity: 0.6 })
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.03, 8, 40), ringMat)
  ring.rotation.x = Math.PI / 2
  broker.add(ring)
  // pano: masa ve ekran
  const desk = new THREE.Group()
  desk.position.set(NODES.dashboard[0], 0, NODES.dashboard[2])
  s.scene.add(desk)
  desk.add(mesh(new THREE.BoxGeometry(1.2, 0.06, 0.6), std(0xa16207), [0, 0.75, 0]))
  for (const [x, z] of [[-0.55, -0.25], [0.55, -0.25], [-0.55, 0.25], [0.55, 0.25]]) desk.add(mesh(new THREE.BoxGeometry(0.05, 0.75, 0.05), std(0x78350f), [x, 0.375, z]))
  const screen = mesh(new THREE.BoxGeometry(0.7, 0.42, 0.04), std(0x0f172a, { emissive: 0x0c4a6e, emissiveIntensity: 0.5 }), [0, 1.03, -0.1])
  screen.rotation.y = -0.6
  desk.add(screen)

  const sensorL = addLabel('sensor', 0.5, 1.9)
  const actL = addLabel('actuator', 0.65, 2.2)
  const brokerL = addLabel('broker', 0.65, 1.8)
  const dashL = addLabel('dashboard', 0.85, 2.3)
  brokerL.set('MQTT broker', '#0f766e')

  // düğümden broker'a ince bağlantı çizgileri
  const linkMat = new THREE.LineDashedMaterial({ color: 0x64748b, dashSize: 0.12, gapSize: 0.08, transparent: true, opacity: 0.7 })
  for (const id of ['sensor', 'actuator', 'dashboard'] as NodeId[]) {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...NODES[id]), new THREE.Vector3(...NODES.broker)])
    const l = new THREE.Line(g, linkMat)
    l.computeLineDistances()
    s.scene.add(l)
  }

  // paket havuzu
  const pGeo = new THREE.SphereGeometry(0.09, 14, 10)
  const mats = Object.fromEntries((Object.keys(PACKET_COLOR) as PacketKind[]).map((k) => [k, new THREE.MeshStandardMaterial({ color: PACKET_COLOR[k], emissive: PACKET_COLOR[k], emissiveIntensity: 0.7 })])) as Record<PacketKind, THREE.MeshStandardMaterial>
  const pool = Array.from({ length: MAX_PACKETS }, () => { const m = new THREE.Mesh(pGeo, mats.telemetry); m.visible = false; s.scene.add(m); return m })

  const onOff = (v: number) => (v ? (en ? 'on' : 'açık') : (en ? 'off' : 'kapalı'))
  let spin = 0
  return {
    frame(st, dt) {
      const f = st.frame
      gh.setBeds(() => tempColor(f.temp))
      gh.setWindow(f.acts.window)
      gh.setFan(!!f.acts.fan, dt, !st.reduced)
      gh.setHeater(!!f.acts.heater)
      gh.setPump(!!f.acts.pump)
      gh.setAlarm(f.acts.alarm ? 2 : 0)
      gh.setSun(f.sun, s.scene)
      if (!st.reduced) { spin += dt; ring.rotation.z = spin }
      const hh = String(Math.floor(f.hour) % 24).padStart(2, '0'), mm = String(Math.floor(f.minute % 60)).padStart(2, '0')
      sensorL.set(`sera-01  ${f.temp.toFixed(1)} °C`, '#0f766e')
      actL.set(`sera-02\nfan ${onOff(f.acts.fan)} · ${en ? 'heater' : 'ısıtıcı'} ${onOff(f.acts.heater)}`, '#1e293b')
      dashL.set(`${en ? 'dashboard' : 'pano'} ${hh}:${mm}\n${f.temp.toFixed(1)} °C · ${en ? `hum ${Math.round(f.hum)}%` : `nem %${Math.round(f.hum)}`}`, '#1e3a8a')
      pool.forEach((m, i) => {
        const p = st.packets[i]
        m.visible = !!p
        if (p) { m.position.set(...p.pos); m.material = mats[p.kind] }
      })
    },
  }
}
