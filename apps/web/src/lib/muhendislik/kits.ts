// Laboratuvar kitleri: bir Hyvex parçasını devre laboratuvarında "takılı" açmak için hazır devre + başlangıç sketch'i.
// Her kit Uno'yu, parçayı ve doğru kabloları kurar; sketch content-src/muhendislik/sketches'ten gelir (testlerde derlenmiş hali çalıştırılır).
import type { Circuit, PartInstance, PartType, PinRef, PropValue } from '@/lib/lab/contract'
import type { SketchName } from './sketches'

export type KitName =
  | 'led' | 'buton' | 'ldr' | 'npn' | 'mosfet' | 'gaz' | 'dht22' | 'mesafe' | 'sharp'
  | 'l298n' | 'tb6612' | 'drv8833' | 'bts7960' | 'md10c' | 'stepper' | 'esc' | 'servo' | 'mpu6050' | 'lcd' | 'lcdi2c'
  | 'oled' | 'bme280' | 'ds18b20' | 'vl53l0x'

export interface Kit {
  /** Laboratuvar başlığında görünen kısa ad. */
  title: string
  sketch: SketchName
  /** Çalıştırınca ne görülür (laboratuvar üstündeki not). */
  watch: string
  /** İngilizce başlık ve açıklama (arayüz dili 'en'). */
  en?: { title: string; watch: string }
  /** `model`: parça ailesinde hangi üye (MQ tipi, HC-SR04 modeli, servo/motor modeli). */
  circuit: (model?: string) => Circuit
}

const UNO: PartInstance = { id: 'uno', type: 'uno', x: 40, y: 40, rotation: 0, props: {} }
export const part = (id: string, type: PartType, x: number, y: number, props: Record<string, PropValue> = {}, rotation: PartInstance['rotation'] = 0): PartInstance =>
  ({ id, type, x, y, rotation, props })
const ref = (s: string): PinRef => { const i = s.indexOf('.'); return { part: s.slice(0, i), pin: s.slice(i + 1) } }
export const build = (parts: PartInstance[], wires: Array<[string, string]>): Circuit => ({
  parts: [{ ...UNO, props: {} }, ...parts],
  wires: wires.map(([a, b], i) => ({ id: `k${i + 1}`, a: ref(a), b: ref(b) })),
})

/** Köprü sürücü + DC motor (motor modeli isteğe bağlı). */
const motor = (model?: string): PartInstance => part('m', 'dcmotor', 620, 300, model ? { model } : {})

export const KITS: Record<KitName, Kit> = {
  led: {
    title: 'LED + seri direnç', sketch: 'led_direnc',
    watch: 'LED PWM ile söner/yanar. Dirence veya LED\'e tıkla: üzerindeki gerilim ve akımı (sanal multimetre) gör.',
    en: { title: "LED + series resistor", watch: "The LED fades in and out with PWM. Click the resistor or the LED to see the voltage across it and the current through it (virtual multimeter)." },
    circuit: () => build([part('r', 'resistor', 420, 60, { ohms: 220 }), part('l', 'led', 540, 40, { color: 'red' })],
      [['uno.D9', 'r.1'], ['r.2', 'l.A'], ['l.K', 'uno.GND2']]),
  },
  buton: {
    title: 'Buton (INPUT_PULLUP) ve zıplama süzme', sketch: 'buton_sayac',
    watch: 'Butona bas: D13 LED\'i yanar, seri monitörde basma sayısı artar.',
    en: { title: "Button (INPUT_PULLUP) and debouncing", watch: "Press the button: the D13 LED lights and the press count goes up in the serial monitor." },
    circuit: () => build([part('b', 'button', 440, 220)], [['b.A', 'uno.D2'], ['b.B', 'uno.GND']]),
  },
  ldr: {
    title: 'LDR gerilim bölücü', sketch: 'ldr_bolucu',
    watch: 'LDR\'nin ışık kaydırıcısını değiştir: A0 gerilimi ve geri hesaplanan LDR direnci seri monitörde.',
    en: { title: "LDR voltage divider", watch: "Move the LDR's light slider: the A0 voltage and the calculated LDR resistance appear in the serial monitor." },
    circuit: () => build([part('ldr', 'ldr', 420, 240), part('r', 'resistor', 420, 320, { ohms: 10_000 })],
      [['ldr.1', 'uno.5V'], ['ldr.2', 'uno.A0'], ['r.1', 'uno.A0'], ['r.2', 'uno.GND']]),
  },
  npn: {
    title: 'NPN transistörle motor anahtarlama (flyback diyotlu)', sketch: 'npn_motor',
    watch: 'Motor tam / yarım hız / dur döngüsü. Transistör alçak tarafta; diyot motora ters paralel.',
    en: { title: "Switching a motor with an NPN transistor (with flyback diode)", watch: "The motor cycles through full speed, half speed and stop. The transistor is on the low side; the diode is reverse-parallel to the motor." },
    circuit: () => build([
      part('rb', 'resistor', 400, 60, { ohms: 1000 }), part('q', 'npn', 520, 200), motor(), part('d', 'diode', 620, 220),
    ], [['uno.D9', 'rb.1'], ['rb.2', 'q.B'], ['q.E', 'uno.GND'], ['q.C', 'm.M2'], ['m.M1', 'uno.5V'], ['d.A', 'm.M2'], ['d.K', 'uno.5V']]),
  },
  mosfet: {
    title: 'Lojik seviyeli MOSFET ile motor', sketch: 'mosfet_motor',
    watch: 'PWM doluluğu adım adım artar, motor hızlanır. Kapıdaki 10 kΩ, kapıyı boşta bırakmaz.',
    en: { title: "Motor with a logic-level MOSFET", watch: "The PWM duty cycle rises step by step and the motor speeds up. The 10 k\u03a9 on the gate keeps it from floating." },
    circuit: () => build([
      part('rg', 'resistor', 400, 60, { ohms: 220 }), part('rp', 'resistor', 400, 330, { ohms: 10_000 }), part('f', 'mosfet', 520, 180), motor(), part('d', 'diode', 620, 220),
    ], [['uno.D9', 'rg.1'], ['rg.2', 'f.G'], ['rp.1', 'f.G'], ['rp.2', 'uno.GND'], ['f.S', 'uno.GND3'], ['f.D', 'm.M2'], ['m.M1', 'uno.5V'], ['d.A', 'm.M2'], ['d.K', 'uno.5V']]),
  },
  gaz: {
    title: 'MQ gaz sensörü (AO + DO)', sketch: 'gaz_mq',
    watch: 'Gaz düzeyi kaydırıcısını artır: AO gerilimi yükselir, eşik aşılınca DO LOW olur ve ALARM yazılır.',
    en: { title: "MQ gas sensor (AO + DO)", watch: "Raise the gas level slider: the AO voltage rises, and above the threshold DO goes LOW and ALARM is printed." },
    circuit: (model = 'mq2') => build([part('g', (['mq2', 'mq3', 'mq4', 'mq7', 'mq135'].includes(model) ? model : 'mq2') as PartType, 440, 200, { gas: 0.2, threshold: 0.5 })],
      [['g.VCC', 'uno.5V'], ['g.GND', 'uno.GND'], ['g.AO', 'uno.A0'], ['g.DO', 'uno.D2']]),
  },
  dht22: {
    title: 'DHT22 sıcaklık ve nem', sketch: 'dht22_oku',
    watch: 'İki saniyede bir sıcaklık ve nem. Sensör kaydırıcılarını değiştir, değerin bir sonraki okumada geldiğini gör.',
    en: { title: "DHT22 temperature and humidity", watch: "Temperature and humidity every two seconds. Change the sensor sliders and watch the value arrive with the next reading." },
    circuit: () => build([part('t', 'dht', 440, 200, { type: 'dht22', tempC: 24, humidity: 45 })], [['t.VCC', 'uno.5V'], ['t.DATA', 'uno.D2'], ['t.GND', 'uno.GND']]),
  },
  mesafe: {
    title: 'Ultrasonik mesafe (TRIG/ECHO)', sketch: 'mesafe_cm',
    watch: 'Mesafe kaydırıcısını oynat. Modelin ölçüm aralığı dışında "menzil disi" yazılır.',
    en: { title: "Ultrasonic distance (TRIG/ECHO)", watch: "Move the distance slider. Outside the model's measuring range it prints \"menzil disi\" (out of range)." },
    circuit: (model = 'hcsr04') => build([part('h', 'hcsr04', 440, 230, { model, distanceCm: 100 })],
      [['h.VCC', 'uno.5V'], ['h.GND', 'uno.GND'], ['h.TRIG', 'uno.D9'], ['h.ECHO', 'uno.D10']]),
  },
  sharp: {
    title: 'Sharp IR analog mesafe', sketch: 'sharp_ir',
    watch: 'Mesafe 10-80 cm: VO gerilimi uzaklıkla ters orantılı düşer; sketch cm = 26 / V ile geri çevirir.',
    en: { title: "Sharp IR analog distance", watch: "Distance 10-80 cm: the VO voltage falls as the distance grows; the sketch converts back with cm = 26 / V." },
    circuit: () => build([part('s', 'sharpir', 440, 240, { distanceCm: 30 })], [['s.VCC', 'uno.5V'], ['s.GND', 'uno.GND'], ['s.VO', 'uno.A0']]),
  },
  l298n: {
    title: 'L298N ile DC motor', sketch: 'kopru_en_in',
    watch: 'İleri tam / yarım / geri / dur. L298N bipolar köprüdür: 5 V beslemede motora yalnız ~3,2 V ulaşır (≈1,8 V kayıp).',
    en: { title: "DC motor with an L298N", watch: "Forward full / half / reverse / stop. The L298N is a bipolar bridge: from a 5 V supply only about 3.2 V reaches the motor (about 1.8 V lost)." },
    circuit: (model) => build([part('d', 'l298n', 420, 220), motor(model)], [
      ['d.12V', 'uno.5V'], ['d.GND', 'uno.GND'], ['d.ENA', 'uno.D5'], ['d.IN1', 'uno.D7'], ['d.IN2', 'uno.D8'], ['d.OUT1', 'm.M1'], ['d.OUT2', 'm.M2'],
    ]),
  },
  tb6612: {
    title: 'TB6612FNG ile DC motor', sketch: 'kopru_en_in',
    watch: 'Aynı sketch, MOSFET köprü: kayıp çok küçük. STBY kablosunu çıkar: sürücü bekleme moduna geçer.',
    en: { title: "DC motor with a TB6612FNG", watch: "Same sketch, MOSFET bridge: very small loss. Remove the STBY wire and the driver goes into standby." },
    circuit: (model) => build([part('d', 'tb6612', 420, 200), motor(model)], [
      ['d.VM', 'uno.5V'], ['d.VCC', 'uno.5V'], ['d.GND', 'uno.GND'], ['d.PWMA', 'uno.D5'], ['d.AIN1', 'uno.D7'], ['d.AIN2', 'uno.D8'], ['d.STBY', 'uno.D9'],
      ['d.AO1', 'm.M1'], ['d.AO2', 'm.M2'],
    ]),
  },
  drv8833: {
    title: 'DRV8833 ile DC motor (iki PWM)', sketch: 'kopru_iki_pwm',
    watch: 'EN pini yok: hız ve yön IN1/IN2\'ye verilen PWM ile. İkisi LOW serbest, ikisi HIGH fren.',
    en: { title: "DC motor with a DRV8833 (two PWM inputs)", watch: "No EN pin: speed and direction come from PWM on IN1/IN2. Both LOW coasts, both HIGH brakes." },
    circuit: (model) => build([part('d', 'drv8833', 420, 200), motor(model)], [
      ['d.VCC', 'uno.5V'], ['d.GND', 'uno.GND'], ['d.AIN1', 'uno.D5'], ['d.AIN2', 'uno.D6'], ['d.AOUT1', 'm.M1'], ['d.AOUT2', 'm.M2'],
    ]),
  },
  bts7960: {
    title: 'BTS7960 yüksek akım sürücü', sketch: 'kopru_iki_pwm',
    watch: 'RPWM ileri, LPWM geri; R_EN ve L_EN HIGH olmalı. Gerçekte 43 A\'e kadar: büyük motorlar için.',
    en: { title: "BTS7960 high-current driver", watch: "RPWM forward, LPWM reverse; R_EN and L_EN must be HIGH. Up to 43 A in reality: for big motors." },
    circuit: (model) => build([part('d', 'bts7960', 420, 180), motor(model)], [
      ['d.VCC', 'uno.5V'], ['d.GND', 'uno.GND'], ['d.RPWM', 'uno.D5'], ['d.LPWM', 'uno.D6'], ['d.R_EN', 'uno.D9'], ['d.L_EN', 'uno.D9'], ['d.M+', 'm.M1'], ['d.M-', 'm.M2'],
    ]),
  },
  md10c: {
    title: 'Cytron MD10C (PWM + DIR)', sketch: 'kopru_pwm_dir',
    watch: 'Tek PWM hız, DIR yön. PWM LOW anlarında köprü freni.',
    en: { title: "Cytron MD10C (PWM + DIR)", watch: "One PWM for speed, DIR for direction. While PWM is LOW the bridge brakes." },
    circuit: (model) => build([part('d', 'md10c', 420, 220), motor(model)], [
      ['d.VCC', 'uno.5V'], ['d.GND', 'uno.GND'], ['d.PWM', 'uno.D5'], ['d.DIR', 'uno.D7'], ['d.MA', 'm.M1'], ['d.MB', 'm.M2'],
    ]),
  },
  stepper: {
    title: 'STEP/DIR ile step motor (TMC2209 + NEMA17 modeli)', sketch: 'step_motor',
    watch: '800 STEP darbesi = 180° (1/8 mikro adım), sonra 90° geri. Mikro adım ayarını değiştir, açının değiştiğini gör.',
    en: { title: "Stepper motor with STEP/DIR (TMC2209 + NEMA17 model)", watch: "800 STEP pulses = 180\u00b0 (1/8 microstepping), then 90\u00b0 back. Change the microstep setting and watch the angle change." },
    circuit: () => build([part('st', 'stepper', 420, 220, { microsteps: '8' })], [
      ['st.VCC', 'uno.5V'], ['st.GND', 'uno.GND'], ['st.STEP', 'uno.D3'], ['st.DIR', 'uno.D4'], ['st.EN', 'uno.D8'],
    ]),
  },
  esc: {
    title: 'ESC + fırçasız motor', sketch: 'esc_bldc',
    watch: 'ESC önce ~1 s düşük gazla kurulur (KURULU), sonra gaz 1000→1400 µs. GND kablosunu çıkar: sinyal görülmez.',
    en: { title: "ESC + brushless motor", watch: "The ESC arms first with about 1 s of low throttle (ARMED), then the throttle goes 1000\u21921400 \u00b5s. Remove the GND wire: the signal is no longer seen." },
    circuit: () => build([part('e', 'esc', 420, 240, { kv: 2300, cells: '3' })], [['e.SIG', 'uno.D9'], ['e.GND', 'uno.GND']]),
  },
  servo: {
    title: 'Servo açı taraması', sketch: 'servo_tarama',
    watch: 'Servo 0-180° arasında 45° adımlarla döner. Büyük servoları gerçekte Uno 5V\'tan besleme.',
    en: { title: "Servo angle sweep", watch: "The servo turns 0-180\u00b0 in 45\u00b0 steps. Do not power big servos from the Uno's 5V in real life." },
    circuit: (model = 'sg90') => build([part('s', 'servo', 440, 220, { model })], [['s.SIG', 'uno.D9'], ['s.VCC', 'uno.5V'], ['s.GND', 'uno.GND']]),
  },
  mpu6050: {
    title: 'MPU6050 ham ivme (Wire)', sketch: 'mpu6050_ham',
    watch: 'İvme kaydırıcılarını değiştir: ax/ay/az ve hesaplanan eğim açısı seri monitörde.',
    en: { title: "MPU6050 raw acceleration (Wire)", watch: "Change the acceleration sliders: ax/ay/az and the calculated tilt angle appear in the serial monitor." },
    circuit: () => build([part('imu', 'mpu6050', 440, 230)], [['imu.VCC', 'uno.5V'], ['imu.GND', 'uno.GND'], ['imu.SDA', 'uno.A4'], ['imu.SCL', 'uno.A5']]),
  },
  lcd: {
    title: '16x2 LCD (paralel, 4-bit)', sketch: 'lcd_paralel',
    watch: 'Üst satırda karşılama, alt satırda geçen saniye. 6 sinyal kablosu gerekir.',
    en: { title: "16x2 LCD (parallel, 4-bit)", watch: "A greeting on the top line, elapsed seconds on the bottom. It needs 6 signal wires." },
    circuit: () => build([part('lcd', 'lcd1602', 380, 260), part('r', 'resistor', 700, 230, { ohms: 220 })], [
      ['lcd.RS', 'uno.D12'], ['lcd.E', 'uno.D11'], ['lcd.D4', 'uno.D5'], ['lcd.D5', 'uno.D4'], ['lcd.D6', 'uno.D3'], ['lcd.D7', 'uno.D2'],
      ['lcd.VSS', 'uno.GND'], ['lcd.RW', 'uno.GND'], ['lcd.V0', 'uno.GND3'], ['lcd.VDD', 'uno.5V'], ['lcd.A', 'r.1'], ['r.2', 'uno.5V'], ['lcd.K', 'uno.GND2'],
    ]),
  },
  lcdi2c: {
    title: 'I2C LCD (PCF8574)', sketch: 'lcd_i2c',
    watch: 'Aynı ekran yalnız iki veri kablosuyla (SDA/SCL). Adres 0x27. Kütüphane açılışta ~1 s bekler, sonra yazı gelir.',
    en: { title: "I2C LCD (PCF8574)", watch: "The same display with only two data wires (SDA/SCL). Address 0x27. The library waits about 1 s at start-up, then the text appears." },
    circuit: () => build([part('lcd', 'lcdI2c', 380, 240)], [['lcd.GND', 'uno.GND'], ['lcd.VCC', 'uno.5V'], ['lcd.SDA', 'uno.A4'], ['lcd.SCL', 'uno.A5']]),
  },
  oled: {
    title: 'OLED 128x64 (SSD1306, Adafruit kütüphanesi)', sketch: 'oled_merhaba',
    watch: 'Ekranda "Merhaba!", çerçeve ve dolu daire; alt satırda geçen saniye. Kütüphane 1 KB\'lık tamponu display() ile I2C üzerinden gönderir.',
    en: { title: 'OLED 128x64 (SSD1306, Adafruit library)', watch: 'The screen shows "Merhaba!", a frame and a filled circle; the bottom line counts seconds. The library sends its 1 KB buffer over I2C with display().' },
    circuit: () => build([part('o', 'oled', 440, 220)], [['o.VCC', 'uno.5V'], ['o.GND', 'uno.GND'], ['o.SDA', 'uno.A4'], ['o.SCL', 'uno.A5']]),
  },
  bme280: {
    title: 'BME280 sıcaklık, basınç ve nem (I2C)', sketch: 'bme280_oku',
    watch: 'Saniyede bir T, P ve H. Kaydırıcıları değiştir: değer bir sonraki okumada gelir. Adresi 0x77 yaparsan sensör bulunamaz.',
    en: { title: 'BME280 temperature, pressure and humidity (I2C)', watch: 'T, P and H once a second. Move the sliders: the value arrives with the next reading. Set the address to 0x77 and the sensor is not found.' },
    circuit: () => build([part('b', 'bme280', 440, 230, { tempC: 22, pressureHpa: 1013.25, humidity: 45 })],
      [['b.VCC', 'uno.5V'], ['b.GND', 'uno.GND'], ['b.SDA', 'uno.A4'], ['b.SCL', 'uno.A5']]),
  },
  ds18b20: {
    title: 'DS18B20 sıcaklık (1-Wire, 4,7 kΩ pull-up)', sketch: 'ds18b20_oku',
    watch: 'Dönüşüm (12 bit) ~0,6 s sürer, sonra sıcaklık yazılır. 4,7 kΩ direnci çıkar: hat yükselmez, "sensor yok" yazılır.',
    en: { title: 'DS18B20 temperature (1-Wire, 4.7 k\u03a9 pull-up)', watch: 'A 12-bit conversion takes about 0.6 s, then the temperature is printed. Remove the 4.7 k\u03a9 resistor: the line never rises and it prints "sensor yok" (no sensor).' },
    circuit: () => build([part('t', 'ds18b20', 440, 230, { tempC: 24 }), part('r', 'resistor', 420, 120, { ohms: 4700 })],
      [['t.GND', 'uno.GND'], ['t.VCC', 'uno.5V'], ['t.DQ', 'uno.D2'], ['r.1', 't.DQ'], ['r.2', 'uno.5V']]),
  },
  vl53l0x: {
    title: 'VL53L0X lazer mesafe (ToF, Pololu kütüphanesi)', sketch: 'vl53l0x_mesafe',
    watch: 'Tek atış ölçüm ~33 ms sürer, mesafe mm olarak yazılır. 2000 mm\'nin ötesinde 8190 (hedef yok) okunur. XSHUT\'u GND\'ye bağla: sensör kapanır.',
    en: { title: 'VL53L0X laser distance (ToF, Pololu library)', watch: 'A single-shot measurement takes about 33 ms and the distance is printed in mm. Beyond 2000 mm it reads 8190 (no target). Tie XSHUT to GND and the sensor shuts down.' },
    circuit: () => build([part('v', 'vl53l0x', 440, 230, { distanceMm: 350 })], [['v.VCC', 'uno.5V'], ['v.GND', 'uno.GND'], ['v.SDA', 'uno.A4'], ['v.SCL', 'uno.A5']]),
  },
}

/** Kitin başlık ve açıklaması arayüz diline göre. */
export const kitText = (k: Kit, lang: 'tr' | 'en'): { title: string; watch: string } => (lang === 'en' && k.en ? k.en : { title: k.title, watch: k.watch })
