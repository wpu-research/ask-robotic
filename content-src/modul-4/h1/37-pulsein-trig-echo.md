# pulseIn, trig/echo ve santimetre hesabı
süre: 25

## Merak
Geçen derste sensörün bize mesafeyi değil bir süre verdiğini öğrendin: ECHO bacağının kaç mikrosaniye HIGH kaldığı. Ama `loop()` saniyede binlerce tur atar. Kart, bir pinin HIGH'a çıkıp tekrar LOW'a inmesi arasındaki süreyi mikrosaniye hassasiyetiyle nasıl ölçer? Üstelik hiç yansıma gelmezse sonsuza kadar beklemez mi?

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| HC-SR04 VCC | 5 V |
| HC-SR04 TRIG | **D9** |
| HC-SR04 ECHO | **D10** |
| HC-SR04 GND | GND |
| LED + 330 Ω direnç (ikinci program) | **D13** → direnç → LED anodu; katot → GND |

### Ölçümün üç adımı
1. **Tetikle:** TRIG'i 2 µs LOW tut (temiz başlangıç), sonra 10 µs HIGH yap, sonra tekrar LOW. 10 µs'lik bu darbe sensöre "ölç" der. Mikrosaniye bekleme için `delayMicroseconds()` kullanılır (`delay` milisaniyedir).
2. **Süreyi ölç:** `pulseIn(pin, HIGH, zamanAsimi)` pinin HIGH olmasını bekler, HIGH kaldığı süreyi mikrosaniye olarak döndürür.
3. **Çevir:** süre × 0,0343 / 2 = santimetre (36. ders).

`pulseIn`'in üçüncü parametresi **zaman aşımıdır**: bu süre içinde darbe tamamlanmazsa `pulseIn` **0** döndürür. Nesne yoksa ya da yansıma sensöre dönmüyorsa programın sonsuza kadar takılmaması bunun sayesindedir. Biz 30 000 µs (30 ms) seçtik; bu yaklaşık 5 metreye karşılık gelir ve sensörün 4 metrelik sınırını rahatça kapsar.

### Program 1: ilk ölçüm
```cpp
// sketch: mesafe_pulsein
const int TRIG = 9;
const int ECHO = 10;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);       // 10 us'lik tetik darbesi
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  unsigned long sure = pulseIn(ECHO, HIGH, 30000);   // us; en çok 30 ms bekle

  if (sure == 0) {
    Serial.println("Yansima yok (menzil disi)");
  } else {
    float cm = sure * 0.0343 / 2.0;
    Serial.print("sure=");
    Serial.print(sure);
    Serial.print(" us  mesafe=");
    Serial.print(cm, 1);
    Serial.println(" cm");
  }
  delay(200);
}
```

### Nasıl çalışıyor?
1. `TRIG` çıkış, `ECHO` giriştir. Sensöre komutu kart verir, cevabı sensör verir.
2. Üç satırlık tetik (LOW, HIGH 10 µs, LOW) sensörü ölçüme başlatır. Sensör kendi içinde ses demetini yollar ve ECHO'yu yükseltir.
3. `pulseIn(ECHO, HIGH, 30000)` ECHO'nun HIGH kalma süresini döndürür. Tipik bir 100 cm'lik ölçümde bu yaklaşık 5800 µs'dir.
4. `sure == 0` ise yansıma gelmemiştir. 0'ı mesafe gibi hesaplamak "0 cm" yazdırırdı; bu yanlış olurdu.
5. `delay(200)` ölçümler arasına bekleme koyar. Önceki ölçümün yankısı bitmeden yenisini başlatmamak için ölçümler arasında bekleme bırakılır; veri sayfaları genelde ölçümler arasında yaklaşık 60 ms önerir.

`pulseIn` **bloklayıcıdır**: ölçüm bitene kadar program başka bir şey yapmaz. 100 cm'de 6 ms sürer, ama yansıma yoksa tam 30 ms bekler. 27. dersteki `millis()` düşüncesini hatırla: ölçümü sık yaparsan butonlara ve ekrana ayrılan zaman azalır. Bu yüzden ölçümü bir fonksiyona koyup `millis()` ile belirli aralıklarla çağıracağız.

Süre değişkeninin türü önemlidir: `pulseIn` `unsigned long` döndürür. `int` kullanırsan 32 767 µs'de taşar ve büyük mesafeler eksi sayı olur.

### Program 2: fonksiyon ve LED
Ölçümü `mesafeOku()` adlı bir fonksiyona taşıyalım. Yansıma yoksa `-1` döndürsün. Ana program her 100 ms'de bir ölçsün ve 30 cm'den yakınsa LED yansın.

```cpp
// sketch: mesafe_fonksiyon_led
const int TRIG = 9;
const int ECHO = 10;
const int LED = 13;
const unsigned long OLCUM_ARALIGI = 100;   // ms

unsigned long sonOlcum = 0;

float mesafeOku() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return -1;                 // yansıma yok
  return sure * 0.0343 / 2.0;
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    float cm = mesafeOku();
    digitalWrite(LED, cm >= 0 && cm < 30);  // yakın ve geçerli ölçüm
    Serial.println(cm);
  }
}
```

`cm >= 0 && cm < 30` koşulu, `-1` (yansıma yok) değerinin "30'dan küçük" sayılıp LED'i yakmasını engeller. Bu küçük detay park sensörü gibi güvenlik işlerinde hayati olabilir.

### Hazır kütüphane: NewPing
Bu işi senin yerine yapan bir kütüphane de var: **NewPing**. TRIG ve ECHO pinlerini ve en büyük mesafeyi söyleyip `ping()` dersin; o da süreyi mikrosaniye olarak döndürür (yansıma yoksa 0).

```cpp
// sketch: newping_ornek
#include <NewPing.h>

NewPing sonar(9, 10, 400);   // TRIG, ECHO, en büyük mesafe (cm)

void setup() {
  Serial.begin(9600);
}

void loop() {
  delay(100);
  unsigned int sure = sonar.ping();          // us; yansıma yoksa 0
  Serial.print("sure=");
  Serial.print(sure);
  Serial.print(" us  mesafe=");
  Serial.print(sure * 0.0343 / 2.0, 1);
  Serial.println(" cm");
}
```

NewPing'in `ping_cm()` fonksiyonu doğrudan tam santimetre verir; kendi içindeki sabit 1 cm için 57 µs aldığından sonucu bizim 0,0343 formülümüzden birkaç yüzde farklı çıkabilir (benzetimde 100 cm'lik bir mesafe için `ping_cm()` 102 verdi). Bu modülde `pulseIn` ile devam edeceğiz, çünkü süre, tetik ve çeviri adımlarını görmek asıl amaç. Kütüphane işi kısaltır ama içinde ne olduğunu bilmek senin işin.

### Dene
- `mesafe_pulsein` programında elini sensöre 5 cm yaklaştır, sonra 1 cm'ye. 1 cm'de ne yazıyor? Neden?
- `delay(200)` yerine `delay(20)` yaz. Ölçüm kararlı kalıyor mu? Gerçek devrede çok yakın ölçümlerin arasında bu süre neden önemlidir?
- `mesafe_fonksiyon_led` programında LED'in yanma eşiğini 15 cm yap. Sonra eşiği dışarıdan değiştirebilmek için bir sabit olarak yaz.

### Sık yapılan hatalar
- Zaman aşımı koymamak: `pulseIn(ECHO, HIGH)` varsayılan olarak 1 saniye bekler; yansıma yoksa program takılmış gibi görünür.
- Tetik darbesini çok kısa ya da çok uzun vermek: sensör ölçüm yapmayabilir. 10 µs'ye uy.
- `sure == 0` durumunu kontrol etmemek: mesafe "0 cm" görünür ve LED ya da buzzer yanlış davranır.
- `sure` için `int` kullanmak: 32 767 µs üstü taşar.
- TRIG ile ECHO'nun yerini değiştirmek: hiçbir ölçüm gelmez, hep 0 okursun.
- ECHO'yu doğrudan 3,3 V'luk bir karta bağlamak: HC-SR04'ün ECHO çıkışı 5 V'tur. Uno'da sorun yok, ama farklı kartlara geçersen gerilim bölücü gerekir.

## Konuşalım
`pulseIn` bir ölçüm sırasında programı bekletiyor. Aynı programda bir butonu ve ekranı da yönetmen gerekseydi ölçümü nasıl yapardın? Ölçümü daha seyrek yapmanın bedeli ne olurdu?
