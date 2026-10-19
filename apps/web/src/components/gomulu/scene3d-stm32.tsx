'use client'
// 3B STM32 geliştirme kartı: durum lib/stm32/board3d.ts'ten (saf, testli). Yazmaç değişikliği başlık pinlerinde ve LD2'de,
// TIM3 PWM dönen motorda ve kartın üstündeki dalga şeridinde görünür. Yalnız istemcide, dinamik import ile yüklenir.
import { useEffect, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { createP3Stage, webglOk } from '@/components/ml/projeler/stage3d'
import { boardView, motorStep, waveform, type Board3DIn } from '@/lib/stm32/board3d'

export interface StmLive { input: Board3DIn; motor: { rpm: number; angle: number } }

const std = (color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...extra })

export default function StmBoard3D({ live, label }: { live: MutableRefObject<StmLive>; label: string }) {
  const host = useRef<HTMLDivElement>(null)
  const fail = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (!webglOk()) { if (fail.current) fail.current.hidden = false; return }
    const st = createP3Stage(host.current!, { background: 0xe6edf2, shadows: true })
    const { scene } = st
    st.view([0.04, 0.16, 0.17], [0.04, 0.01, 0])
    st.camera.near = 0.005; st.camera.updateProjectionMatrix()
    st.controls.minDistance = 0.08; st.controls.maxDistance = 0.8

    const desk = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), std(0xcdbfae)); desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk)
    // Kart (Nucleo-64 ölçüsüne yakın: 70 × 82 mm)
    const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.0016, 0.082), std(0xf4f4f0)); pcb.position.y = 0.008; pcb.castShadow = true; scene.add(pcb)
    for (const [x, z] of [[-0.03, -0.036], [0.03, -0.036], [-0.03, 0.036], [0.03, 0.036]]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.008, 8), std(0x999999)); s.position.set(x, 0.004, z); scene.add(s) }
    const mcu = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.0016, 0.012), std(0x1b1b1b)); mcu.position.set(0, 0.0096, 0.008); mcu.rotation.y = Math.PI / 4; scene.add(mcu)
    const stlink = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.0016, 0.018), std(0xe9e9e4)); stlink.position.set(0, 0.0096, -0.03); scene.add(stlink)
    const usb = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.004, 0.006), std(0xb0b0b0, { metalness: 0.6 })); usb.position.set(0, 0.011, -0.04); scene.add(usb)
    // LD2 (PA5) ve B1 (PC13)
    const ledMat = std(0x0d3d1e, { emissive: 0x000000 })
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.0012, 0.0016), ledMat); led.position.set(0.012, 0.0094, 0.022); scene.add(led)
    const glow = new THREE.PointLight(0x22ff66, 0, 0.05); glow.position.set(0.012, 0.014, 0.022); scene.add(glow)
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.002, 16), std(0x2c6cb0)); btn.position.set(-0.015, 0.0098, 0.025); scene.add(btn)
    // Başlık: PA0–PA15 tek sıra (sol kenar); her pin seviyesine göre renklenir
    const pinMats: THREE.MeshStandardMaterial[] = []
    for (let i = 0; i < 16; i++) {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.0025, 0.0025, 0.0025), std(0x111111)); base.position.set(-0.031, 0.01, -0.02 + i * 0.00254); scene.add(base)
      const m = std(0x888888, { metalness: 0.5 }); pinMats.push(m)
      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.0007, 0.008, 0.0007), m); pin.position.set(-0.031, 0.0145, -0.02 + i * 0.00254); scene.add(pin)
    }
    // Motor sürücü ve DC motor (sağda), PA6 = TIM3_CH1 telinden PWM gelir
    const drv = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.003, 0.02), std(0xb22222)); drv.position.set(0.075, 0.0015, 0.005); scene.add(drv)
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 24), std(0xc0c4c8, { metalness: 0.7, roughness: 0.3 }))
    motor.rotation.z = Math.PI / 2; motor.position.set(0.115, 0.012, 0.005); motor.castShadow = true; scene.add(motor)
    const rotor = new THREE.Group(); rotor.position.set(0.132, 0.012, 0.005); scene.add(rotor)
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.03, 0.005), std(0xf2c14e)); rotor.add(blade)
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, 0.004, 8), std(0x777777)); shaft.rotation.z = Math.PI / 2; shaft.position.x = -0.002; rotor.add(shaft)
    const wire = (pts: number[][], color: number) => { const c = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z))); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 30, 0.0006, 6), std(color)); scene.add(m) }
    wire([[-0.031, 0.019, -0.02 + 6 * 0.00254], [-0.02, 0.03, -0.01], [0.04, 0.03, 0.0], [0.07, 0.004, 0.005]], 0xf2c14e)
    wire([[0.085, 0.003, 0.005], [0.095, 0.008, 0.005], [0.1, 0.012, 0.005]], 0xc43d36)
    // Dalga şeridi: TIM3 çıkışı kartın üstünde
    const waveGeo = new THREE.BufferGeometry()
    const wave = new THREE.Line(waveGeo, new THREE.LineBasicMaterial({ color: 0xc43d36 })); scene.add(wave)
    const axis = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.035, 0.05, 0.05), new THREE.Vector3(0.105, 0.05, 0.05)]), new THREE.LineBasicMaterial({ color: 0x999999 })); scene.add(axis)
    let lastKey = ''

    st.onFrame = (dt) => {
      const L = live.current
      const v = boardView(L.input)
      v.levels.forEach((lv, i) => pinMats[i].color.set(lv === 1 ? 0x2f8a57 : lv === 0 ? 0x333333 : 0x999999))
      ledMat.emissive.set(v.led ? 0x22ff66 : 0x000000); ledMat.color.set(v.led ? 0x7dffb0 : 0x0d3d1e); glow.intensity = v.led ? 0.02 : 0
      L.motor = motorStep(L.motor, v.volts, dt)
      rotor.rotation.x = L.motor.angle
      const key = `${L.input.arr}:${L.input.ccr}:${L.input.pwmOn}`
      if (key !== lastKey) {
        lastKey = key
        const w = waveform(L.input.arr, L.input.pwmOn ? L.input.ccr : 0, 3, 40)
        const pts: THREE.Vector3[] = []
        w.forEach((b, i) => { const x0 = -0.035 + (i / w.length) * 0.14, x1 = -0.035 + ((i + 1) / w.length) * 0.14, y = 0.05 + b * 0.015; pts.push(new THREE.Vector3(x0, y, 0.05), new THREE.Vector3(x1, y, 0.05)) })
        waveGeo.setFromPoints(pts)
      }
    }
    return () => st.dispose()
  }, [live])
  return (
    <div className="gm-3d-wrap">
      <div ref={host} className="gm-3d" role="img" aria-label={label} data-testid="stm-board3d-canvas" />
      <p ref={fail} hidden className="gm-hint">WebGL yok / WebGL unavailable</p>
    </div>
  )
}
