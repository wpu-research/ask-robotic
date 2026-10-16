// Her Hyvex parçasının kendine özel 3B modeli var ve hepsi hatasız kurulup ölçeklenir (DOM'suz: yazılar düz malzemeye düşer).
import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { ENG_PARTS } from '@/lib/muhendislik/catalog'
import { MODELED_SLUGS, buildPart } from './models'

describe('3B parça modelleri', () => {
  it('128 parçanın hepsi eşlenmiş', () => {
    const missing = ENG_PARTS.map((p) => p.slug).filter((s) => !MODELED_SLUGS.includes(s))
    expect(missing).toEqual([])
  })
  it('her model kurulur, zemine oturur ve ~2 birime sığar', () => {
    for (const p of ENG_PARTS) {
      const g = buildPart(p.slug, p.group)
      const bb = new THREE.Box3().setFromObject(g)
      const size = bb.getSize(new THREE.Vector3())
      expect(Math.max(size.x, size.y, size.z), p.slug).toBeCloseTo(2, 1)
      expect(bb.min.y, p.slug).toBeGreaterThan(-0.01)
      let meshes = 0; g.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes++ })
      expect(meshes, p.slug).toBeGreaterThanOrEqual(2)
    }
  })
})
