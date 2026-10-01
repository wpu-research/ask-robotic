import { createSim, Arena } from './harness.mjs'
import assert from 'node:assert/strict'
const ok = (n) => console.log('✓', n)
const lines = (s) => s.trim().split(/\r?\n/)
const M = { left: { en: 5, in1: 7, in2: 8 }, right: { en: 6, in1: 9, in2: 10 } }

// 1) İleri sürüş: PWM 200 ile 2 sn
let s = createSim(`
void setup(){ for(int p=5;p<=10;p++) pinMode(p,OUTPUT); digitalWrite(7,HIGH); digitalWrite(8,LOW); digitalWrite(9,HIGH); digitalWrite(10,LOW); analogWrite(5,200); analogWrite(6,200); }
void loop(){}`, { name: 'drive' })
let r = s.rover({ pose: { x: 0.3, y: 1, theta: 0 }, motors: M })
s.run(2000)
console.log('  x =', r.state.x.toFixed(3), 'y =', r.state.y.toFixed(3), 'yön°', r.headingDeg.toFixed(1), 'ωL', r.state.wL.toFixed(2))
assert.ok(r.state.x > 0.8 && Math.abs(r.state.y - 1) < 0.01)
ok('ileri sürüş')

// 2) Gerilim farkı: sağ motor yavaş → sola/sağa kavis
s = createSim(`void setup(){ for(int p=5;p<=10;p++) pinMode(p,OUTPUT); digitalWrite(7,HIGH); digitalWrite(9,HIGH); analogWrite(5,255); analogWrite(6,150);} void loop(){}`, { name: 'curve' })
r = s.rover({ pose: { x: 1, y: 1, theta: 0 }, motors: M }); s.run(1500)
console.log('  yön°', r.headingDeg.toFixed(1)); assert.ok(r.state.theta < -0.2) // sol hızlı, sağ yavaş → sağa (saat yönü, −) döner
ok('kavis')

// 3) Enkoder + kesme: ticks sayısı
s = createSim(`
volatile unsigned long sol=0, sag=0;
void ia(){ sol++; } void ib(){ sag++; }
void setup(){ Serial.begin(9600); for(int p=5;p<=10;p++) pinMode(p,OUTPUT); pinMode(2,INPUT); pinMode(3,INPUT);
  attachInterrupt(digitalPinToInterrupt(2), ia, RISING); attachInterrupt(digitalPinToInterrupt(3), ib, RISING);
  digitalWrite(7,HIGH); digitalWrite(9,HIGH); analogWrite(5,255); analogWrite(6,255); }
void loop(){ delay(1000); noInterrupts(); unsigned long a=sol,b=sag; interrupts(); Serial.print(a); Serial.print(" "); Serial.println(b); }`, { name: 'enc' })
r = s.rover({ pose: { x: 0.2, y: 1, theta: 0 }, motors: M, encoders: { left: 2, right: 3 } }); s.run(1200)
const [a, b] = lines(s.serial).at(-1).split(' ').map(Number)
console.log('  1 sn sonra sol/sağ tık:', a, b, ' (beklenen ≈ 20 yuva × ~1,9 devir)')
assert.ok(a > 25 && a < 50 && Math.abs(a - b) <= 1)
ok('enkoder + kesme')

// 4) Ultrasonik: duvara 1,0 m kala 80 cm civarı (merkez 0,06 öne)
s = createSim(`
const int TRIG=11, ECHO=12;
void setup(){ Serial.begin(9600); pinMode(TRIG,OUTPUT); pinMode(ECHO,INPUT); }
void loop(){ digitalWrite(TRIG,LOW); delayMicroseconds(2); digitalWrite(TRIG,HIGH); delayMicroseconds(10); digitalWrite(TRIG,LOW);
  long us=pulseIn(ECHO,HIGH,30000); Serial.println(us*0.0343/2.0); delay(100);}`, { name: 'us' })
r = s.rover({ arena: Arena.box(2, 2), pose: { x: 1, y: 1, theta: 0 }, motors: M, ultrasonic: { trig: 11, echo: 12 } })
s.run(500); const d = Number(lines(s.serial).at(-1)); console.log('  ölçülen', d, 'cm (gerçek 94)'); assert.ok(Math.abs(d - 94) < 2)
ok('ultrasonik')

// 5) Çizgi sensörü
s = createSim(`void setup(){ Serial.begin(9600);} void loop(){ Serial.println(analogRead(A0) > 512 ? "CIZGI" : "ZEMIN"); delay(100);}`, { name: 'line' })
const ar = Arena.box(2, 2).line([[0.2, 1], [1.8, 1]])
r = s.rover({ arena: ar, pose: { x: 1, y: 1, theta: 0 }, motors: M, lineSensors: [{ pin: 0, kind: 'analog', x: 0.07, y: 0 }] })
s.run(300); assert.match(lines(s.serial).at(-1), /CIZGI/)
r.state.y = 1.2; s.run(300); assert.match(lines(s.serial).at(-1), /ZEMIN/)
ok('çizgi sensörü')

// 6) Dengeleme: kontrolsüz düşer, PD ile ayakta kalır
const mkBal = (ctrl) => `
#include <Wire.h>
float kp=${ctrl.kp}, kd=${ctrl.kd};
float acilar(){ Wire.beginTransmission(0x68); Wire.write(0x3B); Wire.endTransmission(false); Wire.requestFrom(0x68,14,true);
  int16_t ax=Wire.read()<<8|Wire.read(); Wire.read();Wire.read(); int16_t az=Wire.read()<<8|Wire.read(); Wire.read();Wire.read();
  Wire.read();Wire.read(); int16_t gy=Wire.read()<<8|Wire.read(); return 0; }
void setup(){ Serial.begin(9600); Wire.begin(); Wire.beginTransmission(0x68); Wire.write(0x6B); Wire.write(0); Wire.endTransmission(true);
  for(int p=5;p<=10;p++) pinMode(p,OUTPUT); }
void loop(){
  Wire.beginTransmission(0x68); Wire.write(0x3B); Wire.endTransmission(false); Wire.requestFrom(0x68,14,true);
  int16_t ax=Wire.read()<<8|Wire.read(); Wire.read();Wire.read(); int16_t az=Wire.read()<<8|Wire.read(); Wire.read();Wire.read();
  Wire.read();Wire.read(); int16_t gy=Wire.read()<<8|Wire.read();
  float aci = atan2((float)ax,(float)az)*57.2958;   // derece, ileri eğim +
  float hiz = gy/131.0;                              // °/s
  float u = kp*aci + kd*hiz;                         // -1..1
  u = constrain(u, -1.0, 1.0);
  int pwm = (int)(fabs(u)*255);
  digitalWrite(7,u>=0); digitalWrite(8,u<0); digitalWrite(9,u>=0); digitalWrite(10,u<0);
  analogWrite(5,pwm); analogWrite(6,pwm);
  delay(5);
}`
s = createSim(mkBal({ kp: 0, kd: 0 }), { name: 'bal0' })
let bl = s.balancer({ motors: M }); s.run(3000)
console.log('  kontrolsüz: düştü mü', bl.state.fell, 'maks eğim', bl.state.maxAbsDeg.toFixed(1)); assert.ok(bl.state.fell)
s = createSim(mkBal({ kp: 0.15, kd: 0.02 }), { name: 'bal1' })
bl = s.balancer({ motors: M }); s.run(6000)
console.log('  PD: düştü mü', bl.state.fell, 'maks eğim', bl.state.maxAbsDeg.toFixed(1), 'son eğim', bl.thetaDeg.toFixed(2))
assert.ok(!bl.state.fell && Math.abs(bl.thetaDeg) < 2)
ok('denge')
