import type { Circuit, PartType } from '@/lib/lab/contract'
import type { ExamGoal, ExamGoalCtx, ExamProject, ExamScenario } from '../types'
import { build, noComments, part, partsOf, pin, skeleton, to5V, toGnd, toUno, unoOnly, viaResistor } from './helpers'

/** Sınav projeleri, grup C (ders haftaları 5-7: eyleyiciler, geri besleme, mobil robot). */

// ---------------------------------------------------------------- ortak yardımcılar
/** Bu türden bir parça, verilen tüm uçları belirtilen yere bağlı ('5V', 'GND' ya da Uno pini adı). */
const allWired = (ctx: ExamGoalCtx, type: PartType, map: Record<string, string>) =>
  partsOf(ctx.circuit, type).some((p) => Object.entries(map).every(([pn, to]) => (to === '5V' ? to5V(ctx, p.id, pn) : to === 'GND' ? toGnd(ctx, p.id, pn) : toUno(ctx, p.id, pn, to))))

/** Sürücünün iki çıkışına (M1 -> a, M2 -> b) bir DC motor bağlı. */
const motorOn = (ctx: ExamGoalCtx, drv: PartType, a: string, b: string) =>
  partsOf(ctx.circuit, drv).some((d) => partsOf(ctx.circuit, 'dcmotor').some((m) =>
    ctx.analysis.sameNet(pin(m.id, 'M1'), pin(d.id, a)) && ctx.analysis.sameNet(pin(m.id, 'M2'), pin(d.id, b))))

/** Sürücü kanal çıkışları (-1..+1): A = sol motor, B = sağ motor. Sürücü yoksa NaN (her karşılaştırma yanlış). */
const chans = (s: ExamScenario, drv: PartType): [number, number] => {
  const c = s.state.parts[s.idsOf(drv)[0]]?.driver?.channels
  return [c?.[0]?.out ?? NaN, c?.[1]?.out ?? NaN]
}
const motorSpeed = (s: ExamScenario) => s.state.parts[s.idsOf('dcmotor')[0]]?.dcmotor?.speed ?? NaN
const count = (code: string, re: RegExp) => (noComments(code).match(re) ?? []).length
const code = (ctx: ExamGoalCtx) => noComments(ctx.code)
const STARTER = (title: string) => () => ({ circuit: unoOnly(), code: skeleton(title) })

const l298nWires = (): Array<[string, string]> => [
  ['d.12V', 'uno.5V'], ['d.GND', 'uno.GND2'], ['d.ENA', 'uno.D5'], ['d.IN1', 'uno.D6'], ['d.IN2', 'uno.D7'],
  ['d.IN3', 'uno.D8'], ['d.IN4', 'uno.D9'], ['d.ENB', 'uno.D10'],
  ['d.OUT1', 'ml.M1'], ['d.OUT2', 'ml.M2'], ['d.OUT3', 'mr.M1'], ['d.OUT4', 'mr.M2'],
]
const l298nParts = () => [part('d', 'l298n', 640, 40), part('ml', 'dcmotor', 860, 40), part('mr', 'dcmotor', 860, 140)]
const L298N_BRIEF = `Motor driver (L298N): 12V -> Uno 5V, GND -> Uno GND, ENA -> D5, IN1 -> D6, IN2 -> D7, IN3 -> D8, IN4 -> D9, ENB -> D10.
Left motor between OUT1 (M1) and OUT2 (M2); right motor between OUT3 (M1) and OUT4 (M2).
Channel A (ENA/IN1/IN2) drives the left motor, channel B (ENB/IN3/IN4) the right motor. A motor runs forward when its IN(odd) is HIGH and IN(even) is LOW; ENA/ENB carry the PWM speed.`
const l298nPowerGoal = (id: string, pts: number): ExamGoal => ({
  id, kind: 'circuit', points: pts, text: 'Wire the L298N: 12V to Uno 5V, GND to Uno GND, ENA to D5, IN1 to D6, IN2 to D7, IN3 to D8, IN4 to D9, ENB to D10.',
  check: (c) => allWired(c, 'l298n', { '12V': '5V', GND: 'GND', ENA: 'D5', IN1: 'D6', IN2: 'D7', IN3: 'D8', IN4: 'D9', ENB: 'D10' }),
})
const l298nMotorGoal = (id: string, pts: number): ExamGoal => ({
  id, kind: 'circuit', points: pts, text: 'Connect the left DC motor to OUT1 (M1) and OUT2 (M2) and the right DC motor to OUT3 (M1) and OUT4 (M2).',
  check: (c) => motorOn(c, 'l298n', 'OUT1', 'OUT2') && motorOn(c, 'l298n', 'OUT3', 'OUT4'),
})

/** IR modülün hangi Uno pinine bağlı olduğunu, o modülü tek başına "görüyor" yaparak bulur. Bulunamazsa null. */
const irIdOnPin = (s: ExamScenario, unoPin: string): string | null => {
  let found: string | null = null
  const ids = s.idsOf('irobstacle')
  for (const id of ids) {
    s.setAll('irobstacle', 'proximity', 0.1)
    s.setProp(id, 'proximity', 0.9)
    s.advance(20)
    if (s.state.pins[unoPin]?.high === false) found = id
  }
  s.setAll('irobstacle', 'proximity', 0.1)
  return found
}

// ================================================================ p18 line follower
const P18_TITLE = 'Line-Follower Robot'
const p18Circuit = (): Circuit => build([
  part('irl', 'irobstacle', 360, 250, { proximity: 0.1, threshold: 0.5 }), part('irr', 'irobstacle', 470, 250, { proximity: 0.1, threshold: 0.5 }),
  ...l298nParts(),
], [
  ['irl.VCC', 'uno.5V'], ['irl.GND', 'uno.GND'], ['irl.OUT', 'uno.D2'], ['irr.VCC', 'uno.5V'], ['irr.GND', 'uno.GND3'], ['irr.OUT', 'uno.D3'],
  ...l298nWires(),
])
const P18_CODE = `const int IR_L = 2, IR_R = 3;
const int ENA = 5, IN1 = 6, IN2 = 7, IN3 = 8, IN4 = 9, ENB = 10;
const int SPEED = 150;

void drive(int left, int right) {
  digitalWrite(IN1, left > 0);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, left);
  digitalWrite(IN3, right > 0);
  digitalWrite(IN4, LOW);
  analogWrite(ENB, right);
}

void setup() {
  pinMode(IR_L, INPUT);
  pinMode(IR_R, INPUT);
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
}

void loop() {
  bool left = digitalRead(IR_L) == LOW;
  bool right = digitalRead(IR_R) == LOW;
  if (left && right) drive(SPEED, SPEED);
  else if (left) drive(0, SPEED);
  else if (right) drive(SPEED, 0);
  else drive(0, 0);
}
`
const p18: ExamProject = {
  id: 'p18', title: P18_TITLE, weeks: [5, 7],
  story: 'A warehouse robot follows a black line on the floor with two IR sensors and two driven wheels.',
  brief: `Build a two-wheel line follower.
Sensors: two IR obstacle modules (VCC -> 5V, GND -> GND). Left sensor OUT -> D2, right sensor OUT -> D3. A sensor OUT is LOW when it sees the line.
${L298N_BRIEF}
Behaviour (speed = analogWrite value 150 on the enabled channel):
- Both sensors see the line: both motors forward.
- Only the left sensor sees the line: turn left - left motor stopped, right motor forward.
- Only the right sensor sees the line: turn right - right motor stopped, left motor forward.
- Neither sees the line: both motors stopped.`,
  allowedParts: ['irobstacle', 'l298n', 'dcmotor', 'l293d', 'led'],
  starter: STARTER(P18_TITLE),
  goals: [
    { id: 'ir', kind: 'circuit', points: 10, text: 'Wire both IR modules: VCC to 5V, GND to GND, left OUT to D2 and right OUT to D3.',
      check: (c) => allWired(c, 'irobstacle', { VCC: '5V', GND: 'GND', OUT: 'D2' }) && allWired(c, 'irobstacle', { VCC: '5V', GND: 'GND', OUT: 'D3' }) },
    l298nPowerGoal('driver', 15), l298nMotorGoal('motors', 10),
    { id: 'pwm', kind: 'code', points: 10, text: 'Set the motor speed with analogWrite() on the enable pins (ENA and ENB).', check: (c) => count(c.code, /analogWrite\s*\(/g) >= 1 },
    { id: 'read', kind: 'code', points: 10, text: 'Read both IR sensors with digitalRead() (two sensor reads in your code).', check: (c) => count(c.code, /digitalRead\s*\(/g) >= 2 || /for\s*\([^)]*\)[^;{]*digitalRead|digitalRead[^;]*\[/.test(code(c)) },
    { id: 'straight', kind: 'behavior', points: 15, text: 'Both sensors on the line: both motors run forward at part speed (PWM 150, not full speed).', check: (c) => c.marks.straight === true },
    { id: 'left', kind: 'behavior', points: 10, text: 'Only the left sensor on the line: left motor stopped, right motor forward.', check: (c) => c.marks.left === true },
    { id: 'right', kind: 'behavior', points: 10, text: 'Only the right sensor on the line: right motor stopped, left motor forward.', check: (c) => c.marks.right === true },
    { id: 'lost', kind: 'behavior', points: 10, text: 'Line lost (no sensor on the line): both motors stopped.', check: (c) => c.marks.lost === true },
  ],
  scenario: (s) => {
    const L = irIdOnPin(s, 'D2'), R = irIdOnPin(s, 'D3')
    const set = (l: boolean, r: boolean) => {
      s.setAll('irobstacle', 'proximity', 0.1)
      if (L) s.setProp(L, 'proximity', l ? 0.9 : 0.1)
      if (R) s.setProp(R, 'proximity', r ? 0.9 : 0.1)
      s.advance(600)
    }
    const ok = !!L && !!R && L !== R
    set(true, true); { const [a, b] = chans(s, 'l298n'); s.mark('straight', ok && a > 0.2 && a < 0.65 && b > 0.2 && b < 0.65) }
    set(true, false); { const [a, b] = chans(s, 'l298n'); s.mark('left', ok && Math.abs(a) < 0.05 && b > 0.2) }
    set(false, true); { const [a, b] = chans(s, 'l298n'); s.mark('right', ok && a > 0.2 && Math.abs(b) < 0.05) }
    set(false, false); { const [a, b] = chans(s, 'l298n'); s.mark('lost', ok && Math.abs(a) < 0.05 && Math.abs(b) < 0.05) }
  },
  solution: () => ({ circuit: p18Circuit(), code: P18_CODE }),
}

// ================================================================ p19 obstacle-avoiding rover
const P19_TITLE = 'Obstacle-Avoiding Rover'
const p19Circuit = (): Circuit => build([part('us', 'hcsr04', 360, 250, { distanceCm: 100 }), ...l298nParts()], [
  ['us.VCC', 'uno.5V'], ['us.GND', 'uno.GND'], ['us.TRIG', 'uno.D11'], ['us.ECHO', 'uno.D12'], ...l298nWires(),
])
const P19_CODE = `const int TRIG = 11, ECHO = 12;
const int ENA = 5, IN1 = 6, IN2 = 7, IN3 = 8, IN4 = 9, ENB = 10;
const int SPEED = 150;

long readCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  return us == 0 ? 999 : us / 58;
}

void drive(int left, int right) {
  digitalWrite(IN1, left > 0);
  digitalWrite(IN2, left < 0);
  analogWrite(ENA, abs(left));
  digitalWrite(IN3, right > 0);
  digitalWrite(IN4, right < 0);
  analogWrite(ENB, abs(right));
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
}

void loop() {
  if (readCm() < 20) {
    drive(-SPEED, -SPEED);
    delay(600);
    drive(SPEED, -SPEED);
    delay(600);
  } else {
    drive(SPEED, SPEED);
  }
  delay(30);
}
`
const p19: ExamProject = {
  id: 'p19', title: P19_TITLE, weeks: [5, 7],
  story: 'A small rover drives around a room and must back away from walls instead of crashing into them.',
  brief: `Build an obstacle-avoiding rover.
Sensor: HC-SR04 (VCC -> 5V, GND -> GND, TRIG -> D11, ECHO -> D12), mounted at the front.
${L298N_BRIEF}
Behaviour (all speeds are analogWrite 150):
- Distance >= 20 cm (or no echo): drive forward with both motors.
- Distance < 20 cm: first back up with both motors reversed for 600 ms, then spin to the right for 600 ms (left motor forward, right motor reversed), then measure again.
Use pulseIn() with a timeout so the rover never freezes when no echo returns.`,
  allowedParts: ['hcsr04', 'l298n', 'dcmotor', 'servo', 'led'],
  starter: STARTER(P19_TITLE),
  goals: [
    { id: 'sensor', kind: 'circuit', points: 10, text: 'Wire the HC-SR04: VCC to 5V, GND to GND, TRIG to D11, ECHO to D12.', check: (c) => allWired(c, 'hcsr04', { VCC: '5V', GND: 'GND', TRIG: 'D11', ECHO: 'D12' }) },
    l298nPowerGoal('driver', 15), l298nMotorGoal('motors', 10),
    { id: 'pulsein', kind: 'code', points: 10, text: 'Measure the echo with pulseIn() and give it a timeout (third argument).', check: (c) => /pulseIn\s*\(\s*\w+\s*,\s*HIGH\s*,\s*[^)]+\)/.test(code(c)) },
    { id: 'pwm', kind: 'code', points: 10, text: 'Set the motor speed with analogWrite() on the enable pins.', check: (c) => /analogWrite\s*\(/.test(code(c)) },
    { id: 'forward', kind: 'behavior', points: 10, text: 'Clear path (100 cm): both motors forward at reduced speed (PWM 150).', check: (c) => c.marks.forward === true },
    { id: 'reverse', kind: 'behavior', points: 12, text: 'Obstacle at 15 cm: both motors reverse (backing up).', check: (c) => c.marks.reverse === true },
    { id: 'spin', kind: 'behavior', points: 13, text: 'After backing up, spin right: left motor forward and right motor reversed.', check: (c) => c.marks.spin === true },
    { id: 'resume', kind: 'behavior', points: 10, text: 'When the obstacle is gone, drive forward again.', check: (c) => c.marks.resume === true },
  ],
  scenario: (s) => {
    s.setAll('hcsr04', 'distanceCm', 100)
    s.advance(800)
    { const [a, b] = chans(s, 'l298n'); s.mark('forward', a > 0.2 && a < 0.65 && b > 0.2 && b < 0.65) }
    s.setAll('hcsr04', 'distanceCm', 15)
    s.advance(300)
    { const [a, b] = chans(s, 'l298n'); s.mark('reverse', a < -0.2 && b < -0.2) }
    s.advance(600)
    { const [a, b] = chans(s, 'l298n'); s.mark('spin', a > 0.2 && b < -0.2) }
    s.setAll('hcsr04', 'distanceCm', 100)
    s.advance(900)
    { const [a, b] = chans(s, 'l298n'); s.mark('resume', a > 0.2 && b > 0.2) }
  },
  solution: () => ({ circuit: p19Circuit(), code: P19_CODE }),
}

// ================================================================ p20 servo radar
const P20_TITLE = 'Servo Radar Scanner'
const p20Circuit = (): Circuit => build([
  part('sv', 'servo', 360, 240), part('us', 'hcsr04', 520, 240, { distanceCm: 100 }), part('bz', 'buzzer', 700, 240, { kind: 'active' }),
], [
  ['sv.SIG', 'uno.D9'], ['sv.VCC', 'uno.5V'], ['sv.GND', 'uno.GND'],
  ['us.VCC', 'uno.5V'], ['us.GND', 'uno.GND2'], ['us.TRIG', 'uno.D7'], ['us.ECHO', 'uno.D8'],
  ['bz.+', 'uno.D6'], ['bz.-', 'uno.GND3'],
])
const P20_CODE = `#include <Servo.h>

const int TRIG = 7, ECHO = 8, BUZ = 6;
Servo radar;

long readCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  return pulseIn(ECHO, HIGH, 30000) / 58;
}

void scan(int angle) {
  radar.write(angle);
  delay(100);
  long cm = readCm();
  Serial.print(angle);
  Serial.print(",");
  Serial.println(cm);
  digitalWrite(BUZ, cm > 0 && cm < 20);
}

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(BUZ, OUTPUT);
  radar.attach(9);
}

void loop() {
  for (int a = 0; a <= 180; a += 15) scan(a);
  for (int a = 165; a >= 15; a -= 15) scan(a);
}
`
const parseRadar = (txt: string) => [...txt.matchAll(/^(\d+),(\d+)\r?$/gm)].map((m) => ({ a: +m[1], d: +m[2] }))
const p20: ExamProject = {
  id: 'p20', title: P20_TITLE, weeks: [6],
  story: 'A security post uses a servo-mounted ultrasonic sensor as a cheap radar that sweeps the area and warns about close intruders.',
  brief: `Build a servo radar.
Servo: SIG -> D9, VCC -> 5V, GND -> GND. HC-SR04: VCC -> 5V, GND -> GND, TRIG -> D7, ECHO -> D8 (mounted on the servo horn). Active buzzer: + -> D6, - -> GND.
Behaviour:
- Sweep the servo from 0 to 180 degrees and back in 15 degree steps (0, 15, ... 180, 165, ... 15, repeat).
- At each angle: move the servo, wait 100 ms for it to settle, then measure the distance in whole centimetres.
- For every measurement print one line to the serial monitor (9600 baud) in the format "angle,distance", for example "45,120".
- The buzzer sounds (D6 HIGH) while the latest measured distance is below 20 cm, otherwise it is silent.`,
  allowedParts: ['servo', 'hcsr04', 'buzzer', 'led', 'resistor'],
  starter: STARTER(P20_TITLE),
  goals: [
    { id: 'servo', kind: 'circuit', points: 12, text: 'Wire the servo: SIG to D9, VCC to 5V, GND to GND.', check: (c) => allWired(c, 'servo', { SIG: 'D9', VCC: '5V', GND: 'GND' }) },
    { id: 'sensor', kind: 'circuit', points: 13, text: 'Wire the HC-SR04: VCC to 5V, GND to GND, TRIG to D7, ECHO to D8.', check: (c) => allWired(c, 'hcsr04', { VCC: '5V', GND: 'GND', TRIG: 'D7', ECHO: 'D8' }) },
    { id: 'buzzer', kind: 'circuit', points: 10, text: 'Wire the buzzer: + to D6, - to GND.', check: (c) => allWired(c, 'buzzer', { '+': 'D6', '-': 'GND' }) },
    { id: 'servolib', kind: 'code', points: 10, text: 'Control the servo with the Servo library (#include <Servo.h>, attach() and write()).', check: (c) => /#include\s*<Servo\.h>/.test(code(c)) && /\.attach\s*\(/.test(code(c)) && /\.write\s*\(/.test(code(c)) },
    { id: 'format', kind: 'code', points: 10, text: 'Print the angle, a comma and the distance with Serial (one line per measurement).', check: (c) => /Serial\s*\.\s*begin/.test(code(c)) && /Serial\s*\.\s*print\w*\s*\(\s*(['"]\s*,\s*['"]|','|[^;]*['"]\s*,\s*['"])/.test(code(c)) },
    { id: 'sweep', kind: 'behavior', points: 12, text: 'The servo sweeps across the whole range, at least from 15 degrees or less up to 165 degrees or more.', check: (c) => c.marks.sweep === true },
    { id: 'lines', kind: 'behavior', points: 12, text: 'Serial lines look like "angle,distance" with angles that are multiples of 15 between 0 and 180 (at least 12 lines in 4 s).', check: (c) => c.marks.lines === true },
    { id: 'distance', kind: 'behavior', points: 11, text: 'The printed distance matches the sensor (about 100 cm, then about 15 cm after the object moves closer).', check: (c) => c.marks.d100 === true && c.marks.d15 === true },
    { id: 'alarm', kind: 'behavior', points: 10, text: 'The buzzer is silent at 100 cm and sounds when the object is 15 cm away.', check: (c) => c.marks.quiet === true && c.marks.alarm === true },
  ],
  scenario: (s) => {
    s.setAll('hcsr04', 'distanceCm', 100)
    let lo = 999, hi = -1
    const buz = () => s.idsOf('buzzer').some((id) => s.state.parts[id]?.buzzer?.on === true)
    let quiet = true
    for (let t = 0; t < 4000; t += 50) {
      s.advance(50)
      const a = s.state.parts[s.idsOf('servo')[0]]?.servo?.angleDeg
      if (a !== undefined) { lo = Math.min(lo, a); hi = Math.max(hi, a) }
      if (t > 300 && buz()) quiet = false
    }
    s.mark('sweep', lo <= 15 && hi >= 165)
    const L = parseRadar(s.serial)
    s.mark('lines', L.length >= 12 && L.every((r) => r.a <= 180 && r.a % 15 === 0) && new Set(L.map((r) => r.a)).size >= 10)
    s.mark('d100', L.length > 0 && L.every((r) => Math.abs(r.d - 100) <= 3))
    s.mark('quiet', quiet)
    s.setAll('hcsr04', 'distanceCm', 15)
    s.advance(3000)
    const M = parseRadar(s.serial).slice(-9, -1)
    s.mark('d15', M.length >= 8 && M.every((r) => Math.abs(r.d - 15) <= 2))
    s.mark('alarm', buz())
  },
  solution: () => ({ circuit: p20Circuit(), code: P20_CODE }),
}

// ================================================================ p21 conveyor belt
const P21_TITLE = 'Conveyor Belt Counter'
const p21Circuit = (): Circuit => build([
  part('st', 'stepper', 360, 220, { microsteps: '8' }), part('ir', 'irobstacle', 560, 240, { proximity: 0, threshold: 0.5 }), part('b', 'button', 700, 260),
], [
  ['st.VCC', 'uno.5V'], ['st.GND', 'uno.GND'], ['st.STEP', 'uno.D3'], ['st.DIR', 'uno.D4'], ['st.EN', 'uno.D8'],
  ['ir.VCC', 'uno.5V'], ['ir.GND', 'uno.GND2'], ['ir.OUT', 'uno.D2'], ['b.A', 'uno.D12'], ['b.B', 'uno.GND3'],
])
const P21_CODE = `const int STEP = 3, DIR = 4, EN = 8, IR = 2, BTN = 12;
bool running = false, seen = false, lastBtn = HIGH;
int count = 0;

void setRunning(bool on) {
  running = on;
  digitalWrite(EN, on ? LOW : HIGH);
}

void setup() {
  Serial.begin(9600);
  pinMode(STEP, OUTPUT);
  pinMode(DIR, OUTPUT);
  pinMode(EN, OUTPUT);
  pinMode(IR, INPUT);
  pinMode(BTN, INPUT_PULLUP);
  digitalWrite(DIR, HIGH);
  setRunning(false);
}

void loop() {
  bool b = digitalRead(BTN);
  if (lastBtn == HIGH && b == LOW) {
    if (count >= 3) count = 0;
    setRunning(!running);
    delay(20);
  }
  lastBtn = b;

  bool object = digitalRead(IR) == LOW;
  if (object && !seen) {
    count++;
    Serial.print("COUNT:");
    Serial.println(count);
    if (count >= 3) {
      setRunning(false);
      Serial.println("BATCH DONE");
    }
  }
  seen = object;

  if (running) {
    digitalWrite(STEP, HIGH);
    delayMicroseconds(500);
    digitalWrite(STEP, LOW);
    delayMicroseconds(500);
  }
}
`
const stepperRt = (s: ExamScenario) => s.state.parts[s.idsOf('stepper')[0]]?.stepper
const p21: ExamProject = {
  id: 'p21', title: P21_TITLE, weeks: [5, 6],
  story: 'A packing line moves boxes on a stepper-driven belt; an IR gate at the end counts the boxes and stops the belt after each batch of three.',
  brief: `Build a conveyor belt controller.
Stepper driver (TMC2209 + NEMA17 module): VCC -> 5V, GND -> GND, STEP -> D3, DIR -> D4, EN -> D8 (EN is active LOW: LOW enables the motor).
IR obstacle module (box gate): VCC -> 5V, GND -> GND, OUT -> D2 (OUT is LOW while a box is in front of it).
Start/stop button: one leg -> D12, the other leg -> GND (use INPUT_PULLUP).
Behaviour:
- After reset the belt is stopped and the motor disabled (EN HIGH).
- Each press of the button toggles the belt between running and stopped. Running = motor enabled, DIR HIGH (forward), one STEP pulse about every 1 ms.
- Every box is counted once, when it arrives at the IR gate (a box that stays in front of the gate for a long time still counts once). On each new box print "COUNT:n" (n = boxes counted so far) at 9600 baud.
- When the count reaches 3, stop the belt, disable the motor and print "BATCH DONE". The next button press starts a new batch (count back to 0).`,
  allowedParts: ['stepper', 'irobstacle', 'button', 'led', 'resistor'],
  starter: STARTER(P21_TITLE),
  goals: [
    { id: 'stepper', kind: 'circuit', points: 13, text: 'Wire the stepper driver: VCC to 5V, GND to GND, STEP to D3, DIR to D4, EN to D8.', check: (c) => allWired(c, 'stepper', { VCC: '5V', GND: 'GND', STEP: 'D3', DIR: 'D4', EN: 'D8' }) },
    { id: 'ir', kind: 'circuit', points: 11, text: 'Wire the IR module: VCC to 5V, GND to GND, OUT to D2.', check: (c) => allWired(c, 'irobstacle', { VCC: '5V', GND: 'GND', OUT: 'D2' }) },
    { id: 'button', kind: 'circuit', points: 11, text: 'Wire the start/stop button between D12 and GND.',
      check: (c) => partsOf(c.circuit, 'button').some((b) => (toUno(c, b.id, 'A', 'D12') && toGnd(c, b.id, 'B')) || (toUno(c, b.id, 'B', 'D12') && toGnd(c, b.id, 'A'))) },
    { id: 'pullup', kind: 'code', points: 7, text: 'Configure the button pin with INPUT_PULLUP.', check: (c) => /INPUT_PULLUP/.test(code(c)) },
    { id: 'pulse', kind: 'code', points: 7, text: 'Generate STEP pulses by hand: a HIGH/LOW pair on STEP separated by delayMicroseconds() (or delay()).', check: (c) => /delayMicroseconds\s*\(|delay\s*\(/.test(code(c)) && count(c.code, /digitalWrite\s*\(/g) >= 3 },
    { id: 'print', kind: 'code', points: 6, text: 'Print the count with Serial as "COUNT:n".', check: (c) => /Serial\s*\.\s*begin/.test(code(c)) && /["']\s*COUNT\s*:/.test(code(c)) },
    { id: 'idle', kind: 'behavior', points: 5, text: 'Before the first button press the belt does not move.', check: (c) => c.marks.idle === true },
    { id: 'run', kind: 'behavior', points: 10, text: 'A button press starts the belt: motor enabled, DIR HIGH, the step counter increases.', check: (c) => c.marks.run === true },
    { id: 'count', kind: 'behavior', points: 12, text: 'Each box is counted exactly once: "COUNT:1" and "COUNT:2" appear (even when a box stays in front of the gate for 400 ms).', check: (c) => c.marks.c1 === true && c.marks.c2 === true },
    { id: 'toggle', kind: 'behavior', points: 8, text: 'A second button press stops the belt and a third press starts it again.', check: (c) => c.marks.stop === true && c.marks.restart === true },
    { id: 'batch', kind: 'behavior', points: 10, text: 'The third box prints "COUNT:3" and "BATCH DONE" and stops the belt.', check: (c) => c.marks.batch === true && c.marks.batchstop === true },
  ],
  scenario: (s) => {
    const press = () => { s.setAll('button', 'pressed', true); s.advance(80); s.setAll('button', 'pressed', false) }
    const steps = () => stepperRt(s)?.steps ?? NaN
    s.setAll('irobstacle', 'proximity', 0)
    s.advance(300)
    s.mark('idle', steps() === 0)
    press(); s.advance(500)
    s.mark('run', steps() > 200 && stepperRt(s)?.dirHigh === true && stepperRt(s)?.enabled === true)
    s.setAll('irobstacle', 'proximity', 0.9); s.advance(400); s.setAll('irobstacle', 'proximity', 0); s.advance(200)
    s.mark('c1', /COUNT:\s*1\b/.test(s.serial) && !/COUNT:\s*2/.test(s.serial))
    s.setAll('irobstacle', 'proximity', 0.9); s.advance(150); s.setAll('irobstacle', 'proximity', 0); s.advance(200)
    s.mark('c2', /COUNT:\s*2\b/.test(s.serial) && !/COUNT:\s*3/.test(s.serial))
    press(); s.advance(100)
    const a = steps(); s.advance(300)
    s.mark('stop', steps() === a)
    press(); s.advance(400)
    s.mark('restart', steps() > a + 100)
    s.setAll('irobstacle', 'proximity', 0.9); s.advance(200); s.setAll('irobstacle', 'proximity', 0); s.advance(100)
    s.mark('batch', /COUNT:\s*3\b/.test(s.serial) && /BATCH DONE/.test(s.serial))
    const b = steps(); s.advance(300)
    s.mark('batchstop', steps() === b)
  },
  solution: () => ({ circuit: p21Circuit(), code: P21_CODE }),
}

// ================================================================ p22 light-seeking P controller
const P22_TITLE = 'Daylight-Balancing Lamp'
const p22Circuit = (): Circuit => build([
  part('ldr', 'ldr', 360, 240, { light: 0.5 }), part('rd', 'resistor', 480, 240, { ohms: 10000 }),
  part('rl', 'resistor', 600, 240, { ohms: 220 }), part('led', 'led', 720, 240, { color: 'white' }),
], [
  ['ldr.1', 'uno.5V'], ['ldr.2', 'uno.A0'], ['rd.1', 'uno.A0'], ['rd.2', 'uno.GND'],
  ['uno.D9', 'rl.1'], ['rl.2', 'led.A'], ['led.K', 'uno.GND2'],
])
const P22_CODE = `const int LDR_PIN = A0;
const int LAMP = 9;
const int SETPOINT = 700;
const float KP = 0.5;

void setup() {
  Serial.begin(9600);
  pinMode(LAMP, OUTPUT);
}

void loop() {
  int adc = analogRead(LDR_PIN);
  int pwm = constrain((int)(KP * (SETPOINT - adc)), 0, 255);
  analogWrite(LAMP, pwm);
  Serial.print(adc);
  Serial.print(",");
  Serial.println(pwm);
  delay(100);
}
`
const lastLine = (txt: string) => { const m = [...txt.matchAll(/^(\d+),(\d+)\s*$/gm)].pop(); return m ? { adc: +m[1], pwm: +m[2] } : null }
const p22: ExamProject = {
  id: 'p22', title: P22_TITLE, weeks: [6, 7],
  story: 'A greenhouse lamp should top up the daylight: the darker it gets, the brighter the lamp, using a proportional (P) controller.',
  brief: `Build a proportional light controller.
Light sensor: LDR with one leg on 5V and the other leg on A0; a 10 kOhm resistor from A0 to GND (voltage divider; a higher light level gives a higher A0 reading).
Lamp: white LED on D9 (PWM) through a 220 Ohm resistor, cathode to GND.
Control law (run every 100 ms):
  adc = analogRead(A0)            (0..1023)
  error = 700 - adc               (setpoint 700)
  pwm = Kp * error, Kp = 0.5, limited to the range 0..255 (no negative output, no overflow)
  analogWrite(D9, pwm)
After each cycle print one line "adc,pwm" at 9600 baud, for example "512,94".`,
  allowedParts: ['ldr', 'resistor', 'led', 'pot', 'buzzer'],
  starter: STARTER(P22_TITLE),
  goals: [
    { id: 'divider', kind: 'circuit', points: 20, text: 'Build the LDR divider: one LDR leg on 5V, the other on A0, and a 10 kOhm resistor from A0 to GND.',
      check: (c) => partsOf(c.circuit, 'ldr').some((l) => (to5V(c, l.id, '1') && toUno(c, l.id, '2', 'A0')) || (to5V(c, l.id, '2') && toUno(c, l.id, '1', 'A0')))
        && partsOf(c.circuit, 'resistor').some((r) => (toUno(c, r.id, '1', 'A0') && toGnd(c, r.id, '2')) || (toUno(c, r.id, '2', 'A0') && toGnd(c, r.id, '1'))) },
    { id: 'lamp', kind: 'circuit', points: 15, text: 'Connect the lamp LED to D9 through a series resistor, cathode to GND.',
      check: (c) => partsOf(c.circuit, 'led').some((l) => viaResistor(c, pin('uno', 'D9'), pin(l.id, 'A')) && toGnd(c, l.id, 'K')) },
    { id: 'analog', kind: 'code', points: 7, text: 'Read the sensor with analogRead() and drive the lamp with analogWrite().', check: (c) => /analogRead\s*\(/.test(code(c)) && /analogWrite\s*\(/.test(code(c)) },
    { id: 'clamp', kind: 'code', points: 7, text: 'Limit the output to 0..255 (constrain(), min()/max() or explicit comparisons).', check: (c) => /constrain\s*\(|\bmin\s*\(|\bmax\s*\(|>\s*255|<\s*0/.test(code(c)) },
    { id: 'print', kind: 'code', points: 6, text: 'Print the "adc,pwm" line with Serial (begin + print/println).', check: (c) => /Serial\s*\.\s*begin/.test(code(c)) && /Serial\s*\.\s*print/.test(code(c)) },
    { id: 'dark', kind: 'behavior', points: 12, text: 'In the dark the lamp is bright (LED brightness above 0.3).', check: (c) => c.marks.dark === true },
    { id: 'bright', kind: 'behavior', points: 11, text: 'In bright light the lamp is off.', check: (c) => c.marks.bright === true },
    { id: 'prop', kind: 'behavior', points: 12, text: 'Proportional response: the lamp gets dimmer step by step as the light increases, with intermediate PWM values.', check: (c) => c.marks.prop === true },
    { id: 'law', kind: 'behavior', points: 10, text: 'Every printed line follows pwm = constrain(0.5 * (700 - adc), 0, 255) within 3 counts.', check: (c) => c.marks.law === true },
  ],
  scenario: (s) => {
    const levels = [0.05, 0.3, 0.5, 0.7, 0.95]
    const br: number[] = [], pw: number[] = []
    for (const l of levels) {
      s.setAll('ldr', 'light', l)
      s.advance(600)
      br.push(Math.max(0, ...s.idsOf('led').map((id) => s.state.parts[id]?.led?.brightness ?? 0)))
      pw.push(lastLine(s.serial)?.pwm ?? NaN)
    }
    s.mark('dark', br[0] > 0.3)
    s.mark('bright', br[4] < 0.02 && pw[4] === 0)
    s.mark('prop', br.every((v, i) => i === 0 || v <= br[i - 1] + 0.01) && br[0] > br[4] + 0.3 && pw.some((p) => p >= 20 && p <= 235)
      && pw.every((p, i) => i === 0 || p <= pw[i - 1]) && new Set(pw).size >= 3)
    const L = [...s.serial.matchAll(/^(\d+),(\d+)\s*$/gm)].map((m) => ({ adc: +m[1], pwm: +m[2] }))
    s.mark('law', L.length >= 10 && L.every((r) => Math.abs(r.pwm - Math.min(255, Math.max(0, 0.5 * (700 - r.adc)))) <= 3))
  },
  solution: () => ({ circuit: p22Circuit(), code: P22_CODE }),
}

// ================================================================ p23 motor speed & direction panel
const P23_TITLE = 'Motor Speed and Direction Panel'
const p23Circuit = (): Circuit => build([
  part('d', 'l293d', 520, 40), part('m', 'dcmotor', 740, 60), part('pot', 'pot', 360, 250, { position: 0.5 }), part('b', 'button', 520, 300),
], [
  ['d.VCC1', 'uno.5V'], ['d.VCC2', 'uno.5V'], ['d.GND', 'uno.GND'], ['d.EN12', 'uno.D5'], ['d.IN1', 'uno.D6'], ['d.IN2', 'uno.D7'],
  ['d.OUT1', 'm.M1'], ['d.OUT2', 'm.M2'],
  ['pot.VCC', 'uno.5V'], ['pot.GND', 'uno.GND2'], ['pot.SIG', 'uno.A0'], ['b.A', 'uno.D2'], ['b.B', 'uno.GND3'],
])
const P23_CODE = `const int EN = 5, IN1 = 6, IN2 = 7, POT = A0, BTN = 2;
bool forward = true;
bool lastBtn = HIGH;

void setup() {
  pinMode(EN, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(BTN, INPUT_PULLUP);
}

void loop() {
  bool b = digitalRead(BTN);
  if (lastBtn == HIGH && b == LOW) {
    analogWrite(EN, 0);
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    delay(200);
    forward = !forward;
  }
  lastBtn = b;

  int speed = map(analogRead(POT), 0, 1023, 0, 255);
  if (speed < 13) speed = 0;
  digitalWrite(IN1, forward);
  digitalWrite(IN2, !forward);
  analogWrite(EN, speed);
  delay(10);
}
`
const p23: ExamProject = {
  id: 'p23', title: P23_TITLE, weeks: [5, 6],
  story: 'A workshop test bench needs a hand-operated panel: a knob sets the motor speed and a button reverses its direction.',
  brief: `Build a motor control panel.
Motor driver (L293D): VCC1 -> 5V, VCC2 -> 5V, GND -> GND, EN12 -> D5 (PWM speed), IN1 -> D6, IN2 -> D7. DC motor between OUT1 (M1) and OUT2 (M2).
Potentiometer: VCC -> 5V, GND -> GND, SIG -> A0. Direction button: one leg -> D2, the other leg -> GND (use INPUT_PULLUP).
Behaviour:
- Speed: map the potentiometer (0..1023) to PWM 0..255 on EN12. Forward = IN1 HIGH, IN2 LOW; reverse = IN1 LOW, IN2 HIGH. After reset the direction is forward.
- Dead zone: if the PWM value computed from the knob is below 13, switch the motor off (PWM 0).
- Each button press (one press = one change, holding the button must not toggle repeatedly) reverses the direction. Before reversing, stop the motor (EN 0, both IN LOW) for 200 ms.`,
  allowedParts: ['l293d', 'dcmotor', 'pot', 'button', 'led', 'resistor'],
  starter: STARTER(P23_TITLE),
  goals: [
    { id: 'power', kind: 'circuit', points: 10, text: 'Power the L293D: VCC1 to 5V, VCC2 to 5V, GND to GND.', check: (c) => allWired(c, 'l293d', { VCC1: '5V', VCC2: '5V', GND: 'GND' }) },
    { id: 'control', kind: 'circuit', points: 10, text: 'Wire the L293D control pins: EN12 to D5, IN1 to D6, IN2 to D7.', check: (c) => allWired(c, 'l293d', { EN12: 'D5', IN1: 'D6', IN2: 'D7' }) },
    { id: 'motor', kind: 'circuit', points: 5, text: 'Connect the DC motor between OUT1 (M1) and OUT2 (M2).', check: (c) => motorOn(c, 'l293d', 'OUT1', 'OUT2') },
    { id: 'pot', kind: 'circuit', points: 5, text: 'Wire the potentiometer: VCC to 5V, GND to GND, SIG to A0.', check: (c) => allWired(c, 'pot', { VCC: '5V', GND: 'GND', SIG: 'A0' }) },
    { id: 'button', kind: 'circuit', points: 5, text: 'Wire the direction button between D2 and GND.',
      check: (c) => partsOf(c.circuit, 'button').some((b) => (toUno(c, b.id, 'A', 'D2') && toGnd(c, b.id, 'B')) || (toUno(c, b.id, 'B', 'D2') && toGnd(c, b.id, 'A'))) },
    { id: 'pwm', kind: 'code', points: 7, text: 'Drive EN12 with analogWrite().', check: (c) => /analogWrite\s*\(/.test(code(c)) },
    { id: 'scale', kind: 'code', points: 7, text: 'Scale analogRead() (0..1023) to a PWM value (0..255) with map(), division by 4 or a shift.', check: (c) => /analogRead\s*\(/.test(code(c)) && (/map\s*\([^;]*1023[^;]*255/.test(code(c)) || /\/\s*4\b|>>\s*2\b/.test(code(c))) },
    { id: 'pullup', kind: 'code', points: 6, text: 'Configure the button pin with INPUT_PULLUP.', check: (c) => /INPUT_PULLUP/.test(code(c)) },
    { id: 'speed', kind: 'behavior', points: 12, text: 'Motor speed follows the knob: forward at 50 % and faster at 100 %.', check: (c) => c.marks.fwd === true && c.marks.prop === true },
    { id: 'deadzone', kind: 'behavior', points: 8, text: 'With the knob at 0 the motor is stopped.', check: (c) => c.marks.stop === true },
    { id: 'reverse', kind: 'behavior', points: 13, text: 'One button press reverses the motor (negative speed); speed still follows the knob.', check: (c) => c.marks.rev === true },
    { id: 'toggle', kind: 'behavior', points: 12, text: 'A second press makes it run forward again (exactly one change per press).', check: (c) => c.marks.back === true },
  ],
  scenario: (s) => {
    const press = () => { s.setAll('button', 'pressed', true); s.advance(80); s.setAll('button', 'pressed', false) }
    s.setAll('pot', 'position', 0.5); s.advance(600)
    const v1 = motorSpeed(s)
    s.mark('fwd', v1 > 0.1)
    s.setAll('pot', 'position', 1); s.advance(500)
    const v2 = motorSpeed(s)
    s.mark('prop', v2 > v1 + 0.05)
    s.setAll('pot', 'position', 0); s.advance(500)
    s.mark('stop', Math.abs(motorSpeed(s)) < 0.02)
    s.setAll('pot', 'position', 0.8); s.advance(300)
    press(); s.advance(700)
    s.mark('rev', motorSpeed(s) < -0.1)
    press(); s.advance(700)
    s.mark('back', motorSpeed(s) > 0.1)
  },
  solution: () => ({ circuit: p23Circuit(), code: P23_CODE }),
}

// ================================================================ p24 sumo robot
const P24_TITLE = 'Mini-Sumo Robot'
const p24Circuit = (): Circuit => build([
  part('d', 'tb6612', 620, 40), part('ml', 'dcmotor', 860, 40), part('mr', 'dcmotor', 860, 140),
  part('us', 'hcsr04', 360, 250, { distanceCm: 100 }), part('ir', 'irobstacle', 520, 260, { proximity: 0.1, threshold: 0.5 }),
], [
  ['d.VM', 'uno.5V'], ['d.VCC', 'uno.5V'], ['d.GND', 'uno.GND2'], ['d.STBY', 'uno.5V'],
  ['d.PWMA', 'uno.D5'], ['d.AIN1', 'uno.D6'], ['d.AIN2', 'uno.D7'], ['d.PWMB', 'uno.D10'], ['d.BIN1', 'uno.D8'], ['d.BIN2', 'uno.D9'],
  ['d.AO1', 'ml.M1'], ['d.AO2', 'ml.M2'], ['d.BO1', 'mr.M1'], ['d.BO2', 'mr.M2'],
  ['us.VCC', 'uno.5V'], ['us.GND', 'uno.GND'], ['us.TRIG', 'uno.D11'], ['us.ECHO', 'uno.D12'],
  ['ir.VCC', 'uno.5V'], ['ir.GND', 'uno.GND3'], ['ir.OUT', 'uno.D2'],
])
const P24_CODE = `const int PWMA = 5, AIN1 = 6, AIN2 = 7, PWMB = 10, BIN1 = 8, BIN2 = 9;
const int TRIG = 11, ECHO = 12, EDGE = 2;

long readCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  return pulseIn(ECHO, HIGH, 30000) / 58;
}

void drive(int left, int right) {
  digitalWrite(AIN1, left > 0);
  digitalWrite(AIN2, left < 0);
  analogWrite(PWMA, abs(left));
  digitalWrite(BIN1, right > 0);
  digitalWrite(BIN2, right < 0);
  analogWrite(PWMB, abs(right));
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(EDGE, INPUT);
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
  drive(0, 0);
  delay(2000);
}

void loop() {
  if (digitalRead(EDGE) == LOW) {
    drive(-255, -255);
    delay(400);
    return;
  }
  long cm = readCm();
  if (cm > 0 && cm < 40) drive(255, 255);
  else drive(120, -120);
}
`
const p24: ExamProject = {
  id: 'p24', title: P24_TITLE, weeks: [5, 7],
  story: 'In a mini-sumo match the robot must find the opponent, push it out of the ring and never drive off the white edge itself.',
  brief: `Build a mini-sumo robot.
Motor driver (TB6612FNG): VM -> 5V, VCC -> 5V, GND -> GND, STBY -> 5V, PWMA -> D5, AIN1 -> D6, AIN2 -> D7, PWMB -> D10, BIN1 -> D8, BIN2 -> D9.
Left motor between AO1 (M1) and AO2 (M2); right motor between BO1 (M1) and BO2 (M2). Channel A is the left wheel, channel B the right wheel. A wheel turns forward when its IN1 is HIGH and IN2 LOW; PWM sets the speed.
HC-SR04 (opponent finder): VCC -> 5V, GND -> GND, TRIG -> D11, ECHO -> D12.
IR obstacle module (ring edge sensor): VCC -> 5V, GND -> GND, OUT -> D2 (OUT is LOW over the white edge line).
Behaviour:
- After reset wait 2 seconds with both wheels stopped (match start rule).
- Edge sensor LOW has top priority: drive both wheels backwards at full speed (PWM 255) for 400 ms, then re-evaluate.
- Else if the opponent is closer than 40 cm: charge, both wheels forward at PWM 255.
- Else search: spin to the right on the spot at PWM 120 (left wheel forward, right wheel backward).
Use pulseIn() with a timeout.`,
  allowedParts: ['tb6612', 'dcmotor', 'hcsr04', 'irobstacle', 'l298n', 'led'],
  starter: STARTER(P24_TITLE),
  goals: [
    { id: 'power', kind: 'circuit', points: 10, text: 'Power the TB6612: VM to 5V, VCC to 5V, GND to GND, STBY to 5V.', check: (c) => allWired(c, 'tb6612', { VM: '5V', VCC: '5V', GND: 'GND', STBY: '5V' }) },
    { id: 'control', kind: 'circuit', points: 10, text: 'Wire the TB6612 control pins: PWMA D5, AIN1 D6, AIN2 D7, PWMB D10, BIN1 D8, BIN2 D9.', check: (c) => allWired(c, 'tb6612', { PWMA: 'D5', AIN1: 'D6', AIN2: 'D7', PWMB: 'D10', BIN1: 'D8', BIN2: 'D9' }) },
    { id: 'motors', kind: 'circuit', points: 5, text: 'Left motor between AO1 (M1) and AO2 (M2), right motor between BO1 (M1) and BO2 (M2).', check: (c) => motorOn(c, 'tb6612', 'AO1', 'AO2') && motorOn(c, 'tb6612', 'BO1', 'BO2') },
    { id: 'sensors', kind: 'circuit', points: 13, text: 'Wire the HC-SR04 (TRIG D11, ECHO D12) and the IR edge sensor (OUT D2), both powered from 5V and GND.',
      check: (c) => allWired(c, 'hcsr04', { VCC: '5V', GND: 'GND', TRIG: 'D11', ECHO: 'D12' }) && allWired(c, 'irobstacle', { VCC: '5V', GND: 'GND', OUT: 'D2' }) },
    { id: 'startdelay', kind: 'code', points: 7, text: 'Implement the 2 second start wait (delay(2000) or a millis() check).', check: (c) => /delay\s*\(\s*(?:[2-9]\d{3}|\d{5,})\s*\)|millis\s*\(/.test(code(c)) },
    { id: 'pulsein', kind: 'code', points: 7, text: 'Measure the opponent with pulseIn() and a timeout.', check: (c) => /pulseIn\s*\(\s*\w+\s*,\s*HIGH\s*,\s*[^)]+\)/.test(code(c)) },
    { id: 'pwm', kind: 'code', points: 6, text: 'Use analogWrite() for wheel speed.', check: (c) => /analogWrite\s*\(/.test(code(c)) },
    { id: 'wait', kind: 'behavior', points: 8, text: 'Both wheels stay stopped during the first second after reset (start wait).', check: (c) => c.marks.wait === true },
    { id: 'search', kind: 'behavior', points: 8, text: 'No opponent: spin right slowly (left wheel forward, right wheel backward, below full speed).', check: (c) => c.marks.search === true },
    { id: 'charge', kind: 'behavior', points: 10, text: 'Opponent at 30 cm: charge with both wheels forward at full speed.', check: (c) => c.marks.charge === true },
    { id: 'edge', kind: 'behavior', points: 10, text: 'Edge detected (even with an opponent in front): both wheels reverse at full speed.', check: (c) => c.marks.edge === true },
    { id: 'recover', kind: 'behavior', points: 6, text: 'After the edge is left behind the robot charges again when the opponent is still there.', check: (c) => c.marks.recover === true },
  ],
  scenario: (s) => {
    s.setAll('hcsr04', 'distanceCm', 100)
    s.setAll('irobstacle', 'proximity', 0.1)
    s.advance(1000)
    { const [a, b] = chans(s, 'tb6612'); s.mark('wait', Math.abs(a) < 0.05 && Math.abs(b) < 0.05) }
    s.advance(1800)
    { const [a, b] = chans(s, 'tb6612'); s.mark('search', a > 0.1 && a < 0.7 && b < -0.1 && b > -0.7) }
    s.setAll('hcsr04', 'distanceCm', 30); s.advance(300)
    { const [a, b] = chans(s, 'tb6612'); s.mark('charge', a > 0.5 && b > 0.5) }
    s.setAll('irobstacle', 'proximity', 0.9); s.advance(200)
    { const [a, b] = chans(s, 'tb6612'); s.mark('edge', a < -0.5 && b < -0.5) }
    s.setAll('irobstacle', 'proximity', 0.1); s.advance(500); s.advance(300)
    { const [a, b] = chans(s, 'tb6612'); s.mark('recover', a > 0.5 && b > 0.5) }
  },
  solution: () => ({ circuit: p24Circuit(), code: P24_CODE }),
}

// ================================================================ p25 two-servo robot arm
const P25_TITLE = 'Joystick Robot Arm'
const p25Circuit = (): Circuit => build([
  part('j', 'joystick', 360, 230), part('s1', 'servo', 560, 200), part('s2', 'servo', 560, 300),
], [
  ['j.VCC', 'uno.5V'], ['j.GND', 'uno.GND'], ['j.VRX', 'uno.A0'], ['j.VRY', 'uno.A1'], ['j.SW', 'uno.D2'],
  ['s1.SIG', 'uno.D9'], ['s1.VCC', 'uno.5V'], ['s1.GND', 'uno.GND2'], ['s2.SIG', 'uno.D10'], ['s2.VCC', 'uno.5V'], ['s2.GND', 'uno.GND3'],
])
const P25_CODE = `#include <Servo.h>

const int SW = 2;
Servo base, shoulder;

void setup() {
  pinMode(SW, INPUT_PULLUP);
  base.attach(9);
  shoulder.attach(10);
}

void loop() {
  if (digitalRead(SW) == LOW) {
    base.write(90);
    shoulder.write(90);
  } else {
    base.write(map(analogRead(A0), 0, 1023, 0, 180));
    shoulder.write(map(analogRead(A1), 0, 1023, 20, 160));
  }
  delay(15);
}
`
const p25: ExamProject = {
  id: 'p25', title: P25_TITLE, weeks: [6],
  story: 'A two-joint desktop robot arm is steered with a joystick; a push on the stick sends it back to its rest pose.',
  brief: `Build a two-servo robot arm.
Joystick: VCC -> 5V, GND -> GND, VRX -> A0, VRY -> A1, SW -> D2 (SW is LOW while the stick is pressed).
Base servo: SIG -> D9, VCC -> 5V, GND -> GND. Shoulder servo: SIG -> D10, VCC -> 5V, GND -> GND.
Behaviour (update every 15 ms, use the Servo library):
- X axis (A0) controls the base servo: 0..1023 maps to 0..180 degrees.
- Y axis (A1) controls the shoulder servo: 0..1023 maps to 20..160 degrees (a safety limit, the shoulder must never leave this range).
- While the stick is pressed (SW LOW) both servos go to 90 degrees (rest pose) regardless of the stick position; on release they follow the stick again.`,
  allowedParts: ['joystick', 'servo', 'pot', 'led', 'resistor'],
  starter: STARTER(P25_TITLE),
  goals: [
    { id: 'joystick', kind: 'circuit', points: 13, text: 'Wire the joystick: VCC to 5V, GND to GND, VRX to A0, VRY to A1, SW to D2.', check: (c) => allWired(c, 'joystick', { VCC: '5V', GND: 'GND', VRX: 'A0', VRY: 'A1', SW: 'D2' }) },
    { id: 'power', kind: 'circuit', points: 10, text: 'Power both servos: VCC to 5V and GND to GND.', check: (c) => partsOf(c.circuit, 'servo').length >= 2 && partsOf(c.circuit, 'servo').every((p) => to5V(c, p.id, 'VCC') && toGnd(c, p.id, 'GND')) },
    { id: 'signals', kind: 'circuit', points: 12, text: 'Connect one servo SIG to D9 (base) and another servo SIG to D10 (shoulder).', check: (c) => allWired(c, 'servo', { SIG: 'D9' }) && allWired(c, 'servo', { SIG: 'D10' }) },
    { id: 'lib', kind: 'code', points: 7, text: 'Use the Servo library with two Servo objects, each attached to its pin.', check: (c) => /#include\s*<Servo\.h>/.test(code(c)) && count(c.code, /\.attach\s*\(/g) >= 2 },
    { id: 'map', kind: 'code', points: 7, text: 'Convert the joystick readings to angles with map() from 0..1023.', check: (c) => /map\s*\([^;]*1023/.test(code(c)) },
    { id: 'limit', kind: 'code', points: 6, text: 'Limit the shoulder angle to 20..160 (map(..., 20, 160) or constrain()).', check: (c) => /map\s*\([^;]*,\s*20\s*,\s*160\s*\)|constrain\s*\([^;]*\b20\s*,\s*160/.test(code(c)) },
    { id: 'center', kind: 'behavior', points: 8, text: 'Stick centred: both servos near 90 degrees.', check: (c) => c.marks.center === true },
    { id: 'x', kind: 'behavior', points: 10, text: 'X axis full right/left moves one servo over the full 0..180 range.', check: (c) => c.marks.xr === true && c.marks.xl === true },
    { id: 'y', kind: 'behavior', points: 12, text: 'Y axis moves a different servo and its angle stays within 20..160 (about 20 at one end and 160 at the other).', check: (c) => c.marks.yl === true && c.marks.yh === true },
    { id: 'axes', kind: 'behavior', points: 7, text: 'X and Y control two different servos.', check: (c) => c.marks.axes === true },
    { id: 'home', kind: 'behavior', points: 8, text: 'Pressing the stick sends both servos to 90 degrees; releasing returns control to the stick.', check: (c) => c.marks.home === true && c.marks.release === true },
  ],
  scenario: (s) => {
    const ids = s.idsOf('servo')
    const ang = () => ids.map((id) => s.state.parts[id]?.servo?.angleDeg ?? NaN)
    const near = (v: number, t: number, tol = 5) => Math.abs(v - t) <= tol
    const stick = (x: number, y: number) => { s.setAll('joystick', 'x', x); s.setAll('joystick', 'y', y); s.advance(400) }
    stick(0.5, 0.5)
    s.mark('center', ids.length >= 2 && ang().every((a) => near(a, 90, 6)))
    stick(1, 0.5)
    const ix = ang().findIndex((a) => a >= 174)
    s.mark('xr', ix >= 0 && near(ang()[1 - ix], 90, 6))
    stick(0, 0.5)
    s.mark('xl', ix >= 0 && ang()[ix] <= 6)
    stick(0.5, 0)
    const iy = ang().findIndex((a) => near(a, 20, 5))
    s.mark('yl', iy >= 0 && near(ang()[1 - iy], 90, 6))
    stick(0.5, 1)
    s.mark('yh', iy >= 0 && near(ang()[iy], 160, 5))
    s.mark('axes', ix >= 0 && iy >= 0 && ix !== iy)
    stick(1, 1)
    s.setAll('joystick', 'pressed', true); s.advance(300)
    s.mark('home', ang().every((a) => near(a, 90, 5)))
    s.setAll('joystick', 'pressed', false); s.advance(300)
    s.mark('release', ix >= 0 && ang()[ix] >= 174)
  },
  solution: () => ({ circuit: p25Circuit(), code: P25_CODE }),
}

export const PROJECTS_C: ExamProject[] = [p18, p19, p20, p21, p22, p23, p24, p25]
