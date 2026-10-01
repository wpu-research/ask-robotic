# RGB LED ve renk karıştırma
süre: 25

## Merak
Bir ekrana yakından bakarsan her noktanın kırmızı, yeşil ve mavi üç küçük ışıktan oluştuğunu görürsün. Sadece bu üç renkle sarıyı, moru, hatta beyazı nasıl elde ediyorlar? Bugün bunu laboratuvardaki RGB LED'de dene.

## Etkinlik
### Devre
Ortak katotlu RGB LED, tek kılıfın içinde kırmızı, yeşil ve mavi üç LED barındırır ve dört bacağı vardır. Üç LED'in katotları (eksi uçları) tek ortak uçta birleşir; laboratuvarda bu uç **COM** adını taşır. Parçanın özellik panelinde **Ortak uç: Ortak katot** seçili olmalıdır (varsayılan budur).

Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| RGB LED (ortak katot) | **COM** → GND |
| 330 Ω direnç (kırmızı için) | 1 ucu **D9**, 2 ucu RGB LED'in **R** ucu |
| 330 Ω direnç (yeşil için) | 1 ucu **D10**, 2 ucu RGB LED'in **G** ucu |
| 330 Ω direnç (mavi için) | 1 ucu **D11**, 2 ucu RGB LED'in **B** ucu |

Her renk ucunun kendi direnci olmalıdır. Üç pin de PWM yapabilir (D9, D10, D11), böylece her rengin parlaklığını 0-255 arasında ayrı ayrı ayarlarsın.

### Renkler nasıl karışır?
Işık karışımında renkler **toplanır**:

| Karışım | Sonuç |
|---|---|
| Kırmızı + yeşil | Sarı |
| Yeşil + mavi | Camgöbeği |
| Kırmızı + mavi | Mor (macenta) |
| Kırmızı + yeşil + mavi | Beyaz |
| Hepsi sönük | Siyah (LED sönük) |

Her kanalın değeri 0-255 olduğundan 256 × 256 × 256 yaklaşık 16,7 milyon renk tanımlanabilir. Laboratuvar da bunu modeller: mavi LED'in eşik gerilimi daha yüksek olduğundan aynı dirençle mavi kanal kırmızıdan daha sönük yanar ve "beyaz" biraz renkli görünür; bu normaldir.

### Program 1: Renk paleti
```cpp
// sketch: rgb_renkler
// sıra: kırmızı, yeşil, mavi, sarı, camgöbeği, mor, beyaz, turuncu
int kirmizi[] = {255,   0,   0, 255,   0, 255, 255, 255};
int yesil[]   = {  0, 255,   0, 255, 255,   0, 255,  80};
int mavi[]    = {  0,   0, 255,   0, 255, 255, 255,   0};

void setup() {
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  for (int i = 0; i < 8; i++) {
    analogWrite(9, kirmizi[i]);
    analogWrite(10, yesil[i]);
    analogWrite(11, mavi[i]);
    Serial.print("R=");
    Serial.print(kirmizi[i]);
    Serial.print(" G=");
    Serial.print(yesil[i]);
    Serial.print(" B=");
    Serial.println(mavi[i]);
    delay(1000);
  }
}
```

### Program 2: Gökkuşağı geçişi
Her aşamada bir renk azalırken öbürü artar.
```cpp
// sketch: rgb_gokkusagi
void setup() {
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  for (int i = 0; i <= 255; i++) {      // kırmızıdan yeşile
    analogWrite(9, 255 - i);
    analogWrite(10, i);
    analogWrite(11, 0);
    delay(10);
  }
  for (int i = 0; i <= 255; i++) {      // yeşilden maviye
    analogWrite(9, 0);
    analogWrite(10, 255 - i);
    analogWrite(11, i);
    delay(10);
  }
  for (int i = 0; i <= 255; i++) {      // maviden kırmızıya
    analogWrite(9, i);
    analogWrite(10, 0);
    analogWrite(11, 255 - i);
    delay(10);
  }
}
```

### Program 3: Rengi seri monitörden seç
Altta **Seri monitör**'ün gönderme kutusuna üç sayı yaz, örneğin `255 128 0` (turuncu), ve Enter'a bas.
```cpp
// sketch: rgb_serial
void setup() {
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    int r = Serial.parseInt();
    int g = Serial.parseInt();
    int b = Serial.parseInt();
    r = constrain(r, 0, 255);   // 255'ten büyükse 255, 0'dan küçükse 0
    g = constrain(g, 0, 255);
    b = constrain(b, 0, 255);
    delay(10);
    while (Serial.available() > 0) {   // satır sonu karakterlerini at
      Serial.read();
    }
    analogWrite(9, r);
    analogWrite(10, g);
    analogWrite(11, b);
    Serial.print("R=");
    Serial.print(r);
    Serial.print(" G=");
    Serial.print(g);
    Serial.print(" B=");
    Serial.println(b);
  }
}
```

### Nasıl çalışıyor?
1. Her renk ucu kendi PWM pininden gelir. `analogWrite(9, 255)` kırmızıyı tam açar, `analogWrite(10, 0)` yeşili kapatır.
2. Program 1'de üç dizi aynı sıra numarasıyla okunur: `kirmizi[3]`, `yesil[3]`, `mavi[3]` birlikte sarıyı verir.
3. Program 2'de her aşama 256 adımdır. Toplam parlaklık yaklaşık sabit kalır, çünkü biri azalırken öbürü artar.
4. Program 3'te `parseInt` seri tampondan bir sayı okur. `constrain` kullanıcı 300 yazsa bile değeri 255'te tutar. `parseInt` sonucunu önce bir değişkene alıyoruz; çünkü `constrain` içine doğrudan yazılan ifade birden fazla kez çalışabilir ve seriden fazladan sayı okur. Satır sonu karakterini atmasaydık sonraki `parseInt` boş yere bekler ve 0 döndürürdü.

### Dene
- Program 1'e kendi favori rengini ekle. Hangi üç sayıyı yazdın? (Dizilerin boyutunu ve `for` sınırını güncelle.)
- Program 2'de `delay(10)` değerini 3 yap. Renk geçişi nasıl değişti?
- Program 3'te `128 0 128` yaz. Hangi renk çıkar? Aynı rengi `64 0 64` ile karşılaştır.

### Sık yapılan hatalar
- COM ucunu 5V'a bağlamak: bu bağlantı ortak **anotlu** LED içindir. Ortak katotlu LED'de COM, GND'ye gider.
- Özellik panelinden **Ortak uç**'u "Ortak anot" yaparsan mantık tersine döner: COM'u 5V'a bağlamalı ve `analogWrite(pin, 255 - değer)` yazmalısın.
- Üç renk için tek direnç kullanmak: renkler birbirinin parlaklığını etkiler. Her ucun kendi direnci olsun.
- R, G ve B uçlarını karıştırmak: renkler beklediğinden farklı çıkıyorsa kabloların doğru uca (R, G, B) gittiğini kontrol et.

## Konuşalım
Bir ekranda "beyaz" gördüğünde aslında ne yanıyor? Işıkta renkler toplanırken, boyada renkler neden karıştıkça koyulaşıyor?
