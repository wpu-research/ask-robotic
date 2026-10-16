// Güç parçaları (Hyvex 6. seviye): pil kimyaları, LM7805 doğrusal regülatör, buck (düşürücü) modülleri, MAX17048 yakıt
// göstergesi. DC çözücüde pil, iç dirençli Thevenin kaynağı (eksi ucu toprakta); regülatörler çıkışta denetimli kaynak,
// girişte çektikleri akım kadar "lavabo" (doğrusal: Iç ≈ Içıkış; buck: Pç / (η · Vgiriş)). Tarayıcı ve Node uyumlu.
import { registerDevice, type I2CDevice } from '../devices.js'

export type Chemistry = 'alkalin' | 'cinko-karbon' | 'nimh' | 'nicd' | 'liion' | 'lipo' | 'lifepo4' | 'kursun-asit' | 'cr2032' | 'sodyum-iyon'

/** Şarj durumu noktaları (%) ve hücre başına açık devre gerilimi (V). */
const SOC = [0, 10, 20, 40, 60, 80, 100]
export interface ChemSpec {
  label: string
  /** Hücre başına açık devre gerilimi, SOC noktalarında. */
  ocv: readonly number[]
  /** Hücre başına iç direnç (Ω). */
  rint: number
  /** Sürekli akım sınırı (A): aşılırsa uyarı. */
  imax: number
  /** Kapasite (mAh), tipik boyutta. */
  mah: number
  nominal: number
}
export const CHEMS: Record<Chemistry, ChemSpec> = {
  alkalin: { label: 'Alkalin (AA)', ocv: [1.0, 1.1, 1.2, 1.25, 1.3, 1.4, 1.6], rint: 0.15, imax: 1, mah: 2500, nominal: 1.5 },
  'cinko-karbon': { label: 'Çinko-karbon (AA)', ocv: [0.9, 1.05, 1.15, 1.2, 1.25, 1.35, 1.55], rint: 0.4, imax: 0.3, mah: 1000, nominal: 1.5 },
  nimh: { label: 'NiMH (AA)', ocv: [1.0, 1.15, 1.2, 1.22, 1.25, 1.3, 1.4], rint: 0.03, imax: 4, mah: 2000, nominal: 1.2 },
  nicd: { label: 'NiCd (AA)', ocv: [1.0, 1.15, 1.2, 1.22, 1.24, 1.28, 1.35], rint: 0.02, imax: 8, mah: 1000, nominal: 1.2 },
  liion: { label: 'Li-ion 18650', ocv: [3.0, 3.45, 3.6, 3.7, 3.8, 3.95, 4.2], rint: 0.05, imax: 10, mah: 2600, nominal: 3.7 },
  lipo: { label: 'LiPo', ocv: [3.0, 3.5, 3.65, 3.75, 3.85, 4.0, 4.2], rint: 0.01, imax: 50, mah: 1500, nominal: 3.7 },
  lifepo4: { label: 'LiFePO₄', ocv: [2.5, 3.0, 3.2, 3.25, 3.3, 3.33, 3.6], rint: 0.02, imax: 20, mah: 1500, nominal: 3.2 },
  'kursun-asit': { label: 'Kurşun-asit', ocv: [1.75, 1.9, 1.95, 2.0, 2.05, 2.1, 2.15], rint: 0.005, imax: 20, mah: 7000, nominal: 2.0 },
  cr2032: { label: 'CR2032 düğme pil', ocv: [2.0, 2.7, 2.85, 2.9, 2.95, 3.0, 3.2], rint: 15, imax: 0.003, mah: 220, nominal: 3.0 },
  'sodyum-iyon': { label: 'Sodyum-iyon', ocv: [1.5, 2.6, 2.9, 3.1, 3.25, 3.4, 4.0], rint: 0.03, imax: 10, mah: 1500, nominal: 3.1 },
}

/** Hücre başına açık devre gerilimi (doğrusal aradeğerleme). */
export function cellOcv(chem: Chemistry, soc: number): number {
  const c = CHEMS[chem] ?? CHEMS.lipo
  const s = Math.max(0, Math.min(100, soc))
  for (let i = 1; i < SOC.length; i++) {
    if (s <= SOC[i]) { const t = (s - SOC[i - 1]) / (SOC[i] - SOC[i - 1]); return c.ocv[i - 1] + t * (c.ocv[i] - c.ocv[i - 1]) }
  }
  return c.ocv.at(-1)!
}
/** Tek hücreli Li-ion/LiPo gerilimden şarj durumu (MAX17048'in ModelGauge tahminine yaklaşık). */
export function lipoSoc(v: number): number {
  const c = CHEMS.lipo.ocv
  if (v <= c[0]) return 0
  for (let i = 1; i < SOC.length; i++) if (v <= c[i]) return SOC[i - 1] + ((v - c[i - 1]) / (c[i] - c[i - 1])) * (SOC[i] - SOC[i - 1])
  return 100
}

/** LM7805: 5 V, ~2 V düşüm, 1,5 A, ~5 mA boşta akım. TO-220 soğutucusuz ~2 W'ta ısıl korumaya girer. */
export const LM7805 = { vout: 5, dropout: 2, imax: 1.5, iq: 0.005, pWarn: 1.2, pShutdown: 2.2, outOhms: 0.05 }

export type BuckModel = 'lm2596' | 'mp1584' | 'xl4015' | 'xl4016' | 'ap63200' | 'lm2576'
export const BUCKS: Record<BuckModel, { label: string; vinMax: number; vinMin: number; imax: number; voutMin: number; voutMax: number; eff: number; dropout: number }> = {
  lm2596: { label: 'LM2596', vinMin: 4.5, vinMax: 40, imax: 3, voutMin: 1.25, voutMax: 37, eff: 0.85, dropout: 1.5 },
  mp1584: { label: 'MP1584 (Mini-360)', vinMin: 4.5, vinMax: 28, imax: 3, voutMin: 0.8, voutMax: 20, eff: 0.9, dropout: 1 },
  xl4015: { label: 'XL4015', vinMin: 8, vinMax: 36, imax: 5, voutMin: 1.25, voutMax: 32, eff: 0.9, dropout: 1.5 },
  xl4016: { label: 'XL4016', vinMin: 8, vinMax: 36, imax: 8, voutMin: 1.25, voutMax: 32, eff: 0.92, dropout: 1.5 },
  ap63200: { label: 'AP63200', vinMin: 3.8, vinMax: 32, imax: 2, voutMin: 0.8, voutMax: 25, eff: 0.9, dropout: 0.6 },
  lm2576: { label: 'LM2576', vinMin: 4.75, vinMax: 60, imax: 3, voutMin: 1.23, voutMax: 37, eff: 0.82, dropout: 2 },
}

/** Regülatör çıkışının hedef gerilimi (girişe göre). */
export function lm7805Target(vin: number): number {
  if (vin < 2.5) return 0
  return Math.max(0, Math.min(LM7805.vout, vin - LM7805.dropout))
}
export function buckTarget(model: BuckModel, vset: number, vin: number): number {
  const b = BUCKS[model] ?? BUCKS.lm2596
  if (vin < b.vinMin || vin > b.vinMax * 1.15) return 0 // çalışmaz ya da aşırı gerilimde yandı
  return Math.max(0, Math.min(Math.max(b.voutMin, Math.min(b.voutMax, vset)), vin - b.dropout))
}

// ---- MAX17048 / MAX17043 yakıt göstergesi (I2C 0x36), 16 bit yazmaçlar MSB önce ----
export interface FuelGauge { device: I2CDevice; cellVolts: () => number }
/** VCELL 0x02 (78,125 µV/LSB), SOC 0x04 (1/256 %), MODE 0x06, VERSION 0x08 (0x0012), CONFIG 0x0C (0x971C), CRATE 0x16. */
export function fuelGauge(cellVolts: () => number, address = 0x36): FuelGauge {
  let config = 0x971c
  const word = (reg: number): number => {
    const v = cellVolts()
    switch (reg) {
      case 0x02: return Math.max(0, Math.min(0xffff, Math.round(v / 78.125e-6)))
      case 0x04: return Math.max(0, Math.min(0xffff, Math.round(lipoSoc(v) * 256)))
      case 0x08: return 0x0012
      case 0x0c: return config
      case 0x14: return 0x00ff // VALRT
      case 0x16: return 0
      case 0x18: return 0x9600 // VRESET
      case 0x1a: return 0x0100 // STATUS
      default: return 0
    }
  }
  let hi = 0
  const device = registerDevice(address, {
    read: (r) => (r & 1 ? word(r - 1) & 0xff : (word(r) >> 8) & 0xff),
    write: (r, v) => { if ((r & 1) === 0) hi = v; else if (r - 1 === 0x0c) config = (hi << 8) | v },
  })
  return { device, cellVolts }
}
