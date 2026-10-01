# Bitirme projesi: PID çizgi izleyen ve duvar takipçisi
süre: 35

## Merak
Bir yarışta iki robot yan yana duruyor: biri bang-bang, biri PID. Hangisi turu önce bitirir? Bu hafta öğrendiklerin gerçekten işe yarıyor mu, yoksa sadece daha karmaşık mı? Bu projede iddiayı sayıyla sınayacaksın. Üstüne aynı robotla duvar takibini PID ile yapacak ve duvarla 15 cm +-2 cm mesafeyi tutmaya çalışacaksın.

## Etkinlik
### Ne yapacağız?
Bu proje öğrendiklerini birleştirir:
- **Hafta 2:** HC-SR04 ve servo (duvara bakan sensör).
- **Hafta 3:** 5 sensörlü çizgi dizisi ve bang-bang çizgi izleme (88. ders).
- **Modül 3, hafta 6:** `millis()` ile sabit periyotlu, bloklamayan döngü.
- **Bu hafta:** P (96), D ve süzgeç (97), I ve anti-windup (98), ölçerek ayar (99).

Üç sketch var:
1. `proje_cizgi_pid`: PID çizgi izleyici.
2. `proje_cizgi_bb`: karşılaştırma için bang-bang çizgi izleyici.
3. `proje_duvar_pid`: PID duvar takipçisi.

### Devre
| Parça | Bağlantı |
|---|---|
| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| 5 sensörlü çizgi dizisi | **A0 ... A4** (A0 en sol, A4 en sağ), aksın 7 cm önünde |
| HC-SR04 | TRIG **D11**, ECHO **D12** |
| Servo (sensörü döndürür) | Sinyal **D4** |

Motorlar ve servo için harici güç kullan, tüm GND'leri ortak bağla. Pili kısa devre yapma, ters bağlama. Robotu masa kenarında çalıştırma; ilk denemelerde düşebilir.

### Program 1: PID çizgi izleyici
Üç terim tek bir `pid()` fonksiyonunda toplandı. Çizgi dizisinde `Kd` çok küçük ve süzgeçli, `Ki` ise 0 tutuldu; nedenini ölçümde göreceksin. Integral yine de sınırlı, böylece `Ki`'yı açmak istersen hazır.

```cpp
// sketch: proje_cizgi_pid
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int SENSOR[5] = {A0, A1, A2, A3, A4};   // A0 en sol ... A4 en sağ
const int ESIK = 500;

const float KP = 240.0;            // PWM / sensör aralığı
const float KI = 0.0;              // PWM / (aralık x s)
const float KD = 0.5;              // PWM / (aralık/s)
const float ALFA = 0.9;            // türev süzgeci
const float ILIM = 20.0;           // integral sınırı: KI x ILIM = 100 PWM
const int TABAN = 255;
const unsigned long DT = 10;       // kontrol periyodu (ms)

unsigned long son = 0;
unsigned long sonYazdir = 0;
float sonYon = 1;
float integral = 0;
float sonHata = 0;
float turevSuz = 0;

void surucu(int en, int in1, int in2, int v) {
  v = constrain(v, -255, 255);
  int pwm = abs(v);
  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);
  digitalWrite(in1, v > 0);
  digitalWrite(in2, v < 0);
  analogWrite(en, pwm);
}

// Çizginin konumu: -2...+2 (pozitif = çizgi solda). Kayıpsa son yöne doğru 2.
float hataOku() {
  int sayi = 0;
  float toplam = 0;
  for (int i = 0; i < 5; i++) {
    if (analogRead(SENSOR[i]) > ESIK) {
      sayi++;
      toplam += 2 - i;
    }
  }
  if (sayi == 0) return sonYon * 2.0;
  float e = toplam / sayi;
  if (e != 0) sonYon = (e > 0) ? 1 : -1;
  return e;
}

// PID: çıkış = Kp x hata + Ki x (hata birikimi) + Kd x (hatanın değişim hızı)
float pid(float e, float dt) {
  integral += e * dt;
  integral = constrain(integral, -ILIM, ILIM);
  float turev = (e - sonHata) / dt;
  sonHata = e;
  turevSuz = ALFA * turevSuz + (1 - ALFA) * turev;
  return KP * e + KI * integral + KD * turevSuz;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (millis() - son < DT) return;
  son += DT;

  float e = hataOku();
  float u = pid(e, DT / 1000.0);

  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);
  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);

  if (millis() - sonYazdir >= 500) {       // ayar yaparken değerleri izle
    sonYazdir = millis();
    Serial.print("hata=");
    Serial.print(e, 1);
    Serial.print(" u=");
    Serial.println(u, 0);
  }
}
```

### Program 2: Karşılaştırma için bang-bang
88. dersteki fikrin aynısı: hata kaç olursa olsun sabit `DONUS` kadar dön. `DONUS` değerini sen seçersin; PID'in "hata ne kadarsa o kadar" mantığıyla farkı burada.

```cpp
// sketch: proje_cizgi_bb
// Karşılaştırma için bang-bang çizgi izleyici (88. ders): üç durum, sabit dönüş.
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int SENSOR[5] = {A0, A1, A2, A3, A4};   // A0 en sol ... A4 en sağ
const int ESIK = 500;

const int TABAN = 255;
const int DONUS = 200;             // sabit direksiyon: hata ne kadar küçük olursa olsun aynı

int sonYon = 1;

void surucu(int en, int in1, int in2, int v) {
  v = constrain(v, -255, 255);
  int pwm = abs(v);
  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);
  digitalWrite(in1, v > 0);
  digitalWrite(in2, v < 0);
  analogWrite(en, pwm);
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
}

void loop() {
  bool gor[5];
  for (int i = 0; i < 5; i++) gor[i] = analogRead(SENSOR[i]) > ESIK;

  int yon;                                   // +1: sola dön, -1: sağa dön, 0: düz
  if (gor[0] || gor[1]) yon = 1;             // çizgi solda
  else if (gor[3] || gor[4]) yon = -1;       // çizgi sağda
  else if (gor[2]) yon = 0;                  // çizgi ortada
  else yon = sonYon;                         // kayıp: son yöne dön
  if (yon != 0) sonYon = yon;

  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - yon * DONUS);
  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + yon * DONUS);
}
```

### Program 3: PID duvar takipçisi
Servo sensörü sola (180 derece) çevirir. Robot duvarı 15 cm'de tutmaya çalışır. 97. ve 98. derslerin sonuçlarına göre `Kp = 16`, `Ki = 1`, `Kd = 4`, `ALFA = 0,8` seçtik ve iki farklı gürültü tohumuyla denedik.

```cpp
// sketch: proje_duvar_pid
#include <Servo.h>

const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12, SERVO_PIN = 4;

const float HEDEF = 15.0;          // duvarla istenen mesafe (cm)
const float KP = 16.0;             // PWM / cm
const float KI = 1.0;              // PWM / (cm x s)
const float KD = 4.0;              // PWM / (cm/s)
const float ALFA = 0.8;            // türev süzgeci
const float ILIM = 30.0;           // integral sınırı (cm x s)
const int TABAN = 170;
const int UMAX = 100;              // direksiyon sınırı
const unsigned long DT = 50;       // 20 ölçüm / saniye

Servo servo;
unsigned long son = 0;
unsigned long sonYazdir = 0;
float mesafe = HEDEF;
float integral = 0;
float sonHata = 0;
float turevSuz = 0;

void surucu(int en, int in1, int in2, int v) {
  v = constrain(v, -255, 255);
  int pwm = abs(v);
  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);
  digitalWrite(in1, v > 0);
  digitalWrite(in2, v < 0);
  analogWrite(en, pwm);
}

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

float pid(float e, float dt) {
  integral += e * dt;
  integral = constrain(integral, -ILIM, ILIM);
  float turev = (e - sonHata) / dt;
  sonHata = e;
  turevSuz = ALFA * turevSuz + (1 - ALFA) * turev;
  return KP * e + KI * integral + KD * turevSuz;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2, TRIG};
  for (int i = 0; i < 7; i++) pinMode(pinler[i], OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
  servo.attach(SERVO_PIN);
  servo.write(180);                // ışın sola, duvara dik
  delay(500);
  float ilk = olc();
  if (ilk > 0) mesafe = ilk;
  sonHata = mesafe - HEDEF;
}

void loop() {
  if (millis() - son < DT) return;
  son += DT;

  float m = olc();
  if (m > 0) mesafe = m;           // yankı yoksa eski değeri koru
  float e = mesafe - HEDEF;        // + : duvardan çok uzak
  float u = constrain(pid(e, DT / 1000.0), -UMAX, UMAX);

  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);
  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);

  if (millis() - sonYazdir >= 500) {
    sonYazdir = millis();
    Serial.print("mesafe=");
    Serial.print(mesafe, 1);
    Serial.print(" u=");
    Serial.println(u, 0);
  }
}
```

### Nasıl çalışıyor?
1. İkisi de aynı iskeleti izler: **ölç -> hata -> PID -> motorlara ver**. Fark yalnız hatanın kaynağında: çizgide dizi konumu (birim: sensör aralığı), duvarda ultrasonik mesafe (cm).
2. Hata pozitifken (`çizgi solda` ya da `duvardan uzak`) sol tekerlek yavaşlar, sağ hızlanır: robot sola döner.
3. `pid()` içinde `integral` sınırlanır (`ILIM`), türev süzülür (`ALFA`). Bunlar 97-98. derslerde öğrendiğin güvenlik önlemleri.
4. Serial çıktısı her 500 ms'de hata ve `u` yazar. Ayar yaparken buna bak: `u` sürekli 255'e dayanıyorsa kazanç çok büyük.
5. Mesafe ve yönelim için iki ayrı PID kullanmak (Hyvex'in staj programındaki F1 dersinde anılan yapı) gerekebilir. Bu duvar takipçisi yalnız mesafeyi ölçer, yönelimi (robotun duvara açısını) ölçmez; mesafe PID'i yönelimi dolaylı yoldan düzeltir.

### Ayar sırası (99. ders)
1. Bang-bang ile pisti bir kez dolaş; en iyi `DONUS`'u bul.
2. `proje_cizgi_pid` için `TABAN`'ı küçükten başlat. `Ki = Kd = 0` yap, `Kp`'yi çizgiyi kaybetmeyene kadar artır.
3. `Kd` ekle ve süz. Çizgi dizisinde dikkatli ol, aşağıdaki ölçüme bak.
4. `Ki`'yı dene; çizgide fayda görmezsen 0'da bırak (bu dizide bıraktık).
5. `TABAN`'ı artır, 1. adıma dön.

### Ölçüm 1: PID mi bang-bang mı?
`TABAN = 255` (tam hız) ile iki pistte koştuk. **Zor pist:** viraj yarıçapı 12 cm, alt düzlükte dik bir slalom (4,5 cm genlik, 30 cm dalga boyu). **Kolay pist:** viraj yarıçapı 17 cm, hafif slalom (3 cm genlik, 40 cm dalga boyu). Bang-bang için `DONUS` = 60, 100, 140 ve 200 denendi.

**Zor pist**

| Sürücü | Tur süresi | Hata RMS | En büyük sapma | Direksiyon titreşimi |
|---|---|---|---|---|
| PID (derste) | 8,62 sn | 10,9 mm | 23 mm | 0,91 |
| Bang-bang, `DONUS = 200` | 9,04 sn | 27,5 mm | 79 mm | 0,46 |
| Bang-bang, `DONUS` = 60 / 100 / 140 | çizgiyi kaybetti | - | - | - |

**Kolay pist**

| Sürücü | Tur süresi | Hata RMS | En büyük sapma | Direksiyon titreşimi |
|---|---|---|---|---|
| PID (derste) | 9,86 sn | 11,1 mm | 23 mm | 1,27 |
| Bang-bang, `DONUS = 200` | 8,90 sn | 12,5 mm | 46 mm | 0,56 |
| Bang-bang, `DONUS` = 60 / 100 / 140 | çizgiyi kaybetti | - | - | - |

Dürüst okuma:
- **Zor pistte PID daha hızlı:** 8,62 sn, bang-bang'in en iyisinden %4,7 kısa. Çizgiye de çok daha yakın: RMS 10,9 mm'ye karşı 27,5 mm, en büyük sapma 23 mm'ye karşı 79 mm.
- **Kolay pistte PID daha hızlı değil, belirgin biçimde yavaş.** Bang-bang'in çalışan ayarı 0,96 sn (%10,8) önde bitirdi. PID yine çizgiye daha yakındı (RMS 11,1 mm, maksimum 23 mm; bang-bang'de 12,5 ve 46 mm), ama bu yakınlık süreye yansımadı.
- **Bang-bang ayara duyarlı:** 4 `DONUS` değerinden yalnız 200'ü, tam hızda her iki pisti bitirdi. Küçük `DONUS` virajı dönemiyor. PID'in denenen tek ayarı iki pisti de bitirdi.
- **"Daha akıcı" iddiası bu ölçümde tutmuyor.** PID çizgiye yakın kalıyor (daha küçük sapma), ama direksiyon komutu PID'de belirgin biçimde daha çok oynuyor (zor pistte 0,91'e karşı 0,46, kolay pistte 1,27'ye karşı 0,56). Akıcılığı hangi ölçüyle tanımladığın sonucu değiştirir.
- Çizgi dizisi sensörleri 2,4 cm arayla, çizgi 2 cm genişliğinde: çizgi iki sensörün arasından geçerken kısa süre hiçbirine görünmez ve hata sıçrar. PID bu sıçramalardan etkilenir; bang-bang sabit dönüşle bunları yutar.
- İkisi de tam hızda (`TABAN = 255`) koştuğu için tur süresi büyük ölçüde motorun azami hızıyla sınırlı. Piste ve `TABAN`'a göre sonuç değişir.

Motorlardan biri zayıfsa (sağ motor %8 zayıf) PID zor pisti yine bitirdi: 9,22 sn, RMS 11,3 mm, en büyük sapma 24 mm.

**Çizgide I ve D'ye dikkat.** Dizi hatayı 0,5'lik basamaklarla verir ve çizgi sensörler arasında kaybolabilir; bu sıçramalar türevde sahte patlamalar, integralde sahte birikim yaratır. Zor pistte (derste 8,62 sn):
- `Ki = 1` açınca tur 9,40 sn'ye uzadı, direksiyon titreşimi 0,91'den 1,21'e çıktı.
- `Kd = 30` ve süzgeçsiz (`ALFA = 0`) yapınca tur 10,08 sn'ye, titreşim 1,15'e çıktı.

Bu yüzden derste `Ki = 0` ve `Kd = 0,5` (`ALFA = 0,9`) var. Çizgi dizisinde asıl iş P'de; I ve D duvar takibinde ve hız döngüsünde işe yaradı (97-99).

### Ölçüm 2: Duvar takibi
Hafif kıvrımlı uzun bir duvar (3 cm genlikli, 1,2 m dalga boylu bir dalga), ultrasonik ölçümde 1 cm gürültü, sağ motor %10 zayıf. Robot duvara paralel başlar; duvarın o noktadaki bükümü yüzünden başlangıç mesafesi yaklaşık 18 cm'dir (hedefin 3 cm ötesi). 11 saniye koşar (yaklaşık 2,5 m).

| Ölçü | Sonuç |
|---|---|
| Duvara çarptı mı? | hayır (iki farklı gürültü tohumuyla) |
| İlk 4 sn'den sonra +-2 cm içinde kalma | %100 |
| İlk 4 sn'den sonra en büyük sapma | 0,78 cm (bir koşu), 1,48 cm (diğer koşu) |
| İlk 4 sn'den sonra hata RMS | 0,35 cm (PID), 0,54 cm (yalnız P, `Ki = Kd = 0`) |
| İlk 4 sn içinde en büyük sapma | 2,6 cm |

Başlangıç mesafesi hedefin dışında olduğu ve duvar robota doğru bükülmeye başladığı için ilk saniyelerde sapma 2,6 cm'ye kadar çıkıyor (hedef bandı +-2 cm). 4. saniyeden sonra robot bandın içinde kalıyor. Yalnız P de bu koşuda bandı tuttu, çünkü Kp = 16 büyük ve motor farkı küçük (%10). PID RMS'i yaklaşık üçte bir oranında küçülttü. 98. dersteki gibi Kp küçükse ya da motor farkı büyükse (%15) yalnız P bandı tutamaz; I o zaman fark yaratır.

### Gerçek robotta farklı olabilecekler
- Benzetimde kontrol zamanlaması mükemmel, çizgi sensörlerinde gürültü yok. Gerçek robotta ışık, yüzey ve pil gerilimi sonucu değiştirir; her ayarı kendi robotunda yeniden ölç.
- Gerçek HC-SR04 duvara eğik bakınca yanlış yankı alabilir. Duvar takibinde ölçümü süzmek ya da medyan almak (Modül 4) isteyebilirsin.
- Pil boşaldıkça motor yavaşlar. Hız ayarını pil doluyken yaptıysan, boşalınca kazançları yeniden gözden geçir.

### Dene
- `proje_cizgi_pid`'de `KD = 30` ve `ALFA = 0` yap (ölçümde tur 10,08 sn oldu). Tur süresi neden uzuyor? `Serial` çıktısındaki `u` değerlerine bak.
- Bang-bang'de `TABAN = 200` yap ve `DONUS` değerlerini yeniden dene. Hangi `DONUS` çalışıyor? Tur süresi PID ile kıyaslandığında ne oluyor?
- Duvar takipçisinde `HEDEF = 20` yap. Ayarları değiştirmeden +-2 cm tutuyor mu?
- Meydan okuma: iki sketch'i tek programda birleştir. Seri porttan `c` gelirse çizgi, `d` gelirse duvar modu çalışsın (79. ders, durum makinesi için 28. ders).

### Sık yapılan hatalar
- Çizgi ve duvar için aynı Kp'yi kullanmak: hata birimleri farklı (sensör aralığı ve cm). Kazançları ayrı ayrı ölç.
- Bang-bang ile PID'i farklı pist ve farklı hızda karşılaştırmak: adil olmaz. Aynı pist, aynı `TABAN`, aynı ölçüm yöntemi kullan.
- Ayar sırasını atlamak: önce hızı yükseltip sonra Kp aramak. Küçük hızda başla.
- Tek bir koşuya bakıp karar vermek: en az iki koşuda (farklı gürültü tohumu ya da başlangıç noktası) ölç.
- Kd'yi sezgiyle büyütmek: çizgi dizisinde türev gürültü gibi davranır.

## Konuşalım
Kolay pistte bang-bang PID'den belirgin biçimde önde bitirdi. Peki bang-bang yeter diyebilir misin? Hangi durumlarda basit çözüm daha iyidir (örneğin ayar sayısı, tavan hız, pist zorluğu)? Bu projeyi bir yarışa sokacak olsan hangisini seçerdin ve neden?
