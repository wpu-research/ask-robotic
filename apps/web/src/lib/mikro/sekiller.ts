// Gövde şekilleri: MuJoCo'nun yerleşik ilkelleri + dışbükey çokyüzlüler.
//
// MuJoCo'da yerleşik olan şekiller (kutu, küre, silindir, kapsül, elipsoid)
// doğrudan geom olur. Koni, prizmalar, piramitler ve platonik cisimler yerleşik
// değildir ama HEPSİ DIŞBÜKEYDİR: MJCF'e köşe listesi olarak verilir, MuJoCo
// dışbükey örtüyü alır ve bu tam olarak şeklin kendisidir. Yani yaklaşım yok.
//
// Tor (simit) bilerek yok: dışbükey değildir, MuJoCo onu dolu bir disk gibi
// görürdü. Göründüğü gibi davranmayan bir şekil koymuyoruz.
//
// Birim şekiller [-1, 1] kutusuna sığar; ölçeklenince hacim sx·sy·sz ile çarpılır.

/** Köşe listesi (x,y,z üçlüleri) ve yüzeyler (köşe indisleri). */
export interface Poly {
  verts: [number, number, number][]
  faces: number[][]
}

/** Çember yaklaşımındaki dilim sayısı: görüntü düzgün, köşe sayısı makul. */
const SEG = 24

const PHI = (1 + Math.sqrt(5)) / 2

/** Düzgün çokgen köşeleri (birim çemberde), z sabit. */
function ring(n: number, z: number, phase = 0): [number, number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const a = phase + (2 * Math.PI * i) / n
    return [Math.cos(a), Math.sin(a), z] as [number, number, number]
  })
}

/** Alt ve üst çokgeni birleştiren prizma. */
function prism(n: number): Poly {
  const verts = [...ring(n, -1), ...ring(n, 1)]
  const faces: number[][] = [
    Array.from({ length: n }, (_, i) => n - 1 - i), // alt (aşağı bakan)
    Array.from({ length: n }, (_, i) => n + i),     // üst
  ]
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    faces.push([i, j, n + j, n + i])
  }
  return { verts, faces }
}

/** Tabanı çokgen, tepesi tek nokta olan piramit/koni. */
function pyramid(n: number, phase = 0): Poly {
  const verts: [number, number, number][] = [...ring(n, -1, phase), [0, 0, 1]]
  const faces: number[][] = [Array.from({ length: n }, (_, i) => n - 1 - i)]
  for (let i = 0; i < n; i++) faces.push([i, (i + 1) % n, n])
  return { verts, faces }
}

/** Kare tabanlı piramit: tabanı kutuyu tam doldurur (çembere değil kareye oturur). */
function sqPyramid(): Poly {
  return {
    verts: [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [0, 0, 1]],
    faces: [[3, 2, 1, 0], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]],
  }
}

function tetrahedron(): Poly {
  return {
    verts: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]],
    faces: [[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]],
  }
}

function octahedron(): Poly {
  return {
    verts: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]],
    faces: [[0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4], [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5]],
  }
}

/** Düzgün onikiyüzlü; köşeler [-1,1] kutusuna sığacak şekilde ölçeklenir. */
function dodecahedron(): Poly {
  const a = 1 / PHI
  const raw: [number, number, number][] = []
  for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) raw.push([sx, sy, sz])
  for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    raw.push([0, s1 * a, s2 * PHI])
    raw.push([s1 * a, s2 * PHI, 0])
    raw.push([s1 * PHI, 0, s2 * a])
  }
  const k = 1 / PHI // en büyük koordinat φ idi
  const verts = raw.map(([x, y, z]) => [x * k, y * k, z * k] as [number, number, number])
  // Yüzeyler yerine dışbükey örtü kullanılır: hacim merkezden üçgenlemeyle bulunur.
  return { verts, faces: convexFaces(verts) }
}

/**
 * Dışbükey bir nokta kümesinin yüzeylerini kaba kuvvetle bulur (O(n⁴)).
 * Yalnız sabit, küçük şekiller için çalıştırılır (onikiyüzlü: 20 köşe).
 * Her üçlü için, diğer bütün noktalar düzlemin aynı tarafındaysa o bir yüzeydir.
 */
function convexFaces(v: [number, number, number][]): number[][] {
  const n = v.length
  const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

  // Bir yüzey beşgen olabilir: aynı düzlemdeki bütün üçlüler ayrı yüzey sayılırsa
  // hacim defalarca toplanır. Bu yüzden düzleme göre gruplanır, her düzlem bir kez alınır.
  const seen = new Map<string, number[]>()
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
    const nrm = cross(sub(v[j], v[i]), sub(v[k], v[i]))
    const len = Math.hypot(nrm[0], nrm[1], nrm[2])
    if (len < 1e-9) continue
    const u = nrm.map((c) => c / len)
    const d = dot(u, v[i])
    let pos = 0, neg = 0
    for (let m = 0; m < n; m++) {
      const s = dot(u, v[m]) - d
      if (s > 1e-6) pos++
      else if (s < -1e-6) neg++
    }
    if (pos && neg) continue // düzlem kümeyi kesiyor: yüzey değil
    // Dışa bakan normal: diğer noktalar hep negatif tarafta kalmalı
    const out = neg ? u : u.map((c) => -c)
    const od = neg ? d : -d
    // Negatif sıfır ("-0.00000") ayrı anahtar üretip aynı yüzeyi iki kez saydırmasın
    const q = (c: number) => { const r = Math.round(c * 1e5) / 1e5; return (r === 0 ? 0 : r).toFixed(5) }
    const key = out.map(q).join(',') + '|' + q(od)
    if (seen.has(key)) continue
    // Bu düzlemdeki bütün köşeler, merkez etrafında saat yönünün tersine sıralanır
    const on = Array.from({ length: n }, (_, m) => m).filter((m) => Math.abs(dot(out, v[m]) - od) < 1e-6)
    const c0 = [0, 1, 2].map((a) => on.reduce((s, m) => s + v[m][a], 0) / on.length)
    const ex = sub(v[on[0]], c0)
    const exLen = Math.hypot(...ex) || 1
    const e1 = ex.map((c) => c / exLen)
    const e2 = cross(out, e1)
    const sorted = on.slice().sort((a, b) =>
      Math.atan2(dot(sub(v[a], c0), e2), dot(sub(v[a], c0), e1)) -
      Math.atan2(dot(sub(v[b], c0), e2), dot(sub(v[b], c0), e1)))
    seen.set(key, sorted)
  }
  return [...seen.values()]
}

/**
 * Kapalı bir çokyüzlünün hacmi: her yüzeyi merkezden üçgenleyip işaretli
 * dörtyüzlü hacimlerini toplar (diverjans kuramı). Köşeler birim kutudadır,
 * ölçekli hacim bununla sx·sy·sz çarpımıdır.
 */
export function polyVolume(p: Poly): number {
  let v = 0
  for (const f of p.faces) {
    for (let i = 1; i + 1 < f.length; i++) {
      const [a, b, c] = [p.verts[f[0]], p.verts[f[i]], p.verts[f[i + 1]]]
      v += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6
    }
  }
  return Math.abs(v)
}

/** Örgü olarak verilen (MuJoCo'da yerleşik olmayan) şekiller. */
export type MeshShape =
  | 'koni' | 'ucgen-prizma' | 'alti-prizma' | 'kare-piramit' | 'besgen-piramit'
  | 'dortyuzlu' | 'sekizyuzlu' | 'onikiyuzlu'

const BUILDERS: Record<MeshShape, () => Poly> = {
  koni: () => pyramid(SEG),
  'ucgen-prizma': () => prism(3),
  'alti-prizma': () => prism(6),
  'kare-piramit': sqPyramid,
  'besgen-piramit': () => pyramid(5),
  dortyuzlu: tetrahedron,
  sekizyuzlu: octahedron,
  onikiyuzlu: dodecahedron,
}

const cache = new Map<MeshShape, Poly>()
export function unitPoly(shape: MeshShape): Poly {
  let p = cache.get(shape)
  if (!p) { p = BUILDERS[shape](); cache.set(shape, p) }
  return p
}

/** Birim şeklin hacmi; ölçekli hacim = bu × sx × sy × sz. */
export function unitVolume(shape: MeshShape): number {
  return polyVolume(unitPoly(shape))
}

/** MJCF `<mesh vertex="...">` için köşe dizisi; verilen yarı boyutlarla ölçeklenir. */
export function meshVertexAttr(shape: MeshShape, size: [number, number, number]): string {
  const f = (n: number) => Number(n.toFixed(6)).toString()
  return unitPoly(shape).verts.map(([x, y, z]) => `${f(x * size[0])} ${f(y * size[1])} ${f(z * size[2])}`).join(' ')
}
