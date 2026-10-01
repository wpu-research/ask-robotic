import { createSim } from './harness.mjs'
import assert from 'node:assert/strict'
const ok = (n) => console.log('✓', n)
const lines = (s) => s.trim().split(/\r?\n/)

// 1) HC-SR04 (pulseIn)
let s = createSim(`
const int TRIG=9, ECHO=10;
void setup(){ Serial.begin(9600); pinMode(TRIG,OUTPUT); pinMode(ECHO,INPUT); }
void loop(){
  digitalWrite(TRIG,LOW); delayMicroseconds(2);
  digitalWrite(TRIG,HIGH); delayMicroseconds(10); digitalWrite(TRIG,LOW);
  long us = pulseIn(ECHO,HIGH,30000);
  Serial.println(us*0.0343/2.0);
  delay(100);
}`, { name: 'hcsr04' })
let u = s.hcsr04({ trig: 9, echo: 10, cm: 100 })
s.run(400); let v = Number(lines(s.serial).at(-1)); console.log('  100 cm →', v); assert.ok(Math.abs(v - 100) < 3)
u.cm = 25; s.serial=''; s.run(400); v = Number(lines(s.serial).at(-1)); console.log('  25 cm →', v); assert.ok(Math.abs(v - 25) < 2)
u.cm = 500; s.serial=''; s.run(400); v = Number(lines(s.serial).at(-1)); console.log('  menzil dışı →', v); assert.equal(v, 0)
ok('HC-SR04')

// 2) DHT22 + DHT11 (Adafruit kütüphanesi)
for (const type of ['DHT22', 'DHT11']) {
  s = createSim(`#include <DHT.h>
DHT dht(4, ${type});
void setup(){ Serial.begin(9600); dht.begin(); }
void loop(){ delay(2100); float h=dht.readHumidity(), t=dht.readTemperature(); if(isnan(h)||isnan(t)){Serial.println("hata");return;} Serial.print(t); Serial.print(" "); Serial.println(h); }`, { name: type.toLowerCase() })
  const d = s.dht({ pin: 4, type, tempC: 23.5, humidity: 61 })
  s.run(2600); console.log('  ', type, JSON.stringify(lines(s.serial).at(-1)))
  const [t, h] = lines(s.serial).at(-1).split(' ').map(Number)
  assert.ok(Math.abs(t - (type === 'DHT11' ? 24 : 23.5)) < 1.01, `t=${t}`); assert.ok(Math.abs(h - 61) < 1.01)
  d.tempC = 30; d.humidity = 40; s.serial = ''; s.run(2200)
  const [t2, h2] = lines(s.serial).at(-1).split(' ').map(Number); assert.ok(Math.abs(t2 - 30) < 1.01 && Math.abs(h2 - 40) < 1.01)
}
ok('DHT22 + DHT11')

// 3) BMP280 (Adafruit kütüphanesi)
s = createSim(`#include <Wire.h>
#include <Adafruit_BMP280.h>
Adafruit_BMP280 bmp;
void setup(){ Serial.begin(9600); if(!bmp.begin(0x76)){ Serial.println("YOK"); return;} }
void loop(){ Serial.print(bmp.readTemperature()); Serial.print(" "); Serial.println(bmp.readPressure()); delay(200); }`, { name: 'bmp' })
const b = s.bmp280({ tempC: 21.5, pressurePa: 100500 })
s.run(800); console.log('  ', JSON.stringify(lines(s.serial).at(-1)))
const [bt, bp] = lines(s.serial).at(-1).split(' ').map(Number); assert.ok(Math.abs(bt - 21.5) < 0.3 && Math.abs(bp - 100500) < 60, `${bt} ${bp}`)
ok('BMP280')

// 4) MPU6050 ham Wire
s = createSim(`#include <Wire.h>
void setup(){ Serial.begin(9600); Wire.begin(); Wire.beginTransmission(0x68); Wire.write(0x6B); Wire.write(0); Wire.endTransmission(true); }
void loop(){
  Wire.beginTransmission(0x68); Wire.write(0x3B); Wire.endTransmission(false);
  Wire.requestFrom(0x68, 14, true);
  int16_t ax=Wire.read()<<8|Wire.read(), ay=Wire.read()<<8|Wire.read(), az=Wire.read()<<8|Wire.read();
  Wire.read(); Wire.read();
  int16_t gx=Wire.read()<<8|Wire.read();
  Serial.print(ax/16384.0); Serial.print(" "); Serial.print(ay/16384.0); Serial.print(" "); Serial.print(az/16384.0); Serial.print(" "); Serial.println(gx/131.0);
  delay(100);
}`, { name: 'mpu' })
const m = s.mpu6050({ ax: 0.5, ay: -0.25, az: 0.8, gx: 12 })
s.run(500); console.log('  ', JSON.stringify(lines(s.serial).at(-1)))
const mv = lines(s.serial).at(-1).split(' ').map(Number)
assert.ok(Math.abs(mv[0] - 0.5) < 0.01 && Math.abs(mv[1] + 0.25) < 0.01 && Math.abs(mv[2] - 0.8) < 0.01 && Math.abs(mv[3] - 12) < 0.5)
ok('MPU6050')

// 5) DS3231 (RTClib)
s = createSim(`#include <Wire.h>
#include <RTClib.h>
RTC_DS3231 rtc;
void setup(){ Serial.begin(9600); if(!rtc.begin()){Serial.println("YOK");return;} }
void loop(){ DateTime n=rtc.now(); Serial.print(n.year()); Serial.print('-'); Serial.print(n.month()); Serial.print('-'); Serial.print(n.day()); Serial.print(' '); Serial.print(n.hour()); Serial.print(':'); Serial.print(n.minute()); Serial.print(':'); Serial.println(n.second()); delay(1000); }`, { name: 'rtc' })
s.rtc({ start: new Date(Date.UTC(2026, 5, 15, 13, 59, 58)) })
s.run(3500); console.log('  ', lines(s.serial).join(' | '))
assert.match(s.serial, /2026-6-15 13:59:58/); assert.match(s.serial, /2026-6-15 14:0:\d/)
ok('DS3231')

// 6) LCD paralel + I2C
s = createSim(`#include <LiquidCrystal.h>
LiquidCrystal lcd(12,11,5,4,3,2);
void setup(){ lcd.begin(16,2); lcd.print("Merhaba"); lcd.setCursor(0,1); lcd.print("Sicak: 25.5 C"); } void loop(){}`, { name: 'lcdp' })
let lcd = s.lcd({ rs: 12, en: 11, d4: 5, d5: 4, d6: 3, d7: 2 })
s.run(100); console.log('  ', JSON.stringify(lcd.text)); assert.deepEqual(lcd.text, ['Merhaba         ', 'Sicak: 25.5 C   '])
s = createSim(`#include <Wire.h>
#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27,16,2);
void setup(){ lcd.init(); lcd.backlight(); lcd.print("I2C LCD"); lcd.setCursor(2,1); lcd.print("calisiyor"); lcd.clear(); lcd.print("temiz"); } void loop(){}`, { name: 'lcdi2c' })
lcd = s.lcdI2C()
s.run(1600); console.log('  ', JSON.stringify(lcd.text), 'ışık', lcd.backlight); assert.equal(lcd.text[0].trim(), 'temiz'); assert.equal(lcd.text[1].trim(), ''); assert.ok(lcd.backlight)
ok('LCD paralel + I2C')

// 7) Keypad
s = createSim(`#include <Keypad.h>
byte R[4]={9,8,7,6}, C[4]={5,4,3,2};
char K[4][4]={{'1','2','3','A'},{'4','5','6','B'},{'7','8','9','C'},{'*','0','#','D'}};
Keypad kp = Keypad(makeKeymap(K), R, C, 4, 4);
void setup(){ Serial.begin(9600); }
void loop(){ char k=kp.getKey(); if(k) Serial.println(k); }`, { name: 'kp' })
const kp = s.keypad({ rows: [9, 8, 7, 6], cols: [5, 4, 3, 2] })
s.run(100); kp.press('5'); s.run(200); kp.release(); s.run(100); kp.press('#'); s.run(200); kp.release(); s.run(100)
console.log('  ', JSON.stringify(s.serial)); assert.equal(s.serial.replace(/\r?\n/g, ''), '5#')
ok('Keypad')

// 8) I2C tarama
s = createSim(`#include <Wire.h>
void setup(){ Serial.begin(9600); Wire.begin(); for(byte a=1;a<127;a++){ Wire.beginTransmission(a); if(Wire.endTransmission()==0){ Serial.println(a,HEX);} } } void loop(){}`, { name: 'scan' })
s.bmp280({}); s.lcdI2C()
s.run(300); console.log('  ', lines(s.serial).join(',')); assert.deepEqual(lines(s.serial), ['27', '76'])
ok('I2C tarama')
