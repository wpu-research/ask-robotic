// Güç bütçesi (görev döngüsü ve derin uyku ile pil ömrü) ve OTA güncellemesinin A/B bölüm durum makinesi. Saf mantık.

export interface PowerParams {
  capacityMah: number
  /** Uyanık geçen süre (s): sensör okuma + Wi-Fi bağlanma + yayın. */
  awakeS: number
  /** Uyanıkken ortalama akım (mA); Wi-Fi yayınında ESP32 ~100–160 mA. */
  awakeMa: number
  /** Uyku akımı (µA): yalın modül ~10 µA, DevKit kartında regülatör ve USB çipi yüzünden çoğu zaman mA düzeyi. */
  sleepUa: number
  /** Uyanma aralığı (s). */
  intervalS: number
  /** Kullanılabilir kapasite oranı (soğuk, yaşlanma, kesme gerilimi): ~0,8. */
  derate?: number
}

/** Ortalama akım (mA) = (uyanık yük + uyku yükü) / aralık. */
export function avgCurrentMa(p: PowerParams): number {
  const awake = Math.min(p.awakeS, p.intervalS)
  return (p.awakeMa * awake + (p.sleepUa / 1000) * (p.intervalS - awake)) / p.intervalS
}
/** Pil ömrü (gün). */
export const batteryDays = (p: PowerParams): number => (p.capacityMah * (p.derate ?? 0.8)) / avgCurrentMa(p) / 24

/** Hazır kipler: aynı 60 s aralıkta neyi değiştirdiğini karşılaştırmak için. */
export const POWER_MODES = {
  always: { awakeS: 60, awakeMa: 95, sleepUa: 0 },
  modem: { awakeS: 60, awakeMa: 22, sleepUa: 0 },
  light: { awakeS: 1.2, awakeMa: 120, sleepUa: 800 },
  deep: { awakeS: 1.2, awakeMa: 120, sleepUa: 10 },
  deepDevkit: { awakeS: 1.2, awakeMa: 120, sleepUa: 6000 },
} as const
export type PowerMode = keyof typeof POWER_MODES

// --- OTA ---------------------------------------------------------------------------------------------------------------------

export type Slot = 'A' | 'B'
export type OtaPhase = 'idle' | 'downloading' | 'verifying' | 'ready' | 'pending' | 'done' | 'rolledBack' | 'failed'
export type OtaEvent = 'start' | 'downloadOk' | 'downloadFail' | 'verifyOk' | 'verifyFail' | 'reboot' | 'selfTestOk' | 'selfTestFail'
export interface Ota { running: Slot; boot: Slot; phase: OtaPhase; version: Record<Slot, string>; incoming: string }

export const otaInit = (): Ota => ({ running: 'A', boot: 'A', phase: 'idle', version: { A: '1.4.0', B: '1.3.2' }, incoming: '1.5.0' })
const other = (s: Slot): Slot => (s === 'A' ? 'B' : 'A')

/**
 * A/B güncelleme: yeni yazılım çalışmayan bölüme indirilir, imza/özet doğrulanır, önyükleme bölümü değiştirilir, yeniden
 * başlatılır. Yeni sürüm "beklemede" açılır; kendi sınamasını geçerse geçerli işaretlenir, geçemezse (ya da çökerse) bir
 * sonraki açılışta eski bölüme geri dönülür. Geçersiz olaylar durumu değiştirmez.
 */
export function otaStep(s: Ota, e: OtaEvent): Ota {
  const tgt = other(s.running)
  switch (s.phase) {
    case 'idle': case 'done': case 'rolledBack': case 'failed':
      return e === 'start' ? { ...s, phase: 'downloading' } : s
    case 'downloading':
      if (e === 'downloadOk') return { ...s, phase: 'verifying', version: { ...s.version, [tgt]: s.incoming } }
      if (e === 'downloadFail') return { ...s, phase: 'failed' }
      return s
    case 'verifying':
      if (e === 'verifyOk') return { ...s, phase: 'ready', boot: tgt }
      if (e === 'verifyFail') return { ...s, phase: 'failed' }
      return s
    case 'ready':
      return e === 'reboot' ? { ...s, phase: 'pending', running: s.boot } : s
    case 'pending':
      if (e === 'selfTestOk') return { ...s, phase: 'done' }
      if (e === 'selfTestFail' || e === 'reboot') { const back = other(s.running); return { ...s, phase: 'rolledBack', running: back, boot: back } }
      return s
  }
}
