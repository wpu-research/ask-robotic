# I2C LCD 16x2
slug: lcdI2c
parça: lcdI2c
kategori: Çıkış
özet: 16 karakterlik iki satırı yalnız iki veri teliyle (SDA ve SCL) yazan, arkasında I2C genişletici bulunan LCD ekran.

## Pinler
- GND: Toprak. Uno GND'ye bağlanır.
- VCC: Besleme. Uno 5V'a bağlanır.
- SDA: I2C veri hattı. Uno'da A4'e bağlanır.
- SCL: I2C saat hattı. Uno'da A5'e bağlanır.

## Nasıl çalışır
Paralel bir LCD çok pin ister. I2C LCD'nin arkasındaki küçük kart (PCF8574 genişletici) bu pinleri üstlenir; Arduino ekranla yalnız iki telden, SDA ve SCL üzerinden konuşur. Her I2C cihazının hatta 7 bitlik bir adresi vardır ve kart yalnız o adrese yazılan mesajlara cevap verir. Ekran 16 sütun ve 2 satırdır; yani en çok 32 karakter gösterir.

**İleri düzey:** Yaygın kartlarda adres 0x27'dir (PCF8574); bazılarında 0x3F olur (PCF8574A). Kodda yazdığın adres ekranınkiyle aynı olmazsa ekran cevap vermez. Adresi bulmak için I2C tarama programı çalıştırılır. Yerleşik karakter tablosunda Türkçe harfler (ç, ş, ğ, ı) bulunmaz.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| LCD **SDA** | Uno **A4** |
| LCD **SCL** | Uno **A5** |
| LCD **VCC** | Uno **5V** |
| LCD **GND** | Uno **GND** |

Özellik panelindeki **I2C adresi** alanından 0x27 ya da 0x3F seçilir (varsayılan 0x27). VCC ve GND eksikse "beslenmemiş" uyarısı çıkar. Programda `lcd.init()` ve `lcd.backlight()` çağrılmalıdır; `init()` içinde yaklaşık 1 saniyelik bekleme olduğundan yazı ▶'ten sonra biraz gecikmeyle görünür.

## Tipik değerler
- Ekran boyutu | 16 × 2 | 16 sütun, 2 satır
- Varsayılan adres | 0x27 | Bazı kartlarda 0x3F
- SDA pini | A4 | Uno donanımsal I2C
- SCL pini | A5 | Uno donanımsal I2C
- Besleme | 5 V | Laboratuvarda VCC ve GND bağlı olmalı

## Sık hatalar
- **Adres uyuşmazlığı.** Özellik panelinde 0x3F iken kodda 0x27 yazılırsa ekran boş kalır. Tarama programıyla adresi doğrula.
- **SDA ve SCL'yi çaprazlamak.** Ekran ve tarama hiç cihaz bulamaz.
- **A4 ve A5 dışındaki pine bağlamak.** Uno'nun donanımsal I2C'si yalnız bu iki pindedir.
- **`init()` ve `backlight()` çağırmamak.** Ekran başlamaz ya da arka ışık yanmaz.
- **Her turda bütün ekranı yeniden yazmak.** Hat gereksiz yere meşgul olur; yalnız değişen satırı yaz.

## İlgili dersler
- arduino-temelleri:7:2
- arduino-temelleri:7:3
- sensorler-ve-projeler:6:5
