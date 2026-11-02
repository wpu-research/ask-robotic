import * as THREE from 'three'

export function buildWheelModel(radius: number, halfWidth: number): THREE.Group {
  const group = new THREE.Group()
  const rubber = new THREE.MeshStandardMaterial({ color: '#202224', roughness: 0.96 })
  const rim = new THREE.MeshStandardMaterial({ color: '#ecc344', roughness: 0.56 })
  const metal = new THREE.MeshStandardMaterial({ color: '#a6adb4', roughness: 0.38, metalness: 0.8 })
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, position: [number, number, number]) => {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true
    group.add(mesh)
    return mesh
  }
  const cylinder = (radial: number, width: number) => new THREE.CylinderGeometry(radial, radial, width, 40).rotateX(Math.PI / 2)
  add(cylinder(radius * 0.98, halfWidth * 1.94), rubber, [0, 0, 0])
  for (let index = 0; index < 36; index++) {
    const angle = index * Math.PI / 18
    const tread = add(new THREE.BoxGeometry(radius * 0.11, radius * 0.05, halfWidth * 1.85), rubber, [Math.cos(angle) * radius * 0.975, Math.sin(angle) * radius * 0.975, 0])
    tread.rotation.z = angle - Math.PI / 2
  }
  for (const side of [-1, 1]) {
    const depth = side * halfWidth
    add(cylinder(radius * 0.63, 0.0008), rim, [0, 0, depth])
    add(new THREE.TorusGeometry(radius * 0.8, radius * 0.025, 6, 40), rubber, [0, 0, depth])
    for (let index = 0; index < 6; index++) {
      const angle = index * Math.PI / 3
      add(cylinder(radius * 0.11, 0.0009), rubber, [Math.cos(angle) * radius * 0.39, Math.sin(angle) * radius * 0.39, depth + side * 0.0005])
    }
    add(cylinder(radius * 0.17, 0.0014), rim, [0, 0, depth + side * 0.0005])
    add(cylinder(radius * 0.055, 0.0016), metal, [0, 0, depth + side * 0.001])
  }
  return group
}

export function buildGearmotorModel(halfSize: [number, number, number]): THREE.Group {
  const group = new THREE.Group()
  const yellow = new THREE.MeshStandardMaterial({ color: '#e6b92e', roughness: 0.55 })
  const metal = new THREE.MeshStandardMaterial({ color: '#b7bdc0', roughness: 0.4, metalness: 0.75 })
  const dark = new THREE.MeshStandardMaterial({ color: '#333a3e', roughness: 0.7 })
  const white = new THREE.MeshStandardMaterial({ color: '#ede9db', roughness: 0.5 })
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, position: [number, number, number]) => {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true
    group.add(mesh)
    return mesh
  }
  const [halfX, halfY, halfZ] = halfSize
  add(new THREE.BoxGeometry(halfX * 1.95, halfY * 1.16, halfZ * 1.9), yellow, [0, halfY * 0.34, 0])
  add(new THREE.CylinderGeometry(halfZ * 0.8, halfZ * 0.8, halfY * 1.08, 20), metal, [0, -halfY * 0.47, 0])
  add(new THREE.CylinderGeometry(halfZ * 0.83, halfZ * 0.83, halfY * 0.16, 20), dark, [0, -halfY * 0.92, 0])
  add(new THREE.CylinderGeometry(halfZ * 0.22, halfZ * 0.22, halfY * 0.85, 16), white, [0, halfY * 1.06, 0])
  for (const side of [-1, 1]) {
    add(new THREE.BoxGeometry(halfX * 0.15, halfY * 0.2, halfZ * 0.5), metal, [side * halfX * 0.47, -halfY, 0])
    const screw = add(new THREE.CylinderGeometry(halfZ * 0.1, halfZ * 0.1, 0.0006, 12), metal, [side * halfX * 0.65, halfY * 0.35, halfZ * 0.98])
    screw.rotation.x = Math.PI / 2
  }
  return group
}
