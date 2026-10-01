# Proje: Trafik ışığı
süre: 30

## Merak
Her kavşakta ışıklar belli bir düzenle yanar: kırmızıda dur, yeşilde geç, sarıda hazırlan. Aynı düzeni üç LED ve birkaç satır kodla kurabilir misin?

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| Kırmızı LED | Anot → 330 Ω → **D13**; katot → GND |
| Sarı LED | Anot → 330 Ω → **D12**; katot → GND |
| Yeşil LED | Anot → 330 Ω → **D11**; katot → GND |

Her LED'in kendi direnci olmalı. Devreyi simülatörde ya da kendi kartında kurabilirsin. Kırmızı LED için 330 Ω, 5 V'ta yaklaşık 9 mA akım verir (2. dersteki hesap gibi). Sarı ve yeşil LED'lerin gerilim düşümü biraz farklı olabilir; yine de bu direnç güvenli bir seçimdir.

### Plan
Önce ışığın sırasını bir tabloya yaz. Programı yazmadan önce planı yapmak hatayı azaltır.

| Aşama | Yanan LED | Süre |
|---|---|---|
| 1 | Kırmızı (D13) | 5 saniye |
| 2 | Yeşil (D11) | 5 saniye |
| 3 | Sarı (D12) | 2 saniye |

Sonra başa dönülür. Aynı anda yalnızca bir LED yanar.

### Program
```cpp
// sketch: trafik_isigi
void setup() {
  pinMode(13, OUTPUT);   // kırmızı
  pinMode(12, OUTPUT);   // sarı
  pinMode(11, OUTPUT);   // yeşil
}

void loop() {
  // 1. aşama: kırmızı
  digitalWrite(13, HIGH);
  digitalWrite(12, LOW);
  digitalWrite(11, LOW);
  delay(5000);

  // 2. aşama: yeşil
  digitalWrite(13, LOW);
  digitalWrite(11, HIGH);
  delay(5000);

  // 3. aşama: sarı
  digitalWrite(11, LOW);
  digitalWrite(12, HIGH);
  delay(2000);

  digitalWrite(12, LOW);
}
```

### Nasıl çalışıyor?
1. `setup()` üç pini de çıkış yapar.
2. `loop()` her aşamada önce hangi LED'lerin yanacağını belirler, sonra `delay` ile bekler.
3. Aşamalar bittiğinde sarı LED söndürülür ve `loop()` baştan başlar. Böylece kırmızı yeniden yanar.
4. Bir tam tur 5 + 5 + 2 = 12 saniye sürer.

### Diziyle yeniden yaz
Aynı projeyi `for` döngüsü ve dizi ile de kurabilirsin. Pin numaralarını bir diziye koyup `setup()` içinde döngüyle çıkış yapabilirsin. Bu, 4. derste öğrendiğin yöntemdir.

```
int ledler[] = {13, 12, 11};

void setup() {
  for (int i = 0; i < 3; i++) {
    pinMode(ledler[i], OUTPUT);
  }
}
```

### Dene
- Gerçek kavşaklarda kırmızıdan yeşile geçmeden önce kısa bir uyarı aşaması olabilir. Kırmızı ve sarıyı birlikte yakan 1 saniyelik bir aşama ekle.
- Yeşil LED'i bitmeden önce 3 kez yanıp söndür.
- Süreleri değiştir: kırmızı 3 saniye, yeşil 8 saniye. Hangi yönün trafiği daha yoğun olurdu?

### Sık yapılan hatalar
- Bir önceki aşamanın LED'ini söndürmeyi unutmak: iki LED birlikte yanar.
- LED'leri GND yerine 5 V'a bağlamak: LED yanmaz ya da ters yanar.
- Pin numarasını yanlış yazmak: kırmızı için D13 kullandıysan `digitalWrite`'ta da 13 yazmalısın.
- `delay` süresini saniye sanmak: `delay(5)` 5 saniye değil, 5 milisaniyedir.

## Konuşalım
Gerçek bir kavşakta iki yönün ışıkları birbirine bağlı çalışır. İkinci bir ışık takımı ekleseydin, kırmızı ve yeşil aşamalarını nasıl düzenlerdin? Aynı anda iki yönün yeşili yanması neden tehlikeli olurdu?
