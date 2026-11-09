import type { ExamGoalCtx, ExamProject, ExamScenario } from '../types'
import { build, codeHas, ledOnPin, part, partsOf, pin, skeleton, switchOnPin, to5V, toGnd, toUno, unoOnly } from './helpers'

/** Sınav projeleri, grup B (p10-p17): 3.-4. hafta, kesmeler, zamanlayıcılar, sensörler ve filtreleme. */

// ---------------------------------------------------------------- ortak yardımcılar
type Part = ReturnType<typeof part>
type Wires = Array<[string, string]>

/** D<pin> → direnç → LED A, LED K → GND; parça ve kablo listelerine ekler. */
const addLed = (parts: Part[], wires: Wires, id: string, unoPin: string, x: number, y: number, color = 'red') => {
  parts.push(part(`r_${id}`, 'resistor', x, y, { ohms: 330 }), part(id, 'led', x + 110, y, { color }))
  wires.push(['uno.' + unoPin, `r_${id}.1`], [`r_${id}.2`, `${id}.A`], [`${id}.K`, 'uno.GND'])
}
/** Aktif buzzer: + ucu Uno pinine, - ucu GND. */
const addBuzzer = (parts: Part[], wires: Wires, id: string, unoPin: string, x: number, y: number) => {
  parts.push(part(id, 'buzzer', x, y, { kind: 'active' }))
  wires.push(['uno.' + unoPin, `${id}.+`], [`${id}.-`, 'uno.GND'])
}
const power = (id: string, wires: Wires) => wires.push([`${id}.VCC`, 'uno.5V'], [`${id}.GND`, 'uno.GND'])

const hcsrOk = (ctx: ExamGoalCtx) =>
  partsOf(ctx.circuit, 'hcsr04').some((h) => to5V(ctx, h.id, 'VCC') && toGnd(ctx, h.id, 'GND') && toUno(ctx, h.id, 'TRIG', 'D9') && toUno(ctx, h.id, 'ECHO', 'D10'))
const buzzerOn = (ctx: ExamGoalCtx, unoPin: string) =>
  partsOf(ctx.circuit, 'buzzer').some((b) => toUno(ctx, b.id, '+', unoPin) && toGnd(ctx, b.id, '-'))
const relayOk = (ctx: ExamGoalCtx, unoPin: string) =>
  partsOf(ctx.circuit, 'relay').some((k) => to5V(ctx, k.id, 'VCC') && toGnd(ctx, k.id, 'GND') && toUno(ctx, k.id, 'IN', unoPin))

const high = (s: ExamScenario, p: string) => !!s.state.pins[p]?.high
/** ms boyunca 20 ms adımlarla ilerletir; koşulun bir an bile / her an doğru olup olmadığını döndürür. */
const watch = (s: ExamScenario, ms: number, f: () => boolean) => {
  let any = false, all = true
  for (let t = 0; t < ms; t += 20) { s.advance(20); const v = f(); any ||= v; all &&= v }
  return { any, all }
}
const relayEnergized = (s: ExamScenario) => s.idsOf('relay').some((id) => !!s.state.parts[id]?.relay?.energized)
const press = (s: ExamScenario, type: 'button' | 'joystick' | 'encoder', prop: string, ms = 150) => {
  s.setAll(type, prop, true); s.advance(ms); s.setAll(type, prop, false)
}
const count = (text: string, re: RegExp) => (text.match(re) ?? []).length
const num = (v: string | undefined) => (v === undefined ? NaN : Number(v))

// ================================================================ p10: Parking Assist Robot
const p10Wires = (): [Part[], Wires] => {
  const parts: Part[] = [part('us', 'hcsr04', 400, 40, { distanceCm: 100 })]
  const wires: Wires = [['us.VCC', 'uno.5V'], ['us.GND', 'uno.GND'], ['us.TRIG', 'uno.D9'], ['us.ECHO', 'uno.D10']]
  addLed(parts, wires, 'g', 'D4', 400, 200, 'green')
  addLed(parts, wires, 'y', 'D5', 400, 270, 'yellow')
  addLed(parts, wires, 'r', 'D6', 400, 340, 'red')
  addBuzzer(parts, wires, 'bz', 'D8', 400, 420)
  return [parts, wires]
}

const p10: ExamProject = {
  id: 'p10',
  title: 'Parking Assist Robot',
  story: 'A small robot backs into a garage. Its rear ultrasonic sensor tells the driver how close the wall is with coloured LEDs and a warning buzzer.',
  brief: [
    'Build a distance-zone parking assistant.',
    '',
    'Circuit:',
    '- HC-SR04: VCC to 5V, GND to GND, TRIG to D9, ECHO to D10.',
    '- Green LED on D4, yellow LED on D5, red LED on D6 (each through a series resistor, cathode to GND).',
    '- Buzzer: + to D8, - to GND.',
    '',
    'Behaviour (measure the distance in cm, at least every 200 ms):',
    '- Distance more than 50 cm: only the green LED is on.',
    '- Distance from 20 cm to 50 cm: only the yellow LED is on.',
    '- Distance less than 20 cm: only the red LED is on and the buzzer (D8) is on.',
    '- If no echo comes back (pulseIn returns 0) treat the obstacle as far away (green).',
    '- Read the echo with pulseIn() and a timeout (third argument) so the loop never hangs.',
    '- Print every measurement on Serial at 9600 baud as: Distance: <cm> cm   (for example "Distance: 35 cm").',
  ].join('\n'),
  weeks: [3, 4],
  allowedParts: ['hcsr04', 'led', 'resistor', 'buzzer', 'rgbled', 'button'],
  starter: () => ({ circuit: unoOnly(), code: skeleton('Parking Assist Robot') }),
  goals: [
    { id: 'sensor', kind: 'circuit', points: 14, text: 'HC-SR04 is powered (5V, GND) with TRIG on D9 and ECHO on D10.', check: hcsrOk },
    {
      id: 'leds', kind: 'circuit', points: 16,
      text: 'A green LED on D4, a yellow LED on D5 and a red LED on D6, each through a series resistor to GND.',
      check: (ctx) => ledOnPin(ctx, 'D4', 'green') && ledOnPin(ctx, 'D5', 'yellow') && ledOnPin(ctx, 'D6', 'red'),
    },
    { id: 'buzzer', kind: 'circuit', points: 10, text: 'Buzzer + pin on D8 and - pin on GND.', check: (ctx) => buzzerOn(ctx, 'D8') },
    {
      id: 'pulsein', kind: 'code', points: 20,
      text: 'The code measures with pulseIn(ECHO, HIGH, timeout) (with a timeout argument) and sends a trigger pulse using delayMicroseconds().',
      check: (ctx) => codeHas(ctx, /pulseIn\s*\([^;)]*,[^;)]*,[^;)]+\)/) && codeHas(ctx, /delayMicroseconds\s*\(/),
    },
    { id: 'far', kind: 'behavior', points: 12, text: 'At 100 cm only the green LED is on (yellow, red and buzzer off).', check: (c) => !!c.marks.far },
    { id: 'mid', kind: 'behavior', points: 12, text: 'At 35 cm only the yellow LED is on.', check: (c) => !!c.marks.mid },
    { id: 'near', kind: 'behavior', points: 12, text: 'At 10 cm only the red LED is on and the buzzer is on.', check: (c) => !!c.marks.near },
    { id: 'serial', kind: 'behavior', points: 4, text: 'Serial prints measurements as "Distance: <cm> cm" (about 35 cm at 35 cm).', check: (c) => /Distance:\s*3[3-7]\s*cm/.test(c.serial) },
  ],
  solution: () => {
    const [parts, wires] = p10Wires()
    return {
      circuit: build(parts, wires),
      code: `const int TRIG = 9;
const int ECHO = 10;
const int GREEN = 4;
const int YELLOW = 5;
const int RED = 6;
const int BUZZER = 8;

long readCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  if (us == 0) return 999;   // no echo: far away
  return us / 58;
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(GREEN, OUTPUT);
  pinMode(YELLOW, OUTPUT);
  pinMode(RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  long cm = readCm();
  digitalWrite(GREEN, cm > 50);
  digitalWrite(YELLOW, cm >= 20 && cm <= 50);
  digitalWrite(RED, cm < 20);
  digitalWrite(BUZZER, cm < 20);
  Serial.print("Distance: ");
  Serial.print(cm);
  Serial.println(" cm");
  delay(100);
}
`,
    }
  },
  scenario: (s) => {
    const zone = (cm: number, g: boolean, y: boolean, r: boolean, b: boolean) => {
      s.setAll('hcsr04', 'distanceCm', cm)
      s.advance(500)
      return watch(s, 300, () => high(s, 'D4') === g && high(s, 'D5') === y && high(s, 'D6') === r && high(s, 'D8') === b).all
    }
    s.advance(300)
    s.mark('far', zone(100, true, false, false, false))
    s.mark('mid', zone(35, false, true, false, false))
    s.mark('near', zone(10, false, false, true, true))
  },
}

// ================================================================ p11: Greenhouse Controller
const p11Wires = (): [Part[], Wires] => {
  const parts: Part[] = [part('dht', 'dht', 400, 40, { type: 'dht22', tempC: 25, humidity: 50 }), part('k1', 'relay', 400, 200)]
  const wires: Wires = [['dht.DATA', 'uno.D2'], ['k1.IN', 'uno.D7'], ['k1.COM', 'uno.5V']]
  power('dht', wires); power('k1', wires)
  parts.push(part('rf', 'resistor', 620, 200, { ohms: 330 }), part('fan', 'led', 720, 200, { color: 'green' }))
  wires.push(['k1.NO', 'rf.1'], ['rf.2', 'fan.A'], ['fan.K', 'uno.GND'])
  return [parts, wires]
}

const p11: ExamProject = {
  id: 'p11',
  title: 'Greenhouse Controller',
  story: 'A greenhouse must stay cool. A temperature sensor switches the ventilation fan through a relay, and the controller logs each reading to the serial monitor.',
  brief: [
    'Build a greenhouse fan controller with hysteresis.',
    '',
    'Circuit:',
    '- DHT22: VCC to 5V, GND to GND, DATA to D2.',
    '- Relay module: VCC to 5V, GND to GND, IN to D7 (energised by HIGH).',
    '- The fan is represented by an LED: relay COM to 5V, relay NO to a 330 ohm resistor, then the LED anode; LED cathode to GND.',
    '',
    'Behaviour:',
    '- Include <DHT.h>, read the temperature in Celsius every 2000 ms (use millis(), not a long delay).',
    '- Fan ON (D7 HIGH) when temperature >= 30.0 C.',
    '- Fan OFF (D7 LOW) when temperature <= 27.0 C.',
    '- Between 27 C and 30 C the fan keeps its previous state (hysteresis). The fan is OFF after boot.',
    '- After every reading print on Serial (9600 baud): Temp: <t> C Fan: <ON|OFF>   for example "Temp: 31.0 C Fan: ON".',
  ].join('\n'),
  weeks: [3, 4],
  allowedParts: ['dht', 'relay', 'led', 'resistor', 'ntc', 'dcmotor'],
  starter: () => ({ circuit: unoOnly(), code: skeleton('Greenhouse Controller') }),
  goals: [
    { id: 'dht', kind: 'circuit', points: 15, text: 'DHT22 is powered (5V, GND) and its DATA pin is on D2.', check: (ctx) => partsOf(ctx.circuit, 'dht').some((d) => to5V(ctx, d.id, 'VCC') && toGnd(ctx, d.id, 'GND') && toUno(ctx, d.id, 'DATA', 'D2')) },
    {
      id: 'relay', kind: 'circuit', points: 20,
      text: 'Relay module powered (5V, GND) with IN on D7; COM on 5V and NO through a resistor to an LED whose cathode is on GND.',
      check: (ctx) => relayOk(ctx, 'D7') && partsOf(ctx.circuit, 'relay').some((k) => to5V(ctx, k.id, 'COM') &&
        partsOf(ctx.circuit, 'led').some((l) => ctx.analysis.connected(pin(k.id, 'NO'), pin(l.id, 'A'), ['resistor']) && !ctx.analysis.sameNet(pin(k.id, 'NO'), pin(l.id, 'A')) && toGnd(ctx, l.id, 'K'))),
    },
    {
      id: 'code', kind: 'code', points: 20,
      text: 'The code uses the DHT library (readTemperature) and times the readings with millis() instead of a delay() of 1000 ms or more.',
      check: (ctx) => codeHas(ctx, /#include\s*<DHT\.h>/) && codeHas(ctx, /readTemperature\s*\(/) && codeHas(ctx, /millis\s*\(/) && !codeHas(ctx, /delay\s*\(\s*\d{4,}\s*\)/),
    },
    { id: 'onoff', kind: 'behavior', points: 14, text: 'The fan is off at 25 C and turns on at 31 C.', check: (c) => !!c.marks.cold && !!c.marks.hot },
    { id: 'holdon', kind: 'behavior', points: 11, text: 'After the fan is on, it stays on at 28.5 C (inside the hysteresis band).', check: (c) => !!c.marks.holdOn },
    { id: 'off', kind: 'behavior', points: 10, text: 'The fan turns off at 26 C and then stays off at 28.5 C.', check: (c) => !!c.marks.cooled },
    {
      id: 'log', kind: 'behavior', points: 10,
      text: 'Serial lines look like "Temp: 31.0 C Fan: ON" and "Temp: 25.0 C Fan: OFF".',
      check: (c) => /Temp:\s*31(\.\d+)?\s*C\s+Fan:\s*ON/.test(c.serial) && /Temp:\s*25(\.\d+)?\s*C\s+Fan:\s*OFF/.test(c.serial),
    },
  ],
  solution: () => {
    const [parts, wires] = p11Wires()
    return {
      circuit: build(parts, wires),
      code: `#include <DHT.h>

const int DHT_PIN = 2;
const int RELAY = 7;
const float T_ON = 30.0;
const float T_OFF = 27.0;

DHT dht(DHT_PIN, DHT22);
bool fanOn = false;
unsigned long lastRead = 0;

void setup() {
  Serial.begin(9600);
  pinMode(RELAY, OUTPUT);
  digitalWrite(RELAY, LOW);
  dht.begin();
}

void loop() {
  if (millis() - lastRead >= 2000) {
    lastRead = millis();
    float t = dht.readTemperature();
    if (!isnan(t)) {
      if (t >= T_ON) fanOn = true;
      else if (t <= T_OFF) fanOn = false;
      digitalWrite(RELAY, fanOn ? HIGH : LOW);
      Serial.print("Temp: ");
      Serial.print(t, 1);
      Serial.print(" C Fan: ");
      Serial.println(fanOn ? "ON" : "OFF");
    }
  }
}
`,
    }
  },
  scenario: (s) => {
    const at = (t: number) => { s.setAll('dht', 'tempC', t); s.advance(3000); return relayEnergized(s) }
    const cold = !at(25)
    const hot = at(31)
    const holdOn = hot && at(28.5)
    const cool = !at(26)
    const holdOff = !at(28.5)
    s.mark('cold', cold)
    s.mark('hot', hot)
    s.mark('holdOn', holdOn)
    s.mark('cooled', hot && cool && holdOff)
  },
}

// ================================================================ p12: PIR Security Robot
const p12Wires = (): [Part[], Wires] => {
  const parts: Part[] = [part('pir', 'pir', 400, 40, { motion: false })]
  const wires: Wires = [['pir.OUT', 'uno.D2']]
  power('pir', wires)
  addBuzzer(parts, wires, 'bz', 'D8', 400, 200)
  addLed(parts, wires, 'al', 'D13', 400, 300)
  return [parts, wires]
}

const p12: ExamProject = {
  id: 'p12',
  title: 'PIR Security Robot',
  story: 'A night-watch robot guards a storeroom. After a warm-up period it raises an alarm whenever its PIR sensor sees someone move.',
  brief: [
    'Build a motion alarm with a warm-up period.',
    '',
    'Circuit:',
    '- PIR sensor: VCC to 5V, GND to GND, OUT to D2.',
    '- Buzzer: + to D8, - to GND.',
    '- Red LED on D13 through a series resistor (cathode to GND).',
    '',
    'Behaviour:',
    '- Warm-up: for the first 5000 ms after boot ignore the PIR completely. Use millis() for this, do not block with a long delay(). The buzzer and LED stay off.',
    '- After warm-up: while the PIR output is HIGH, the buzzer (D8) and the LED (D13) are both on. When the PIR output goes LOW they turn off.',
    '- Each detection event prints exactly one line "ALARM" on Serial (9600 baud), at the moment the PIR output rises (detect the rising edge, do not print on every loop).',
  ].join('\n'),
  weeks: [3, 4],
  allowedParts: ['pir', 'buzzer', 'led', 'resistor', 'button', 'irobstacle'],
  starter: () => ({ circuit: unoOnly(), code: skeleton('PIR Security Robot') }),
  goals: [
    { id: 'pir', kind: 'circuit', points: 15, text: 'PIR is powered (5V, GND) and its OUT pin is on D2.', check: (ctx) => partsOf(ctx.circuit, 'pir').some((p) => to5V(ctx, p.id, 'VCC') && toGnd(ctx, p.id, 'GND') && toUno(ctx, p.id, 'OUT', 'D2')) },
    { id: 'buzzer', kind: 'circuit', points: 13, text: 'Buzzer + pin on D8 and - pin on GND.', check: (ctx) => buzzerOn(ctx, 'D8') },
    { id: 'led', kind: 'circuit', points: 12, text: 'An LED on D13 through a series resistor, cathode on GND.', check: (ctx) => ledOnPin(ctx, 'D13') },
    {
      id: 'millis', kind: 'code', points: 20,
      text: 'The warm-up is timed with millis() and the code does not block with a delay() of 1000 ms or more.',
      check: (ctx) => codeHas(ctx, /millis\s*\(\s*\)/) && !codeHas(ctx, /delay\s*\(\s*\d{4,}\s*\)/) && codeHas(ctx, /digitalRead\s*\(/),
    },
    { id: 'warmup', kind: 'behavior', points: 14, text: 'During the first 4500 ms the buzzer and LED stay off.', check: (c) => !!c.marks.quiet && !!c.marks.alarm1 },
    { id: 'alarm', kind: 'behavior', points: 14, text: 'When motion is detected after warm-up, the buzzer and the LED are both on.', check: (c) => !!c.marks.alarm1 && !!c.marks.alarm2 },
    { id: 'clear', kind: 'behavior', points: 6, text: 'When motion ends, the alarm turns off again.', check: (c) => !!c.marks.alarm1 && !!c.marks.cleared },
    { id: 'serial', kind: 'behavior', points: 6, text: 'Serial prints "ALARM" exactly once per detection event (two events: two lines).', check: (c) => count(c.serial, /ALARM/g) === 2 },
  ],
  solution: () => {
    const [parts, wires] = p12Wires()
    return {
      circuit: build(parts, wires),
      code: `const int PIR = 2;
const int BUZZER = 8;
const int LED = 13;
const unsigned long WARMUP_MS = 5000;

bool wasMotion = false;

void setup() {
  pinMode(PIR, INPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (millis() < WARMUP_MS) return;   // ignore the PIR while it warms up
  bool motion = digitalRead(PIR) == HIGH;
  if (motion && !wasMotion) Serial.println("ALARM");
  wasMotion = motion;
  digitalWrite(BUZZER, motion);
  digitalWrite(LED, motion);
}
`,
    }
  },
  scenario: (s) => {
    const alarm = () => high(s, 'D8') && high(s, 'D13')
    const anyOut = () => high(s, 'D8') || high(s, 'D13')
    s.mark('quiet', !watch(s, 4500, anyOut).any)
    s.advance(2000)
    s.setAll('pir', 'motion', true)
    s.advance(300)
    s.mark('alarm1', watch(s, 300, alarm).all)
    s.setAll('pir', 'motion', false)
    s.advance(4800)
    s.mark('cleared', !anyOut())
    s.setAll('pir', 'motion', true)
    s.advance(300)
    s.mark('alarm2', watch(s, 300, alarm).all)
    s.setAll('pir', 'motion', false)
    s.advance(4800)
  },
}

// ================================================================ p13: Encoder Odometer
const p13Wires = (): [Part[], Wires] => {
  const parts: Part[] = [part('enc', 'encoder', 400, 40)]
  const wires: Wires = [['enc.CLK', 'uno.D2'], ['enc.DT', 'uno.D3'], ['enc.SW', 'uno.D4']]
  power('enc', wires)
  addLed(parts, wires, 'goal', 'D13', 400, 240, 'green')
  return [parts, wires]
}

const p13: ExamProject = {
  id: 'p13',
  title: 'Encoder Odometer',
  story: 'A line-following robot measures how far its wheel has rolled with a quadrature encoder, and lights a lamp when the target distance is reached.',
  brief: [
    'Build an odometer that counts encoder ticks with an interrupt.',
    '',
    'Circuit:',
    '- Rotary encoder: VCC to 5V, GND to GND, CLK to D2, DT to D3, SW to D4.',
    '- Green LED on D13 through a series resistor (cathode to GND).',
    '',
    'Behaviour:',
    '- Attach an interrupt to CLK (D2) on FALLING. In the interrupt routine: if DT is HIGH the tick count goes up by 1, otherwise down by 1. Ignore edges closer than 2 ms (debounce). The count is a volatile variable.',
    '- Set CLK, DT and SW to INPUT_PULLUP.',
    '- Each tick is 5 mm. Whenever the count changes, print one line on Serial (9600 baud): Ticks: <count> Dist: <count*5> mm   for example "Ticks: 6 Dist: 30 mm".',
    '- The LED (D13) is on while the absolute distance is at least 100 mm (20 ticks), otherwise off.',
    '- Pressing the encoder button (SW is LOW) resets the count to 0 once per press. Read the count in loop() with interrupts disabled (noInterrupts / interrupts).',
  ].join('\n'),
  weeks: [3],
  allowedParts: ['encoder', 'led', 'resistor', 'button', 'pot'],
  starter: () => ({ circuit: unoOnly(), code: skeleton('Encoder Odometer') }),
  goals: [
    { id: 'power', kind: 'circuit', points: 10, text: 'The encoder is powered: VCC on 5V and GND on GND.', check: (ctx) => partsOf(ctx.circuit, 'encoder').some((e) => to5V(ctx, e.id, 'VCC') && toGnd(ctx, e.id, 'GND')) },
    { id: 'signals', kind: 'circuit', points: 15, text: 'Encoder CLK on D2, DT on D3 and SW on D4.', check: (ctx) => partsOf(ctx.circuit, 'encoder').some((e) => toUno(ctx, e.id, 'CLK', 'D2') && toUno(ctx, e.id, 'DT', 'D3') && toUno(ctx, e.id, 'SW', 'D4')) },
    { id: 'led', kind: 'circuit', points: 12, text: 'An LED on D13 through a series resistor, cathode on GND.', check: (ctx) => ledOnPin(ctx, 'D13') },
    { id: 'isr', kind: 'code', points: 10, text: 'The code attaches an interrupt with attachInterrupt(digitalPinToInterrupt(...), ...).', check: (ctx) => codeHas(ctx, /attachInterrupt\s*\(\s*digitalPinToInterrupt\s*\(/) },
    { id: 'volatile', kind: 'code', points: 10, text: 'The tick counter shared with the interrupt is declared volatile.', check: (ctx) => codeHas(ctx, /\bvolatile\s+(?:unsigned\s+)?(?:long|int|short|byte|uint\d+_t|int\d+_t)\b/) },
    {
      id: 'count', kind: 'behavior', points: 14,
      text: 'Turning the encoder forward prints "Ticks: 6 Dist: 30 mm" and then "Ticks: 25 Dist: 125 mm".',
      check: (c) => /Ticks:\s*6\s+Dist:\s*30\s*mm/.test(c.serial) && /Ticks:\s*25\s+Dist:\s*125\s*mm/.test(c.serial),
    },
    { id: 'back', kind: 'behavior', points: 14, text: 'Turning backward counts down: after 25 the count falls to 18 ("Ticks: 18 Dist: 90 mm"), and the LED is off again below 100 mm.', check: (c) => /Ticks:\s*25[\s\S]*Ticks:\s*18\s+Dist:\s*90\s*mm/.test(c.serial) && !!c.marks.ledOn && !!c.marks.ledOff },
    { id: 'reset', kind: 'behavior', points: 15, text: 'Pressing the encoder button resets the count: "Ticks: 0 Dist: 0 mm" is printed and the LED stays off.', check: (c) => /Ticks:\s*18[\s\S]*Ticks:\s*0\s+Dist:\s*0\s*mm/.test(c.serial) && !!c.marks.ledOn && !!c.marks.resetOff },
  ],
  solution: () => {
    const [parts, wires] = p13Wires()
    return {
      circuit: build(parts, wires),
      code: `const int CLK = 2;
const int DT = 3;
const int SW = 4;
const int LED = 13;

volatile long ticks = 0;
volatile unsigned long lastEdge = 0;

void onClk() {
  unsigned long now = micros();
  if (now - lastEdge < 2000) return;   // debounce
  lastEdge = now;
  if (digitalRead(DT) == HIGH) ticks++;
  else ticks--;
}

void setup() {
  Serial.begin(9600);
  pinMode(CLK, INPUT_PULLUP);
  pinMode(DT, INPUT_PULLUP);
  pinMode(SW, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  attachInterrupt(digitalPinToInterrupt(CLK), onClk, FALLING);
}

void loop() {
  static long prev = 0;
  static bool wasPressed = false;

  bool pressed = digitalRead(SW) == LOW;
  if (pressed && !wasPressed) {
    noInterrupts();
    ticks = 0;
    interrupts();
  }
  wasPressed = pressed;

  noInterrupts();
  long t = ticks;
  interrupts();

  digitalWrite(LED, abs(t) >= 20);
  if (t != prev) {
    prev = t;
    Serial.print("Ticks: ");
    Serial.print(t);
    Serial.print(" Dist: ");
    Serial.print(t * 5);
    Serial.println(" mm");
  }
}
`,
    }
  },
  scenario: (s) => {
    s.advance(300)
    s.setAll('encoder', 'position', 6)
    s.advance(900)
    s.setAll('encoder', 'position', 25)
    s.advance(1200)
    s.mark('ledOn', high(s, 'D13'))
    s.setAll('encoder', 'position', 18)
    s.advance(900)
    s.mark('ledOff', !high(s, 'D13'))
    press(s, 'encoder', 'pressed', 250)
    s.advance(400)
    s.mark('resetOff', !high(s, 'D13'))
  },
}

// ================================================================ p14: Joystick Pan Unit
const p14Wires = (): [Part[], Wires] => {
  const parts: Part[] = [part('joy', 'joystick', 400, 40), part('sv', 'servo', 400, 200)]
  const wires: Wires = [['joy.VRX', 'uno.A0'], ['joy.SW', 'uno.D2'], ['sv.SIG', 'uno.D9']]
  power('joy', wires); power('sv', wires)
  addLed(parts, wires, 'lock', 'D13', 400, 340)
  return [parts, wires]
}

const p14: ExamProject = {
  id: 'p14',
  title: 'Joystick Pan Unit',
  story: 'A camera robot pans left and right under joystick control. A button locks the current direction so the operator can let go of the stick.',
  brief: [
    'Build a joystick-controlled pan servo with a lock button.',
    '',
    'Circuit:',
    '- Joystick: VCC to 5V, GND to GND, VRX to A0, SW to D2.',
    '- Servo: SIG to D9, VCC to 5V, GND to GND.',
    '- Red LED on D13 through a series resistor (cathode to GND): the lock indicator.',
    '',
    'Behaviour (use the Servo library):',
    '- Convert the joystick X reading with map(analogRead(A0), 0, 1023, 0, 180) and write it to the servo, so the stick centred is about 90 degrees, full left 0, full right 180.',
    '- SW is INPUT_PULLUP and is LOW when pressed. Each new press (detect the press edge, once per press) toggles a lock.',
    '- While locked the servo holds its last angle whatever the stick does, and the LED (D13) is on. Unlocking turns the LED off and the servo follows the stick again.',
    '- Start unlocked, servo at 90 degrees.',
  ].join('\n'),
  weeks: [3, 4],
  allowedParts: ['joystick', 'servo', 'led', 'resistor', 'pot', 'button'],
  starter: () => ({ circuit: unoOnly(), code: skeleton('Joystick Pan Unit') }),
  goals: [
    { id: 'joy', kind: 'circuit', points: 15, text: 'Joystick is powered (5V, GND) with VRX on A0 and SW on D2.', check: (ctx) => partsOf(ctx.circuit, 'joystick').some((j) => to5V(ctx, j.id, 'VCC') && toGnd(ctx, j.id, 'GND') && toUno(ctx, j.id, 'VRX', 'A0') && toUno(ctx, j.id, 'SW', 'D2')) },
    { id: 'servo', kind: 'circuit', points: 12, text: 'Servo is powered (5V, GND) with its SIG pin on D9.', check: (ctx) => partsOf(ctx.circuit, 'servo').some((v) => to5V(ctx, v.id, 'VCC') && toGnd(ctx, v.id, 'GND') && toUno(ctx, v.id, 'SIG', 'D9')) },
    { id: 'led', kind: 'circuit', points: 10, text: 'An LED on D13 through a series resistor, cathode on GND.', check: (ctx) => ledOnPin(ctx, 'D13') },
    { id: 'servocode', kind: 'code', points: 10, text: 'The code uses the Servo library (#include <Servo.h>, attach) and converts the reading with map().', check: (ctx) => codeHas(ctx, /#include\s*<Servo\.h>/) && codeHas(ctx, /\.attach\s*\(/) && codeHas(ctx, /\bmap\s*\(/) },
    { id: 'pullup', kind: 'code', points: 10, text: 'The joystick button pin is configured with INPUT_PULLUP.', check: (ctx) => codeHas(ctx, /INPUT_PULLUP/) },
    { id: 'center', kind: 'behavior', points: 9, text: 'With the stick centred the servo is attached and at about 90 degrees (80-100).', check: (c) => !!c.marks.center },
    { id: 'sweep', kind: 'behavior', points: 12, text: 'Stick full right moves the servo to 170 degrees or more; full left to 10 degrees or less.', check: (c) => !!c.marks.right && !!c.marks.left },
    { id: 'lock', kind: 'behavior', points: 22, text: 'A button press locks: the LED is on and the servo ignores the stick. A second press unlocks: the LED is off and the servo follows the stick again.', check: (c) => !!c.marks.locked && !!c.marks.unlocked },
  ],
  solution: () => {
    const [parts, wires] = p14Wires()
    return {
      circuit: build(parts, wires),
      code: `#include <Servo.h>

const int JOY_X = A0;
const int SW = 2;
const int SERVO_PIN = 9;
const int LED = 13;

Servo pan;
bool locked = false;
bool wasPressed = false;

void setup() {
  pinMode(SW, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  pan.attach(SERVO_PIN);
  pan.write(90);
}

void loop() {
  bool pressed = digitalRead(SW) == LOW;
  if (pressed && !wasPressed) {
    locked = !locked;
    digitalWrite(LED, locked);
  }
  wasPressed = pressed;

  if (!locked) {
    int angle = map(analogRead(JOY_X), 0, 1023, 0, 180);
    pan.write(angle);
  }
  delay(20);
}
`,
    }
  },
  scenario: (s) => {
    const angle = () => { const id = s.idsOf('servo')[0]; const r = id ? s.state.parts[id]?.servo : undefined; return r ? r.angleDeg : NaN }
    const attached = () => { const id = s.idsOf('servo')[0]; return !!(id && s.state.parts[id]?.servo?.attached) }
    const stick = (x: number) => { s.setAll('joystick', 'x', x); s.advance(800) }
    stick(0.5)
    s.mark('center', attached() && angle() >= 80 && angle() <= 100)
    stick(1)
    s.mark('right', attached() && angle() >= 170)
    stick(0)
    s.mark('left', attached() && angle() <= 10)
    stick(1)
    press(s, 'joystick', 'pressed')
    s.advance(300)
    const ledOn = high(s, 'D13')
    stick(0)
    s.mark('locked', ledOn && high(s, 'D13') && angle() >= 170)
    press(s, 'joystick', 'pressed')
    s.advance(800)
    s.mark('unlocked', !high(s, 'D13') && angle() <= 10 && ledOn)
  },
}

// ================================================================ p15: Fire-Watch Robot
const p15Wires = (): [Part[], Wires] => {
  const parts: Part[] = [part('fl', 'flame', 400, 40), part('rst', 'button', 560, 60)]
  const wires: Wires = [['fl.AO', 'uno.A0'], ['rst.A', 'uno.D2'], ['rst.B', 'uno.GND']]
  power('fl', wires)
  addBuzzer(parts, wires, 'bz', 'D8', 400, 220)
  addLed(parts, wires, 'al', 'D13', 400, 320)
  return [parts, wires]
}

const p15: ExamProject = {
  id: 'p15',
  title: 'Fire-Watch Robot',
  story: 'A patrol robot in a workshop watches for flames. Once it sees a fire it keeps the alarm on until a person confirms the flame is gone and presses reset.',
  brief: [
    'Build a latching fire alarm.',
    '',
    'Circuit:',
    '- Flame sensor: VCC to 5V, GND to GND, AO to A0 (the analog value drops when a flame is present).',
    '- Buzzer: + to D8, - to GND.',
    '- Red LED on D13 through a series resistor (cathode to GND).',
    '- Reset button between D2 and GND (use INPUT_PULLUP, pressed = LOW).',
    '',
    'Behaviour:',
    '- A flame is detected when analogRead(A0) < 500.',
    '- On detection the alarm latches: the buzzer (D8) and the LED (D13) go on and stay on even after the flame disappears. Print "FIRE DETECTED" once per fire event on Serial (9600 baud).',
    '- The reset button clears the alarm (buzzer and LED off) only if the flame is gone (analogRead(A0) >= 500). Pressing it while the flame is still present does nothing.',
    '- After a reset a new flame starts a new fire event (and prints "FIRE DETECTED" again).',
  ].join('\n'),
  weeks: [4],
  allowedParts: ['flame', 'buzzer', 'led', 'resistor', 'button', 'mq2'],
  starter: () => ({ circuit: unoOnly(), code: skeleton('Fire-Watch Robot') }),
  goals: [
    { id: 'flame', kind: 'circuit', points: 14, text: 'Flame sensor is powered (5V, GND) with its AO pin on A0.', check: (ctx) => partsOf(ctx.circuit, 'flame').some((f) => to5V(ctx, f.id, 'VCC') && toGnd(ctx, f.id, 'GND') && toUno(ctx, f.id, 'AO', 'A0')) },
    { id: 'buzzer', kind: 'circuit', points: 10, text: 'Buzzer + pin on D8 and - pin on GND.', check: (ctx) => buzzerOn(ctx, 'D8') },
    { id: 'led', kind: 'circuit', points: 17, text: 'An LED on D13 through a series resistor (cathode on GND), and a reset button between D2 and GND.', check: (ctx) => ledOnPin(ctx, 'D13') && switchOnPin(ctx, 'button', 'D2') },
    { id: 'code', kind: 'code', points: 14, text: 'The code reads the flame sensor with analogRead() and configures the reset button with INPUT_PULLUP.', check: (ctx) => codeHas(ctx, /analogRead\s*\(/) && codeHas(ctx, /INPUT_PULLUP/) },
    { id: 'trigger', kind: 'behavior', points: 12, text: 'With no flame the buzzer and LED are off; a flame (sensor below 500) switches both on.', check: (c) => !!c.marks.quiet && !!c.marks.on },
    { id: 'latch', kind: 'behavior', points: 12, text: 'The alarm stays latched after the flame disappears, and a reset press while the flame is present does nothing.', check: (c) => !!c.marks.on && !!c.marks.refuse && !!c.marks.latched },
    { id: 'reset', kind: 'behavior', points: 12, text: 'With the flame gone, the reset button switches the alarm off; a new flame triggers it again.', check: (c) => !!c.marks.on && !!c.marks.cleared && !!c.marks.again },
    { id: 'serial', kind: 'behavior', points: 9, text: 'Serial prints "FIRE DETECTED" exactly once per fire event (two events: two lines).', check: (c) => count(c.serial, /FIRE DETECTED/g) === 2 },
  ],
  solution: () => {
    const [parts, wires] = p15Wires()
    return {
      circuit: build(parts, wires),
      code: `const int FLAME = A0;
const int BUZZER = 8;
const int LED = 13;
const int RESET = 2;
const int FIRE_LEVEL = 500;

bool alarm = false;

void setup() {
  Serial.begin(9600);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  pinMode(RESET, INPUT_PULLUP);
}

void loop() {
  int v = analogRead(FLAME);
  bool fire = v < FIRE_LEVEL;

  if (fire && !alarm) {
    alarm = true;
    Serial.println("FIRE DETECTED");
  }
  if (alarm && !fire && digitalRead(RESET) == LOW) {
    alarm = false;
  }
  digitalWrite(BUZZER, alarm);
  digitalWrite(LED, alarm);
  delay(20);
}
`,
    }
  },
  scenario: (s) => {
    const alarmOn = () => high(s, 'D8') && high(s, 'D13')
    const alarmOff = () => !high(s, 'D8') && !high(s, 'D13')
    s.advance(300)
    s.mark('quiet', watch(s, 300, alarmOff).all)
    s.setAll('flame', 'flame', 0.8)
    s.advance(400)
    s.mark('on', alarmOn())
    press(s, 'button', 'pressed', 200)
    s.advance(300)
    s.mark('refuse', alarmOn())
    s.setAll('flame', 'flame', 0)
    s.advance(400)
    s.mark('latched', alarmOn())
    press(s, 'button', 'pressed', 200)
    s.advance(300)
    s.mark('cleared', alarmOff())
    s.setAll('flame', 'flame', 0.8)
    s.advance(400)
    s.mark('again', alarmOn())
    s.setAll('flame', 'flame', 0)
    s.advance(200)
  },
}

// ================================================================ p16: Smart Irrigation
const p16Wires = (): [Part[], Wires] => {
  const parts: Part[] = [part('soil', 'soil', 400, 40, { moisture: 0.3 }), part('k1', 'relay', 400, 260), part('pump', 'dcmotor', 640, 260)]
  const wires: Wires = [['soil.AO', 'uno.A0'], ['k1.IN', 'uno.D7'], ['k1.COM', 'uno.5V'], ['k1.NO', 'pump.M1'], ['pump.M2', 'uno.GND']]
  power('soil', wires); power('k1', wires)
  return [parts, wires]
}

const p16: ExamProject = {
  id: 'p16',
  title: 'Smart Irrigation',
  story: 'A garden robot waters plants when the soil is dry. To protect the pump it runs only in short bursts and rests between them.',
  brief: [
    'Build a soil-moisture irrigation controller with pump protection.',
    '',
    'Circuit:',
    '- Soil moisture sensor: VCC to 5V, GND to GND, AO to A0 (the reading is HIGH when dry, LOW when wet).',
    '- Relay module: VCC to 5V, GND to GND, IN to D7 (energised by HIGH).',
    '- The pump is a DC motor: relay COM to 5V, relay NO to motor M1, motor M2 to GND.',
    '',
    'Behaviour:',
    '- The soil is DRY when analogRead(A0) > 700 and WET when analogRead(A0) < 500 (between: keep the previous decision).',
    '- Start the pump (D7 HIGH) when the soil is dry. A pump run lasts at most 3000 ms (use millis()); after a run the pump must rest for at least 3000 ms before it may start again, even if the soil is still dry.',
    '- If the soil becomes wet while the pump is running, stop the pump immediately.',
    '- The pump never starts while the reading is between 500 and 700 or below.',
    '- Every 500 ms print on Serial (9600 baud): Soil: <raw> Pump: <ON|OFF>   for example "Soil: 859 Pump: ON".',
  ].join('\n'),
  weeks: [3, 4],
  allowedParts: ['soil', 'relay', 'dcmotor', 'led', 'resistor', 'waterlevel'],
  starter: () => ({ circuit: unoOnly(), code: skeleton('Smart Irrigation') }),
  goals: [
    { id: 'soil', kind: 'circuit', points: 12, text: 'Soil moisture sensor is powered (5V, GND) with its AO pin on A0.', check: (ctx) => partsOf(ctx.circuit, 'soil').some((p) => to5V(ctx, p.id, 'VCC') && toGnd(ctx, p.id, 'GND') && toUno(ctx, p.id, 'AO', 'A0')) },
    {
      id: 'pump', kind: 'circuit', points: 23,
      text: 'Relay powered (5V, GND) with IN on D7; COM on 5V and NO on a DC motor terminal whose other terminal is on GND.',
      check: (ctx) => relayOk(ctx, 'D7') && partsOf(ctx.circuit, 'relay').some((k) => to5V(ctx, k.id, 'COM') &&
        partsOf(ctx.circuit, 'dcmotor').some((m) =>
          (ctx.analysis.sameNet(pin(k.id, 'NO'), pin(m.id, 'M1')) && toGnd(ctx, m.id, 'M2')) || (ctx.analysis.sameNet(pin(k.id, 'NO'), pin(m.id, 'M2')) && toGnd(ctx, m.id, 'M1')))),
    },
    { id: 'code', kind: 'code', points: 20, text: 'The code reads the sensor with analogRead() and times the pump with millis() (no long blocking delay()).', check: (ctx) => codeHas(ctx, /analogRead\s*\(/) && codeHas(ctx, /millis\s*\(\s*\)/) && !codeHas(ctx, /delay\s*\(\s*\d{4,}\s*\)/) },
    { id: 'idle', kind: 'behavior', points: 9, text: 'The pump stays off while the soil is wet or in the 500-700 band.', check: (c) => !!c.marks.idle && !!c.marks.ran },
    { id: 'limit', kind: 'behavior', points: 12, text: 'On dry soil the pump runs once for about 3 s (2.5-3.6 s) and then stops.', check: (c) => !!c.marks.limit },
    { id: 'rest', kind: 'behavior', points: 11, text: 'The pump rests at least 2.5 s between runs and starts again while the soil is still dry.', check: (c) => !!c.marks.rest },
    { id: 'wetcut', kind: 'behavior', points: 9, text: 'If the soil turns wet while the pump runs, the pump stops at once.', check: (c) => !!c.marks.wetcut },
    { id: 'serial', kind: 'behavior', points: 4, text: 'Serial lines look like "Soil: 859 Pump: ON" and "Soil: 430 Pump: OFF".', check: (c) => /Soil:\s*\d+\s+Pump:\s*ON/.test(c.serial) && /Soil:\s*\d+\s+Pump:\s*OFF/.test(c.serial) },
  ],
  solution: () => {
    const [parts, wires] = p16Wires()
    return {
      circuit: build(parts, wires),
      code: `const int SOIL = A0;
const int RELAY = 7;
const int DRY = 700;
const int WET = 500;
const unsigned long MAX_RUN = 3000;
const unsigned long REST = 3000;

bool pumping = false;
bool hasRun = false;
unsigned long startedAt = 0;
unsigned long stoppedAt = 0;
unsigned long lastPrint = 0;

void setup() {
  Serial.begin(9600);
  pinMode(RELAY, OUTPUT);
  digitalWrite(RELAY, LOW);
}

void loop() {
  int raw = analogRead(SOIL);
  unsigned long now = millis();

  if (pumping) {
    if (raw < WET || now - startedAt >= MAX_RUN) {
      pumping = false;
      stoppedAt = now;
    }
  } else if (raw > DRY && (!hasRun || now - stoppedAt >= REST)) {
    pumping = true;
    hasRun = true;
    startedAt = now;
  }
  digitalWrite(RELAY, pumping ? HIGH : LOW);

  if (now - lastPrint >= 500) {
    lastPrint = now;
    Serial.print("Soil: ");
    Serial.print(raw);
    Serial.print(" Pump: ");
    Serial.println(pumping ? "ON" : "OFF");
  }
}
`,
    }
  },
  scenario: (s) => {
    let idleOk = true
    s.setAll('soil', 'moisture', 0.9)
    idleOk &&= !watch(s, 1000, () => relayEnergized(s)).any
    s.setAll('soil', 'moisture', 0.5)
    idleOk &&= !watch(s, 1000, () => relayEnergized(s)).any
    s.setAll('soil', 'moisture', 0.1)
    // 10,5 sn kuru toprak: pompa çalışma aralıklarını ölç
    const runs: Array<{ from: number; to: number }> = []
    let cur: { from: number; to: number } | null = null
    for (let t = 0; t < 10500; t += 20) {
      s.advance(20)
      const on = relayEnergized(s), now = s.state.timeMs
      if (on && !cur) { cur = { from: now, to: now }; runs.push(cur) }
      else if (on && cur) cur.to = now
      else if (!on) cur = null
    }
    s.mark('ran', runs.length > 0)
    s.mark('idle', idleOk)
    const first = runs[0]
    s.mark('limit', !!first && first.to - first.from >= 2500 && first.to - first.from <= 3600 && runs.every((r) => r.to - r.from <= 3600))
    s.mark('rest', runs.length >= 2 && runs[1].from - runs[0].to >= 2500)
    // yeni bir çalışma başlasın, sonra toprak ıslansın
    watch(s, 5000, () => relayEnergized(s)).any
    let waited = 0
    while (!relayEnergized(s) && waited < 6000) { s.advance(20); waited += 20 }
    const started = relayEnergized(s)
    s.advance(500)
    s.setAll('soil', 'moisture', 0.9)
    s.advance(300)
    s.mark('wetcut', started && !relayEnergized(s))
  },
}

// ================================================================ p17: EMA Distance Logger
const p17Wires = (): [Part[], Wires] => {
  const parts: Part[] = [part('us', 'hcsr04', 400, 40, { distanceCm: 100 })]
  const wires: Wires = [['us.VCC', 'uno.5V'], ['us.GND', 'uno.GND'], ['us.TRIG', 'uno.D9'], ['us.ECHO', 'uno.D10']]
  addLed(parts, wires, 'near', 'D13', 400, 220)
  return [parts, wires]
}

const p17: ExamProject = {
  id: 'p17',
  title: 'EMA Distance Logger',
  story: 'A mapping robot logs the distance to the wall, but raw ultrasonic readings jitter. A smoothing filter gives a steady number for the log and the warning lamp.',
  brief: [
    'Build a distance logger with an exponential moving average (EMA) filter.',
    '',
    'Circuit:',
    '- HC-SR04: VCC to 5V, GND to GND, TRIG to D9, ECHO to D10.',
    '- Red LED on D13 through a series resistor (cathode to GND).',
    '',
    'Behaviour:',
    '- Every 100 ms measure the distance in cm with pulseIn(ECHO, HIGH, timeout) (use a timeout argument; cm = microseconds / 58).',
    '- Filter it with a float EMA: filtered = ALPHA * raw + (1 - ALPHA) * filtered, with ALPHA = 0.3. Initialise filtered with the first raw reading.',
    '- Print one line per measurement on Serial (9600 baud): Raw: <raw cm> Filtered: <filtered with 1 decimal>   for example "Raw: 40 Filtered: 82.0".',
    '- The LED (D13) is on when the FILTERED distance is below 60.0 cm (not the raw one), otherwise off.',
  ].join('\n'),
  weeks: [4],
  allowedParts: ['hcsr04', 'led', 'resistor', 'lcdI2c', 'buzzer'],
  starter: () => ({ circuit: unoOnly(), code: skeleton('EMA Distance Logger') }),
  goals: [
    { id: 'sensor', kind: 'circuit', points: 20, text: 'HC-SR04 is powered (5V, GND) with TRIG on D9 and ECHO on D10.', check: hcsrOk },
    { id: 'led', kind: 'circuit', points: 15, text: 'An LED on D13 through a series resistor, cathode on GND.', check: (ctx) => ledOnPin(ctx, 'D13') },
    {
      id: 'ema', kind: 'code', points: 20,
      text: 'The code uses pulseIn() with a timeout argument and keeps the filter state in a float variable (EMA with a multiplication by ALPHA).',
      check: (ctx) => codeHas(ctx, /pulseIn\s*\([^;)]*,[^;)]*,[^;)]+\)/) && codeHas(ctx, /\bfloat\b/) && codeHas(ctx, /[*]/),
    },
    { id: 'steady', kind: 'behavior', points: 10, text: 'With a steady 100 cm the log shows "Raw: ~100 Filtered: ~100".', check: (c) => !!c.marks.steady },
    { id: 'smooth', kind: 'behavior', points: 15, text: 'When the wall jumps from 100 cm to 40 cm, the first filtered value is between 70 and 94 and then decreases step by step (EMA, ALPHA = 0.3).', check: (c) => !!c.marks.smooth },
    { id: 'converge', kind: 'behavior', points: 10, text: 'After about 2 s at 40 cm the filtered value has settled at 37-43 cm while Raw shows about 40.', check: (c) => !!c.marks.converge },
    { id: 'lamp', kind: 'behavior', points: 10, text: 'The LED follows the filtered value: off at 100 cm, still off on the first reading after the jump, and on once settled at 40 cm.', check: (c) => !!c.marks.lamp },
  ],
  solution: () => {
    const [parts, wires] = p17Wires()
    return {
      circuit: build(parts, wires),
      code: `const int TRIG = 9;
const int ECHO = 10;
const int LED = 13;
const float ALPHA = 0.3;

float filtered = 0;
bool first = true;

long readCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  return us / 58;
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  long raw = readCm();
  if (first) {
    filtered = raw;
    first = false;
  } else {
    filtered = ALPHA * raw + (1 - ALPHA) * filtered;
  }
  digitalWrite(LED, filtered < 60.0);
  Serial.print("Raw: ");
  Serial.print(raw);
  Serial.print(" Filtered: ");
  Serial.println(filtered, 1);
  delay(100);
}
`,
    }
  },
  scenario: (s) => {
    const lines = (from: number) => [...s.serial.slice(from).matchAll(/Raw:\s*(\d+)\s+Filtered:\s*(-?\d+(?:\.\d+)?)/g)].map((m) => ({ raw: num(m[1]), f: num(m[2]) }))
    s.setAll('hcsr04', 'distanceCm', 100)
    s.advance(1200)
    const steadyLines = lines(0)
    const last = steadyLines[steadyLines.length - 1]
    s.mark('steady', !!last && Math.abs(last.raw - 100) <= 2 && Math.abs(last.f - 100) <= 2)
    const ledFar = !high(s, 'D13')
    const from = s.serial.length
    s.setAll('hcsr04', 'distanceCm', 40)
    // yeni değerli ilk satır görünene kadar 10 ms adımla ilerle
    let firstLed: boolean | null = null
    for (let t = 0; t < 600 && firstLed === null; t += 10) {
      s.advance(10)
      if (lines(from).some((l) => Math.abs(l.raw - 40) <= 2)) firstLed = high(s, 'D13')
    }
    s.advance(1000)
    const seq = lines(from).filter((l) => Math.abs(l.raw - 40) <= 2)
    const f = seq.map((l) => l.f)
    s.mark('smooth', f.length >= 3 && f[0] > 70 && f[0] < 94 && f[0] > f[1] && f[1] > f[2])
    s.advance(1000)
    const end = lines(from).pop()
    s.mark('converge', !!end && Math.abs(end.raw - 40) <= 2 && Math.abs(end.f - 40) <= 3)
    s.mark('lamp', ledFar && firstLed === false && high(s, 'D13'))
  },
}

// ---------------------------------------------------------------- dışa aktarım
export const PROJECTS_B: ExamProject[] = [p10, p11, p12, p13, p14, p15, p16, p17]

