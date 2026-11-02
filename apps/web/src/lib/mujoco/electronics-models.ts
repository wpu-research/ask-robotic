import * as THREE from 'three'

type BoardType = 'uno' | 'esp32'

function printedTexture(type: BoardType, shield = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024; canvas.height = 768
  const context = canvas.getContext('2d')!
  context.fillStyle = shield ? '#bfc4c8' : type === 'uno' ? '#086179' : '#171b20'
  context.fillRect(0, 0, 1024, 768)
  context.strokeStyle = shield ? '#8c949a' : type === 'uno' ? '#26798a' : '#303b39'
  context.lineWidth = 3
  if (!shield) for (let index = 0; index < 18; index++) {
    const start = 50 + index * 49
    context.beginPath(); context.moveTo(start, 35); context.lineTo(start, 120 + index % 4 * 34); context.lineTo(start + 60, 210 + index % 4 * 34); context.lineTo(start + 60, 650); context.stroke()
  }
  context.fillStyle = shield ? '#454c51' : '#e4eeeb'
  context.textAlign = 'center'; context.textBaseline = 'middle'
  if (shield) {
    context.font = '64px sans-serif'; context.fillText('ESP-WROOM-32', 512, 210)
    context.font = '45px sans-serif'; context.fillText('Wi-Fi  +  Bluetooth', 512, 330)
    context.font = '38px monospace'; context.fillText('2.4 GHz', 512, 440)
    context.font = '30px sans-serif'; context.fillText('ESP32', 512, 565)
  } else {
    context.font = 'bold 100px sans-serif'; context.fillText(type === 'uno' ? 'UNO' : 'ESP32', 570, 320)
    context.font = '30px sans-serif'; context.fillText('MACADEMIA  ·  ROBOTICS', 570, 410)
    context.font = '22px monospace'
    const labels = type === 'uno' ? ['SCL', 'SDA', 'AREF', 'GND', '13', '12', '~11', '~10', '~9', '8', '7', '~6', '~5', '4', '~3', '2', 'TX', 'RX'] : ['EN', 'VP', 'VN', '34', '35', '32', '33', '25', '26', '27', '14', '12', '13', 'GND', 'VIN']
    labels.forEach((label, index) => context.fillText(label, 90 + index / (labels.length - 1) * 840, 100))
    const lower = type === 'uno' ? ['IOREF', 'RST', '3V3', '5V', 'GND', 'GND', 'VIN', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'] : ['23', '22', 'TX', 'RX', '21', '19', '18', '5', '17', '16', '4', '0', '2', '15', '3V3']
    lower.forEach((label, index) => context.fillText(label, 90 + index / (lower.length - 1) * 840, 670))
    context.fillText(type === 'uno' ? 'DIGITAL  (PWM ~)' : 'GPIO', 520, 165)
    context.fillText(type === 'uno' ? 'POWER                 ANALOG IN' : 'DEVKIT', 520, 600)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

export function buildElectronicsModel(type: BoardType): THREE.Group {
  const group = new THREE.Group()
  group.name = `electronics-${type}`
  const materials = {
    black: new THREE.MeshStandardMaterial({ color: '#171b20', roughness: 0.65 }),
    silver: new THREE.MeshStandardMaterial({ color: '#c1c7cb', metalness: 0.8, roughness: 0.3 }),
    gold: new THREE.MeshStandardMaterial({ color: '#c6a453', metalness: 0.7, roughness: 0.35 }),
    pcb: new THREE.MeshStandardMaterial({ color: type === 'uno' ? '#086179' : '#171b20', roughness: 0.65 }),
    red: new THREE.MeshStandardMaterial({ color: '#d4473c', roughness: 0.5 }),
    green: new THREE.MeshStandardMaterial({ color: '#75c05a', emissive: '#173c12', roughness: 0.4 }),
  }
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, pos: number[]) => {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(pos[0], pos[1], pos[2]); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh)
    return mesh
  }
  const box = (size: number[], pos: number[], material: THREE.Material) => add(new THREE.BoxGeometry(...size as [number, number, number]), material, pos)
  const cylinder = (radius: number, height: number, pos: number[], material: THREE.Material) => add(new THREE.CylinderGeometry(radius, radius, height, 20).rotateX(Math.PI / 2), material, pos)
  const width = type === 'uno' ? 0.068 : 0.052
  const depth = type === 'uno' ? 0.052 : 0.028
  box([width, depth, 0.0016], [0, 0, 0], materials.pcb)
  const printed = new THREE.MeshStandardMaterial({ map: printedTexture(type), roughness: 0.6, metalness: 0.05 })
  add(new THREE.PlaneGeometry(width - 0.001, depth - 0.001), printed, [0, 0, 0.00085])
  for (const side of [-1, 1]) {
    const segments = type === 'uno' ? side === 1 ? [10, 8] : [8, 6] : [15]
    const pitch = type === 'uno' ? 0.00254 : 0.003
    const gap = 0.002
    const length = segments.reduce((sum, count) => sum + count * pitch, 0) + (segments.length - 1) * gap
    let start = (type === 'uno' ? 0.006 : 0.002) - length / 2
    for (const count of segments) {
      box([count * pitch, 0.0028, 0.005], [start + count * pitch / 2, side * (depth / 2 - 0.0025), 0.0033], materials.black)
      for (let index = 0; index < count; index++) {
        const pos = [start + (index + 0.5) * pitch, side * (depth / 2 - 0.0025), 0]
        box([0.00065, 0.00065, 0.009], [pos[0], pos[1], -0.002], materials.silver)
        cylinder(0.0008, 0.0003, [pos[0], pos[1], 0.0059], materials.gold)
        cylinder(0.0004, 0.00035, [pos[0], pos[1], 0.0061], materials.black)
      }
      start += count * pitch + gap
    }
  }
  if (type === 'uno') {
    box([0.014, 0.012, 0.01], [-0.029, 0.011, 0.0056], materials.silver)
    box([0.0004, 0.009, 0.0065], [-0.0362, 0.011, 0.0058], materials.black)
    box([0.001, 0.005, 0.002], [-0.0365, 0.011, 0.0048], materials.pcb)
    box([0.012, 0.008, 0.009], [-0.028, -0.017, 0.0054], materials.black)
    box([0.025, 0.007, 0.003], [0.006, -0.006, 0.0025], materials.black)
    for (let index = 0; index < 14; index++) for (const side of [-1, 1]) box([0.0007, 0.002, 0.0007], [-0.0057 + index * 0.0018, -0.006 + side * 0.004, 0.0015], materials.silver)
    box([0.006, 0.006, 0.0015], [-0.015, 0.009, 0.002], materials.black)
    box([0.005, 0.003, 0.0015], [-0.023, 0.022, 0.002], materials.silver)
    cylinder(0.0012, 0.0013, [-0.023, 0.022, 0.003], materials.red)
    for (const offset of [0, 0.006]) { cylinder(0.0024, 0.006, [-0.018 + offset, -0.016, 0.004], materials.black); cylinder(0.0023, 0.0003, [-0.018 + offset, -0.016, 0.0072], materials.silver) }
    box([0.005, 0.002, 0.002], [-0.002, 0.01, 0.002], materials.silver)
    box([0.0015, 0.001, 0.001], [0.011, 0.016, 0.002], materials.green)
    box([0.005, 0.007, 0.002], [0.024, 0.008, 0.002], materials.black)
    for (const column of [-1, 1]) for (let row = 0; row < 3; row++) box([0.00065, 0.00065, 0.006], [0.024 + column * 0.00127, 0.00546 + row * 0.00254, 0.004], materials.silver)
    for (const pos of [[-0.021, -0.021], [0.028, -0.021], [0.028, 0.02]]) {
      add(new THREE.TorusGeometry(0.0015, 0.00035, 6, 16), materials.silver, [pos[0], pos[1], 0.001])
      cylinder(0.001, 0.0002, [pos[0], pos[1], 0.001], materials.black)
    }
  } else {
    box([0.019, 0.018, 0.001], [0.003, 0, 0.0016], materials.pcb)
    box([0.018, 0.017, 0.0025], [0.002, 0, 0.0033], materials.silver)
    const shield = new THREE.MeshStandardMaterial({ map: printedTexture(type, true), roughness: 0.5, metalness: 0.6 })
    add(new THREE.PlaneGeometry(0.0175, 0.0165), shield, [0.002, 0, 0.0046])
    for (let index = 0; index < 10; index++) for (const side of [-1, 1]) box([0.00065, 0.0012, 0.0004], [-0.0055 + index * 0.0016, side * 0.0092, 0.002], materials.gold)
    box([0.008, 0.006, 0.0028], [-0.023, 0, 0.0024], materials.silver)
    box([0.0004, 0.0048, 0.0016], [-0.0272, 0, 0.0025], materials.black)
    for (const side of [-1, 1]) { box([0.0035, 0.003, 0.0015], [-0.021, side * 0.008, 0.002], materials.silver); cylinder(0.001, 0.0012, [-0.021, side * 0.008, 0.0033], materials.black) }
    box([0.004, 0.004, 0.001], [-0.013, 0, 0.0018], materials.black)
    box([0.0015, 0.001, 0.001], [-0.016, -0.005, 0.0015], materials.red)
    for (let index = 0; index < 5; index++) {
      box([0.001, 0.012, 0.0002], [0.015 + index * 0.002, 0, 0.0012], materials.gold)
      if (index < 4) box([0.002, 0.001, 0.0002], [0.016 + index * 0.002, index % 2 ? -0.0055 : 0.0055, 0.0012], materials.gold)
    }
  }
  for (let index = 0; index < 12; index++) {
    const pos = [-0.012 + index % 6 * 0.004, 0.007 + Math.floor(index / 6) * 0.004, 0.0015]
    box([0.0016, 0.0008, 0.0006], pos, materials.black)
    box([0.002, 0.001, 0.0002], [pos[0], pos[1], 0.0012], materials.silver)
  }
  return group
}
