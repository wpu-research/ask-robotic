import { createSim } from './harness.mjs'

const blink = `
void setup() { pinMode(13, OUTPUT); Serial.begin(9600); Serial.println("hazir"); }
void loop() { digitalWrite(13, HIGH); delay(500); digitalWrite(13, LOW); delay(500); }
`
const sim = createSim(blink, { name: 'blink' })
sim.run(2100)
const e = sim.pinEdges(13)
console.log('seri:', JSON.stringify(sim.serial))
console.log('13. pin değişimleri:', e.map((x) => `${x.value ? 'H' : 'L'}@${x.t.toFixed(0)}`).join(' '))
const w = sim.wave(13, 0, 2100)
console.log('frekans Hz:', w.hz.toFixed(2), 'doluluk:', w.duty.toFixed(2))
