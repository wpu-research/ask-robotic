# I2C: Wire ve adres tarama
süre: 25

## Merak
Önceki derste LCD için 6 pin harcadın. Oysa pek çok sensör ve ekran yalnızca **iki telle** konuşabilir ve aynı iki telin üzerine onlarca cihaz bağlanabilir. Peki tek bir hatta bu kadar cihaz varken kart, hangisiyle konuştuğunu nasıl anlıyor?

## Etkinlik
### Devre
I2C ("ay-kare-si") hattı iki telden oluşur: **SDA** (veri) ve **SCL** (saat). Arduino Uno'da bu uçlar **A4 (SDA)** ve **A5 (SCL)** pinleridir. Her cihazın hat üzerinde **7 bitlik bir adresi** vardır. Kart, mesajın başına adresi yazar; yalnızca o adresteki cihaz cevap verir.

Bu derste LCD'nin arkasına lehimli I2C adaptör kartını (PCF8574 çipli "backpack") kullanıyoruz.

| Parça | Bağlantı |
|---|---|
| I2C LCD modülü GND | GND |
| I2C LCD modülü VCC | 5 V |
| I2C LCD modülü SDA | **A4** |
| I2C LCD modülü SCL | **A5** |

Birden çok I2C cihazı bağlarsan hepsinin SDA uçları birbirine, SCL uçları da birbirine bağlanır. Gerekli çekme dirençleri (pull-up) çoğu modülün üzerinde zaten vardır.

### Program
Önce cihazın adresini bulalım. Bu program 1'den 126'ya kadar her adrese "orada biri var mı?" diye sorar:

```cpp
// sketch: i2c_tarama
#include <Wire.h>

void setup() {
  Serial.begin(9600);
  Wire.begin();                       // kart I2C hattında "yönetici" olur
  Serial.println("I2C taraniyor...");

  int bulunan = 0;
  for (byte adres = 1; adres < 127; adres++) {
    Wire.beginTransmission(adres);    // bu adrese konuşmayı başlat
    byte hata = Wire.endTransmission();   // 0 = cihaz cevap verdi
    if (hata == 0) {
      Serial.print("Cihaz bulundu: 0x");
      if (adres < 16) Serial.print("0");
      Serial.println(adres, HEX);
      bulunan++;
    }
  }
  Serial.print("Toplam: ");
  Serial.println(bulunan);
}

void loop() {
}
```

Serial Monitor'de çoğu LCD modülü için `0x27` ya da `0x3F` göreceksin. Bu iki adres, PCF8574 ve PCF8574A çiplerinin varsayılan adresleridir. Kendi modülünün adresini bu programla öğren.

Adresi bulduktan sonra I2C LCD'yi `LiquidCrystal_I2C` kütüphanesiyle kullanırsın. Ekran bu kez yalnızca 2 telle bağlıdır:

```cpp
// sketch: i2c_lcd
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);   // adres, sütun, satır

void setup() {
  lcd.init();             // ekranı başlat
  lcd.backlight();        // arka ışığı aç
  lcd.setCursor(0, 0);
  lcd.print("I2C ile merhaba");
  lcd.setCursor(0, 1);
  lcd.print("Adres: 0x27");
}

void loop() {
}
```

### Nasıl çalışıyor?
1. `Wire.begin()` kartı I2C hattına hazırlar. Bunu `setup` içinde bir kez çağırırsın.
2. `Wire.beginTransmission(adres)` ile bir cihaza mesaj hazırlarsın. `Wire.endTransmission()` mesajı gönderir ve bir **hata kodu** döndürür. `0`, cihazın "aldım" dediği anlamına gelir; başka bir sayı cihazın cevap vermediğini gösterir.
3. Tarama programı bu hata kodundan yararlanır: 126 adrese sırayla sorar, `0` dönenleri yazdırır.
4. `Serial.println(adres, HEX)` sayıyı onaltılık (hexadecimal) yazar. `0x27` onaltılık gösterimdir: 2×16 + 7 = 39.
5. `LiquidCrystal_I2C lcd(0x27, 16, 2)` nesnesi, 0x27 adresli LCD ile konuşur. `print`, `setCursor` gibi komutlar önceki dersteki LCD ile aynıdır; farklı olan tek şey ekranın başlatılması (`lcd.init()` ve `lcd.backlight()`).
6. Aynı hatta iki cihaz aynı adrese sahipse ikisi birbirine karışır. Çoğu modülde adres, üzerindeki lehim köprüleriyle değiştirilebilir.

### Dene
- Tarama programını çalıştırırken LCD modülünü çıkar. Bulunan cihaz sayısı ne oluyor?
- Modülün adresi `0x3F` ise `LiquidCrystal_I2C lcd(0x3F, 16, 2);` yap ve ekranı yeniden dene.
- Hattın üzerine ikinci bir I2C cihazı (örneğin bir sensör modülü) ekle ve tarama programını yeniden çalıştır.

### Sık yapılan hatalar
- SDA ve SCL'yi ters bağlamak: ekran ya da tarama hiçbir şey bulamaz.
- Yanlış adres yazmak: ekran açık görünür ama yazı çıkmaz. Önce adres taraması yap.
- Ekranın arka ışığı yanıyor ama yazı yoksa kontrast ayarı (modüldeki küçük vida) bozuk olabilir.
- `lcd.init()` ve `lcd.backlight()` çağırmayı unutmak.
- 3,3 V'la çalışan bir I2C cihazı 5 V'a bağlamak: cihaz zarar görebilir. Cihazın üzerindeki çalışma gerilimini oku.

## Konuşalım
Tarama programı "0x27 adresinde bir cihaz var" dedi ama bu cihazın bir LCD mi, sensör mü olduğunu söylemedi. Bir adresten cihazın ne olduğunu anlamak için neye ihtiyacın var?
