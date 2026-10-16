// ESOF 323 derse özel laboratuvar kitleri (/laboratuvar?kit=<ad>): haftanın kodu + hazır devre. Sketch'ler
// content-src/muhendislik/sketches'ten (tools/sim/muhendislik.mjs derler; kits.test.ts gerçek hex'le çalıştırır).
import { build, part, type Kit } from '@/lib/muhendislik/kits'

export type CourseKitName = 'cizgi' | 'trafik' | 'kesme'
export interface CourseKit extends Kit { week: number; en: { title: string; watch: string } }

export const COURSE_KITS: Record<CourseKitName, CourseKit> = {
  cizgi: {
    week: 1, sketch: 'cizgi_izleyen',
    title: 'Çizgi izleyen: 2 IR sensör + L298N + 2 motor',
    watch: 'IR modüllerinin "Yakınlık" kaydırıcıları çizgiyi temsil eder (eşiği geçince çizgi görüldü). İkisi de görürse düz, biri görürse o tarafa döner, hiçbiri görmezse durur. Motor çubuklarını ve seri monitörü izle.',
    en: { title: 'Line follower: 2 IR sensors + L298N + 2 motors', watch: 'The IR modules\' proximity sliders stand for the line (above the threshold = line seen). Both see it: straight; one sees it: turn that way; none: stop. Watch the motors and the serial monitor.' },
    circuit: () => build([
      part('irl', 'irobstacle', 360, 250, { proximity: 0.8, threshold: 0.5 }), part('irr', 'irobstacle', 470, 250, { proximity: 0.8, threshold: 0.5 }),
      part('d', 'l298n', 640, 40), part('ml', 'dcmotor', 860, 40), part('mr', 'dcmotor', 860, 140),
    ], [
      ['irl.VCC', 'uno.5V'], ['irl.GND', 'uno.GND'], ['irl.OUT', 'uno.D2'], ['irr.VCC', 'uno.5V'], ['irr.GND', 'uno.GND3'], ['irr.OUT', 'uno.D3'],
      ['d.12V', 'uno.5V'], ['d.GND', 'uno.GND2'], ['d.ENA', 'uno.D5'], ['d.IN1', 'uno.D6'], ['d.IN2', 'uno.D7'], ['d.IN3', 'uno.D8'], ['d.IN4', 'uno.D9'], ['d.ENB', 'uno.D10'],
      ['d.OUT1', 'ml.M1'], ['d.OUT2', 'ml.M2'], ['d.OUT3', 'mr.M1'], ['d.OUT4', 'mr.M2'],
    ]),
  },
  trafik: {
    week: 2, sketch: 'trafik_fsm',
    title: 'Trafik ışığı durum makinesi (millis) + potansiyometre',
    watch: 'Işıklar 4 / 1 / 3 saniyelik döngüde değişir; aynı anda potansiyometre gerilimi 4 Hz\'de yazılır. delay() olmadığı için ikisi birbirini beklemez.',
    en: { title: 'Traffic light state machine (millis) + potentiometer', watch: 'The lights cycle 4 / 1 / 3 seconds while the potentiometer voltage is printed at 4 Hz. Without delay() neither waits for the other.' },
    circuit: () => build([
      part('rg', 'resistor', 380, 40, { ohms: 220 }), part('ry', 'resistor', 380, 90, { ohms: 220 }), part('rr', 'resistor', 380, 140, { ohms: 220 }),
      part('lg', 'led', 500, 200, { color: 'green' }), part('ly', 'led', 560, 200, { color: 'yellow' }), part('lr', 'led', 620, 200, { color: 'red' }),
      part('pot', 'pot', 380, 300, { position: 0.5 }),
    ], [
      ['uno.D11', 'rg.1'], ['rg.2', 'lg.A'], ['lg.K', 'uno.GND2'], ['uno.D12', 'ry.1'], ['ry.2', 'ly.A'], ['ly.K', 'uno.GND2'], ['uno.D13', 'rr.1'], ['rr.2', 'lr.A'], ['lr.K', 'uno.GND2'],
      ['pot.VCC', 'uno.5V'], ['pot.GND', 'uno.GND'], ['pot.SIG', 'uno.A0'],
    ]),
  },
  kesme: {
    week: 3, sketch: 'kesme_enkoder',
    title: 'Kesmeyle (interrupt) enkoder sayımı',
    watch: 'Enkoderin "Konum" değerini değiştir. CHANGE kesmesi CLK\'nin iki kenarını da yakalar: bir tık = 2 sayım (3 tık → 6). Ters yöne çevirince sayaç azalır. loop() 10 Hz\'de yalnız sonucu yazar.',
    en: { title: 'Counting encoder ticks with an interrupt', watch: 'Change the encoder position. A CHANGE interrupt catches both edges of CLK: one click = 2 counts (3 clicks → 6). Turning back decreases the counter. loop() only prints the result at 10 Hz.' },
    circuit: () => build([part('enc', 'encoder', 420, 230)], [
      ['enc.CLK', 'uno.D2'], ['enc.DT', 'uno.D4'], ['enc.SW', 'uno.D5'], ['enc.VCC', 'uno.5V'], ['enc.GND', 'uno.GND'],
    ]),
  },
}

export const courseKitOf = (name: string | undefined): CourseKit | undefined => (name && name in COURSE_KITS ? COURSE_KITS[name as CourseKitName] : undefined)
