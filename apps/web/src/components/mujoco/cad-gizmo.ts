'use client'
// CAD tutamaçları: gövde bloklarını fareyle taşı, döndür, boyutlandır.
//
// Sahnedeki MuJoCo görüntüsü fizik motorundan gelir ve düzenlenemez; bu yüzden
// blokların üstüne saydam bir "vekil" katman serilir. Tutamaç vekili sürükler,
// bırakınca blok güncellenir ve model yeniden kurulur.
//
// Eksen dönüşümü: tasarım/MuJoCo çerçevesi Z-yukarı (ileri +x, sola +y),
// three.js Y-yukarı. Sahne grubu -90° döndürülmüş olduğundan vekiller de aynı
// gruba konur ve blok koordinatları doğrudan kullanılabilir.
import * as THREE from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import type { Stage } from '@/components/three/core'
import { ROUND_SHAPES, type Block, type Govde } from '@/lib/mikro/govde'

export type GizmoMode = 'translate' | 'rotate' | 'scale'

export interface GizmoOptions {
  /** Taşımada ızgara adımı (m); 0 = serbest. */
  snapM: number
  /** Döndürmede açı adımı (derece); 0 = serbest. */
  snapDeg: number
}

export interface CadGizmo {
  /** Blok listesi ya da seçim değişince çağrılır. */
  update(govde: Govde, selectedId: string | null): void
  setMode(m: GizmoMode): void
  setOptions(o: GizmoOptions): void
  /** Tutamaç sürüklenirken true: fizik döngüsü sahneyi sıfırlamasın diye. */
  dragging(): boolean
  dispose(): void
}

/**
 * Vekilin dönüşümünü blok yamasına çevirir. Saf: tarayıcısız sınanır.
 *
 * - Açı, kilit açıksa en yakın adıma yuvarlanır ve 0-360 aralığına getirilir.
 * - Yuvarlak şekillerde (küre, silindir, kapsül, koni) en ve boy ayrı olamaz:
 *   yarıçap tek sayıdır, bu yüzden x ölçeği y'ye de uygulanır.
 */
export function proxyPatch(
  pos: [number, number, number],
  yawDeg: number,
  scale: [number, number, number],
  shape: Block['shape'],
  opts: GizmoOptions,
): Partial<Block> {
  let yaw = yawDeg
  if (opts.snapDeg > 0) yaw = Math.round(yaw / opts.snapDeg) * opts.snapDeg
  const size: [number, number, number] = ROUND_SHAPES.includes(shape)
    ? [scale[0], scale[0], scale[2]]
    : [scale[0], scale[1], scale[2]]
  return { pos, size, yaw: ((yaw % 360) + 360) % 360 }
}

/** Bloğun vekil geometrisi: gerçek şekle yakın, ama hafif. */
function proxyGeometry(b: Block): THREE.BufferGeometry {
  switch (b.shape) {
    case 'kure': return new THREE.SphereGeometry(1, 16, 12)
    case 'elipsoid': return new THREE.SphereGeometry(1, 16, 12)
    case 'silindir': return new THREE.CylinderGeometry(1, 1, 2, 20).rotateX(Math.PI / 2)
    case 'kapsul': return new THREE.CapsuleGeometry(1, 2, 6, 16).rotateX(Math.PI / 2)
    case 'koni': return new THREE.ConeGeometry(1, 2, 20).rotateX(Math.PI / 2)
    default: return new THREE.BoxGeometry(2, 2, 2)
  }
}

/**
 * Sahneye tutamaç katmanı kurar. `onChange` sürükleme bitince çağrılır
 * (sürüklerken `onPreview`): her kare yeni model derlemek yerine önizleme
 * vekil üstünde gösterilir, model bırakınca kurulur.
 */
export function createCadGizmo(
  stage: Stage,
  group: THREE.Group,
  onChange: (id: string, patch: Partial<Block>) => void,
): CadGizmo {
  const layer = new THREE.Group()
  layer.name = 'cad-proxies'
  group.add(layer)

  const proxies = new Map<string, THREE.Mesh>()
  let blocks: Block[] = []
  let selected: string | null = null
  let opts: GizmoOptions = { snapM: 0.005, snapDeg: 15 }

  const tc = new TransformControls(stage.camera, stage.renderer.domElement)
  tc.setSpace('local')
  // r170'te tutamaç nesnesi getHelper() ile alınır; eski sürümde kontrolün kendisi eklenir
  const helper = (tc as unknown as { getHelper?: () => THREE.Object3D }).getHelper?.() ?? (tc as unknown as THREE.Object3D)
  stage.scene.add(helper)
  helper.visible = false

  let drag = false
  tc.addEventListener('dragging-changed', (e) => {
    drag = Boolean((e as unknown as { value: boolean }).value)
    stage.controls.enabled = !drag // sürüklerken kamera dönmesin
    if (!drag) commit()
  })

  /** Vekilin durumunu bloğa yazar. Yuvarlak şekillerde en ve boy birlikte değişir. */
  function commit() {
    if (!selected) return
    const mesh = proxies.get(selected)
    const b = blocks.find((x) => x.id === selected)
    if (!mesh || !b) return
    const yawRad = new THREE.Euler().setFromQuaternion(mesh.quaternion, 'ZYX').z
    onChange(selected, proxyPatch(
      [mesh.position.x, mesh.position.y, mesh.position.z],
      (yawRad * 180) / Math.PI,
      [mesh.scale.x, mesh.scale.y, mesh.scale.z],
      b.shape, opts,
    ))
  }

  function rebuild(next: Block[]) {
    const seen = new Set<string>()
    for (const b of next) {
      seen.add(b.id)
      let m = proxies.get(b.id)
      const old = blocks.find((x) => x.id === b.id)
      if (!m || old?.shape !== b.shape) {
        m?.geometry.dispose()
        if (m) layer.remove(m)
        m = new THREE.Mesh(proxyGeometry(b), new THREE.MeshBasicMaterial({
          color: b.cut ? 0xef4444 : 0x38bdf8, wireframe: true, transparent: true, opacity: 0.55, depthTest: false,
        }))
        m.renderOrder = 999
        layer.add(m)
        proxies.set(b.id, m)
      }
      const mat = m.material as THREE.MeshBasicMaterial
      mat.color.set(b.cut ? 0xef4444 : b.id === selected ? 0xfbbf24 : 0x38bdf8)
      mat.opacity = b.id === selected ? 0.9 : 0.35
      // Sürüklenirken vekilin kendi dönüşümü kullanılır, üstüne yazılmaz
      if (!(drag && b.id === selected)) {
        m.position.set(b.pos[0], b.pos[1], b.pos[2])
        m.quaternion.setFromEuler(new THREE.Euler(0, 0, (b.yaw * Math.PI) / 180))
        m.scale.set(b.size[0], b.size[1], b.size[2])
      }
    }
    for (const [id, m] of [...proxies]) {
      if (seen.has(id)) continue
      m.geometry.dispose(); (m.material as THREE.Material).dispose()
      layer.remove(m); proxies.delete(id)
    }
    blocks = next
  }

  return {
    update(govde, selId) {
      selected = selId
      rebuild(govde.blocks)
      const m = selId ? proxies.get(selId) : null
      if (m) { tc.attach(m); helper.visible = true } else { tc.detach(); helper.visible = false }
    },
    setMode(mode) {
      tc.setMode(mode)
    },
    setOptions(o) {
      opts = o
      tc.setTranslationSnap(o.snapM > 0 ? o.snapM : null)
      tc.setRotationSnap(o.snapDeg > 0 ? (o.snapDeg * Math.PI) / 180 : null)
      tc.setScaleSnap(o.snapM > 0 ? o.snapM : null)
    },
    dragging: () => drag,
    dispose() {
      tc.detach()
      tc.dispose()
      stage.scene.remove(helper)
      for (const m of proxies.values()) { m.geometry.dispose(); (m.material as THREE.Material).dispose() }
      proxies.clear()
      group.remove(layer)
      stage.controls.enabled = true
    },
  }
}
