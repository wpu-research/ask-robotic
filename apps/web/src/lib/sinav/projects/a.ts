import type { PartType } from '@/lib/lab/contract'
import type { ExamGoal, ExamGoalCtx, ExamProject, ExamScenario } from '../types'
import { build, codeHas, ledOnPin, noComments, part, partsOf, pin, skeleton, switchOnPin, to5V, toGnd, toUno, unoOnly, viaResistor } from './helpers'

/** Sınav projeleri, grup A (hafta 1-2): sayısal G/Ç, PWM, analogRead, millis() durum makineleri, seri. */

// ---------------------------------------------------------------- ortak yardımcılar
const ok = (c: ExamGoalCtx, name: string) => c.marks[name] === true
const hi = (s: ExamScenario, pinName: string) => !!s.state.pins[pinName]?.high
const wait = (s: ExamScenario, ms: number, cond: () => boolean) => {
  for (let t = 0; t < ms && !cond(); t += 10) s.advance(10)
  return cond()
}
/** Tüm butonlara kısa basış. */
const tap = (s: ExamScenario, hold = 80, after = 150) => { s.setAll('button', 'pressed', true); s.advance(hold); s.setAll('button', 'pressed', false); s.advance(after) }
/** Belirli bir Uno pinine (INPUT_PULLUP) bağlı butonu, öğrencinin parça kimliğinden bağımsız bulur. */
const buttonOn = (s: ExamScenario, unoPin: string) => {
  for (const id of s.idsOf('button')) {
    const before = hi(s, unoPin)
    s.setProp(id, 'pressed', true); s.advance(10)
    const after = hi(s, unoPin)
    s.setProp(id, 'pressed', false); s.advance(10)
    if (before && !after) return id
  }
  return undefined
}
const tapId = (s: ExamScenario, id: string | undefined, hold = 80, after = 150) => {
  if (!id) return
  s.setProp(id, 'pressed', true); s.advance(hold); s.setProp(id, 'pressed', false); s.advance(after)
}
const maxBright = (s: ExamScenario) => Math.max(0, ...s.idsOf('led').map((id) => s.state.parts[id]?.led?.brightness ?? 0))
const anyBuzzer = (s: ExamScenario) => s.idsOf('buzzer').some((id) => s.state.parts[id]?.buzzer?.on === true)
const lastNum = (text: string, re: RegExp) => { const m = [...text.matchAll(re)]; return m.length ? Number(m[m.length - 1][1]) : NaN }

const noDelayLong = (ctx: ExamGoalCtx) => !/\bdelay\s*\(\s*(?:\d{3,}|[A-Za-z_]\w*)\s*\)/.test(noComments(ctx.code))

type Branch = { pin: string; color?: string }
/** Her biri Uno pini → direnç → LED → GND olan LED kolları. */
const ledBranches = (list: Branch[], x0 = 360, y0 = 40) => {
  const parts: ReturnType<typeof part>[] = []
  const wires: Array<[string, string]> = []
  list.forEach((b, i) => {
    const y = y0 + i * 90
    parts.push(part(`r${i + 1}`, 'resistor', x0, y, { ohms: 330 }), part(`led${i + 1}`, 'led', x0 + 130, y - 20, { color: b.color ?? 'red' }))
    wires.push([`uno.${b.pin}`, `r${i + 1}.1`], [`r${i + 1}.2`, `led${i + 1}.A`], [`led${i + 1}.K`, 'uno.GND'])
  })
  return { parts, wires }
}
const potWires = (id: string, sig: string): Array<[string, string]> => [[`${id}.VCC`, 'uno.5V'], [`${id}.GND`, 'uno.GND2'], [`${id}.SIG`, `uno.${sig}`]]
const potOn = (ctx: ExamGoalCtx, sig: string) =>
  partsOf(ctx.circuit, 'pot').some((p) => toUno(ctx, p.id, 'SIG', sig) && ((to5V(ctx, p.id, 'VCC') && toGnd(ctx, p.id, 'GND')) || (to5V(ctx, p.id, 'GND') && toGnd(ctx, p.id, 'VCC'))))
const buzzerOn = (ctx: ExamGoalCtx, unoPin: string) =>
  partsOf(ctx.circuit, 'buzzer').some((b) => (toUno(ctx, b.id, '+', unoPin) && toGnd(ctx, b.id, '-')) || (toUno(ctx, b.id, '-', unoPin) && toGnd(ctx, b.id, '+')))
const bin = (...v: boolean[]) => v.map((x) => (x ? '1' : '0')).join('')
const pins4 = (s: ExamScenario, ...names: string[]) => bin(...names.map((n) => hi(s, n)))

const mk = (p: Omit<ExamProject, 'starter'> & { starter?: ExamProject['starter'] }): ExamProject => ({
  starter: () => ({ circuit: unoOnly(), code: skeleton(p.title) }),
  ...p,
})
const allowed = (...t: PartType[]) => t

// ---------------------------------------------------------------- p01 Pedestrian crossing
const p01: ExamProject = mk({
  id: 'p01',
  title: 'Pedestrian Crossing Controller',
  story: 'A small town needs a traffic light at a pedestrian crossing: cars normally have green, and a pedestrian can request a stop with a push button.',
  brief: `Build a pedestrian crossing controller.

Circuit:
- Red LED on D11, yellow LED on D12, green LED on D13. Each LED needs its own series resistor (330 ohm) to GND. Set the LED colours in the property panel.
- Push button between D2 and GND (use the internal pull-up).

Behaviour (a non-blocking state machine using millis(); do not call delay()):
1. At power-up only the green LED is on (cars may go).
2. When the button is pressed, the green LED turns off and the yellow LED turns on immediately.
3. After 2 seconds of yellow, the red LED turns on (yellow off) for 5 seconds.
4. After the red phase the system returns to green and waits for the next press.
Exactly one LED is on at any time.`,
  weeks: [1, 2],
  allowedParts: allowed('led', 'resistor', 'button', 'buzzer'),
  goals: [
    { id: 'c-red', kind: 'circuit', points: 10, text: 'Red LED with a series resistor on D11 (cathode to GND).', check: (c) => ledOnPin(c, 'D11') },
    { id: 'c-yellow', kind: 'circuit', points: 10, text: 'Yellow LED (colour set to yellow) with a series resistor on D12.', check: (c) => ledOnPin(c, 'D12', 'yellow') },
    { id: 'c-green', kind: 'circuit', points: 10, text: 'Green LED (colour set to green) with a series resistor on D13.', check: (c) => ledOnPin(c, 'D13', 'green') },
    { id: 'c-btn', kind: 'circuit', points: 10, text: 'Push button between D2 and GND.', check: (c) => switchOnPin(c, 'button', 'D2') },
    { id: 'k-millis', kind: 'code', points: 10, text: 'Timing uses millis() and the sketch never calls delay().', check: (c) => codeHas(c, /\bmillis\s*\(/) && !/\bdelay\s*\(/.test(noComments(c.code)) },
    { id: 'k-pullup', kind: 'code', points: 10, text: 'The button pin is configured with INPUT_PULLUP.', check: (c) => codeHas(c, /INPUT_PULLUP/) },
    { id: 'b-idle', kind: 'behavior', points: 10, text: 'At power-up (no press) only green is on.', check: (c) => ok(c, 'idle') },
    { id: 'b-warn', kind: 'behavior', points: 10, text: 'After a button press, yellow turns on and green turns off.', check: (c) => ok(c, 'warn') },
    { id: 'b-red', kind: 'behavior', points: 10, text: 'About 2 s after the press red turns on, and it stays on for the 5 s phase.', check: (c) => ok(c, 'red') },
    { id: 'b-return', kind: 'behavior', points: 10, text: 'After the red phase only green is on again.', check: (c) => ok(c, 'back') },
  ],
  scenario: (s) => {
    s.advance(500)
    s.mark('idle', pins4(s, 'D11', 'D12', 'D13') === '001')
    tap(s, 80, 0)
    s.advance(400)
    s.mark('warn', pins4(s, 'D11', 'D12', 'D13') === '010')
    s.advance(1700)
    s.mark('red', pins4(s, 'D11', 'D12', 'D13') === '100')
    s.advance(4000)
    s.mark('red', pins4(s, 'D11', 'D12', 'D13') === '100')
    s.advance(1500)
    s.mark('back', pins4(s, 'D11', 'D12', 'D13') === '001')
  },
  solution: () => {
    const l = ledBranches([{ pin: 'D11', color: 'red' }, { pin: 'D12', color: 'yellow' }, { pin: 'D13', color: 'green' }])
    const circuit = build([...l.parts, part('btn1', 'button', 360, 320)], [...l.wires, ['btn1.A', 'uno.D2'], ['btn1.B', 'uno.GND2']])
    return { circuit, code: `const int BTN = 2;
const int RED = 11;
const int YELLOW = 12;
const int GREEN = 13;

enum State { CARS, WARN, STOP };
State state = CARS;
unsigned long since = 0;

void setup() {
  pinMode(BTN, INPUT_PULLUP);
  pinMode(RED, OUTPUT);
  pinMode(YELLOW, OUTPUT);
  pinMode(GREEN, OUTPUT);
}

void loop() {
  unsigned long now = millis();
  if (state == CARS && digitalRead(BTN) == LOW) {
    state = WARN;
    since = now;
  } else if (state == WARN && now - since >= 2000) {
    state = STOP;
    since = now;
  } else if (state == STOP && now - since >= 5000) {
    state = CARS;
  }
  digitalWrite(GREEN, state == CARS);
  digitalWrite(YELLOW, state == WARN);
  digitalWrite(RED, state == STOP);
}
` }
  },
})

// ---------------------------------------------------------------- p02 Level gauge
const p02: ExamProject = mk({
  id: 'p02',
  title: 'Tank Level Gauge',
  story: 'A water tank has a float sensor (modelled by a potentiometer). A row of four LEDs shows the level like a bar graph.',
  brief: `Build a 4-LED bar graph driven by a potentiometer.

Circuit:
- Potentiometer: VCC to 5V, GND to GND, wiper (SIG) to A0.
- Four LEDs on D8, D9, D10, D11, each with its own 330 ohm series resistor to GND.

Behaviour:
- Read the potentiometer with analogRead(A0) (0-1023) continuously.
- Number of lit LEDs = reading / 205 (integer division), giving 0 to 4 LEDs.
- The LEDs fill in order: D8 first, then D9, D10, D11. For example: 2 LEDs lit means D8 and D9 are on, D10 and D11 are off.
- The display follows the potentiometer in both directions (LEDs turn off again when the level drops).`,
  weeks: [1, 2],
  allowedParts: allowed('pot', 'led', 'resistor', 'button'),
  goals: [
    ...['D8', 'D9', 'D10', 'D11'].map((p, i): ExamGoal => ({ id: `c-led${i + 1}`, kind: 'circuit', points: 6, text: `LED with a series resistor on ${p} (cathode to GND).`, check: (c) => ledOnPin(c, p) })),
    { id: 'c-pot', kind: 'circuit', points: 16, text: 'Potentiometer: VCC to 5V, GND to GND, wiper to A0.', check: (c) => potOn(c, 'A0') },
    { id: 'k-read', kind: 'code', points: 10, text: 'Reads the potentiometer with analogRead(A0).', check: (c) => codeHas(c, /analogRead\s*\(\s*(A0|14)\s*\)/) },
    { id: 'k-scale', kind: 'code', points: 10, text: 'Scales the reading to 0-4 with map() or integer division.', check: (c) => codeHas(c, /\bmap\s*\(|\/\s*\d+|>>/) },
    { id: 'b-low', kind: 'behavior', points: 10, text: 'Potentiometer at 0: no LED lit; at about 30%: only D8 lit.', check: (c) => ok(c, 'low') },
    { id: 'b-mid', kind: 'behavior', points: 10, text: 'At about 50% D8-D9 are lit; at about 70% D8-D10 are lit.', check: (c) => ok(c, 'mid') },
    { id: 'b-full', kind: 'behavior', points: 10, text: 'At full scale all four LEDs are lit.', check: (c) => ok(c, 'full') },
    { id: 'b-track', kind: 'behavior', points: 10, text: 'After turning back down to 50% only D8-D9 are lit again.', check: (c) => ok(c, 'track') },
  ],
  scenario: (s) => {
    const L = () => pins4(s, 'D8', 'D9', 'D10', 'D11')
    const at = (v: number) => { s.setAll('pot', 'position', v); s.advance(250) }
    at(0)
    const zero = L() === '0000'
    at(0.3); s.mark('low', zero && L() === '1000')
    at(0.5); s.mark('mid', L() === '1100')
    at(0.7); s.mark('mid', L() === '1110')
    at(1); s.mark('full', L() === '1111')
    at(0.5); s.mark('track', L() === '1100')
  },
  solution: () => {
    const l = ledBranches([{ pin: 'D8' }, { pin: 'D9' }, { pin: 'D10' }, { pin: 'D11' }])
    const circuit = build([...l.parts, part('pot1', 'pot', 360, 400)], [...l.wires, ...potWires('pot1', 'A0')])
    return { circuit, code: `const int LEDS[4] = {8, 9, 10, 11};

void setup() {
  for (int i = 0; i < 4; i++) {
    pinMode(LEDS[i], OUTPUT);
  }
}

void loop() {
  int reading = analogRead(A0);
  int level = reading / 205;   // 0..4
  for (int i = 0; i < 4; i++) {
    digitalWrite(LEDS[i], i < level ? HIGH : LOW);
  }
}
` }
  },
})

// ---------------------------------------------------------------- p03 Night light
const p03: ExamProject = mk({
  id: 'p03',
  title: 'Automatic Night Light',
  story: 'A child\'s bedroom lamp should switch itself on when the room gets dark and glow brighter the darker it gets.',
  brief: `Build an automatic night light with a light sensor (LDR) and a PWM LED.

Circuit:
- LDR voltage divider: one LDR leg to 5V, the other LDR leg to A1. A 10 kohm resistor (set its value to 10000) between A1 and GND.
- LED on D9 (PWM pin) with a 330 ohm series resistor to GND.

Behaviour:
- Read the divider with analogRead(A1). A brighter room gives a HIGHER reading.
- If the reading is 400 or more (daylight) the LED is completely off (analogWrite value 0).
- Below 400 the LED brightness follows: brightness = map(reading, 0, 400, 255, 0), i.e. the darker the room, the brighter the LED (full brightness when pitch dark).
- Use analogWrite() on D9; the lamp must react continuously to light changes.`,
  weeks: [2],
  allowedParts: allowed('ldr', 'led', 'resistor', 'ntc'),
  goals: [
    { id: 'c-ldr', kind: 'circuit', points: 14, text: 'LDR with one leg on 5V and the other leg on A1.', check: (c) => partsOf(c.circuit, 'ldr').some((l) => (to5V(c, l.id, '1') && toUno(c, l.id, '2', 'A1')) || (to5V(c, l.id, '2') && toUno(c, l.id, '1', 'A1'))) },
    { id: 'c-pulldown', kind: 'circuit', points: 12, text: '10 kohm resistor (value set to about 10000 ohm) between A1 and GND.', check: (c) => partsOf(c.circuit, 'resistor').some((r) => { const o = Number(r.props.ohms); return o >= 5000 && o <= 20000 && ((toUno(c, r.id, '1', 'A1') && toGnd(c, r.id, '2')) || (toUno(c, r.id, '2', 'A1') && toGnd(c, r.id, '1'))) }) },
    { id: 'c-led', kind: 'circuit', points: 14, text: 'LED with a series resistor on D9 (cathode to GND).', check: (c) => ledOnPin(c, 'D9') },
    { id: 'k-read', kind: 'code', points: 10, text: 'Reads the sensor with analogRead(A1).', check: (c) => codeHas(c, /analogRead\s*\(/) && codeHas(c, /\bA1\b|\b15\b/) },
    { id: 'k-pwm', kind: 'code', points: 10, text: 'Drives the LED with analogWrite() (PWM).', check: (c) => codeHas(c, /analogWrite\s*\(/) },
    { id: 'b-day', kind: 'behavior', points: 10, text: 'In bright light (light = 100%) the LED is off.', check: (c) => ok(c, 'day') },
    { id: 'b-dark', kind: 'behavior', points: 10, text: 'In darkness (light = 0%) the LED glows brightly.', check: (c) => ok(c, 'dark') },
    { id: 'b-dim', kind: 'behavior', points: 10, text: 'At dusk (light = 40%) the LED is on but dimmer than in full darkness (PWM, not just on/off).', check: (c) => ok(c, 'dim') },
    { id: 'b-order', kind: 'behavior', points: 10, text: 'The darker it gets, the brighter the LED (0% brighter than 20%, 20% brighter than 40%), and it turns off again when light returns.', check: (c) => ok(c, 'order') },
  ],
  scenario: (s) => {
    const at = (v: number) => { s.setAll('ldr', 'light', v); s.advance(300); return maxBright(s) }
    const day = at(1), dark = at(0), l20 = at(0.2), l40 = at(0.4), day2 = at(1)
    s.mark('day', day < 0.02)
    s.mark('dark', dark > 0.5)
    s.mark('dim', dark > 0.5 && l40 > 0.03 && l40 < dark * 0.85)
    s.mark('order', dark > l20 + 0.02 && l20 > l40 + 0.02 && day2 < 0.02)
  },
  solution: () => {
    const l = ledBranches([{ pin: 'D9' }])
    const circuit = build([...l.parts, part('ldr1', 'ldr', 360, 300), part('r10k', 'resistor', 460, 340, { ohms: 10000 })], [
      ...l.wires, ['ldr1.1', 'uno.5V'], ['ldr1.2', 'uno.A1'], ['r10k.1', 'uno.A1'], ['r10k.2', 'uno.GND2'],
    ])
    return { circuit, code: `const int LDR_PIN = A1;
const int LED_PIN = 9;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int reading = analogRead(LDR_PIN);
  int brightness = 0;
  if (reading < 400) {
    brightness = map(reading, 0, 400, 255, 0);
  }
  analogWrite(LED_PIN, brightness);
  delay(20);
}
` }
  },
})

// ---------------------------------------------------------------- p04 RGB mood lamp
const p04: ExamProject = mk({
  id: 'p04',
  title: 'RGB Mood Lamp',
  story: 'A desk lamp has an RGB LED and one button. Every press switches to the next colour mode.',
  brief: `Build an RGB mood lamp (common-cathode RGB LED, default setting).

Circuit:
- RGB LED: R to D9, G to D10, B to D11, each through its own 330 ohm resistor. The common pin (COM) goes to GND.
- Push button between D2 and GND (use the internal pull-up).

Behaviour (use analogWrite() for all three colour channels):
- Mode 0 (power-up): red (255, 0, 0)
- Mode 1: green (0, 255, 0)
- Mode 2: blue (0, 0, 255)
- Mode 3: dim white (all three channels at about 60 of 255)
- Each button PRESS moves to the next mode: 0 -> 1 -> 2 -> 3 -> 0 ... A press that is held down for half a second must count as ONE press (detect the press edge and debounce).`,
  weeks: [1, 2],
  allowedParts: allowed('rgbled', 'button', 'resistor', 'led'),
  goals: [
    ...(['R:D9', 'G:D10', 'B:D11'] as const).map((x): ExamGoal => {
      const [ch, p] = x.split(':')
      return { id: `c-${ch.toLowerCase()}`, kind: 'circuit', points: 8, text: `RGB LED ${ch} leg connects to ${p} through a series resistor.`, check: (c) => partsOf(c.circuit, 'rgbled').some((r) => viaResistor(c, pin('uno', p), pin(r.id, ch))) }
    }),
    { id: 'c-com', kind: 'circuit', points: 6, text: 'RGB LED common pin (COM) connected to GND.', check: (c) => partsOf(c.circuit, 'rgbled').some((r) => toGnd(c, r.id, 'COM')) },
    { id: 'c-btn', kind: 'circuit', points: 10, text: 'Push button between D2 and GND.', check: (c) => switchOnPin(c, 'button', 'D2') },
    { id: 'k-pullup', kind: 'code', points: 10, text: 'The button pin is configured with INPUT_PULLUP.', check: (c) => codeHas(c, /INPUT_PULLUP/) },
    { id: 'k-pwm', kind: 'code', points: 10, text: 'Colours are set with analogWrite().', check: (c) => codeHas(c, /analogWrite\s*\(/) },
    { id: 'b-red', kind: 'behavior', points: 8, text: 'At power-up the lamp is red (only the red channel on).', check: (c) => ok(c, 'red') },
    { id: 'b-gb', kind: 'behavior', points: 12, text: 'First press gives green, second press gives blue.', check: (c) => ok(c, 'gb') },
    { id: 'b-white', kind: 'behavior', points: 12, text: 'Third press gives dim white (all channels on but dimmer than full), fourth press wraps back to red.', check: (c) => ok(c, 'white') },
    { id: 'b-once', kind: 'behavior', points: 8, text: 'Holding the button for 0.5 s changes the mode only once.', check: (c) => ok(c, 'once') },
  ],
  scenario: (s) => {
    const col = () => {
      const id = s.idsOf('rgbled')[0]
      const r = id ? s.state.parts[id]?.rgbled : undefined
      return r ?? { r: 0, g: 0, b: 0 }
    }
    const is = (want: string, lvl = 0.25) => { const c = col(); return bin(c.r > lvl, c.g > lvl, c.b > lvl) === want }
    s.advance(400)
    const full = col().r
    s.mark('red', full > 0.25 && is('100'))
    tap(s, 80, 250)
    const g1 = is('010')
    tap(s, 80, 250)
    s.mark('gb', g1 && is('001'))
    tap(s, 80, 250)
    const w = col()
    const dim = Math.min(w.r, w.g, w.b) > 0.02 && Math.max(w.r, w.g, w.b) < full * 0.8
    tap(s, 80, 250)
    s.mark('white', dim && is('100'))
    // basılı tutma: kırmızıdan yalnız yeşile geçmeli
    s.setAll('button', 'pressed', true); s.advance(500); s.setAll('button', 'pressed', false); s.advance(300)
    s.mark('once', is('010'))
  },
  solution: () => {
    const circuit = build([
      part('r1', 'resistor', 360, 40, { ohms: 330 }), part('r2', 'resistor', 360, 110, { ohms: 330 }), part('r3', 'resistor', 360, 180, { ohms: 330 }),
      part('rgb1', 'rgbled', 520, 90, { common: 'cathode' }), part('btn1', 'button', 360, 300),
    ], [
      ['uno.D9', 'r1.1'], ['r1.2', 'rgb1.R'], ['uno.D10', 'r2.1'], ['r2.2', 'rgb1.G'], ['uno.D11', 'r3.1'], ['r3.2', 'rgb1.B'],
      ['rgb1.COM', 'uno.GND'], ['btn1.A', 'uno.D2'], ['btn1.B', 'uno.GND2'],
    ])
    return { circuit, code: `const int PIN_R = 9;
const int PIN_G = 10;
const int PIN_B = 11;
const int BTN = 2;

int mode = 0;
int lastState = HIGH;

void show(int r, int g, int b) {
  analogWrite(PIN_R, r);
  analogWrite(PIN_G, g);
  analogWrite(PIN_B, b);
}

void applyMode() {
  switch (mode) {
    case 0: show(255, 0, 0); break;
    case 1: show(0, 255, 0); break;
    case 2: show(0, 0, 255); break;
    default: show(60, 60, 60); break;
  }
}

void setup() {
  pinMode(PIN_R, OUTPUT);
  pinMode(PIN_G, OUTPUT);
  pinMode(PIN_B, OUTPUT);
  pinMode(BTN, INPUT_PULLUP);
  applyMode();
}

void loop() {
  int state = digitalRead(BTN);
  if (lastState == HIGH && state == LOW) {
    mode = (mode + 1) % 4;
    applyMode();
    delay(30);   // debounce
  }
  lastState = state;
}
` }
  },
})

// ---------------------------------------------------------------- p05 Intruder alarm
const p05: ExamProject = mk({
  id: 'p05',
  title: 'Door Intruder Alarm',
  story: 'A shop door has a magnetic reed sensor. The owner arms and disarms the alarm with one button; an open door while armed sets off the siren.',
  brief: `Build a one-button door alarm.

Circuit:
- Push button between D2 and GND (arm/disarm).
- Reed switch between D3 and GND. The magnet is near the reed while the door is CLOSED (contact closed, pin reads LOW); an OPEN door makes the pin read HIGH.
- Alarm LED on D8 with a 330 ohm series resistor to GND.
- Passive buzzer: + to D9, - to GND.

Behaviour:
- Use INPUT_PULLUP on both inputs. The system starts DISARMED.
- Each button press toggles armed/disarmed (debounce it; a button held for 0.4 s is still ONE press). On every toggle print exactly one line to the serial monitor (9600 baud): ARMED or DISARMED.
- While ARMED and the door is open: the LED is on and the buzzer sounds with tone(9, 1000).
- When the door closes again, or the system is disarmed, the LED turns off and the buzzer is silent (noTone).
- While DISARMED nothing happens when the door opens.`,
  weeks: [1, 2],
  allowedParts: allowed('button', 'reed', 'led', 'resistor', 'buzzer', 'pot'),
  goals: [
    { id: 'c-btn', kind: 'circuit', points: 10, text: 'Push button between D2 and GND.', check: (c) => switchOnPin(c, 'button', 'D2') },
    { id: 'c-reed', kind: 'circuit', points: 10, text: 'Reed switch between D3 and GND.', check: (c) => switchOnPin(c, 'reed', 'D3') },
    { id: 'c-led', kind: 'circuit', points: 10, text: 'LED with a series resistor on D8 (cathode to GND).', check: (c) => ledOnPin(c, 'D8') },
    { id: 'c-buz', kind: 'circuit', points: 10, text: 'Buzzer between D9 and GND.', check: (c) => buzzerOn(c, 'D9') },
    { id: 'k-pullup', kind: 'code', points: 7, text: 'Both inputs use INPUT_PULLUP.', check: (c) => (noComments(c.code).match(/INPUT_PULLUP/g) ?? []).length >= 2 },
    { id: 'k-tone', kind: 'code', points: 6, text: 'The siren uses tone() and noTone().', check: (c) => codeHas(c, /\btone\s*\(/) && codeHas(c, /\bnoTone\s*\(/) },
    { id: 'k-debounce', kind: 'code', points: 7, text: 'The button is debounced (delay of a few ms or a millis() comparison).', check: (c) => codeHas(c, /\bmillis\s*\(|\bdelay\s*\(\s*\d+\s*\)/) },
    { id: 'b-alarm', kind: 'behavior', points: 12, text: 'When armed and the door opens, the LED is on and the buzzer sounds.', check: (c) => ok(c, 'alarm') },
    { id: 'b-quiet', kind: 'behavior', points: 10, text: 'Closing the door or disarming silences the buzzer and turns the LED off.', check: (c) => ok(c, 'quiet') },
    { id: 'b-serial', kind: 'behavior', points: 10, text: 'Serial prints ARMED, DISARMED, ARMED on successive toggles, one line each.', check: (c) => c.serial.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join(',') === 'ARMED,DISARMED,ARMED' },
    { id: 'b-once', kind: 'behavior', points: 8, text: 'A button held for 0.4 s toggles only once (no extra serial lines).', check: (c) => ok(c, 'once') },
  ],
  scenario: (s) => {
    const siren = () => anyBuzzer(s) && hi(s, 'D8')
    const silent = () => !anyBuzzer(s) && !hi(s, 'D8')
    s.setAll('reed', 'magnet', true)
    s.advance(500)
    s.setAll('reed', 'magnet', false)   // kapı açık, devre dışı
    s.advance(300)
    const disarmedQuiet = silent()
    tap(s, 80, 400)                      // kur
    s.mark('alarm', siren())
    s.setAll('reed', 'magnet', true)     // kapı kapandı
    s.advance(300)
    const closedQuiet = silent()
    s.setAll('reed', 'magnet', false)
    s.advance(600)
    const second = siren()
    tap(s, 80, 400)                      // devre dışı
    s.mark('quiet', disarmedQuiet && closedQuiet && second && silent())
    s.mark('once', true)
    tap(s, 400, 400)                     // uzun basış: tek geçiş
    s.mark('once', s.serial.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).length === 3)
  },
  solution: () => {
    const l = ledBranches([{ pin: 'D8', color: 'red' }])
    const circuit = build([...l.parts, part('btn1', 'button', 360, 200), part('reed1', 'reed', 360, 280), part('bz1', 'buzzer', 360, 350)], [
      ...l.wires, ['btn1.A', 'uno.D2'], ['btn1.B', 'uno.GND2'], ['reed1.A', 'uno.D3'], ['reed1.B', 'uno.GND2'], ['bz1.+', 'uno.D9'], ['bz1.-', 'uno.GND3'],
    ])
    return { circuit, code: `const int BTN = 2;
const int DOOR = 3;
const int LED = 8;
const int BUZ = 9;

bool armed = false;
int lastBtn = HIGH;

void setup() {
  pinMode(BTN, INPUT_PULLUP);
  pinMode(DOOR, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  pinMode(BUZ, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int b = digitalRead(BTN);
  if (lastBtn == HIGH && b == LOW) {
    armed = !armed;
    Serial.println(armed ? "ARMED" : "DISARMED");
    delay(30);   // debounce
  }
  lastBtn = b;

  bool doorOpen = digitalRead(DOOR) == HIGH;
  if (armed && doorOpen) {
    tone(BUZ, 1000);
    digitalWrite(LED, HIGH);
  } else {
    noTone(BUZ);
    digitalWrite(LED, LOW);
  }
}
` }
  },
})

// ---------------------------------------------------------------- p06 Servo dial
const p06: ExamProject = mk({
  id: 'p06',
  title: 'Servo Dial Gauge',
  story: 'A control-panel needle is moved by a servo that follows a knob. A warning LED lights when the needle goes into the red zone.',
  brief: `Build a servo needle that follows a potentiometer.

Circuit:
- Potentiometer: VCC to 5V, GND to GND, wiper (SIG) to A0.
- Servo: signal to D9, VCC to 5V, GND to GND.
- Warning LED on D7 with a 330 ohm series resistor to GND.

Behaviour (include <Servo.h>):
- Angle = map(analogRead(A0), 0, 1023, 0, 180); write it to the servo (attach it to D9 in setup).
- The warning LED is on while the angle is greater than 150 degrees, otherwise off.
- About every 100 ms print one line to the serial monitor (9600 baud) in exactly this format:
  Angle: 90
  (the word Angle, a colon, a space, the integer angle).`,
  weeks: [1, 2],
  allowedParts: allowed('pot', 'servo', 'led', 'resistor', 'button'),
  goals: [
    { id: 'c-pot', kind: 'circuit', points: 13, text: 'Potentiometer: VCC to 5V, GND to GND, wiper to A0.', check: (c) => potOn(c, 'A0') },
    { id: 'c-servo', kind: 'circuit', points: 15, text: 'Servo: signal to D9, VCC to 5V, GND to GND.', check: (c) => partsOf(c.circuit, 'servo').some((v) => toUno(c, v.id, 'SIG', 'D9') && to5V(c, v.id, 'VCC') && toGnd(c, v.id, 'GND')) },
    { id: 'c-led', kind: 'circuit', points: 12, text: 'Warning LED with a series resistor on D7 (cathode to GND).', check: (c) => ledOnPin(c, 'D7') },
    { id: 'k-servo', kind: 'code', points: 8, text: 'Uses the Servo library: #include <Servo.h> and attach().', check: (c) => codeHas(c, /#include\s*<Servo\.h>/) && codeHas(c, /\.attach\s*\(/) },
    { id: 'k-map', kind: 'code', points: 8, text: 'Converts analogRead() to an angle with map().', check: (c) => codeHas(c, /analogRead\s*\(/) && codeHas(c, /\bmap\s*\(/) },
    { id: 'b-ends', kind: 'behavior', points: 12, text: 'Knob at minimum: servo at about 0 degrees; knob at maximum: about 180 degrees.', check: (c) => ok(c, 'ends') },
    { id: 'b-mid', kind: 'behavior', points: 10, text: 'Knob at 50%: about 90 degrees; at 25%: about 45 degrees.', check: (c) => ok(c, 'mid') },
    { id: 'b-led', kind: 'behavior', points: 12, text: 'Warning LED is on above 150 degrees and off below.', check: (c) => ok(c, 'led') },
    { id: 'b-serial', kind: 'behavior', points: 10, text: 'Serial prints "Angle: <deg>" lines that follow the knob.', check: (c) => ok(c, 'serial') },
  ],
  scenario: (s) => {
    const angle = () => { const id = s.idsOf('servo')[0]; const r = id ? s.state.parts[id]?.servo : undefined; return r && r.attached ? r.angleDeg : -999 }
    const at = (v: number) => { s.setAll('pot', 'position', v); s.advance(500) }
    at(0); const a0 = angle(); const led0 = hi(s, 'D7'); const ser0 = lastNum(s.serial, /Angle:\s*(-?\d+)/g)
    at(0.25); const a25 = angle()
    at(0.5); const a50 = angle(); const led50 = hi(s, 'D7'); const ser50 = lastNum(s.serial, /Angle:\s*(-?\d+)/g)
    at(0.9); const led90 = hi(s, 'D7')
    at(1); const a100 = angle(); const led100 = hi(s, 'D7'); const ser100 = lastNum(s.serial, /Angle:\s*(-?\d+)/g)
    s.mark('ends', a0 >= 0 && a0 <= 10 && a100 >= 170)
    s.mark('mid', Math.abs(a50 - 90) <= 10 && Math.abs(a25 - 45) <= 10)
    s.mark('led', !led0 && !led50 && led90 && led100)
    s.mark('serial', Math.abs(ser0 - 0) <= 10 && Math.abs(ser50 - 90) <= 10 && ser100 >= 170)
  },
  solution: () => {
    const l = ledBranches([{ pin: 'D7' }], 360, 40)
    const circuit = build([...l.parts, part('pot1', 'pot', 360, 300), part('sv1', 'servo', 520, 300)], [
      ...l.wires, ...potWires('pot1', 'A0'), ['sv1.SIG', 'uno.D9'], ['sv1.VCC', 'uno.5V'], ['sv1.GND', 'uno.GND3'],
    ])
    return { circuit, code: `#include <Servo.h>

const int POT = A0;
const int LED = 7;
Servo needle;

void setup() {
  needle.attach(9);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int angle = map(analogRead(POT), 0, 1023, 0, 180);
  needle.write(angle);
  digitalWrite(LED, angle > 150 ? HIGH : LOW);
  Serial.print("Angle: ");
  Serial.println(angle);
  delay(100);
}
` }
  },
})

// ---------------------------------------------------------------- p07 Reaction game
const p07: ExamProject = mk({
  id: 'p07',
  title: 'Reaction Time Tester',
  story: 'At a science fair, visitors test their reflexes: a green light appears after a short wait and they must press the button as fast as they can.',
  brief: `Build a reaction-time game.

Circuit:
- Push button between D2 and GND (use the internal pull-up).
- GO LED (green) on D8 with a 330 ohm series resistor to GND.
- FOUL LED (red) on D7 with a 330 ohm series resistor to GND.

Behaviour (non-blocking: use millis(); do not use delay() calls of 100 ms or more):
1. After power-up wait 2000 ms, then switch the GO LED on and remember the time (millis()).
2. When the button is pressed while the GO LED is on, print one line at 9600 baud in exactly this format:
   Reaction: 312 ms
   (the measured time between GO LED on and the press), then switch the GO LED off.
3. Then wait 2000 ms after that press and start the next round (GO LED on again).
4. False start: if the button is pressed while the GO LED is still off, print the line
   Too early
   switch the FOUL LED on for 500 ms, and restart the 2000 ms wait from that moment.`,
  weeks: [2],
  allowedParts: allowed('button', 'led', 'resistor', 'buzzer'),
  goals: [
    { id: 'c-btn', kind: 'circuit', points: 12, text: 'Push button between D2 and GND.', check: (c) => switchOnPin(c, 'button', 'D2') },
    { id: 'c-go', kind: 'circuit', points: 14, text: 'GO LED with a series resistor on D8 (cathode to GND).', check: (c) => ledOnPin(c, 'D8') },
    { id: 'c-foul', kind: 'circuit', points: 14, text: 'FOUL LED with a series resistor on D7 (cathode to GND).', check: (c) => ledOnPin(c, 'D7') },
    { id: 'k-millis', kind: 'code', points: 10, text: 'Uses millis() for timing and no long delay() calls (100 ms or more).', check: (c) => codeHas(c, /\bmillis\s*\(/) && noDelayLong(c) },
    { id: 'k-serial', kind: 'code', points: 10, text: 'Uses Serial.begin(9600) and Serial.print/println.', check: (c) => codeHas(c, /Serial\.begin\s*\(\s*9600\s*\)/) && codeHas(c, /Serial\.print(ln)?\s*\(/) },
    { id: 'b-wait', kind: 'behavior', points: 8, text: 'The GO LED is off during the first second and turns on after the wait.', check: (c) => ok(c, 'wait') },
    { id: 'b-foul', kind: 'behavior', points: 10, text: 'Pressing too early prints "Too early", lights the FOUL LED and restarts the wait.', check: (c) => ok(c, 'foul') },
    { id: 'b-r1', kind: 'behavior', points: 12, text: 'Pressing 300 ms after GO prints "Reaction: <ms> ms" with a value of about 300-360 and turns the GO LED off.', check: (c) => ok(c, 'r1') },
    { id: 'b-r2', kind: 'behavior', points: 10, text: 'A second round works: GO turns on again and a 150 ms reaction is reported as about 120-220 ms.', check: (c) => ok(c, 'r2') },
  ],
  scenario: (s) => {
    s.advance(1000)
    const offEarly = !hi(s, 'D8')
    tap(s, 60, 100)
    s.mark('foul', /Too early/i.test(s.serial) && hi(s, 'D7'))
    const go1 = wait(s, 4000, () => hi(s, 'D8'))
    s.mark('wait', offEarly && go1)
    if (!go1) return
    s.advance(300)
    s.setAll('button', 'pressed', true); s.advance(60); s.setAll('button', 'pressed', false)
    s.advance(200)
    const reac = () => [...s.serial.matchAll(/Reaction:\s*(\d+)\s*ms/g)].map((m) => Number(m[1]))
    const r = reac()
    s.mark('r1', r.length >= 1 && r[0] >= 295 && r[0] <= 365 && !hi(s, 'D8'))
    const go2 = wait(s, 4000, () => hi(s, 'D8'))
    if (!go2) return
    s.advance(150)
    s.setAll('button', 'pressed', true); s.advance(60); s.setAll('button', 'pressed', false)
    s.advance(200)
    const r2 = reac()
    s.mark('r2', r2.length >= 2 && r2[1] >= 115 && r2[1] <= 225)
  },
  solution: () => {
    const l = ledBranches([{ pin: 'D8', color: 'green' }, { pin: 'D7', color: 'red' }])
    const circuit = build([...l.parts, part('btn1', 'button', 360, 260)], [...l.wires, ['btn1.A', 'uno.D2'], ['btn1.B', 'uno.GND2']])
    return { circuit, code: `const int BTN = 2;
const int GO_LED = 8;
const int FOUL_LED = 7;

bool goOn = false;
unsigned long waitStart = 0;
unsigned long goAt = 0;
unsigned long foulUntil = 0;
int lastBtn = HIGH;

void setup() {
  pinMode(BTN, INPUT_PULLUP);
  pinMode(GO_LED, OUTPUT);
  pinMode(FOUL_LED, OUTPUT);
  Serial.begin(9600);
  waitStart = millis();
}

void loop() {
  unsigned long now = millis();
  int b = digitalRead(BTN);
  bool pressed = (lastBtn == HIGH && b == LOW);
  lastBtn = b;

  if (!goOn) {
    if (pressed) {
      Serial.println("Too early");
      digitalWrite(FOUL_LED, HIGH);
      foulUntil = now + 500;
      waitStart = now;
    }
    if (foulUntil != 0 && now >= foulUntil) {
      digitalWrite(FOUL_LED, LOW);
      foulUntil = 0;
    }
    if (now - waitStart >= 2000) {
      goOn = true;
      goAt = now;
      digitalWrite(GO_LED, HIGH);
    }
  } else if (pressed) {
    Serial.print("Reaction: ");
    Serial.print(now - goAt);
    Serial.println(" ms");
    digitalWrite(GO_LED, LOW);
    goOn = false;
    waitStart = now;
  }
}
` }
  },
})

// ---------------------------------------------------------------- p08 Thermostat indicator
const p08: ExamProject = mk({
  id: 'p08',
  title: 'Thermostat Indicator',
  story: 'A server-room cabinet shows its temperature class with three coloured LEDs and reports the exact value to the serial console.',
  brief: `Build a thermostat indicator with an NTC thermistor (10 kohm at 25 C, beta = 3950).

Circuit:
- 10 kohm fixed resistor (set its value to 10000) between 5V and A0. NTC thermistor between A0 and GND.
- Blue LED on D8, green LED on D9, red LED on D10, each with its own 330 ohm series resistor to GND. Set the LED colours in the property panel.

Behaviour:
- Read A0 and compute the NTC resistance: R = 10000 * adc / (1023 - adc).
- Convert to temperature with the beta equation: 1/T = 1/298.15 + ln(R/10000)/3950 (T in kelvin; subtract 273.15 for Celsius). Use log() for ln.
- Exactly one LED is on: blue if temperature < 20 C, green if 20 C to 26 C inclusive, red if above 26 C.
- Every 500 ms print one line at 9600 baud, exactly in this format (one decimal):
  Temp: 23.5 C
  The printed value must be within 1.5 C of the real temperature.`,
  weeks: [1, 2],
  allowedParts: allowed('ntc', 'resistor', 'led', 'ldr'),
  goals: [
    { id: 'c-divider', kind: 'circuit', points: 16, text: 'Voltage divider: NTC between A0 and GND, 10 kohm resistor (value about 10000 ohm) between 5V and A0.', check: (c) => partsOf(c.circuit, 'ntc').some((n) => (toUno(c, n.id, '1', 'A0') && toGnd(c, n.id, '2')) || (toUno(c, n.id, '2', 'A0') && toGnd(c, n.id, '1'))) && partsOf(c.circuit, 'resistor').some((r) => { const o = Number(r.props.ohms); return o >= 5000 && o <= 20000 && ((to5V(c, r.id, '1') && toUno(c, r.id, '2', 'A0')) || (to5V(c, r.id, '2') && toUno(c, r.id, '1', 'A0'))) }) },
    { id: 'c-blue', kind: 'circuit', points: 8, text: 'Blue LED (colour set to blue) with a series resistor on D8.', check: (c) => ledOnPin(c, 'D8', 'blue') },
    { id: 'c-green', kind: 'circuit', points: 8, text: 'Green LED (colour set to green) with a series resistor on D9.', check: (c) => ledOnPin(c, 'D9', 'green') },
    { id: 'c-red', kind: 'circuit', points: 8, text: 'Red LED with a series resistor on D10.', check: (c) => ledOnPin(c, 'D10') },
    { id: 'k-read', kind: 'code', points: 6, text: 'Reads the divider with analogRead(A0).', check: (c) => codeHas(c, /analogRead\s*\(\s*(A0|14)\s*\)/) },
    { id: 'k-log', kind: 'code', points: 8, text: 'Computes the temperature with the beta equation using log().', check: (c) => codeHas(c, /\blog\s*\(/) && codeHas(c, /3950/) },
    { id: 'k-serial', kind: 'code', points: 6, text: 'Uses Serial.begin(9600) and Serial.print/println.', check: (c) => codeHas(c, /Serial\.begin\s*\(\s*9600\s*\)/) && codeHas(c, /Serial\.print(ln)?\s*\(/) },
    { id: 'b-cold', kind: 'behavior', points: 10, text: 'At 10 C only the blue LED is on.', check: (c) => ok(c, 'cold') },
    { id: 'b-ok', kind: 'behavior', points: 10, text: 'At 23 C only the green LED is on.', check: (c) => ok(c, 'ok') },
    { id: 'b-hot', kind: 'behavior', points: 10, text: 'At 32 C only the red LED is on.', check: (c) => ok(c, 'hot') },
    { id: 'b-serial', kind: 'behavior', points: 10, text: 'Serial prints "Temp: <value> C" within 1.5 C of the real temperature (checked at 10, 23 and 32 C).', check: (c) => ok(c, 'serial') },
  ],
  scenario: (s) => {
    const at = (t: number, want: string) => {
      s.setAll('ntc', 'tempC', t); s.advance(1300)
      const v = lastNum(s.serial, /Temp:\s*(-?\d+(?:\.\d+)?)\s*C/g)
      s.mark('serial', Math.abs(v - t) <= 1.5)
      return pins4(s, 'D8', 'D9', 'D10') === want
    }
    s.mark('cold', at(10, '100'))
    s.mark('ok', at(23, '010'))
    s.mark('hot', at(32, '001'))
  },
  solution: () => {
    const l = ledBranches([{ pin: 'D8', color: 'blue' }, { pin: 'D9', color: 'green' }, { pin: 'D10', color: 'red' }])
    const circuit = build([...l.parts, part('rs', 'resistor', 360, 330, { ohms: 10000 }), part('ntc1', 'ntc', 500, 330)], [
      ...l.wires, ['rs.1', 'uno.5V'], ['rs.2', 'uno.A0'], ['ntc1.1', 'uno.A0'], ['ntc1.2', 'uno.GND2'],
    ])
    return { circuit, code: `const int BLUE = 8;
const int GREEN = 9;
const int RED = 10;

float readTempC() {
  int adc = analogRead(A0);
  float r = 10000.0 * adc / (1023.0 - adc);
  float kelvin = 1.0 / (1.0 / 298.15 + log(r / 10000.0) / 3950.0);
  return kelvin - 273.15;
}

void setup() {
  pinMode(BLUE, OUTPUT);
  pinMode(GREEN, OUTPUT);
  pinMode(RED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  float t = readTempC();
  digitalWrite(BLUE, t < 20.0);
  digitalWrite(GREEN, t >= 20.0 && t <= 26.0);
  digitalWrite(RED, t > 26.0);
  Serial.print("Temp: ");
  Serial.print(t, 1);
  Serial.println(" C");
  delay(500);
}
` }
  },
})

// ---------------------------------------------------------------- p09 7-segment counter
const SEG_PATTERNS = ['1111110', '0110000', '1101101', '1111001', '0110011', '1011011', '1011111', '1110000', '1111111', '1111011'] // a..g
const p09: ExamProject = mk({
  id: 'p09',
  title: 'Visitor Counter Display',
  story: 'A museum entrance shows how many visitors are inside (0-9) on a single-digit display, adjusted by two buttons.',
  brief: `Build an up/down counter on a single-digit 7-segment display (common cathode, default setting).

Circuit:
- Segments a, b, c, d, e, f, g connect directly to D2, D3, D4, D5, D6, D7, D8 (in that order). Leave dp unconnected.
- COM goes to GND through ONE 330 ohm resistor.
- UP button between D9 and GND, DOWN button between D10 and GND (internal pull-ups).

Behaviour:
- The display shows 0 at power-up.
- Each press of UP adds 1; each press of DOWN subtracts 1. The value is limited to 0..9 (UP at 9 and DOWN at 0 do nothing).
- A button held down for half a second counts as ONE press (detect the press edge and debounce).
- Keep the digit patterns in a lookup table (array) or a switch statement.`,
  weeks: [1, 2],
  allowedParts: allowed('sevenseg', 'button', 'resistor', 'led'),
  goals: [
    { id: 'c-segs', kind: 'circuit', points: 22, text: 'Segments a-g wired to D2-D8 in order (a=D2, b=D3, c=D4, d=D5, e=D6, f=D7, g=D8).', check: (c) => partsOf(c.circuit, 'sevenseg').some((d) => 'abcdefg'.split('').every((seg, i) => toUno(c, d.id, seg, `D${2 + i}`))) },
    { id: 'c-com', kind: 'circuit', points: 10, text: 'COM connected to GND through a series resistor (not directly).', check: (c) => partsOf(c.circuit, 'sevenseg').some((d) => ['GND', 'GND2', 'GND3'].some((g) => c.analysis.connected(pin(d.id, 'COM'), pin('uno', g), ['resistor'])) && !toGnd(c, d.id, 'COM')) },
    { id: 'c-up', kind: 'circuit', points: 4, text: 'UP button between D9 and GND.', check: (c) => switchOnPin(c, 'button', 'D9') },
    { id: 'c-down', kind: 'circuit', points: 4, text: 'DOWN button between D10 and GND.', check: (c) => switchOnPin(c, 'button', 'D10') },
    { id: 'k-pullup', kind: 'code', points: 10, text: 'Both buttons use INPUT_PULLUP.', check: (c) => (noComments(c.code).match(/INPUT_PULLUP/g) ?? []).length >= 2 || (codeHas(c, /INPUT_PULLUP/) && codeHas(c, /for\s*\(/)) },
    { id: 'k-table', kind: 'code', points: 10, text: 'Digit patterns are stored in a lookup table (array of 10 entries) or a switch statement.', check: (c) => codeHas(c, /\{[^{}]*(?:,[^{}]*){9,}\}/) || codeHas(c, /case\s+9\s*:/) },
    { id: 'b-zero', kind: 'behavior', points: 8, text: 'The display shows 0 at power-up.', check: (c) => ok(c, 'zero') },
    { id: 'b-up', kind: 'behavior', points: 8, text: 'Three UP presses show 3.', check: (c) => ok(c, 'up') },
    { id: 'b-down', kind: 'behavior', points: 8, text: 'One DOWN press after that shows 2.', check: (c) => ok(c, 'down') },
    { id: 'b-hold', kind: 'behavior', points: 8, text: 'Holding UP for 0.5 s adds only 1 (2 becomes 3).', check: (c) => ok(c, 'hold') },
    { id: 'b-clamp', kind: 'behavior', points: 8, text: 'The count stops at 9 and at 0 (no wrap-around).', check: (c) => ok(c, 'clamp') },
  ],
  scenario: (s) => {
    const digit = () => SEG_PATTERNS.indexOf(['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'].map((p) => (hi(s, p) ? '1' : '0')).join(''))
    s.advance(300)
    const up = buttonOn(s, 'D9'), down = buttonOn(s, 'D10')
    s.mark('zero', digit() === 0)
    for (let i = 0; i < 3; i++) tapId(s, up, 100, 150)
    s.mark('up', digit() === 3)
    tapId(s, down, 100, 150)
    s.mark('down', digit() === 2)
    tapId(s, up, 500, 200)
    s.mark('hold', digit() === 3)
    for (let i = 0; i < 12; i++) tapId(s, up, 60, 100)
    const top = digit() === 9
    for (let i = 0; i < 12; i++) tapId(s, down, 60, 100)
    s.mark('clamp', top && digit() === 0)
  },
  solution: () => {
    const circuit = build([part('sg1', 'sevenseg', 360, 40, { common: 'cathode' }), part('rc', 'resistor', 360, 220, { ohms: 330 }), part('bup', 'button', 360, 300), part('bdn', 'button', 360, 370)], [
      ...'abcdefg'.split('').map((seg, i): [string, string] => [`sg1.${seg}`, `uno.D${2 + i}`]),
      ['sg1.COM', 'rc.1'], ['rc.2', 'uno.GND'], ['bup.A', 'uno.D9'], ['bup.B', 'uno.GND2'], ['bdn.A', 'uno.D10'], ['bdn.B', 'uno.GND3'],
    ])
    return { circuit, code: `const int SEG[7] = {2, 3, 4, 5, 6, 7, 8};   // a..g
const int UP = 9;
const int DOWN = 10;
// bit 0 = a ... bit 6 = g
const byte DIGITS[10] = {0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F};

int count = 0;
int lastUp = HIGH;
int lastDown = HIGH;

void show(int n) {
  for (int i = 0; i < 7; i++) {
    digitalWrite(SEG[i], (DIGITS[n] >> i) & 1);
  }
}

void setup() {
  for (int i = 0; i < 7; i++) {
    pinMode(SEG[i], OUTPUT);
  }
  pinMode(UP, INPUT_PULLUP);
  pinMode(DOWN, INPUT_PULLUP);
  show(count);
}

void loop() {
  int up = digitalRead(UP);
  int down = digitalRead(DOWN);
  if (lastUp == HIGH && up == LOW) {
    if (count < 9) count++;
    show(count);
    delay(20);
  }
  if (lastDown == HIGH && down == LOW) {
    if (count > 0) count--;
    show(count);
    delay(20);
  }
  lastUp = up;
  lastDown = down;
}
` }
  },
})

export const PROJECTS_A: ExamProject[] = [p01, p02, p03, p04, p05, p06, p07, p08, p09]
