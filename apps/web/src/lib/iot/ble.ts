// BLE temelleri: GATT hizmet/özellik modeli (Bluetooth SIG Environmental Sensing ve Battery hizmetleri + özel LED hizmeti),
// küçük-endian bayt kodlama, reklam (advertising) aralığının ortalama akıma ve keşif gecikmesine etkisi. Saf mantık.

export type Prop = 'read' | 'write' | 'notify'
export interface Char { uuid: string; name: { tr: string; en: string }; props: Prop[]; fmt: 'sint16_0.01' | 'uint16_0.01' | 'uint8' | 'bool' }
export interface Service { uuid: string; name: { tr: string; en: string }; chars: Char[] }

export const LED_SERVICE = '19b10000-e8f2-537e-4f6c-d104768a1214'
export const GATT: Service[] = [
  { uuid: '0x181A', name: { tr: 'Çevresel algılama', en: 'Environmental Sensing' }, chars: [
    { uuid: '0x2A6E', name: { tr: 'Sıcaklık', en: 'Temperature' }, props: ['read', 'notify'], fmt: 'sint16_0.01' },
    { uuid: '0x2A6F', name: { tr: 'Bağıl nem', en: 'Humidity' }, props: ['read', 'notify'], fmt: 'uint16_0.01' },
  ] },
  { uuid: '0x180F', name: { tr: 'Pil', en: 'Battery' }, chars: [
    { uuid: '0x2A19', name: { tr: 'Pil düzeyi', en: 'Battery Level' }, props: ['read', 'notify'], fmt: 'uint8' },
  ] },
  { uuid: LED_SERVICE, name: { tr: 'LED (özel hizmet)', en: 'LED (custom service)' }, chars: [
    { uuid: '19b10001-e8f2-537e-4f6c-d104768a1214', name: { tr: 'LED durumu', en: 'LED state' }, props: ['read', 'write'], fmt: 'bool' },
  ] },
]

/** Değeri özelliğin biçimine göre küçük-endian baytlara çevirir. */
export function encode(fmt: Char['fmt'], v: number | boolean): number[] {
  if (fmt === 'bool' || fmt === 'uint8') return [Number(v) & 0xff]
  const raw = Math.round((v as number) * 100)
  const u = fmt === 'sint16_0.01' ? (raw < 0 ? raw + 0x10000 : raw) & 0xffff : Math.max(0, Math.min(0xffff, raw))
  return [u & 0xff, (u >> 8) & 0xff]
}
export function decode(fmt: Char['fmt'], b: readonly number[]): number {
  if (fmt === 'bool' || fmt === 'uint8') return b[0] ?? 0
  const u = (b[0] ?? 0) | ((b[1] ?? 0) << 8)
  return (fmt === 'sint16_0.01' && u & 0x8000 ? u - 0x10000 : u) / 100
}
export const hex = (b: readonly number[]): string => b.map((x) => x.toString(16).padStart(2, '0').toUpperCase()).join(' ')

/**
 * Reklam aralığına göre ortalama akım (µA): her reklam olayı (3 kanalda yayın) yaklaşık `eventUc` µC yük harcar,
 * aradaki uykuda `sleepUa`. Varsayılanlar ESP32-C3/nRF52 sınıfı bir çip için kaba değerlerdir (öğretim amaçlı).
 */
export function advCurrentUa(intervalMs: number, txDbm: number, sleepUa = 5, eventUc = 15): number {
  const tx = eventUc * (1 + Math.max(0, txDbm) / 8) // daha yüksek verici gücü olay başına daha çok yük
  return sleepUa + tx / (intervalMs / 1000)
}
/** Telefonun cihazı bulma süresinin kaba ortalaması (ms): aralığın yarısı + tarama penceresi kaçırma payı. */
export const discoveryMs = (intervalMs: number): number => Math.round(intervalMs * 0.5 + 10 + intervalMs * 0.25)
/** CR2032 (225 mAh) ile kaç gün? */
export const coinCellDays = (avgUa: number, mah = 225): number => (mah * 1000) / avgUa / 24
