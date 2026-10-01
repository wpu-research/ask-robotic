// Uyarı türleri için Türkçe başlık ve simge.
import type { WarningKind } from './contract'

export const WARNING_META: Partial<Record<WarningKind, { icon: string; title: string }>> = {
  'short-circuit': { icon: '✖', title: 'Kısa devre' },
  'led-no-resistor': { icon: '⚠', title: 'LED’de direnç yok' },
  'led-burnt': { icon: '✖', title: 'LED yandı' },
  'floating-input': { icon: '〰', title: 'Boşta giriş' },
  'reversed-polarity': { icon: '⇄', title: 'Ters bağlantı' },
  'pin-overcurrent': { icon: '⚠', title: 'Pin aşırı akım' },
  'flyback-missing': { icon: '↯', title: 'Geri tepme diyotu yok' },
  unpowered: { icon: '⏻', title: 'Besleme yok' },
  'base-overcurrent': { icon: '⚠', title: 'Taban akımı çok yüksek' },
}

export const warningMeta = (kind: string) => WARNING_META[kind as WarningKind] ?? { icon: '⚠', title: 'Uyarı' }
