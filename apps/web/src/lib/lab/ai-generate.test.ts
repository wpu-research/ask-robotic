import { describe, expect, it } from 'vitest'
import { DEFAULT_PARTS } from './parts'
import { generateCircuit } from './ai-generate'

const good = JSON.stringify({
  parts: [{ id: 'uno', type: 'uno' }, { id: 'r1', type: 'resistor', props: { ohms: 220 } }, { id: 'led1', type: 'led' }],
  wires: [{ a: 'uno.D13', b: 'r1.1' }, { a: 'r1.2', b: 'led1.A' }, { a: 'led1.K', b: 'uno.GND' }], code: 'void setup(){}void loop(){}', note: 'ok',
})
const opts = (complete: (s: string, u: string) => Promise<string>) => ({ locale: 'tr' as const, allowed: DEFAULT_PARTS, complete })

describe('generateCircuit', () => {
  it('geçerli çıktıyı devreye çevirir', async () => {
    const r = await generateCircuit('LED yak', opts(async () => '```json\n' + good + '\n```'))
    expect('error' in r).toBe(false)
    if (!('error' in r)) expect(r.circuit.wires).toHaveLength(3)
  })
  it('ilk çıktı geçersizse hata bildirimiyle bir kez daha dener', async () => {
    const users: string[] = []
    const r = await generateCircuit('LED yak', opts(async (_s, u) => { users.push(u); return users.length === 1 ? 'üzgünüm' : good }))
    expect('error' in r).toBe(false)
    expect(users).toHaveLength(2)
    expect(users[1]).toContain('not valid')
  })
  it('iki kez geçersizse bad_output, boş devrede empty', async () => {
    expect(await generateCircuit('x', opts(async () => 'çöp'))).toMatchObject({ error: 'bad_output' })
    expect(await generateCircuit('x', opts(async () => '{"parts":[],"wires":[],"note":"Yalnızca devre kurabilirim."}'))).toMatchObject({ error: 'empty', detail: 'Yalnızca devre kurabilirim.' })
  })
  it('mevcut devre isteğe eklenir; istek uzunluğu sınırlanır', async () => {
    let seen = ''
    await generateCircuit('a'.repeat(2000), { ...opts(async (_s, u) => { seen = u; return good }), current: { parts: [{ id: 'uno', type: 'uno', x: 0, y: 0, rotation: 0, props: {} }, { id: 'l', type: 'led', x: 0, y: 0, rotation: 0, props: {} }], wires: [] } })
    expect(seen).toContain('Current circuit')
    expect(seen.length).toBeLessThan(1200)
  })
})
