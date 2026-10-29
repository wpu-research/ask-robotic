import { describe, expect, it } from 'vitest'
import { scriptToPython, spriteToPython } from './to-python'
import { blk, script, sprite } from './testkit'

describe('to-python', () => {
  it('bayrak betiği: dekoratörlü fonksiyon, parametreli çağrılar', () => {
    const s = script('s', blk('flag'), blk('forward', 5), blk('turnRight', 90), blk('say', undefined, undefined, 'Merhaba!'))
    expect(scriptToPython(s)).toBe('@yesil_bayrak\ndef yesil_bayrak_1():\n    ileri(5)\n    saga_don(90)\n    soyle("Merhaba!")')
  })
  it('tekrarla ve sonsuza kadar iç içe girintilenir, boş döngüye pass konur', () => {
    const s = script('s', blk('tap'), blk('repeat', 3, [blk('hop', 1), blk('wait', 0.5)]), blk('forever', undefined, []))
    expect(scriptToPython(s, 'en')).toBe('@on_tap\ndef on_tap_1():\n    for _ in range(3):\n        hop(1)\n        wait(0.5)\n    while True:\n        pass')
  })
  it('olay bloğu olmayan betik düz komut olur, metindeki tırnak kaçırılır', () => {
    expect(scriptToPython(script('s', blk('grow'), blk('say', undefined, undefined, 'a"b')))).toBe('buyu()\nsoyle("a\\"b")')
  })
  it('karakter: başlık + betikler; boşsa ipucu', () => {
    expect(spriteToPython(sprite('a', 0, 0))).toContain('Henüz blok yok')
    const sp = sprite('a', 0, 0, script('s1', blk('flag'), blk('forward', 2)), script('s2', blk('flag'), blk('back', 1)))
    const py = spriteToPython(sp)
    expect(py).toContain('def yesil_bayrak_1():')
    expect(py).toContain('def yesil_bayrak_2():')
  })
})
