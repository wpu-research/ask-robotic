# Servo ile tarama (sonar)
süre: 25

## Merak
Denizaltı filmlerinde "bip... bip..." diye ekranda dönen bir sonar vardır. Sonar tek yöne bakmaz; sesi her yöne sırayla gönderip nerede ne var diye haritalar. Bizim HC-SR04 yalnızca baktığı yönü ölçer. Peki onu bir servonun üstüne koyup etrafı taratırsak ve en yakın nesnenin hangi yönde olduğunu bulursak?

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| HC-SR04 VCC | Uno **5V** |
| HC-SR04 GND | Uno **GND** |
| HC-SR04 TRIG | Uno **D9** |
| HC-SR04 ECHO | Uno **D10** |
| Servo SIG | Uno **D6** |
| Servo VCC | Uno **5V** |
| Servo GND | Uno **GND** |

Bilgi notu (21. dersten): servo hareket ederken ani akım çeker. Gerçek bir devrede bu akım Uno'nun 5 V hattını çökertip kartı sıfırlayabilir ya da sensör ölçümlerini bozabilir; bu yüzden gerçek projelerde servo ayrı bir 5 V kaynaktan beslenir ve GND'ler ortak yapılır. Laboratuvarda harici güç kaynağı yoktur, servoyu Uno'nun 5V ve GND pinlerine bağlarsın.

**Laboratuvarda sensör servoyla birlikte dönmez.** Gerçek sonarda HC-SR04, servonun koluna sabitlidir ve servo döndükçe farklı yönlere bakar. Laboratuvarda sensörün tek bir **Mesafe** değeri vardır. Farklı yönlerde farklı nesneler olduğunu taklit etmek için program çalışırken Mesafe'yi kendin değiştirirsin. Örneğin servo 120° civarındayken Mesafe'yi 35 cm yap, sonra 200 cm'ye geri getir. Seri monitörde `120:35.0` satırını görürsün.

### Fikir
Servo açısını 0°'den 180°'ye 30°'lik adımlarla artırırız. Her adımda:
1. `servo.write(aci)` servoyu açıya yollar.
2. Servo oraya varana kadar bekleriz (`delay(300)`; küçük servolar için tipik bir değerdir, yük ve servoya göre değişir).
3. Sensörle mesafeyi ölçeriz. Tek ölçüm yerine 38. dersteki medyan fikrini kullanırız: üç ölçümün ortancası.
4. Sonucu **"açı:mesafe"** biçiminde yazarız, örneğin `120:35.0`.
5. En küçük mesafeyi ve o andaki açıyı tutarız.

Tarama bitince "EN YAKIN" satırı yazılır. Hiç nesne bulunamazsa (hepsi 400 cm ya da yankısız) "nesne yok" yazılır.

### Program 1: tarama ve en yakın nesne
```cpp
// sketch: sonar_tarama
#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int ADIM = 30;                  // derece
const float MENZIL = 400.0;           // yankı yok: uzak say

Servo servo;

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return MENZIL;
  float cm = sure * 0.0343 / 2.0;
  return cm > MENZIL ? MENZIL : cm;
}

// Üç sayının ortancası: ne en küçük ne en büyük olan
float medyan3(float a, float b, float c) {
  return max(min(a, b), min(max(a, b), c));
}

float olc() {
  float a = tekOlcum(); delay(30);
  float b = tekOlcum(); delay(30);
  float c = tekOlcum();
  return medyan3(a, b, c);
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  servo.attach(SERVO_PIN);
  Serial.begin(9600);
  servo.write(0);
  delay(600);                         // başlangıç konumuna git
}

void loop() {
  float enYakin = MENZIL;
  int enYakinAci = -1;

  for (int aci = 0; aci <= 180; aci += ADIM) {
    servo.write(aci);
    delay(300);                       // servo varsın
    float cm = olc();
    Serial.print(aci);
    Serial.print(":");
    Serial.println(cm, 1);
    if (cm < enYakin) {
      enYakin = cm;
      enYakinAci = aci;
    }
  }

  if (enYakinAci < 0) {
    Serial.println("EN YAKIN: nesne yok");
  } else {
    Serial.print("EN YAKIN: ");
    Serial.print(enYakinAci);
    Serial.print(" derece, ");
    Serial.print(enYakin, 1);
    Serial.println(" cm");
  }
  servo.write(0);                     // başa dön
  delay(800);
}
```

### Nasıl çalışıyor?
1. `for` döngüsü açıyı 0, 30, 60, ... 180 yapar. `aci += ADIM` her turda 30 ekler.
2. `delay(300)` servo hareketini bekletir. Beklemezsen sensör servo hâlâ dönerken ölçer ve ölçümün hangi açıya ait olduğu karışır.
3. `medyan3` üç ölçümden en tuhafını atar. Formül: `max(min(a,b), min(max(a,b),c))`. Üç sayının ortancasını sıralama yapmadan bulur.
4. `cm < enYakin` karşılaştırması en küçük mesafeyi yakalar. `enYakin` başta `MENZIL` olduğu için yankısız (400) ölçümler hiçbir zaman "en yakın" olamaz.
5. Sonuç satırları `aci:mesafe` biçimindedir. Bu biçim iyi bir alışkanlıktır: bir PC programı ya da çizim aracı `:` işaretinden bölerek veriyi okuyabilir.

Servo açısı aslında bir **darbe genişliğidir** (21. ders): yaklaşık 544 µs 0°'ye, yaklaşık 2400 µs 180°'ye denk gelir. Servo kütüphanesi `write(90)` için yaklaşık 1472 µs'lik darbeyi her 20 ms'de bir yollar.

### Program 2: en yakın nesneyi göster
Bu sefer tarama yalnızca bir kez yapılsın. Sonra servo en yakın nesnenin yönüne dönüp orada kalsın ve o yönün mesafesini canlı yazsın.

```cpp
// sketch: sonar_isaret
#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int ADIM = 30;
const float MENZIL = 400.0;

Servo servo;
int hedefAci = 90;

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return MENZIL;
  float cm = sure * 0.0343 / 2.0;
  return cm > MENZIL ? MENZIL : cm;
}

float medyan3(float a, float b, float c) {
  return max(min(a, b), min(max(a, b), c));
}

float olc() {
  float a = tekOlcum(); delay(30);
  float b = tekOlcum(); delay(30);
  float c = tekOlcum();
  return medyan3(a, b, c);
}

// Tarama yapar, en yakın nesnenin açısını döndürür (yoksa -1)
int enYakinAciBul() {
  float enYakin = MENZIL;
  int aciEn = -1;
  for (int aci = 0; aci <= 180; aci += ADIM) {
    servo.write(aci);
    delay(300);
    float cm = olc();
    if (cm < enYakin) {
      enYakin = cm;
      aciEn = aci;
    }
  }
  return aciEn;
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  servo.attach(SERVO_PIN);
  Serial.begin(9600);
  servo.write(0);
  delay(600);

  int aci = enYakinAciBul();
  if (aci >= 0) hedefAci = aci;       // nesne bulunduysa oraya dön
  else hedefAci = 90;                 // yoksa ortada dur
  servo.write(hedefAci);
  delay(500);
}

void loop() {
  Serial.print("isaret=");
  Serial.print(hedefAci);
  Serial.print(" mesafe=");
  Serial.println(olc(), 1);
  delay(500);
}
```

Burada tarama bir fonksiyona taşındı: `enYakinAciBul()` açıyı döndürür. `setup()` bir kez çağırır, sonra servo o açıda kalır. Buna "nesneyi işaret etme" dersek, bir sonraki adım nesneyi **takip etmek** olurdu: tarama aralığını daraltıp sürekli güncellemek.

### Dene
- `ADIM` değerini 15 ve 10 yap. Tarama kaç saniye sürüyor? Çözünürlük arttıkça ne kaybediyorsun? (Hesapla: adım sayısı × yaklaşık 400 ms.)
- Taramayı geri dönerken de yap (180°'den 0°'ye) ve iki yönün sonuçlarını karşılaştır. Aynı mı çıkıyor?
- `sonar_tarama` çıktısını bir tablo programına yapıştırıp grafik çiz: açı yatay eksen, mesafe dikey eksen. Nesne nerede "çukur" olarak görünüyor?

### Sık yapılan hatalar
- Servonun VCC ya da GND kablosunu çekmeyi unutmak: servo hiç hareket etmez, laboratuvar "beslenmemiş" uyarısı verir.
- `servo.attach(SERVO_PIN)` satırını unutmak: `servo.write` çağrıları servoyu oynatmaz.
- Gerçek devrede servoyu ve sensörü aynı zayıf 5 V hattından beslemek ve ortak GND'yi unutmak: kart sıfırlanır, sensör saçmalar.
- Hareket bitmeden ölçmek: açı ile mesafe eşleşmez. `delay(300)` bunun içindir.
- Sensörün ışın genişliğini unutmak: veri sayfasında ölçüm açısı tipik olarak yaklaşık 15° civarında verilir, yani sensör tek bir çizgiye değil bir koniye bakar. 30°'lik adımlar bazı nesneleri iki komşu açıda birden gösterebilir ya da hiç göstermeyebilir.
- `enYakin` değerini çok büyük başlatmamak (0 ile başlamak gibi): hiçbir ölçüm "daha küçük" olamaz.

## Konuşalım
Tarama sırasında bir nesne hareket ederse taramanın sonucu doğru olur mu? 180° tarama 3 saniye sürüyorsa bu sensörü hızlı giden bir araçta kullanmak mantıklı mı?
