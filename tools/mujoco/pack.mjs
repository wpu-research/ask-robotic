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
  so101: { dir: 'robotstudio_so101', xml: ['so101.xml'] },
  crazyflie: { dir: 'bitcraze_crazyflie_2', xml: ['cf2.xml'] },
  x2: { dir: 'skydio_x2', xml: ['x2.xml'] },
}

function walk(d, base = d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name), base) : [path.relative(base, path.join(d, e.name))]))
}

const only = process.argv[3]?.split(',')
for (const [id, m] of Object.entries(MODELS)) {
  if (only && !only.includes(id)) continue
  const root = path.join(src, m.dir)
  const files = [...m.xml.filter((f) => fs.existsSync(path.join(root, f))), ...(fs.existsSync(path.join(root, 'assets')) ? walk(path.join(root, 'assets'), root) : []), 'LICENSE']
  const bufs = files.map((f) => { const b = fs.readFileSync(path.join(root, f)); const fix = m.patch?.[f]; return fix ? Buffer.from(fix(b.toString('utf8'))) : b })
  const header = Buffer.from(JSON.stringify({ files: files.map((p, i) => ({ p, n: bufs[i].length })) }))
  const len = Buffer.alloc(4); len.writeUInt32LE(header.length)
  const gz = zlib.gzipSync(Buffer.concat([len, header, ...bufs]), { level: 9 })
  fs.mkdirSync(out, { recursive: true })
  fs.writeFileSync(path.join(out, `${id}.pack.gz`), gz)
  fs.copyFileSync(path.join(root, 'LICENSE'), path.join(out, `${id}.LICENSE.txt`))
  console.log(id.padEnd(8), files.length, 'dosya', Math.round(gz.length / 1024), 'KB')
}
