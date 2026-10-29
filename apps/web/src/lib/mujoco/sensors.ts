// MuJoCo sensör verisini adlı "kanallara" çevirir: tek değerli sensör `ad`, çok değerli `ad.x/.y/.z` (3'lü) ya da `ad.0/.1…`.
// Bloklar, hedefler, grafik ve Python aynı kanal adlarını kullanır. Saf modül: modelden yalnız dizileri alır.

export interface Channel { name: string; adr: number; type: number }

export const SENSOR_RANGEFINDER = 7
/** Menzil bulucu hiçbir şeye çarpmazsa -1 verir; "mesafe < 0,3" yanlışlıkla doğru çıkmasın diye uzak bir değer sayılır. */
export const NO_HIT = 9

const XYZ = ['x', 'y', 'z']

export function buildChannels(names: string[], adr: ArrayLike<number>, dim: ArrayLike<number>, type: ArrayLike<number>): Channel[] {
  const out: Channel[] = []
  names.forEach((n, i) => {
    if (!n) return
    const d = dim[i]
    if (d === 1) out.push({ name: n, adr: adr[i], type: type[i] })
    else for (let k = 0; k < d; k++) out.push({ name: `${n}.${d === 3 ? XYZ[k] : k}`, adr: adr[i] + k, type: type[i] })
  })
  return out
}

export function readChannel(c: Channel, data: ArrayLike<number>): number {
  const v = data[c.adr]
  return c.type === SENSOR_RANGEFINDER && v < 0 ? NO_HIT : v
}

export function readAll(chs: Channel[], data: ArrayLike<number>): Record<string, number> {
  const o: Record<string, number> = {}
  for (const c of chs) o[c.name] = readChannel(c, data)
  return o
}
