// IoT dersinin saf mantığı: MQTT konu eşleme ve broker davranışı, QoS el sıkışmaları, ESP32 pin kuralları ve Wi-Fi geri
// çekilmesi, REST durum kodları, yük/trafik hesabı, idempotent komut, güç ve OTA durum makinesi, ACL ve denetim, BLE kodlama,
// kural motoru ve sera modeli.
import { describe, expect, it } from 'vitest'
import { advCurrentUa, coinCellDays, decode, encode, hex } from './ble'
import { Ring, alarmStates, commandRun, dailyTraffic, minMaxDownsample, payload, publishSize, readSensor, remLenBytes, reportOnChange, shadowDelta } from './device'
import { backoff, checkPin, dropRate, simulateWifi } from './esp32'
import { handle, idempotent, initialDev, rawRequest, rawResponse } from './http'
import { Broker, deadAfter, simulateQos, topicMatches, validFilter, validTopic } from './mqtt'
import { POWER_MODES, avgCurrentMa, batteryDays, otaInit, otaStep, type OtaEvent } from './power'
import { DEFAULT_RULES, evaluate, norm, parseRules, simulateDay } from './rules'
import { aclCheck, audit, parseAcl } from './security'

describe('MQTT konu ve süzgeç', () => {
  it('joker kuralları (MQTT 3.1.1 §4.7)', () => {
    expect(topicMatches('ev/+/sicaklik', 'ev/sera-01/sicaklik')).toBe(true)
    expect(topicMatches('ev/+/sicaklik', 'ev/sera-01/nem')).toBe(false)
    expect(topicMatches('ev/+', 'ev/a/b')).toBe(false)
    expect(topicMatches('ev/#', 'ev/a/b/c')).toBe(true)
    expect(topicMatches('ev/#', 'ev')).toBe(true) // '#' üst seviyeyi de kapsar
    expect(topicMatches('#', '$SYS/broker/uptime')).toBe(false)
    expect(topicMatches('+/broker/uptime', '$SYS/broker/uptime')).toBe(false)
    expect(topicMatches('$SYS/#', '$SYS/broker/uptime')).toBe(true)
    expect(topicMatches('ev//x', 'ev//x')).toBe(true) // boş seviye geçerlidir
  })
  it('geçersiz süzgeç ve konu', () => {
    for (const f of ['ev/#/x', 'ev/a#', 'ev/+x', '']) expect(validFilter(f), f).toBe(false)
    for (const f of ['#', '+', 'a/+/b', 'a/#', '+/+']) expect(validFilter(f), f).toBe(true)
    expect(validTopic('ev/+/x')).toBe(false)
    expect(validTopic('ev/#')).toBe(false)
    expect(validTopic('ev/sera-01')).toBe(true)
    expect(deadAfter(60)).toBe(90)
  })
})

describe('broker', () => {
  it('teslim QoS = min(yayın, abonelik); örtüşen aboneliklerde tek kopya', () => {
    const b = new Broker()
    b.connect('a'); b.connect('pano')
    b.subscribe('pano', 'ev/#', 1); b.subscribe('pano', 'ev/+/t', 2)
    const d = b.publish({ topic: 'ev/x/t', payload: '1', qos: 2, retain: false })
    expect(d).toHaveLength(1)
    expect(d[0].qos).toBe(2)
    expect(b.publish({ topic: 'ev/x/h', payload: '1', qos: 2, retain: false })[0].qos).toBe(1)
  })
  it('kalıcı mesaj yeni aboneye hemen gelir; boş yük kalıcıyı siler', () => {
    const b = new Broker()
    b.connect('dev'); b.publish({ topic: 'ev/dev/durum', payload: 'online', qos: 1, retain: true })
    b.connect('pano')
    const got = b.subscribe('pano', 'ev/+/durum', 1)
    expect(got).toEqual([{ to: 'pano', topic: 'ev/dev/durum', payload: 'online', qos: 1, retained: true }])
    b.publish({ topic: 'ev/dev/durum', payload: '', qos: 1, retain: true })
    expect(b.retained.size).toBe(0)
  })
  it('son vasiyet: kopmada yayımlanır, DISCONNECT ile yayımlanmaz', () => {
    const b = new Broker()
    const will = { topic: 'ev/dev/durum', payload: 'offline', qos: 1 as const, retain: true }
    b.connect('pano'); b.subscribe('pano', 'ev/#', 1)
    b.connect('dev', { will })
    expect(b.drop('dev', true)).toEqual([])
    b.connect('dev', { will })
    const d = b.drop('dev', false)
    expect(d.map((x) => x.payload)).toEqual(['offline'])
    expect(b.retained.get('ev/dev/durum')?.payload).toBe('offline')
  })
  it('kalıcı oturum (clean=false) QoS ≥ 1 mesajları kuyruklar; temiz oturum unutur', () => {
    const b = new Broker()
    b.connect('dev', { clean: false }); b.subscribe('dev', 'cmd/#', 1); b.drop('dev', true)
    b.connect('srv')
    b.publish({ topic: 'cmd/led', payload: 'on', qos: 1, retain: false })
    b.publish({ topic: 'cmd/led', payload: 'x', qos: 0, retain: false })
    expect(b.connect('dev', { clean: false }).map((d) => d.payload)).toEqual(['on'])
    b.connect('tmp'); b.subscribe('tmp', 'cmd/#', 1); b.drop('tmp', true)
    b.publish({ topic: 'cmd/led', payload: 'off', qos: 1, retain: false })
    expect(b.connect('tmp')).toEqual([])
  })
})

describe('QoS benzetimi', () => {
  it('kayıpsız bağlantıda paket sayıları 1, 2, 4', () => {
    expect(simulateQos(0, 10, 0).packets).toBe(10)
    expect(simulateQos(1, 10, 0).packets).toBe(20)
    expect(simulateQos(2, 10, 0).packets).toBe(40)
  })
  it('kayıplı bağlantıda: QoS 0 kaybeder, QoS 1 yineler, QoS 2 tam bir kez', () => {
    const [q0, q1, q2] = ([0, 1, 2] as const).map((q) => simulateQos(q, 200, 0.3, 3))
    expect(q0.lost).toBeGreaterThan(30)
    expect(q0.duplicates).toBe(0)
    expect(q1.lost).toBe(0)
    expect(q1.duplicates).toBeGreaterThan(10)
    expect(q2.lost).toBe(0)
    expect(q2.duplicates).toBe(0)
    expect(q2.packets).toBeGreaterThan(q1.packets)
    expect(simulateQos(1, 50, 0.3, 3)).toEqual(simulateQos(1, 50, 0.3, 3)) // deterministik
  })
})

describe('ESP32 pinleri ve Wi-Fi', () => {
  it('pin kuralları', () => {
    expect(checkPin(6, 'out', false)).toEqual({ level: 'err', issues: ['flash'] })
    expect(checkPin(34, 'out', false).issues).toContain('inputOnly')
    expect(checkPin(34, 'adc', true).level).toBe('ok')
    expect(checkPin(13, 'adc', true).issues).toContain('adc2Wifi')
    expect(checkPin(13, 'adc', false).level).toBe('ok')
    expect(checkPin(12, 'out', false).issues).toContain('strap12')
    expect(checkPin(21, 'sda', true).level).toBe('ok')
    expect(checkPin(25, 'dac', false).level).toBe('ok')
    expect(checkPin(4, 'dac', false).issues).toContain('noDac')
    expect(checkPin(1, 'out', false).issues).toContain('uart0')
  })
  it('üstel geri çekilme üst sınırda sabitlenir; güçlü sinyalde kopma yok', () => {
    expect([0, 1, 2, 3, 4, 5].map((k) => backoff(1, 16, k))).toEqual([1, 2, 4, 8, 16, 16])
    expect(dropRate(-60)).toBe(0)
    expect(dropRate(-90)).toBeGreaterThan(dropRate(-80))
  })
  it('AP kesintisi: geri çekilme daha az deneme yapar, ikisi de toparlanır', () => {
    const p = { horizon: 120, apDown: [20, 45] as [number, number], rssi: -60, base: 1, cap: 16 }
    const f = simulateWifi({ ...p, strategy: 'fixed' }), b = simulateWifi({ ...p, strategy: 'backoff' })
    expect(b.attempts).toBeLessThan(f.attempts)
    expect(Number.isFinite(f.recoverS) && Number.isFinite(b.recoverS)).toBe(true)
    expect(f.drops).toBeGreaterThanOrEqual(1)
    expect(f.states.length).toBe(1200)
  })
})

describe('REST', () => {
  it('yollar, yöntemler ve durum kodları', () => {
    let s = initialDev()
    const go = (method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: string, token?: string) => { const r = handle(s, { method, path, body, token }); s = r.state; return r.res }
    expect(go('GET', '/api/sensor').status).toBe(200)
    expect(go('GET', '/api/yok').status).toBe(404)
    const r405 = go('POST', '/api/sensor', '{}')
    expect(r405.status).toBe(405)
    expect(r405.headers.Allow).toBe('GET')
    expect(go('PUT', '/api/led', '{"on": tru}').status).toBe(400)
    expect(go('PUT', '/api/led', '{"on": "evet"}').status).toBe(422)
    expect(JSON.parse(go('PUT', '/api/led', '{"on": true}').body)).toEqual({ on: true })
    const c = go('POST', '/api/schedules', '{"at":"07:30","on":true}')
    expect(c.status).toBe(201)
    expect(c.headers.Location).toBe('/api/schedules/1')
    expect(go('POST', '/api/schedules', '{"at":"25:00","on":true}').status).toBe(422)
    expect(go('DELETE', '/api/schedules/1').status).toBe(204)
    expect(go('DELETE', '/api/schedules/1').status).toBe(404)
  })
  it('belirteç yalnız yazmada istenir; ham metinler', () => {
    const s = initialDev(true)
    expect(handle(s, { method: 'GET', path: '/api/led' }).res.status).toBe(200)
    expect(handle(s, { method: 'PUT', path: '/api/led', body: '{"on":true}' }).res.status).toBe(401)
    expect(handle(s, { method: 'PUT', path: '/api/led', body: '{"on":true}', token: s.token }).res.status).toBe(200)
    expect(rawRequest({ method: 'PUT', path: '/api/led', body: '{"on":true}', token: 't' })).toContain('Authorization: Bearer t')
    expect(rawResponse(handle(s, { method: 'GET', path: '/api/led' }).res).split('\n')[0]).toBe('HTTP/1.1 200 OK')
    expect(idempotent('PUT')).toBe(true)
    expect(idempotent('POST')).toBe(false)
  })
})

describe('sensörden buluta ve eyleyici', () => {
  it('paket boyutu ve yük biçimleri', () => {
    expect(remLenBytes(127)).toBe(1)
    expect(remLenBytes(128)).toBe(2)
    expect(publishSize('a/b', 10, 0)).toBe(1 + 1 + 2 + 3 + 10)
    expect(publishSize('a/b', 10, 1)).toBe(1 + 1 + 2 + 3 + 2 + 10)
    const r = readSensor(43200)
    expect(payload(r, 'bin').bytes).toBe(8)
    expect(payload(r, 'json').bytes).toBeGreaterThan(payload(r, 'csv').bytes)
    expect(JSON.parse(payload(r, 'json').text).t).toBe(r.temp)
    expect(readSensor(1000, 3)).toEqual(readSensor(1000, 3))
    expect(dailyTraffic(60, 50, false)).toEqual({ msgs: 1440, bytes: 1440 * 90 })
  })
  it('değişince bildir: ölü bant ve kalp atışı', () => {
    expect(reportOnChange([20, 20.1, 20.2, 20.6, 20.6, 20.6, 20.6], 0.5, 100)).toEqual([0, 3])
    expect(reportOnChange([1, 1, 1, 1, 1], 0.5, 2)).toEqual([0, 2, 4])
  })
  it('toggle yinelenen teslimde bozulur, set ve komut kimliği bozulmaz', () => {
    const t = commandRun('toggle', 20, 0.3, 11, 1), s = commandRun('set', 20, 0.3, 11, 1), id = commandRun('setId', 20, 0.3, 11, 1)
    expect(t.duplicates).toBeGreaterThan(0)
    expect(s.final).toBe(s.expected)
    expect(id.final).toBe(id.expected)
    expect(id.applied).toBe(20)
    expect(commandRun('toggle', 20, 0, 11, 1).final).toBe(false) // kayıpsız: 20 çevirme = başa dönüş
    expect(shadowDelta({ desired: { role: 1, servo: 90 }, reported: { role: 1, servo: 0 } })).toEqual({ servo: 90 })
  })
  it('halka tampon, min/max seyreltme, histerezis', () => {
    const r = new Ring(3)
    for (const v of [1, 2, 3, 4, 5]) r.push(v)
    expect(r.toArray()).toEqual([3, 4, 5])
    const xs = Array.from({ length: 1000 }, (_, i) => (i === 500 ? 99 : Math.sin(i / 50)))
    const d = minMaxDownsample(xs, 50)
    expect(d.length).toBeLessThanOrEqual(100)
    expect(Math.max(...d)).toBe(99) // tepe kaybolmaz
    expect(alarmStates([24, 26, 25.5, 24.5, 23.9, 26], 25, 24)).toEqual([false, true, true, true, false, true])
  })
})

describe('güç ve OTA', () => {
  it('derin uyku pil ömrünü kat kat uzatır; DevKit regülatörü bunu bozar', () => {
    const base = { capacityMah: 2600, intervalS: 300 }
    const days = (k: keyof typeof POWER_MODES) => batteryDays({ ...base, ...POWER_MODES[k], awakeS: k === 'always' || k === 'modem' ? 300 : POWER_MODES[k].awakeS })
    expect(days('deep')).toBeGreaterThan(50 * days('always'))
    expect(days('deep')).toBeGreaterThan(5 * days('deepDevkit'))
    expect(avgCurrentMa({ capacityMah: 1, awakeS: 1, awakeMa: 100, sleepUa: 0, intervalS: 100 })).toBeCloseTo(1)
  })
  it('A/B güncelleme: başarılı yol, öz sınamada geri dönüş, geçersiz olay', () => {
    const run = (evs: OtaEvent[]) => evs.reduce(otaStep, otaInit())
    const ok = run(['start', 'downloadOk', 'verifyOk', 'reboot', 'selfTestOk'])
    expect(ok).toMatchObject({ phase: 'done', running: 'B', boot: 'B' })
    expect(ok.version.B).toBe('1.5.0')
    const back = run(['start', 'downloadOk', 'verifyOk', 'reboot', 'selfTestFail'])
    expect(back).toMatchObject({ phase: 'rolledBack', running: 'A', boot: 'A' })
    expect(run(['start', 'downloadOk', 'verifyFail'])).toMatchObject({ phase: 'failed', running: 'A', boot: 'A' })
    expect(run(['reboot'])).toEqual(otaInit())
    expect(run(['start', 'selfTestOk']).phase).toBe('downloading')
  })
})

describe('güvenlik', () => {
  const acl = parseAcl(['pattern readwrite ev/%c/#', 'user pano', 'topic read ev/#', 'user admin', 'topic readwrite #', 'topic deny ev/kapi/komut/#', 'topic bozuk ev/#', 'saçma satır'].join('\n'))
  it('ACL ayrıştırma ve karar', () => {
    expect(acl.errors.map((e) => e.msg)).toEqual(['access', 'syntax'])
    expect(aclCheck(acl.rules, 'x', 'sera-01', 'ev/sera-01/t', 'write').allow).toBe(true)
    expect(aclCheck(acl.rules, 'x', 'sera-01', 'ev/sera-02/komut/role', 'write').allow).toBe(false)
    expect(aclCheck(acl.rules, 'pano', 'web', 'ev/sera-02/t', 'read').allow).toBe(true)
    expect(aclCheck(acl.rules, 'pano', 'web', 'ev/sera-02/t', 'write').allow).toBe(false)
    expect(aclCheck(acl.rules, 'admin', 'cli', 'ev/kapi/komut/ac', 'write').allow).toBe(false) // deny önceliği
  })
  it('denetim: kötü kurulum 100, iyi kurulum 0', () => {
    expect(audit({ tls: false, verifyCert: false, anonymous: true, sharedPassword: true, secretsInRepo: true, acl: false, signedOta: false, debugPortOpen: true }).risk).toBe(100)
    expect(audit({ tls: true, verifyCert: true, anonymous: false, sharedPassword: false, secretsInRepo: false, acl: true, signedOta: true, debugPortOpen: false })).toEqual({ risk: 0, findings: [] })
    expect(audit({ tls: false, verifyCert: true, anonymous: false, sharedPassword: false, secretsInRepo: false, acl: true, signedOta: true, debugPortOpen: false }).findings.sort()).toEqual(['tls', 'verifyCert'])
  })
})

describe('BLE', () => {
  it('küçük-endian kodlama gidiş-dönüş', () => {
    expect(hex(encode('sint16_0.01', 23.45))).toBe('29 09')
    expect(decode('sint16_0.01', encode('sint16_0.01', -5.5))).toBe(-5.5)
    expect(decode('uint16_0.01', encode('uint16_0.01', 55.2))).toBeCloseTo(55.2)
    expect(encode('uint8', 87)).toEqual([87])
  })
  it('reklam aralığı uzadıkça akım düşer, pil ömrü uzar', () => {
    expect(advCurrentUa(100, 0)).toBeGreaterThan(advCurrentUa(1000, 0))
    expect(advCurrentUa(1000, 8)).toBeGreaterThan(advCurrentUa(1000, 0))
    expect(coinCellDays(advCurrentUa(1000, 0))).toBeGreaterThan(coinCellDays(advCurrentUa(100, 0)))
  })
})

describe('kural motoru ve sera', () => {
  it('Türkçe ve İngilizce sözdizimi aynı kurala çözülür', () => {
    const tr = parseRules('EĞER sıcaklık > 30 VE nem < 80 İSE fan = 1 BEKLE 10')
    const en = parseRules('IF temp > 30 AND hum < 80 THEN fan = 1 HOLD 10')
    expect(tr.errors).toEqual([])
    expect(tr.rules[0]).toEqual({ ...en.rules[0] })
    expect(norm('EĞER İSE ŞÇÖÜ')).toBe('eger ise scou')
  })
  it('hatalı satırlar satır numarasıyla bildirilir', () => {
    const r = parseRules(['# yorum', 'EĞER sicaklik > 30 İSE fan = 1', 'EĞER rüzgar > 3 İSE fan = 1', 'EĞER sicaklik > 3 İSE kapi = 1', 'EĞER sicaklik > 3 İSE fan = 2', 'sicaklik çok yüksek'].join('\n'))
    expect(r.rules).toHaveLength(1)
    expect(r.errors).toEqual([{ line: 3, msg: 'sensor' }, { line: 4, msg: 'actuator' }, { line: 5, msg: 'value' }, { line: 6, msg: 'syntax' }])
  })
  it('aynı eyleyicide sonraki kural kazanır', () => {
    const { rules } = parseRules('IF temp > 20 THEN fan = 1\nIF temp > 25 THEN fan = 0')
    expect(evaluate(rules, { temp: 30, hum: 50, soil: 50, light: 0, hour: 12 }).want.fan).toBe(0)
    expect(evaluate(rules, { temp: 22, hum: 50, soil: 50, light: 0, hour: 12 }).want.fan).toBe(1)
  })
  it('varsayılan kurallar kuralsız seradan daha konforlu; BEKLE anahtarlamayı azaltır', () => {
    const p = { outMean: 16, outAmp: 8, cloud: 0.2 }
    const none = simulateDay([], p)
    const def = simulateDay(parseRules(DEFAULT_RULES.tr).rules, p)
    expect(parseRules(DEFAULT_RULES.en).rules).toEqual(parseRules(DEFAULT_RULES.tr).rules)
    expect(def.comfortPct).toBeGreaterThan(none.comfortPct)
    expect(def.t).toHaveLength(1440)
    const noHold = simulateDay(parseRules('IF temp > 24 THEN fan = 1\nIF temp < 24 THEN fan = 0').rules, p)
    const hold = simulateDay(parseRules('IF temp > 24 THEN fan = 1 HOLD 30\nIF temp < 24 THEN fan = 0 HOLD 30').rules, p)
    expect(hold.switches.fan).toBeLessThanOrEqual(noHold.switches.fan)
  })
})
