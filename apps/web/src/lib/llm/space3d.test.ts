// 3B gömme uzayı ve dikkat yayları: PCA belirlenimciliği ve varyans sırası, 2B görüntüleyiciyle komşu tutarlılığı,
// RAG animasyon adımları ve zamanlaması.
import { describe, expect, it } from 'vitest'
import { attnScene, arcPoint } from './attn3d'
import { NOTES_EN, NOTES_TR } from './docs'
import { dot, embed, nearest, pca2, project, sentencesOf } from './embed'
import { RAG_DEFAULTS, buildIndex, runRag } from './rag'
import { RAG_STEPS, STEP_SEC, buildSpace, chunkItems, flatten, pcaK, project3, queryPosAt, queryState, ragAnimation, sentenceItems, stepAt, stepStart, totalSec } from './space3d'

const groups = NOTES_TR.map((n) => n.title)

describe('3B PCA', () => {
  const items = sentenceItems(NOTES_TR)
  const X = items.map((x) => x.vec)
  it('deterministik: aynı girdi birebir aynı eksen ve konum', () => {
    const a = buildSpace(items, groups), b = buildSpace(sentenceItems(NOTES_TR), groups)
    expect(b.pca.axes).toEqual(a.pca.axes)
    expect(b.points.map((p) => p.pos)).toEqual(a.points.map((p) => p.pos))
  })
  it('eksenler birim ve dik; varyans azalan sırada ve toplamı aşmaz', () => {
    const p = pcaK(X, 3)
    for (let i = 0; i < 3; i++) {
      expect(Math.hypot(...p.axes[i])).toBeCloseTo(1, 9)
      for (let j = 0; j < i; j++) expect(Math.abs(dot(p.axes[i], p.axes[j]))).toBeLessThan(1e-9)
    }
    expect(p.variance[0]).toBeGreaterThanOrEqual(p.variance[1])
    expect(p.variance[1]).toBeGreaterThanOrEqual(p.variance[2])
    expect(p.variance[2]).toBeGreaterThan(0)
    expect(p.variance.reduce((s, v) => s + v, 0)).toBeLessThanOrEqual(p.total + 1e-12)
  })
  it('ilk iki eksen 2B görüntüleyicinin (pca2) düzlemidir', () => {
    const p3 = pcaK(X, 3), p2 = pca2(X)
    expect(Math.abs(dot(p3.axes[0], p2.axes[0]))).toBeGreaterThan(0.999)
    expect(Math.abs(dot(p3.axes[1], p2.axes[1]))).toBeGreaterThan(0.99)
    const q = embed('LiPo hücre gerilimi')
    const a = project3(q, p3), b = project(q, p2)
    expect(Math.abs(a[0])).toBeCloseTo(Math.abs(b[0]), 3)
  })
  it('noktalar [−1, 1] küpünde; 2B görünüm üçüncü ekseni sıfırlar', () => {
    const s = buildSpace(items, groups)
    const all = s.points.flatMap((p) => p.pos)
    expect(Math.max(...all.map(Math.abs))).toBeCloseTo(1, 9)
    expect(Math.abs(flatten(s.points[0].pos, 1)[2])).toBe(0)
    expect(flatten(s.points[0].pos, 0)).toEqual(s.points[0].pos)
  })
})

describe('komşular 2B görüntüleyiciyle tutarlı', () => {
  for (const [lang, notes] of [['tr', NOTES_TR], ['en', NOTES_EN]] as const) {
    it(`aynı ilk k ve aynı kosinüs (${lang})`, () => {
      const s = buildSpace(sentenceItems(notes, 'ikisi', lang), notes.map((n) => n.title))
      // 2B görüntüleyicinin (sims.ts embedSim) yaptığı hesap
      const sents = notes.flatMap((n) => sentencesOf(n.text))
      const X2 = sents.map((x) => embed(x, 'ikisi', lang))
      for (const q of lang === 'tr' ? ['LiPo hücre gerilimi en az kaç volt olmalı?', 'I2C adresi', 'PID türev terimi'] : ['What voltage must a LiPo cell not go below?', 'I2C address']) {
        const st = queryState(s, q, 3, lang)
        const ref = nearest(embed(q, 'ikisi', lang), X2, 3)
        expect(st.neighbours.map((n) => n.index)).toEqual(ref.map((n) => n.index))
        st.neighbours.forEach((n, i) => expect(n.score).toBeCloseTo(ref[i].score, 12))
        expect(s.points[st.neighbours[0].index].text).toBe(sents[ref[0].index])
      }
    })
  }
  it('puanlar azalan sırada', () => {
    const s = buildSpace(sentenceItems(NOTES_TR), groups)
    const n = queryState(s, 'motor sürücü PWM', 5).neighbours
    for (let i = 1; i < n.length; i++) expect(n[i - 1].score).toBeGreaterThanOrEqual(n[i].score)
  })
})

describe('RAG geri getirme animasyonu', () => {
  const idx = buildIndex(NOTES_TR, RAG_DEFAULTS.size, RAG_DEFAULTS.overlap)
  const space = buildSpace(chunkItems(idx, NOTES_TR), groups)
  const q = 'MPU6050 ivmeölçerin varsayılan adresi nedir?'
  const anim = ragAnimation(space, idx, q, RAG_DEFAULTS)
  it('beş adım sırayla: sorgu → ara → getir → sırala → cevap', () => {
    expect(anim.frames.map((f) => f.kind)).toEqual([...RAG_STEPS])
    expect(anim.frames[0].links).toHaveLength(0)
    expect(anim.frames[1].links).toHaveLength(RAG_DEFAULTS.k * 2)
  })
  it('getir ve sırala adımları runRag sonucuyla aynı parçalar ve puanlar', () => {
    const r = runRag(idx, q, RAG_DEFAULTS)
    expect(anim.frames[2].links.map((l) => space.points[l.index].id)).toEqual(r.retrieved.map((h) => h.chunk.id))
    expect(anim.frames[3].links.map((l) => space.points[l.index].id)).toEqual(r.reranked.map((h) => h.chunk.id))
    expect(anim.frames[3].links.map((l) => l.score)).toEqual(r.reranked.map((h) => h.score))
    const used = anim.frames[4].links.filter((l) => l.kind === 'kullanilan').map((l) => space.points[l.index].id)
    expect(used).toEqual(r.used.map((h) => h.chunk.id))
    expect(anim.result.answer).toContain('0x68')
  })
  it('aday kümesi vektör sırasına göre ve ilk k\'yı kapsar', () => {
    const cand = anim.frames[1].links.map((l) => l.index)
    for (const l of anim.frames[2].links) expect(cand).toContain(l.index)
    expect(anim.frames[1].links[0].score).toBeCloseTo(anim.frames[2].links[0].score, 12)
  })
  it('notlarda olmayan soruda hiçbir parça kullanılmaz', () => {
    const a = ragAnimation(space, idx, 'Fransa\'nın başkenti neresidir?', RAG_DEFAULTS)
    expect(a.result.answered).toBe(false)
    expect(a.frames[4].links.every((l) => l.kind === 'elenen')).toBe(true)
  })
  it('zamanlama: adım sınırları, son adımda durur, sorgu merkezden yerine uçar', () => {
    const f = anim.frames
    expect(totalSec(f)).toBeCloseTo(RAG_STEPS.reduce((s, k) => s + STEP_SEC[k], 0), 12)
    expect(stepAt(f, 0)).toEqual({ i: 0, p: 0, done: false })
    for (let i = 0; i < f.length; i++) expect(stepAt(f, stepStart(f, i) + 1e-6).i).toBe(i)
    expect(stepAt(f, totalSec(f) + 5)).toEqual({ i: f.length - 1, p: 1, done: true })
    expect(queryPosAt(anim, 0)).toEqual([0, 0, 0])
    expect(queryPosAt(anim, stepStart(f, 1))).toEqual(anim.query.pos)
  })
})

describe('3B dikkat yayları', () => {
  it('ağırlıklar toplamı 1; "o" hafifti → kutu, güçlüydü → robot', () => {
    const a = attnScene(0, 1, 4)
    expect(a.weights.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 9)
    expect(a.tokens[a.best].text).toBe('kutuyu')
    expect(attnScene(1, 1, 4, 'en').tokens[attnScene(1, 1, 4).best].text).toBe('the robot')
  })
  it('en yüksek yay en büyük ağırlığa ait; yay uçları tokenlarda', () => {
    const a = attnScene(0, 1, 4)
    const hi = a.arcs.reduce((m, x) => (x.height > m.height ? x : m))
    expect(hi.to).toBe(a.best)
    const arc = a.arcs[1]
    expect(arcPoint(a, arc, 0)[0]).toBeCloseTo(a.tokens[4].x, 9)
    expect(arcPoint(a, arc, 1)[0]).toBeCloseTo(a.tokens[1].x, 9)
  })
  it('büyük τ dağılımı düzleştirir', () => {
    expect(Math.max(...attnScene(0, 3, 4).weights)).toBeLessThan(Math.max(...attnScene(0, 0.5, 4).weights))
  })
})
