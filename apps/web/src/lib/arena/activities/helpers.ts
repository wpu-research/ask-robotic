import type { ArenaActivity, RoverSnapshot } from '../types'

/** Standart sürüş pinleri başlığı (tüm Modül 5 starter'larında aynı). */
export const PIN_HEADER = `const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN1 = 9;
const int SAG_IN2 = 10;
`

/** İşaretli PWM ile tek motoru sürer (eksi = geri). Starter'larda hazır verilir. */
export const MOTOR_FN = `void motor(int en, int in1, int in2, int pwm) {
  digitalWrite(in1, pwm > 0);
  digitalWrite(in2, pwm < 0);
  analogWrite(en, abs(pwm));
}
`

export const SETUP_PINS = `  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
`

/** Robot anlık görüntüsü kısaltması. */
export type RS = RoverSnapshot

/** Hafta kayıt defteri yardımcısı: anahtar = "robotik:<hafta>:<ders>". */
export const rk = (week: number, lesson: number): string => `robotik:${week}:${lesson}`

export type ActivityMap = Record<string, ArenaActivity>

/** HC-SR04 ölçüm fonksiyonu (Modül 4'ten bilinen; yankı gelmezse 400). */
export const MESAFE_FN = `// HC-SR04 ile mesafe (cm). Yankı gelmezse 400 döner.
int mesafeOlc() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return 400;
  return sure / 58;
}
`

/** İki motoru birden süren sarmalayıcı (motor() ile birlikte). */
export const SURUS_FN = `// İki motoru birden sür: sol ve sag -255...255
void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}
`

/** Çizgi sensörleri başlığı (A0 en solda). */
export const LINE_HEADER = `const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};   // A0 en solda
`

/** Çizgi derslerinde kullanılan, işaretli PWM'li iki motor sürücüsü (sol, sag: -255..255). */
export const MOTOR2_FN = `void motor(int sol, int sag) {
  digitalWrite(SOL_IN1, sol > 0);
  digitalWrite(SOL_IN2, sol < 0);
  analogWrite(SOL_EN, abs(sol));
  digitalWrite(SAG_IN1, sag > 0);
  digitalWrite(SAG_IN2, sag < 0);
  analogWrite(SAG_EN, abs(sag));
}
`
