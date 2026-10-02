import { describe, expect, it } from 'vitest'
import type { PartInstance, PartType } from './contract'
import { labelBox, layoutCanvasLabels, layoutLabels, overlaps } from './label-layout'

const part = (id: string, type: PartType, x: number, y: number, rotation: PartInstance['rotation'] = 0, props: PartInstance['props'] = {}): PartInstance => ({ id, type, x, y, rotation, props })
const noClash = (m: ReturnType<typeof layoutCanvasLabels>): void => {
  const boxes = [...m.entries()]
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    expect(overlaps(boxes[i][1].box, boxes[j][1].box, 0), `${boxes[i][0]} ~ ${boxes[j][0]}`).toBe(false)
  }
}

describe('etiket yerleşimi', () => {
  it('çakışmayan etiket varsayılan konumunda kalır', () => {
    const m = layoutLabels([{ id: 'a', text: 'VCC', fontSize: 9, candidates: [{ x: 10, y: 10, anchor: 'middle' }, { x: 10, y: 30, anchor: 'middle' }] }])
    expect(m.get('a')).toMatchObject({ x: 10, y: 10, clash: false })
  })

  it('çakışan ikinci etiket sonraki adaya kayar', () => {
    const m = layoutLabels([
      { id: 'a', text: 'SIG', fontSize: 9, candidates: [{ x: 10, y: 10, anchor: 'middle' }] },
      { id: 'b', text: 'SIG', fontSize: 9, candidates: [{ x: 12, y: 10, anchor: 'middle' }, { x: 12, y: 24, anchor: 'middle' }] },
    ])
    expect(m.get('b')).toMatchObject({ y: 24, clash: false })
  })

  it('hepsi çakışırsa yine de bir konum verir ve clash işaretler', () => {
    const m = layoutLabels([
      { id: 'a', text: 'X', fontSize: 9, candidates: [{ x: 0, y: 0, anchor: 'start' }] },
      { id: 'b', text: 'X', fontSize: 9, candidates: [{ x: 0, y: 0, anchor: 'start' }] },
    ])
    expect(m.get('b')?.clash).toBe(true)
  })

  it('potansiyometre: VCC / SIG / GND etiketleri üst üste binmez (dönüşler dahil)', () => {
    for (const rot of [0, 90, 180, 270] as const) {
      const m = layoutCanvasLabels([part('p', 'pot', 100, 100, rot)], new Map(), 9)
      expect([...m.keys()].sort()).toEqual(['p:GND', 'p:SIG', 'p:VCC'])
      noClash(m)
    }
  })

  it('potansiyometre: ham (kaydırmasız) yerleşimde 20 px aralıklı bacak adları gerçekten çakışır; yerleşim bunu çözer', () => {
    // eski yerleşim: üç etiket de aynı satırda, 20 px aralıkla; 3 harfli kalın 9 px yazı ≈ 19,3 px + pay
    const a = labelBox('VCC', 9, { x: 10, y: 78, anchor: 'middle' }), b = labelBox('SIG', 9, { x: 30, y: 78, anchor: 'middle' })
    expect(overlaps(a, b)).toBe(true)
    const m = layoutCanvasLabels([part('p', 'pot', 100, 100)], new Map(), 9)
    expect(new Set([...m.values()].map((l) => l.y)).size).toBeGreaterThan(1) // kademeli sıra kullanıldı
  })

  it('direnç değer yazısı röle COM etiketine binmez', () => {
    // Röle COM pini sağ kenarda (x=144,y=48): etiket sağa taşar. Direnç, değer yazısı COM etiketine denk gelecek yere konur.
    const relay = part('k', 'relay', 100, 100)
    const res = part('r', 'resistor', 262, 100, 0, { ohms: 330 })
    const m = layoutCanvasLabels([relay, res], new Map([['r', '330 Ω']]), 9)
    const cap = m.get('cap:r')!, com = m.get('k:COM')!, no = m.get('k:NO')!, nc = m.get('k:NC')!
    for (const l of [com, no, nc]) expect(overlaps(cap.box, l.box, 0)).toBe(false)
    noClash(m)
  })

  it('direnç değer yazısı komşu direncinin yazısıyla çakışmaz', () => {
    const a = part('r1', 'resistor', 100, 100, 0, { ohms: 330 }), b = part('r2', 'resistor', 100, 106, 0, { ohms: 1000 })
    const m = layoutCanvasLabels([a, b], new Map([['r1', '330 Ω'], ['r2', '1 kΩ']]), 9)
    expect(overlaps(m.get('cap:r1')!.box, m.get('cap:r2')!.box, 0)).toBe(false)
  })

  it('daha büyük yazı boyu (uzaklaştırılmış tuval) çakışmaz', () => {
    noClash(layoutCanvasLabels([part('p', 'pot', 0, 0), part('r', 'rgbled', 90, 0)], new Map(), 15))
  })

  it('Uno ve ownLabels parçaları (LCD, 74HC595) için pin etiketi üretilmez', () => {
    const m = layoutCanvasLabels([part('uno', 'uno', 0, 0), part('s', 'sr595', 300, 0)], new Map(), 9)
    expect(m.size).toBe(0)
  })
})
