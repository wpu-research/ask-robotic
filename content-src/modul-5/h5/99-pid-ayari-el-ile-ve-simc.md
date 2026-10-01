# PID ayarı: el ile ve SIMC
süre: 40

## Merak
PID'nin üç sayısı (Kp, Ki, Kd) var ama bu sayıları hangi sırayla ve nasıl seçeceksin? Hyvex'te, Horde'da hız takip hatasını PID ayarıyla düzelttik. Ziegler-Nichols yerine **SIMC** yöntemini seçtik, çünkü Ziegler-Nichols kararlılık sınırına kadar kazanç artırmayı gerektirir ve bu gerçek donanımda risklidir. Bu derste üç yolu da robotun hız döngüsünde dene ve sayılarla karşılaştır.

## Etkinlik
### Hız döngüsü
Bu derste kontrol edilen şey tekerlek hızı. Girdi: motora verilen PWM (`u`). Çıktı: enkoderden ölçülen hız (cm/s). Robot 98. dersteki hız ölçümünü kullanır. İki tekerlek aynı komutu alır, sol enkoder (D2) hızı ölçer.

| Parça | Bağlantı |
|---|---|
| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Sol enkoder | **D2** (kesme pini) |

Motorlar için harici güç, ortak GND. Pili kısa devre yapma, ters bağlama.

### Yol 1: El ile ayar
Sırası önemli:
1. **Önce P.** `Ki = Kd = 0`. Kp'yi küçükten başlayıp büyüt; hedefi hızlı izleyip hafifçe aşmaya başlayınca dur. (96. ders)
2. **Sonra D.** Aşımı ve salınımı söndürmek için Kd ekle; ölçüm gürültülüyse süz. (97. ders)
3. **En sonda I.** Kalıcı sapma kalmışsa Ki ekle ve integrali sınırla. (98. ders)

Her adımda tek şeyi değiştir ve sayıyı ölç. Örnek: duvar takibinde `Kp = 32` ile aşım 6,5 cm'ydi; `Kd = 4,8` ekleyince 1,0 cm'ye indi (97. ders). Zayıf motorlu robotta `Ki = 2` kalıcı sapmayı 2,25 cm'den 0,09 cm'ye indirdi (98. ders).

El ile ayar iş görür ama sezgiye dayanır. Her robot ve her sistem için baştan deneme yaparsın. Bu yüzden iki "sistematik" yola bakalım.

### Yol 2: Ziegler-Nichols ve neden riskli
Ziegler-Nichols (Z-N) şöyle çalışır: `Ki = Kd = 0` yap, Kp'yi **sistem kalıcı olarak salınana kadar** artır. Salınmaya başladığı kazanç `Ku`, salınımın periyodu `Pu` olur. PI ayarı: `Kc = 0,45 x Ku`, `Ti = Pu / 1,2`.

Hız döngüsünde yalnızca P kontrolle (hedef 25 cm/s) Kc'yi artırdık ve hız ölçümünün tepeden tepeye oynamasına baktık:

| Kc | 10 | 14 | 16 | 18 | 20 | 22 | 24 |
|---|---|---|---|---|---|---|---|
| Hızın tepeden tepeye oynaması (cm/s) | 0,4 | 0,8 | 1,8 | 2,6 | 10,6 | 12,9 | 15,4 |

Kc = 18'e kadar salınım küçük; 20'de kalıcı salınım başlıyor: `Ku = 20`, `Pu = 0,22 sn`. Z-N PI ayarı: `Kc = 9`, `Ti = 0,183 sn`.

Bu ayar çalışır, ama bedeline bak: Ku'yu bulmak için hızı **hedefin %40'ı kadar** (25 cm/s etrafında 10,6 cm/s) salındırdık. Simülasyonda bunun zararı yok. Gerçek bir araçta (hızlı bir robot, tekne, drone) sistemi bilerek kararlılık sınırına getirmek, tek yanlış adımda araca ya da çevresine zarar verebilir. Hyvex'in Z-N yerine SIMC'i seçme nedeni de buydu.

### Yol 3: SIMC
SIMC (Skogestad) sistemi **güvenle** ölçülen bir adım cevabından tanır. Önce sistemi şu basit modelle ifade ederiz: **birinci derece + gecikme**:
- `k`: kazanç. Girdi 1 birim artınca çıktı sonunda kaç birim artar?
- `tau (τ)`: zaman sabiti. Çıktı cevabının ne kadar yavaş oturduğu.
- `theta (θ)`: gecikme. Komut verildikten sonra çıktının kıpırdamaya başlamadığı süre.

Sonra formül:
- `Kc = (1 / k) x τ / (τc + θ)`
- `τI = min(τ, 4 x (τc + θ))`

Buradaki `τc`, kapalı döngüden istediğin zaman sabiti. Küçük `τc` hızlı ama sert, büyük `τc` yumuşak demektir. Skogestad'ın önerisi hızlı ve sağlam bir seçim olarak `τc = θ`.

#### Adım 1: Adım cevabını ölç
Motora aniden PWM 100'den 180'e atlat. Her enkoder tıkında zaman ve hız yazılır.

```cpp
// sketch: adim_cevabi
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int ENK_SOL = 2;

const float TIK_CM = 1.0367;           // bir tık = 1,04 cm yol
const int U1 = 100;                    // adımdan önceki komut (PWM)
const int U2 = 180;                    // adımdan sonraki komut (PWM)
const unsigned long ADIM_ZAMANI = 2000;   // ms

volatile unsigned long sonTikUs = 0;
volatile unsigned long aralikUs = 0;
volatile unsigned long tikSayisi = 0;
unsigned long yazilan = 0;

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
  aralikUs = t - sonTikUs;
  sonTikUs = t;
  tikSayisi++;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
  pinMode(ENK_SOL, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), tik, RISING);
  Serial.begin(115200);
}

void loop() {
  unsigned long t = millis();
  int u = (t < ADIM_ZAMANI) ? U1 : U2;          // t = 2 sn'de komut aniden 100 -> 180
  surucu(SOL_EN, SOL_IN1, SOL_IN2, u);
  surucu(SAG_EN, SAG_IN1, SAG_IN2, u);

  if (tikSayisi != yazilan) {                   // yeni tık geldi: zaman ve hızı yaz
    noInterrupts();
    unsigned long aralik = aralikUs;
    yazilan = tikSayisi;
    interrupts();
    Serial.print(t);
    Serial.print(',');
    Serial.println(TIK_CM * 1000000.0 / aralik, 1);   // cm/s
  }
}
```

Benzetimde şu çıktıyı aldık (adım t = 2000 ms'de):

| Zaman (ms) | 2016 | 2068 | 2112 | 2153 | 2193 | 2232 | 2270 | 2308 |
|---|---|---|---|---|---|---|---|---|
| Hız (cm/s) | 15,5 | 19,9 | 23,6 | 25,3 | 25,9 | 26,6 | 27,3 | 27,3 |

Adım öncesi ortalama hız 15,17 cm/s, adımdan 1 sn sonra 27,63 cm/s.

#### Adım 2: k, τ ve θ'yı hesapla
1. **k** = hızdaki artış / PWM'deki artış = (27,63 - 15,17) / (180 - 100) = **0,156 cm/s başına PWM birimi**.
2. İki nokta yöntemi: hızın toplam artışının %28,3'üne ve %63,2'sine ulaştığı zamanlara bak. Gecikmeli birinci derece cevapta bu iki an `t28 = θ + 0,333 τ` ve `t63 = θ + τ` olur. İkisini taraf tarafa çıkarırsan `t63 - t28 = 0,667 τ` kalır. Verimizden: `t28 = 54 ms`, `t63 = 105 ms` (adımdan itibaren).
3. **τ** = 1,5 x (t63 - t28) = 1,5 x 51 = **77 ms**. Bu, robotun motor gecikmesinin tasarım değeri olan 80 ms ile uyuşuyor.
4. **θ** = t63 - τ = 105 - 77 = **28 ms**.

Dijital kontrolde örnekleme de gecikme sayılır: ortalama yarım periyot, yani `DT / 2 = 10 ms`. Efektif gecikme: `θ = 28 + 10 = 38 ms`.

#### Adım 3: Formülü uygula
`τc = θ = 0,038 sn` seçtik. Sketch bu formülü doğrudan yazar:
- `Kc = (1 / 0,156) x 0,077 / (0,038 + 0,038) = 6,49`
- `τI = min(0,077; 4 x 0,076) = 0,077 sn`

```cpp
// sketch: simc_hiz
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int ENK_SOL = 2;

const float TIK_CM = 1.0367;
const unsigned long DT = 20;           // kontrol periyodu (ms)

// Adım cevabından ölçülen model: hız = K x PWM, gecikme + birinci derece
const float K = 0.156;                 // cm/s başına PWM birimi
const float TAU = 0.077;               // s
const float THETA = 0.038;             // s (ölçülen 0,028 + DT/2 = 0,010)
const float TAUC = 0.038;              // s: istenen kapalı döngü zaman sabiti (hızlı seçim: TAUC = THETA)

// SIMC (Skogestad) ayarı
const float KC = (1.0 / K) * TAU / (TAUC + THETA);
const float TI = min(TAU, 4.0 * (TAUC + THETA));

volatile unsigned long sonTikUs = 0;
volatile unsigned long aralikUs = 0;
unsigned long son = 0;
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
  aralikUs = t - sonTikUs;
  sonTikUs = t;
}

float hizOku() {
  noInterrupts();
  unsigned long aralik = aralikUs;
  unsigned long sonTik = sonTikUs;
  interrupts();
  unsigned long gecen = micros() - sonTik;
  if (aralik == 0 || gecen > 200000UL) return 0;
  if (gecen > aralik) aralik = gecen;
  return TIK_CM * 1000000.0 / aralik;
}

float hedefHiz(unsigned long t) {      // 15 -> 25 -> 15 cm/s
  if (t < 1500) return 15;
  if (t < 3500) return 25;
  return 15;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
  pinMode(ENK_SOL, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), tik, RISING);
  Serial.begin(115200);
  Serial.print("Kc=");
  Serial.print(KC, 2);
  Serial.print(" Ti=");
  Serial.println(TI, 3);
}

void loop() {
  if (millis() - son < DT) return;
  son += DT;
  float dt = DT / 1000.0;

  float e = hedefHiz(millis()) - hizOku();
  float aday = KC * (e + (integral + e * dt) / TI);
  if (aday > 0 && aday < 255) integral += e * dt;     // doymuşken biriktirme (98. ders)

  float u = constrain(KC * (e + integral / TI), 0, 255);
  surucu(SOL_EN, SOL_IN1, SOL_IN2, u);
  surucu(SAG_EN, SAG_IN1, SAG_IN2, u);
}
```

### Üç yolun karşılaştırması
Hedef 15 -> 25 -> 15 cm/s. "Oturma", hızın hedefin +-2 cm/s içine girip orada kalması için geçen süre. "Hata alanı", hatanın mutlak değerinin zamanla toplamı (cm/s x sn = cm).

| Ayar | 15 -> 25 oturma | 15 -> 25 aşım | 15 -> 25 hata alanı | 25 -> 15 oturma | 25 -> 15 hata alanı |
|---|---|---|---|---|---|
| SIMC, `τc = θ` (Kc 6,49; Ti 0,077) | 0,16 sn | 2,2 cm/s | 0,7 cm | 0,22 sn | 1,2 cm |
| SIMC yumuşak, `τc = 3 θ` (Kc 3,25) | 0,16 sn | 0,1 cm/s | 0,9 cm | 0,16 sn | 1,0 cm |
| Z-N PI (Kc 9; Ti 0,183) | 0,26 sn | 1,8 cm/s | 0,9 cm | 0,30 sn | 0,8 cm |
| Tahminle (Kc 1; Ti 1) | oturmadı | 0 | 33,9 cm | oturmadı | 10,5 cm |

- Elle tahmin edilen zayıf ayar hedefe yetişemedi: hata alanı SIMC'in 48 katı.
- SIMC ve Z-N benzer hata alanı verdi; SIMC biraz daha çabuk oturdu. Z-N de iyi çalıştı: farkı hız sonucu değil, **yöntem** yaratıyor. SIMC yalnız tek bir güvenli adım testi istedi. Z-N hızı hedefin %40'ı kadar salındırmayı.
- `τc` tek bir düğme: büyüttüğünde Kc düşüyor, aşım neredeyse kayboluyor (2,2 -> 0,1 cm/s) ve oturma süresi uzamıyor. İstediğin hız-yumuşaklık dengesini bu sayıyla seçersin.
- SIMC'in `Kc = 6,49` değeri `Ku = 20`'nin yaklaşık üçte biri: kararlılık sınırından uzak durur. Bu, "güvenlik payı" demektir.

### Gerçek robotta farklı olabilecekler
- Gerçek motorda adım cevabı yük ve pil gerilimiyle değişir. `k`, `τ` ve `θ`'yı robot gerçek yükündeyken ve pil dolu iken ölç.
- Burada ölçülen τ'nun (77 ms) tasarım değerine yakın çıkması benzetimin temiz olmasından. Gerçek ölçümler daha dağınık olur; birkaç adım testi yapıp ortalama al.
- SIMC modeli basit olduğu için çok yavaş ya da salınımlı sistemlerde tek başına yetmeyebilir. O zaman ölçerek ince ayar yap.

### Dene
- `TAUC` değerini 0,038 yerine 0,02 ve 0,2 yap. Kc ve Ti nasıl değişiyor? Aşım ve oturma süresi ne yapıyor?
- `adim_cevabi`'de `U2 = 255` yap. Ölçtüğün k aynı mı çıkıyor? (Bu sistem doğrusal mı?)
- `simc_hiz` içinde `THETA`'dan `DT / 2`'yi çıkar (0,028 yap). Kc değişince hız takibi bozuluyor mu?

### Sık yapılan hatalar
- Adım cevabında sistemi durağan haldeyken başlatmamak: önce hız oturmuşken adımı uygula.
- `k`'yı PWM birimiyle hız birimini karıştırarak hesaplamak. Formüldeki `1 / k` PWM / (cm/s) biriminde olmalı.
- `θ`'yı unutup yalnız `τ`'yu kullanmak: `Kc` fazla büyük çıkar.
- Z-N'yi gerçek donanımda "bir deneyip bakayım" diye kararsızlık sınırına kadar zorlamak.
- Ayarı bir tek hızda yapıp her koşulda geçerli saymak.

## Konuşalım
Hyvex Horde'da Z-N yerine SIMC seçti. Sen kendi robotunda, kırılgan bir parça ya da pahalı bir motor olsaydı hangi yöntemi seçerdin, neden? Adım testinin zaman sabitini yanlış ölçersen (örneğin pil bitmek üzereyken) ne olur?
