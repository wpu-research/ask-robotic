// Eğitilmiş modelden mikrodenetleyici kodu: doğrusal model ve karar kütüğü için C fonksiyonu. İki biçim:
// float (ESP32'nin FPU'su var) ve sabit noktalı tamsayı (Uno'da FPU yok): girdiler santi-birimde int16 (23,45 °C → 2345),
// ağırlıklar Q-biçiminde int32 (w · 2^q), toplama int32'de (taşma denetimi aşağıda). Aynı tamsayı hesabını JS'te de yapan
// `predictFixed` üretilen kodun doğru olduğunu testte kanıtlar.
import type { Linear, Stump } from './model'

/** Girdi ölçeği: santi-birim (×100). Işık 0..1 ise 0..100 olur; ders tablosundaki tüm özellikler bu aralıkta. */
export const IN_SCALE = 100
/** int32 sınırı: toplamın mutlak değeri bunu aşmamalı. */
const I32 = 2 ** 31 - 1

export interface Fixed { q: number; w: number[]; b: number }
/** Ağırlıkları Q-biçimine çevirir: wq = round(w · 2^q); sabit terim santi-birimde: bq = round(b · 100 · 2^q). */
export function quantize(m: Pick<Linear, 'w'>, q: number): Fixed {
  const s = 2 ** q
  return { q, w: m.w.slice(1).map((v) => Math.round(v * s)), b: Math.round(m.w[0] * IN_SCALE * s) }
}
/** C'deki tamsayı hesabının birebir aynısı. Sonuç °C (santi-birimden çevrilmiş). */
export function predictFixed(f: Fixed, x: readonly number[]): number {
  const xc = x.map((v) => Math.round(v * IN_SCALE))
  const acc = xc.reduce((s, v, j) => s + v * f.w[j], f.b)
  return Math.floor(acc / 2 ** f.q) / IN_SCALE // >> q (aritmetik kaydırma = aşağı yuvarlama)
}
/** Verilen girdi aralığında toplamın en kötü durumda int32'ye sığıp sığmadığı. */
export function worstAcc(f: Fixed, maxAbsIn: readonly number[]): number {
  return Math.abs(f.b) + f.w.reduce((s, w, j) => s + Math.abs(w) * Math.round(maxAbsIn[j] * IN_SCALE), 0)
}
export const fitsInt32 = (f: Fixed, maxAbsIn: readonly number[]) => worstAcc(f, maxAbsIn) <= I32

const cname = (s: string) => s.replace(/[^A-Za-z0-9_]/g, '_')
const fl = (v: number) => { const s = v.toPrecision(7); return /[.e]/.test(s) ? `${s}f` : `${s}.0f` }

export function linearC(names: readonly string[], m: Pick<Linear, 'w'>, comment: string): string {
  const args = names.map((n) => `float ${cname(n)}`).join(', ')
  const terms = names.map((n, j) => `\n         + ${fl(m.w[j + 1])} * ${cname(n)}`).join('')
  return `// ${comment}\nfloat predict_temp(${args}) {\n  return ${fl(m.w[0])}${terms};\n}\n`
}

export function linearFixedC(names: readonly string[], f: Fixed, comment: string): string {
  const args = names.map((n) => `int16_t ${cname(n)}`).join(', ')
  const W = f.w.map((v) => String(v)).join(', ')
  const xs = names.map((n) => cname(n)).join(', ')
  return `// ${comment}\n#include <stdint.h>\n#define Q ${f.q}\nstatic const int32_t W[${f.w.length}] = { ${W} };\nstatic const int32_t B = ${f.b};\n\n` +
    `int16_t predict_temp_c(${args}) {\n  const int16_t x[${names.length}] = { ${xs} };\n  int32_t acc = B;\n` +
    `  for (uint8_t i = 0; i < ${names.length}; i++) acc += W[i] * (int32_t)x[i];\n  return (int16_t)(acc >> Q);\n}\n`
}

export function stumpC(names: readonly string[], s: Stump, comment: string): string {
  return `// ${comment}\nuint8_t classify(const float x[${names.length}]) {\n  return x[${s.f}] <= ${fl(s.t)} ? ${s.left} : ${s.right};  // ${cname(names[s.f])}\n}\n`
}

/** Bellek ve işlem maliyeti: ağırlık baytı ve çarpma sayısı; kaba çevrim tahmini (Uno: yazılım float çarpması ~140 çevrim,
 *  32 bit tamsayı çarpması ~40; ESP32 FPU'lu float çarpması ~4). */
export function cost(nFeat: number) {
  return {
    floatBytes: 4 * (nFeat + 1), fixedBytes: 4 * (nFeat + 1), mults: nFeat,
    unoFloatUs: (nFeat * 140) / 16, unoFixedUs: (nFeat * 40) / 16, esp32FloatUs: (nFeat * 4) / 240,
  }
}
