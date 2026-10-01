# Kalibrasyon: min/max ve eşik
süre: 25

## Merak
Robotunu evde, akşam lambasının altında çizgiye oturttun ve harika çalıştı. Ertesi gün okulda pencere kenarında denedin: robot çizgiyi hiç görmüyor, sanki her yer çizgiymiş gibi davranıyor. Programın aynı, robot aynı. Değişen tek şey ortam ışığı. Sensör, değişen ışığa nasıl uyum sağlar?

## Etkinlik
### Fikir: eşiği ölç, tahmin etme
86. derste eşiği elle 512 seçtik. Bu sayı yalnızca zeminin 164, çizginin 860 okuduğu durumda doğru. Işık, yüzey ya da sensör yüksekliği değişirse zemin ve çizgi okumaları da kayar.

**Kalibrasyon** şudur: robot çalışmaya başlamadan önce her sensörün gördüğü **en küçük** (min, zemin) ve **en büyük** (max, çizgi) değeri ölçeriz. Eşik, bu ikisinin ortasıdır:

`esik = (min + max) / 2`

Her sensör için ayrı min, max ve eşik tutarız. Çünkü beş sensör birbirinin aynısı değildir; biri biraz daha duyarlı, biri biraz daha yukarıda olabilir.

### Devre
Standart bağlantılar (Modül 5 ortak düzeni):

| Parça | Bağlantı |
|---|---|
| Çizgi sensörleri 0…4 | AO → **A0…A4**, VCC → 5 V, GND → GND |
| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |

Motorlar ve sürücü için harici güç kullan; Arduino'nun 5 V çıkışından besleme. Pil ve sürücü GND'si Arduino GND'sine bağlı olmalı (ortak GND). Pili ters bağlama, uçlarını kısa devre etme.

### Program: sallanarak kalibrasyon
Robotu çizginin üstüne, çizgi ortada olacak şekilde koy. Program başladığında robot yerinde sola, sonra sağa, sonra tekrar sola dönerek sallanır. Bu sırada her sensör bir an çizgiyi, bir an zemini görür. Sallanma bitince programın min, max ve eşikleri yazar, sonra her 300 ms'de çizgi desenini bildirir.

Motoru süren `motor(sol, sag)` işlevi, 77. derste gördüğün yön + PWM mantığındadır: işaret yönü, büyüklük hızı seçer. Ölü bölge nedeniyle PWM'in 51'in (≈ %20) altında tekerlek dönmez (78. ders); sallanma için 120 kullanıyoruz.

```cpp
// sketch: kalib_salla
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};
const int SALLA_PWM = 120;
const unsigned long KALIBRASYON_MS = 1800;

int enAz[SENSOR_SAYISI];
int enCok[SENSOR_SAYISI];
int esik[SENSOR_SAYISI];
bool hazir = false;
unsigned long sonYazi = 0;

void motor(int sol, int sag) {
  digitalWrite(SOL_IN1, sol > 0);
  digitalWrite(SOL_IN2, sol < 0);
  analogWrite(SOL_EN, abs(sol));
  digitalWrite(SAG_IN3, sag > 0);
  digitalWrite(SAG_IN4, sag < 0);
  analogWrite(SAG_EN, abs(sag));
}

void sallan(unsigned long t) {
  if (t < 400) motor(-SALLA_PWM, SALLA_PWM);          // sola don
  else if (t < 1200) motor(SALLA_PWM, -SALLA_PWM);    // saga don
  else if (t < 1600) motor(-SALLA_PWM, SALLA_PWM);    // basa don
  else motor(0, 0);
}

void setup() {
  for (int p = 5; p <= 10; p++) {
    pinMode(p, OUTPUT);
  }
  Serial.begin(9600);
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    enAz[i] = 1023;     // gercek degerler bunlardan kucuk/buyuk olacak
    enCok[i] = 0;
  }
}

void loop() {
  unsigned long simdi = millis();

  if (simdi < KALIBRASYON_MS) {
    sallan(simdi);
    for (int i = 0; i < SENSOR_SAYISI; i++) {
      int v = analogRead(SENSOR_PIN[i]);
      if (v < enAz[i]) enAz[i] = v;
      if (v > enCok[i]) enCok[i] = v;
    }
    return;
  }

  if (!hazir) {
    motor(0, 0);
    for (int i = 0; i < SENSOR_SAYISI; i++) {
      esik[i] = (enAz[i] + enCok[i]) / 2;
      Serial.print("A");
      Serial.print(i);
      Serial.print(" min=");
      Serial.print(enAz[i]);
      Serial.print(" max=");
      Serial.print(enCok[i]);
      Serial.print(" esik=");
      Serial.println(esik[i]);
    }
    hazir = true;
  }

  if (simdi - sonYazi >= 300) {
    sonYazi = simdi;
    for (int i = 0; i < SENSOR_SAYISI; i++) {
      Serial.print(analogRead(SENSOR_PIN[i]) > esik[i] ? '1' : '0');
    }
    Serial.println();
  }
}
```

### Program: ışık değişince sabit eşik ile kalibreli eşik
Şimdi ortam ışığının zemini de çizgiyi de aydınlattığı durumu düşün. Zemin 2,9 V (≈ 593), çizgi 4,6 V (≈ 941) okusun (örnek değerler). Bu sketch robotu sürmez; yalnızca iki karar yöntemini yan yana yazar. İlk 2 saniye min/max ölçer (bu süre içinde sensörleri bir çizgi üstüne, bir zemine getir). Sonra her 200 ms'de sabit eşik (512) ve kalibreli eşik ne diyor, ikisini de yazdırır.

```cpp
// sketch: kalib_isik
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};
const int SABIT_ESIK = 512;
const unsigned long OLCUM_MS = 2000;

int enAz[SENSOR_SAYISI];
int enCok[SENSOR_SAYISI];
int esik[SENSOR_SAYISI];
bool hazir = false;
unsigned long sonYazi = 0;

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    enAz[i] = 1023;
    enCok[i] = 0;
  }
}

void loop() {
  unsigned long simdi = millis();

  if (!hazir) {
    for (int i = 0; i < SENSOR_SAYISI; i++) {
      int v = analogRead(SENSOR_PIN[i]);
      if (v < enAz[i]) enAz[i] = v;
      if (v > enCok[i]) enCok[i] = v;
    }
    if (simdi >= OLCUM_MS) {
      for (int i = 0; i < SENSOR_SAYISI; i++) {
        esik[i] = (enAz[i] + enCok[i]) / 2;
      }
      hazir = true;
    }
    return;
  }

  if (simdi - sonYazi >= 200) {
    sonYazi = simdi;
    Serial.print("sabit=");
    for (int i = 0; i < SENSOR_SAYISI; i++) {
      Serial.print(analogRead(SENSOR_PIN[i]) > SABIT_ESIK ? '1' : '0');
    }
    Serial.print(" kalibre=");
    for (int i = 0; i < SENSOR_SAYISI; i++) {
      Serial.print(analogRead(SENSOR_PIN[i]) > esik[i] ? '1' : '0');
    }
    Serial.println();
  }
}
```

### Nasıl çalışıyor?
1. `enAz` başlangıçta 1023, `enCok` başlangıçta 0'dır. İlk gerçek okuma bu ikisini hemen geçer; böylece "en küçük/en büyük" hesabı doğru başlar. Başlangıcı tersine yazarsan (min = 0) min hiç güncellenmez.
2. Sallanırken çizgi sensörlerin altından geçer. Çizgide max, zeminde min yakalanır. Sallanmak yerine robotu elle çizgi üstünde ve dışında dolaştırmak da aynı sonucu verir; gerçek robotta çoğu zaman böyle yapılır.
3. `(enAz + enCok) / 2` eşiği zemin ile çizgi arasının tam ortasına koyar. Normal ışıkta sallanma sonunda `min=163 max=860 esik=511` gibi satırlar çıkar.
4. Işık yükselince zemin 593 okur. Sabit eşik 512 olduğu için zemin de "çizgi" sayılır: beş sensör de `1` verir, robot hiçbir şeyi ayırt edemez. Kalibreli eşik (593 ile 941'in ortası, ≈ 767) hâlâ doğru çalışır.
5. Kalibrasyon yalnızca ışık değişimine karşı bir önlem değildir. Her sensörün kendi farkını da telafi eder; bu yüzden eşiği dizide her sensör için ayrı tutuyoruz.

### Dene
- `SALLA_PWM` değerini 40 yap. Robot sallanıyor mu? Neden? (78. dersteki ölü bölgeyi düşün.)
- `KALIBRASYON_MS` değerini 300 yap. Sallanma bitmeden min/max alırsan eşik yine doğru çıkar mı?
- Kalibrasyondan sonra tekrar kalibre etmek için programa bir buton (örneğin D2, `INPUT_PULLUP`) ekle. Butona basınca ölçüm yeniden başlamalı.

### Sık yapılan hatalar
- `enAz` ve `enCok` başlangıcını ters yazmak.
- Sallanma sırasında robotu çizgiden uzak bir yere koymak: sensör çizgiyi hiç görmez, max zemin değerinde kalır ve eşik çizgiyi ayıramaz.
- Sallanmayı erken bitirmek ya da robotu hiç döndürememek. `KALIBRASYON_MS = 300` iken robot sola dönerken ölçüm biter; A0 ve A1 çizgiyi hiç görmez, min ile max eşit (163) kalır ve eşik 163 olur. Zemindeki en küçük titreme bile "çizgi" sayılır. Robot da 38° dönmüş halde kalır.
- `SALLA_PWM` ölü bölgenin altında (40) kalırsa robot kıpırdamaz. A2 hep 860 okur: min = max = 860, eşik 860 olur ve `860 > 860` yanlıştır. Robot çizginin tam üstünde olduğu halde desen `00000` çıkar.
- Tek bir eşiği beş sensöre uygulamak. Sensörler birbirinden farklı çıkabilir.
- Kalibrasyondan sonra ortam ışığı belirgin biçimde değişirse eski eşiğe güvenmek.

### Gerçek robotta farklı olabilecekler
Benzetimde beş sensör birebir aynıdır; bu yüzden hepsinin min/max'ı aynı çıkar. Gerçek robotta her sensörün kendi min/max'ı vardır ve okumalar titrer. Titreyen bir sinyalde tek bir anormal okuma min ya da max'ı bozabilir; birkaç okumanın ortalamasını almak yardımcı olur.

## Konuşalım
Kalibrasyonu robot her açıldığında mı yapmalı, yoksa bir kez yapıp sonucu EEPROM'a (34. ders) mı yazmalısın? Her iki yaklaşımın iyi ve kötü yanı ne?
