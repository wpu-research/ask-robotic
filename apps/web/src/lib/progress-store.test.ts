import { describe, expect, it } from 'vitest'
import { parseIds } from './progress-store'

describe('parseIds', () => {
  it('geçerli diziyi kümeye çevirir', () => expect([...parseIds('[1,2,3]')]).toEqual([1, 2, 3]))
  it('bozuk JSON, dizi olmayan değer ve boş girdide boş küme döner', () => {
    for (const bad of ['', 'nope', '{"a":1}', 'null', '5']) expect(parseIds(bad).size, bad).toBe(0)
  })
  it('tam sayı olmayan öğeleri atar', () => {
    expect([...parseIds('[1,"2",null,3.5,4]')]).toEqual([1, 4])
  })
})
