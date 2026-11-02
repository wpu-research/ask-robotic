import { afterEach, describe, expect, it, vi } from 'vitest'
import { exportWorkbenchFile, importWorkbenchFile, loadWorkbenchProject, saveWorkbenchProject, WORKBENCH_PROJECT_KEY } from './workbench-project'
import { emptyDesign } from '@/lib/mikro/tasarim'
import { addAssembly } from '@/lib/mikro/assembly'

afterEach(() => vi.unstubAllGlobals())

describe('tezgâh proje kaydı', () => {
  it('devre, eşlemeler ve Arduino kodunu birlikte kaydeder ve açar', () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', { getItem: (key: string) => values.get(key), setItem: (key: string, value: string) => values.set(key, value) })
    const project = { circuit: { parts: [], wires: [] }, plan: { motors: [], sensors: [] }, arduino: 'void setup() {}' }
    expect(saveWorkbenchProject(project)).toBe(true)
    expect(values.has(WORKBENCH_PROJECT_KEY)).toBe(true)
    expect(loadWorkbenchProject()).toEqual(project)
  })

  it('bozuk JSON, devre, eşleme ve sürüm çökmeden reddedilir', () => {
    for (const raw of ['{', '{}', JSON.stringify({ v: 2 }), JSON.stringify({ v: 1, circuit: { parts: [], wires: [] }, plan: { motors: [null], sensors: [] }, arduino: '' })]) {
      vi.stubGlobal('localStorage', { getItem: () => raw })
      expect(loadWorkbenchProject()).toBeNull()
    }
  })

  it('depolama izni yoksa başarısızlığı bildirir', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('denied') }, setItem: () => { throw new Error('full') } })
    expect(loadWorkbenchProject()).toBeNull()
    expect(saveWorkbenchProject({ circuit: { parts: [], wires: [] }, plan: { motors: [], sensors: [] }, arduino: '' })).toBe(false)
  })

  it('proje dosyası montajı, gövdeyi, devreyi ve kodu birlikte taşır', () => {
    const design = { ...emptyDesign('Atölyem'), assembly: addAssembly([], 'esp32'), govde: { v: 1 as const, blocks: [{ id: 'b1', shape: 'kutu' as const, pos: [0, 0, 0] as [number, number, number], size: [0.02, 0.02, 0.01] as [number, number, number], yaw: 0, color: '#c2410c', hidden: true }] } }
    const project = { design, circuit: { parts: [], wires: [] }, plan: { motors: [], sensors: [] }, arduino: 'void loop() {}' }
    expect(importWorkbenchFile(exportWorkbenchFile(project))).toEqual(project)
  })

  it('yabancı sürüm, bozuk montaj, devre ve aşırı büyük dosya reddedilir', () => {
    const project = { design: emptyDesign(), circuit: { parts: [], wires: [] }, plan: { motors: [], sensors: [] }, arduino: '' }
    const raw = JSON.parse(exportWorkbenchFile(project))
    for (const patch of [{ v: 2 }, { format: 'foreign' }, { design: { ...project.design, assembly: [{}] } }, { circuit: {} }, { arduino: 'x'.repeat(100_001) }]) expect(importWorkbenchFile(JSON.stringify({ ...raw, ...patch }))).toBeNull()
    expect(importWorkbenchFile('x'.repeat(4_000_001))).toBeNull()
    expect(importWorkbenchFile('{')).toBeNull()
  })
})
