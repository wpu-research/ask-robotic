# Proje: El eğimiyle kontrol edilen servo (mini gimbal)
süre: 35

## Merak
Kamera taşıyan sistemlerde (el gimbalı, drone) kamera ne kadar sallanırsa sallansın görüntü yatay kalır. İçlerinde küçük motorlar ve bir eğim sensörü vardır: sensör "taban 20° eğildi" der, motor ters yönde 20° döner ve kamera yerinde sabit kalır. Bu projede bu fikrin tek eksenli, masaya sığan bir modelini kuracaksın.

## Etkinlik
### Ne yapacağız?
Bu proje öğrendiklerini birleştirir:
- **Modül 3, Hafta 5 (21. ders):** Servo ve açı → darbe genişliği.
- **Modül 3, Hafta 6 (27. ders):** `millis()` ile bloklamayan döngü.
- **Modül 3, Hafta 7 (32-33. dersler):** LCD ve I2C ile açıyı gösterme.
- **Bu hafta (58-59. dersler):** MPU6050 ile ham veri, pitch hesabı, jiroskop sapması ve tamamlayıcı filtre.

MPU6050 pitch açısını ölçer, tamamlayıcı filtre bunu sakinleştirir. Servo, pitch kadar **ters** yönde döner: pitch +20° ise servo 90 − 20 = 70°'ye gider. Servo kolunun üstüne hafif bir platform (karton, küçük bir bayrak ya da hafif bir kamera maketi) yerleştirirsen, taban eğilince platform yatay kalmaya çalışır.

Düğme (D2) o anki eğimi "sıfır" kabul eder: masa tam yatay olmasa bile "şu an yatay" diyebilirsin.

### Devre
**Güvenlik:** Bu projede yalnızca düşük gerilim (5 V) kullan. Küçük bir servo kısa süreli testte kartın 5 V pininden çalışabilir, ama motor yük bindirince voltaj düşer ve MPU/LCD hatalı çalışabilir. Kalıcı kurulumda servoyu **harici 5 V güç kaynağından** besle ve harici kaynağın GND'sini kartın GND'siyle birleştir (ortak GND). Pil kullanıyorsan kutupları ters bağlama ve uçlarını birbirine değdirme.

| Parça | Bağlantı |
|---|---|
| MPU6050 (GY-521) | VCC → 5 V, GND → GND, SDA → **A4**, SCL → **A5** (adres 0x68) |
| I2C LCD 16x2 | VCC → 5 V, GND → GND, SDA → **A4**, SCL → **A5** (adres 0x27) |
| Servo | Sinyal → **D6**; kırmızı → 5 V (tercihen harici); kahverengi/siyah → GND (ortak) |
| Buton "sıfırla" | **D2** ile GND arası (`INPUT_PULLUP`) |
| LED + 330 Ω direnç | **D13** → direnç → LED anodu; katot → GND ("servo sınırda" ışığı) |

MPU6050 (0x68) ile LCD (0x27) aynı iki telde yan yana çalışır, çünkü adresleri farklı (33. ders). Devrede DS3231 saat modülü bulunmasın; o da 0x68 kullanır.

### Tasarım
- **Pitch:** `atan2(ax, az)` (58. ders).
- **Filtre:** `aci = 0,98 · (aci + gy · dt) + 0,02 · accAci` (59. ders). Sapma `setup` içinde, çip kıpırdamadan ölçülür.
- **Sıfırlama:** Düğmeye basılınca o anki `aci` `ofset` olarak saklanır. Kontrol açısı `egim = aci − ofset` olur.
- **Servo açısı:** `servo = 90 − egim`. Servo mekanik uçlarına dayanmasın diye `10 ... 170°` arasında sınırlanır. Sınıra gelince LED yanar.
- **Zamanlama:** Döngü her 10 ms'de bir ölçer ve servoyu günceller; LCD ve seri çıktı 250 ms'de bir yenilenir. Hiç `delay` yok (27. ders).

Servo, kontrolün sonucunu **görmez**: MPU tabanın eğimini ölçer, platformun gerçekten yatay olup olmadığını ölçmez. Böyle sensör geri bildirimi olmayan kontrole **açık çevrim** denir. Basit ve çoğu masa üstü model için yeterlidir; platformun gerçek açısını ölçüp düzeltmek bir sonraki seviyedir.

### Program
```cpp
// sketch: mini_gimbal
#include <Wire.h>
#include <Servo.h>
#include <LiquidCrystal_I2C.h>

const int MPU = 0x68;
const int SERVO_PIN = 6;
const int SIFIRLA = 2;
const int LED = 13;

const float ALFA = 0.98;
const int SERVO_MERKEZ = 90;
const int SERVO_MIN = 10;
const int SERVO_MAX = 170;
const unsigned long DONGU_MS = 10;
const unsigned long EKRAN_MS = 250;

Servo servo;
LiquidCrystal_I2C lcd(0x27, 16, 2);

float sapmaGy = 0;
float aci = 0;                       // filtreli pitch (derece)
float ofset = 0;                     // "sıfır" kabul edilen açı
float ax, az, gy;                    // son ölçüm: g, g, °/s
unsigned long sonDongu = 0;
unsigned long sonEkran = 0;
unsigned long sonUs = 0;
bool oncekiBasili = false;

int16_t oku16() {
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  return (int16_t)((yuksek << 8) | dusuk);
}

void mpuOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 14, true);
  ax = oku16() / 16384.0;
  oku16();                           // ay: kullanmıyoruz
  az = oku16() / 16384.0;
  oku16();                           // sıcaklık
  oku16();                           // gx
  gy = oku16() / 131.0;              // pitch: Y ekseni etrafında dönüş
  oku16();                           // gz
}

float ivmeAci() {
  return atan2(ax, az) * 180.0 / PI;
}

void ekranYaz(float egim, int servoAci) {
  lcd.setCursor(0, 0);
  lcd.print("Egim: ");
  lcd.print(egim, 1);
  lcd.print("      ");
  lcd.setCursor(0, 1);
  lcd.print("Servo: ");
  lcd.print(servoAci);
  lcd.print("      ");
}

void setup() {
  Serial.begin(9600);
  pinMode(SIFIRLA, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  servo.attach(SERVO_PIN);
  servo.write(SERVO_MERKEZ);

  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);                     // uyandır
  Wire.endTransmission(true);
  delay(100);

  float toplam = 0;                  // sapma ölçümü: çip kıpırdamasın
  for (int i = 0; i < 100; i++) {
    mpuOku();
    toplam += gy;
    delay(5);
  }
  sapmaGy = toplam / 100;

  mpuOku();
  aci = ivmeAci();                   // başlangıç açısı ivmeölçerden
  lcd.init();
  lcd.backlight();
  sonUs = micros();
}

void loop() {
  unsigned long simdi = millis();

  // 1) Sıfırlama düğmesi: basıldığı an bir kez
  bool basili = (digitalRead(SIFIRLA) == LOW);
  if (basili && !oncekiBasili) {
    ofset = aci;
  }
  oncekiBasili = basili;

  // 2) Her 10 ms'de ölçüm, filtre ve servo
  if (simdi - sonDongu >= DONGU_MS) {
    sonDongu = simdi;

    mpuOku();
    unsigned long us = micros();
    float dt = (us - sonUs) / 1000000.0;
    sonUs = us;
    aci = ALFA * (aci + (gy - sapmaGy) * dt) + (1.0 - ALFA) * ivmeAci();

    float egim = aci - ofset;
    int servoAci = SERVO_MERKEZ - (int)round(egim);   // ters yönde dön
    bool sinirda = (servoAci <= SERVO_MIN || servoAci >= SERVO_MAX);
    servoAci = constrain(servoAci, SERVO_MIN, SERVO_MAX);
    servo.write(servoAci);
    digitalWrite(LED, sinirda ? HIGH : LOW);

    // 3) Ekran ve seri çıktı: 250 ms'de bir
    if (simdi - sonEkran >= EKRAN_MS) {
      sonEkran = simdi;
      ekranYaz(egim, servoAci);
      Serial.print("egim=");
      Serial.print(egim, 1);
      Serial.print(" servo=");
      Serial.println(servoAci);
    }
  }
}
```

### Nasıl çalışıyor?
1. `setup` servoyu ortaya (90°) alır, MPU'yu uyandırır ve 100 ölçümün ortalamasıyla jiroskop sapmasını bulur (59. ders). Bu sırada tabanı kıpırdatma.
2. `mpuOku` 14 baytı tek seferde okur (58. ders) ama yalnız işimize yarayanları saklar: `ax`, `az` ve `gy`.
3. Her 10 ms'de bir tamamlayıcı filtre çalışır. `dt`, `micros()` farkından hesaplanır; döngünün süresi biraz oynasa bile integral doğru kalır.
4. `egim = aci − ofset`: düğmeye basınca o anki açı sıfır olur.
5. `servoAci = 90 − egim`: eğim pozitifse servo 90'ın altına gider, yani ters yönde döner. `constrain` ile 10 ile 170 arasında tutulur. Sınıra gelince LED yanar.
6. `servo.write` darbe genişliğini ayarlar (21. ders): 90° ≈ 1472 µs, 70° ≈ 1266 µs.
7. `loop` hiç beklemez; butona, ölçüme ve ekrana ayrı zaman damgalarıyla (`millis`) bakar.

Platform ters yönde dönüyorsa (servo montajına göre olabilir), `SERVO_MERKEZ - ...` ifadesini `SERVO_MERKEZ + ...` yap.

### Dene
- `ALFA` değerini 0,90 yap. Elinle tabanı titret; servo ne kadar titriyor? 0,99 yap; servo ne kadar geç tepki veriyor?
- `SERVO_MIN` ve `SERVO_MAX` değerlerini 45 ve 135 yap. Sınırda LED ne zaman yanıyor?
- Roll eksenini de ekle: ikinci bir servoyu D9'a bağla ve `roll = atan2(ay, az)` açısıyla sür. İki eksenli gimbal olur (`ay` değerini `mpuOku` içinde saklaman gerekir).
- Kamera maketi yerine hafif bir bayrak tak ve tabanı elinle eğ. Bayrak yatay kalıyor mu? Hata varsa nereden geliyor olabilir?

### Sık yapılan hatalar
- Servoyu kartın 5 V pininden beslemek ve servo yük bindirince MPU ya da LCD'nin donmasına şaşırmak. Harici güç ve ortak GND kullan.
- Sapma ölçerken tabanı tutmak ya da hareket ettirmek: platform sürekli kayar.
- MPU6050 ile aynı hatta DS3231 (aynı 0x68 adresi) bağlamak.
- `dt` yerine sabit 0,01 yazmak: döngü süresi değişince filtre bozulur.
- Servo açısını sınırlamamak: servo mekanik ucuna dayanıp zorlanır, ses çıkarır, ısınır.
- `delay` kullanmak: butona basışı kaçırır ve filtre `dt`'sini bozar.

## Konuşalım
Gerçek gimbalda platformun kendi açısını ölçen ikinci bir sensör ve hatayı sürekli düzelten bir kontrol vardır. Bizim modelde böyle bir geri bildirim yok. Kameranın tabanı yavaşça ve hızlıca eğildiğinde modelimiz hangisinde daha çok hata yapar? Neden?
