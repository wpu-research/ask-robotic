import { createSim } from './harness.mjs'
import assert from 'node:assert/strict'
const M = { left: { en: 5, in1: 7, in2: 8 }, right: { en: 6, in1: 9, in2: 10 } }
const s = createSim(`#include <Wire.h>
void setup(){ Serial.begin(9600); Wire.begin(); Wire.beginTransmission(0x68); Wire.write(0x6B); Wire.write(0); Wire.endTransmission(true);
  for(int p=5;p<=10;p++) pinMode(p,OUTPUT); digitalWrite(7,LOW); digitalWrite(8,HIGH); digitalWrite(9,HIGH); digitalWrite(10,LOW); analogWrite(5,255); analogWrite(6,255); }
void loop(){ Wire.beginTransmission(0x68); Wire.write(0x47); Wire.endTransmission(false); Wire.requestFrom(0x68,2,true);
  int16_t gz=Wire.read()<<8|Wire.read(); Serial.println(gz/131.0); delay(200); }`, { name: 'imuspin' })
const r = s.rover({ pose: { x: 1, y: 1, theta: 0 }, motors: M, imu: true, gyroBiasDps: 1.5 })
s.run(2000)
const gz = Number(s.serial.trim().split(/\r?\n/).at(-1))
// sol geri, sağ ileri → yerinde sola dönüş: ω = r(wR−wL)/L = 0.033·(2·12)/0.12 = 6.6 rad/s ≈ 378 °/s (+1.5 sapma) ama ±250 °/s tam ölçekte doyar
console.log('gz (°/s, ±250 doygun):', gz, ' gerçek ω °/s:', ((r.state.wR - r.state.wL) * 0.033 / 0.12 * 180 / Math.PI).toFixed(0))
assert.ok(gz > 240)
console.log('✓ IMU yaw hızı (doygunluk dahil)')
