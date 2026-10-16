// Uyarı türleri için Türkçe başlık ve simge; dile bağlı başlık ve ileti (sim iletileri Türkçedir, burada çevrilir).
import type { Locale, MessageKey, TFunction } from '@/i18n'
import type { LabWarning, WarningKind } from './contract'

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
  'logic-level': { icon: '⚡', title: 'Lojik seviye uyumsuz' },
  power: { icon: '🔋', title: 'Güç uyarısı' },
}

export const warningMeta = (kind: string) => WARNING_META[kind as WarningKind] ?? { icon: '⚠', title: 'Uyarı' }

/** Uyarı başlığı, seçili dilde. */
export function warningTitle(t: TFunction, kind: string): string {
  if (!WARNING_META[kind as WarningKind]) return t('lab.warn.title.generic')
  return t(`lab.warn.title.${kind}` as MessageKey)
}

// Sim iletilerindeki Türkçe modül adları → sözlük anahtarı (lab.warn.name.*).
const MODULE_NAMES: Record<string, string> = {
  'Röle modülü': 'relay', 'DHT sensörü': 'dht', 'PIR modülü': 'pir', 'IR engel modülü': 'irobstacle', 'RTC modülü': 'rtc',
  'MQ-2 modülü': 'mq2', 'MQ-3 modülü': 'mq3', 'MQ-4 modülü': 'mq4', 'MQ-7 modülü': 'mq7', 'MQ-135 modülü': 'mq135',
  'Alev modülü': 'flame', 'Ses modülü': 'sound', 'Toprak nemi modülü': 'soil', 'Yağmur sensörü': 'rain', 'Su seviyesi sensörü': 'waterlevel',
  'Sharp IR sensörü': 'sharpir', 'TMC2209 step sürücü': 'stepper', 'Step sürücü': 'stepDriver', 'Buck modülü': 'buck',
}
const moduleName = (t: TFunction, s: string) => (MODULE_NAMES[s] ? t(`lab.warn.name.${MODULE_NAMES[s]}` as MessageKey) : s)

type Rule = [RegExp, (t: TFunction, m: RegExpMatchArray) => string]
const M = (k: string) => `lab.warn.msg.${k}` as MessageKey
// packages/sim/src/circuit/analysis.ts ve lab.ts'teki iletilerle eşleşir. Yeni bir ileti eşleşmezse tür başlığına bağlı genel metin değil, özgün ileti gösterilir.
const RULES: Rule[] = [
  [/^(5V|3V3) hattı doğrudan GND'ye bağlı \(kısa devre\)\.$/, (t, m) => t(M('railShort'), { rail: m[1] })],
  [/^5V ile 3V3 hatları birbirine bağlı\.$/, (t) => t(M('railsJoined'))],
  [/^LED ters bağlı: /, (t) => t(M('ledReversed'))],
  [/^LED'in seri direnci yok; /, (t) => t(M('ledNoResistor'))],
  [/^LED'in seri direnci yok ya da çok küçük/, (t) => t(M('ledOvercurrent'))],
  [/^(\S+) pinine bağlı hat toprağa/, (t, m) => t(M('floatingPin'), { pin: m[1] })],
  [/^(.+) beslenmemiş: (.+) 5 V \/ GND hattına bağlı değil\.$/, (t, m) => t(M('unpowered'), { name: moduleName(t, m[1]), pins: m[2].replace('(motor beslemesi)', t(M('motorSupply'))) })],
  [/^(.+) (\S+) ucu bağlı değil: sensör çalışmaz\.$/, (t, m) => t(M('sensorPin'), { name: moduleName(t, m[1]), pin: m[2] })],
  [/^(.+) (\S+) ucu doğrudan bir Arduino pinine bağlı olmalı/, (t, m) => t(M('directPin'), { name: moduleName(t, m[1]), pin: m[2] })],
  [/^(.+) (\S+) ucu (\S+) pinine bağlı değil: I2C/, (t, m) => t(M('i2cPin'), { name: moduleName(t, m[1]), pin: m[2], uno: m[3] })],
  [/^74HC595 (\S+) ucu bağlı değil \(yüzen giriş\): (.+)\.$/, (t, m) => t(M('sr595'), {
    pin: m[1], note: t(M(m[2].startsWith('çıkışlar') ? 'sr595Oe' : m[2].startsWith('kaydırma') ? 'sr595Srclr' : 'sr595Dead')),
  })],
  [/^Transistörün tabanında seri direnç yok/, (t) => t(M('baseNoResistor'))],
  [/^Motorun flyback diyodu ters bağlı/, (t) => t(M('flybackReversed'))],
  [/^Motor transistör\/MOSFET ile sürülüyor/, (t) => t(M('flybackMissing'))],
  [/^LED yandı \((\d+) mA\)/, (t, m) => t(M('ledBurnt'), { ma: m[1] })],
  [/^Taban akımı (\d+) mA: /, (t, m) => t(M('baseHigh'), { ma: m[1] })],
  [/^(\S+) hattı dirençsiz bir yolla topraklandı/, (t, m) => t(M('railGrounded'), { name: m[1] })],
  [/^(\S+) pini doğrudan GND'ye bağlı/, (t, m) => t(M('pinToGnd'), { name: m[1] })],
  [/^(\S+) pini doğrudan 5V'a bağlı/, (t, m) => t(M('pinTo5v'), { name: m[1] })],
  [/^(.+) DQ hattında pull-up direnci yok/, (t, m) => t(M('oneWirePullup'), { name: moduleName(t, m[1]) })],
  [/^Pilin \+ ve − uçları doğrudan/, (t) => t(M('batShort'))],
  [/^Pilin \+ ucu GND'ye bağlı/, (t) => t(M('batPlusGnd'))],
  [/^Pilin − ucu Arduino GND'sine bağlı değil/, (t) => t(M('batNoGnd'))],
  [/^Pil Uno'nun 5V\/VIN hattına bağlı/, (t) => t(M('batOnRail'))],
  [/^(.+) GND ucu Arduino GND'sine bağlı değil: regülatör/, (t, m) => t(M('regNoGnd'), { name: moduleName(t, m[1]) })],
  [/^(.+) girişi \((\S+)\) bağlı değil: bir pil/, (t, m) => t(M('regNoIn'), { name: moduleName(t, m[1]), pin: m[2] })],
  [/^(.+) çıkışı Uno'nun 5V\/VIN hattına bağlı/, (t, m) => t(M('regOnRail'), { name: moduleName(t, m[1]) })],
  [/^Pil ([\d.]+) A veriyor: (.+) için sürekli sınır ([\d.]+) A/, (t, m) => t(M('batOver'), { a: m[1], chem: m[2], max: m[3] })],
  [/^LM7805 ([\d.]+) W ısı üretiyor.*yaklaşık ([\d.]+) W/, (t, m) => t(M('regHot'), { w: m[1], cut: m[2] })],
  [/^(.+) ([\d.]+) A veriyor: sınır ([\d.]+) A\.$/, (t, m) => t(M('regOver'), { name: m[1], a: m[2], max: m[3] })],
  [/^(.+) girişi ([\d.]+) V: sınır ([\d.]+) V/, (t, m) => t(M('buckVin'), { name: m[1], v: m[2], max: m[3] })],
  [/^HC-05 TXD ve RXD bağlı değil/, (t) => t(M('btNoData'))],
  [/^HC-05 RXD ucu bir Arduino pinine/, (t) => t(M('btRxd'))],
  [/^HC-05 RXD 3,3 V lojik girişidir/, (t) => t(M('btLevel'))],
  [/^HC-05 D0\/D1'e bağlı/, (t) => t(M('btUsb'))],
  [/^(\S+) pininden (\d+) mA geçiyor/, (t, m) => t(M('pinOvercurrent'), { name: m[1], ma: m[2] })],
]

/** Uyarı iletisi, seçili dilde. Türkçede sim iletisi aynen döner; tanınmayan ileti de aynen döner. */
export function warningMessage(t: TFunction, locale: Locale, w: Pick<LabWarning, 'message'>): string {
  if (locale === 'tr') return w.message
  for (const [re, fn] of RULES) {
    const m = w.message.match(re)
    if (m) return fn(t, m)
  }
  return w.message
}
