// MuJoCo Menagerie model paketi (tools/mujoco/pack.mjs): gzip açıldıktan sonraki bayt dizisini dosyalara ayırır.
// Biçim: [uint32 LE başlık uzunluğu][JSON {files:[{p,n}]}][dosya baytları art arda]. Saf modül: tarayıcı ve Node ortak kullanır.

export interface PackFile { path: string; bytes: Uint8Array }

export function unpack(buf: Uint8Array): PackFile[] {
  if (buf.length < 4) throw new Error('Model paketi bozuk (çok kısa)')
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  const hl = dv.getUint32(0, true)
  if (4 + hl > buf.length) throw new Error('Model paketi bozuk (başlık)')
  const header = JSON.parse(new TextDecoder().decode(buf.subarray(4, 4 + hl))) as { files: { p: string; n: number }[] }
  let off = 4 + hl
  return header.files.map(({ p, n }) => {
    if (off + n > buf.length) throw new Error(`Model paketi bozuk (${p})`)
    const bytes = buf.subarray(off, off + n)
    off += n
    return { path: p, bytes }
  })
}

/** Paket dosyalarını Emscripten sanal dosya sistemine `root` altına yazar (alt klasörler dahil). */
export function writeToFs(fs: { mkdir: (p: string) => void; writeFile: (p: string, d: Uint8Array) => void }, root: string, files: PackFile[]) {
  const made = new Set<string>()
  const mk = (dir: string) => {
    let cur = ''
    for (const part of dir.split('/').filter(Boolean)) {
      cur += `/${part}`
      if (!made.has(cur)) { try { fs.mkdir(cur) } catch { /* zaten var */ } made.add(cur) }
    }
  }
  mk(root)
  for (const f of files) {
    const full = `${root}/${f.path}`
    mk(full.slice(0, full.lastIndexOf('/')))
    fs.writeFile(full, f.bytes)
  }
}
