# RTC saat modülü
slug: rtc
parça: rtc
kategori: Sensör
özet: Fiş çekilse de gerçek tarihi ve saati tutan, I2C ile okunan saat modülü (DS3231 tipi).

## Pinler
- VCC: Besleme. Laboratuvarda Uno 5V'a bağlanır.
- GND: Toprak.
- SDA: I2C veri hattı. Uno'da A4.
- SCL: I2C saat hattı. Uno'da A5.

## Nasıl çalışır
**RTC** (Real Time Clock, gerçek zaman saati), kendi kristaliyle saniyeleri sayan ve takvimi bilen ayrı bir çiptir. Arduino ona yalnızca I2C ile sorar; sayma işi çipin kendisindedir. `millis()` kart açılınca sıfırdan başlar ve güç kesilince unutulur; RTC ise gerçek tarihi ve saati korur.

Gerçek modüllerde bir **yedek pil yuvası** vardır: ana güç kesilince saati bu pil çalıştırır. Pil yoksa ya da bittiyse saat unutulur ve yeniden kurulması gerekir. Kütüphane (RTClib) `rtc.now()` ile zamanı bir `DateTime` olarak verir, `rtc.adjust()` ile saati kurar, `rtc.lostPower()` ile saatin durup durmadığını söyler.

RTC yaz saatini ya da saat dilimini bilmez; yalnızca senin kurduğun sayıları sayar.

**İleri düzey:** DS3231 çipinin saat kristali çipin içindedir ve sıcaklığa göre kendini düzeltir; DS1307'de kristal dışarıdan takılır ve sıcaklıktan daha çok etkilenir. DS1307'de donanım alarmı yoktur. İkisi de I2C'de 0x68 adresini kullanır.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| RTC **SDA** | Uno **A4** |
| RTC **SCL** | Uno **A5** |
| RTC **VCC** | Uno **5V** |
| RTC **GND** | Uno **GND** |

Kodda `#include <RTClib.h>` ve `RTC_DS3231 rtc;` yazarsın; `rtc.begin()` modül hatta yoksa `false` döner. Laboratuvar yedek pili ve güç kesintisini modellemez: her ▶'e basışta (ya da ↺ Sıfırla'dan sonra) RTC 2026-01-01 00:00:00'dan başlar ve `lostPower()` her zaman `false` döner. Saati `rtc.adjust()` ile kurarsın.

## Tipik değerler
- I2C adresi | 0x68 | MPU6050 de varsayılan olarak 0x68 kullanır; aynı hatta ikisini bağlama
- Laboratuvar başlangıç zamanı | 2026-01-01 00:00:00 | Her çalıştırmada bu değerden başlar
- Bağlantı | SDA A4, SCL A5 | Modül 4'ün standart I2C pinleri
- Kütüphane sınıfı | RTC_DS3231 | DS1307 için RTC_DS1307

## Sık hatalar
- **`adjust(__DATE__, __TIME__)` satırını koşulsuz `setup()` içine koymak.** Kart her açıldığında saat derleme anına geri döner; yalnız `lostPower()` doğruysa ayarla.
- **MPU6050 ile RTC'yi aynı hatta bağlamak.** İkisi de 0x68 kullanır ve çakışır.
- **Saati `millis()` ile tutmaya çalışmak.** Güç kesilince `millis()` sıfırlanır, RTC kalır.
- **SDA ile SCL'yi ters bağlamak ya da VCC/GND'yi eksik bırakmak.** `rtc.begin()` false döner ve program "RTC bulunamadi" yazar.
- **Ay, gün, saat değerlerini iki haneli sanmak.** `month()` 3. ay için 3 döner; başına sıfırı kendin eklersin.

## İlgili dersler
- sensorler-ve-projeler:7:1
- sensorler-ve-projeler:7:3
- sensorler-ve-projeler:7:5
