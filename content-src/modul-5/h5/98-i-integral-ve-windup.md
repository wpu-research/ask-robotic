# I: integral ve windup
süre: 35

## Merak
Bir arabanın sağ lastiği biraz daha az şişikse, direksiyonu bıraktığında araba yavaşça bir yana çeker. Robotlarda da iki motorun verimi hiçbir zaman aynı değildir. P kontrol bu çekmeyi düzeltmeye çalışır, ama bir tuzağı vardır: düzeltme hataya bağlıdır, hata sıfır olunca düzeltme de sıfır olur. Robot bu yüzden hedefe hiç tam varamaz, hep biraz kenarda gider. Bu derste hatayı **biriktiren** terimi (I) ve onun yan etkisini (windup) göreceksin.

## Etkinlik
### Kavramlar
- **Kalıcı hata:** uzun süre sonra bile kapanmayan hata. P kontrolde sabit bir dış etki (zayıf motor) varsa oluşur.
- **Integral (I):** hatanın zaman içinde toplamı: `integral += e * dt`. Küçük bir hata bile uzun sürerse birikir ve düzeltmeyi büyütür. `u = Kp x e + Ki x integral + Kd x turev`.
- **Windup:** çıkış sınırına dayandığında (motor 255'ten fazla PWM alamaz) hata sürdüğü için integral birikmeye devam eder. Sonra hata tersine dönse bile bu birikmiş değer çıkışı uzun süre yanlış yerde tutar.
- **Anti-windup:** windup'ı önleyen yöntemler. İki tane göreceksin: integrali sınırlamak ve çıkış doyunca integrali durdurmak.

### Devre
| Parça | Bağlantı |
|---|---|
| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| HC-SR04 | TRIG **D11**, ECHO **D12** |
| Servo (180 derece, sola bakar) | Sinyal **D4** |
| Sol enkoder | **D2** (kesme pini) |

Motorlar ve servo için harici güç, ortak GND. Pili kısa devre yapma, ters bağlama.

### Program 1: Zayıf motorlu robot duvar takibinde
97. dersin duvar takipçisine integral ekledik. Integral `ILIM` ile sınırlanıyor.

```cpp
// sketch: i_duvar
#include <Servo.h>

const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12, SERVO_PIN = 4;

const float HEDEF = 15.0;          // duvarla istenen mesafe (cm)
const float KP = 6.0;              // PWM / cm
const float KI = 2.0;              // PWM / (cm x s)
const float KD = 3.0;              // PWM / (cm/s)
const float ILIM = 30.0;           // integral sınırı (cm x s); KI x ILIM = 60 PWM
const float ALFA = 0.8;            // türev süzgeci: 0 = süzgeç yok, 1'e yaklaştıkça daha yavaş
const int TABAN = 170;
const int UMAX = 100;              // direksiyon sınırı
const unsigned long DT = 50;       // 20 ölçüm / saniye

Servo servo;
unsigned long son = 0;
float mesafe = HEDEF;
float sonHata = 0;
float turevSuz = 0;                // süzülmüş türev
float integral = 0;                // hataların birikimi (cm x s)

void surucu(int en, int in1, int in2, int v) {
  v = constrain(v, -255, 255);
  int pwm = abs(v);
  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);
  digitalWrite(in1, v > 0);
  digitalWrite(in2, v < 0);
  analogWrite(en, pwm);
}

// Mesafe (cm). Yankı yoksa -1.
float olc() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long us = pulseIn(ECHO, HIGH, 25000);
  if (us == 0) return -1;
  return us / 58.0;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2, TRIG};
  for (int i = 0; i < 7; i++) pinMode(pinler[i], OUTPUT);
  pinMode(ECHO, INPUT);
  servo.attach(SERVO_PIN);
  servo.write(180);                // ışın sola, duvara dik
  delay(500);
  float ilk = olc();
  if (ilk > 0) mesafe = ilk;
  sonHata = mesafe - HEDEF;        // ilk türev sıçramasını önle
}

void loop() {
  if (millis() - son < DT) return;
  son += DT;
  float dt = DT / 1000.0;

  float m = olc();
  if (m > 0) mesafe = m;           // yankı yoksa eski değeri koru

  float e = mesafe - HEDEF;        // + : duvardan çok uzak
  float turev = (e - sonHata) / dt;
  sonHata = e;
  turevSuz = ALFA * turevSuz + (1 - ALFA) * turev;   // basit alçak geçiren süzgeç

  integral += e * dt;
  integral = constrain(integral, -ILIM, ILIM);       // sınırla: sonsuza gitmesin

  float u = KP * e + KI * integral + KD * turevSuz;
  u = constrain(u, -UMAX, UMAX);

  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);       // u > 0: duvara (sola) dön
  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);
}
```

### Ölçüm 1: Kalıcı sapma
Sağ motoru %15 zayıflattık (`gain: right = 0,85`). Düz duvar, hedef 15 cm, 12 sn. Robot duvardan uzaklaşmak ister; bunu durdurmak için yaklaşık 13 PWM'lik sabit bir direksiyon gerekir.

| Ayar | Son 1 sn'de ortalama sapma | 6. sn'den sonra +-2 cm içinde kalma |
|---|---|---|
| `KI = 0` (PD) | 2,25 cm | %7 |
| `KI = 2` (PID, derste) | 0,09 cm | %95 |

P kontrolde sapma hesaplanabilir: sabit 13 PWM'i `Kp = 6` ile üretmek için hata `13 / 6 = 2,2 cm` kalmak zorunda. Integral ise bu sabit direksiyonu kendi üstüne alır: hata 0'a inse bile integral birikmiş değerini korur. Motorlar eşit olduğunda aynı PID sapmayı 0,06 cm'de tutar; I, ihtiyaç yokken zarar vermez.

`KI` değerini değiştirince sapmanın kapanma hızı değişir. Aynı koşuda 12. sn civarındaki sapma:

| KI | 0,5 | 1 | 2 (derste) | 6 | 12 |
|---|---|---|---|---|---|
| Sapma | 0,97 cm | 0,41 cm | 0,09 cm | 0,08 cm | 0,09 cm |

KI büyüdükçe sapma daha çabuk kapanır. KI = 12'de ise hedef 0,8 cm aşıldı (KI = 2'de aşım yok). KI büyüdükçe aşım artmaya başlar.

`ILIM` integrali sınırlar. Çıkışa en fazla `KI x ILIM` PWM katkı yapabilir: derste `2 x 30 = 60` PWM, gereken 13 PWM'den fazla. `ILIM = 3` yaparsan `2 x 3 = 6` PWM yetmez; aynı koşuda sapma 2,25 cm'den 1,27 cm'ye indi ama kapanmadı.

### Program 2: Windup'ı kanıtla
Windup en net **hız kontrolünde** görülür. Robot 15, sonra 25 cm/s hızla gitmeye çalışır. Sonra hedefi 50 cm/s yaparız. Motor en fazla yaklaşık 39,6 cm/s verir (12 rad/s x 3,3 cm), yani çıkış 255'e dayanır ve hata kapanmaz. 4 saniye sonra hedefi tekrar 15'e düşürürüz. Sketch'te `ANTI_WINDUP` ile iki hâli karşılaştırabilirsin. (`Kc = 7,4` ve `Ti = 0,08` değerlerinin nereden geldiğini 99. derste ölçerek bulacaksın; şimdilik hazır kabul et.)

```cpp
// sketch: i_hiz_windup
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int ENK_SOL = 2;                 // sol enkoder (kesme pini)

const float TIK_CM = 1.0367;           // bir tık = 1,04 cm yol (20 yuva, 3,3 cm yarıçap)
const float KC = 7.4;                  // PWM / (cm/s)
const float TI = 0.08;                 // integral zamanı (s)
const bool ANTI_WINDUP = false;        // true: çıkış doyunca integrali durdur
const unsigned long DT = 20;

volatile unsigned long sonTikUs = 0;
volatile unsigned long aralikUs = 0;
unsigned long son = 0;
unsigned long sonYazdir = 0;
float integral = 0;

void surucu(int en, int in1, int in2, int v) {
  v = constrain(v, -255, 255);
  int pwm = abs(v);
  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);
  digitalWrite(in1, v > 0);
  digitalWrite(in2, v < 0);
  analogWrite(en, pwm);
}

void tik() {
  unsigned long t = micros();
  aralikUs = t - sonTikUs;             // son iki tık arası süre
  sonTikUs = t;
}

// Tekerlek hızı (cm/s): bir tıkın yolu / tıklar arası süre.
float hizOku() {
  noInterrupts();
  unsigned long aralik = aralikUs;
  unsigned long sonTik = sonTikUs;
  interrupts();
  unsigned long gecen = micros() - sonTik;
  if (aralik == 0 || gecen > 200000UL) return 0;   // 0,2 sn tık yoksa durdu say
  if (gecen > aralik) aralik = gecen;              // yavaşlıyorsa eski aralığa güvenme
  return TIK_CM * 1000000.0 / aralik;
}

// İstenen hız (cm/s): 15 -> 25 -> 50 (motorun gücünü aşar) -> 15
float hedefHiz(unsigned long t) {
  if (t < 1500) return 15;
  if (t < 3500) return 25;
  if (t < 7500) return 50;
  return 15;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
  pinMode(ENK_SOL, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), tik, RISING);
  Serial.begin(115200);
}

void loop() {
  if (millis() - son < DT) return;
  son += DT;
  float dt = DT / 1000.0;

  float hiz = hizOku();
  float e = hedefHiz(millis()) - hiz;

  // Bu turda integrali eklersek çıkış ne olurdu?
  float aday = KC * (e + (integral + e * dt) / TI);
  bool doymus = (aday <= 0 || aday >= 255);
  if (!(ANTI_WINDUP && doymus)) integral += e * dt;   // doymuşken biriktirme

  float u = KC * (e + integral / TI);
  u = constrain(u, 0, 255);
  surucu(SOL_EN, SOL_IN1, SOL_IN2, u);
  surucu(SAG_EN, SAG_IN1, SAG_IN2, u);

  if (millis() - sonYazdir >= 500) {          // integralin nasıl büyüdüğünü izle
    sonYazdir = millis();
    Serial.print(millis());
    Serial.print(",");
    Serial.print(hedefHiz(millis()), 0);
    Serial.print(",");
    Serial.print(hiz, 1);
    Serial.print(",");
    Serial.println(integral, 1);
  }
}
```

### Nasıl çalışıyor?
1. Hız, iki enkoder tıkı arasındaki süreden hesaplanır (91-92. derslerdeki enkoder tıkları): `hız = bir tıkın yolu / tıklar arası süre`. Kesme rutini bu süreyi yazarken ana program yarım değer okumasın diye okuma `noInterrupts()` ile `interrupts()` arasına alınır (29. ders).
2. PI burada standart biçimde: `u = Kc x (e + integral / Ti)`.
3. `aday`, bu turda integrali eklersek çıkışın ne olacağını hesaplar. `aday` 0'ın altına ya da 255'in üstüne çıkıyorsa çıkış doymuş demektir.
4. `ANTI_WINDUP = true` iken doymuş turlarda integral artırılmaz. Çıkış doymuşken biriktirmeyi durdurmak "koşullu integral" yöntemidir.
5. Seri çıktı her 500 ms'de `zaman, hedef, hız, integral` yazar. Hedef 50 iken integralin ne yaptığını izle.

### Ölçüm 2: Clamp'siz ve clamp'li
| Ayar | Hız, hedef 50 iken | 7. sn'de integral | Hedef 15'e inince +-2 cm/s içine girme süresi | Hata alanı (7,5-10 sn) |
|---|---|---|---|---|
| `ANTI_WINDUP = false` | ~39,6 cm/s (doymuş) | 40,2 | 1,84 sn | 42,8 cm |
| `ANTI_WINDUP = true` | ~39,6 cm/s (doymuş) | 1,8 | 0,34 sn | 1,5 cm |

Hata alanı: hatanın mutlak değerinin zamanla toplamı (cm/s x sn = cm). Küçük olması iyi.

- İkisi de doymuş sürede hedefe ulaşamadı; bu motorun sınırı, kontrolcünün suçu değil.
- Clamp'siz sürümde integral 4 saniyede 40'a çıktı. Hedef 15'e inince bu birikim önce boşalmak zorunda; çıkış o sürede yüksek kaldı ve robot yavaşlayamadı. Toparlanma 5,4 kat daha uzun, hata alanı 28 kat büyük.
- Clamp'li sürümde integral 1,8'de kaldı ve robot 0,34 sn'de yeni hıza oturdu.
- Doymadan önce (25 cm/s hedefinde) iki sürüm de hedefi izledi (hata alanı 3 cm'nin altında): anti-windup normal çalışmayı bozmaz.

### Gerçek robotta farklı olabilecekler
- Gerçek tekerlek hızı tıklar arası sürede dalgalanır ve ölçüm kabadır; integral ve türev ayarı biraz daha dikkat ister.
- Robotu elinle tutarsan gerçek robotda da aynı windup olur: tekerlekler dönmediği için hata büyür, integral birikir. Bıraktığında robot fırlayabilir. Test ederken tekerlekleri havada tut ve bırakmadan önce kontrolü sıfırla.

### Dene
- `ANTI_WINDUP = false` iken hedef 50 cm/s'yi 30 cm/s ile değiştir (motor bu hıza ulaşabilir). Windup oluşuyor mu? Neden?
- `i_duvar` sketch'inde `KI`'yı 0,5 yap. Sapma kaç saniyede ±2 cm içine giriyor?
- `i_hiz_windup`'ta `hedefHiz()` içindeki 50 cm/s bölümünü 4 sn yerine 2 sn yap. Windup etkisi küçülüyor mu?

### Sık yapılan hatalar
- `integral += e * dt` satırında `dt` ile çarpmayı unutmak: integral kontrol periyoduna bağımlı olur.
- Integrali hiç sınırlamamak: çıkış doyduğunda windup kaçınılmaz.
- `KI`'yı tek seferde çok büyütmek: aşım başlar. Küçükten başla.
- Hatanın işaretini ters yazmak: integral hatayı kapatmak yerine büyütür.
- Robot tutulurken ya da engele dayanmışken kontrolü açık bırakmak: integral sessizce birikir.

## Konuşalım
Robotu elinle havada tutarken PI kontrol açık kalsaydı integrale ne olurdu? Bıraktığın anda robot ne yapardı? Anti-windup'ı hangi iki yoldan yapabilirsin, hangisi hangi durumda daha uygun?
