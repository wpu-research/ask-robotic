// 3B sahnelerin saf mantığı: IoT serasında paket yönlendirme (her paket broker'dan geçer), mesaj üretimi ve anlık sera
// karesi; sensör-ML serasında karelerin anomali hattıyla tutarlılığı ve renk eşlemesi. three.js burada yok.
import { describe, expect, it } from 'vitest'
import { DEFAULT_RULES, parseRules, simulateDay } from '@/lib/iot/rules'
import { HOP_MIN, NODES, SUBSCRIBERS, TELEMETRY_EVERY, along, frameAt, messagesOfDay, packetsAt, route, tempColor } from '@/lib/iot/scene'
import { ALARM_DEFAULTS, alarm, pipeline } from '@/lib/sensor-ml/anomaly'
import { FEAT_DEFAULTS } from '@/lib/sensor-ml/features'
import { bedTemps, frameAtPos, smlFrames } from '@/lib/sensor-ml/scene'
import { simulate } from '@/lib/sensor-ml/sensors'

const day = simulateDay(parseRules(DEFAULT_RULES.tr).rules, { outMean: 16, outAmp: 8, cloud: 0.2 })

describe('IoT 3B sera: paket yönlendirme', () => {
  it('yol her zaman broker üzerinden; uçlar kaynak ve hedef', () => {
    expect(route('sensor', 'dashboard')).toEqual([NODES.sensor, NODES.broker, NODES.dashboard])
    expect(along(route('sensor', 'actuator'), 0)).toEqual(NODES.sensor)
    expect(along(route('sensor', 'actuator'), 0.5)).toEqual(NODES.broker)
    const end = along(route('sensor', 'actuator'), 1)
    end.forEach((v, i) => expect(v).toBeCloseTo(NODES.actuator[i]))
    expect(along(route('sensor', 'actuator'), 0.25)[1]).toBeGreaterThan((NODES.sensor[1] + NODES.broker[1]) / 2) // yay
  })
  it('mesajlar: düzenli telemetri, eyleyici değişince durum, elle komut', () => {
    const msgs = messagesOfDay(day, [{ minute: 600, act: 'fan', value: 1 }])
    expect(msgs.filter((m) => m.kind === 'telemetry')).toHaveLength(1440 / TELEMETRY_EVERY)
    const switches = Object.values(day.switches).reduce((a, b) => a + b, 0)
    expect(msgs.filter((m) => m.kind === 'state').length).toBe(switches - Object.values(day.acts).filter((a) => a[0] === 1).length)
    const cmd = msgs.find((m) => m.kind === 'command')!
    expect(cmd).toMatchObject({ from: 'dashboard', to: SUBSCRIBERS.command, topic: 'sera/02/komut/fan', payload: '1' })
    expect(msgs.every((m, i) => i === 0 || msgs[i - 1].minute <= m.minute)).toBe(true)
  })
  it('havadaki paketler: her aboneye bir kopya, yalnız 2 bacak süresince', () => {
    const msgs = messagesOfDay(day)
    const at = packetsAt(msgs, 600 + HOP_MIN) // 600. dakikadaki telemetri tam broker'da
    const tele = at.filter((p) => p.topic === 'sera/01/sicaklik')
    expect(tele.map((p) => p.to).sort()).toEqual([...SUBSCRIBERS.telemetry].sort())
    tele.forEach((p) => p.pos.forEach((v, i) => expect(v).toBeCloseTo(NODES.broker[i])))
    expect(packetsAt(msgs, 600 + 2 * HOP_MIN + 0.5).some((p) => p.key.startsWith('600-sera/01/sicaklik'))).toBe(false)
    expect(packetsAt([], 10)).toEqual([])
  })
  it('anlık kare ve sıcaklık rengi', () => {
    const f = frameAt(day, 14 * 60 + 30)
    expect(f.temp).toBe(day.temp[870])
    expect(f.acts.window).toBe(day.acts.window[870])
    expect(frameAt(day, 2 * 60).sun).toBe(0)
    expect(tempColor(10)).toBe(0x3b82f6)
    expect(tempColor(38)).toBe(0xef4444)
    expect(tempColor(24)).toBe(0x22c55e)
    expect(tempColor(NaN)).toBe(0x22c55e)
    expect((tempColor(30) >> 16) & 0xff).toBeGreaterThan((tempColor(20) >> 16) & 0xff) // ısındıkça kırmızı artar
  })
})

describe('Sensör-ML 3B sera', () => {
  const S = simulate()
  it('kareler anomali hattıyla birebir; arızada uyarı yanar', () => {
    const fr = smlFrames(S, 3)
    const P = pipeline(S, { ...FEAT_DEFAULTS, horizon: 3 })
    const A = alarm(P.z, ALARM_DEFAULTS)
    expect(fr).toHaveLength(P.idx.length)
    expect(fr.map((f) => f.alarm)).toEqual(A.state)
    expect(fr.some((f) => f.fault && f.status === 'alert')).toBe(true)
    expect(fr.filter((f) => !f.fault && f.day < 5).every((f) => f.status !== 'alert' || f.alarm)).toBe(true)
    expect(fr[0].day).toBe(1)
    expect(frameAtPos(fr, -3)).toBe(fr[0])
    expect(frameAtPos(fr, 1e9)).toBe(fr[fr.length - 1])
  })
  it('yatak sıcaklıkları: gece düzgün, arızada ısıtıcı köşesi en sıcak', () => {
    const fr = smlFrames(S, 3)
    const night = fr.find((f) => f.hour < 3 && !f.fault)!
    const b = bedTemps(night)
    expect(b).toHaveLength(3)
    expect(b.flat().every((v) => Math.abs(v - night.actual) < 1e-9)).toBe(true)
    const hot = bedTemps(fr.find((f) => f.fault && f.hour > 15)!)
    expect(hot[2][0]).toBe(Math.max(...hot.flat()))
  })
})
