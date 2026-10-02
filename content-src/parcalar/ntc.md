# NTC termistör
slug: ntc
parça: ntc
kategori: Girdi
özet: Sıcaklık arttıkça direnci azalan iki uçlu parça. Sabit bir dirençle bölücü kurularak ve beta formülüyle sıcaklığa çevrilir.

## Pinler
- 1: Birinci uç. Yönsüzdür; 1 ile 2 birbirinin yerine kullanılabilir.
- 2: İkinci uç.

## Nasıl çalışır
**NTC** (Negative Temperature Coefficient) termistör, sıcaklık arttıkça direnci **azalan** bir dirençtir. Yaygın tür 25 °C'de 10 kΩ'dur. Direncin sıcaklıkla değişimi doğrusal değil, üstel bir eğridir.

Sensör, 10 kΩ sabit dirençle gerilim bölücü yapılır: sabit direnç 5V ile A2 arasında, NTC A2 ile GND arasında. Sıcaklık artınca NTC küçülür, A2 gerilimi ve `analogRead(A2)` değeri **azalır**. Ham değerden NTC direnci `R = 10000.0 × ham / (1024 − ham)` ile bulunur.

**İleri düzey:** Dirençten sıcaklık için beta formülü kullanılır: `1/T = 1/T0 + log(R / R0) / B`. Burada T0 = 298,15 K, R0 = 10 kΩ, B = 3950 (laboratuvar modeli). Sonuç Kelvin'dir; Celsius için 273,15 çıkarılır. Daha doğru model Steinhart-Hart denklemidir. Gerçek bir parçanın B değeri veri sayfasından okunmalıdır.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| NTC **1** | Uno **A2** ve 10 kΩ direncin 2. ucu |
| NTC **2** | Uno **GND** |
| 10 kΩ direncin 1. ucu | Uno **5V** |

Sıcaklığı özellik panelindeki **Sıcaklık** kaydırıcısıyla (-20 ile 120 °C) çalışırken değiştirirsin. `analogRead` için `pinMode` yazman gerekmez.

## Tipik değerler
- 0 °C | ≈ 33,6 kΩ | B = 3950 modeli
- 25 °C | 10 kΩ | Referans noktası; okuma ≈ 512
- 50 °C | ≈ 3,59 kΩ | Okuma ≈ 270
- 100 °C | ≈ 0,70 kΩ | Okuma ≈ 67
- Beta katsayısı (B) | 3950 | Laboratuvar modeli; gerçek parçada değişir

## Sık hatalar
- **Kelvin ile Celsius'u karıştırmak.** Formül Kelvin verir; 273,15 çıkarmayı unutursan 298 gibi sayılar görürsün.
- **`log` yerine `log10` kullanmak.** Beta formülü doğal logaritma ister.
- **Sabit direncin değerini kodda yanlış yazmak.** Kodda 10000 yazıp devrede başka değer kullanırsan sonuç kayar.
- **`10000 * ham` yazmak.** `int` taşar; `10000.0 *` yaz.
- **ham = 0 ya da 1023'ü denetlememek.** Kopuk ya da kısa devre sensörde anlamsız sıcaklık çıkar.

## İlgili dersler
- arduino-temelleri:3:3
- arduino-temelleri:3:5
