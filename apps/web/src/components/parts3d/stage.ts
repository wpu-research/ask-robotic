// 3B parça sahnesi: PBR ışıklandırma (RoomEnvironment), yumuşak zemin gölgesi, kamera kadrajı. Görüntüleyici ve önizleme ortak kullanır.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildPart } from './models'

export interface PartScene { scene: THREE.Scene; camera: THREE.PerspectiveCamera; model: THREE.Group; dispose(): void }

export function makeScene(renderer: THREE.WebGLRenderer, slug: string, group: string, aspect: number, zoom = 1): PartScene {
  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = env
  scene.background = null
  const key = new THREE.DirectionalLight('#ffffff', 1.6); key.position.set(3, 6, 4); key.castShadow = true
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.near = 0.5; key.shadow.camera.far = 20
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 }); key.shadow.radius = 6; key.shadow.bias = -0.0005
  scene.add(key, new THREE.HemisphereLight('#ffffff', '#b8a99a', 0.35))
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.18 }))
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground)
  const model = buildPart(slug, group)
  model.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true } })
  scene.add(model)
  const camera = new THREE.PerspectiveCamera(32, aspect, 0.05, 100)
  const h = (model.userData.height as number) ?? 1
  camera.position.set(2.6 / zoom, (1.9 + h * 0.6) / zoom, 3.1 / zoom)
  camera.lookAt(0, h * 0.35, 0)
  return {
    scene, camera, model,
    dispose() {
      pmrem.dispose(); env.dispose()
      scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose() } })
    },
  }
}

export function makeRenderer(canvas?: HTMLCanvasElement): THREE.WebGLRenderer {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !canvas })
  r.outputColorSpace = THREE.SRGBColorSpace
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap
  r.setPixelRatio(Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1))
  return r
}
