# Bang-bang çizgi izleme ve histerezis
süre: 25

## Merak
Karanlık bir koridorda elin duvara değerek yürüyorsun. Duvardan uzaklaşırsan duvara yaklaşırsın, duvara çok yaklaşırsan uzaklaşırsın. Düz yürümezsin, hafif zigzag çizersin ama duvarı hiç kaybetmezsin. Çizgi izleyen robotun en basit yöntemi de budur. Yalnız bir soru var: bu zigzag ne kadar büyük olur ve robot çizgiyi ne kadar sık kaybeder?

## Etkinlik
### Bang-bang kontrol nedir?
Bang-bang kontrolde çıkış yalnızca birkaç sabit seçenekten biridir: "sola dön", "düz git", "sağa dön". Ara değer yoktur. 35. dersteki termostat da böyleydi: ısıtıcı ya tam açık ya tam kapalı. Çizgi izlemede kural şöyle:

- Çizgi solda görünüyorsa sola dön (sol motoru yavaşlat ya da durdur).
- Çizgi sağda görünüyorsa sağa dön.
- Çizgi ortadaysa düz git.

### Devre
Standart bağlantılar (86. ve 87. derslerdeki gibi):

| Parça | Bağlantı |
|---|---|
| Çizgi sensörleri 0…4 | AO → **A0…A4** (A0 en sol) |
| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |

Motorlar için harici güç ve ortak GND kullan; pili ters bağlama, uçlarını kısa devre etme.

### Program 1: tek sensörle (zigzag)
Önce en basit hâl: yalnız ortadaki sensör (A2). Sensör çizgideyse sağa, değilse sola dön. Robot çizginin kenarını izlemeye çalışır.

```cpp
// sketch: bangbang_tek
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;
const int ORTA_SENSOR = A2;
const int ESIK = 512;
const int HIZ = 150;      // hizli tekerlek
const int DONUS = 0;      // yavas tekerlek (0 = durur)

void motor(int sol, int sag) {
  digitalWrite(SOL_IN1, sol > 0);
  digitalWrite(SOL_IN2, sol < 0);
  analogWrite(SOL_EN, abs(sol));
  digitalWrite(SAG_IN3, sag > 0);
  digitalWrite(SAG_IN4, sag < 0);
  analogWrite(SAG_EN, abs(sag));
}

void setup() {
  for (int p = 5; p <= 10; p++) {
    pinMode(p, OUTPUT);
  }
}

void loop() {
  if (analogRead(ORTA_SENSOR) > ESIK) {
    motor(HIZ, DONUS);      // cizgi altinda: saga don
  } else {
    motor(DONUS, HIZ);      // cizgi disinda: sola don
  }
}
```

### Program 2: beş sensörle, son yön hafızalı
Beş sensör çizginin hangi tarafta olduğunu söyler. A0 ya da A1 görüyorsa çizgi solda, A3 ya da A4 görüyorsa sağdadır. Hiçbiri görmüyorsa ne yapacağız? Burada **hafıza** devreye girer: `sonYon` çizginin en son hangi tarafta görüldüğünü tutar. Çizgi kaybolursa robot o yöne dönmeye devam eder; çünkü çizgi büyük olasılıkla o tarafta kaldı.

Bu bir tür **histerezistir**: karar yalnız şu anki okumaya değil, geçmişe de bağlıdır. 35. dersteki termostat da "açıkken kapanma eşiği, kapalıyken açılma eşiği" diyerek durumu hatırlıyordu.

Programa ayrıca bir de ölçüm koydum: hiçbir sensör çizgiyi görmediği sürenin toplamı (`kayipMs`) her saniye yazılır.

```cpp
// sketch: bangbang_dizi
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};
const int ESIK = 512;
const int HIZ = 150;
const int DONUS = 0;

int sonYon = 0;                  // -1 cizgi solda, 0 ortada, +1 sagda
unsigned long sonTur = 0;
unsigned long kayipMs = 0;       // hicbir sensorun cizgiyi gormedigi toplam sure
unsigned long sonYazi = 0;

void motor(int sol, int sag) {
  digitalWrite(SOL_IN1, sol > 0);
  digitalWrite(SOL_IN2, sol < 0);
  analogWrite(SOL_EN, abs(sol));
  digitalWrite(SAG_IN3, sag > 0);
  digitalWrite(SAG_IN4, sag < 0);
  analogWrite(SAG_EN, abs(sag));
}

void setup() {
  for (int p = 5; p <= 10; p++) {
    pinMode(p, OUTPUT);
  }
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();

  bool s[SENSOR_SAYISI];
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    s[i] = analogRead(SENSOR_PIN[i]) > ESIK;
  }
  bool sol = s[0] || s[1];
  bool sag = s[3] || s[4];
  bool orta = s[2];
  bool hicbiri = !(sol || sag || orta);

  if (hicbiri) {
    kayipMs += simdi - sonTur;
  }
  sonTur = simdi;

  if (sol) {
    sonYon = -1;
  } else if (sag) {
    sonYon = 1;
  } else if (orta) {
    sonYon = 0;
  }                              // hicbiri: sonYon aynen kalir (hafiza)

  if (sonYon == 0) {
    motor(HIZ, HIZ);
  } else if (sonYon < 0) {
    motor(DONUS, HIZ);           // sola don
  } else {
    motor(HIZ, DONUS);           // saga don
  }

  if (simdi - sonYazi >= 1000) {
    sonYazi = simdi;
    Serial.print("t=");
    Serial.print(simdi / 1000);
    Serial.print(" kayip=");
    Serial.println(kayipMs);
  }
}
```

### Program 3: gürültülü sensörde histerezis (iki eşik)
Hafıza yalnız yön için değil, eşiğin kendisi için de kullanılır. Gerçek bir sensörün okuması titrer. Okuma eşik civarındayken tek eşik sürekli 0-1-0-1 verir. **İki eşik** (bir yukarı, bir aşağı) kullanırsan bu titreme etkisiz kalır: sinyal önce üst eşiği geçmeli (aç), sonra alt eşiğin altına inmeli (kapat).

Aşağıdaki sketch A2'yi izler. D13'teki LED tek eşikle (512), D12'deki LED iki eşikle (açma 600, kapama 420) yanar. Benzetimdeki çizgi sensörü gürültüsüz olduğu için bu sketch'te A2'yi biz elle sürüyoruz; gürültüyü gerçek bir sensörde de görürsün.

```cpp
// sketch: histerezis_esik
const int SENSOR_PIN = A2;
const int LED_TEK = 13;
const int LED_HIST = 12;
const int ESIK = 512;
const int ESIK_YUKARI = 600;
const int ESIK_ASAGI = 420;
bool histDurum = false;

void setup() {
  pinMode(LED_TEK, OUTPUT);
  pinMode(LED_HIST, OUTPUT);
}

void loop() {
  int v = analogRead(SENSOR_PIN);

  digitalWrite(LED_TEK, v > ESIK);

  if (!histDurum && v > ESIK_YUKARI) {
    histDurum = true;
  } else if (histDurum && v < ESIK_ASAGI) {
    histDurum = false;
  }
  digitalWrite(LED_HIST, histDurum);
}
```

### Nasıl çalışıyor?
1. `bangbang_tek` robotu hep döndürür: çizgideyse sağa, değilse sola. Düz gitmesi hiç mümkün olmaz; robot çizginin kenarında sürekli zigzag yapar. Orta sensörün durumu çok sık değişir.
2. `bangbang_dizi` iki yanı ayrı ayrı izler. Çizgi ortadayken düz gider, kenar sensörlerinden biri görürse o yöne döner. Zigzag çok azalır.
3. Çizgi hiçbir sensörde yokken `sonYon` değişmez, robot son bildiği yöne dönmeye devam eder. `else if (orta)` satırını `else` yaparsan (çizgi yoksa düz git) hafıza kalmaz.
4. Ölçümler (benzetimde oval pist, çevre ≈ 2,9 m, robot çizgi üstünde başlıyor):

| Program | Pist turu | Çizgiyi görmediği toplam süre |
|---|---|---|
| `bangbang_tek` | 30 sn'de bitmiyor | 30 sn'nin yarısından fazla |
| `bangbang_dizi` (hafızalı) | ≈ 17 sn | ≈ 3,9 sn (en uzun kesinti ≈ 0,24 sn) |
| `bangbang_dizi`, hafızasız (çizgi yoksa düz) | ≈ 17 sn | ≈ 12 sn (en uzun kesinti ≈ 1,2 sn) |

Hafızasız sürüm de turu bitiriyor ama çizgiyi çok daha uzun süre göremiyor. Hafıza, kayıp süresini üçte birine indiriyor.
5. `histerezis_esik` sketch'inde gürültülü sinyalde tek eşikli LED onlarca kez yanıp sönerken iki eşikli LED yalnızca bir kez yanıp bir kez söner.

### Dene
- `bangbang_dizi` içinde `DONUS` değerini 60 yap. Daha yumuşak dönüş turu daha uzun mu, kısa mı yapıyor? Çizgiyi görmediği süre değişiyor mu?
- `HIZ` değerini 200 yap. Tur kısalıyor mu? Kayıp süresi ne oluyor?
- `else if (orta)` satırını `else` olarak değiştir ve kayıp süresini karşılaştır.

### Sık yapılan hatalar
- Sol ve sağ motorun dönüş yönünü karıştırmak: "çizgi solda" derken sağa dönersin ve robot çizgiden kaçar.
- Çok yüksek hız: robot dönmeye başlamadan çizgiyi geçer.
- Hafızayı hiç kullanmamak: çizgi bir an kaybolunca robot düz gider ve virajı kaçırır.
- Eşiği tahminle seçmek: ışık değişince karar bozulur (87. ders).

### Gerçek robotta farklı olabilecekler
Benzetimde sensör gürültüsüz ve zamanlama mükemmeldir. Gerçek robotta titreyen okumalar, pil gerilimi düştükçe değişen motor hızı ve zemin kusurları zigzagı büyütür; iki eşikli (histerezisli) karar vermek gerçek sensörde ciddi fark yaratır.

## Konuşalım
Zigzag azaltmanın bir yolu daha yavaş gitmek, bir yolu da "ne kadar sapıyorsun?" sorusuna sola/sağa yerine bir sayıyla cevap verip dönüşü bu sayıya göre ayarlamaktır. Sence bu ikinci yol neden bang-bang'den daha pürüzsüz olurdu?
