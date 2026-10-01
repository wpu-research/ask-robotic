# PWM ve analogWrite: nefes alan LED
süre: 22

## Merak
Uno'nun pinleri yalnızca iki durum bilir: 0 V ve 5 V. Peki bir LED'i "yarım parlak" yakmak ya da telefonun şarj ışığı gibi nefes aldırmak nasıl mümkün olur? Cevap, pini göz kırpmaktan hızlı açıp kapatmakta saklı.

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| LED (kırmızı) | **A** (anot) ucu → direncin 2 ucu; **K** (katot) ucu → GND |
| 330 Ω direnç | 1 ucu **D9**, 2 ucu LED'in A ucu |
| Potansiyometre (yalnız son program) | **SIG** → **A0**, **VCC** → 5V, **GND** → GND |

D9, "PWM yapabilen" pinlerden biridir. Uno'da bu pinlerin yanında `~` işareti vardır: D3, D5, D6, D9, D10, D11. Programı kod düzenleyiciye yazıp ▶ ile çalıştır; LED'in parlaklığını tuvalde izle.

### PWM nedir?
PWM (darbe genişlik modülasyonu), pini çok hızlı biçimde açıp kapatmaktır. Açık kalma süresinin tüm periyoda oranına **doluluk oranı** denir.

- Doluluk %0: pin hep LOW, LED sönük.
- Doluluk %50: pin zamanın yarısında HIGH, LED yarım parlak görünür.
- Doluluk %100: pin hep HIGH, LED tam parlak.

Uno'da `analogWrite(pin, değer)` komutu PWM üretir. Değer 0 ile 255 arasındadır ve doluluk oranı `değer / 255` olur. Ortalama gerilim yaklaşık `5 V × değer / 255` kadardır. D9, D10 ve D11'deki PWM yaklaşık 490 Hz'dir: pin saniyede yaklaşık 490 kez açılıp kapanır. Göz bu hızı seçemez, yalnızca ortalama parlaklığı görür.

| `analogWrite` değeri | Doluluk | Ortalama gerilim |
|---|---|---|
| 0 | %0 | 0 V |
| 64 | yaklaşık %25 | yaklaşık 1,25 V |
| 128 | yaklaşık %50 | yaklaşık 2,5 V |
| 192 | yaklaşık %75 | yaklaşık 3,8 V |
| 255 | %100 | 5 V |

### Program 1: Parlaklık basamakları
```cpp
// sketch: pwm_basamak
int seviye[] = {0, 64, 128, 192, 255};

void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  for (int i = 0; i < 5; i++) {
    analogWrite(9, seviye[i]);   // 0-255 arası PWM değeri
    delay(1000);
  }
}
```

### Program 2: Nefes alan LED
```cpp
// sketch: pwm_nefes
void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  for (int p = 0; p <= 255; p++) {    // yavaşça parlat
    analogWrite(9, p);
    delay(5);
  }
  for (int p = 255; p >= 0; p--) {    // yavaşça söndür
    analogWrite(9, p);
    delay(5);
  }
}
```

### Program 3: Potansiyometre ile parlaklık
Önceki haftalarda öğrendiğin `analogRead` (0-1023) ve `map` burada işe yarıyor: okuma aralığını `analogWrite` aralığına (0-255) çeviriyoruz.
```cpp
// sketch: pwm_pot
void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  int okunan = analogRead(A0);                 // 0-1023
  int parlaklik = map(okunan, 0, 1023, 0, 255);  // 0-255
  analogWrite(9, parlaklik);
  delay(10);
}
```

### Nasıl çalışıyor?
1. `analogWrite(9, 64)` pini yaklaşık %25 doluluk ile açıp kapatır. Pin gerçekten "analog" gerilim üretmez; hızlı ve düzenli açılıp kapanır.
2. Program 2'de `p` değeri 0'dan 255'e çıkar, sonra geri iner. Her adım 5 ms sürer; tam bir "nefes" yaklaşık 2,6 saniye sürer.
3. Program 3'te potansiyometre çevrildikçe `analogRead` değeri değişir, `map` onu 0-255'e ölçekler ve LED parlaklığı potu izler.
4. `analogWrite(pin, 0)` pini sürekli LOW, `analogWrite(pin, 255)` sürekli HIGH yapar. Bu iki uçta PWM dalgası oluşmaz.

### Dene
- Program 2'de `delay(5)` değerini 2 ve 15 yap. Nefes hızı nasıl değişiyor?
- Program 2'de `analogWrite(9, p * p / 255)` dene. Parlaklık artışı daha doğal görünüyor mu? Göz, parlaklığı doğrusal algılamaz; karanlıkta küçük değişimleri daha iyi fark eder.
- Direncin D9 ucundaki kabloyu D13'e taşı ve `analogWrite(13, 128)` yaz. Ne olur? (İpucu: D13'ün yanında `~` yok.)

### Sık yapılan hatalar
- PWM yapamayan bir pine `analogWrite` yazmak: o pin yalnızca LOW ya da HIGH olur, yarım parlaklık çıkmaz. Pinin yanında `~` olduğundan emin ol.
- Değeri 255'ten büyük yazmak (ör. 1023): `analogWrite` yalnızca 0-255 bekler. Potansiyometre değerini önce `map` ile çevir.
- LED'e direnç koymamak: PWM akımı sınırlamaz, direnç yine gerekir. Laboratuvar bunu modeller: dirençsiz LED için uyarı çıkar.
- LED'in yarım parlak görünmesini "gerilim düştü" diye yorumlamak: aslında pin hızlıca açılıp kapanıyor, ortalama düşüyor.

## Konuşalım
Bir LED'i saniyede 5 kez açıp kapatırsan göz bunu "yanıp sönme" olarak görür. Saniyede 490 kez açıp kapatınca neden "yarım parlak" görür? Televizyon ve ekranlar bu özelliği nasıl kullanıyor olabilir?
