// Hyvex parçalarının prosedürel 3B modelleri. buildPart(slug) → THREE.Group (mm, Y yukarı). Aile oluşturucuları parçaya
// özgü renk, yonga yazısı ve konnektörlerle ayarlanır; eşlemesi olmayan parça kategorisine göre genel bir modül alır.
import * as THREE from 'three'
import { M, barrelJack, box, chip, coil, cyl, elco, header, heatsink, mat, pcb, rng, screen, smd, smdLed, terminal, textMat, trimmer, usb, wire, type V3 } from './kit'

type G = THREE.Group
type B = (g: G, slug: string) => void

// ---------------------------------------------------------------- geliştirme kartları
function uno(color = '#1f6fb8', label = 'UNO', r4 = false): B {
  return (g, s) => {
    const r = rng(s)
    pcb(g, 68.6, 53.4, color)
    header(g, 10, [8, 1.6, -24.5], { female: true }); header(g, 8, [-17, 1.6, -24.5], { female: true })
    header(g, 8, [-8, 1.6, 24.5], { female: true }); header(g, 6, [18, 1.6, 24.5], { female: true })
    if (r4) usb(g, 'c', [-31, 1.6, -12], Math.PI / 2); else usb(g, 'b', [-28, 1.6, -12], Math.PI / 2)
    barrelJack(g, [-28, 1.6, 15])
    if (r4) { chip(g, 7, 7, [8, 1.6, 2], ['RA4M1'], { legs: 'qfp' }); chip(g, 10, 7, [-8, 1.6, -6], ['ESP32-S3'], { legs: 'none', bg: '#a8adb4' }); box(g, 12, 0.3, 8, mat('#111'), [20, 1.75, 6]) }
    else { box(g, 35, 3.5, 7.6, M.black(), [10, 3.35, 8]); chip(g, 34, 7.4, [10, 5.1, 8], ['ATMEGA328P-PU'], { legs: 'none' }); for (let i = 0; i < 14; i++) for (const sd of [-1, 1]) box(g, 0.5, 3, 0.4, M.tin(), [10 - 16.5 + i * 2.54, 3.1, 8 + sd * 4]) }
    chip(g, 5, 5, [-14, 1.6, -18], ['16U2'], { legs: 'qfp' })
    box(g, 6, 2.5, 3, M.plastic('#dfe3e8'), [-20, 2.85, -21])
    cyl(g, 2.2, 1, mat('#c43d36'), [-20, 4.6, -21])
    elco(g, 3, 7, [-17, 1.6, 8]); elco(g, 3, 7, [-17, 1.6, 15])
    box(g, 11, 3.5, 4.5, M.steel(), [-6, 3.35, -5])
    smdLed(g, [2, 1.6, -14], '#22c55e'); smdLed(g, [5, 1.6, -14], '#f59e0b')
    smd(g, r, [-5, -15, 25, 20], 18)
    box(g, 24, 0.05, 6, textMat([label], { bg: color, fg: '#ffffff', size: 54 }), [16, 1.62, -12])
  }
}
const nanoLike = (color: string, mcu: string, usbKind: 'micro' | 'c', w = 45, d = 18): B => (g, s) => {
  pcb(g, w, d, color, { holes: false })
  header(g, 15, [0, 1.6, -7.6], { up: false }); header(g, 15, [0, 1.6, 7.6], { up: false })
  usb(g, usbKind, [-w / 2 + 3, 1.6, 0], Math.PI / 2)
  chip(g, 9, 9, [5, 1.6, 0], [mcu], { legs: 'qfp' })
  smd(g, rng(s), [-12, -5, 18, 5], 10)
  smdLed(g, [14, 1.6, 4], '#3b82f6')
}
const esp32Dev: B = (g, s) => {
  pcb(g, 52, 28, '#14161a', { holes: false })
  header(g, 19, [0, 1.6, -12.7], { up: false }); header(g, 19, [0, 1.6, 12.7], { up: false })
  box(g, 18, 0.8, 25.5, mat('#1e3a8a'), [12, 2, 0])
  box(g, 16, 3, 18, M.steel(), [10, 3.9, 0])
  box(g, 16, 0.05, 18, textMat(['ESP32-WROOM-32', 'WiFi + BT'], { bg: '#b9bec5', fg: '#2a2e35' }), [10, 5.42, 0])
  box(g, 6, 0.2, 18, textMat(['〰'], { bg: '#1e3a8a', fg: '#d4a73a', size: 70 }), [21, 2.5, 0])
  usb(g, 'micro', [-24, 1.6, 0], Math.PI / 2)
  chip(g, 5, 5, [-12, 1.6, 0], ['CP2102'], { legs: 'qfp' })
  for (const z of [-7, 7]) { box(g, 4, 1.6, 3, M.steel(), [-19, 2.4, z]); box(g, 2.2, 1.2, 1.5, M.black(), [-21.5, 2.4, z]) }
  smd(g, rng(s), [-18, -9, 0, 9], 10)
}
const pi4: B = (g, s) => {
  pcb(g, 85, 56, '#2f7d3a')
  header(g, 20, [-3, 1.6, -24.5], { rows: 2 })
  chip(g, 14, 14, [-8, 1.6, 0], ['BCM2711', 'Broadcom'], { legs: 'none', bg: '#b9bec5' })
  chip(g, 15, 10, [12, 1.6, 0], ['LPDDR4'], { legs: 'none' })
  box(g, 21, 13.5, 16, M.steel(), [32, 8.35, -16]); box(g, 15, 13, 17.5, M.steel(), [34, 8.1, 3])
  box(g, 15, 13, 17.5, M.steel(), [34, 8.1, 20]); box(g, 4, 4, 4, mat('#2a6fdb'), [41.5, 8, 3]); box(g, 4, 4, 4, mat('#2a6fdb'), [41.5, 8, 20])
  for (const x of [-30, -16]) usb(g, 'micro', [x, 1.6, 26], 0)
  usb(g, 'c', [-38, 1.6, 26], 0)
  box(g, 6, 6, 7, M.black(), [-2, 4.6, 25])
  box(g, 22, 1, 4, M.plastic('#f0f0f0'), [-22, 2.1, 10])
  smd(g, rng(s), [-35, -18, 20, 18], 22)
}
const jetson = (big: boolean): B => (g, s) => {
  pcb(g, 100, 79, '#16181d')
  box(g, 70, 3, 45, mat('#2b2e33'), [0, 4.6, -6])
  heatsink(g, 64, 14, 40, [0, 6, -6], '#1d2025', 16)
  cyl(g, 18, 6, mat('#121316'), [0, 24, -6]); for (let i = 0; i < 7; i++) box(g, 15, 0.8, 4, mat('#26292e'), [0, 26.5, -6], [0, (i / 7) * Math.PI, 0])
  box(g, 30, 0.05, 8, textMat([big ? 'JETSON ORIN NX' : 'JETSON ORIN NANO'], { bg: '#1d2025', fg: '#76b900', size: 44 }), [0, 27.6, 14])
  for (const x of [-36, -22]) box(g, 13, 14, 15, M.steel(), [x, 8.6, 30])
  box(g, 16, 13, 18, M.steel(), [-4, 8.1, 30]); box(g, 15, 6, 11, M.black(), [16, 4.6, 32])
  usb(g, 'c', [32, 1.6, 34], 0); barrelJack(g, [42, 1.6, 30])
  header(g, 20, [6, 1.6, -36], { rows: 2 })
  smd(g, rng(s), [-45, 18, 45, 25], 14)
}
const coral: B = (g, s) => {
  pcb(g, 88, 60, '#1b1d22')
  box(g, 48, 8, 40, mat('#2a2d33', { metal: 0.6 }), [-6, 5.6, -2]); heatsink(g, 44, 6, 36, [-6, 9.6, -2], '#3a3e45', 14)
  box(g, 26, 0.05, 6, textMat(['CORAL'], { bg: '#3a3e45', fg: '#f97316', size: 60 }), [-6, 17.7, 14])
  header(g, 20, [0, 1.6, -25], { rows: 2 }); for (const x of [32, 18]) box(g, 13, 14, 15, M.steel(), [x, 8.6, 22])
  usb(g, 'c', [-38, 1.6, 26], 0); smd(g, rng(s), [20, -20, 40, 10], 10)
}
const hailo: B = (g, s) => {
  pcb(g, 65, 56.5, '#20242b')
  header(g, 20, [0, 1.6, -24.5], { rows: 2, female: true })
  box(g, 22, 2.4, 30, mat('#2b2f36'), [8, 2.8, 4]); chip(g, 12, 12, [8, 4, 4], ['HAILO-8L'], { legs: 'none', bg: '#c4c8cf' })
  heatsink(g, 20, 6, 20, [8, 5.5, 4], '#c0c5cc', 8)
  box(g, 10, 1, 16, M.plastic('#f0f0f0'), [-22, 2.1, 10]); smd(g, rng(s), [-28, -15, -8, 15], 10)
}
const qcom: B = (g, s) => {
  pcb(g, 100, 72, '#0e3b5c')
  box(g, 50, 5, 40, mat('#1c1f24', { metal: 0.5 }), [-10, 4.1, 0]); heatsink(g, 46, 12, 36, [-10, 6.6, 0], '#2a2e35', 18)
  box(g, 34, 0.05, 6, textMat(['QCS8550 · IQ9'], { bg: '#2a2e35', fg: '#e5e7eb', size: 46 }), [-10, 20.7, 15])
  for (const x of [30, 44]) box(g, 13, 14, 15, M.steel(), [x, 8.6, 24]); usb(g, 'c', [30, 1.6, -30], Math.PI)
  smd(g, rng(s), [20, -25, 45, 10], 16)
}
const esp32cam: B = (g, s) => {
  pcb(g, 40.5, 27, '#14161a', { holes: false })
  header(g, 8, [0, 1.6, -11.4], { up: false }); header(g, 8, [0, 1.6, 11.4], { up: false })
  box(g, 18, 3, 17, M.steel(), [-6, 3.1, 0]); box(g, 18, 0.05, 17, textMat(['ESP32-S'], { bg: '#b9bec5', fg: '#2a2e35' }), [-6, 4.62, 0])
  box(g, 8.5, 5, 8.5, M.black(), [12, 4.1, 0]); cyl(g, 3.2, 3, M.black(), [12, 8.1, 0]); cyl(g, 2.2, 0.3, mat('#1e3a8a', { metal: 0.5, rough: 0.05 }), [12, 9.7, 0])
  box(g, 4, 1.4, 4, mat('#f4f4f2', { emissive: '#fffbe6' }), [-14, 2.3, 8])
  smd(g, rng(s), [-18, -8, 4, 8], 6)
}
const huskylens: B = (g) => {
  pcb(g, 52, 44.5, '#26282d')
  box(g, 48, 3, 38, mat('#121316'), [0, 3.1, 0]); screen(g, 44, 34, [0, 4.65, 0], ['HuskyLens', '◉ face ◉'], '#0a2733', '#7dd3fc', false)
  cyl(g, 4.5, 6, M.black(), [0, -1.4, 0]); cyl(g, 3, 0.3, mat('#173a8a', { metal: 0.5, rough: 0.05 }), [0, -4.5, 0])
  box(g, 6, 2, 3, M.steel(), [-22, 2.6, -18]); box(g, 6, 2, 3, M.steel(), [22, 2.6, -18])
}
const pixy: B = (g, s) => {
  pcb(g, 38, 42, '#1d6b3a')
  box(g, 12, 6, 12, M.black(), [0, 4.6, 6]); cyl(g, 5, 6, M.black(), [0, 10.6, 6]); cyl(g, 3.6, 0.3, mat('#1e3a8a', { metal: 0.5, rough: 0.05 }), [0, 13.7, 6])
  chip(g, 9, 9, [0, 1.6, -11], ['NXP LPC4330'], { legs: 'qfp' }); header(g, 5, [12, 1.6, -18], { rows: 2 }); smd(g, rng(s), [-16, -16, -6, 16], 8)
  smdLed(g, [-14, 1.6, 15], '#ef4444')
}
const grove: B = (g, s) => {
  pcb(g, 30, 30, '#16181d', { holes: false })
  chip(g, 9, 9, [-5, 1.6, -4], ['WE2'], { legs: 'none' })
  box(g, 9, 4, 9, M.black(), [7, 3.6, 5]); cyl(g, 3.5, 4, M.black(), [7, 7.6, 5]); cyl(g, 2.4, 0.3, mat('#1e3a8a', { metal: 0.5, rough: 0.05 }), [7, 9.7, 5])
  box(g, 8, 5, 6, mat('#f0f0f0'), [-9, 4.1, 10]); smd(g, rng(s), [-14, -14, 2, 2], 8)
}

// ---------------------------------------------------------------- sensör modülleri
/** Genel kesme kartı: renkli PCB + yonga + pin başlığı (+ isteğe bağlı ek). */
function breakout(o: { w: number; d: number; color: string; chip?: [number, number, string[]]; pins: number; extra?: (g: G) => void; label?: string }): B {
  return (g, s) => {
    pcb(g, o.w, o.d, o.color, { holes: o.w > 18 })
    header(g, o.pins, [0, 1.6, o.d / 2 - 2], { up: false })
    if (o.chip) chip(g, o.chip[0], o.chip[1], [0, 1.6, -2], o.chip[2], { legs: 'qfp' })
    smd(g, rng(s), [-o.w / 2 + 2, -o.d / 2 + 2, o.w / 2 - 2, 2], Math.round(o.w / 4))
    if (o.label) box(g, o.w * 0.7, 0.04, 3.6, textMat([o.label], { bg: o.color, fg: '#f8fafc', size: 70 }), [0, 1.62, -o.d / 2 + 3])
    o.extra?.(g)
  }
}
const hcsr04 = (color = '#1f6fb8', label = 'HC-SR04'): B => (g, s) => {
  pcb(g, 45, 20, color)
  for (const x of [-13, 13]) {
    cyl(g, 8, 12, M.alu(), [x, 7.6, 0]); cyl(g, 7.2, 0.4, mat('#2d2f33'), [x, 13.7, 0])
    const me = new THREE.Mesh(new THREE.CircleGeometry(6.6, 24), mat('#c6c9cc', { metal: 0.6, rough: 0.6 }))
    me.rotation.x = -Math.PI / 2; me.position.set(x, 13.95, 0); g.add(me)
  }
  box(g, 6, 2.5, 3, M.steel(), [0, 2.85, -6]); header(g, 4, [0, 1.6, 9], { up: false })
  box(g, 16, 0.04, 3, textMat([label], { bg: color, fg: '#f8fafc', size: 70 }), [0, 1.62, -8.5]); smd(g, rng(s), [-6, -4, 6, 6], 4)
}
const jsn: B = (g, s) => {
  pcb(g, 41, 28, '#1d6b3a'); chip(g, 7, 5, [0, 1.6, 0], ['JSN-SR04T'], { legs: 'soic' }); header(g, 4, [0, 1.6, 12], { up: false }); smd(g, rng(s), [-18, -10, 18, 8], 8)
  box(g, 7, 6, 8, M.plastic('#f5f5f5'), [-16, 4.6, -8]); wire(g, [[-16, 5, -12], [-25, 6, -30], [-10, 4, -55], [10, 4, -60]], '#16181d', 2)
  cyl(g, 9, 14, M.black(), [16, 7, -62], [Math.PI / 2, 0, 0]); cyl(g, 7, 0.4, mat('#9aa3ad', { metal: 0.6 }), [16, 7, -69.2], [Math.PI / 2, 0, 0])
}
const tfluna: B = (g) => {
  box(g, 35, 21.2, 12, M.plastic('#16181d'), [0, 10.6, 0])
  for (const x of [-7, 7]) { cyl(g, 5, 1, mat('#0a0a0a'), [x, 10.6, -6.4], [Math.PI / 2, 0, 0]); cyl(g, 4, 0.3, mat('#4b2a7a', { metal: 0.5, rough: 0.05 }), [x, 10.6, -7], [Math.PI / 2, 0, 0]) }
  box(g, 20, 0.05, 4, textMat(['TF-Luna'], { bg: '#16181d', fg: '#e5e7eb', size: 70 }), [0, 21.25, 0])
  wire(g, [[12, 8, 6], [20, 6, 18], [28, 4, 30]], '#ef4444', 0.6); wire(g, [[13, 8, 6], [21.5, 6, 18], [29.5, 4, 30]], '#111', 0.6)
}
const sharp: B = (g) => {
  box(g, 29.5, 13, 13, M.plastic('#16181d'), [0, 6.5, 0])
  for (const sx of [-1, 1]) { box(g, 7, 3, 13, M.plastic('#16181d'), [sx * 18, 1.5, 0]); cyl(g, 1.6, 3.2, mat('#050505'), [sx * 18.5, 1.5, 0]) }
  box(g, 9, 8, 0.6, mat('#2a0b0b', { rough: 0.1 }), [-6, 7, -6.6]); box(g, 9, 8, 0.6, mat('#0a0f1f', { rough: 0.1 }), [6, 7, -6.6])
  box(g, 7, 4, 4, mat('#f5f5f5'), [0, 2, 8]); for (const c of ['#ef4444', '#111', '#facc15']) wire(g, [[c === '#111' ? 0 : c === '#ef4444' ? -2 : 2, 2, 10], [0, 2, 20], [0, 1, 30]], c, 0.5)
}
const mq = (n: string): B => (g, s) => {
  pcb(g, 32, 22, '#1f6fb8')
  cyl(g, 10, 2, M.plastic('#d8dde6'), [-4, 2.6, 0]); cyl(g, 9.5, 14, mat('#9aa3ad', { metal: 0.7, rough: 0.7 }), [-4, 10.6, 0])
  const net = new THREE.Mesh(new THREE.CylinderGeometry(9.6, 9.6, 14, 24, 8, true), new THREE.MeshStandardMaterial({ color: '#d1d5db', wireframe: true }))
  net.position.set(-4, 10.6, 0); g.add(net)
  trimmer(g, [11, 1.6, -4]); chip(g, 5, 4, [11, 1.6, 6], ['LM393'], { legs: 'soic' }); header(g, 4, [0, 1.6, 9.5], { up: false })
  smdLed(g, [-13, 1.6, -6], '#ef4444'); smdLed(g, [-13, 1.6, 6], '#22c55e')
  box(g, 10, 0.04, 3, textMat([n], { bg: '#1f6fb8', fg: '#fff', size: 70 }), [10, 1.62, -9.5])
}
const dht22: B = (g) => {
  box(g, 15.1, 25, 7.7, M.plastic('#f4f4f2'), [0, 12.5, 0])
  for (let y = 0; y < 6; y++) for (let x = 0; x < 3; x++) box(g, 2.6, 2.2, 0.6, mat('#2a2d33'), [-4 + x * 4, 5 + y * 3.4, -4])
  for (let i = 0; i < 4; i++) box(g, 0.5, 8, 0.25, M.tin(), [-3.8 + i * 2.54, -4, 0])
}
const ds18b20: B = (g) => {
  cyl(g, 3, 30, M.steel(), [0, 3, 0], [0, 0, Math.PI / 2]); const tip = new THREE.Mesh(new THREE.SphereGeometry(3, 20, 12), M.steel()); tip.position.set(15, 3, 0); g.add(tip)
  cyl(g, 3.2, 10, M.rubber(), [-20, 3, 0], [0, 0, Math.PI / 2])
  wire(g, [[-25, 3, 0], [-40, 3, 4], [-60, 2, -6]], '#16181d', 1.6)
}
const imu = (color: string, name: string, chipLbl: string, w = 21, d = 16): B => breakout({ w, d, color, chip: [4, 4, [chipLbl]], pins: w > 20 ? 8 : 6, label: name })
const mlx: B = (g) => {
  pcb(g, 17, 11.5, '#1d4ed8', { holes: false }); header(g, 4, [0, 1.6, 4.5], { up: false })
  cyl(g, 4.5, 4.5, M.steel(), [0, 3.85, -1]); cyl(g, 4.7, 0.6, M.steel(), [0, 1.9, -1]); cyl(g, 1.8, 0.2, mat('#1f2937', { rough: 0.1 }), [0, 6.2, -1])
}
const amg: B = breakout({ w: 25, d: 25, color: '#16181d', pins: 6, label: 'AMG8833', extra: (g) => { box(g, 11, 4, 8, M.steel(), [0, 3.6, -2]); cyl(g, 2.4, 1.2, mat('#7a1f1f', { rough: 0.1 }), [0, 6.2, -2]) } })
const tofSmall: B = breakout({ w: 25, d: 11, color: '#7b2a96', pins: 6, chip: [4.4, 2.4, ['VL53']], label: 'VL53L0X' })
const pms5003: B = (g) => {
  box(g, 50, 21, 38, M.alu(), [0, 10.5, 0]); box(g, 12, 6, 0.4, mat('#111'), [-14, 10, -19.1]); box(g, 12, 6, 0.4, mat('#111'), [14, 10, -19.1])
  box(g, 28, 0.05, 6, textMat(['PLANTOWER PMS5003'], { bg: '#c7ccd2', fg: '#1b1d22', size: 40 }), [0, 21.05, 6])
  box(g, 8, 3, 4, mat('#f5f5f5'), [20, 3, 19]); wire(g, [[20, 3, 21], [24, 3, 30], [30, 2, 40]], '#111', 0.5)
}

// ---------------------------------------------------------------- ekranlar
const lcd1602 = (i2c: boolean): B => (g, s) => {
  pcb(g, 80, 36, '#2f7d3a')
  box(g, 71, 7, 24, M.black(), [0, 5.1, 0]); screen(g, 64.5, 16, [0, 8.65, 0], ['Merhaba robot!', 'ESOF 323  v1.0'], '#7fb3ff', '#f8fafc')
  header(g, 16, [-8, 1.6, -15.5])
  if (i2c) { pcb(g, 41, 19, '#16181d', { holes: false, x: -8, z: -10, t: 1.6 }); chip(g, 6, 4, [-8, 3.2 - 1.6 + 1.6, -10], ['PCF8574'], { legs: 'soic' }); trimmer(g, [6, 1.6, -10]); header(g, 4, [-24, 1.6, -10], { axis: 'z' }) }
  smd(g, rng(s), [20, 13, 38, 17], 3)
}
const oled: B = (g) => { pcb(g, 27, 27, '#1d4ed8'); box(g, 26, 1.5, 19, mat('#0a0a0a', { rough: 0.15 }), [0, 2.35, 1]); screen(g, 22, 11, [0, 3.12, 1], ['SSD1306', '128x64'], '#05080f', '#7dd3fc'); header(g, 4, [0, 1.6, -12], { up: false }) }
const tft = (w: number, d: number, round = false, txt = 'ST7735', bg = '#0b1020'): B => (g) => {
  pcb(g, w + 6, d + 12, '#b91c1c')
  if (round) { cyl(g, w / 2, 1.5, mat('#0a0a0a', { rough: 0.15 }), [0, 2.35, 0]); const me = new THREE.Mesh(new THREE.CircleGeometry(w / 2 - 1, 48), textMat(['GC9A01', '240×240'], { bg: '#1a1033', fg: '#f0abfc', w: 256, h: 256 })); me.rotation.x = -Math.PI / 2; me.position.set(0, 3.12, 0); g.add(me) }
  else { box(g, w, 1.6, d, mat('#0a0a0a', { rough: 0.15 }), [0, 2.4, 2]); screen(g, w - 2, d - 3, [0, 3.22, 2], [txt], bg, '#fde68a', false) }
  header(g, 8, [0, 1.6, -(d + 12) / 2 + 2], { up: false })
}
const epaper: B = (g) => { pcb(g, 89.5, 38, '#16181d'); box(g, 79, 1.2, 36, mat('#e9e6df', { rough: 0.9 }), [0, 2.2, 0]); screen(g, 66, 29, [0, 2.82, 0], ['e-Paper 2.9"', 'güç kesilince kalır'], '#efece4', '#222', false); header(g, 8, [-40, 1.6, 0], { axis: 'z', up: false }) }

// ---------------------------------------------------------------- motorlar
const dcMotor = (o: { r: number; len: number; gear?: 'bo' | 'metal' | 'n20' | null; color?: string; big?: boolean }): B => (g) => {
  cyl(g, o.r, o.len, M.steel(), [0, o.r, 0], [0, 0, Math.PI / 2])
  cyl(g, o.r * 0.95, 2, M.plastic('#16181d'), [-o.len / 2 - 1, o.r, 0], [0, 0, Math.PI / 2])
  for (const z of [-o.r * 0.4, o.r * 0.4]) box(g, 1, 3, 2.5, M.tin(), [-o.len / 2 - 2.5, o.r, z])
  if (o.big) for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; box(g, 4, 3, 1.5, mat('#3a3f45'), [o.len / 2 - 6, o.r + Math.sin(a) * o.r * 0.9, Math.cos(a) * o.r * 0.9]) }
  if (o.gear === 'bo') { box(g, 22, 18, 22, M.plastic('#facc15'), [o.len / 2 + 11, 9, 0]); cyl(g, 2.5, 9, mat('#f5f5f5'), [o.len / 2 + 11, 9, 15], [Math.PI / 2, 0, 0]); cyl(g, 2.5, 9, mat('#f5f5f5'), [o.len / 2 + 11, 9, -15], [Math.PI / 2, 0, 0]) }
  else if (o.gear === 'metal' || o.gear === 'n20') { const gr = o.gear === 'n20' ? o.r : o.r * 0.95; cyl(g, gr, o.len * 0.55, M.tin(), [o.len / 2 + o.len * 0.275, o.r, 0], [0, 0, Math.PI / 2]); box(g, 1, o.r * 2.1, o.r * 2.1, M.tin(), [o.len / 2 + 0.5, o.r, 0]); cyl(g, o.gear === 'n20' ? 1.5 : 3, 12, M.steel(), [o.len / 2 + o.len * 0.55 + 6, o.r, 0], [0, 0, Math.PI / 2]) }
  else cyl(g, o.big ? 2.5 : 1, 10, M.steel(), [o.len / 2 + 5, o.r, 0], [0, 0, Math.PI / 2])
}
const nema = (size: number, len: number): B => (g) => {
  const c = size / 2
  box(g, size, size, len * 0.1, M.alu(), [0, c, len / 2 - len * 0.05]); box(g, size, size, len * 0.1, M.alu(), [0, c, -len / 2 + len * 0.05])
  box(g, size * 0.97, size * 0.97, len * 0.8, M.black(), [0, c, 0])
  for (let i = 0; i < 6; i++) box(g, size * 0.99, 0.6, len * 0.8, mat('#2a2e35'), [0, c - size * 0.4 + i * size * 0.16, 0])
  cyl(g, size * 0.22, 2, M.alu(), [0, c, len / 2 + 1], [Math.PI / 2, 0, 0]); cyl(g, size > 50 ? 7 : 2.5, 22, M.steel(), [0, c, len / 2 + 12], [Math.PI / 2, 0, 0])
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) cyl(g, 1.6, 0.4, mat('#111'), [sx * size * 0.39, c + sy * size * 0.39, len / 2 + 0.2], [Math.PI / 2, 0, 0])
  box(g, 16, 7, 6, mat('#f5f5f5'), [0, 4, -len / 2 - 3])
}
const bldc: B = (g) => {
  cyl(g, 14, 4, mat('#1d4ed8', { metal: 0.6, rough: 0.35 }), [0, 2, 0]); cyl(g, 14, 18, mat('#c43d36', { metal: 0.7, rough: 0.3 }), [0, 14, 0])
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; box(g, 3, 10, 1.4, mat('#111'), [Math.cos(a) * 13.5, 14, Math.sin(a) * 13.5], [0, -a, 0]) }
  cyl(g, 4, 10, M.steel(), [0, 28, 0]); for (const [c, z] of [['#ef4444', -3], ['#111', 0], ['#facc15', 3]] as const) wire(g, [[10, 2, z], [25, 1, z * 1.5], [45, 1, z * 2]], c, 0.8)
}
const servo = (o: { w: number; h: number; d: number; color: string; metal?: boolean; label: string }): B => (g) => {
  box(g, o.w, o.h, o.d, M.plastic(o.color), [0, o.h / 2, 0])
  for (const sx of [-1, 1]) { box(g, 7, 2.5, o.d, M.plastic(o.color), [sx * (o.w / 2 + 3.5), o.h * 0.7, 0]); cyl(g, 1.2, 2.7, mat('#050505'), [sx * (o.w / 2 + 4), o.h * 0.7, 0]) }
  cyl(g, o.d * 0.35, 4, M.plastic(o.color), [o.w * 0.22, o.h + 2, 0]); cyl(g, 2.5, 4, o.metal ? M.alu() : mat('#f5f5f5'), [o.w * 0.22, o.h + 5, 0])
  box(g, o.d * 1.7, 1.6, 5, o.metal ? M.alu() : mat('#f5f5f5'), [o.w * 0.22, o.h + 7.5, 0])
  box(g, o.w * 0.7, 0.05, o.d * 0.5, textMat([o.label], { bg: o.color, fg: '#f8fafc', size: 60 }), [-o.w * 0.12, o.h + 0.03, 0])
  for (const [c, z] of [['#7a4426', -1.3], ['#ef4444', 0], ['#f59e0b', 1.3]] as const) wire(g, [[-o.w / 2, 3, z], [-o.w / 2 - 15, 2, z], [-o.w / 2 - 40, 1, z * 2]], c, 0.55)
}
const linear: B = (g) => { cyl(g, 12, 70, M.alu(), [0, 12, 0], [0, 0, Math.PI / 2]); cyl(g, 5, 40, M.steel(), [55, 12, 0], [0, 0, Math.PI / 2]); box(g, 30, 26, 26, M.black(), [-40, 13, 0]); cyl(g, 10, 30, M.steel(), [-40, 12, 22], [Math.PI / 2, 0, 0]) }
const leadscrew: B = (g) => { const me = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 120, 24, 60), M.steel()); me.rotation.z = Math.PI / 2; me.position.set(0, 6, 0); g.add(me); for (let i = 0; i < 40; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(4, 0.45, 6, 18), M.steel()); t.rotation.y = Math.PI / 2; t.position.set(-58 + i * 3, 6, 0); g.add(t) } cyl(g, 11, 15, mat('#d4a73a', { metal: 1, rough: 0.3 }), [10, 6, 0], [0, 0, Math.PI / 2]); cyl(g, 22, 3.5, mat('#d4a73a', { metal: 1, rough: 0.3 }), [18, 6, 0], [0, 0, Math.PI / 2]) }
const gt2: B = (g) => {
  cyl(g, 6.4, 7, M.alu(), [0, 8, 0]); cyl(g, 8, 1, M.alu(), [0, 4, 0]); cyl(g, 8, 1, M.alu(), [0, 12, 0]); cyl(g, 7, 8, M.alu(), [0, 16.5, 0]); cyl(g, 2.5, 26, M.steel(), [0, 13, 0])
  const R = 6.6
  for (const z of [R, -R]) box(g, 90, 6, 1.4, M.rubber(), [45, 8, z])
}

// ---------------------------------------------------------------- sürücüler
const l298n: B = (g, s) => { pcb(g, 43, 43, '#c43d36'); heatsink(g, 23, 20, 15, [0, 1.6, -10], '#16181d', 9); chip(g, 17, 3, [0, 13, -1.5], ['L298N'], { legs: 'none' }); terminal(g, 2, [-17, 1.6, 0], '#1e7bd6', Math.PI / 2); terminal(g, 2, [17, 1.6, 0], '#1e7bd6', -Math.PI / 2); terminal(g, 3, [-8, 1.6, 17], '#1e7bd6'); header(g, 6, [10, 1.6, 18]); elco(g, 4, 9, [8, 1.6, 7]); elco(g, 4, 9, [-4, 1.6, 7]); chip(g, 6, 4, [12, 1.6, 0], ['78M05'], { legs: 'soic' }); smd(g, rng(s), [-14, 4, 14, 12], 6) }
const tb6612: B = breakout({ w: 20.3, d: 20.3, color: '#7b2a96', chip: [6, 5, ['TB6612']], pins: 8, label: 'TB6612FNG' })
const drv8833: B = breakout({ w: 18.5, d: 16, color: '#1d4ed8', chip: [5, 4, ['8833']], pins: 6, label: 'DRV8833' })
const bts7960: B = (g, s) => { pcb(g, 50, 50, '#1d4ed8'); heatsink(g, 40, 18, 40, [0, 1.6, -2], '#c7ccd2', 14); terminal(g, 2, [-15, 1.6, 21], '#1d4ed8'); terminal(g, 2, [15, 1.6, 21], '#1d4ed8'); header(g, 8, [0, -1.6, -22], { up: false }); smd(g, rng(s), [-20, 15, 20, 18], 4) }
const md10c: B = (g, s) => { pcb(g, 75, 43, '#c43d36'); for (let i = 0; i < 4; i++) box(g, 6, 2, 6, mat('#1b1d22'), [-8 + i * 9, 2.6, -8]); terminal(g, 4, [-25, 1.6, 0], '#1d6b3a', Math.PI / 2); elco(g, 6, 12, [20, 1.6, -10]); chip(g, 7, 7, [18, 1.6, 10], ['PIC'], { legs: 'qfp' }); header(g, 5, [0, 1.6, 18]); smd(g, rng(s), [-10, 2, 30, 15], 10); smdLed(g, [30, 1.6, 16], '#22c55e') }
const tmc2209: B = (g, s) => { pcb(g, 20.3, 15.2, '#7b2a96', { holes: false }); header(g, 8, [0, 1.6, -6.35], { up: false }); header(g, 8, [0, 1.6, 6.35], { up: false }); heatsink(g, 9, 6, 9, [0, 1.6, 0], '#9aa3ad', 6); trimmer(g, [-7, 1.6, 0]); void s }
const dm556: B = (g) => { box(g, 118, 34, 75, mat('#2a2d33', { metal: 0.4, rough: 0.5 }), [0, 17, 0]); for (let i = 0; i < 12; i++) box(g, 4, 30, 75, mat('#3a3f45', { metal: 0.5 }), [-55 + i * 10, 17, 0]); box(g, 60, 0.05, 20, textMat(['DM556', 'Digital Stepper Drive'], { bg: '#2a2d33', fg: '#e5e7eb' }), [10, 34.03, 0]); terminal(g, 6, [-30, 34, 30], '#1d6b3a'); terminal(g, 4, [25, 34, 30], '#1d6b3a') }
const esc: B = (g) => { box(g, 50, 10, 26, M.plastic('#1d4ed8'), [0, 5, 0]); box(g, 40, 0.05, 14, textMat(['ESC 30A', 'BLHeli_S'], { bg: '#1d4ed8', fg: '#f8fafc' }), [0, 10.05, 0]); for (const [c, z] of [['#ef4444', -4], ['#111', 4]] as const) wire(g, [[-25, 5, z], [-45, 4, z * 1.5], [-70, 3, z * 2]], c, 1.6); for (const [i, z] of [-6, 0, 6].entries()) wire(g, [[25, 5, z], [45, 5, z], [60, 4, z]], ['#111', '#facc15', '#ef4444'][i], 1.2); wire(g, [[-25, 7, 0], [-40, 8, 10], [-60, 6, 20]], '#f5f5f5', 0.4) }

// ---------------------------------------------------------------- güç
const buck = (o: { w: number; d: number; chipName: string; big?: boolean; color?: string }): B => (g, s) => {
  pcb(g, o.w, o.d, o.color ?? '#1d4ed8')
  coil(g, o.big ? 14 : o.w > 30 ? 12 : 5, [0, 1.6, 0]); chip(g, o.big ? 10 : 6, o.big ? 9 : 4, [o.w * 0.25, 1.6, -o.d * 0.25], [o.chipName], { legs: 'soic' })
  if (o.w > 25) { elco(g, o.big ? 5 : 4, o.big ? 11 : 8, [-o.w * 0.33, 1.6, 0]); elco(g, o.big ? 5 : 4, o.big ? 11 : 8, [o.w * 0.33, 1.6, o.d * 0.15]); trimmer(g, [o.w * 0.25, 1.6, o.d * 0.28]) }
  if (o.big) heatsink(g, 14, 10, 14, [-o.w * 0.28, 1.6, -o.d * 0.28], '#c7ccd2', 6)
  smd(g, rng(s), [-o.w / 2 + 2, -o.d / 2 + 2, o.w / 2 - 2, o.d / 2 - 2], 4)
}
const to220 = (label: string, heat = true): B => (g) => {
  box(g, 10, 9, 4.5, M.black(), [0, 4.5 + 13, 0]); if (heat) { box(g, 10, 6.5, 1.3, M.tin(), [0, 9 + 13 + 3.25, 1.6]); cyl(g, 1.8, 1.5, mat('#050505'), [0, 9 + 13 + 3.5, 1.6], [Math.PI / 2, 0, 0]) }
  box(g, 9, 6, 0.05, textMat([label], { bg: '#16181d', fg: '#c9ccd2' }), [0, 18, -2.28], [0, Math.PI, 0])
  for (const x of [-2.54, 0, 2.54]) box(g, 0.8, 13, 0.5, M.tin(), [x, 6.5, 0])
}
const to92 = (label: string): B => (g) => {
  const me = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 5, 24, 1, false, 0, Math.PI), M.black()); me.position.set(0, 15.5, 0); g.add(me); box(g, 4.8, 5, 0.3, M.black(), [0, 15.5, 0])
  box(g, 4.4, 1.6, 0.05, textMat([label], { bg: '#16181d', fg: '#c9ccd2' }), [0, 15.5, -0.18], [0, Math.PI, 0])
  for (const x of [-1.27, 0, 1.27]) box(g, 0.45, 13, 0.45, M.tin(), [x, 6.5, 0])
}
const battery = (o: { kind: 'cyl' | 'pouch' | 'box' | 'coin'; r?: number; len?: number; color: string; label: string; w?: number; h?: number; d?: number }): B => (g) => {
  if (o.kind === 'cyl') {
    cyl(g, o.r!, o.len!, mat(o.color, { rough: 0.3, clear: true }), [0, o.r!, 0], [0, 0, Math.PI / 2])
    cyl(g, o.r! * 0.98, 0.6, M.steel(), [o.len! / 2 + 0.3, o.r!, 0], [0, 0, Math.PI / 2]); cyl(g, o.r! * 0.35, 1.2, M.steel(), [o.len! / 2 + 0.9, o.r!, 0], [0, 0, Math.PI / 2])
    const lab = new THREE.Mesh(new THREE.CylinderGeometry(o.r! * 1.002, o.r! * 1.002, o.len! * 0.5, 32, 1, true, -0.6, 1.2), textMat([o.label], { bg: o.color, fg: '#ffffff', w: 256, h: 96 }))
    lab.rotation.z = Math.PI / 2; lab.position.set(0, o.r!, 0); g.add(lab)
  } else if (o.kind === 'pouch') {
    box(g, o.w!, o.h!, o.d!, mat('#c9ced6', { metal: 0.4, rough: 0.5 }), [0, o.h! / 2, 0]); box(g, o.w! - 2, 0.1, o.d! - 2, textMat([o.label, '11.1V 2200mAh'], { bg: o.color, fg: '#ffffff' }), [0, o.h! + 0.05, 0])
    wire(g, [[o.w! / 2, o.h! / 2, -4], [o.w! / 2 + 20, o.h! / 2, -6], [o.w! / 2 + 35, 3, -10]], '#ef4444', 1.4); wire(g, [[o.w! / 2, o.h! / 2, 4], [o.w! / 2 + 20, o.h! / 2, 6], [o.w! / 2 + 35, 3, 10]], '#111', 1.4)
    box(g, 6, 4, 14, M.plastic('#f5f5f5'), [o.w! / 2 + 3, 3, 15]); for (let i = 0; i < 4; i++) wire(g, [[o.w! / 2, 3, 12 + i], [o.w! / 2 + 2, 3, 12 + i]], ['#111', '#ef4444', '#facc15', '#3b82f6'][i], 0.35)
  } else if (o.kind === 'box') {
    box(g, o.w!, o.h!, o.d!, M.plastic(o.color), [0, o.h! / 2, 0]); box(g, o.w! * 0.8, 0.05, o.d! * 0.6, textMat([o.label], { bg: o.color, fg: '#fff' }), [0, o.h! + 0.03, 0])
    box(g, 6, 4, 6, mat('#ef4444'), [-o.w! * 0.35, o.h! + 2, -o.d! * 0.3]); box(g, 6, 4, 6, M.black(), [o.w! * 0.35, o.h! + 2, -o.d! * 0.3])
  } else {
    cyl(g, 10, 3.2, M.steel(), [0, 1.6, 0], undefined, 10, 48); box(g, 12, 0.05, 5, textMat(['CR2032 3V'], { bg: '#c9ced6', fg: '#3a3f45', size: 54 }), [0, 3.23, 0])
  }
}
const bmsBoard = (w: number, d: number, label: string, color = '#1d4ed8', big = false): B => (g, s) => {
  pcb(g, w, d, color); for (let i = 0; i < (big ? 6 : 2); i++) box(g, 5, 1.2, 6, mat('#1b1d22'), [-w / 3 + i * 6, 2.2, -d / 4])
  chip(g, 5, 4, [w / 5, 1.6, d / 5], [label], { legs: 'soic' }); smd(g, rng(s), [-w / 2 + 2, 0, w / 2 - 2, d / 2 - 2], 8)
  if (big) { for (const x of [-w / 2 + 6, w / 2 - 6]) wire(g, [[x, 2, d / 2], [x * 1.1, 2, d / 2 + 15], [x * 1.2, 1, d / 2 + 30]], x < 0 ? '#111' : '#ef4444', 2) ; box(g, 20, 6, 6, mat('#f5f5f5'), [0, 4.6, -d / 2 + 4]) }
  else { usb(g, 'micro', [-w / 2 + 3, 1.6, 0], Math.PI / 2); smdLed(g, [w / 3, 1.6, -d / 4], '#ef4444'); smdLed(g, [w / 3 + 3, 1.6, -d / 4], '#3b82f6') }
}

// ---------------------------------------------------------------- pasifler ve yarı iletkenler
const resistor: B = (g) => { const body = new THREE.Mesh(new THREE.CapsuleGeometry(1.25, 3.5, 6, 16), mat('#d9b98a', { rough: 0.5 })); body.rotation.z = Math.PI / 2; body.position.set(0, 4, 0); g.add(body); for (const [x, c] of [[-1.4, '#7a4426'], [-0.5, '#111'], [0.4, '#c43d36'], [1.6, '#d4a73a']] as const) cyl(g, 1.32, 0.45, mat(c), [x, 4, 0], [0, 0, Math.PI / 2]); for (const sx of [-1, 1]) cyl(g, 0.3, 14, M.tin(), [sx * 9.5, 4, 0], [0, 0, Math.PI / 2]) }
const capacitor: B = (g) => { elco(g, 4, 11, [-5, 0, 0]); for (const x of [-6.2, -3.8]) box(g, 0.5, 6, 0.5, M.tin(), [x, -3, 0]); const disc = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 1.5, 24), mat('#c47a2b', { rough: 0.5 })); disc.rotation.x = Math.PI / 2; disc.position.set(6, 6, 0); g.add(disc); for (const x of [5, 7]) box(g, 0.4, 8, 0.4, M.tin(), [x, 0, 0]) }
const led: B = (g) => { cyl(g, 2.5, 5, mat('#ef4444', { opacity: 0.85, rough: 0.1, emissive: '#ef4444' }), [0, 9.5, 0]); const dome = new THREE.Mesh(new THREE.SphereGeometry(2.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat('#ef4444', { opacity: 0.85, rough: 0.1, emissive: '#ef4444' })); dome.position.set(0, 12, 0); g.add(dome); cyl(g, 2.9, 1, mat('#ef4444', { opacity: 0.85, rough: 0.1 }), [0, 7.5, 0]); box(g, 0.5, 16, 0.5, M.tin(), [-1.27, 0, 0]); box(g, 0.5, 14, 0.5, M.tin(), [1.27, 1, 0]) }
const inductor: B = (g) => { coil(g, 18, [0, 0, 0], true); for (const x of [-6, 6]) box(g, 0.6, 6, 0.6, M.copper(), [x, -2, 6]) }
const button: B = (g) => { box(g, 6, 3.5, 6, M.black(), [0, 1.75, 0]); box(g, 6.2, 0.3, 6.2, M.steel(), [0, 3.6, 0]); cyl(g, 1.8, 2, mat('#7a4426'), [0, 4.7, 0]); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.6, 3, 0.4, M.tin(), [sx * 3.4, 0, sz * 2.3]) }
const diode = (body: string, band: string, r = 1.35, l = 5.2): B => (g) => { cyl(g, r, l, mat(body, { rough: 0.4 }), [0, 4, 0], [0, 0, Math.PI / 2]); cyl(g, r * 1.02, 0.8, mat(band), [l / 2 - 0.8, 4, 0], [0, 0, Math.PI / 2]); for (const sx of [-1, 1]) cyl(g, 0.4, 12, M.tin(), [sx * (l / 2 + 6), 4, 0], [0, 0, Math.PI / 2]) }
const sot23: B = (g) => { pcb(g, 10, 7, '#1d6b3a', { holes: false }); chip(g, 2.9, 1.3, [0, 1.6, 0], ['A09T'], { legs: 'soic', h: 1 }); header(g, 3, [0, 1.6, 2.5], { up: false }) }
const bss138: B = breakout({ w: 15, d: 13, color: '#c43d36', pins: 6, label: 'LV ↔ HV', extra: (g) => { for (let i = 0; i < 4; i++) chip(g, 2.9, 1.3, [-4.5 + i * 3, 1.6, -2], [''], { legs: 'soic', h: 1 }) } })
const canBoard = (lbl: string, color: string): B => (g, s) => { pcb(g, 30, 20, color); chip(g, 6, 4, [-3, 1.6, -2], [lbl], { legs: 'soic' }); terminal(g, 2, [10, 1.6, 0], '#1d6b3a', -Math.PI / 2); header(g, 4, [-4, 1.6, 8], { up: false }); smd(g, rng(s), [-12, -8, 2, 6], 5) }
const hc05: B = (g, s) => { pcb(g, 37, 16, '#1d4ed8'); box(g, 27, 2.2, 13, mat('#14532d'), [3, 2.7, 0]); chip(g, 7, 7, [-1, 3.8, 0], ['BC417'], { legs: 'qfp' }); box(g, 6, 0.2, 13, textMat(['⌇'], { bg: '#14532d', fg: '#d4a73a', size: 70 }), [13, 3.9, 0]); header(g, 6, [-17, 1.6, 0], { axis: 'z' }); smdLed(g, [-10, 1.6, 5], '#ef4444'); void s }
const ch340: B = (g, s) => { pcb(g, 36, 16, '#c43d36', { holes: false }); box(g, 12, 4.5, 15, M.steel(), [-20, 3.85, 0]); chip(g, 5, 4, [0, 1.6, 0], ['CH340G'], { legs: 'soic' }); box(g, 3.2, 2.5, 6, M.steel(), [8, 2.85, 0]); header(g, 6, [16, 1.6, 0], { axis: 'z' }); smd(g, rng(s), [-10, -6, 12, 6], 5) }
const stlink: B = (g) => { box(g, 52, 9, 16, mat('#c7ccd2', { metal: 0.7, rough: 0.35 }), [0, 4.5, 0]); box(g, 12, 4.5, 12, M.steel(), [-31, 4.5, 0]); box(g, 30, 0.05, 8, textMat(['ST-LINK V2'], { bg: '#c7ccd2', fg: '#1d4ed8', size: 60 }), [4, 9.03, 0]); box(g, 6, 7, 10, M.black(), [28, 4.5, 0]); for (let i = 0; i < 4; i++) wire(g, [[31, 4.5, -3 + i * 2], [45, 4, -6 + i * 4], [60, 2, -10 + i * 6]], ['#ef4444', '#111', '#facc15', '#22c55e'][i], 0.45) }
const logic: B = (g) => { box(g, 52, 13, 26, M.alu(), [0, 6.5, 0]); box(g, 36, 0.05, 10, textMat(['LOGIC 8CH 24MHz'], { bg: '#c7ccd2', fg: '#1b1d22', size: 50 }), [0, 13.03, 0]); header(g, 10, [24, 1, 0], { axis: 'z' }); box(g, 8, 4, 8, M.steel(), [-28, 6.5, 0]); for (let i = 0; i < 8; i++) wire(g, [[28, 8, -11 + i * 2.5], [45, 6, -15 + i * 4.3], [70, 2, -20 + i * 5.7]], ['#111', '#7a4426', '#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'][i], 0.45) }
const scope: B = (g) => { box(g, 320, 150, 110, mat('#e5e7eb', { rough: 0.45 }), [0, 75, 0]); box(g, 180, 110, 2, mat('#0a0a0a', { rough: 0.2 }), [-55, 80, -55.2]); const m = textMat(['~∿~∿~∿~', 'CH1 2V  1ms'], { bg: '#0b1d2e', fg: '#facc15', w: 512, h: 320, font: 'monospace' }); const sc = new THREE.Mesh(new THREE.PlaneGeometry(170, 100), m); sc.position.set(-55, 80, -56.4); sc.rotation.y = Math.PI; g.add(sc); for (let i = 0; i < 6; i++) cyl(g, 7, 6, M.black(), [65 + (i % 3) * 30, 110 - Math.floor(i / 3) * 35, -57], [Math.PI / 2, 0, 0]); for (let i = 0; i < 4; i++) cyl(g, 6, 8, mat('#9aa3ad', { metal: 0.8 }), [60 + i * 25, 25, -58], [Math.PI / 2, 0, 0]) }
const multimeter: B = (g) => { box(g, 85, 30, 170, M.plastic('#facc15'), [0, 15, 0]); box(g, 72, 26, 158, M.black(), [0, 16, 0]); box(g, 55, 1, 32, mat('#9aa58c', { rough: 0.3 }), [0, 29.6, -45]); screen(g, 52, 28, [0, 30.15, -45], ['  12.48 V'], '#9aa58c', '#111'); cyl(g, 22, 8, M.black(), [0, 33, 15]); box(g, 6, 3, 40, mat('#e5e7eb'), [0, 37.5, 15], [0, 0.6, 0]); for (const [x, c] of [[-22, '#111'], [0, '#ef4444'], [22, '#ef4444']] as const) cyl(g, 4, 4, mat(c), [x, 30, 62]) }

// ---------------------------------------------------------------- eşleme
const STM32: B = (g, s) => { pcb(g, 53, 22.5, '#1d4ed8', { holes: false }); header(g, 20, [0, 1.6, -9.6], { up: false }); header(g, 20, [0, 1.6, 9.6], { up: false }); chip(g, 7, 7, [3, 1.6, 0], ['STM32F103', 'C8T6'], { legs: 'qfp' }); usb(g, 'micro', [-25, 1.6, 0], Math.PI / 2); box(g, 6, 1.6, 3, M.steel(), [-10, 2.4, 5]); header(g, 4, [24, 1.6, 0], { axis: 'z' }); box(g, 5, 1.6, 2.4, mat('#f4f4f2'), [-12, 2.4, -5]); smd(g, rng(s), [-18, -6, 20, 6], 10); smdLed(g, [18, 1.6, 5], '#ef4444') }
const MEGA = uno('#1f6fb8', 'MEGA 2560'); const DUE = uno('#1f6fb8', 'DUE'); const UNOQ = uno('#0f766e', 'UNO Q', true); const VENTUNO = uno('#16181d', 'VENTUNO Q', true)
const megaLike = (base: B, w: number): B => (g, s) => { base(g, s); pcb(g, w - 68.6, 53.4, '#1f6fb8', { holes: false, x: 34.3 + (w - 68.6) / 2 - 0.5 }); header(g, 18, [34.3 + (w - 68.6) / 2, 1.6, 0], { rows: 2, axis: 'z', female: true }) }

const MAP: Record<string, B> = {
  'arduino-uno-atmega328p': uno(), 'arduino-uno-r4-wifi': uno('#0f7c8a', 'UNO R4 WiFi', true), 'arduino-mega': megaLike(MEGA, 101.5), 'arduino-due': megaLike(DUE, 101.5),
  'arduino-uno-q': UNOQ, 'arduino-ventuno-q': VENTUNO, 'arduino-nano-esp32': nanoLike('#0f7c8a', 'ESP32-S3', 'c'), 'arduino-nesso-n1': nanoLike('#16181d', 'ESP32-C6', 'c', 48, 24),
  'esp32-esp32-wroom-devkit': esp32Dev, esp8266: nanoLike('#16181d', 'ESP8266EX', 'micro', 48, 26), stm32: STM32, 'esp32-s3-tinyml': nanoLike('#16181d', 'ESP32-S3', 'c', 52, 26),
  'raspberry-pi-4b': pi4, 'jetson-orin-nano': jetson(false), 'nvidia-jetson-orin-nx-16gb': jetson(true), 'google-coral-dev-board': coral, 'raspberry-pi-ai-hat-hailo-8l': hailo, 'qualcomm-iq9-qcs8550': qcom,
  'esp32-cam': esp32cam, huskylens, 'pixy2-cmucam5': pixy, 'grove-vision-ai-v2': grove,
  mpu6050: imu('#1d4ed8', 'GY-521', 'MPU6050'), bmi270: imu('#7b2a96', 'BMI270', 'BMI270', 18, 13), bno085: imu('#16181d', 'BNO085', 'BNO085', 25, 20), 'icm-20948': imu('#7b2a96', 'ICM-20948', '20948', 25, 18),
  dht22, ds18b20, mlx90614: mlx, amg8833: amg,
  'hc-sr04': hcsr04(), 'jsn-sr04t': jsn, 'rcwl-1601': hcsr04('#16181d', 'RCWL-1601'), 'us-100': hcsr04('#1d6b3a', 'US-100'), a02yyuw: jsn, 'maxbotix-mb1010': breakout({ w: 22, d: 20, color: '#1d6b3a', pins: 7, label: 'MB1010', extra: (g) => { cyl(g, 8, 13, M.black(), [0, -6.5, 0]) } }),
  'vl53l0x-tof': tofSmall, 'tf-luna-lidar': tfluna, 'ir-mesafe-sharp': sharp,
  'mq-2': mq('MQ-2'), 'mq-3': mq('MQ-3'), 'mq-4': mq('MQ-4'), 'mq-7': mq('MQ-7'), 'mq-135': mq('MQ-135'),
  sgp30: breakout({ w: 18, d: 18, color: '#7b2a96', pins: 4, chip: [2.5, 2.5, ['SGP']], label: 'SGP30' }), bme680: breakout({ w: 18, d: 18, color: '#7b2a96', pins: 6, chip: [3, 3, ['680']], label: 'BME680' }),
  pms5003, ccs811: breakout({ w: 21, d: 18, color: '#1d4ed8', pins: 8, chip: [2.7, 4, ['CCS']], label: 'CCS811' }), bme280: breakout({ w: 13, d: 10.5, color: '#7b2a96', pins: 4, chip: [2.5, 2.5, ['280']], label: 'BME280' }),
  ldr: (g) => { const d = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 2, 24), mat('#e9d8a6')); d.position.set(0, 13, 0); g.add(d); const curve = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.18, 6, 24), mat('#c43d36')); curve.rotation.x = Math.PI / 2; curve.position.set(0, 14.05, 0); g.add(curve); box(g, 0.5, 13, 0.5, M.tin(), [-1.3, 6, 0]); box(g, 0.5, 13, 0.5, M.tin(), [1.3, 6, 0]) },
  '16x2-lcd-paralel': lcd1602(false), 'pcf8574-i2c-lcd-adaptoru': lcd1602(true), 'oled-ssd1306-0-96': oled, 'tft-st7735-1-8': tft(35, 28), 'gc9a01-yuvarlak': tft(32, 32, true),
  'ili9341-xpt2046-dokunmatik-2-4': tft(49, 37, false, 'ILI9341 touch', '#0b1734'), 'e-paper-2-9': epaper,
  'bo-motor-sari': dcMotor({ r: 9, len: 22, gear: 'bo' }), 'metal-disli-dc-motor': dcMotor({ r: 12.5, len: 30, gear: 'metal' }), 'n20-mikro-motor': dcMotor({ r: 6, len: 15, gear: 'n20' }),
  '555-775-dc-motor': dcMotor({ r: 21, len: 66, big: true }), 'nema17-step-motor': nema(42.3, 40), 'nema-23-step-motor': nema(57, 56), 'nema-34-step-motor': nema(86, 80),
  'bldc-fircasiz-motor': bldc, 'lineer-aktuator': linear, 't8-vidali-mil-lead-screw': leadscrew, 'gt2-kayis-kasnak-20-dis': gt2,
  sg90: servo({ w: 22.5, h: 22.7, d: 12, color: '#1d4ed8', label: 'SG90' }), mg90s: servo({ w: 22.5, h: 22.7, d: 12, color: '#16181d', metal: true, label: 'MG90S' }),
  mg996r: servo({ w: 40.7, h: 37, d: 19.7, color: '#16181d', metal: true, label: 'MG996R' }), ds3218: servo({ w: 40, h: 38, d: 20, color: '#16181d', metal: true, label: 'DS3218' }), ds3225: servo({ w: 40, h: 39, d: 20, color: '#c43d36', metal: true, label: 'DS3225' }),
  l298n, tb6612fng: tb6612, drv8833, bts7960, 'cytron-md10c': md10c, tmc2209, dm556, 'esc-blheli-s-32': esc,
  'lm7805-lineer-regulator': to220('LM7805'), 'lm2596-buck': buck({ w: 43, d: 21, chipName: 'LM2596' }), 'mp1584-mini-360-buck': buck({ w: 22, d: 17, chipName: 'MP1584' }),
  'xl4015-buck': buck({ w: 54, d: 26, chipName: 'XL4015', big: true }), 'xl4016-buck': buck({ w: 60, d: 50, chipName: 'XL4016', big: true }), 'ap63200-buck': buck({ w: 20, d: 15, chipName: 'AP63200', color: '#16181d' }), 'lm2576-buck': buck({ w: 48, d: 30, chipName: 'LM2576', color: '#1d6b3a' }),
  'tp4056-korumali-bms': bmsBoard(26, 17, 'TP4056'), 'jbd-overkill-solar-bms': bmsBoard(70, 50, 'JBD', '#16181d', true), 'aktif-dengeleme-bms': bmsBoard(80, 45, 'BALANCE', '#1d6b3a', true), 'seplos-smart-bms': bmsBoard(110, 70, 'SEPLOS', '#16181d', true),
  'max17048-max17043-yakit-gostergesi': breakout({ w: 23, d: 18, color: '#16181d', pins: 6, chip: [2, 2, ['48']], label: 'MAX17048' }),
  'kursun-asit-batarya': battery({ kind: 'box', w: 151, h: 94, d: 65, color: '#16181d', label: '12V 7Ah SLA' }), 'li-ion-18650-batarya': battery({ kind: 'cyl', r: 9.25, len: 65, color: '#1d4ed8', label: '18650 3.7V' }),
  'lipo-batarya': battery({ kind: 'pouch', w: 105, h: 24, d: 34, color: '#16181d', label: 'LiPo 3S' }), 'nimh-batarya': battery({ kind: 'cyl', r: 7.2, len: 50, color: '#16a34a', label: 'NiMH 1.2V' }),
  'nicd-batarya': battery({ kind: 'cyl', r: 7.2, len: 50, color: '#a16207', label: 'NiCd 1.2V' }), 'alkalin-batarya': battery({ kind: 'cyl', r: 7.2, len: 50, color: '#c2410c', label: 'ALKALİN 1.5V' }),
  'coin-cell-cr2032-batarya': battery({ kind: 'coin', color: '#c9ced6', label: 'CR2032' }), 'lifepo4-batarya': battery({ kind: 'cyl', r: 16, len: 70, color: '#16a34a', label: 'LiFePO4 32700' }),
  'cinko-karbon-batarya': battery({ kind: 'cyl', r: 7.2, len: 50, color: '#7f1d1d', label: 'Zn-C 1.5V' }), 'sodyum-iyon-batarya': battery({ kind: 'cyl', r: 9.25, len: 65, color: '#0e7490', label: 'Na-ion 3.1V' }),
  direnc: resistor, 'kondansator-elektrolitik-seramik': capacitor, led, 'bobin-induktor': inductor, 'buton-anahtar': button,
  '1n4007-diyot': diode('#16181d', '#c9ced6'), bc547: to92('BC547'), '2n2222': to92('2N2222'), tip122: to220('TIP122'), irf540: to220('IRF540N'), irlz44n: to220('IRLZ44N'), ao3400: sot23,
  'bss138-lojik-seviye-cevirici': bss138, 'sm6t36a-tvs-diyot': (g) => { box(g, 7, 2.4, 4.6, M.black(), [0, 1.2, 0]); box(g, 1, 0.05, 4.6, mat('#c9ced6'), [-2.6, 2.42, 0]); for (const sx of [-1, 1]) box(g, 1.5, 1, 3, M.tin(), [sx * 4, 0.5, 0]) },
  'pesd5v0s1ub-tvs-diyot': (g) => { box(g, 2.6, 0.9, 1.4, M.black(), [0, 0.45, 0]); for (const sx of [-1, 1]) box(g, 0.5, 0.5, 0.9, M.tin(), [sx * 1.5, 0.25, 0]) }, 'tvs0500-1-6v0-tvs-diyot': diode('#c2410c', '#16181d', 1.5, 6),
  'mcp2551-can-transceiver': canBoard('MCP2551', '#1d4ed8'), 'tja1050-can-transceiver': canBoard('TJA1050', '#1d6b3a'), 'sn65hvd230-can-transceiver': canBoard('VP230', '#1d4ed8'),
  'hc-05-bluetooth-modulu': hc05, 'ch340-usb-seri-cip': ch340, 'st-link-j-link-debugger': stlink, 'logic-analyzer': logic, osiloskop: scope, multimetre: multimeter,
}

/** Parçanın 3B modeli: merkezlenmiş, en büyük boyutu ~2 birime ölçeklenmiş, zemine (y=0) oturtulmuş grup. */
export function buildPart(slug: string, group = ''): THREE.Group {
  const g = new THREE.Group()
  const b = MAP[slug] ?? breakout({ w: 30, d: 22, color: group.startsWith('sensor') ? '#7b2a96' : '#1d4ed8', pins: 6, chip: [5, 5, [slug.slice(0, 8).toUpperCase()]], label: slug.toUpperCase().slice(0, 10) })
  b(g, slug)
  const bb = new THREE.Box3().setFromObject(g)
  const size = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3())
  const s = 2 / Math.max(size.x, size.y, size.z, 1e-3)
  const outer = new THREE.Group(); outer.add(g)
  g.position.set(-c.x, -bb.min.y, -c.z); outer.scale.setScalar(s)
  outer.userData.height = size.y * s
  return outer
}

export const MODELED_SLUGS = Object.keys(MAP)
export type { V3 }
