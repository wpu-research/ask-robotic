// Ortak multirotor modeli (ML drone iniş projesi ve drone dersi 3B sahneleri): gövde, kollar, iniş takımı, pervaneler, ön LED'ler.
// Model eksenleri: burun +x, sağ +z, yukarı +y. Dört motorda pervane sırası [sağ ön, sol ön, sağ arka, sol arka];
// QUAD_X_ROTOR, PX4 Quad X numarasından (M1..M4) bu sıraya çevirir. ghost: tek renkli yarı saydam kopya (kestirim "hayaleti").
import * as THREE from 'three'

const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o })
function mesh(g: THREE.BufferGeometry, m: THREE.Material, pos: [number, number, number] = [0, 0, 0], shadow = true) {
  const o = new THREE.Mesh(g, m)
  o.position.set(...pos)
  o.castShadow = shadow
  o.receiveShadow = true
  return o
}

export interface QuadModel {
  group: THREE.Group
  /** Pervane grupları (y ekseninde döndürülür). */ rotors: THREE.Group[]
  /** Pervane göbeklerinin model içindeki konumları. */ motorPos: THREE.Vector3[]
  ledMat: THREE.MeshStandardMaterial
}

/** M1 sağ ön, M2 sol arka, M3 sol ön, M4 sağ arka → pervane dizisindeki sıra. */
export const QUAD_X_ROTOR = [0, 3, 1, 2] as const

export function makeQuadModel(o: { motors?: number; ghost?: number; opacity?: number } = {}): QuadModel {
  const n = o.motors ?? 4
  const ghost = o.ghost !== undefined ? new THREE.MeshStandardMaterial({ color: o.ghost, transparent: true, opacity: o.opacity ?? 0.35, depthWrite: false, roughness: 0.5 }) : null
  const M = (m: THREE.Material) => ghost ?? m
  const drone = new THREE.Group()
  const body = std(0x1e293b, { roughness: 0.4, metalness: 0.2 })
  const sh = !ghost
  drone.add(mesh(new THREE.BoxGeometry(0.5, 0.16, 0.36), M(body), [0, 0.14, 0], sh))
  drone.add(mesh(new THREE.BoxGeometry(0.3, 0.05, 0.22), M(std(0xf97316, { roughness: 0.4 })), [0, 0.245, 0], sh))
  const armMat = std(0x475569)
  const d = 0.44
  const motorPos: THREE.Vector3[] = []
  if (n === 4) {
    const armGeo = new THREE.BoxGeometry(1.25, 0.05, 0.07)
    for (const a of [Math.PI / 4, -Math.PI / 4]) { const arm = mesh(armGeo, M(armMat), [0, 0.16, 0], sh); arm.rotation.y = a; drone.add(arm) }
    for (const [x, z] of [[d, d], [d, -d], [-d, d], [-d, -d]] as Array<[number, number]>) motorPos.push(new THREE.Vector3(x, 0.25, z))
  } else {
    const R = d * Math.SQRT2, armGeo = new THREE.BoxGeometry(R + 0.02, 0.05, 0.07)
    for (let k = 0; k < n; k++) {
      const a = (k + 0.5) * 2 * Math.PI / n
      const arm = mesh(armGeo, M(armMat), [Math.cos(a) * R / 2, 0.16, Math.sin(a) * R / 2], sh)
      arm.rotation.y = -a
      drone.add(arm)
      motorPos.push(new THREE.Vector3(Math.cos(a) * R, 0.25, Math.sin(a) * R))
    }
  }
  for (const z of [-0.12, 0.12]) drone.add(mesh(new THREE.BoxGeometry(0.04, 0.12, 0.04), M(armMat), [0.05, 0.04, z * 1.6], sh))
  drone.add(mesh(new THREE.BoxGeometry(0.5, 0.025, 0.025), M(armMat), [0.05, -0.02, 0.19], sh))
  drone.add(mesh(new THREE.BoxGeometry(0.5, 0.025, 0.025), M(armMat), [0.05, -0.02, -0.19], sh))
  const rotors: THREE.Group[] = []
  const bladeGeo = new THREE.BoxGeometry(0.55, 0.012, 0.06), bladeMat = std(0xe2e8f0, { roughness: 0.3, transparent: true, opacity: 0.9 })
  const hubGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.08, 12)
  for (const p of motorPos) {
    drone.add(mesh(hubGeo, M(armMat), [p.x, 0.2, p.z], sh))
    const r = new THREE.Group()
    r.position.copy(p)
    r.add(mesh(bladeGeo, M(bladeMat), [0, 0, 0], false))
    const b2 = mesh(bladeGeo, M(bladeMat), [0, 0, 0], false); b2.rotation.y = Math.PI / 2; r.add(b2)
    drone.add(r)
    rotors.push(r)
  }
  const ledMat = ghost ?? std(0x22c55e, { emissive: new THREE.Color(0x22c55e), emissiveIntensity: 1 })
  for (const z of [-0.1, 0.1]) drone.add(mesh(new THREE.SphereGeometry(0.03, 8, 8), ledMat, [0.26, 0.14, z], false))
  return { group: drone, rotors, motorPos, ledMat: ledMat as THREE.MeshStandardMaterial }
}
