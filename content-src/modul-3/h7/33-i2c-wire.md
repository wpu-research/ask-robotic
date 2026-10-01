# I2C: Wire ve adres tarama
süre: 25

## Merak
Önceki derste LCD için 6 pin harcadın. Oysa pek çok sensör ve ekran yalnızca **iki telle** konuşabilir ve aynı iki telin üzerine onlarca cihaz bağlanabilir. Peki tek bir hatta bu kadar cihaz varken kart, hangisiyle konuştuğunu nasıl anlıyor?

## Etkinlik
### Devre
I2C ("ay-kare-si") hattı iki telden oluşur: **SDA** (veri) ve **SCL** (saat). Arduino Uno'da bu uçlar **A4 (SDA)** ve **A5 (SCL)** pinleridir. Her cihazın hat üzerinde **7 bitlik bir adresi** vardır. Kart, mesajın başına adresi yazar; yalnızca o adresteki cihaz cevap verir.

Bu derste laboratuvardaki **I2C LCD** parçasını (`lcdI2c`) kullanıyoruz: 16x2 ekranın arkasında PCF8574 çipli bir adaptör ("backpack") bulunur ve ekran yalnızca 4 uçla bağlanır.

Parçayı laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| I2C LCD GND | GND |
| I2C LCD VCC | 5V |
| I2C LCD SDA | **A4** |
| I2C LCD SCL | **A5** |

Laboratuvar I2C LCD'yi şöyle modeller: SDA doğrudan A4'e, SCL doğrudan A5'e bağlı olmalı; VCC ve GND de tamam olmalı (eksikse "beslenmemiş" uyarısı çıkar). Parçayı seçince sağ panelde **I2C adresi** özelliği çıkar (0x27 ya da 0x3F). Kodda yazdığın adres bununla aynı olmazsa ekran cevap vermez.

Gerçek devrede birden çok I2C cihazının SDA uçları birbirine, SCL uçları da birbirine bağlanır; çekme dirençleri (pull-up) çoğu modülün üzerinde hazırdır. Laboratuvarda bu ayrıntıyı sen kurmazsın.

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

Seri monitörde çoğu LCD modülü için `0x27` ya da `0x3F` göreceksin. Bu iki adres, PCF8574 ve PCF8574A çiplerinin varsayılan adresleridir. Laboratuvarda LCD parçasının **I2C adresi** özelliğini değiştirip taramayı yeniden çalıştırarak farkı gör.

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
5. `LiquidCrystal_I2C lcd(0x27, 16, 2)` nesnesi, 0x27 adresli LCD ile konuşur. `print`, `setCursor` gibi komutlar önceki dersteki LCD ile aynıdır; farklı olan tek şey ekranın başlatılması (`lcd.init()` ve `lcd.backlight()`). `lcd.init()` içinde yaklaşık 1 saniyelik bir bekleme vardır; bu yüzden ▶'e bastıktan sonra yazının görünmesi 1,5 saniye kadar sürer. Biraz bekle.
6. Aynı hatta iki cihaz aynı adrese sahipse ikisi birbirine karışır. Gerçek modüllerde adres, üzerindeki küçük köprülerle değiştirilebilir; laboratuvarda bunu özellik panelinden yaparsın.

### Dene
- Tarama programını çalıştırırken LCD'nin SDA kablosunu sil ya da LCD'yi tuvalden kaldır. Bulunan cihaz sayısı ne oluyor?
- LCD'nin **I2C adresi** özelliğini 0x3F yap. Tarama programı ne gösteriyor? Ekran programında adresi `LiquidCrystal_I2C lcd(0x3F, 16, 2);` olarak değiştirip ekranı yeniden dene.
- Adres özelliği 0x3F iken kodda 0x27 bırak. Ekranda ne oluyor?
- SDA ve SCL kablolarını (A4 ile A5'i) çaprazla. Ekran ve tarama ne yapıyor?

### Sık yapılan hatalar
- SDA ve SCL'yi ters bağlamak: ekran ya da tarama hiçbir şey bulamaz.
- Yanlış adres yazmak: ekranda yazı çıkmaz. Önce adres taraması yap.
- Yazı geç görünüyorsa program takılmış değildir: `lcd.init()` yaklaşık 1 saniye bekler, ▶'ten sonra birkaç saniye bekle.
- SDA ya da SCL'yi A4 ve A5 dışındaki bir pine bağlamak: Uno'nun donanımsal I2C'si yalnız bu iki pindedir.
- VCC ya da GND'yi bağlamayı unutmak: laboratuvar "beslenmemiş" uyarısı verir, ekran cevap vermez.
- `lcd.init()` ve `lcd.backlight()` çağırmayı unutmak.
- Gerçek dünyada 3,3 V ile çalışan bir I2C cihazını 5 V hatta bağlamak cihaza zarar verebilir; çalışma gerilimi cihazın üzerinde yazar.

## Konuşalım
Tarama programı "0x27 adresinde bir cihaz var" dedi ama bu cihazın bir LCD mi, sensör mü olduğunu söylemedi. Bir adresten cihazın ne olduğunu anlamak için neye ihtiyacın var?
