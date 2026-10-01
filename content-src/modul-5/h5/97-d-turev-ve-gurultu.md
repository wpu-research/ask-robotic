# D: türev ve gürültü
süre: 30

## Merak
Araba sürerken kenara hızla yaklaştığını görürsen, henüz uzak olsan bile direksiyonu şimdiden düzeltmeye başlarsın. Sadece "ne kadar uzağım" değil, "ne kadar hızlı yaklaşıyorum" diye de bakarsın. Kontrolde buna **D (türev)** terimi denir. Ama bir tuzağı var: ölçüm titrerse D bu titremeyi büyütür. Bu derste ikisini de sayıyla göreceksin.

## Etkinlik
### Kavramlar
- **Türev:** hatanın değişim hızı. `turev = (e - sonHata) / dt` (cm/s). Hata hızla büyüyorsa türev büyük.
- **PD kontrol:** `u = Kp x e + Kd x turev`. Hata büyümeye başlayınca D bunu hemen görür ve sert fren yapar; hata küçülürken D yumuşatır. Bu sönümleme demektir.
- Hyvex'in staj programında 16. günün sorusu: "Robot hedefe varıyor ama salınıyor, hangi terim, hangi yön?" Cevap: sönümlemeyi D terimi sağlar; Kd'yi artır (ya da Kp'yi azalt).

### Bu derste neden duvar takibi?
Duvar takipçisi D'yi görmek için iyi bir yer: direksiyon önce robotun **yönünü**, yön de **mesafeyi** değiştirir. Etki gecikmeli olduğu için Kp büyüdükçe robot hedefi aşar. Çizgi dizisinde büyük Kd'nin tur süresini bozduğunu projede (100. ders) ölçeceğiz.

Servo ultrasonik sensörü **180 derece** (sola) çevirir; ışın robotun sol duvarına dik gider. Hata: `e = mesafe - HEDEF`. `e > 0` robot duvardan uzakta demektir ve sola, yani duvara doğru dönmesi gerekir. Yön kuralı 96. dersteki ile aynı: `u > 0` sola dön.

### Devre
| Parça | Bağlantı |
|---|---|
| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| HC-SR04 | TRIG **D11**, ECHO **D12**, VCC 5 V, GND |
| Servo | Sinyal **D4** (180 derece = sola bakar) |

Motorlar ve servo için harici güç kullan, tüm GND'leri ortak bağla. Pili kısa devre yapma, ters bağlama.

### Program
```cpp
// sketch: d_duvar
#include <Servo.h>

const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12, SERVO_PIN = 4;

const float HEDEF = 15.0;          // duvarla istenen mesafe (cm)
const float KP = 16.0;             // PWM / cm
const float KD = 3.0;              // PWM / (cm/s)
const float ALFA = 0.8;            // türev süzgeci: 0 = süzgeç yok, 1'e yaklaştıkça daha yavaş
const int TABAN = 170;
const int UMAX = 100;              // direksiyon sınırı
const unsigned long DT = 50;       // 20 ölçüm / saniye

Servo servo;
unsigned long son = 0;
float mesafe = HEDEF;
float sonHata = 0;
float turevSuz = 0;                // süzülmüş türev

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

  float u = KP * e + KD * turevSuz;
  u = constrain(u, -UMAX, UMAX);

  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);       // u > 0: duvara (sola) dön
  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);
}
```

### Nasıl çalışıyor?
1. `olc()` 82. dersteki gibi mesafeyi cm cinsinden verir. Yankı gelmezse eski ölçümü kullanırız.
2. Türev, iki ölçüm arasındaki farkın geçen süreye bölümüdür. `DT = 50` ms olduğu için saniyede 20 ölçüm alırız.
3. `setup()` içinde `sonHata` ilk ölçüme göre ayarlanır. Ayarlamazsak ilk döngüde sahte bir türev sıçraması olur.
4. `turevSuz` türevin süzülmüş hâlidir: `turevSuz = ALFA * turevSuz + (1 - ALFA) * turev`. `ALFA = 0` süzgeç yok demek. `ALFA = 0,8` her yeni türevin yalnız %20'sini alır; yaklaşık 0,2 sn'lik bir yumuşatma olur.
5. `u` önce `UMAX` ile sınırlanır; çok büyük hatada robot yerinde dönmesin.

### Ölçüm 1: Kp büyüyünce ne olur, D ne yapar?
Robot duvara paralel, hedeften **4 cm uzakta** başlar (19 cm). Düz duvar, gürültü yok. Her Kp için iki koşu: `Kd = 0` ve `Kd = 0,15 x Kp`.

| Kp | Kd | Aşım (hedefin ötesine) | Hata RMS | Sonuç |
|---|---|---|---|---|
| 16 | 0 | 3,8 cm | 0,97 cm | oturdu |
| 16 | 2,4 | 1,3 cm | 0,35 cm | oturdu |
| 32 | 0 | 6,5 cm | 1,67 cm | büyük aşım |
| 32 | 4,8 | 1,0 cm | 0,20 cm | oturdu |
| 48 | 0 | 7,5 cm | 2,36 cm | duvara değdi |
| 48 | 7,2 | 1,5 cm | 0,31 cm | oturdu |
| 64 | 0 | 7,5 cm (duvara değdi) | 7,98 cm | duvara değdi, sonra duvardan 10,6 cm uzakta kaldı |
| 64 | 9,6 | 2,5 cm | 0,56 cm | oturdu |

"Aşım 7,5 cm" robotun duvara değdiği anlamına gelir (robot yarıçapı 7,5 cm). Okuma:
- P tek başına Kp'yi artırınca **iyileşmedi, kötüleşti**: aşım 3,8 cm'den 7,5 cm'e çıktı.
- Aynı Kp'lerde `Kd = 0,15 x Kp` aşımı 3 ile 6,5 kat arasında küçülttü ve robotu duvara çarpmaktan kurtardı. Hata RMS'i Kp = 16'da yaklaşık 3 kat, Kp = 32 ve üstünde 7 kattan fazla düştü.

### Ölçüm 2: Gürültü D'yi nasıl bozar?
Ultrasonik ölçümlere 1 cm'lik rastgele gürültü ekledik (`noiseCm = 1`). 1 cm'lik oynama 50 ms'de bile yaklaşık 28 cm/s'lik tipik **sahte hız** üretir (iki ölçümün farkı / 0,05 sn). D bu sahte hızı Kd ile çarpıp motora verir. `Kp = 16`, aynı başlangıç:

| Ayar | Hata RMS | Direksiyon titreşimi |
|---|---|---|
| Kd = 0 (P) | 1,21 cm | 0,29 |
| Kd = 3, süzgeçsiz (`ALFA = 0`) | 0,49 cm | 1,21 |
| Kd = 3, süzgeçli (`ALFA = 0,8`) | 0,58 cm | 0,51 |
| Kd = 20, süzgeçsiz | 2,02 cm | 1,57 |
| Kd = 20, süzgeçli | 1,09 cm | 1,12 |

- Süzgeçsiz D hatayı iyi bastırdı (RMS 1,21 -> 0,49) ama direksiyon titreşimi **4 katına** çıktı (0,29 -> 1,21). Motorlar durmadan titredi.
- Süzgeç titreşimi yarıdan fazla azalttı (1,21 -> 0,51). Karşılığında D biraz gecikir; aşım 1,4 cm'den 2,3 cm'ye çıktı.
- **Kd'yi aşırı büyütmek** işe yaramaz: Kd = 20'de hata yeniden büyüdü ve robot hedef bandında (+-2 cm) zamanın yalnız %49'unda kaldı.

### Kd nasıl seçilir?
1. `Kd = 0` ile başla; Kp'yi aşım görene kadar artır.
2. `Kd = 0,15 x Kp` ile başla (burada `16 x 0,15 = 2,4`; sketch'te biraz fazla, 3). Aşım küçülüyorsa artır.
3. Motor titremeye ya da ses çıkarmaya başlarsa Kd'yi azalt ya da `ALFA`'yı büyüt.

### Gerçek robotta farklı olabilecekler
- Gerçek HC-SR04 yan duvarda, özellikle duvara eğik bakınca, yanlış ya da hiç yankı döndürebilir. Benzetimdeki 1 cm'lik gürültü iyimserdir.
- Bu kuralları ("0,15 x Kp") kendi robotuna aynen taşıma. Sayılar bu benzetimdeki robota aittir; yöntem (önce Kp, sonra Kd, sonra süzgeç) geçerlidir.

### Dene
- `Kp = 32` yap ve `KD` değerini 0, 2, 5, 10 yap. Hata nasıl değişiyor?
- `ALFA` değerini 0,5 ve 0,95 yap. Hangisi motoru daha az titretiyor, hangisi daha çok aşıyor?
- Robotu hedeften 4 cm uzakta başlat ve `setup()` içindeki `sonHata = mesafe - HEDEF;` satırını sil. İlk saniyede ne değişiyor?

### Sık yapılan hatalar
- Gürültülü ölçümde süzgeçsiz D kullanmak: motor cızırdar, titrer.
- Kd'yi Kp'ye göre çok büyük seçmek: hata azalmaz, artar.
- Kontrol periyodunu (`DT`) değiştirip `dt`'yi güncellememek: türev yanlış ölçeklenir.
- İlk türevi hesaplarken `sonHata`'yı başlatmamak: ilk döngüde robot hırçın bir hamle yapar.
- Kd'nin işaretini ters yazmak: D sönümlemek yerine salınımı büyütür.

## Konuşalım
"Robot hedefe varıyor ama salınıyor: hangi terim, hangi yön?" sorusuna şimdi sayıyla cevap verebilir misin? Ölçüm gürültülüyse Kd'yi küçültmek mi, ölçümü süzmek mi daha iyi? Bedeli ne?
