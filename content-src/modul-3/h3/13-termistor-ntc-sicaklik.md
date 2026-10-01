# Termistör (NTC) ve sıcaklık hesabı
süre: 25

## Merak
Bir sıcaklık sensörü içinde sıcaklığı "bilen" bir şey yoktur. Sadece direnci değişen bir parça vardır. Peki o direnç değerinden "23,5 derece" sonucuna nasıl ulaşırız?

## Etkinlik
### NTC termistör
**NTC** (Negative Temperature Coefficient), sıcaklık arttıkça direnci **azalan** bir dirençtir. Çok kullanılan tür, 25 °C'de 10 kΩ olan "10k NTC"dir. Direncin sıcaklıkla değişimi doğrusal değildir; bir üstel eğriyi izler.

Sensörü bir gerilim bölücüyle okuruz (önceki ders). NTC, alt direnç (R2) olur; üst direnç 10 kΩ sabit dirençtir:

`Vout = 5 × R_ntc / (10 kΩ + R_ntc)`

ADC değeriyle ters çevirirsek NTC'nin direnci:

`R_ntc = 10000 × ham / (1024 − ham)`

Sıcaklık artınca NTC direnci düşer, A2'deki gerilim de düşer.

### Dirençten sıcaklığa: beta formülü
En yaygın yöntem **beta** formülüdür. Parçanın iki sayısına ihtiyaç var, ikisi de veri sayfasında yazar:

- R0: referans sıcaklıktaki direnç (bizde 25 °C'de 10 000 Ω)
- B: parçanın beta katsayısı (çok satılan 10k NTC'lerde sıklıkla 3950, ama 3435 gibi başka değerler de var; gerçek bir parçada değeri veri sayfasından okursun. Laboratuvardaki NTC 10 kΩ ve B = 3950 olarak modellenmiştir)

Sıcaklık Kelvin cinsinden T, T0 = 25 + 273,15 = 298,15 K olmak üzere:

`1/T = 1/T0 + ln(R / R0) / B`

Sonra Celsius'a çevir: `°C = T − 273,15`. `ln` doğal logaritmadır; Arduino'da `log()` fonksiyonu bunu verir.

R0 = 10 kΩ, B = 3950 için formülün verdiği değerler:

| Sıcaklık | NTC direnci |
|---|---|
| 0 °C | ≈ 33,6 kΩ |
| 25 °C | 10 kΩ |
| 50 °C | ≈ 3,59 kΩ |
| 100 °C | ≈ 0,70 kΩ |

Gerçek parçalarda bu değerler birkaç yüzde sapabilir; beta formülü yaklaşık bir modeldir ve en doğru olduğu yer 25 °C civarıdır. Laboratuvardaki NTC doğrudan bu beta modeliyle çalışır.

### Steinhart-Hart denklemi
Daha doğru model **Steinhart-Hart** denklemidir:

`1/T = A + B × ln(R) + C × (ln(R))³`

A, B, C parçaya özgü üç sayıdır. Üreticinin verdiği direnç-sıcaklık tablosundan üç nokta seçip üç bilinmeyenli denklemi çözerek bulunur. Aşağıdaki ikinci sketch bunu `setup()` içinde senin yerine yapar. Örnek olarak 0, 25 ve 50 °C noktalarını kullanır (burada R değerleri yukarıdaki tablodan alındı; gerçek bir parça için kendi veri sayfandaki üç değeri yazarsın).

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. NTC'yi seçince özellik panelinde **Sıcaklık** kaydırıcısı çıkar (-20 ile 120 °C).

| Parça | Bağlantı |
|---|---|
| NTC termistör (10 kΩ) | 1. ucu → **A2**; 2. ucu → GND |
| 10 kΩ direnç | 1. ucu → 5V; 2. ucu → **A2** |

### Program
```cpp
// sketch: ntc_sicaklik
void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(A2);
  if (ham <= 0 || ham >= 1023) {
    Serial.println("sensor hatasi");   // kopuk ya da kisa devre
  } else {
    float r = 10000.0 * ham / (1024.0 - ham);               // NTC direnci
    float tK = 1.0 / (1.0 / 298.15 + log(r / 10000.0) / 3950.0);
    float tC = tK - 273.15;
    Serial.print("R=");
    Serial.print(r, 0);
    Serial.print(" T=");
    Serial.println(tC, 1);
  }
  delay(500);
}
```

Aynı ölçümü Steinhart-Hart ile yapan sürüm:

```cpp
// sketch: ntc_steinhart
float A, B, C;

void setup() {
  Serial.begin(9600);
  // Üç nokta: (direnç, sıcaklık)  0 C, 25 C, 50 C
  float l1 = log(33620.0), l2 = log(10000.0), l3 = log(3588.0);
  float y1 = 1.0 / 273.15, y2 = 1.0 / 298.15, y3 = 1.0 / 323.15;
  float g2 = (y2 - y1) / (l2 - l1);
  float g3 = (y3 - y1) / (l3 - l1);
  C = (g3 - g2) / (l3 - l2) / (l1 + l2 + l3);
  B = g2 - C * (l1 * l1 + l1 * l2 + l2 * l2);
  A = y1 - (B + C * l1 * l1) * l1;
}

void loop() {
  int ham = analogRead(A2);
  if (ham <= 0 || ham >= 1023) {
    Serial.println("sensor hatasi");
  } else {
    float r = 10000.0 * ham / (1024.0 - ham);
    float lr = log(r);
    float tK = 1.0 / (A + B * lr + C * lr * lr * lr);
    Serial.print("R=");
    Serial.print(r, 0);
    Serial.print(" T=");
    Serial.println(tK - 273.15, 1);
  }
  delay(500);
}
```

### Nasıl çalışıyor?
1. `ham` değerinden NTC'nin direncini hesaplarız (gerilim bölücü formülünün tersi).
2. Beta formülü dirençten Kelvin sıcaklığı verir; 273,15 çıkarıp Celsius'a çeviririz.
3. `ham` 0 ya da 1023 ise bölme sıfıra gider ya da sonuç anlamsızlaşır. Bu hâller kopuk bağlantı ya da kısa devre demektir; sketch bunu `sensor hatasi` diye bildirir.
4. Steinhart-Hart sürümü, verdiğimiz üç noktadan geçen eğriyi kurar. Üç noktanın arasında beta ile aynı sonucu verir; uçlara gittikçe ikisi birbirinden ayrılabilir. Hangisinin daha doğru olduğunu parçanın veri sayfası belirler.

Gerilimlere göre beklenen sıcaklıklar (beta formülü, B = 3950):

| A2'deki gerilim | ham | Sıcaklık |
|---|---|---|
| 1,0 V | 204 | ≈ 60,0 °C |
| 1,5 V | 307 | ≈ 45,4 °C |
| 2,0 V | 409 | ≈ 34,5 °C |
| 2,5 V | 512 | 25,0 °C |
| 3,0 V | 614 | ≈ 16,2 °C |
| 4,0 V | 819 | ≈ −3,2 °C |

### Dene
- NTC'nin **Sıcaklık** kaydırıcısını 25 °C'den 45 °C'ye çek. Seri monitördeki sıcaklık hangi yönde değişiyor? A2'deki gerilim (sanal ölçüm) nasıl değişiyor?
- Sabit direncin değerini özellik panelinden 10 kΩ yerine 4,7 kΩ yap. Sketch'te hangi sayıyı değiştirmelisin? Oda sıcaklığında sonuç doğru çıkıyor mu?
- Sıcaklık 30 °C'yi aşınca D13'teki LED'i yakacak bir `if` ekle.

### Sık yapılan hatalar
- Kelvin ile Celsius'u karıştırmak: formül Kelvin verir, 273,15 çıkarmayı unutursan 298 gibi sayılar görürsün.
- `log` yerine `log10` kullanmak: formül doğal logaritma ister.
- Sabit direncin gerçek değerini kodda farklı yazmak: kodda 10000 yazıp devrede 4,7 kΩ kullanırsan sonuç kayar.
- `10000 * ham` yazmak: `int` taşar. `10000.0 *` yazarak ondalıklı hesap yap.

## Konuşalım
Sensör direnci doğrusal değişmediği için ADC değeriyle sıcaklık arasında düz bir çizgi yoktur. Bu yüzden `map()` ile ham değeri doğrudan sıcaklığa çevirmek neden iyi bir fikir olmaz?
