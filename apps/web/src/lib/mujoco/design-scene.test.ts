import { afterEach, describe, expect, it, vi } from 'vitest'
import { DESIGN_KEY, DESIGN_SCENE_ID, designScene, loadDesign, saveDesign } from './design-scene'
import { CHASSIS, placePart, type RobotDesign } from '@/lib/mikro/tasarim'

/** Testte tarayıcı deposu taklidi; her testten sonra kaldırılır. */
function mockStorage(value: string | null, throws = false) {
  const store = {
    getItem: vi.fn(() => { if (throws) throw new Error('gizli pencere'); return value }),
  }
  vi.stubGlobal('localStorage', store)
  return store
}
afterEach(() => vi.unstubAllGlobals())

function rover(name = 'Gezgin'): RobotDesign {
  let d: RobotDesign = { v: 1, name, chassis: 'orta', parts: [] }
  const ch = CHASSIS.orta
  d = placePart(d, 'teker-buyuk', 2, 0)
  d = placePart(d, 'teker-buyuk', 2, ch.rows - 1)
  d = placePart(d, 'motor-std', 1, 1)
  d = placePart(d, 'motor-std', 1, ch.rows - 2)
  return d
}

describe('loadDesign', () => {
  it('kayıtlı tasarımı okur', () => {
    mockStorage(JSON.stringify(rover()))
    expect(loadDesign()?.name).toBe('Gezgin')
  })
  it('kayıt yoksa null', () => {
    mockStorage(null)
    expect(loadDesign()).toBeNull()
  })
  it('bozuk JSON çökmez', () => {
    mockStorage('{ bu json değil')
    expect(loadDesign()).toBeNull()
  })
  it('tanınmayan şasi reddedilir', () => {
    mockStorage(JSON.stringify({ v: 1, name: 'x', chassis: 'devasa', parts: [] }))
    expect(loadDesign()).toBeNull()
  })
  it('eski sürüm reddedilir', () => {
    mockStorage(JSON.stringify({ v: 0, name: 'x', chassis: 'orta', parts: [] }))
    expect(loadDesign()).toBeNull()
  })
  it('gizli pencerede depo erişimi fırlatırsa çökmez', () => {
    mockStorage(null, true)
    expect(loadDesign()).toBeNull()
  })
  it('anahtar tasarım tezgâhıyla aynı', () => {
    expect(DESIGN_KEY).toBe('ask:tasarim:current:v1')
  })
  it('kayıt hatası başarı gibi gösterilmez', () => {
    vi.stubGlobal('localStorage', { setItem: () => { throw new Error('full') } })
    expect(saveDesign(rover())).toBe(false)
    vi.stubGlobal('localStorage', { setItem: vi.fn() })
    expect(saveDesign(rover())).toBe(true)
  })
})

describe('designScene', () => {
  it('tasarımdan sahne üretir; motor adları Python başlangıcında geçer', () => {
    const s = designScene(rover())!
    expect(s.id).toBe(DESIGN_SCENE_ID)
    expect(s.kind).toBe('robot')
    expect(s.xml).toContain('<mujoco')
    expect(s.goals).toEqual([])
    expect(s.python.tr).toContain('sol_motor')
    expect(s.python.en).toContain('sol_motor')
  })

  it('robotun adı başlıkta kullanılır', () => {
    expect(designScene(rover('Şahin'))!.tr.title).toBe('Şahin')
  })

  it('adsız tasarıma varsayılan ad verilir', () => {
    expect(designScene({ ...rover(), name: '   ' })!.tr.title).toBe('Tasarımım')
  })

  it('tekersiz tasarımda ipucu tasarım tezgâhına yönlendirir', () => {
    const s = designScene({ v: 1, name: 'Durgun', chassis: 'kucuk', parts: [] })!
    expect(s.tr.hint).toMatch(/teker ve motor ekle/i)
    expect(s.en.hint).toMatch(/wheels and a motor/i)
  })

  it('açıklamada parça ve motor sayısı yazar', () => {
    const d = rover()
    const s = designScene(d)!
    expect(s.tr.desc).toContain(`${d.parts.length} parça`)
    expect(s.tr.desc).toContain('2 sürüş motoru')
  })
})
