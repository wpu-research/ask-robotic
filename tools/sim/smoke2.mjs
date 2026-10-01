import { createSim } from './harness.mjs'
import assert from 'node:assert/strict'

// 1) INPUT_PULLUP buton + LED
let s = createSim(`
void setup(){ pinMode(2, INPUT_PULLUP); pinMode(13, OUTPUT); }
void loop(){ digitalWrite(13, digitalRead(2)==LOW ? HIGH : LOW); }`, { name: 'btn' })
s.run(20); assert.equal(s.read(13), false)
s.drive(2, false); s.run(20); assert.equal(s.read(13), true)   // basılı = LOW
s.drive(2, true); s.run(20); assert.equal(s.read(13), false)
console.log('buton ok')

// 2) analogRead → Serial
s = createSim(`
void setup(){ Serial.begin(9600); }
void loop(){ Serial.println(analogRead(A0)); delay(100); }`, { name: 'adc' })
s.analog(0, 2.5); s.run(350)
console.log('adc seri:', JSON.stringify(s.serial.trim().split(/\r?\n/).slice(-2)))
assert.ok(Math.abs(Number(s.serial.trim().split(/\r?\n/).at(-1)) - 512) <= 2)

// 3) PWM doluluk (pin 9 → ~%50)
s = createSim(`void setup(){ pinMode(9,OUTPUT); analogWrite(9,128);} void loop(){}`, { name: 'pwm' })
s.run(200); const w = s.wave(9, 20, 200)
console.log('pwm', w.hz.toFixed(0), 'Hz', (w.duty*100).toFixed(0)+'%'); assert.ok(Math.abs(w.duty - 0.5) < 0.03)

// 4) tone 440 Hz
s = createSim(`void setup(){ tone(8,440);} void loop(){}`, { name: 'tone' })
s.run(300); const t = s.wave(8, 50, 300); console.log('tone', t.hz.toFixed(1), 'Hz'); assert.ok(Math.abs(t.hz - 440) < 8)

// 5) Servo 90° → ~1500 µs
s = createSim(`#include <Servo.h>
Servo sv; void setup(){ sv.attach(9); sv.write(90);} void loop(){}`, { name: 'servo' })
s.run(120); const p = s.pulseWidthsUs(9, 20, 120); console.log('servo darbe µs', p.slice(0,3).map(x=>x.toFixed(0)))
assert.ok(Math.abs(p[0] - 1500) < 60)

// 6) Seri giriş
s = createSim(`void setup(){ Serial.begin(9600);} void loop(){ if(Serial.available()){ char c=Serial.read(); Serial.print("al:"); Serial.println(c);} }`, { name: 'rx' })
s.run(20); s.sendSerial('x'); s.run(50); console.log('rx', JSON.stringify(s.serial)); assert.match(s.serial, /al:x/)

// 7) EEPROM
s = createSim(`#include <EEPROM.h>
void setup(){ Serial.begin(9600); EEPROM.write(5, 42); Serial.println(EEPROM.read(5)); } void loop(){}`, { name: 'eep' })
s.run(100); console.log('eeprom', JSON.stringify(s.serial.trim()), 'bellek[5]=', s.eeprom.backend?.memory?.[5]); assert.match(s.serial, /42/)

// 8) millis ve LiquidCrystal derlenir mi
import { assertCompiles } from './harness.mjs'
assertCompiles(`#include <LiquidCrystal.h>
LiquidCrystal lcd(12,11,5,4,3,2); void setup(){ lcd.begin(16,2); lcd.print("merhaba"); } void loop(){}`, { name: 'lcd' })
assertCompiles(`#include <Wire.h>
#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27,16,2); void setup(){ lcd.init(); lcd.backlight(); lcd.print("hi"); } void loop(){}`, { name: 'lcdi2c' })
console.log('lcd derleme ok')
