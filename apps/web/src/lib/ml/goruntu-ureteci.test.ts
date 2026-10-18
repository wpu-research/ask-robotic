// Görüntü üreteci: eğitimle yeniden üretim hatası en az yarıya iner; aynı türün kodları birbirine farklı türlerden daha yakın.
import { describe, expect, it } from 'vitest'
import { GORUNTU_URETECI, decode, digits, emptySpot, evaluate, ownShare, spread, train } from './goruntu-ureteci'

const def = Object.fromEntries(GORUNTU_URETECI.params.map((p) => [p.key, p.value]))

describe('görüntü üreteci', () => {
  it('kareler ve kod satırları tutarlı', () => {
    const F = GORUNTU_URETECI.run(def)
    expect(F.length).toBeGreaterThan(3)
    for (const f of F) expect(f.line).toBeLessThan(GORUNTU_URETECI.code.length)
    for (const [c] of GORUNTU_URETECI.code) expect(c.length).toBeLessThanOrEqual(60)
  })
  it('yeniden üretim hatası eğitimle en az yarıya iner (sahnedeki sayılarla aynı)', () => {
    const { X } = digits(13)
    const e0 = evaluate(train(X, 0, def.seed), X).err
    const e1 = evaluate(train(X, def.steps, def.seed), X).err
    console.log('piksel başına hata', e0.toFixed(3), '→', e1.toFixed(3))
    expect(e1).toBeLessThan(e0 / 2)
    expect(GORUNTU_URETECI.run(def).at(-1)!.cap[1]).toContain(`${e0.toFixed(3)} → ${e1.toFixed(3)}`)
  })
  it('aynı türün kodları birbirine farklı türlerden daha yakın; çoğu kendi türünün merkezinde', () => {
    const { X, k } = digits(13)
    for (const seed of [def.seed, 5]) {
      const { Z } = evaluate(train(X, def.steps, seed), X)
      const sp = spread(Z, k)
      const own = ownShare(Z, k)
      console.log(`tohum ${seed}: aynı tür ${sp.intra.toFixed(2)}, farklı tür ${sp.inter.toFixed(2)}, kendi merkezinde %${(own * 100).toFixed(0)}`)
      expect(sp.intra).toBeLessThan(sp.inter / 2)
      expect(own).toBeGreaterThan(0.9)
    }
  })
  it('boş noktadan boyanan görüntü yeni: hiçbir eğitim görüntüsünün aynısı değil', () => {
    const { X, k } = digits(13)
    const net = train(X, def.steps, def.seed)
    const { Z } = evaluate(net, X)
    const es = emptySpot(Z, k)
    expect(es.near).toBeGreaterThan(0.05 * es.span)
    const im = decode(net, es.pt[0], es.pt[1])
    let best = Infinity
    for (let i = 0; i < 400; i++) { let d = 0; for (let j = 0; j < 64; j++) d += (im[j] - X[i * 64 + j]) ** 2; best = Math.min(best, d) }
    expect(best).toBeGreaterThan(0.5)
  })
})
