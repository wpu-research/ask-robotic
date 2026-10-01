# delay'in tuzağı
süre: 20

## Merak
`delay()` ile LED'i yakıp söndürmek çok kolaydı. Ama LED yanıp sönerken bir butona kısa süre bassan ne olur? Kart, butona bastığını fark eder mi, yoksa o an "uyuyor" mu? Bu derste bunu deneyle göreceksin.

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| LED (kırmızı) + 330 Ω direnç | Direnç 1 ucu **D13**, direnç 2 ucu LED **A**; LED **K** → GND |
| Buton | **A** ucu **D2**, **B** ucu GND (`INPUT_PULLUP`, basılı = LOW) |

Sonra kodu `sketch.ino`'ya yazıp ▶'e bas. Direnci seçip özellik panelinden 330 Ω yap.

### Program
Aşağıdaki program LED'i 1 saniye yakıp 1 saniye söndürür. Her turun sonunda butona bakar; basılıysa sayacı artırır ve yazdırır.

```cpp
// sketch: delay_kacirir
int sayac = 0;

void setup() {
  pinMode(13, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);

  if (digitalRead(2) == LOW) {   // butona yalnızca burada bakılıyor
    sayac++;
    Serial.print("Basis sayisi: ");
    Serial.println(sayac);
  }
}
```

Şimdi LED yanarken devre tuvalindeki butona kısa bir an (0,1 saniye) tıkla; tuşa basılı tutmak için fare düğmesini bırakmadan bekle. Büyük olasılıkla Seri monitörde hiçbir şey çıkmaz. Butonu 2 saniyeden uzun basılı tutarsan ise sayılır. Laboratuvarda bunu sen yapmadan da görebilirsin: etkinlik hedefleri bu davranışı kontrol eder.

### Nasıl çalışıyor?
1. `delay(1000)` çalışırken işlemci başka hiçbir satıra geçmez; sadece sayar. Buna **bloklayan** kod denir.
2. Butona `digitalRead` ile yalnızca turun sonunda, 2 saniyede bir bakılıyor.
3. Bu iki "bakış" arasında yapılan her kısa basış kaçırılır. Kart butonu hiç görmemiştir.
4. Basış ancak tam bakış anına denk gelirse (ya da basılı tutulursa) yakalanır.

Kaç kez döndüğünü kendin de görebilirsin:

```cpp
// sketch: delay_tur_sayaci
int tur = 0;

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  tur++;
  Serial.println(tur);
  digitalWrite(13, !digitalRead(13));   // LED'in durumunu tersine çevir
  delay(1000);
}
```

`loop()` saniyede yalnızca **bir kez** çalışır. Yani kartın "gözü" saniyede bir kez açılır. İşlemci saniyede milyonlarca işlem yapabilir, ama `delay` onun neredeyse tüm zamanını boşa harcatır.

### Dene
- İlk programda LED yanarken butona kısa bas. Sayaç artıyor mu? Sonra butonu 2 saniye basılı tut ve tekrar dene.
- `delay(1000)` değerlerini `delay(100)` yap. Kısa basışlar artık daha sık yakalanıyor mu? LED hâlâ 1 saniyede bir yanıp sönüyor mu?
- Bir LED'i her 1000 ms'de, ikinci LED'i her 300 ms'de yanıp söndürmeyi yalnızca `delay` ile yapmaya çalış. Neden zor olduğunu açıkla.

### Sık yapılan hatalar
- "Buton bozuk" sanmak: Buton parçası sağlam; program basışı görmüyor.
- Çözümü `delay` süresini küçültmekte aramak: Basışlar biraz daha sık yakalanır ama sorun bitmez, LED'in zamanlaması da bozulur.
- Seri porta çok yazı yazdırıp `delay` ile yavaşlatmak: Bu da kartı bloklar.

## Konuşalım
Bir robotun hem motorunu sürmesi hem de engel butonuna bakması gerekiyor. `delay` kullanırsa ne olur? Sence bekleme işini `delay` olmadan nasıl yapabiliriz?
