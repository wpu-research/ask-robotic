// Raspberry Pi dersi saf mantığı: kart önerisi, sanal terminal, 40 pin başlık, sensör veri yolları, görüntü boru hattı,
// motor/enkoder/kinematik, Flask paneli ve ROS 2 grafiği.
import { describe, expect, it } from 'vitest'
import { recommend } from './board'
import { HEADER, checkWiring, dutyOf, ledCurrent, ledResistor, newMem, physOf, programSource, servoPulseMs, stepProgram } from './gpio'
import { adc10, crc8, decodeScratchpad, i2cBus, makeW1Slave, mcp3008Decode, mcp3008Rx, mcp3008Tx, parseW1Slave } from './sensors'
import { PRESETS, centroid, inRange, openMask, rgbToHsv, steer, synthFrame } from './vision'
import { arcade, bodyTwist, integrate, l298n, motorStep, piStep, quadState, quadStep, rpmFromTicks, wheelSpeeds } from './motion'
import { cmdToWheels, handle, newRobot, watchdog } from './net'
import { graph, topicList } from './ros'
import { TERM_TASKS, applyChmod, exec, getNode, i2cdetectLines, initialState, prompt, saveFile, SERVICE_UNIT, tokenize } from './terminal'

describe('kart seçimi', () => {
  it('kamera + ROS → Pi; pil + kesin zamanlama → MCU; ikisi birden → kombinasyon', () => {
    expect(recommend(['vision', 'ros'])[0].board).toBe('pi5')
    expect(['stm32', 'pico']).toContain(recommend(['battery', 'hardRt'])[0].board)
    expect(recommend(['vision', 'hardRt', 'network'])[0].board).toBe('combo')
  })
})

describe('sanal terminal', () => {
  it('ls, cd, cat, pwd ve istem', () => {
    const st = initialState()
    expect(prompt(st)).toBe('pi@raspberrypi:~ $')
    expect(exec(st, 'ls').out[0]).toContain('blink.py')
    exec(st, 'cd robot')
    expect(exec(st, 'pwd').out).toEqual(['/home/pi/robot'])
    expect(exec(st, 'cat main.py').out[0]).toBe('from gpiozero import Robot')
    expect(exec(st, 'cd /nope').out[0]).toContain('No such file')
    exec(st, 'cd ..')
    expect(prompt(st)).toBe('pi@raspberrypi:~ $')
  })
  it('izinler: chmod +x, root dosyasına sudo olmadan yazılamaz', () => {
    const st = initialState()
    expect(exec(st, './start.sh').out[0]).toContain('Permission denied')
    exec(st, 'chmod +x start.sh')
    expect(exec(st, './start.sh').out[0]).toBe('starting robot')
    expect(exec(st, 'echo x > /etc/hostname').out[0]).toContain('Permission denied')
    expect(exec(st, 'sudo touch /etc/test').out).toEqual([])
    expect(applyChmod(0o644, '755')).toBe(0o755)
    expect(applyChmod(0o644, 'u+x')).toBe(0o744)
    expect(tokenize('echo "a b" c')).toEqual(['echo', 'a b', 'c'])
  })
  it('apt yalnız sudo ile; i2cdetect paket gelince çalışır', () => {
    const st = initialState()
    expect(exec(st, 'apt install i2c-tools').out[0]).toContain('Permission denied')
    expect(exec(st, 'i2cdetect -y 1').out[0]).toContain('command not found')
    exec(st, 'sudo apt update'); exec(st, 'sudo apt install i2c-tools')
    expect(exec(st, 'i2cdetect -y 1').out.join('\n')).toContain(' 3c')
    expect(i2cdetectLines([0x76])[8]).toContain('76')
  })
  it('systemd görev akışı: birim yaz → daemon-reload → enable → start', () => {
    const st = initialState()
    const tasks = TERM_TASKS.systemd
    expect(tasks.every((t) => !t.done(st))).toBe(true)
    expect(exec(st, 'sudo nano /etc/systemd/system/robot.service').edit).toBe('sudo:/etc/systemd/system/robot.service')
    expect(saveFile(st, '/etc/systemd/system/robot.service', SERVICE_UNIT, true)).toBeNull()
    expect(exec(st, 'sudo systemctl start robot').out[0]).toContain('daemon-reload')
    exec(st, 'sudo systemctl daemon-reload'); exec(st, 'sudo systemctl enable robot'); exec(st, 'sudo systemctl start robot')
    expect(exec(st, 'systemctl status robot').out.join('\n')).toContain('active (running)')
    expect(tasks.every((t) => t.done(st))).toBe(true)
  })
  it('linux görevleri tamamlanabilir; python benzetimi', () => {
    const st = initialState()
    for (const l of ['mkdir robot/logs', 'echo merhaba > robot/logs/ilk.txt', 'chmod +x start.sh', 'sudo apt install i2c-tools python3-opencv']) exec(st, l)
    expect(TERM_TASKS.linux.every((t) => t.done(st))).toBe(true)
    expect(getNode(st, '/home/pi/robot/logs/ilk.txt')).toBeTruthy()
    expect(exec(st, 'python3 blink.py').out[0]).toBe('LED GPIO17 blinking')
  })
})

describe('GPIO', () => {
  it('40 pin; BCM ↔ fiziksel', () => {
    expect(HEADER).toHaveLength(40)
    expect(physOf(17)).toBe(11)
    expect(physOf(18)).toBe(12)
  })
  it('kablolama denetimi', () => {
    expect(checkWiring('led', 2).severity).toBe('error') // 5 V
    expect(checkWiring('led', 11).severity).toBe('ok')
    expect(checkWiring('servo', 11).severity).toBe('warn')
    expect(checkWiring('servo', 12).severity).toBe('ok')
    expect(checkWiring('button', 3).severity).toBe('warn') // SDA
  })
  it('LED direnci, servo darbesi', () => {
    expect(ledResistor(2, 10)).toBeCloseTo(130)
    expect(ledCurrent(2, 330)).toBeCloseTo(3.94, 1)
    expect(servoPulseMs(0)).toBe(1.5)
    expect(dutyOf(1.5)).toBeCloseTo(0.075)
  })
  it('programlar: alarm düğmeyle kurulur, kaynakta pin numarası', () => {
    const m = newMem()
    expect(stepProgram('alarm', 0, false, m).led).toBe(0)
    expect(stepProgram('alarm', 0.1, true, m).led).toBe(1)
    expect(stepProgram('alarm', 0.2, false, m).led).toBe(1)
    expect(programSource('blink', { led: 11, button: 13, buzzer: 15, servo: 12 })).toContain('LED(17)')
  })
})

describe('sensör veri yolları', () => {
  it('DS18B20: CRC, w1_slave biçimi ve çözümleme', () => {
    expect(crc8([0x4b, 0x01, 0x4b, 0x46, 0x7f, 0xff, 0x05, 0x10])).toBe(0xe1)
    expect(parseW1Slave(makeW1Slave(20.6875)).tempC).toBeCloseTo(20.687)
    expect(parseW1Slave(makeW1Slave(-10.125)).tempC).toBeCloseTo(-10.125)
    expect(parseW1Slave(makeW1Slave(25, true))).toEqual({ crcOk: false, tempC: null })
    expect(decodeScratchpad([0x4b, 0x01, 0x4b, 0x46, 0x7f, 0xff, 0x05, 0x10, 0xe1]).tempC).toBeCloseTo(20.6875)
  })
  it('I²C adres çakışması; MCP3008 çerçevesi', () => {
    expect(i2cBus([{ id: 'mpu6050', alt: false }, { id: 'ds3231', alt: false }]).conflicts[0].addr).toBe(0x68)
    expect(i2cBus([{ id: 'mpu6050', alt: true }, { id: 'ds3231', alt: false }]).conflicts).toHaveLength(0)
    expect(mcp3008Tx(0)).toEqual([1, 0x80, 0])
    expect(mcp3008Decode(mcp3008Rx(adc10(1.65)))).toBe(512)
  })
})

describe('görüntü boru hattı', () => {
  it('HSV, maske, açma, ağırlık merkezi ve dönüş', () => {
    expect(rgbToHsv(255, 0, 0)).toEqual([0, 255, 255])
    expect(rgbToHsv(0, 0, 255)[0]).toBe(120)
    const f = synthFrame(80, 60, [{ x: 60, y: 30, r: 8, color: [220, 30, 30] }], 20, 3)
    const m = openMask(inRange(f, PRESETS.red), 80, 60)
    const c = centroid(m, 80)!
    expect(c.x).toBeCloseTo(60, 0)
    expect(steer(c, 80, 20).turn).toBeGreaterThan(0.3)
    expect(steer(null, 80, 20).seen).toBe(false)
  })
})

describe('motor ve hareket', () => {
  it('L298N doğruluk tablosu', () => {
    expect(l298n(true, false, 1).mode).toBe('forward')
    expect(l298n(true, true, 1).mode).toBe('brake')
    expect(l298n(true, false, 0).mode).toBe('coast')
    expect(l298n(false, true, 0.5).volts).toBe(-5)
  })
  it('motor modeli hedef hıza yaklaşır; enkoder yönü ve hata', () => {
    let rpm = 0
    for (let i = 0; i < 200; i++) rpm = motorStep(rpm, 10, 'forward', 0.01)
    expect(rpm).toBeCloseTo(150, 0)
    expect(quadStep(quadState(0), quadState(1))).toBe(1)
    expect(quadStep(quadState(1), quadState(0))).toBe(-1)
    expect(quadStep(0b00, 0b11)).toBe('error')
    expect(rpmFromTicks(70, 1400, 0.05)).toBeCloseTo(60)
  })
  it('PI denetimi hedefe oturur', () => {
    const st = { i: 0 }
    let rpm = 0
    for (let i = 0; i < 400; i++) { const u = piStep(st, 100, rpm, 0.01, 0.05, 0.01); rpm = motorStep(rpm, u * 10, 'forward', 0.01, 0.2) }
    expect(rpm).toBeGreaterThan(95); expect(rpm).toBeLessThan(105)
  })
  it('diferansiyel sürüş: ters kinematik ↔ ileri, tam yay; yerinde dönüş', () => {
    const w = wheelSpeeds(0.2, 1, 0.15)
    expect(bodyTwist(w.vl, w.vr, 0.15)).toEqual({ v: expect.closeTo(0.2), w: expect.closeTo(1) })
    let p = { x: 0, y: 0, th: 0 }
    for (let i = 0; i < 100; i++) p = integrate(p, (Math.PI * 0.5 - (Math.PI / 2) * 0.075) / 100, (Math.PI * 0.5 + (Math.PI / 2) * 0.075) / 100, 0.15)
    expect(p.th).toBeCloseTo(Math.PI / 2, 5)
    expect(p.x).toBeCloseTo(1 / 1, 1)
    const spin = integrate({ x: 0, y: 0, th: 0 }, -0.1, 0.1, 0.2)
    expect(spin.x).toBeCloseTo(0); expect(spin.th).toBeCloseTo(1)
    expect(arcade(1, 0, 0.3, 2)).toEqual({ v: 0.3, w: -0 })
  })
})

describe('Flask paneli', () => {
  it('yönlendirme, doğrulama, yetki ve bekçi', () => {
    const st = newRobot()
    expect(handle(st, { method: 'GET', path: '/api/status' }, 0).status).toBe(200)
    expect(handle(st, { method: 'GET', path: '/api/drive' }, 0).status).toBe(405)
    expect(handle(st, { method: 'POST', path: '/api/drive', body: { cmd: 'jump' } }, 0).status).toBe(400)
    expect(handle(st, { method: 'POST', path: '/api/drive', body: { cmd: 'forward', speed: 2 } }, 0).status).toBe(400)
    expect(handle(st, { method: 'POST', path: '/api/drive', body: { cmd: 'forward' } }, 0, 'tok').status).toBe(401)
    expect(handle(st, { method: 'POST', path: '/api/drive', body: { cmd: 'forward', speed: 0.8 }, token: 'tok' }, 0, 'tok').status).toBe(200)
    expect(cmdToWheels(st.cmd, st.speed)).toEqual([0.8, 0.8])
    expect(watchdog(st, 0.5, true)).toBe(false)
    expect(watchdog(st, 1.5, true)).toBe(true)
    expect(st.cmd).toBe('stop')
    expect(handle(st, { method: 'GET', path: '/x' }, 0).status).toBe(404)
  })
})

describe('ROS 2 grafiği', () => {
  it('mux olmadan /cmd_vel\'de iki yayıncı; mux ile sorun yok', () => {
    const noMux = graph(['camera', 'detector', 'follower', 'teleop', 'motor'])
    expect(noMux.issues.some((i) => i.kind === 'multi-publisher')).toBe(true)
    const full = graph(['camera', 'detector', 'follower', 'teleop', 'mux', 'motor'])
    expect(full.issues.filter((i) => i.kind !== 'no-subscriber')).toHaveLength(0)
    expect(graph(['follower', 'mux', 'motor']).issues.some((i) => i.kind === 'no-publisher' && i.topic === '/target')).toBe(true)
    expect(topicList(['camera'])).toEqual(['/image_raw', '/parameter_events', '/rosout'])
  })
})
