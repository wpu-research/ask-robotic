# VL53L0X (I2C ToF): hassas mesafe
süre: 20

## Merak
HC-SR04 ile odanın boyunu ölçtün ama sensör bazen cismi hiç görmedi ya da yanlış yere yansıdı. İnce bir kablonun ucuna kadar yaklaşan bir parçayı ölçmek için ses yerine ışık kullanmak ister misin? Küçük bir kartın üzerinde bir ışık darbesinin gidiş-dönüş süresini ölçen bir sensör var: VL53L0X.

## Etkinlik
### ToF nedir?
ToF (Time of Flight, uçuş süresi), sensörün bir ışık darbesi gönderip yansımasının dönüş süresini ölçmesidir. VL53L0X bunu kızılötesi bir lazerle yapar ve sonucu **milimetre** cinsinden verir. Veriyi Arduino'ya **I2C** ile iletir (33. dersteki `Wire`). Varsayılan I2C adresi **0x29**'dur.

Sınırlar için sensörün veri sayfasına ve satın aldığın kartın belgesine bak. Ölçüm aralığı, doğruluk ve ortam ışığına tepkisi **modele ve kullanım koşullarına göre değişir**. Kendi ortamında dene.

Kartı Uno'ya bağlamadan önce, kartında 5 V'u kaldıran bir regülatör olup olmadığına bak. Çoğu hazır breakout kartında vardır, ama çıplak çip 5 V'a dayanıklı değildir. Emin değilsen satıcının belgesine bak.

### ToF ile ultrasonik karşılaştırması
36-39. derslerdeki HC-SR04 ile VL53L0X'i genel hatlarıyla karşılaştıralım. Kesin sayılar için ikisinin de veri sayfasına bak.

| Konu | HC-SR04 (ultrasonik) | VL53L0X (ToF) |
|---|---|---|
| Ölçüm yöntemi | Ses darbesinin yankısı | Işık darbesinin yansıması |
| Bağlantı | TRIG ve ECHO için iki dijital pin, `pulseIn` | I2C (SDA ve SCL), kütüphane |
| Menzil | Daha uzun menzil sunar | Genelde daha kısa menzil |
| Hız | Ses yavaş olduğu için ölçüm yavaştır | Işık hızlı olduğu için ölçüm hızlı yapılabilir |
| Yüzey bağımlılığı | Yumuşak (kumaş, sünger) ve eğik yüzeyler sesi dağıtabilir, 38. dersteki gibi | Koyu ve parlak yüzeyler, güçlü ortam ışığı sonucu etkileyebilir |
| Işın genişliği | Geniş koni | Genelde daha dar |
| Pin sayısı | Pin harcar | İki I2C pini, diğer I2C cihazlarıyla paylaşılır |

Hangisi "daha iyi"? Soru yanlış. Büyük bir odada uzak duvarı ölçmek için ve yüzey önemli değilse ultrasonik uygun olabilir. Küçük, hızlı, dar bir açıyla ölçüm gerekiyorsa ToF uygundur. Ucuz olması ve basit olması yüzünden HC-SR04 hâlâ yaygındır.

### Devre
| Parça | Bağlantı |
|---|---|
| VL53L0X kartı | VCC → 5 V (kartın belgesine bak), GND → GND, SDA → **A4**, SCL → **A5** |
| LED + 330 Ω direnç | **D13** → direnç → LED anodu; katot → GND |

I2C adresi 0x29'dur. Emin olmak için 33. dersteki adres tarama programını çalıştırabilirsin; çıktıda 0x29 görmelisin. Başka bir I2C cihazı (örneğin LCD 0x27) aynı hatta bağlanabilir, adresleri farklıdır.

### Program
Aşağıdaki sketch'ler **Pololu VL53L0X** kütüphanesini kullanır. Başlık dosyası `#include <VL53L0X.h>`. Burada bu sketch'ler yalnız derlenir; sensörün davranışı bu derste simülatörde sınanmadı. Sonuçları kendi kartında gözlemlemelisin.

Önce en basit okuma. `readRangeContinuousMillimeters()` sürekli ölçüm modunda sonucu milimetre olarak döndürür:

```cpp
// sketch: tof_okuma
#include <Wire.h>
#include <VL53L0X.h>

VL53L0X sensor;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  sensor.setTimeout(500);               // ms
  if (!sensor.init()) {
    Serial.println("VL53L0X bulunamadi");
    while (true) {}                     // sensör yoksa burada dur
  }
  sensor.startContinuous();             // sürekli ölçüm başlat
}

void loop() {
  int mm = sensor.readRangeContinuousMillimeters();
  if (sensor.timeoutOccurred()) {
    Serial.println("Zaman asimi");
  } else {
    Serial.print(mm);
    Serial.println(" mm");
  }
  delay(100);
}
```

Şimdi bir eşik ekleyelim: bir cisim 300 mm'den yakınsa LED yansın. Eşik civarında titremesin diye 35. dersteki histerezis fikrini kullandık:

```cpp
// sketch: tof_esik
#include <Wire.h>
#include <VL53L0X.h>

VL53L0X sensor;

const int LED = 13;
const int YAKIN_MM = 300;      // bunun altında "yakın"
const int UZAK_MM = 340;       // bunun üstünde "uzak"

bool yakin = false;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Wire.begin();
  sensor.setTimeout(500);
  if (!sensor.init()) {
    Serial.println("VL53L0X bulunamadi");
    while (true) {}
  }
  sensor.startContinuous();
}

void loop() {
  int mm = sensor.readRangeContinuousMillimeters();
  if (!sensor.timeoutOccurred()) {
    if (!yakin && mm < YAKIN_MM) {
      yakin = true;
      Serial.println("Yakin");
    } else if (yakin && mm > UZAK_MM) {
      yakin = false;
      Serial.println("Uzak");
    }
  }
  digitalWrite(LED, yakin);
}
```

### Nasıl çalışıyor?
1. `Wire.begin()` I2C hattını başlatır. `sensor.init()` sensöre ulaşabilirse doğru, ulaşamazsa yanlış döner. Bağlantı hatalarını bu şekilde yakalarız.
2. `setTimeout(500)` okuma 500 ms içinde bitmezse `timeoutOccurred()` ile haber verilmesini sağlar. Okuma başarısızsa dönen sayıya güvenme; önce bu kontrolü yap.
3. `startContinuous()` sensörün art arda ölçmesini başlatır. `readRangeContinuousMillimeters()` sonucu mm cinsinden verir.
4. `tof_esik` içinde iki eşik vardır. Mesafe 300 mm'nin altına inince "yakın", 340 mm'nin üstüne çıkınca "uzak" olur. Arada kalırsa önceki durum korunur. HC-SR04 ile yaptığın medyan filtre (38. ders) burada da kullanılabilir.

### Dene
- `tof_okuma` ile elini sensörün önünde ileri geri oynat. Okuma ne kadar hızlı tepki veriyor? Aynı şeyi HC-SR04 ile yapıp farkı karşılaştır.
- Beyaz kâğıt, siyah kumaş ve parlak bir metal yüzeyi aynı uzaklıkta dene. Sonuçlar aynı mı?
- Sensörü kapalı bir kutu içine koy ve kutunun kapağını aç kapat. Mesafe değerleri ne gösteriyor?
- LCD'yi (0x27) de aynı I2C hattına bağla ve okumayı ekranda göster. İki cihaz aynı hatta çalışıyor mu?

### Sık yapılan hatalar
- SDA ve SCL kablolarını ters bağlamak: `init()` başarısız olur.
- 3,3 V mantıklı çıplak çipi 5 V'a bağlamak: kartın belgesine bakmadan bağlama.
- `timeoutOccurred()` kontrol etmemek: hatalı okumayı gerçek mesafe sanırsın.
- `delay` uzun tutmak ya da bloklayıcı kod yazmak: 27. dersteki `millis()` yöntemini kullan.
- Pololu kütüphanesi yerine başka bir VL53L0X kütüphanesinin fonksiyon adlarını kullanmak: kütüphaneler arasında adlar farklıdır.

## Konuşalım
Bir robotun önündeki engeli algılamak için HC-SR04 mi VL53L0X mi kullanırdın? Ortam açık havadaysa, yüzeyler yumuşaksa ya da robot çok hızlıysa tercihin değişir mi?
