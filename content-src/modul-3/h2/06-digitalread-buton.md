# digitalRead, buton, INPUT_PULLUP
süre: 20

## Merak
Şimdiye kadar kart hep konuştu: LED'i yaktı, söndürdü. Peki kart seni nasıl dinler? Bir butona bastığını nereden anlar? Bu derste kartın "kulağı" olan `digitalRead` ile tanışacaksın. Küçük bir sürpriz de var: butona basınca pin neden LOW olur?

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Buton | Bir ucu **D2**, öbür ucu **GND** |
| İkinci buton | Bir ucu **D3**, öbür ucu **GND** |
| LED (kırmızı) + 330 Ω direnç | Direncin bir ucu **D13**, öbür ucu LED anodu; LED katodu GND |
| LED (sarı) + 330 Ω direnç | Direncin bir ucu **D12**, öbür ucu LED anodu; LED katodu GND |

Laboratuvardaki butonun iki ucu vardır (A ve B). Butonu seçip sağ panelden **Basılı** özelliğini açarsan basılmış olur; butona basılı tutarak da basabilirsin. Çalışırken de değiştirebilirsin.

Bazı gerçek butonlar ve eğim anahtarları da aynı mantıkla çalışır: iki ucu vardır, kapanınca iki ucu birleşir. Kart hepsini aynı görür. Bu derste D3'teki ikinci giriş için laboratuvardaki ikinci butonu kullan. Kodda "eğim anahtarı" diye geçen D3 girişi senin için bu ikinci butondur.

Laboratuvar etkinliğini bu sayfanın altındaki bölümde yapacaksın; ▶'e basınca program çalışır.

### Dijital giriş nedir?
Bir pin iki şekilde çalışabilir:
- `OUTPUT`: Kart pini kendisi sürer. `digitalWrite` ile HIGH ya da LOW yazarsın.
- `INPUT`: Kart pini sadece dinler. `digitalRead` ile okursun; sonuç `HIGH` ya da `LOW` gelir.

Buton basılınca pini GND'ye bağlar. Peki basılmamışken pin neyle bağlıdır? Hiçbir şeyle. Boşta kalan bir giriş pini (yüzen giriş) gerçek devrede çevreden elektrik gürültüsü toplar ve rastgele HIGH, LOW okunur. Laboratuvar bunu modeller: bağlantısız bir giriş için uyarı çıkar. Bunu önlemek için pini bir gerilime "çekmek" gerekir.

### INPUT_PULLUP
Arduino'nun her giriş pininin içinde, istersen devreye alabileceğin bir direnç vardır (yaklaşık 20-50 kΩ). Bu direnç pini 5 V'a doğru çeker. Buna **pull-up** (yukarı çekme) denir.

```cpp
pinMode(2, INPUT_PULLUP);
```

Sonuç şöyle olur:
| Buton | Pin gerilimi | digitalRead |
|---|---|---|
| Basılı değil | İç direnç 5 V'a çeker | `HIGH` (1) |
| Basılı | Buton pini GND'ye bağlar | `LOW` (0) |

Yani **basılı = LOW**. Ters gibi görünür ama bu derste bütün butonlar böyle çalışır. Dışarıdan ek direnç gerekmez, devre sade kalır.

### Program
Önce okuduğun değeri doğrudan LED'e yazalım.

```cpp
// sketch: buton_led
void setup() {
  pinMode(2, INPUT_PULLUP);   // D2 giriş, iç pull-up açık
  pinMode(13, OUTPUT);
}

void loop() {
  int durum = digitalRead(2); // HIGH (1) ya da LOW (0)
  digitalWrite(13, durum);    // okuduğunu LED'e yaz
}
```

▶'e bas ve dikkat et: LED butona basmadan yanık, basınca sönüyor. Beklediğinin tersi! Sebebi yukarıdaki tablo: basılı değilken pin HIGH, LED'e HIGH yazıyoruz.

Düzeltmek için değeri ters çevirelim. `HIGH` 1'e, `LOW` 0'a eşittir. `1 - durum` işlemi 1'i 0, 0'ı 1 yapar:

```cpp
// sketch: buton_led_duz
void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  int durum = digitalRead(2);
  digitalWrite(13, 1 - durum);  // basılıyken (0) LED'e 1 yaz
}
```

Artık basınca LED yanar. Bir sonraki derste bunu `if` ile çok daha okunaklı yazacaksın.

İki girişi birden okuyalım: D2'deki buton kırmızı LED'i, D3'teki ikinci buton sarı LED'i yaksın.

```cpp
// sketch: iki_giris
void setup() {
  pinMode(2, INPUT_PULLUP);   // buton
  pinMode(3, INPUT_PULLUP);   // eğim anahtarı
  pinMode(13, OUTPUT);        // kırmızı LED
  pinMode(12, OUTPUT);        // sarı LED
}

void loop() {
  digitalWrite(13, 1 - digitalRead(2));
  digitalWrite(12, 1 - digitalRead(3));
}
```

### Nasıl çalışıyor?
1. `pinMode(2, INPUT_PULLUP)` pini giriş yapar ve iç pull-up direncini açar.
2. `digitalRead(2)` pindeki gerilime bakar: yaklaşık 5 V ise `HIGH`, yaklaşık 0 V ise `LOW` verir.
3. `loop()` saniyede binlerce kez döner; yani kart butonu sürekli kontrol eder.
4. İkinci buton da aynı şekilde pini GND'ye bağlar; kart iki butonu ayırt edemez ve etmesine gerek de yoktur.

### Dene
- `1 - durum` yerine `durum` yaz, sonra tekrar düzelt. Hangisinde LED basılı tutarken yanıyor?
- İkinci butonun **Basılı** özelliğini aç ve kapat. Hangi durumda sarı LED yanıyor?
- `INPUT_PULLUP` yerine `INPUT` yazıp butona basmadan LED'e bak. Ne olur? (Bu bir deneydir, laboratuvarda zarar vermez. Sonra eski haline getir.)

### Sık yapılan hatalar
- `pinMode`'u yazmamak ya da `INPUT` yazıp bırakmak: pin yüzer, LED rastgele titreşir.
- Butonu pin ile 5 V arasına bağlamak: bu derste buton her zaman pin ile **GND** arasındadır.
- "Basılı = HIGH" sanmak: `INPUT_PULLUP` ile basılı olan LOW'dur.
- Butonun iki ucunu aynı düğüme (örneğin ikisini de GND'ye) bağlamak: buton hiçbir şeyi değiştirmez. Bir ucu pine, öbür ucu GND'ye gitmeli.

## Konuşalım
Boşta kalan bir pin neden rastgele değer okur? Gündelik hayattan benzer bir durum bulabilir misin (ör. kimse konuşmazken bile mikrofonda çıkan hışırtı)?
