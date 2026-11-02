import { describe, expect, it } from 'vitest'
import { addAssembly, canMount, isAssembly, removeAssembly, updateAssembly, type AssemblyNode } from './assembly'
import { exportDesign, importDesign, type RobotDesign } from './tasarim'

function chain() {
  let nodes = addAssembly([], 'servo')
  nodes = addAssembly(nodes, 'platform', nodes[0].id)
  return addAssembly(nodes, 'hcsr04', nodes[1].id)
}

describe('3B montaj ağacı', () => {
  it('servo, platform ve sensör tek bir montaj zinciri oluşturur', () => {
    const nodes = chain()
    expect(isAssembly(nodes)).toBe(true)
    expect(nodes.map((node) => node.parent)).toEqual([null, 'asm_1', 'asm_2'])
  })

  it('döngü, kendine bağlama ve kayıp ebeveyni reddeder', () => {
    const nodes = chain()
    expect(canMount(nodes, 'asm_1', 'asm_3')).toBe(false)
    expect(canMount(nodes, 'asm_2', 'asm_2')).toBe(false)
    expect(canMount(nodes, 'asm_3', 'yok')).toBe(false)
    expect(updateAssembly(nodes, 'asm_1', { parent: 'asm_3' })).toBe(nodes)
  })

  it('üst montaj silinince alt parçaları da kaldırır', () => {
    expect(removeAssembly(chain(), 'asm_2').map((node) => node.id)).toEqual(['asm_1'])
    expect(removeAssembly(chain(), 'asm_1')).toEqual([])
  })

  it('konum, eksen ve eklem sınırlarını doğrular', () => {
    const nodes = chain()
    for (const patch of [{ pos: [NaN, 0, 0] }, { pos: [2, 0, 0] }, { limits: [20, 90] }, { limits: [0, 0] }, { axis: 'w' }]) {
      expect(isAssembly([{ ...nodes[0], ...patch }])).toBe(false)
    }
    expect(isAssembly([{ ...nodes[0], limits: [-180, 180], axis: 'y' }])).toBe(true)
  })

  it('tek kart ve en fazla 24 montaj parçası ekler', () => {
    const board = addAssembly([], 'uno')
    expect(addAssembly(board, 'uno')).toBe(board)
    let nodes: AssemblyNode[] = []
    for (let index = 0; index < 25; index++) nodes = addAssembly(nodes, 'platform')
    expect(nodes).toHaveLength(24)
  })

  it('montajı tasarım dosyasında kayıpsız taşır; eski tasarımları kabul eder', () => {
    const design: RobotDesign = { v: 1, name: 'Montaj', chassis: 'orta', parts: [], assembly: chain() }
    const loaded = importDesign(exportDesign(design))
    expect(loaded.ok && loaded.design.assembly).toEqual(design.assembly)
    expect(importDesign({ ...design, assembly: undefined }).ok).toBe(true)
    expect(importDesign({ ...design, assembly: [{ ...chain()[0], parent: 'asm_1' }] }).ok).toBe(false)
  })
})
