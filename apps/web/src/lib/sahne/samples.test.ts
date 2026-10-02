import { describe, expect, it } from 'vitest'
import { SAMPLES } from './samples'
import { SahneSession } from './session'
import { exportProject, parseProject } from './project'

describe('örnek projeler', () => {
  it.each(SAMPLES.map((s) => [s.id, s] as const))('%s: hatasız çalışır, bir şey olur, içe aktarılabilir', (_id, s) => {
    const p = s.project()
    const sess = new SahneSession(p, { seed: 3 })
    sess.autoAnswer = () => 'x'
    sess.flag(); sess.tick(150)
    for (const k of ['a', 's', 'd', 'f']) sess.tap(k)
    for (const t of sess.engine.targets) sess.click(t.defId)
    sess.tick(10)
    expect(sess.error, sess.error?.message).toBeNull()
    expect(Object.keys(sess.engine.counts).length + sess.engine.pen.length + sess.engine.sayLog.length).toBeGreaterThan(0)
    expect(parseProject(exportProject(p))).not.toBeNull()
  })
  it('benzersiz kimlik ve ad', () => { expect(new Set(SAMPLES.map((s) => s.id)).size).toBe(SAMPLES.length) })
})
