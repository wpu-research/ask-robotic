// Eğitim paneli ölçümleri: bilinen küçük örneklerde doğruluk, karışıklık matrisi, kesinlik/duyarlılık/F1, ROC/AUC, AP, R²,
// siluet, şaşkınlık, histogram, kayan ortalama; CSV/JSON dışa aktarım biçimi.
import { describe, expect, it } from 'vitest'
import {
  accuracy, auc, binaryAt, bestIndex, confusionMatrix, deadShare, explainedRatio, histogram, inertia, l2, macro, mae, movingAverage, mse, perClass,
  perplexity, prCurve, r2, rocCurve, saturatedShare, silhouette, trapz,
} from './metrics'
import { B, agirlikHistleri, csvCell, raporCSV, raporJSON, regresyonBlok, siniflandirmaBlok, type EgitimRaporu } from './rapor'

describe('sınıflandırma ölçüleri', () => {
  const y = [0, 1, 1, 0, 1, 2, 2, 0]
  const p = [0, 1, 0, 0, 1, 2, 1, 1]
  it('doğruluk ve karışıklık matrisi', () => {
    expect(accuracy(y, p)).toBe(5 / 8)
    expect(confusionMatrix(y, p)).toEqual([[2, 1, 0], [1, 2, 0], [0, 1, 1]])
    expect(confusionMatrix([0, 1], [1, 1], 3)).toEqual([[0, 1, 0], [0, 1, 0], [0, 0, 0]])
  })
  it('sınıf başına kesinlik, duyarlılık, F1 ve makro ortalama', () => {
    const s = perClass(confusionMatrix(y, p))
    expect(s[0]).toEqual({ precision: 2 / 3, recall: 2 / 3, f1: 2 / 3, support: 3 })
    expect(s[1].precision).toBeCloseTo(0.5); expect(s[1].recall).toBeCloseTo(2 / 3); expect(s[1].f1).toBeCloseTo(4 / 7)
    expect(s[2]).toEqual({ precision: 1, recall: 0.5, f1: 2 / 3, support: 2 })
    const m = macro(s)
    expect(m.precision).toBeCloseTo((2 / 3 + 0.5 + 1) / 3)
    // hiç tahmin edilmeyen sınıf: kesinlik 0 (bölme yok)
    expect(perClass([[1, 0], [1, 0]])[1]).toEqual({ precision: 0, recall: 0, f1: 0, support: 1 })
  })
  it('eşikte ikili ölçüler', () => {
    const b = binaryAt([0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8], 0.4)
    expect(b).toMatchObject({ tp: 1, fp: 1, tn: 1, fn: 1, precision: 0.5, recall: 0.5, acc: 0.5, fpr: 0.5 })
  })
  it('ROC eğrisi ve AUC: bilinen örnek 0,75; eşit skorlar 0,5; kusursuz 1', () => {
    const r = rocCurve([0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8])
    expect(r.fpr).toEqual([0, 0, 0.5, 0.5, 1])
    expect(r.tpr).toEqual([0, 0.5, 0.5, 1, 1])
    expect(auc([0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8])).toBeCloseTo(0.75)
    expect(auc([0, 1, 0, 1], [0.5, 0.5, 0.5, 0.5])).toBeCloseTo(0.5)
    expect(auc([0, 0, 1, 1], [0.1, 0.2, 0.8, 0.9])).toBe(1)
    expect(trapz([0, 1], [0, 1])).toBe(0.5)
  })
  it('kesinlik–duyarlılık eğrisi ve ortalama kesinlik (scikit-learn ile aynı: 0,8333)', () => {
    const pr = prCurve([0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8])
    expect(pr.ap).toBeCloseTo(5 / 6)
    expect(pr.recall.at(-1)).toBe(1)
    expect(pr.precision.at(-1)).toBe(0.5)
  })
})

describe('regresyon ve kümeleme ölçüleri', () => {
  it('MSE, MAE, R²', () => {
    expect(mse([1, 2, 3], [1, 2, 5])).toBeCloseTo(4 / 3)
    expect(mae([1, 2, 3], [1, 2, 5])).toBeCloseTo(2 / 3)
    expect(r2([1, 2, 3], [1, 2, 3])).toBe(1)
    expect(r2([1, 2, 3], [2, 2, 2])).toBe(0)
    expect(r2([1, 2, 3], [3, 2, 1])).toBe(-3)
  })
  it('siluet: iki uzak küme ~0,90; tek küme 0; gürültü (−1) sayılmaz', () => {
    const X = [[0, 0], [0, 1], [10, 0], [10, 1]]
    const b = (10 + Math.sqrt(101)) / 2
    expect(silhouette(X, [0, 0, 1, 1])).toBeCloseTo(1 - 1 / b, 6)
    expect(silhouette(X, [0, 0, 0, 0])).toBe(0)
    expect(silhouette([...X, [5, 50]], [0, 0, 1, 1, -1])).toBeCloseTo(1 - 1 / b, 6)
    // yanlış gruplama negatif
    expect(silhouette(X, [0, 1, 0, 1])).toBeLessThan(0)
  })
  it('inertia ve açıklanan varyans', () => {
    expect(inertia([[0, 0], [2, 0]], [0, 0], [[1, 0]])).toBe(2)
    expect(explainedRatio([3, 1, 0])).toEqual([0.75, 0.25, 0])
  })
})

describe('sinir ağı / dil modeli yardımcıları', () => {
  it('şaşkınlık: iki eşit seçenek 2, V eşit seçenek V, kesin tahmin 1', () => {
    expect(perplexity([0.5, 0.5])).toBeCloseTo(2)
    expect(perplexity(new Array(7).fill(1 / 27))).toBeCloseTo(27)
    expect(perplexity([1, 1])).toBe(1)
  })
  it('histogram: eşit kutular, uçlar kenar kutulara, NaN sayılmaz', () => {
    const h = histogram([0, 0.1, 0.5, 0.9, 1, -3, NaN], 2, 0, 1)
    expect(h.edges).toEqual([0, 0.5, 1])
    expect(h.counts).toEqual([3, 3])
    const a = histogram([1, 2, 3, 4], 3)
    expect(a.edges[0]).toBe(1); expect(a.edges[3]).toBe(4); expect(a.counts).toEqual([1, 1, 2])
    expect(histogram([5, 5], 2).counts.reduce((s, v) => s + v, 0)).toBe(2)
  })
  it('kayan ortalama, L2, ölü ve doymuş nöron payı, en iyi indeks', () => {
    expect(movingAverage([1, 2, 3, 4], 2)).toEqual([1, 1.5, 2.5, 3.5])
    expect(movingAverage([-10, -20, -30], 10)).toEqual([-10, -15, -20])
    expect(l2([3, 4])).toBe(5)
    expect(deadShare([[0, 1, 0], [0, 2, 0.5]])).toBeCloseTo(1 / 3)
    expect(saturatedShare([[0.995, 0.2], [-1, 0]])).toBe(0.5)
    expect(bestIndex([3, 1, 2, 1])).toBe(1)
    expect(bestIndex([0.2, 0.9, 0.5], 'max')).toBe(1)
  })
})

describe('rapor blokları ve dışa aktarım', () => {
  it('sınıflandırma bloğu: AUC, AP, eşik verisi, karışıklık', () => {
    const b = siniflandirmaBlok({ y: [0, 0, 1, 1], pred: [0, 0, 0, 1], scores: [0.1, 0.4, 0.35, 0.8], labels: ['hayır', 'evet'] })
    const f = Object.fromEntries(b.final.map((x) => [x.key, x.value]))
    expect(f.accuracy).toBe(0.75); expect(f.precision).toBe(1); expect(f.recall).toBe(0.5); expect(f.auc).toBeCloseTo(0.75); expect(f.ap).toBeCloseTo(5 / 6)
    expect(b.confusion!.m).toEqual([[2, 0], [1, 1]])
    expect(b.scores!.t).toBe(0.5)
    expect(b.charts.map((c) => c.id)).toEqual(['confusion', 'per-class', 'roc', 'pr'])
  })
  it('regresyon bloğu: artık sayısı ve R²', () => {
    const b = regresyonBlok({ y: [1, 2, 3], pred: [1, 2, 3] })
    expect(b.final.find((x) => x.key === 'r2')!.value).toBe(1)
    expect(b.charts[0].kind === 'scatter' && b.charts[0].points.length).toBe(3)
  })
  it('ağırlık histogramı: her anın sayıları ağırlık sayısına eşit, kutular simetrik', () => {
    const [g] = agirlikHistleri([{ label: '0', layers: [[0.1, -0.2, 0.3]] }, { label: '9', layers: [[1, -2, 0.5]] }], ['W1'], 8)
    expect(g.frames.map((f) => f.counts.reduce((a, v) => a + v, 0))).toEqual([3, 3])
    expect(g.edges[0]).toBe(-2); expect(g.edges[8]).toBe(2)
  })
  it('CSV: geçmiş tablosu, boş satır, metrik/değer, karışıklık; hücre biçimi', () => {
    expect(csvCell(0.1 + 0.2)).toBe('0.3'); expect(csvCell(NaN)).toBe('nan'); expect(csvCell(-Infinity)).toBe('-inf'); expect(csvCell('a,b')).toBe('"a,b"'); expect(csvCell(12)).toBe('12')
    const r: EgitimRaporu = {
      kind: 'siniflandirma', model: 'deneme', seed: 7, hyper: { lr: 0.5, H: 8 },
      history: { x: 'epoch', cols: { epoch: [0, 1], loss: [0.9, 0.5], val_loss: [1, 0.7] } },
      final: [{ key: 'accuracy', label: B('doğruluk', 'accuracy'), value: 0.75 }],
      confusion: { labels: ['a', 'b'], m: [[2, 0], [1, 1]] }, charts: [],
    }
    expect(raporCSV(r)).toBe([
      'epoch,loss,val_loss', '0,0.9,1', '1,0.5,0.7', '',
      'metrik,deger', 'model,deneme', 'tur,siniflandirma', 'seed,7', 'hiper.lr,0.5', 'hiper.H,8', 'accuracy,0.75', '',
      'karisiklik,tahmin_a,tahmin_b', 'gercek_a,2,0', 'gercek_b,1,1',
    ].join('\n') + '\n')
    const j = JSON.parse(raporJSON(r))
    expect(j).toMatchObject({ model: 'deneme', seed: 7, hyper: { lr: 0.5 }, history: { x: 'epoch', loss: [0.9, 0.5] }, final: { accuracy: 0.75 }, confusion: { m: [[2, 0], [1, 1]] } })
    // NaN JSON'da null olur (geçerli JSON)
    expect(JSON.parse(raporJSON({ ...r, final: [{ key: 'x', label: B('x', 'x'), value: NaN }] })).final.x).toBeNull()
  })
})
