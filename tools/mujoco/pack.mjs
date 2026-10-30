// MuJoCo Menagerie modellerini tarayıcı için tek dosyaya paketler: apps/web/public/mujoco/models/<id>.pack.gz
// Kullanım: node tools/mujoco/pack.mjs <menagerie-klasörü> [id,id,...]   (ids verilirse yalnız onlar paketlenir)
// Biçim (gzip içinde): [uint32 LE başlık uzunluğu][JSON {files:[{p,n}]}][dosya baytları art arda]
// Her pakete modelin LICENSE dosyası da girer (LICENSE → <id>.LICENSE.txt olarak ayrıca kopyalanır).
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const src = process.argv[2]
if (!src) { console.error('kullanım: node tools/mujoco/pack.mjs <menagerie>'); process.exit(1) }
const out = new URL('../../apps/web/public/mujoco/models/', import.meta.url).pathname

// id → Menagerie klasörü ve alınacak üst düzey XML'ler (mjx_* ve sahne dosyaları alınmaz; sahneyi biz yazarız)
const MODELS = {
  panda: { dir: 'franka_emika_panda', xml: ['panda.xml', 'hand.xml'] },
  go1: { dir: 'unitree_go1', xml: ['go1.xml'] },
  shadow: { dir: 'shadow_hand', xml: ['right_hand.xml'] },
  iiwa: { dir: 'kuka_iiwa_14', xml: ['iiwa14.xml'] },
  // Lite6'nın motorları isimsizdir: sürücü ve Python adlarla çalışsın diye actuator1..6 adı verilir
  lite6: { dir: 'ufactory_lite6', xml: ['lite6.xml'], patch: { 'lite6.xml': (t) => t.replace(/<position joint="(joint\d)"/g, (_m, j) => `<position name="actuator${j.slice(5)}" joint="${j}"`) } },
  so101: { dir: 'robotstudio_so101', xml: ['so101.xml'], simplify: true },
  crazyflie: { dir: 'bitcraze_crazyflie_2', xml: ['cf2.xml'] },
  x2: { dir: 'skydio_x2', xml: ['x2.xml'] },
  spot: { dir: 'boston_dynamics_spot', xml: ['spot.xml'], simplify: true },
  anymal: { dir: 'anybotics_anymal_c', xml: ['anymal_c.xml'], simplify: true },
  // OP3'ün STL'leri çok ayrıntılı (45 MB): sadeleştirilir
  op3: { dir: 'robotis_op3', xml: ['op3.xml'], simplify: true },
}

function walk(d, base = d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name), base) : [path.relative(base, path.join(d, e.name))]))
}

// Büyük ikili STL'ler (ör. OP3: bir parça 9 MB) köşe kümelemesiyle sadeleştirilir: aynı ızgara hücresindeki köşeler birleşir,
// çökmüş üçgenler atılır. Görünüm farkı gözle seçilmez, indirme boyutu birkaç kat küçülür.
function simplifyStl(b, cells = 180) {
  if (b.length < 1_000_000 || b.length !== 84 + b.readUInt32LE(80) * 50) return b
  const n = b.readUInt32LE(80)
  const v = (i, k) => [0, 1, 2].map((c) => b.readFloatLE(84 + i * 50 + 12 + k * 12 + c * 4))
  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) v(i, k).forEach((x, c) => { lo[c] = Math.min(lo[c], x); hi[c] = Math.max(hi[c], x) })
  const cell = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / cells
  const rep = new Map() // hücre → [toplam, sayı]
  const key = (p) => p.map((x, c) => Math.round((x - lo[c]) / cell)).join(',')
  const tri = []
  for (let i = 0; i < n; i++) {
    const ps = [0, 1, 2].map((k) => v(i, k)); const ks = ps.map(key)
    ps.forEach((p, k) => { const r = rep.get(ks[k]) ?? [[0, 0, 0], 0]; p.forEach((x, c) => (r[0][c] += x)); r[1]++; rep.set(ks[k], r) })
    if (ks[0] !== ks[1] && ks[1] !== ks[2] && ks[0] !== ks[2]) tri.push(ks)
  }
  const pos = (k) => { const r = rep.get(k); return r[0].map((x) => x / r[1]) }
  const out = Buffer.alloc(84 + tri.length * 50)
  out.write('binary stl (muroko pack)', 0, 'latin1'); out.writeUInt32LE(tri.length, 80)
  tri.forEach((ks, i) => {
    const [a, c, d] = ks.map(pos)
    const e1 = c.map((x, j) => x - a[j]), e2 = d.map((x, j) => x - a[j])
    const nrm = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]
    const l = Math.hypot(...nrm) || 1
    ;[...nrm.map((x) => x / l), ...a, ...c, ...d].forEach((x, j) => out.writeFloatLE(x, 84 + i * 50 + j * 4))
  })
  return out
}

// OBJ: yinelenen köşeler birleşir, normal/doku koordinatları atılır (MuJoCo normalleri kendi hesaplar), ince ızgarada kümelenir.
function simplifyObj(b, cells = 300) {
  if (b.length < 200_000) return b
  const vs = [], faces = []
  for (const line of b.toString('latin1').split('\n')) {
    if (line.startsWith('v ')) vs.push(line.trim().split(/\s+/).slice(1, 4).map(Number))
    else if (line.startsWith('f ')) faces.push(line.trim().split(/\s+/).slice(1).map((t) => parseInt(t, 10) - 1))
  }
  if (!vs.length || !faces.length) return b
  const lo = [0, 1, 2].map((c) => Math.min(...vs.map((v) => v[c]))), hi = [0, 1, 2].map((c) => Math.max(...vs.map((v) => v[c])))
  const cell = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / cells
  const cellOf = vs.map((v) => v.map((x, c) => Math.round((x - lo[c]) / cell)).join(','))
  const id = new Map(), pos = []
  const idx = (i) => { const k = cellOf[i]; if (!id.has(k)) { id.set(k, pos.length); pos.push(vs[i]) } return id.get(k) }
  const out = []
  for (const f of faces) for (let i = 1; i + 1 < f.length; i++) { const t = [idx(f[0]), idx(f[i]), idx(f[i + 1])]; if (t[0] !== t[1] && t[1] !== t[2] && t[0] !== t[2]) out.push(t) }
  return Buffer.from(pos.map((v) => `v ${v.map((x) => +x.toFixed(6)).join(' ')}`).join('\n') + '\n' + out.map((t) => `f ${t.map((x) => x + 1).join(' ')}`).join('\n') + '\n')
}

// Tarayıcı görünümü doku kullanmaz (renk `rgba` ile gelir); büyük PNG dokular 1×1 PNG ile değiştirilir, MuJoCo yine derler.
const PIXEL_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')

const only = process.argv[3]?.split(',')
for (const [id, m] of Object.entries(MODELS)) {
  if (only && !only.includes(id)) continue
  const root = path.join(src, m.dir)
  const files = [...m.xml.filter((f) => fs.existsSync(path.join(root, f))), ...(fs.existsSync(path.join(root, 'assets')) ? walk(path.join(root, 'assets'), root) : []), 'LICENSE']
  const bufs = files.map((f) => { let b = fs.readFileSync(path.join(root, f)); if (f.endsWith('.stl')) b = m.simplify ? simplifyStl(b) : b; else if (m.simplify && f.endsWith('.obj')) b = simplifyObj(b); else if (m.simplify && f.endsWith('.png') && b.length > 100_000) b = PIXEL_PNG; const fix = m.patch?.[f]; return fix ? Buffer.from(fix(b.toString('utf8'))) : b })
  const header = Buffer.from(JSON.stringify({ files: files.map((p, i) => ({ p, n: bufs[i].length })) }))
  const len = Buffer.alloc(4); len.writeUInt32LE(header.length)
  const gz = zlib.gzipSync(Buffer.concat([len, header, ...bufs]), { level: 9 })
  fs.mkdirSync(out, { recursive: true })
  fs.writeFileSync(path.join(out, `${id}.pack.gz`), gz)
  fs.copyFileSync(path.join(root, 'LICENSE'), path.join(out, `${id}.LICENSE.txt`))
  console.log(id.padEnd(8), files.length, 'dosya', Math.round(gz.length / 1024), 'KB')
}
