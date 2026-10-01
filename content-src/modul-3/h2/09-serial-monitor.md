# Serial Monitor: yazdır, oku, ayrıştır
süre: 25

## Merak
Şimdiye kadar kartın içinde ne olup bittiğini yalnızca bir LED'in yanıp sönmesinden tahmin ettik. Peki kart sana doğrudan yazı yazsa? "Butona 3 kez bastın" dese? Ya sen ona bilgisayardan komut yazabilsen? Seri port bunu mümkün kılar.

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Buton | Bir ucu **D2**, öbür ucu **GND** |
| LED (kırmızı) + 330 Ω direnç | **D13** → direnç → LED anodu; katot GND |

Gerçek bir kart USB kablosuyla bilgisayara bağlıyken aynı kablo üzerinden konuşur. Laboratuvarda bu bağlantı hazırdır: alttaki **Seri monitör** kartın yazdıklarını gösterir ve senin yazdıklarını karta gönderir. ▶'e bas, program çalışırken seri monitörün giriş kutusuna yazıp gönder.

### Seri iletişim
Kart ile bilgisayar, bitleri sırayla (seri) göndererek haberleşir. İki tarafın aynı hızda konuşması gerekir. Bu hıza **baud** denir. Biz hep 9600 baud kullanacağız. Laboratuvar bunu kendisi ayarlar; gerçek bir Serial Monitor'da da aynı hızı seçmek gerekir.

```cpp
Serial.begin(9600);        // setup() içinde bir kez
Serial.print("merhaba");   // satır sonu eklemeden yazar
Serial.println("dunya");   // yazar ve alt satıra geçer
Serial.println(42);        // sayı da yazabilir
```

Not: Türkçe harfler (ç, ğ, ı, ö, ş, ü) seri monitörde bozuk görünebilir. Bu yüzden yazdırdığımız metinlerde bu harfleri kullanmıyoruz.

### Yazdır
Buton durumunu yarım saniyede bir yazdıran bir program:

```cpp
// sketch: seri_yazdir
void setup() {
  pinMode(2, INPUT_PULLUP);
  Serial.begin(9600);
  Serial.println("Hazir");
}

void loop() {
  int d = digitalRead(2);
  Serial.print("D2 = ");
  Serial.println(d);
  delay(500);
}
```

Seri monitörde `D2 = 1` satırları akar. Butonun **Basılı** özelliğini açınca ya da butona basılı tutunca `D2 = 0` olur. Basılı = LOW = 0 olduğunu artık gözünle görüyorsun.

Hata ayıklamanın en kolay yolu budur: "Kod şu noktaya geldi mi? Değişken ne değerde?" sorularına `Serial.print` ile cevap ararsın.

### Oku
Bilgisayardan gelen veri kartta bir tampona (buffer) birikir. `Serial.available()` kaç bayt beklediğini söyler, `Serial.read()` bir bayt okur.

```cpp
// sketch: seri_komut
void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {       // gelen veri var mı?
    char c = Serial.read();           // bir karakter oku
    if (c == 'A') {
      digitalWrite(13, HIGH);
      Serial.println("LED acik");
    } else if (c == 'K') {
      digitalWrite(13, LOW);
      Serial.println("LED kapali");
    } else {
      Serial.print("Bilinmeyen komut: ");
      Serial.println(c);
    }
  }
}
```

Seri monitörün giriş kutusuna `A` yazıp gönder: LED yanar. `K` gönder: söner. `char`, tek bir karakter tutan değişkendir ve tek tırnakla yazılır: `'A'`.

### Ayrıştır
Bazen gelen veri "komut + sayı" biçimindedir, örneğin `B3`: "3 kez yanıp sön". Veriyi parçalara ayırmaya **ayrıştırma** denir. `Serial.parseInt()` seri porttan gelen sıradaki sayıyı okur ve bir `int` olarak verir.

```cpp
// sketch: seri_ayristir
void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
  Serial.println("B ve bir sayi yaz, ornek: B3");
}

void loop() {
  if (Serial.available() > 0) {
    char komut = Serial.read();           // ilk karakter: komut
    if (komut == 'B') {
      int adet = Serial.parseInt();       // arkasından gelen sayi
      Serial.print("Yanip sonme: ");
      Serial.println(adet);
      for (int i = 0; i < adet; i++) {
        digitalWrite(13, HIGH);
        delay(200);
        digitalWrite(13, LOW);
        delay(200);
      }
    }
  }
}
```

Seri monitörde `B3` yazıp gönder: LED 3 kez yanıp söner. Gerçek bir Serial Monitor'da satır sonu ayarı "Yeni satır" (Newline) ise gönderdiğin yazının sonuna bir satır sonu karakteri eklenir. Program bu karakteri okur ve `B` olmadığı için yok sayar.

Birden fazla sayıyı da arka arkaya okuyabilirsin. Boşlukla ayrılmış iki sayıyı toplayalım:

```cpp
// sketch: seri_toplam
void setup() {
  Serial.begin(9600);
  Serial.println("Iki sayi yaz, ornek: 12 30");
}

void loop() {
  if (Serial.available() > 0) {
    int a = Serial.parseInt();
    int b = Serial.parseInt();
    Serial.print("Toplam: ");
    Serial.println(a + b);
  }
}
```

### Nasıl çalışıyor?
1. `Serial.begin(9600)` seri portu açar. Gerçek bir Serial Monitor'ın hızı da 9600 olmalı; yoksa ekranda anlamsız karakterler görürsün. Laboratuvar bunu kendisi eşler.
2. `Serial.print` yazar, `Serial.println` yazıp satırı bitirir.
3. `Serial.available()` okunmayı bekleyen bayt sayısını verir. `read()` her çağrıda bir bayt tüketir.
4. `parseInt()` rakam olmayan karakterleri atlar, sayı bitene kadar okur. Sayıdan sonra veri gelmezse yaklaşık bir saniye bekleyip vazgeçer. Satır sonu göndermek bu beklemeyi kısaltır.
5. Gelen veri tek seferde birden fazla bayt olabilir; `loop()` yeniden dönerken kalan baytlar tamponda bekler.

### Dene
- `seri_yazdir` programını butona her basışta değil, yalnızca durum değiştiğinde yazdıracak şekilde değiştir. (Geçen dersteki kenar fikrini kullan.)
- `seri_komut` programına `'T'` komutu ekle: LED'in o anki durumunu yazdırsın.
- `seri_ayristir` programında yanıp sönme süresini de komuttan al: `B3 500` gibi.

### Sık yapılan hatalar
- `Serial.begin` yazmamak: hiçbir şey görünmez.
- `Serial.begin`'e farklı bir hız yazmak: gerçek bir Serial Monitor'da ekran anlamsız karakterlerle dolar.
- `if (Serial.available())` yerine doğrudan `read()` çağırmak: veri yokken `-1` döner.
- `'A'` yerine `"A"` yazmak: çift tırnak metin, tek tırnak tek karakterdir. `char` ile tek tırnak kullan.
- Çok sık ve çok uzun yazdırmak: yazma yavaştır, programı yavaşlatır.

## Konuşalım
Seri port yalnızca bilgisayarla konuşmak için mi? İki Arduino kartı birbirine sadece iki kabloyla bağlansa (biri yazan, biri dinleyen) birbirine ne tür mesajlar gönderebilirdi?
