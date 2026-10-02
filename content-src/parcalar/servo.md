# Servo motor
slug: servo
parça: servo
kategori: Çıkış
özet: Kontrol sinyaline göre milini 0-180 derece arasında bir açıya getiren ve orada tutan küçük motor.

## Pinler
- SIG: Kontrol sinyali. Uno'nun bir dijital pinine (örneğin D6) gider; darbe genişliği açıyı belirler.
- VCC: Besleme. 5V'a bağlanır (laboratuvarda en az yaklaşık 4 V gerekir).
- GND: Toprak.

## Nasıl çalışır
**Servo**, bir motor, dişli ve konum geri bildirimi içeren kutudur. Her 20 ms'de gelen bir darbenin genişliği açıyı belirler. Arduino'nun `Servo` kütüphanesinde `write(0)` yaklaşık 544 µs, `write(180)` yaklaşık 2400 µs'lik darbe üretir; aradaki açılar doğrusaldır. `write(90)` yaklaşık 1472 µs verir.

Servo komutla verilen açıya kendi ulaşır ve orada kalır; bu yüzden açı için döngü yazmak gerekmez. Mekanik uçlara (0 ve 180) dayanmak servoyu zorlar; projelerde açı 10...170 gibi güvenli bir aralığa `constrain` ile sınırlanır.

**İleri düzey:** Gerçek servo yük bindirince akım çeker ve 5 V düşebilir; bu yüzden gerçek kurulumda servo ayrı bir 5 V kaynaktan beslenir ve GND'ler ortak yapılır. Laboratuvar bu gerilim düşmesini modellemez.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Servo **SIG** | Uno **D6** (ya da başka bir dijital pin) |
| Servo **VCC** | Uno **5V** |
| Servo **GND** | Uno **GND** |

Programda `#include <Servo.h>`, `servo.attach(6)` ve `servo.write(açı)` kullanılır. Laboratuvar, servonun mil açısını gelen darbe genişliğinden hesaplayıp gösterir.

## Tipik değerler
- Darbe genişliği aralığı | 544...2400 µs | Servo kütüphanesi varsayılanı
- 0° | ≈ 544 µs | Alt uç
- 90° | ≈ 1472 µs | Orta
- 70° | ≈ 1266 µs | 544 + 70/180 x 1856
- Güvenli açı aralığı | 10...170° | Projelerde önerilen sınır
- En az besleme | ≈ 4 V | Laboratuvar modeli

## Sık hatalar
- **Servoyu 5V yerine 3V3'e bağlamak.** Laboratuvarda servo çalışmaz (en az yaklaşık 4 V).
- **Açıyı mekanik uçlara kadar sürmek.** Servo zorlanır, ısınır ve ses yapar.
- **write() içine derece yerine mikrosaniye ya da radyan yazmak.** Servo beklenmedik bir açıya gider.
- **Gerçekte servoyu kartın 5 V pininden beslemek.** Yük bindirince kart sıfırlanabilir.
- **GND'yi ortak yapmamak.** Servo sinyali anlaşılmaz.

## İlgili dersler
- arduino-temelleri:5:1
- sensorler-ve-projeler:5:5
