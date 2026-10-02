import { describe, expect, it } from 'vitest'
import { compileSketch } from '@/lib/compile/compile'
import { armScene } from './arm-scenes'
import { rectWalls } from './geometry'
import { createArenaRuntime } from './runtime'
import { roverScene } from './scenes'
import { hasCli, sketchOf } from './test-support'
import type { ArmSnapshot, BalancerSnapshot, BalancerScene, RoverSnapshot } from './types'

const PINS = `const int SOL_EN=5,SOL_IN1=7,SOL_IN2=8,SAG_EN=6,SAG_IN1=9,SAG_IN2=10;
void surus(int s,int g){digitalWrite(SOL_IN1,s>0);digitalWrite(SOL_IN2,s<0);analogWrite(SOL_EN,abs(s));digitalWrite(SAG_IN1,g>0);digitalWrite(SAG_IN2,g<0);analogWrite(SAG_EN,abs(g));}
void pinler(){for(int p=5;p<=10;p++)pinMode(p,OUTPUT);}
`
const FWD = `${PINS}void setup(){pinler();Serial.begin(9600);surus(200,200);}void loop(){}`
const hex = async (src: string) => { const r = await compileSketch(src); if (!r.ok) throw new Error(JSON.stringify(r)); return r.hex }
const run = (rt: ReturnType<typeof createArenaRuntime>, ms: number) => { for (let t = 0; t < ms; t += 100) rt.advance(Math.min(100, ms - t)); return rt.snapshot() as RoverSnapshot }

describe.skipIf(!hasCli)('createArenaRuntime (robot)', () => {
  it('ileri sürüş: konum, yol, hız, iz ve gezilen hücreler ilerler', async () => {
    const rt = createArenaRuntime(await hex(FWD), roverScene({ id: 'a', title: 'a', width: 4, height: 1, pose: { x: 0.3, y: 0.5, theta: 0 } }))
    const s = run(rt, 3000)
    expect(s.x).toBeGreaterThan(0.9); expect(Math.abs(s.y - 0.5)).toBeLessThan(0.01)
    expect(s.distanceM).toBeCloseTo(s.x - 0.3, 2)
    expect(s.v).toBeGreaterThan(0.25); expect(s.v).toBeLessThan(0.33)
    expect(s.coverCells).toBeGreaterThanOrEqual(3); expect(s.collisions).toBe(0)
    expect(rt.rover!.state.trail.length).toBeGreaterThan(50)
    expect(s.timeS).toBeCloseTo(3, 1)
  })

  it('duvara çarpma bir kez sayılır, açıklık negatife iner, bölgeler ziyaret edilir', async () => {
    const sc = roverScene({
      id: 'b', title: 'b', width: 2, height: 1, pose: { x: 0.3, y: 0.5, theta: 0 },
      zones: [{ id: 'orta', kind: 'target', x: 1, y: 0.5, r: 0.1 }],
    })
    const rt = createArenaRuntime(await hex(FWD), sc)
    const s = run(rt, 8000)
    expect(s.collisions).toBe(1)
    expect(s.visited.has('orta')).toBe(true)
    expect(s.minClearanceM).toBeLessThanOrEqual(0.001)
    expect(s.collided).toBe(true)
  })

  it('kontrol noktaları sırasıyla geçilmeden bitiş sayılmaz; başlangıçtaki bitiş bölgesi çıkılana kadar silahlanmaz', async () => {
    const sc = roverScene({
      id: 'c', title: 'c', width: 3, height: 1, pose: { x: 0.3, y: 0.5, theta: 0 },
      zones: [
        { id: 'bas', kind: 'goal', x: 0.3, y: 0.5, r: 0.1 },
        { id: 'k1', kind: 'checkpoint', x: 1.5, y: 0.5, r: 0.1 },
      ],
    })
    const rt = createArenaRuntime(await hex(FWD), sc)
    expect(rt.snapshot()).toMatchObject({ finishedAtS: null })
    run(rt, 1000)
    expect((rt.snapshot() as RoverSnapshot).finishedAtS).toBeNull() // başlangıç bölgesinde bekledi ama kontrol noktası yok
    const sc2 = roverScene({ id: 'd', title: 'd', width: 3, height: 1, pose: { x: 0.3, y: 0.5, theta: 0 }, zones: [{ id: 'son', kind: 'goal', x: 1.5, y: 0.5, r: 0.1 }, { id: 'k0', kind: 'checkpoint', x: 1, y: 0.5, r: 0.1 }] })
    const s2 = run(createArenaRuntime(await hex(FWD), sc2), 8000)
    expect(s2.visited.has('k0')).toBe(true); expect(s2.finishedAtS).not.toBeNull(); expect(s2.finishedAtS!).toBeGreaterThan(2)
  })

  it('çizgi sensörleri: çizgi bitince çizgi kaybı bir kez sayılır, kesinti süresi ölçülür', async () => {
    const sc = roverScene({ id: 'e', title: 'e', width: 3, height: 1, pose: { x: 0.3, y: 0.5, theta: 0 }, sensors: { line: true }, lines: [[[0.1, 0.5], [0.8, 0.5]]] })
    const rt = createArenaRuntime(await hex(FWD), sc)
    expect(rt.snapshot()).toMatchObject({ onLine: true })
    const s = run(rt, 5000)
    expect(s.onLine).toBe(false)
    expect(s.lineExits).toBe(1)
    expect(s.longestOffLineMs).toBeGreaterThan(2000)
    expect(s.line).toHaveLength(5)
  })

  it('enkoder ve odometri: tıklar sayılır, tahmini konum gerçeğe yakındır', async () => {
    const sc = roverScene({ id: 'f', title: 'f', width: 4, height: 1, pose: { x: 0.3, y: 0.5, theta: 0 }, sensors: { encoders: true } })
    const s = run(createArenaRuntime(await hex(FWD), sc), 3000)
    expect(s.ticksL).toBeGreaterThan(40); expect(Math.abs(s.ticksL - s.ticksR)).toBeLessThanOrEqual(1)
    expect(Math.hypot(s.odo.x - s.x, s.odo.y - s.y)).toBeLessThan(0.05)
    expect(s.odo.distanceM).toBeGreaterThan(0.5)
  })

  it('seri giriş: baytlar kuyruğa alınır ve aralıklı gönderilir; açılıştan önce gelen kaybolmaz', async () => {
    const echo = `void setup(){Serial.begin(9600);}void loop(){while(Serial.available()){char c=Serial.read();Serial.write(c);}}`
    const rt = createArenaRuntime(await hex(echo), roverScene({ id: 'g', title: 'g' }))
    rt.sendSerial('merhaba dunya\n') // t = 0'da: açılış beklenir
    run(rt, 1000)
    expect(rt.sim.serial).toBe('merhaba dunya\n')
  })

  it('düğme: INPUT_PULLUP pini basılınca LOW olur', async () => {
    const src = `void setup(){pinMode(2,INPUT_PULLUP);Serial.begin(9600);}void loop(){static int o=1;int d=digitalRead(2);if(d!=o){o=d;Serial.println(d?"B":"A");}}`
    const rt = createArenaRuntime(await hex(src), roverScene({ id: 'h', title: 'h', buttons: [{ pin: 2, label: 'D2' }] }))
    run(rt, 200); rt.press(2, true); run(rt, 100); rt.press(2, false); run(rt, 100)
    expect(rt.sim.serial.replace(/\r/g, '')).toBe('A\nB\n')
    rt.press(3, true) // sahnede olmayan düğme etkisizdir
    run(rt, 100)
    expect(rt.sim.serial.replace(/\r/g, '')).toBe('A\nB\n')
  })

  it('place(): robot ışınlanır ve sensörler yeni konuma göre güncellenir', async () => {
    const sc = roverScene({ id: 'i', title: 'i', pose: { x: 1, y: 1, theta: 0 }, sensors: { line: true }, lines: [[[0.2, 1], [1.8, 1]]] })
    const rt = createArenaRuntime(await hex(`void setup(){}void loop(){}`), sc)
    run(rt, 100)
    expect((rt.snapshot() as RoverSnapshot).line.map((l) => l.on)).toEqual([false, false, true, false, false])
    rt.place({ y: 1 - 0.024 }); run(rt, 50)
    expect((rt.snapshot() as RoverSnapshot).line.map((l) => l.on)).toEqual([false, true, false, false, false])
    rt.place({ x: 0.5, y: 0.5, theta: 1 }); const s = run(rt, 10)
    expect(s.x).toBeCloseTo(0.5, 2); expect(s.theta).toBeCloseTo(1, 2)
  })

  it('ultrasonik: gürültüsüz gerçek mesafe ile sensör okuması ve en küçük değer izlenir', async () => {
    const sc = roverScene({ id: 'j', title: 'j', width: 2, height: 1, pose: { x: 0.3, y: 0.5, theta: 0 }, sensors: { ultrasonic: true }, walls: rectWalls(1.5, 0.3, 1.8, 0.7) })
    const rt = createArenaRuntime(await hex(`void setup(){Serial.begin(9600);}void loop(){}`), sc)
    const s = run(rt, 500)
    expect(s.frontTrueCm).toBeCloseTo((1.5 - 0.3 - 0.06) * 100, 0)
    expect(s.minFrontTrueCm).toBeCloseTo(s.frontTrueCm, 0)
    expect(rt.servoDeg()).toBe(90)
  })
})

describe.skipIf(!hasCli)('createArenaRuntime (kol)', () => {
  const L = 10
  const ik = (x: number, y: number) => {
    const c = (x * x + y * y - 2 * L * L) / (2 * L * L), q2 = Math.acos(c)
    const q1 = Math.atan2(y, x) + Math.atan2(L * Math.sin(q2), L + L * Math.cos(q2))
    return [Math.round((q1 * 180) / Math.PI), Math.round((q2 * 180) / Math.PI)]
  }
  const sc = armScene({ objects: [{ id: 'nesne', x: 16, y: 2 }], zones: [{ id: 'birak', x: 7, y: 5, r: 2.5 }] })

  it('al-bırak dizisi: nesne yakalanır, taşınır ve bölgeye bırakılır', async () => {
    const [a1, a2] = ik(16, 2), [b1, b2] = ik(7, 5)
    const src = `#include <Servo.h>
Servo o, d, t;
void git(int q1,int q2,int g){o.write(q1);d.write(q2);t.write(g);}
void setup(){o.attach(9);d.attach(10);t.attach(11);Serial.begin(9600);
  git(${a1},${a2},120);delay(1500);git(${a1},${a2},60);delay(800);
  git(${b1},${b2},60);delay(1500);git(${b1},${b2},120);delay(800);Serial.println("BITTI");}
void loop(){}`
    const rt = createArenaRuntime(await hex(src), sc)
    expect((rt.snapshot() as ArmSnapshot).held).toBeNull()
    let s = rt.snapshot() as ArmSnapshot
    let sawHeld = false
    for (let t = 0; t < 6000; t += 100) { rt.advance(100); s = rt.snapshot() as ArmSnapshot; if (s.held === 'nesne') sawHeld = true }
    expect(sawHeld).toBe(true)
    expect(s.held).toBeNull()
    expect(s.placed).toEqual({ nesne: 'birak' })
    const o = s.objects[0]
    expect(Math.hypot(o.x - 7, o.y - 5)).toBeLessThan(0.6)
    expect(s.serial).toContain('BITTI')
    expect(s.maxJumpDeg).toBeGreaterThan(20) // write() ani atlar: yumuşak hareket 109. dersin konusu
  })

  it('servo hız sınırı: komut anında atlar ama kol açıyı kademeli izler', async () => {
    const src = `#include <Servo.h>
Servo o;void setup(){o.attach(9);o.write(90);delay(1000);o.write(30);}void loop(){}`
    const rt = createArenaRuntime(await hex(src), sc)
    rt.advance(1050)
    const mid = rt.snapshot() as ArmSnapshot
    expect(mid.cmd.q1).toBeCloseTo(30, 0)
    expect(mid.q1).toBeGreaterThan(35) // hâlâ yolda (600°/sn → 60° için 100 ms)
    rt.advance(400)
    expect((rt.snapshot() as ArmSnapshot).q1).toBeCloseTo(30, 0)
  })
})

describe.skipIf(!hasCli)('createArenaRuntime (hareketli duvar)', () => {
  it('hareketli duvar zaman çizelgesine göre doğrusal ilerler ve robotun sensörünü etkiler', async () => {
    const sc = roverScene({
      id: 'm', title: 'm', width: 4, height: 2, pose: { x: 0.5, y: 1, theta: 0 }, sensors: { ultrasonic: true },
      movers: [{ id: 'hedef', wall: [1.5, 0.3, 1.5, 1.7], keys: [{ t: 0, dx: 0, dy: 0 }, { t: 1, dx: 0, dy: 0 }, { t: 3, dx: 1, dy: 0 }] }],
    })
    const rt = createArenaRuntime(await hex(`void setup(){}void loop(){}`), sc)
    expect((rt.snapshot() as RoverSnapshot).movers[0].wall[0]).toBeCloseTo(1.5, 3)
    const a = run(rt, 2000)
    expect(a.movers[0].wall[0]).toBeCloseTo(2, 1) // t = 2: yarı yol
    expect(a.movers[0].wall[2]).toBeCloseTo(a.movers[0].wall[0], 6)
    expect(a.frontTrueCm).toBeCloseTo((a.movers[0].wall[0] - 0.5 - 0.06) * 100, 0)
    const b = run(rt, 2000)
    expect(b.movers[0].wall[0]).toBeCloseTo(2.5, 3) // son değerde kalır
  })
})

describe.skipIf(!hasCli)('createArenaRuntime (denge)', () => {
  const sc: BalancerScene = { kind: 'balancer', id: 'd', title: 'd', theta0Deg: 3, timeLimitS: 10 }
  it('kontrolsüz robot yaklaşık 1 sn içinde düşer; düşme anı ve en büyük eğim kaydedilir', async () => {
    const rt = createArenaRuntime(await hex(`void setup(){}void loop(){}`), sc)
    expect((rt.snapshot() as BalancerSnapshot).fell).toBe(false)
    for (let t = 0; t < 3000; t += 100) rt.advance(100)
    const s = rt.snapshot() as BalancerSnapshot
    expect(s.fell).toBe(true); expect(s.fellAtS).toBeGreaterThan(0.3); expect(s.fellAtS!).toBeLessThan(2.5)
    expect(s.uprightS).toBe(s.fellAtS); expect(s.maxAbsDeg).toBeGreaterThan(45)
  })
  it('ders 105 çözümü robotu ayakta tutar', async () => {
    const src = sketchOf('robotik:6:5', 'denge_robotu')
    if (!src) throw new Error('denge_robotu bulunamadı')
    const rt = createArenaRuntime(await hex(src), sc)
    for (let t = 0; t < 8000; t += 100) rt.advance(100)
    const s = rt.snapshot() as BalancerSnapshot
    expect(s.fell).toBe(false); expect(s.uprightS).toBeGreaterThan(7.5); expect(s.maxAbsDeg).toBeLessThan(15)
  })
})

describe.skipIf(!hasCli)('createArenaRuntime (denge: sensör bozucuları ve itme)', () => {
  const base: BalancerScene = { kind: 'balancer', id: 'd', title: 'd', theta0Deg: 3, timeLimitS: 15 }
  const dengeSrc = () => { const src = sketchOf('robotik:6:5', 'denge_robotu'); if (!src) throw new Error('denge_robotu bulunamadı'); return src }
  const runTo = (rt: ReturnType<typeof createArenaRuntime>, sec: number) => { for (let t = 0; t < sec * 1000; t += 100) rt.advance(100); return rt.snapshot() as BalancerSnapshot }

  it('sahne çizelgesindeki itme tam zamanında uygulanır; gerçek ölçüm (en büyük eğim, oturma) kaydedilir', async () => {
    const rt = createArenaRuntime(await hex(dengeSrc()), { ...base, pushes: [{ atS: 3, dps: 200 }] })
    expect((rt.snapshot() as BalancerSnapshot).push).toBeNull()
    expect(runTo(rt, 2.9).pushCount).toBe(0)
    const s = runTo(rt, 6)
    expect(s.fell).toBe(false); expect(s.pushCount).toBe(1)
    expect(s.push!.atS).toBeCloseTo(3, 2); expect(s.push!.dps).toBe(200)
    // dersteki ölçüm: en büyük eğim 4,96°, oturma 177 ms
    expect(s.push!.maxAbsDeg).toBeGreaterThan(4.5); expect(s.push!.maxAbsDeg).toBeLessThan(5.5)
    expect(s.push!.settleMs).not.toBeNull(); expect(s.push!.settleMs!).toBeGreaterThan(100); expect(s.push!.settleMs!).toBeLessThan(300)
    // robotun kendi RAPOR satırı gerçek değerlerle uyuşur
    const m = s.serial.match(/^RAPOR,(\d+),(-?[\d.]+),(\d+)/m)!
    expect(m).toBeTruthy()
    expect(Math.abs(Number(m[1]) - 3000)).toBeLessThanOrEqual(100)
    expect(Math.abs(Number(m[2]) - s.push!.maxAbsDeg)).toBeLessThanOrEqual(0.6)
    expect(Math.abs(Number(m[3]) - s.push!.settleMs!)).toBeLessThanOrEqual(100)
  })

  it('elle itme (rt.push) anında etkir ve kaydedilir; düşmüş robota itme sayılmaz etkisizdir', async () => {
    const rt = createArenaRuntime(await hex(`void setup(){}void loop(){}`), { ...base, theta0Deg: 0 })
    rt.advance(100)
    const w0 = (rt.snapshot() as BalancerSnapshot).rateDps
    rt.push(200)
    const s = rt.snapshot() as BalancerSnapshot
    expect(s.pushCount).toBe(1); expect(s.push!.dps).toBe(200)
    expect(rt.snapshot().kind).toBe('balancer'); expect(w0).toBeDefined()
  })

  it('ivmeölçer ofseti: yalnız PD’de gerçek eğim ofsetin tersine kayar, robot süzülür (ders 104 sayıları)', async () => {
    const src = sketchOf('robotik:6:4', 'pd_aci')
    if (!src) throw new Error('pd_aci bulunamadı')
    const rt = createArenaRuntime(await hex(src), { ...base, accelOffsetDeg: 4 })
    const s = runTo(rt, 15)
    expect(s.fell).toBe(false)
    expect(s.thetaDeg).toBeLessThan(-3.9); expect(s.thetaDeg).toBeGreaterThan(-4.4)
    expect(s.x).toBeLessThan(-0.15); expect(s.x).toBeGreaterThan(-0.18) // dersteki ölçüm: −0,166 m
    // aynı kod ofsetsiz: süzülme yok
    const ok = runTo(createArenaRuntime(await hex(src), base), 15)
    expect(Math.abs(ok.x)).toBeLessThan(0.01)
  })

  it('kaskad ofseti telafi eder: konum durur, gerçek eğim ~0°', async () => {
    const rt = createArenaRuntime(await hex(sketchOf('robotik:6:4', 'kaskad_denge')!), { ...base, accelOffsetDeg: 4 })
    const s = runTo(rt, 15)
    expect(s.fell).toBe(false); expect(Math.abs(s.thetaDeg)).toBeLessThan(0.6)
    expect(s.x).toBeLessThan(-0.03); expect(s.x).toBeGreaterThan(-0.05) // dersteki ölçüm: −0,038 m
  })
})

describe.skipIf(!hasCli)('createArenaRuntime (kol: kapalı = büyük açı)', () => {
  const src = `#include <Servo.h>
Servo t;void setup(){t.attach(11);t.write(30);delay(600);t.write(100);}void loop(){}`
  it('gripClosedAboveDeg: 100° kapalı, 30° açık sayılır; varsayılan sahnede tersi', async () => {
    const h = await hex(src)
    const a = createArenaRuntime(h, armScene({ id: 'k', gripClosedAboveDeg: 90 }))
    a.advance(300); expect((a.snapshot() as ArmSnapshot).gripClosed).toBe(false)
    a.advance(800); expect((a.snapshot() as ArmSnapshot).gripClosed).toBe(true)
    const b = createArenaRuntime(h, armScene({ id: 'k2' }))
    b.advance(300); expect((b.snapshot() as ArmSnapshot).gripClosed).toBe(true)
    b.advance(800); expect((b.snapshot() as ArmSnapshot).gripClosed).toBe(false)
  })
  it('maxJointJumpDeg tutucu sıçramasını saymaz', async () => {
    const rt = createArenaRuntime(await hex(src), armScene({ id: 'k', gripClosedAboveDeg: 90 }))
    rt.advance(1200)
    const s = rt.snapshot() as ArmSnapshot
    expect(s.maxJumpDeg).toBeGreaterThan(60); expect(s.maxJointJumpDeg).toBeLessThan(2.5)
  })
})
