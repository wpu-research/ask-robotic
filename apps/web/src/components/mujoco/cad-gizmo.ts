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
  // Ölçü okları: seçili bloğun en/boy/yükseklik çizgileri ve mm etiketleri
  const dims = new THREE.Group()
  dims.visible = false
  layer.add(dims)
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

  /** mm etiketi: tuvale yazılıp sprite olarak sahneye konur. */
  function label(text: string): THREE.Sprite {
    const c = document.createElement('canvas')
    c.width = 128; c.height = 48
    const g = c.getContext('2d')!
    g.fillStyle = 'rgba(42,26,18,.86)'
    g.beginPath(); g.roundRect(0, 0, 128, 48, 10); g.fill()
    g.fillStyle = '#f6ece2'; g.font = 'bold 26px system-ui, sans-serif'
    g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText(text, 64, 25)
    const t = new THREE.CanvasTexture(c)
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }))
    sp.scale.set(0.03, 0.011, 1)
    sp.renderOrder = 1000
    return sp
  }

  function clearDims() {
    for (const o of [...dims.children]) {
      dims.remove(o)
      const any = o as THREE.Mesh & THREE.Sprite
      any.geometry?.dispose?.()
      const m = any.material as THREE.Material & { map?: THREE.Texture }
      m?.map?.dispose?.(); m?.dispose?.()
    }
  }

  /** Seçili blok için üç ölçü çizgisi ve mm etiketi çizer. */
  function drawDims(b: Block | undefined) {
    clearDims()
    if (!b) { dims.visible = false; return }
    dims.visible = true
    const [sx, sy, sz] = b.size
    const [px, py, pz] = b.pos
    const axes: [THREE.Vector3, THREE.Vector3, number, number][] = [
      [new THREE.Vector3(px - sx, py - sy, pz - sz), new THREE.Vector3(px + sx, py - sy, pz - sz), 2 * sx, 0],
      [new THREE.Vector3(px + sx, py - sy, pz - sz), new THREE.Vector3(px + sx, py + sy, pz - sz), 2 * sy, 1],
      [new THREE.Vector3(px + sx, py - sy, pz - sz), new THREE.Vector3(px + sx, py - sy, pz + sz), 2 * sz, 2],
    ]
    const colors = [0xc2410c, 0x0f766e, 0x7c3aed] // marka: robot, devre, blok
    for (const [a, c, len, i] of axes) {
      const geo = new THREE.BufferGeometry().setFromPoints([a, c])
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: colors[i], depthTest: false }))
      line.renderOrder = 1000
      dims.add(line)
      const sp = label(`${Math.round(len * 1000)} mm`)
      sp.position.copy(a.clone().add(c).multiplyScalar(0.5))
      dims.add(sp)
    }
  }

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
          color: b.cut ? 0x9f1239 : 0xa0866f, wireframe: true, transparent: true, opacity: 0.55, depthTest: false,
        }))
        m.renderOrder = 999
        layer.add(m)
        proxies.set(b.id, m)
      }
      const mat = m.material as THREE.MeshBasicMaterial
      mat.color.set(b.cut ? 0x9f1239 : b.id === selected ? 0xc2410c : 0xa0866f)
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
      drawDims(selId ? govde.blocks.find((b) => b.id === selId) : undefined)
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
      clearDims()
      for (const m of proxies.values()) { m.geometry.dispose(); (m.material as THREE.Material).dispose() }
      proxies.clear()
      group.remove(layer)
      stage.controls.enabled = true
    },
  }
}
