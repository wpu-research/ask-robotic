# VL53L0X (I2C ToF): hassas mesafe
süre: 20

## Merak
HC-SR04 ile odanın boyunu ölçtün ama sensör bazen cismi hiç görmedi ya da yanlış yere yansıdı. İnce bir kablonun ucuna kadar yaklaşan bir parçayı ölçmek için ses yerine ışık kullanmak ister misin? Küçük bir kartın üzerinde bir ışık darbesinin gidiş-dönüş süresini ölçen bir sensör var: VL53L0X.

## Etkinlik
### ToF nedir?
ToF (Time of Flight, uçuş süresi), sensörün bir ışık darbesi gönderip yansımasının dönüş süresini ölçmesidir. VL53L0X bunu kızılötesi bir lazerle yapar ve sonucu **milimetre** cinsinden verir. Veriyi Arduino'ya **I2C** ile iletir (33. dersteki `Wire`). Varsayılan I2C adresi **0x29**'dur.

Sınırlar için sensörün veri sayfasına bak. Ölçüm aralığı, doğruluk ve ortam ışığına tepkisi **modele ve kullanım koşullarına göre değişir**.

**Önemli:** Laboratuvarda VL53L0X parçası **yok**. Bu derste devre kurmayacaksın; sensör kodunu yazıp derleyeceksin ve laboratuvarın sensörü bulamadığında programının ne yaptığını göreceksin. İyi bir program, sensör yoksa bunu fark edip haber verir.

Gerçek donanım notu: çoğu hazır breakout kartında 5 V'u düşüren bir regülatör vardır, ama çıplak çip 5 V'a dayanıklı değildir; kartın belgesine bakmak gerekir.

### ToF ile ultrasonik karşılaştırması
36-39. derslerdeki HC-SR04 ile VL53L0X'i genel hatlarıyla karşılaştıralım. Kesin sayılar için ikisinin de veri sayfasına bak.

| Konu | HC-SR04 (ultrasonik) | VL53L0X (ToF) |
|---|---|---|
| Ölçüm yöntemi | Ses darbesinin yankısı | Işık darbesinin yansıması |
| Bağlantı | TRIG ve ECHO için iki dijital pin, `pulseIn` | I2C (SDA ve SCL), kütüphane |
| Menzil | Daha uzun menzil sunar | Genelde daha kısa menzil |
| Hız | Ses yavaş olduğu için ölçüm yavaştır | Işık hızlı olduğu için ölçüm hızlı yapılabilir |
| Yüzey bağımlılığı | Yumuşak (kumaş, sünger) ve eğik yüzeyler sesi dağıtabilir, 38. dersteki gibi | Koyu ve parlak yüzeyler, güçlü ortam ışığı sonucu etkileyebilir |
| Işın genişliği | Ses konisi, yüzeye göre geniş yayılabilir | Işığın da belli bir görüş açısı vardır; açıları veri sayfalarından karşılaştır |
| Pin sayısı | Pin harcar | İki I2C pini, diğer I2C cihazlarıyla paylaşılır |

Hangisi "daha iyi"? Soru yanlış. Büyük bir odada uzak duvarı ölçmek için ve yüzey önemli değilse ultrasonik uygun olabilir. Küçük, hızlı, dar bir açıyla ölçüm gerekiyorsa ToF uygundur. Ucuz olması ve basit olması yüzünden HC-SR04 hâlâ yaygındır.

### Devre
Laboratuvarda VL53L0X parçası olmadığı için bu derste devre kurulmaz. Gerçek bir devrede bağlantı şöyle olurdu (bilgi için):

| Parça | Bağlantı |
|---|---|
| VL53L0X kartı | VCC → 5V (kartın belgesine bak), GND → GND, SDA → **A4**, SCL → **A5** |
| Direnç (330 Ω) + LED | **D13** → direnç → LED A; LED K → GND |

I2C adresi 0x29'dur. Gerçek devrede emin olmak için 33. dersteki adres tarama programı çalıştırılır; çıktıda 0x29 görünmelidir. Başka bir I2C cihazı (örneğin LCD 0x27) aynı hatta bağlanabilir, adresleri farklıdır.

### Program
Aşağıdaki sketch'ler **Pololu VL53L0X** kütüphanesini kullanır. Başlık dosyası `#include <VL53L0X.h>`. Laboratuvarda sensör parçası olmadığı için bu sketch'ler yalnız **derlenir**; ölçüm davranışı (mm değerleri, eşik geçişleri) burada doğrulanmadı. Programı ▶ ile çalıştırırsan `init()` sensörü bulamaz ve seri monitörde "VL53L0X bulunamadi" yazar; bu beklenen davranıştır ve hata kontrolünün işe yaradığını gösterir.

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
- `tof_okuma` programını laboratuvarda çalıştır. Seri monitörde ne yazıyor? `init()` kontrolünü silip çalıştırırsan ne olur? (Neden kontrolün gerekli olduğunu kendi cümlenle yaz.)
- `tof_esik` içindeki `YAKIN_MM` ve `UZAK_MM` değerlerini 200 ve 260 yap, derle. Aradaki farkın (histerezis payı) neden sıfır olmaması gerektiğini açıkla.
- Aynı eşik mantığını HC-SR04 ile (laboratuvarda Mesafe kaydırıcısıyla, 37. ders) yaz: 30 cm'den yakınsa LED yansın, 34 cm'den uzaksa sönsün. ToF kodundan farkı ne?
- Koyu ve parlak yüzeylerin ToF ölçümünü nasıl etkileyebileceğini veri sayfasından araştır ve bir cümleyle yaz.

### Sık yapılan hatalar
- SDA ve SCL kablolarını ters bağlamak (ya da sensörün hiç olmaması): `init()` başarısız olur.
- Gerçek donanımda 3,3 V mantıklı çıplak çipi 5 V'a bağlamak: kartın belgesine bakmadan bağlanmaz.
- `timeoutOccurred()` kontrol etmemek: hatalı okumayı gerçek mesafe sanırsın.
- `delay` uzun tutmak ya da bloklayıcı kod yazmak: 27. dersteki `millis()` yöntemini kullan.
- Pololu kütüphanesi yerine başka bir VL53L0X kütüphanesinin fonksiyon adlarını kullanmak: kütüphaneler arasında adlar farklıdır.

## Konuşalım
Bir robotun önündeki engeli algılamak için HC-SR04 mi VL53L0X mi kullanırdın? Ortam açık havadaysa, yüzeyler yumuşaksa ya da robot çok hızlıysa tercihin değişir mi?
