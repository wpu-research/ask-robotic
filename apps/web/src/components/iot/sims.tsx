'use client'
// ESP32 ile Nesnelerin İnterneti dersinin tarayıcı simülasyonları. Mantık lib/iot'ta (saf, testli); burada yalnız React
// görünümü ve denetimler var. Gerçek ağ yok: broker, cihazlar ve bağlantı kaybı deterministik benzetimdir.
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Bars, Body, Btn, Check, Flow, Gauge, LineChart, Readout, Select, SimFrame, Slider, TextIn, color, nf, type Lang } from '@/components/kurs/ui'
import { GATT, advCurrentUa, coinCellDays, decode, discoveryMs, encode, hex, type Char } from '@/lib/iot/ble'
import { Ring, alarmStates, commandRun, dailyTraffic, minMaxDownsample, payload, publishSize, readSensor, reportOnChange, shadowDelta, type PayloadFmt } from '@/lib/iot/device'
import { ESP32_PINS, WL, adcToVolt, checkPin, simulateWifi, type Issue, type PinUse, type WifiState } from '@/lib/iot/esp32'
import { handle, initialDev, rawRequest, rawResponse, type DevState, type Method } from '@/lib/iot/http'
import { Broker, simulateQos, topicMatches, validFilter, validTopic, type Delivery, type QoS } from '@/lib/iot/mqtt'
import { POWER_MODES, avgCurrentMa, batteryDays, otaInit, otaStep, type Ota, type OtaEvent, type PowerMode } from '@/lib/iot/power'
import { ACT_NAME, DEFAULT_RULES, parseRules, simulateDay, type Actuator } from '@/lib/iot/rules'
import { aclCheck, audit, parseAcl, type Finding, type Setup } from '@/lib/iot/security'
import { Scene3D } from '@/components/kurs/scene3d'
import { frameAt, messagesOfDay, packetsAt, type PacketKind } from '@/lib/iot/scene'
import { IOT_SIM_META, type IotSimId } from './sim-meta'
import type { IotSceneState } from './scene-sera'

type P = { lang: Lang }

// --- 1. Pin planlayıcı ------------------------------------------------------------------------------------------------------

const ISSUE_TEXT: Record<Issue, { tr: string; en: string }> = {
  flash: { tr: 'GPIO 6–11 dahili SPI flash\'a bağlı: kullanılırsa kart açılmaz.', en: 'GPIO 6–11 are wired to the internal SPI flash: using them stops the board from booting.' },
  inputOnly: { tr: 'GPIO 34–39 yalnız giriştir: çıkış veremez.', en: 'GPIO 34–39 are input only: they cannot drive an output.' },
  noPull: { tr: 'GPIO 34–39\'da dahili pull-up/down yok: dış direnç gerekir.', en: 'GPIO 34–39 have no internal pull-up/down: add an external resistor.' },
  strap: { tr: 'Açılış (strapping) pini: açılışta düzeyi önyükleme kipini etkiler.', en: 'Strapping pin: its level at reset affects the boot mode.' },
  strap12: { tr: 'GPIO 12 açılışta HIGH ise flash gerilimi 1,8 V seçilir, kart açılmayabilir.', en: 'If GPIO 12 is HIGH at reset the flash voltage is set to 1.8 V and the board may not boot.' },
  adc2Wifi: { tr: 'ADC2 kanalı: Wi-Fi açıkken analogRead çalışmaz. ADC1 (32–39) kullan.', en: 'ADC2 channel: analogRead does not work while Wi-Fi is on. Use ADC1 (32–39).' },
  noAdc: { tr: 'Bu pinde ADC yok.', en: 'This pin has no ADC.' },
  noDac: { tr: 'DAC yalnız GPIO 25 ve 26\'da.', en: 'The DAC is only on GPIO 25 and 26.' },
  noTouch: { tr: 'Bu pin dokunmatik (touch) kanalı değil.', en: 'This pin is not a touch channel.' },
  uart0: { tr: 'GPIO 1/3 USB seri (UART0): yükleme ve Serial ile çakışır.', en: 'GPIO 1/3 are the USB serial (UART0): they clash with uploading and Serial.' },
  notI2cDefault: { tr: 'Varsayılan I²C pini değil (SDA 21, SCL 22): Wire.begin(sda, scl) ile belirt.', en: 'Not the default I²C pin (SDA 21, SCL 22): pass them with Wire.begin(sda, scl).' },
  noPin: { tr: 'Bu GPIO DevKit\'te dışarı çıkmıyor.', en: 'This GPIO is not broken out on the DevKit.' },
}
const USE_TEXT: Record<PinUse, { tr: string; en: string }> = {
  out: { tr: 'dijital çıkış', en: 'digital out' }, in: { tr: 'dijital giriş', en: 'digital in' }, adc: { tr: 'analog (ADC)', en: 'analog (ADC)' },
  pwm: { tr: 'PWM (LEDC)', en: 'PWM (LEDC)' }, sda: { tr: 'I²C SDA', en: 'I²C SDA' }, scl: { tr: 'I²C SCL', en: 'I²C SCL' }, dac: { tr: 'DAC', en: 'DAC' }, touch: { tr: 'dokunma', en: 'touch' },
}
const PIN_ROWS: Array<{ tr: string; en: string; use: PinUse; pin: number }> = [
  { tr: 'DHT22 veri', en: 'DHT22 data', use: 'in', pin: 4 },
  { tr: 'LDR (ışık)', en: 'LDR (light)', use: 'adc', pin: 34 },
  { tr: 'Toprak nemi', en: 'Soil moisture', use: 'adc', pin: 13 },
  { tr: 'Pompa rölesi', en: 'Pump relay', use: 'out', pin: 26 },
  { tr: 'Pencere servosu', en: 'Window servo', use: 'pwm', pin: 12 },
  { tr: 'BME280 / OLED SDA', en: 'BME280 / OLED SDA', use: 'sda', pin: 21 },
  { tr: 'BME280 / OLED SCL', en: 'BME280 / OLED SCL', use: 'scl', pin: 22 },
]
const ALL_PINS = [...ESP32_PINS.slice(0, 6), 6, 7, 8, 9, 10, 11, ...ESP32_PINS.slice(6)]

function PinSim({ lang }: P) {
  const en = lang === 'en'
  const [rows, setRows] = useState(PIN_ROWS.map((r) => ({ use: r.use, pin: r.pin })))
  const [wifi, setWifi] = useState(true)
  const [raw, setRaw] = useState(2048)
  const checks = rows.map((r) => checkPin(r.pin, r.use, wifi))
  const dup = rows.map((r, i) => rows.findIndex((x) => x.pin === r.pin) !== i)
  const nErr = checks.filter((c, i) => c.level === 'err' || dup[i]).length
  const nWarn = checks.filter((c, i) => c.level === 'warn' && !dup[i]).length
  const set = (i: number, k: 'use' | 'pin', v: string) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: k === 'pin' ? Number(v) : v } : r)))
  return (
    <Body
      stage={
        <div className="ks-scroll">
          <table className="ks-table ks-pins">
            <thead><tr><th>{en ? 'Connection' : 'Bağlantı'}</th><th>{en ? 'Role' : 'Görev'}</th><th>GPIO</th><th>{en ? 'Check' : 'Denetim'}</th></tr></thead>
            <tbody>
              {PIN_ROWS.map((r, i) => {
                const c = checks[i]
                const lv = dup[i] ? 'err' : c.level
                return (
                  <tr key={r.tr}>
                    <td>{r[lang]}</td>
                    <td><select aria-label={`${r[lang]}: ${en ? 'role' : 'görev'}`} value={rows[i].use} onChange={(e) => set(i, 'use', e.target.value)}>{(Object.keys(USE_TEXT) as PinUse[]).map((u) => <option key={u} value={u}>{USE_TEXT[u][lang]}</option>)}</select></td>
                    <td><select aria-label={`${r[lang]}: GPIO`} value={rows[i].pin} onChange={(e) => set(i, 'pin', e.target.value)}>{ALL_PINS.map((p) => <option key={p} value={p}>{p}</option>)}</select></td>
                    <td className={lv} style={{ textAlign: 'left' }}>
                      <b>{lv === 'ok' ? (en ? 'OK' : 'Uygun') : lv === 'warn' ? (en ? 'Careful' : 'Dikkat') : (en ? 'Will not work' : 'Çalışmaz')}</b>
                      {dup[i] && <div>{en ? 'Pin already used above.' : 'Bu pin yukarıda zaten kullanılıyor.'}</div>}
                      {c.issues.map((k) => <div key={k}>{ISSUE_TEXT[k][lang]}</div>)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      }
      side={
        <>
          <Check label={en ? 'Wi-Fi on' : 'Wi-Fi açık'} value={wifi} onChange={setWifi} />
          <Readout testid="iot-pins-sum">{en ? `${nErr} error(s), ${nWarn} warning(s)` : `${nErr} hata, ${nWarn} uyarı`}{nErr === 0 && nWarn === 0 ? (en ? '\nClean pin plan.' : '\nTemiz pin planı.') : ''}</Readout>
          <Slider label={en ? 'ADC raw (12 bit)' : 'ADC ham (12 bit)'} min={0} max={4095} step={1} value={raw} onChange={setRaw} />
          <Readout>{`analogRead = ${raw}\n≈ ${nf(lang, 2)(adcToVolt(raw))} V (11 dB)\nUno: ${Math.round((adcToVolt(raw) / 5) * 1023)} / 1023 (5 V)`}</Readout>
        </>
      }
    />
  )
}

// --- 2. Wi-Fi ---------------------------------------------------------------------------------------------------------------

const WIFI_COLOR: Record<WifiState, string> = { connected: 'var(--green)', connecting: 'var(--gold)', waiting: 'var(--mute)', noap: 'var(--red)' }
const WIFI_TEXT: Record<WifiState, { tr: string; en: string }> = { connected: { tr: 'bağlı', en: 'connected' }, connecting: { tr: 'bağlanıyor', en: 'connecting' }, waiting: { tr: 'bekliyor', en: 'waiting' }, noap: { tr: 'AP yok', en: 'no AP' } }

function WifiSim({ lang }: P) {
  const en = lang === 'en'
  const [downAt, setDownAt] = useState(20)
  const [downLen, setDownLen] = useState(25)
  const [rssi, setRssi] = useState(-65)
  const [strategy, setStrategy] = useState<'fixed' | 'backoff'>('backoff')
  const [base, setBase] = useState(1)
  const [cap, setCap] = useState(16)
  const [tt, setTt] = useState(30)
  const p = { horizon: 120, apDown: [downAt, downAt + downLen] as [number, number], rssi, base, cap }
  const res = useMemo(() => simulateWifi({ ...p, strategy }), [downAt, downLen, rssi, strategy, base, cap]) // eslint-disable-line react-hooks/exhaustive-deps
  const other = useMemo(() => simulateWifi({ ...p, strategy: strategy === 'fixed' ? 'backoff' : 'fixed' }), [downAt, downLen, rssi, strategy, base, cap]) // eslint-disable-line react-hooks/exhaustive-deps
  const step = 5 // şerit için her 0,5 s'de bir örnek
  const strip = res.states.filter((_, i) => i % step === 0)
  const at = res.states[Math.min(res.states.length - 1, Math.round(tt / res.dt))]
  const sum = (r: typeof res, s: string) => en
    ? `${s}: ${r.attempts} attempts, ${r.drops} drops, offline ${nf(lang, 1)(r.downtime)} s, recovered ${Number.isFinite(r.recoverS) ? `${nf(lang, 1)(r.recoverS)} s` : 'never'} after the AP came back`
    : `${s}: ${r.attempts} deneme, ${r.drops} kopma, kopuk ${nf(lang, 1)(r.downtime)} s, AP dönünce ${Number.isFinite(r.recoverS) ? `${nf(lang, 1)(r.recoverS)} s'de toparlandı` : 'toparlanmadı'}`
  const name = (s: 'fixed' | 'backoff') => (s === 'fixed' ? (en ? 'Fixed delay' : 'Sabit bekleme') : (en ? 'Exponential backoff' : 'Üstel geri çekilme'))
  return (
    <Body
      stage={
        <>
          <div className="ks-strip" role="img" aria-label={en ? 'Wi-Fi state over 120 s' : '120 s boyunca Wi-Fi durumu'}>
            {strip.map((s, i) => <span key={i} style={{ background: WIFI_COLOR[s], opacity: i * 0.5 >= downAt && i * 0.5 < downAt + downLen ? 0.75 : 1 }} />)}
          </div>
          <ul className="ks-legend">{(Object.keys(WIFI_COLOR) as WifiState[]).map((s) => <li key={s}><i style={{ background: WIFI_COLOR[s] }} />{WIFI_TEXT[s][lang]} <code>{WL[s]}</code></li>)}</ul>
          <LineChart title={en ? 'Connected (1) or not (0), AP outage shaded' : 'Bağlı (1) ya da değil (0), AP kesintisi gölgeli'} yRange={[-0.1, 1.2]} xLabel="s"
            series={[{ x: strip.map((_, i) => i * 0.5), y: strip.map((s) => (s === 'connected' ? 1 : 0)), color: 'var(--sim-a)', label: en ? 'connected' : 'bağlı' }]}
            bands={[{ x0: downAt, x1: downAt + downLen, color: 'var(--red)' }]} h={180} />
          <Readout testid="iot-wifi-sum">{sum(res, name(strategy))}{'\n'}{sum(other, name(strategy === 'fixed' ? 'backoff' : 'fixed'))}</Readout>
        </>
      }
      side={
        <>
          <Select label={en ? 'Reconnect strategy' : 'Yeniden bağlanma'} value={strategy} options={[['backoff', name('backoff')], ['fixed', name('fixed')]]} onChange={setStrategy} />
          <Slider label={en ? 'AP goes down at' : 'AP kapanış anı'} min={0} max={90} step={5} value={downAt} onChange={setDownAt} fmt={(v) => `${v} s`} />
          <Slider label={en ? 'Outage length' : 'Kesinti süresi'} min={0} max={60} step={5} value={downLen} onChange={setDownLen} fmt={(v) => `${v} s`} />
          <Slider label="RSSI" min={-92} max={-40} step={1} value={rssi} onChange={setRssi} fmt={(v) => `${v} dBm`} />
          <Slider label={en ? 'First delay' : 'İlk bekleme'} min={0.5} max={8} step={0.5} value={base} onChange={setBase} fmt={(v) => `${v} s`} />
          <Slider label={en ? 'Backoff cap' : 'Geri çekilme üst sınırı'} min={2} max={60} step={1} value={cap} onChange={setCap} fmt={(v) => `${v} s`} />
          <Slider label={en ? 'Inspect time' : 'İncelenen an'} min={0} max={119} step={1} value={tt} onChange={setTt} fmt={(v) => `${v} s`} />
          <Readout>{`t = ${tt} s\nWiFi.status() → ${WL[at]}\n(${WIFI_TEXT[at][lang]})`}</Readout>
        </>
      }
    />
  )
}

// --- 3. REST oyun alanı -----------------------------------------------------------------------------------------------------

const PRESETS: Array<{ tr: string; en: string; method: Method; path: string; body: string }> = [
  { tr: 'Sensörü oku', en: 'Read sensor', method: 'GET', path: '/api/sensor', body: '' },
  { tr: 'LED\'i yak', en: 'Turn LED on', method: 'PUT', path: '/api/led', body: '{"on": true}' },
  { tr: 'Zamanlama ekle', en: 'Add schedule', method: 'POST', path: '/api/schedules', body: '{"at": "07:30", "on": true}' },
  { tr: 'Bozuk JSON', en: 'Broken JSON', method: 'PUT', path: '/api/led', body: '{"on": tru}' },
  { tr: 'Yanlış tip', en: 'Wrong type', method: 'PUT', path: '/api/led', body: '{"on": "evet"}' },
  { tr: 'Yanlış yöntem', en: 'Wrong method', method: 'POST', path: '/api/sensor', body: '{}' },
  { tr: 'Zamanlamayı sil', en: 'Delete schedule', method: 'DELETE', path: '/api/schedules/1', body: '' },
]

function RestSim({ lang }: P) {
  const en = lang === 'en'
  const [dev, setDev] = useState<DevState>(() => initialDev(false))
  const [method, setMethod] = useState<Method>('GET')
  const [path, setPath] = useState('/api/sensor')
  const [body, setBody] = useState('')
  const [sendToken, setSendToken] = useState(false)
  const [last, setLast] = useState<{ req: string; res: string; status: number } | null>(null)
  const [log, setLog] = useState<Array<{ t: string; text: string; cls?: string }>>([])
  const send = () => {
    const req = { method, path, body, token: sendToken ? dev.token : undefined }
    const { state, res } = handle(dev, req)
    setDev(state)
    setLast({ req: rawRequest(req), res: rawResponse(res), status: res.status })
    setLog((l) => [{ t: String(res.status), text: `${method} ${path}`, cls: res.status < 300 ? 'ok' : 'bad' }, ...l].slice(0, 12))
  }
  return (
    <Body
      stage={
        <>
          <div className="ks-row">{PRESETS.map((p) => <Btn key={p.tr} ghost onClick={() => { setMethod(p.method); setPath(p.path); setBody(p.body) }}>{p[lang]}</Btn>)}</div>
          <div className="rb-two" style={{ gap: 10 }}>
            <Readout log>{last ? last.req : (en ? 'Raw HTTP request appears here.' : 'Ham HTTP isteği burada görünür.')}</Readout>
            <Readout log testid="iot-rest-res">{last ? last.res : (en ? 'Raw HTTP response appears here.' : 'Ham HTTP yanıtı burada görünür.')}</Readout>
          </div>
          <Readout>{en ? 'Device state' : 'Cihaz durumu'}: LED {dev.led ? (en ? 'on' : 'açık') : (en ? 'off' : 'kapalı')} · {en ? 'schedules' : 'zamanlamalar'}: {dev.schedules.length ? dev.schedules.map((s) => `#${s.id} ${s.at} ${s.on ? 'ON' : 'OFF'}`).join(', ') : '–'}</Readout>
        </>
      }
      side={
        <>
          <Select label={en ? 'Method' : 'Yöntem'} value={method} options={(['GET', 'POST', 'PUT', 'DELETE'] as Method[]).map((m) => [m, m])} onChange={setMethod} />
          <TextIn label={en ? 'Path' : 'Yol'} value={path} onChange={setPath} />
          <label className="sl"><span className="sl-h">{en ? 'JSON body' : 'JSON gövde'}</span><textarea className="ks-in" rows={3} value={body} onChange={(e) => setBody(e.target.value)} spellCheck={false} aria-label={en ? 'JSON body' : 'JSON gövde'} style={{ minHeight: 70 }} /></label>
          <Check label={en ? 'Device requires a token for writes' : 'Cihaz yazmada belirteç istesin'} value={dev.requireToken} onChange={(v) => setDev((d) => ({ ...d, requireToken: v }))} />
          <Check label={en ? 'Send Authorization: Bearer' : 'Authorization: Bearer gönder'} value={sendToken} onChange={setSendToken} />
          <Btn onClick={send} testid="iot-rest-send">{en ? 'Send' : 'Gönder'}</Btn>
          <Flow rows={log} empty={en ? 'No requests yet' : 'Henüz istek yok'} />
        </>
      }
    />
  )
}

// --- 4. MQTT broker ---------------------------------------------------------------------------------------------------------

const DEVICES = ['sera-01', 'sera-02', 'sera-03'] as const
/** İstemci kimliği sera-01 → konu kökü sera/01 */
const root = (id: string) => `sera/${id.slice(-2)}`
const willOf = (id: string) => ({ topic: `${root(id)}/durum`, payload: 'offline', qos: 1 as QoS, retain: true })

function newBroker() {
  const b = new Broker()
  for (const id of DEVICES) { b.connect(id, { will: willOf(id) }); b.publish({ topic: `${root(id)}/durum`, payload: 'online', qos: 1, retain: true }) }
  b.connect('pano')
  b.subscribe(DEVICES[0], `${root(DEVICES[0])}/led/set`, 1)
  b.subscribe(DEVICES[1], `${root(DEVICES[1])}/fan/set`, 1)
  return b
}

function BrokerSim({ lang }: P) {
  const en = lang === 'en'
  const broker = useRef<Broker | null>(null)
  if (!broker.current) broker.current = newBroker()
  const b = broker.current
  const [, bump] = useReducer((x: number) => x + 1, 0)
  const [log, setLog] = useState<Array<{ t: string; text: React.ReactNode; cls?: string }>>([])
  const [filter, setFilter] = useState('sera/+/sicaklik')
  const [subQos, setSubQos] = useState<QoS>(1)
  const [from, setFrom] = useState<string>('sera-01')
  const [topic, setTopic] = useState('sera/01/led/set')
  const [msg, setMsg] = useState('1')
  const [qos, setQos] = useState<QoS>(0)
  const [retain, setRetain] = useState(false)
  const [tick, setTick] = useState(0)
  const [testF, setTestF] = useState('sera/#')
  const [testT, setTestT] = useState('sera/02/nem')
  const show = (ds: Delivery[], note?: string) => {
    const rows = ds.map((d) => ({ t: `→ ${d.to}`, text: <><code>{d.topic}</code> {d.payload} <span className="dim">QoS {d.qos}{d.retained ? ' · retained' : ''}</span></>, cls: d.retained ? 'dim' : undefined }))
    setLog((l) => [...rows, ...(note ? [{ t: '•', text: note, cls: 'dim' }] : []), ...l].slice(0, 40))
    bump()
  }
  const pano = b.clients.get('pano')
  const subscribe = () => { if (!validFilter(filter)) { show([], en ? `Invalid filter: ${filter}` : `Geçersiz süzgeç: ${filter}`); return } show(b.subscribe('pano', filter, subQos), en ? `pano subscribed to ${filter} (QoS ${subQos})` : `pano ${filter} aboneliği aldı (QoS ${subQos})`) }
  const publish = () => {
    if (!b.clients.get(from)?.connected) { show([], en ? `${from} is offline` : `${from} bağlı değil`); return }
    if (!validTopic(topic)) { show([], en ? `Invalid topic (no wildcards when publishing): ${topic}` : `Geçersiz konu (yayında joker olmaz): ${topic}`); return }
    show(b.publish({ topic, payload: msg, qos, retain }), `${from} → ${topic}${retain ? ' (retain)' : ''}`)
  }
  const telemetry = () => {
    const k = tick + 1
    setTick(k)
    const ds: Delivery[] = []
    DEVICES.forEach((id, i) => {
      if (!b.clients.get(id)?.connected) return
      const r = readSensor(k * 600, i + 1, i * 2)
      if (id === 'sera-03') { ds.push(...b.publish({ topic: `${root(id)}/kat/sicaklik`, payload: String(r.temp), qos: 0, retain: false })); ds.push(...b.publish({ topic: `${root(id)}/kapi`, payload: k % 3 === 0 ? 'acik' : 'kapali', qos: 1, retain: true })) }
      else { ds.push(...b.publish({ topic: `${root(id)}/sicaklik`, payload: String(r.temp), qos: 0, retain: false })); ds.push(...b.publish({ topic: `${root(id)}/nem`, payload: String(r.hum), qos: 0, retain: false })) }
    })
    show(ds, en ? 'Devices published telemetry' : 'Cihazlar telemetri yayımladı')
  }
  const unplug = (id: string) => show(b.drop(id, false), en ? `${id}: cable pulled (no DISCONNECT), broker publishes the will` : `${id}: kablo çekildi (DISCONNECT yok), broker vasiyeti yayımlar`)
  const reconnect = (id: string) => { b.connect(id, { will: willOf(id) }); show(b.publish({ topic: `${root(id)}/durum`, payload: 'online', qos: 1, retain: true }), en ? `${id} reconnected, birth message "online"` : `${id} yeniden bağlandı, doğum mesajı "online"`) }
  const reset = () => { broker.current = newBroker(); setLog([]); setTick(0); bump() }
  return (
    <Body
      stage={
        <>
          <div className="ks-devs">
            {[...DEVICES, 'pano'].map((id) => {
              const c = b.clients.get(id)
              const on = !!c?.connected
              return (
                <div key={id} className={`ks-dev${on ? '' : ' off'}`}>
                  <b><span>{id}</span><span className={`ks-dot${on ? '' : ' off'}`} aria-label={on ? (en ? 'online' : 'bağlı') : (en ? 'offline' : 'bağlı değil')} /></b>
                  <div>{c && c.subs.size ? [...c.subs].map(([f, q]) => <div key={f}><code>{f}</code> <span className="ks-tag">Q{q}</span></div>) : <span className="muted">{en ? 'no subscriptions' : 'abonelik yok'}</span>}</div>
                  {id !== 'pano' && <div className="ks-row" style={{ marginTop: 6 }}>{on ? <Btn ghost onClick={() => unplug(id)}>{en ? 'Pull cable' : 'Kabloyu çek'}</Btn> : <Btn ghost onClick={() => reconnect(id)}>{en ? 'Reconnect' : 'Yeniden bağla'}</Btn>}</div>}
                </div>
              )
            })}
          </div>
          <Flow rows={log} empty={en ? 'Publish something or let the devices send telemetry.' : 'Bir şey yayımla ya da cihazlara telemetri gönderttir.'} />
          <Readout>{en ? 'Retained on the broker' : 'Broker\'da kalıcı'}: {[...b.retained.values()].map((m) => `${m.topic} = ${m.payload}`).join(' · ') || '–'}</Readout>
          <Readout testid="iot-broker-match">{`${en ? 'Filter test' : 'Süzgeç sınaması'}: "${testF}" ${validFilter(testF) ? '' : (en ? '(invalid filter) ' : '(geçersiz süzgeç) ')}× "${testT}" → ${topicMatches(testF, testT) ? (en ? 'MATCH' : 'EŞLEŞİR') : (en ? 'no match' : 'eşleşmez')}`}</Readout>
        </>
      }
      side={
        <>
          <Btn onClick={telemetry} testid="iot-broker-telemetry">{en ? 'Devices send telemetry' : 'Cihazlar telemetri göndersin'}</Btn>
          <TextIn label={en ? 'Dashboard subscribes to' : 'Pano abone olsun'} value={filter} onChange={setFilter} />
          <Select label="QoS" value={String(subQos) as '0' | '1' | '2'} options={[['0', 'QoS 0'], ['1', 'QoS 1'], ['2', 'QoS 2']]} onChange={(v) => setSubQos(Number(v) as QoS)} />
          <div className="ks-row"><Btn onClick={subscribe}>{en ? 'Subscribe' : 'Abone ol'}</Btn>{pano && pano.subs.size > 0 && <Btn ghost onClick={() => { for (const f of [...pano.subs.keys()]) b.unsubscribe('pano', f); show([], en ? 'pano unsubscribed from all' : 'pano tüm aboneliklerden çıktı') }}>{en ? 'Unsubscribe all' : 'Hepsinden çık'}</Btn>}</div>
          <Select label={en ? 'Publish as' : 'Yayımlayan'} value={from} options={[...DEVICES, 'pano'].map((d) => [d, d])} onChange={setFrom} />
          <TextIn label={en ? 'Topic' : 'Konu'} value={topic} onChange={setTopic} />
          <TextIn label={en ? 'Payload' : 'Yük'} value={msg} onChange={setMsg} />
          <Select label="QoS" value={String(qos) as '0' | '1' | '2'} options={[['0', 'QoS 0'], ['1', 'QoS 1'], ['2', 'QoS 2']]} onChange={(v) => setQos(Number(v) as QoS)} />
          <Check label={en ? 'Retain' : 'Kalıcı (retain)'} value={retain} onChange={setRetain} />
          <Btn onClick={publish}>{en ? 'Publish' : 'Yayımla'}</Btn>
          <TextIn label={en ? 'Test filter' : 'Süzgeç'} value={testF} onChange={setTestF} />
          <TextIn label={en ? 'against topic' : 'konu'} value={testT} onChange={setTestT} />
          <Btn ghost onClick={reset}>{en ? 'Reset broker' : 'Broker\'ı sıfırla'}</Btn>
        </>
      }
    />
  )
}

// --- 5. QoS -----------------------------------------------------------------------------------------------------------------

function QosSim({ lang }: P) {
  const en = lang === 'en'
  const [loss, setLoss] = useState(0.2)
  const [n, setN] = useState(20)
  const [seed, setSeed] = useState(7)
  const [show, setShow] = useState<QoS>(1)
  const res = useMemo(() => ([0, 1, 2] as QoS[]).map((q) => simulateQos(q, n, loss, seed)), [loss, n, seed])
  const tr = res[show].trace.filter((r) => r.msg < 6)
  return (
    <Body
      stage={
        <>
          <div className="ks-scroll">
            <table className="ks-table" data-testid="iot-qos-table">
              <thead><tr><th>QoS</th><th>{en ? 'Delivered' : 'Teslim'}</th><th>{en ? 'Lost' : 'Kayıp'}</th><th>{en ? 'Duplicates' : 'Yinelenen'}</th><th>{en ? 'Packets' : 'Paket'}</th></tr></thead>
              <tbody>{res.map((r, q) => <tr key={q}><td>{q} {['at most once', 'at least once', 'exactly once'][q]}</td><td>{r.delivered}/{r.sent}</td><td>{r.lost}</td><td>{r.duplicates}</td><td>{r.packets}</td></tr>)}</tbody>
            </table>
          </div>
          <Bars title={en ? 'Packets on the wire per QoS' : 'QoS başına hattaki paket'} values={res.map((r) => r.packets)} labels={['QoS 0', 'QoS 1', 'QoS 2']} colors={[color(0), color(1), color(2)]} h={160} />
          <Flow rows={tr.map((r) => ({ t: `#${r.msg + 1}`, text: <>{r.dir === 'up' ? (en ? 'sender → broker' : 'gönderen → broker') : (en ? 'broker → sender' : 'broker → gönderen')} <b>{r.pkt}</b>{r.dup ? ' DUP' : ''}{r.lost ? (en ? ' lost' : ' kayboldu') : ''}</>, cls: r.lost ? 'bad' : undefined }))} empty="–" />
        </>
      }
      side={
        <>
          <Slider label={en ? 'Packet loss' : 'Paket kaybı'} min={0} max={0.6} step={0.05} value={loss} onChange={setLoss} fmt={(v) => `%${Math.round(v * 100)}`.replace(/^%(\d+)$/, en ? '$1%' : '%$1')} />
          <Slider label={en ? 'Messages' : 'Mesaj'} min={5} max={40} step={1} value={n} onChange={setN} />
          <Slider label={en ? 'Seed' : 'Tohum'} min={1} max={20} step={1} value={seed} onChange={setSeed} />
          <Select label={en ? 'Handshake trace (first 6 messages)' : 'El sıkışma izi (ilk 6 mesaj)'} value={String(show) as '0' | '1' | '2'} options={[['0', 'QoS 0'], ['1', 'QoS 1'], ['2', 'QoS 2']]} onChange={(v) => setShow(Number(v) as QoS)} />
          <Readout>{en ? 'QoS 1 retries until PUBACK arrives: a lost PUBACK means the receiver gets the same message twice. QoS 2 stores the packet id and hands it to the app once.' : 'QoS 1 PUBACK gelene kadar yeniden yollar: PUBACK kaybolursa alıcı aynı mesajı iki kez alır. QoS 2 paket kimliğini saklar, uygulamaya bir kez verir.'}</Readout>
        </>
      }
    />
  )
}

// --- 6. Telemetri -----------------------------------------------------------------------------------------------------------

function TelemetrySim({ lang }: P) {
  const en = lang === 'en'
  const [fmt, setFmt] = useState<PayloadFmt>('json')
  const [interval, setInterval_] = useState(60)
  const [qos, setQos] = useState<QoS>(0)
  const [tls, setTls] = useState(true)
  const [dead, setDead] = useState(0.3)
  const [hb, setHb] = useState(15)
  const topic = 'sera/01/olcum'
  const r = readSensor(12 * 3600)
  const pl = payload(r, fmt)
  const size = publishSize(topic, pl.bytes, qos)
  const day = dailyTraffic(interval, size, tls)
  const temps = useMemo(() => Array.from({ length: Math.floor(86400 / interval) }, (_, i) => readSensor(i * interval).temp), [interval])
  const sent = useMemo(() => reportOnChange(temps, dead, hb), [temps, dead, hb])
  const kb = (b: number) => nf(lang, 1)(b / 1024)
  return (
    <Body
      stage={
        <>
          <Readout log>{`PUBLISH ${topic}  QoS ${qos}\n${pl.text}\n\n${en ? 'payload' : 'yük'} ${pl.bytes} B · ${en ? 'MQTT packet' : 'MQTT paketi'} ${size} B`}</Readout>
          <LineChart title={en ? 'One day of temperature; dots are the samples actually published' : 'Bir günlük sıcaklık; noktalar gerçekten yayımlanan örnekler'} xLabel={en ? 'hour' : 'saat'} yLabel="°C" h={220}
            series={[
              { x: temps.map((_, i) => (i * interval) / 3600), y: temps, color: 'var(--mute)', width: 1.2, label: en ? 'measured' : 'ölçülen' },
              { x: sent.map((i) => (i * interval) / 3600), y: sent.map((i) => temps[i]), color: 'var(--sim-a)', dots: true, width: 1.6, label: en ? 'published' : 'yayımlanan' },
            ]} />
          <Readout testid="iot-tele-sum">{en
            ? `Every sample: ${day.msgs} messages/day, ${kb(day.bytes)} KB/day, ${nf(lang, 1)((day.bytes * 30) / 1048576)} MB/month\nReport on change: ${sent.length} messages/day (${Math.round((100 * sent.length) / temps.length)}%), ${kb((day.bytes * sent.length) / temps.length)} KB/day`
            : `Her örnek: günde ${day.msgs} mesaj, ${kb(day.bytes)} KB/gün, ayda ${nf(lang, 1)((day.bytes * 30) / 1048576)} MB\nDeğişince bildir: günde ${sent.length} mesaj (%${Math.round((100 * sent.length) / temps.length)}), ${kb((day.bytes * sent.length) / temps.length)} KB/gün`}</Readout>
        </>
      }
      side={
        <>
          <Select label={en ? 'Payload format' : 'Yük biçimi'} value={fmt} options={[['json', 'JSON'], ['csv', 'CSV'], ['bin', en ? 'binary (8 B)' : 'ikili (8 B)']]} onChange={setFmt} />
          <Slider label={en ? 'Publish interval' : 'Yayın aralığı'} min={10} max={900} step={10} value={interval} onChange={setInterval_} fmt={(v) => `${v} s`} />
          <Select label="QoS" value={String(qos) as '0' | '1' | '2'} options={[['0', 'QoS 0'], ['1', 'QoS 1'], ['2', 'QoS 2']]} onChange={(v) => setQos(Number(v) as QoS)} />
          <Check label="TLS (8883)" value={tls} onChange={setTls} />
          <Slider label={en ? 'Dead band' : 'Ölü bant'} min={0} max={1.5} step={0.1} value={dead} onChange={setDead} fmt={(v) => `${nf(lang, 1)(v)} °C`} />
          <Slider label={en ? 'Heartbeat every' : 'Kalp atışı'} min={1} max={60} step={1} value={hb} onChange={setHb} fmt={(v) => (en ? `${v} samples` : `${v} örnek`)} />
        </>
      }
    />
  )
}

// --- 7. Eyleyici ------------------------------------------------------------------------------------------------------------

function ActuatorSim({ lang }: P) {
  const en = lang === 'en'
  const [loss, setLoss] = useState(0.25)
  const [n, setN] = useState(20)
  const [qos, setQos] = useState<QoS>(1)
  const [desired, setDesired] = useState({ role: 1, servo: 90 })
  const [reported, setReported] = useState({ role: 0, servo: 0 })
  const kinds = ['toggle', 'set', 'setId'] as const
  const rs = useMemo(() => kinds.map((k) => commandRun(k, n, loss, 11, qos)), [n, loss, qos]) // eslint-disable-line react-hooks/exhaustive-deps
  const delta = shadowDelta({ desired, reported })
  const label = { toggle: en ? 'toggle ("flip it")' : 'toggle ("çevir")', set: en ? 'set {"on": true/false}' : 'set {"on": true/false}', setId: en ? 'set + command id' : 'set + komut kimliği' }
  const onOff = (v: boolean) => (v ? (en ? 'ON' : 'AÇIK') : (en ? 'OFF' : 'KAPALI'))
  return (
    <Body
      stage={
        <>
          <div className="ks-scroll">
            <table className="ks-table" data-testid="iot-act-table">
              <thead><tr><th>{en ? 'Command' : 'Komut'}</th><th>{en ? 'Final relay' : 'Son röle'}</th><th>{en ? 'Expected' : 'Beklenen'}</th><th>{en ? 'Applied' : 'Uygulanan'}</th><th>{en ? 'Result' : 'Sonuç'}</th></tr></thead>
              <tbody>{rs.map((r, i) => <tr key={kinds[i]}><td>{label[kinds[i]]}</td><td>{onOff(r.final)}</td><td>{onOff(r.expected)}</td><td>{r.applied}</td><td className={r.final === r.expected ? 'ok' : 'bad'} style={{ color: r.final === r.expected ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{r.final === r.expected ? (en ? 'correct' : 'doğru') : (en ? 'WRONG' : 'YANLIŞ')}</td></tr>)}</tbody>
            </table>
          </div>
          <Readout>{en ? `Link: ${rs[0].duplicates} duplicate and ${rs[0].lost} lost deliveries out of ${n} commands.` : `Bağlantı: ${n} komutta ${rs[0].duplicates} yinelenen, ${rs[0].lost} kayıp teslim.`}</Readout>
          <h4 style={{ margin: '6px 0 0' }}>{en ? 'Device shadow' : 'Cihaz gölgesi'}</h4>
          <Readout log testid="iot-shadow">{JSON.stringify({ desired, reported, delta }, null, 2)}</Readout>
        </>
      }
      side={
        <>
          <Slider label={en ? 'Packet loss' : 'Paket kaybı'} min={0} max={0.5} step={0.05} value={loss} onChange={setLoss} fmt={(v) => `${Math.round(v * 100)}%`} />
          <Slider label={en ? 'Commands' : 'Komut'} min={4} max={40} step={1} value={n} onChange={setN} />
          <Select label="QoS" value={String(qos) as '0' | '1' | '2'} options={[['0', 'QoS 0'], ['1', 'QoS 1'], ['2', 'QoS 2']]} onChange={(v) => setQos(Number(v) as QoS)} />
          <Check label={en ? 'Desired: relay on' : 'İstenen: röle açık'} value={desired.role === 1} onChange={(v) => setDesired((d) => ({ ...d, role: v ? 1 : 0 }))} />
          <Slider label={en ? 'Desired: servo angle' : 'İstenen: servo açısı'} min={0} max={180} step={10} value={desired.servo} onChange={(v) => setDesired((d) => ({ ...d, servo: v }))} fmt={(v) => `${v}°`} />
          <Btn onClick={() => setReported({ ...desired })}>{en ? 'Device applies and reports' : 'Cihaz uygulasın ve bildirsin'}</Btn>
          <Btn ghost onClick={() => setReported((r) => ({ ...r, role: desired.role }))}>{en ? 'Device reports relay only' : 'Cihaz yalnız röleyi bildirsin'}</Btn>
        </>
      }
    />
  )
}

// --- 8. Canlı pano ----------------------------------------------------------------------------------------------------------

function DashboardSim({ lang }: P) {
  const en = lang === 'en'
  const [cap, setCap] = useState(360)
  const [buckets, setBuckets] = useState(40)
  const [on, setOn] = useState(25)
  const [hyst, setHyst] = useState(1)
  const [run, setRun] = useState(true)
  const [t, setT] = useState(0)
  const rings = useRef<Ring[] | null>(null)
  const capRef = useRef(cap)
  if (!rings.current || capRef.current !== cap) {
    // Kapasite değişince tampon yeniden kurulur ve geçmiş t'ye kadar doldurulur (deterministik)
    capRef.current = cap
    rings.current = [0, 1, 2].map(() => new Ring(cap))
    for (let k = Math.max(0, t - cap + 1); k <= t; k++) rings.current.forEach((r, i) => r.push(readSensor(k * 120, i + 1, i * 1.5).temp))
  }
  useEffect(() => {
    if (!run) return
    const h = window.setInterval(() => setT((x) => {
      const k = x + 1
      rings.current?.forEach((r, i) => r.push(readSensor(k * 120, i + 1, i * 1.5).temp))
      return k
    }), 250)
    return () => window.clearInterval(h)
  }, [run])
  const data = rings.current.map((r) => r.toArray())
  const shown = data.map((d) => minMaxDownsample(d, buckets))
  const alarm = alarmStates(data[0], on, on - hyst)
  const alarmsOn = alarm.reduce((a, v, i) => a + (v && !alarm[i - 1] ? 1 : 0), 0)
  const latest = data.map((d) => d[d.length - 1] ?? NaN)
  const names = ['sera-01', 'sera-02', 'sera-03']
  return (
    <Body
      stage={
        <>
          <div className="ks-gauges">{latest.map((v, i) => <Gauge key={i} value={v} min={10} max={35} warn={on} label={names[i]} unit="°C" lang={lang} />)}</div>
          <LineChart title={en ? 'Downsampled live temperature, alert threshold dashed' : 'Seyreltilmiş canlı sıcaklık, uyarı eşiği kesikli'} yLabel="°C" h={220}
            series={shown.map((s, i) => ({ y: s, color: color(i), label: names[i] }))} hlines={[{ y: on, color: 'var(--red)', label: en ? 'on' : 'aç' }, { y: on - hyst, color: 'var(--gold)', label: en ? 'off' : 'kapa' }]} />
          <Readout testid="iot-dash-sum">{en
            ? `Buffer ${data[0].length}/${cap} samples (2 min each) → drawn ${shown[0].length} points per series\nsera-01 alert: ${alarm[alarm.length - 1] ? 'ACTIVE' : 'off'}, raised ${alarmsOn} times in the buffer`
            : `Tampon ${data[0].length}/${cap} örnek (her biri 2 dk) → seri başına ${shown[0].length} nokta çiziliyor\nsera-01 uyarısı: ${alarm[alarm.length - 1] ? 'AKTİF' : 'kapalı'}, tamponda ${alarmsOn} kez açıldı`}</Readout>
        </>
      }
      side={
        <>
          <Btn onClick={() => setRun((r) => !r)} testid="iot-dash-run">{run ? (en ? 'Pause' : 'Durdur') : (en ? 'Resume' : 'Sürdür')}</Btn>
          <Slider label={en ? 'Ring buffer size' : 'Halka tampon boyutu'} min={60} max={720} step={60} value={cap} onChange={setCap} />
          <Slider label={en ? 'Buckets drawn' : 'Çizilen kova'} min={5} max={200} step={5} value={buckets} onChange={setBuckets} />
          <Slider label={en ? 'Alert on at' : 'Uyarı açılışı'} min={18} max={30} step={0.5} value={on} onChange={setOn} fmt={(v) => `${nf(lang, 1)(v)} °C`} />
          <Slider label={en ? 'Hysteresis' : 'Histerezis'} min={0} max={3} step={0.25} value={hyst} onChange={setHyst} fmt={(v) => `${nf(lang, 2)(v)} °C`} />
          <Readout>{en ? 'Memory: 3 × ' : 'Bellek: 3 × '}{cap} × 4 B = {nf(lang, 1)((3 * cap * 4) / 1024)} KB</Readout>
        </>
      }
    />
  )
}

// --- 9. Güç -----------------------------------------------------------------------------------------------------------------

const MODE_TEXT: Record<PowerMode, { tr: string; en: string }> = {
  always: { tr: 'Sürekli açık (Wi-Fi bağlı)', en: 'Always on (Wi-Fi connected)' }, modem: { tr: 'Modem uykusu', en: 'Modem sleep' },
  light: { tr: 'Hafif uyku', en: 'Light sleep' }, deep: { tr: 'Derin uyku (yalın modül)', en: 'Deep sleep (bare module)' }, deepDevkit: { tr: 'Derin uyku (DevKit kartı)', en: 'Deep sleep (DevKit board)' },
}
const BATTS: Array<[string, number, { tr: string; en: string }]> = [['2600', 2600, { tr: '18650 Li-ion 2600 mAh', en: '18650 Li-ion 2600 mAh' }], ['1000', 1000, { tr: 'LiPo 1000 mAh', en: 'LiPo 1000 mAh' }], ['6000', 6000, { tr: '3 × AA (≈ 2000 mAh × 3)', en: '3 × AA (≈ 2000 mAh × 3)' }]]

function PowerSim({ lang }: P) {
  const en = lang === 'en'
  const [mode, setMode] = useState<PowerMode>('deep')
  const [intervalS, setIntervalS] = useState(300)
  const [batt, setBatt] = useState('2600')
  const [awake, setAwake] = useState<number>(POWER_MODES.deep.awakeS)
  const cap = BATTS.find((b) => b[0] === batt)![1]
  const m = POWER_MODES[mode]
  const aw = mode === 'always' || mode === 'modem' ? intervalS : awake
  const p = { capacityMah: cap, awakeS: aw, awakeMa: m.awakeMa, sleepUa: m.sleepUa, intervalS }
  const ma = avgCurrentMa(p)
  const days = batteryDays(p)
  const all = (Object.keys(POWER_MODES) as PowerMode[]).map((k) => { const q = POWER_MODES[k]; return batteryDays({ capacityMah: cap, awakeS: k === 'always' || k === 'modem' ? intervalS : awake, awakeMa: q.awakeMa, sleepUa: q.sleepUa, intervalS }) })
  const fmtDays = (d: number) => (d >= 365 ? (en ? `${nf(lang, 1)(d / 365)} years` : `${nf(lang, 1)(d / 365)} yıl`) : d >= 2 ? (en ? `${nf(lang, 0)(d)} days` : `${nf(lang, 0)(d)} gün`) : (en ? `${nf(lang, 0)(d * 24)} hours` : `${nf(lang, 0)(d * 24)} saat`))
  return (
    <Body
      stage={
        <>
          <Bars title={en ? 'Battery life per mode (days, same interval and battery)' : 'Kip başına pil ömrü (gün, aynı aralık ve pil)'} values={all} labels={(Object.keys(POWER_MODES) as PowerMode[]).map((k) => ({ always: en ? 'on' : 'açık', modem: 'modem', light: en ? 'light' : 'hafif', deep: en ? 'deep' : 'derin', deepDevkit: 'DevKit' })[k])} colors={(Object.keys(POWER_MODES) as PowerMode[]).map((k) => (k === mode ? 'var(--sim-a)' : 'var(--mute)'))} h={190} />
          <Readout testid="iot-power-sum">{en
            ? `${MODE_TEXT[mode].en}\nAverage current ${nf(lang, 3)(ma)} mA → battery life ≈ ${fmtDays(days)} (80% usable capacity)`
            : `${MODE_TEXT[mode].tr}\nOrtalama akım ${nf(lang, 3)(ma)} mA → pil ömrü ≈ ${fmtDays(days)} (%80 kullanılabilir kapasite)`}</Readout>
          <div className="eq" style={{ fontFamily: 'var(--mono)', fontSize: '.82rem' }}>I = (I<sub>awake</sub> · t<sub>awake</sub> + I<sub>sleep</sub> · t<sub>sleep</sub>) / T</div>
        </>
      }
      side={
        <>
          <Select label={en ? 'Mode' : 'Kip'} value={mode} options={(Object.keys(POWER_MODES) as PowerMode[]).map((k) => [k, MODE_TEXT[k][lang]])} onChange={setMode} />
          <Slider label={en ? 'Wake interval' : 'Uyanma aralığı'} min={10} max={3600} step={10} value={intervalS} onChange={setIntervalS} fmt={(v) => (v >= 60 ? `${nf(lang, 1)(v / 60)} ${en ? 'min' : 'dk'}` : `${v} s`)} />
          <Slider label={en ? 'Awake time (read + Wi-Fi + publish)' : 'Uyanık süre (oku + Wi-Fi + yayımla)'} min={0.3} max={8} step={0.1} value={awake} onChange={setAwake} fmt={(v) => `${nf(lang, 1)(v)} s`} />
          <Select label={en ? 'Battery' : 'Pil'} value={batt} options={BATTS.map((b) => [b[0], b[2][lang]])} onChange={setBatt} />
          <Readout>{en ? `Awake ${m.awakeMa} mA, sleep ${m.sleepUa} µA` : `Uyanık ${m.awakeMa} mA, uyku ${m.sleepUa} µA`}</Readout>
        </>
      }
    />
  )
}

// --- 10. OTA ----------------------------------------------------------------------------------------------------------------

const OTA_EVENTS: OtaEvent[] = ['start', 'downloadOk', 'downloadFail', 'verifyOk', 'verifyFail', 'reboot', 'selfTestOk', 'selfTestFail']
const EVENT_TEXT: Record<OtaEvent, { tr: string; en: string }> = {
  start: { tr: 'Güncellemeyi başlat', en: 'Start update' }, downloadOk: { tr: 'İndirme tamam', en: 'Download OK' }, downloadFail: { tr: 'İndirme koptu', en: 'Download failed' },
  verifyOk: { tr: 'İmza doğru', en: 'Signature OK' }, verifyFail: { tr: 'İmza yanlış', en: 'Signature bad' }, reboot: { tr: 'Yeniden başlat', en: 'Reboot' },
  selfTestOk: { tr: 'Öz sınama geçti', en: 'Self-test passed' }, selfTestFail: { tr: 'Öz sınama kaldı', en: 'Self-test failed' },
}
const PHASE_TEXT: Record<Ota['phase'], { tr: string; en: string }> = {
  idle: { tr: 'boşta', en: 'idle' }, downloading: { tr: 'indiriliyor', en: 'downloading' }, verifying: { tr: 'doğrulanıyor', en: 'verifying' }, ready: { tr: 'yeniden başlatmaya hazır', en: 'ready to reboot' },
  pending: { tr: 'yeni sürüm beklemede (doğrulanmadı)', en: 'new version pending (not yet valid)' }, done: { tr: 'güncellendi', en: 'updated' }, rolledBack: { tr: 'geri dönüldü', en: 'rolled back' }, failed: { tr: 'başarısız, eski sürüm çalışıyor', en: 'failed, old version still running' },
}

function OtaSim({ lang }: P) {
  const en = lang === 'en'
  const [s, setS] = useState<Ota>(otaInit)
  const [log, setLog] = useState<Array<{ t: string; text: string; cls?: string }>>([])
  const fire = (e: OtaEvent) => {
    const n = otaStep(s, e)
    const same = JSON.stringify(n) === JSON.stringify(s)
    setLog((l) => [{ t: String(l.length + 1), text: `${EVENT_TEXT[e][lang]} → ${same ? (en ? 'ignored (invalid now)' : 'yok sayıldı (şu an geçersiz)') : PHASE_TEXT[n.phase][lang]}`, cls: same ? 'dim' : n.phase === 'rolledBack' || n.phase === 'failed' ? 'bad' : n.phase === 'done' ? 'ok' : undefined }, ...l].slice(0, 14))
    setS(n)
  }
  return (
    <Body
      stage={
        <>
          <div className="ks-slots">
            {(['A', 'B'] as const).map((k) => (
              <div key={k} className={`ks-slot${s.running === k ? ' run' : ''}`}>
                <b>ota_{k === 'A' ? 0 : 1} ({k})</b>
                <div>v{s.version[k]}</div>
                <div className="ks-row">{s.running === k && <span className="ks-tag on">{en ? 'running' : 'çalışıyor'}</span>}{s.boot === k && <span className="ks-tag">{en ? 'boot' : 'önyükleme'}</span>}</div>
              </div>
            ))}
          </div>
          <Readout testid="iot-ota-phase">{en ? 'Phase' : 'Aşama'}: {PHASE_TEXT[s.phase][lang]} · {en ? 'incoming' : 'gelen'} v{s.incoming}</Readout>
          <Flow rows={log} empty={en ? 'Press "Start update".' : '"Güncellemeyi başlat"a bas.'} />
        </>
      }
      side={
        <>
          {OTA_EVENTS.map((e) => <Btn key={e} ghost={e !== 'start'} onClick={() => fire(e)}>{EVENT_TEXT[e][lang]}</Btn>)}
          <Btn ghost onClick={() => { setS(otaInit()); setLog([]) }}>{en ? 'Reset' : 'Sıfırla'}</Btn>
        </>
      }
    />
  )
}

// --- 11. Güvenlik -----------------------------------------------------------------------------------------------------------

const SETUP_TEXT: Record<Finding, { tr: string; en: string; bad: { tr: string; en: string } }> = {
  tls: { tr: 'TLS ile bağlan (8883)', en: 'Connect over TLS (8883)', bad: { tr: 'Trafik düz metin: parola ve veriler ağda okunur.', en: 'Plain-text traffic: passwords and data can be read on the network.' } },
  verifyCert: { tr: 'Sunucu sertifikasını doğrula (CA)', en: 'Verify the server certificate (CA)', bad: { tr: 'Sertifika doğrulanmıyor: araya giren saldırgan broker gibi davranabilir.', en: 'Certificate not verified: a man in the middle can pose as the broker.' } },
  anonymous: { tr: 'Anonim bağlantıya izin ver', en: 'Allow anonymous connections', bad: { tr: 'Broker herkese açık: herkes abone olup komut yayımlayabilir.', en: 'Broker open to all: anyone can subscribe and publish commands.' } },
  sharedPassword: { tr: 'Tüm cihazlar aynı parolayı kullanıyor', en: 'All devices share one password', bad: { tr: 'Tek cihaz ele geçerse hepsi ele geçer; tek cihazı iptal edemezsin.', en: 'One stolen device exposes all; you cannot revoke a single device.' } },
  secretsInRepo: { tr: 'Wi-Fi/MQTT parolası depoda (git)', en: 'Wi-Fi/MQTT password in the repo (git)', bad: { tr: 'Sır git geçmişinde: silmek yetmez, parolayı değiştir.', en: 'The secret is in git history: deleting is not enough, rotate it.' } },
  acl: { tr: 'Konu ACL\'si tanımlı', en: 'Topic ACL configured', bad: { tr: 'ACL yok: bir cihaz başka cihazın komut konusuna yazabilir.', en: 'No ACL: one device can write to another device\'s command topic.' } },
  signedOta: { tr: 'OTA imzalı ve doğrulanıyor', en: 'OTA signed and verified', bad: { tr: 'İmzasız OTA: ağdaki herkes cihaza yazılım yükleyebilir.', en: 'Unsigned OTA: anyone on the network can flash the device.' } },
  debugPortOpen: { tr: 'Seri/telnet hata ayıklama açık', en: 'Serial/telnet debug left open', bad: { tr: 'Hata ayıklama kapısı açık: fiziksel ya da ağ erişimiyle sırlar okunur.', en: 'Debug port open: secrets readable with physical or network access.' } },
}
const ACL0 = ['# anonim istemciye hiçbir şey yok', 'pattern write clients/%c/durum', 'user sera-01', 'topic readwrite sera/01/#', 'user sera-02', 'topic readwrite sera/02/#', 'user pano', 'topic read sera/#', 'topic write sera/+/+/set', 'user admin', 'topic readwrite #', 'topic deny sera/03/kapi/#'].join('\n')

function SecuritySim({ lang }: P) {
  const en = lang === 'en'
  const [s, setS] = useState<Setup>({ tls: false, verifyCert: false, anonymous: true, sharedPassword: true, secretsInRepo: true, acl: false, signedOta: false, debugPortOpen: true })
  const [acl, setAcl] = useState(ACL0)
  const [user, setUser] = useState('sera-01')
  const [client, setClient] = useState('sera-01')
  const [topic, setTopic] = useState('sera/02/fan/set')
  const [op, setOp] = useState<'read' | 'write'>('write')
  const a = audit(s)
  const parsed = useMemo(() => parseAcl(acl), [acl])
  const dec = aclCheck(parsed.rules, user, client, topic, op)
  const cases: Array<[string, string, string, 'read' | 'write']> = [['sera-01', 'sera-01', 'sera/01/sicaklik', 'write'], ['sera-01', 'sera-01', 'sera/02/fan/set', 'write'], ['pano', 'pano-web', 'sera/02/fan/set', 'read'], ['pano', 'pano-web', 'sera/02/fan/set', 'write'], ['admin', 'cli', 'sera/03/kapi/ac', 'write'], ['sera-03', 'sera-03', 'clients/sera-03/durum', 'write']]
  return (
    <Body
      stage={
        <>
          <div className="ks-gauges"><Gauge value={a.risk} min={0} max={100} warn={40} label={en ? 'risk' : 'risk'} unit="/100" lang={lang} d={0} /></div>
          <ul className="eng-list" data-testid="iot-sec-findings">{a.findings.length ? a.findings.map((f) => <li key={f}>{SETUP_TEXT[f].bad[lang]}</li>) : <li>{en ? 'No findings. Keep the CA certificate and device credentials rotating.' : 'Bulgu yok. CA sertifikasını ve cihaz kimlik bilgilerini dönüşümlü yenilemeyi sürdür.'}</li>}</ul>
          <label className="sl"><span className="sl-h">{en ? 'Mosquitto ACL file' : 'Mosquitto ACL dosyası'}</span><textarea className="ks-in" rows={9} value={acl} onChange={(e) => setAcl(e.target.value)} spellCheck={false} aria-label="ACL" /></label>
          {parsed.errors.length > 0 && <Readout>{parsed.errors.map((e) => `${en ? 'line' : 'satır'} ${e.line}: ${e.msg}`).join('\n')}</Readout>}
          <div className="ks-scroll">
            <table className="ks-table"><thead><tr><th>{en ? 'user / client' : 'kullanıcı / istemci'}</th><th>{en ? 'topic' : 'konu'}</th><th>{en ? 'op' : 'işlem'}</th><th>{en ? 'decision' : 'karar'}</th></tr></thead>
              <tbody>{cases.map(([u, c, t, o]) => { const d = aclCheck(parsed.rules, u, c, t, o); return <tr key={u + t + o}><td>{u} / {c}</td><td><code>{t}</code></td><td>{o}</td><td style={{ color: d.allow ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{d.allow ? (en ? 'allow' : 'izin') : (en ? 'deny' : 'ret')}{d.rule ? ` (${en ? 'line' : 'satır'} ${d.rule.line})` : ''}</td></tr> })}</tbody>
            </table>
          </div>
        </>
      }
      side={
        <>
          {(Object.keys(SETUP_TEXT) as Finding[]).map((k) => <Check key={k} label={SETUP_TEXT[k][lang]} value={s[k]} onChange={(v) => setS((x) => ({ ...x, [k]: v }))} />)}
          <TextIn label={en ? 'User' : 'Kullanıcı'} value={user} onChange={setUser} />
          <TextIn label={en ? 'Client id' : 'İstemci kimliği'} value={client} onChange={setClient} />
          <TextIn label={en ? 'Topic' : 'Konu'} value={topic} onChange={setTopic} />
          <Select label={en ? 'Operation' : 'İşlem'} value={op} options={[['read', 'read'], ['write', 'write']]} onChange={setOp} />
          <Readout testid="iot-acl-dec">{dec.allow ? (en ? 'ALLOWED' : 'İZİN VAR') : (en ? 'DENIED' : 'REDDEDİLDİ')}{dec.rule ? ` · ${en ? 'line' : 'satır'} ${dec.rule.line}: ${dec.rule.kind} ${dec.rule.access} ${dec.rule.filter}` : (en ? ' · no rule matched' : ' · eşleşen kural yok')}</Readout>
        </>
      }
    />
  )
}

// --- 12. BLE ----------------------------------------------------------------------------------------------------------------

function BleSim({ lang }: P) {
  const en = lang === 'en'
  const chars = GATT.flatMap((s) => s.chars.map((c) => ({ s, c })))
  const [sel, setSel] = useState(chars[0].c.uuid)
  const [vals, setVals] = useState<Record<string, number>>({ '0x2A6E': 23.45, '0x2A6F': 55.2, '0x2A19': 87, [GATT[2].chars[0].uuid]: 0 })
  const [adv, setAdv] = useState(500)
  const [tx, setTx] = useState(0)
  const cur = chars.find((x) => x.c.uuid === sel)!
  const range = (c: Char): [number, number, number] => (c.fmt === 'sint16_0.01' ? [-20, 60, 0.01] : c.fmt === 'uint16_0.01' ? [0, 100, 0.1] : c.fmt === 'uint8' ? [0, 100, 1] : [0, 1, 1])
  const [lo, hi, st] = range(cur.c)
  const v = vals[sel] ?? 0
  const bytes = encode(cur.c.fmt, cur.c.fmt === 'bool' ? v === 1 : v)
  const ua = advCurrentUa(adv, tx)
  const ints = [20, 100, 250, 500, 1000, 2000, 5000, 10240]
  return (
    <Body
      stage={
        <>
          <div className="ks-scroll">
            <table className="ks-table">
              <thead><tr><th>{en ? 'Service / characteristic' : 'Hizmet / özellik'}</th><th>UUID</th><th>{en ? 'Props' : 'Özellikler'}</th></tr></thead>
              <tbody>{GATT.map((s) => [<tr key={s.uuid}><td><b>{s.name[lang]}</b></td><td><code>{s.uuid.length > 8 ? `${s.uuid.slice(0, 8)}…` : s.uuid}</code></td><td /></tr>, ...s.chars.map((c) => <tr key={c.uuid} style={c.uuid === sel ? { background: 'var(--eng-soft)' } : undefined}><td>↳ {c.name[lang]}</td><td><code>{c.uuid.length > 8 ? `${c.uuid.slice(0, 8)}…` : c.uuid}</code></td><td>{c.props.join(', ')}</td></tr>)])}</tbody>
            </table>
          </div>
          <Readout testid="iot-ble-bytes">{`${cur.c.name[lang]} = ${cur.c.fmt === 'bool' ? (v ? 'ON' : 'OFF') : v}\n${en ? 'on air (little-endian)' : 'havada (küçük-endian)'}: ${hex(bytes)}\n${en ? 'decoded' : 'çözülen'}: ${decode(cur.c.fmt, bytes)}`}</Readout>
          <Bars title={en ? 'Coin cell (CR2032) life vs advertising interval, days' : 'Reklam aralığına göre düğme pil (CR2032) ömrü, gün'} values={ints.map((i) => coinCellDays(advCurrentUa(i, tx)))} labels={ints.map((i) => (i >= 1000 ? `${i / 1000}s` : `${i}`))} colors={ints.map((i) => (i === adv ? 'var(--sim-a)' : 'var(--mute)'))} h={170} />
          <Readout>{en ? `Advertising every ${adv} ms at ${tx} dBm: ≈ ${nf(lang, 1)(ua)} µA average, phone finds it in ≈ ${discoveryMs(adv)} ms, CR2032 ≈ ${nf(lang, 0)(coinCellDays(ua))} days` : `${adv} ms'de bir, ${tx} dBm reklam: ortalama ≈ ${nf(lang, 1)(ua)} µA, telefon ≈ ${discoveryMs(adv)} ms'de bulur, CR2032 ≈ ${nf(lang, 0)(coinCellDays(ua))} gün`}</Readout>
        </>
      }
      side={
        <>
          <Select label={en ? 'Characteristic' : 'Özellik'} value={sel} options={chars.map((x) => [x.c.uuid, `${x.s.name[lang]}: ${x.c.name[lang]}`])} onChange={setSel} />
          <Slider label={en ? 'Value' : 'Değer'} min={lo} max={hi} step={st} value={v} onChange={(x) => setVals((m) => ({ ...m, [sel]: x }))} fmt={(x) => (cur.c.fmt === 'bool' ? (x ? 'ON' : 'OFF') : String(+x.toFixed(2)))} />
          <Select label={en ? 'Advertising interval' : 'Reklam aralığı'} value={String(adv)} options={ints.map((i) => [String(i), `${i} ms`])} onChange={(x) => setAdv(Number(x))} />
          <Select label={en ? 'TX power' : 'Verici gücü'} value={String(tx)} options={[['-12', '-12 dBm'], ['0', '0 dBm'], ['4', '+4 dBm'], ['8', '+8 dBm']]} onChange={(x) => setTx(Number(x))} />
        </>
      }
    />
  )
}

// --- 13. Kural motoru -------------------------------------------------------------------------------------------------------

const ACT_COLOR: Record<Actuator, string> = { window: 'var(--sky)', fan: 'var(--sim-a)', heater: 'var(--red)', pump: 'var(--green)', alarm: 'var(--gold)' }
function runs(xs: ReadonlyArray<0 | 1>, t: readonly number[]): Array<[number, number]> {
  const out: Array<[number, number]> = []
  let s = -1
  xs.forEach((v, i) => { if (v && s < 0) s = i; if ((!v || i === xs.length - 1) && s >= 0) { out.push([t[s], t[i]]); s = -1 } })
  return out
}

function RulesSim({ lang }: P) {
  const en = lang === 'en'
  const [text, setText] = useState(DEFAULT_RULES[lang])
  useEffect(() => { setText(DEFAULT_RULES[lang]) }, [lang])
  const [outMean, setOutMean] = useState(16)
  const [outAmp, setOutAmp] = useState(8)
  const [cloud, setCloud] = useState(0.2)
  const [band, setBand] = useState<Actuator>('window')
  const parsed = useMemo(() => parseRules(text), [text])
  const day = useMemo(() => simulateDay(parsed.rules, { outMean, outAmp, cloud }), [parsed, outMean, outAmp, cloud])
  const step = 5
  const sub = <T,>(a: readonly T[]) => a.filter((_, i) => i % step === 0)
  const errText = { syntax: en ? 'syntax' : 'sözdizimi', sensor: en ? 'unknown sensor' : 'bilinmeyen sensör', actuator: en ? 'unknown actuator' : 'bilinmeyen eyleyici', value: en ? 'value must be 0 or 1' : 'değer 0 ya da 1 olmalı' }
  const score = Math.max(0, Math.round(day.comfortPct - day.hotMin / 6 - day.coldMin / 6 - day.dryMin / 12 - Object.values(day.switches).reduce((a, b) => a + b, 0) / 4 - day.energyKwh * 2))
  return (
    <Body
      stage={
        <>
          <LineChart title={en ? 'Greenhouse day: temperature, humidity, soil moisture; shaded where the chosen actuator is on' : 'Sera günü: sıcaklık, nem, toprak nemi; seçilen eyleyicinin açık olduğu yer gölgeli'} xLabel={en ? 'hour' : 'saat'} h={250}
            series={[
              { x: sub(day.t), y: sub(day.temp), color: 'var(--red)', label: en ? 'temp °C' : 'sıcaklık °C' },
              { x: sub(day.t), y: sub(day.out), color: 'var(--mute)', dash: '4 3', width: 1.2, label: en ? 'outside' : 'dış' },
              { x: sub(day.t), y: sub(day.soil), color: 'var(--green)', label: en ? 'soil %' : 'toprak %' },
              { x: sub(day.t), y: sub(day.hum), color: 'var(--sky)', width: 1.2, label: en ? 'hum %' : 'nem %' },
            ]}
            hlines={[{ y: 18, color: 'var(--gold)' }, { y: 30, color: 'var(--gold)' }]}
            bands={runs(day.acts[band], day.t).map(([x0, x1]) => ({ x0, x1, color: ACT_COLOR[band] }))} />
          <Readout testid="iot-rules-sum">{en
            ? `Comfort (18–30 °C): ${nf(lang, 1)(day.comfortPct)}% · too hot ${day.hotMin} min · too cold ${day.coldMin} min · dry soil ${day.dryMin} min\nSwitches: ${(Object.keys(day.switches) as Actuator[]).map((a) => `${ACT_NAME[a].en} ${day.switches[a]}`).join(', ')} · energy ${nf(lang, 2)(day.energyKwh)} kWh\nScore: ${score}`
            : `Konfor (18–30 °C): %${nf(lang, 1)(day.comfortPct)} · aşırı sıcak ${day.hotMin} dk · aşırı soğuk ${day.coldMin} dk · kuru toprak ${day.dryMin} dk\nAnahtarlama: ${(Object.keys(day.switches) as Actuator[]).map((a) => `${ACT_NAME[a].tr} ${day.switches[a]}`).join(', ')} · enerji ${nf(lang, 2)(day.energyKwh)} kWh\nPuan: ${score}`}</Readout>
        </>
      }
      side={
        <>
          <label className="sl"><span className="sl-h">{en ? 'Rules' : 'Kurallar'}</span><textarea className="ks-in" rows={12} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} aria-label={en ? 'Rules' : 'Kurallar'} /></label>
          <Readout>{parsed.errors.length ? parsed.errors.map((e) => `${en ? 'line' : 'satır'} ${e.line}: ${errText[e.msg]}`).join('\n') : (en ? `${parsed.rules.length} rules OK` : `${parsed.rules.length} kural geçerli`)}</Readout>
          <Select label={en ? 'Shade actuator' : 'Gölgelenen eyleyici'} value={band} options={(Object.keys(ACT_COLOR) as Actuator[]).map((a) => [a, ACT_NAME[a][lang]])} onChange={setBand} />
          <Slider label={en ? 'Outside mean' : 'Dış ortalama'} min={-5} max={30} step={1} value={outMean} onChange={setOutMean} fmt={(v) => `${v} °C`} />
          <Slider label={en ? 'Day/night swing' : 'Gece/gündüz farkı'} min={0} max={15} step={1} value={outAmp} onChange={setOutAmp} fmt={(v) => `±${v} °C`} />
          <Slider label={en ? 'Cloud cover' : 'Bulutluluk'} min={0} max={1} step={0.1} value={cloud} onChange={setCloud} fmt={(v) => `${Math.round(v * 100)}%`} />
          <Btn ghost onClick={() => setText(DEFAULT_RULES[lang])}>{en ? 'Default rules' : 'Varsayılan kurallar'}</Btn>
        </>
      }
    />
  )
}

// --- 14. 3B akıllı sera -----------------------------------------------------------------------------------------------------

const loadSera = () => import('./scene-sera')
const KIND_TEXT: Record<PacketKind, { tr: string; en: string; css: string }> = {
  telemetry: { tr: 'telemetri', en: 'telemetry', css: '#0d9488' }, command: { tr: 'komut', en: 'command', css: '#f97316' }, state: { tr: 'durum (retained)', en: 'state (retained)', css: '#8b5cf6' },
}

/** Hareket azaltma tercihi (prefers-reduced-motion): açıksa otomatik oynatma yok. */
function useReducedMotion() {
  const [r, setR] = useState(true)
  useEffect(() => { setR(!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) }, [])
  return r
}

function Greenhouse3DSim({ lang }: P) {
  const en = lang === 'en'
  const reduced = useReducedMotion()
  const [minute, setMinute] = useState(11 * 60)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(20)
  const [outMean, setOutMean] = useState(18)
  const [cloud, setCloud] = useState(0.2)
  const [manual, setManual] = useState<Array<{ minute: number; act: Actuator; value: 0 | 1 }>>([])
  const started = useRef(false)
  useEffect(() => { if (!reduced && !started.current) { started.current = true; setPlaying(true) } }, [reduced])
  useEffect(() => {
    if (!playing) return
    const h = window.setInterval(() => setMinute((m) => (m + speed * 0.1) % 1440), 100)
    return () => window.clearInterval(h)
  }, [playing, speed])
  const rules = useMemo(() => parseRules(DEFAULT_RULES[lang]).rules, [lang])
  const day = useMemo(() => simulateDay(rules, { outMean, outAmp: 8, cloud }), [rules, outMean, cloud])
  const msgs = useMemo(() => messagesOfDay(day, manual), [day, manual])
  const frame = frameAt(day, minute, cloud)
  const packets = packetsAt(msgs, minute)
  const state: IotSceneState = { frame, packets, reduced }
  const recent = msgs.filter((m) => m.minute <= minute && m.minute > minute - 40).slice(-8).reverse()
  const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`
  const send = (act: Actuator) => setManual((ms) => [...ms, { minute: Math.floor(minute), act, value: frame.acts[act] ? 0 : 1 }])
  return (
    <Body
      stage={
        <>
          <Scene3D load={loadSera} state={state} lang={lang} testid="iot-3d" />
          <ul className="ks-legend">{(Object.keys(KIND_TEXT) as PacketKind[]).map((k) => <li key={k}><i style={{ background: KIND_TEXT[k].css, borderRadius: '50%' }} />{KIND_TEXT[k][lang]}</li>)}</ul>
          <Readout testid="iot-3d-sum">{en
            ? `${hhmm(minute)} · inside ${nf(lang, 1)(frame.temp)} °C, outside ${nf(lang, 1)(frame.out)} °C, soil ${Math.round(frame.soil)}%\nwindow ${frame.acts.window ? 'open' : 'closed'} · fan ${frame.acts.fan ? 'on' : 'off'} · heater ${frame.acts.heater ? 'on' : 'off'} · pump ${frame.acts.pump ? 'on' : 'off'} · ${packets.length} packets in flight`
            : `${hhmm(minute)} · içeride ${nf(lang, 1)(frame.temp)} °C, dışarıda ${nf(lang, 1)(frame.out)} °C, toprak %${Math.round(frame.soil)}\npencere ${frame.acts.window ? 'açık' : 'kapalı'} · fan ${frame.acts.fan ? 'açık' : 'kapalı'} · ısıtıcı ${frame.acts.heater ? 'açık' : 'kapalı'} · sulama ${frame.acts.pump ? 'açık' : 'kapalı'} · havada ${packets.length} paket`}</Readout>
          <Flow rows={recent.map((m) => ({ t: hhmm(m.minute), text: <><code>{m.topic}</code> {m.payload} <span className="dim">{m.from} → broker → {m.to.join(', ')}</span></> }))} empty={en ? 'No messages in the last 40 minutes.' : 'Son 40 dakikada mesaj yok.'} />
        </>
      }
      side={
        <>
          <Btn onClick={() => setPlaying((p) => !p)} testid="iot-3d-play">{playing ? (en ? 'Pause' : 'Duraklat') : (en ? 'Play the day' : 'Günü oynat')}</Btn>
          <Slider label={en ? 'Time of day' : 'Günün saati'} min={0} max={1439} step={5} value={Math.floor(minute)} onChange={setMinute} fmt={hhmm} />
          <Select label={en ? 'Speed' : 'Hız'} value={String(speed)} options={[['5', en ? '0.5 min/s' : '0,5 dk/s'], ['20', en ? '2 min/s' : '2 dk/s'], ['100', en ? '10 min/s' : '10 dk/s']]} onChange={(v) => setSpeed(Number(v))} />
          <Slider label={en ? 'Outside mean' : 'Dış ortalama'} min={-5} max={30} step={1} value={outMean} onChange={setOutMean} fmt={(v) => `${v} °C`} />
          <Slider label={en ? 'Cloud cover' : 'Bulutluluk'} min={0} max={1} step={0.1} value={cloud} onChange={setCloud} fmt={(v) => `${Math.round(v * 100)}%`} />
          <span className="sl-h">{en ? 'Manual command from the dashboard' : 'Panodan elle komut'}</span>
          <div className="ks-row">{(['fan', 'window', 'pump'] as Actuator[]).map((a) => <Btn key={a} ghost onClick={() => send(a)}>{ACT_NAME[a][lang]}</Btn>)}</div>
          <Readout>{en ? 'The command packet flies dashboard → broker → actuator. The on-device rules decide again on the next change: think about who wins (unit 10).' : 'Komut paketi pano → broker → eyleyici yolunu izler. Cihazdaki kurallar bir sonraki değişimde yeniden karar verir: hangisi kazanmalı, düşün (10. ünite).'}</Readout>
        </>
      }
    />
  )
}

// --- Kayıt ------------------------------------------------------------------------------------------------------------------

const SIMS: Record<IotSimId, (p: P) => React.ReactElement> = {
  pinler: PinSim, wifi: WifiSim, rest: RestSim, broker: BrokerSim, qos: QosSim, telemetri: TelemetrySim, eyleyici: ActuatorSim,
  pano: DashboardSim, guc: PowerSim, ota: OtaSim, guvenlik: SecuritySim, ble: BleSim, kurallar: RulesSim, sera3b: Greenhouse3DSim,
}

export function IotSim({ id, lang }: { id: IotSimId; lang: Lang }) {
  const S = SIMS[id]
  const m = IOT_SIM_META[id][lang]
  return <SimFrame id={id} title={m.title} desc={m.desc} testid={`iot-sim-${id}`}><S lang={lang} /></SimFrame>
}
