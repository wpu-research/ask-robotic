// 3B model içe aktarma (STL, GLB/GLTF, OBJ) → gövde bloğu.
//
// DÜRÜST SINIR: MuJoCo'da çarpışma geometrisi dışbükeydir. İçe aktarılan model
// içbükeyse (delikli, çatallı, oyuk) MuJoCo onun DIŞBÜKEY ÖRTÜSÜNÜ alır. Bu
// yüzden görüntü de örtü olur — modelin oyukları kaybolur. Arayüz bunu açıkça
// söyler; sessizce "ithal edildi" denmez.
//
// Köşe sayısı da sınırlanır: binlerce köşe hem XML'i hem tarayıcı deposunu
// şişirir. Örtüyü koruyan destek yönü örneklemesiyle seyreltilir.

/** Dosyadan çıkan ham köşeler (x,y,z sırayla). */
export type RawVerts = Float32Array | number[]

export interface ImportResult {
  /** Dışbükey örtünün köşeleri, [-1,1] kutusuna ölçeklenmiş. */
  verts: [number, number, number][]
  /** Örtünün yüzeyleri (hacim hesabı için). */
  faces: number[][]
  /** Ölçeklemeden önceki gerçek boyut (m): modelin kendi ölçüsü. */
  sizeM: [number, number, number]
  /** Ham köşe sayısı (kullanıcıya "şu kadardan şu kadara indi" demek için). */
  rawCount: number
  /** Örtü ham modelden belirgin biçimde farklıysa true: içbükey ayrıntı kaybolmuştur. */
  hulled: boolean
}

/** Aynı noktayı tekrar tekrar göndermemek için kaba tekilleştirme. */
function dedupe(v: RawVerts): [number, number, number][] {
  const seen = new Set<string>()
  const out: [number, number, number][] = []
  for (let i = 0; i + 2 < v.length; i += 3) {
    const p: [number, number, number] = [v[i], v[i + 1], v[i + 2]]
    if (!p.every(Number.isFinite)) continue
    const k = p.map((c) => Math.round(c * 1e5)).join(',')
    if (seen.has(k)) continue
    seen.add(k)
    out.push(p)
  }
  return out
}

/** Küre üzerine düzgün dağılmış yönler (Fibonacci): destek noktaları için. */
function directions(n: number): [number, number, number][] {
  const out: [number, number, number][] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * i) / Math.max(1, n - 1)
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const t = golden * i
    out.push([Math.cos(t) * r, y, Math.sin(t) * r])
  }
  return out
}

/**
 * Köşe sayısını `max`a indirir. Rastgele atmak yerine her yönde EN UÇTAKİ nokta
 * seçilir: dışbükey örtü bu noktalardan kurulur, yani şekil korunur.
 */
export function hullSample(points: [number, number, number][], max = 192): [number, number, number][] {
  if (points.length <= max) return points
  const picked = new Set<number>()
  for (const d of directions(max)) {
    let best = 0
    let bestDot = -Infinity
    for (let i = 0; i < points.length; i++) {
      const dot = points[i][0] * d[0] + points[i][1] * d[1] + points[i][2] * d[2]
      if (dot > bestDot) { bestDot = dot; best = i }
    }
    picked.add(best)
  }
  return [...picked].map((i) => points[i])
}

/** Nokta kümesinin kapladığı kutu. */
export function boundsOf(points: [number, number, number][]): { min: [number, number, number]; max: [number, number, number] } {
  const min: [number, number, number] = [Infinity, Infinity, Infinity]
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity]
  for (const p of points) for (let k = 0; k < 3; k++) {
    if (p[k] < min[k]) min[k] = p[k]
    if (p[k] > max[k]) max[k] = p[k]
  }
  return { min, max }
}

/**
 * Ham köşeleri işler: tekilleştir, seyrelt, merkezle ve [-1,1] kutusuna ölçekle.
 * Dışbükey örtünün yüzeylerini bulmak çağıranın işidir (tarayıcıda ConvexHull).
 */
export function prepareVerts(raw: RawVerts, max = 192): {
  verts: [number, number, number][]
  sizeM: [number, number, number]
  rawCount: number
} {
  const pts = dedupe(raw)
  const rawCount = pts.length
  const { min, max: hi } = boundsOf(pts)
  const span: [number, number, number] = [hi[0] - min[0], hi[1] - min[1], hi[2] - min[2]]
  const mid: [number, number, number] = [(hi[0] + min[0]) / 2, (hi[1] + min[1]) / 2, (hi[2] + min[2]) / 2]
  const half = Math.max(span[0], span[1], span[2]) / 2 || 1
  // Merkezle ve en uzun kenarı 2 birim yapacak şekilde ölçekle
  const centered = pts.map((p) => [(p[0] - mid[0]) / half, (p[1] - mid[1]) / half, (p[2] - mid[2]) / half] as [number, number, number])
  return { verts: hullSample(centered, max), sizeM: span, rawCount }
}

/** Dosya adından biçim. Tanınmayan uzantı null. */
export function formatOf(name: string): 'stl' | 'glb' | 'obj' | null {
  const ext = name.toLowerCase().split('.').pop() ?? ''
  if (ext === 'stl') return 'stl'
  if (ext === 'glb' || ext === 'gltf') return 'glb'
  if (ext === 'obj') return 'obj'
  return null
}

/** İkili STL okuyucu: başlık 80 bayt, sonra üçgen sayısı ve üçgenler. */
export function parseBinaryStl(buf: ArrayBuffer): number[] | null {
  if (buf.byteLength < 84) return null
  const dv = new DataView(buf)
  const tris = dv.getUint32(80, true)
  if (84 + tris * 50 !== buf.byteLength) return null // ASCII STL ya da bozuk
  const out: number[] = []
  let o = 84
  for (let i = 0; i < tris; i++) {
    o += 12 // normal atlanır
    for (let k = 0; k < 9; k++) { out.push(dv.getFloat32(o, true)); o += 4 }
    o += 2 // nitelik baytı
  }
  return out
}

/** Metin STL okuyucu. */
export function parseAsciiStl(text: string): number[] | null {
  const out: number[] = []
  const re = /vertex\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) out.push(Number(m[1]), Number(m[2]), Number(m[3]))
  return out.length ? out : null
}

/** OBJ okuyucu: yalnız `v` satırları (yüzeyler örtüden kurulur). */
export function parseObj(text: string): number[] | null {
  const out: number[] = []
  for (const line of text.split('\n')) {
    if (!line.startsWith('v ')) continue
    const p = line.trim().split(/\s+/)
    if (p.length < 4) continue
    out.push(Number(p[1]), Number(p[2]), Number(p[3]))
  }
  return out.length ? out : null
}

/** STL'i ikili ya da metin olarak çözer. */
export function parseStl(buf: ArrayBuffer): number[] | null {
  return parseBinaryStl(buf) ?? parseAsciiStl(new TextDecoder().decode(buf))
}
