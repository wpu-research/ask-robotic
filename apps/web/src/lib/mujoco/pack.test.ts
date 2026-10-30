import { describe, expect, it } from 'vitest'
import { removeFromFs, unpack, writeToFs } from './pack'

const make = (files: { p: string; d: string }[]) => {
  const bodies = files.map((f) => new TextEncoder().encode(f.d))
  const header = new TextEncoder().encode(JSON.stringify({ files: files.map((f, i) => ({ p: f.p, n: bodies[i].length })) }))
  const out = new Uint8Array(4 + header.length + bodies.reduce((a, b) => a + b.length, 0))
  new DataView(out.buffer).setUint32(0, header.length, true)
  out.set(header, 4)
  let o = 4 + header.length
  for (const b of bodies) { out.set(b, o); o += b.length }
  return out
}

describe('pack', () => {
  it('dosyaları ayırır', () => {
    const f = unpack(make([{ p: 'a.xml', d: '<x/>' }, { p: 'assets/m.stl', d: 'abc' }]))
    expect(f.map((x) => x.path)).toEqual(['a.xml', 'assets/m.stl'])
    expect(new TextDecoder().decode(f[1].bytes)).toBe('abc')
  })
  it('bozuk paketi reddeder', () => {
    expect(() => unpack(new Uint8Array([1, 2]))).toThrow()
    const ok = make([{ p: 'a', d: 'xyz' }])
    expect(() => unpack(ok.subarray(0, ok.length - 1))).toThrow()
  })
  it('sanal dosya sistemine alt klasörlerle yazar', () => {
    const dirs: string[] = [], wrote: string[] = []
    writeToFs({ mkdir: (p) => dirs.push(p), writeFile: (p) => wrote.push(p) }, '/models/panda', unpack(make([{ p: 'panda.xml', d: '1' }, { p: 'assets/link0.obj', d: '2' }])))
    expect(dirs).toEqual(['/models', '/models/panda', '/models/panda/assets'])
    expect(wrote).toEqual(['/models/panda/panda.xml', '/models/panda/assets/link0.obj'])
  })
})

describe('removeFromFs', () => {
  it('klasörü alt klasörleriyle siler, olmayan klasörde hata vermez', () => {
    // Sanal dosya sistemi: yol → dosya/klasör
    const dirs = new Set<string>(['/m'])
    const files = new Set<string>()
    const fs = {
      readdir: (p: string) => { if (!dirs.has(p)) throw new Error('yok'); return ['.', '..', ...[...dirs, ...files].filter((x) => x.startsWith(p + '/') && !x.slice(p.length + 1).includes('/')).map((x) => x.slice(p.length + 1))] },
      stat: (p: string) => ({ mode: dirs.has(p) ? 1 : 0 }),
      isDir: (m: number) => m === 1,
      unlink: (p: string) => { files.delete(p) },
      rmdir: (p: string) => { dirs.delete(p) },
    }
    dirs.add('/m/assets'); files.add('/m/a.xml'); files.add('/m/assets/x.stl')
    removeFromFs(fs, '/m')
    expect(dirs.size + files.size).toBe(0)
    expect(() => removeFromFs(fs, '/yok')).not.toThrow()
  })
})
