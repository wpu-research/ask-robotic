# Kesmeler ve timer'lar
süre: 30

## Merak
Telefon çalınca ne yaparsın? Ne yapıyor olursan ol, işi bırakıp açarsın, konuşur, sonra kaldığın yerden devam edersin. Arduino da bunu yapabilir: bir pinde olay olunca çalışan kodu **hemen** durdurur, küçük bir "kesme" fonksiyonunu çalıştırır, sonra ana programa döner. `delay` içinde bile!

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| Buton | **D2** ile GND arası (`INPUT_PULLUP`) |
| LED + 330 Ω direnç | **D13** → direnç → LED anodu; katot → GND |

Arduino Uno'da yalnızca iki pin dış kesme alabilir: **D2 (INT0)** ve **D3 (INT1)**. Bu yüzden butonlarımız bu pinlerde.

### Program 1: Delay içinde bile basış sayan kesme
```cpp
// sketch: kesme_sayac
volatile unsigned int basisSayisi = 0;
volatile unsigned long sonKesme = 0;

void basildi() {                              // ISR: kesme servis rutini
  unsigned long simdi = millis();
  if (simdi - sonKesme > 50) {                // 50 ms'den sık gelen sıçramaları yok say
    basisSayisi++;
    sonKesme = simdi;
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(2, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(2), basildi, FALLING);
}

void loop() {
  delay(1000);                                // ana program "uyuyor"

  noInterrupts();                             // okurken kesme araya girmesin
  unsigned int kopya = basisSayisi;
  interrupts();

  Serial.print("Basis: ");
  Serial.println(kopya);
}
```
Bu programda `loop()` neredeyse hep `delay(1000)` içindedir; ama butona basıldığında `basildi()` yine de çalışır ve sayaç artar. 26. dersteki kaçırma sorunu yok.

### Program 2: Kısa ISR, işi loop yapsın
En iyi yöntem, ISR içinde yalnızca bir bayrak kaldırmak ve asıl işi `loop()`'a bırakmaktır:

```cpp
// sketch: kesme_bayrak
volatile bool basisVar = false;

void basildi() {
  basisVar = true;                            // yalnızca bayrağı kaldır
}

void setup() {
  Serial.begin(9600);
  pinMode(2, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(2), basildi, FALLING);
}

void loop() {
  if (basisVar) {
    basisVar = false;
    Serial.println("Kesme geldi");            // yazdırma işi burada, ISR'de değil
  }
}
```

### Program 3: Timer kesmesi ile tam 1 Hz
Kartın içindeki Timer1, `delay` ve `millis` kullanmadan düzenli aralıklarla kesme üretebilir. Aşağıdaki kod ileri düzeydir; şimdilik mantığını anlaman yeterli.

```cpp
// sketch: timer1_led
ISR(TIMER1_COMPA_vect) {                      // Timer1 eşleşme kesmesi
  digitalWrite(13, !digitalRead(13));
}

void setup() {
  pinMode(13, OUTPUT);
  noInterrupts();
  TCCR1A = 0;
  TCCR1B = 0;
  TCNT1 = 0;
  OCR1A = 31249;                              // 16 MHz / 256 = 62 500 tik/sn; 31 250 tik = 0,5 sn
  TCCR1B |= (1 << WGM12);                     // CTC modu: eşleşince sayaç sıfırlanır
  TCCR1B |= (1 << CS12);                      // bölücü 256
  TIMSK1 |= (1 << OCIE1A);                    // eşleşme kesmesini aç
  interrupts();
}

void loop() {
  // ana program burada başka işler yapabilir
}
```
LED her 0,5 saniyede değişir, yani 1 Hz yanıp söner. Timer1 pin 9 ve 10'daki `analogWrite` ile `Servo` kütüphanesinin de kullandığı bir birimdir; onlarla birlikte kullanırsan çakışır.

### Nasıl çalışıyor?
1. `attachInterrupt(digitalPinToInterrupt(2), basildi, FALLING)`: D2 pinine bir olayda `basildi` fonksiyonunu çalıştır demektir. Modlar: `FALLING` (HIGH→LOW, buton basışı), `RISING` (LOW→HIGH), `CHANGE` (her ikisi), `LOW`.
2. `digitalPinToInterrupt(2)` pin numarasını kesme numarasına çevirir; kendin sayı yazma.
3. ISR içinde ve ana program arasında paylaşılan değişkenler `volatile` olmalıdır. Bu, derleyiciye "bu değer program akışı dışında değişebilir, her seferinde belleğe bak" der. Yazmazsan derleyici değeri saklayıp güncel olmayan kopyayı kullanabilir.
4. `unsigned int` 2 bayttır ve işlemci 8 bit olduğu için iki adımda okunur. Okurken kesme gelirse yarım yamalak değer okunur. Bu yüzden `noInterrupts()` / `interrupts()` arasında kopya al.

### ISR kuralları
- **Kısa ol.** Birkaç satır; sayaç artır, bayrak kaldır.
- **`delay()` kullanma.** ISR içinde `delay` çalışmaz, program takılabilir.
- **`Serial.print` kullanma.** Yavaştır ve çıkış tamponu dolarsa program takılabilir. Yazdırmayı `loop()`'ta yap.
- **`millis()` ISR içinde ilerlemez.** Okuyabilirsin ama değeri ISR boyunca sabittir.
- Paylaşılan değişkeni `volatile` yap; birden fazla bayt ise okurken kesmeleri kapat.
- Buton sıçraması (bounce) kesmeyi birkaç kez tetikleyebilir; 1. programdaki gibi 50 ms'lik bir koruma ekle.

### Dene
- `kesme_sayac` programında `FALLING` yerine `CHANGE` yap. Bir basış sayaca kaç ekliyor? Neden?
- `kesme_bayrak` programında ISR'nin içine `Serial.println` koymak neden önerilmez? Kendi cümlelerinle anlat.
- Timer programında `OCR1A` değerini 15624 yap. LED hızı nasıl değişir? Hesapla ve doğrula.

### Sık yapılan hatalar
- `volatile` yazmamak: sayaç ana programda artmıyor gibi görünebilir.
- ISR'nin içine `delay` ya da `Serial.print` koymak.
- Kesme için D2 ya da D3 dışında bir pin kullanmak (Uno'da `attachInterrupt` yalnızca bu iki pinde çalışır).
- ISR'ye parametre vermeye çalışmak: ISR parametre almaz ve değer döndürmez.

## Konuşalım
Kesme kullanmak her zaman `millis`'ten iyi midir? Hangi durumda (hızlı bir olayı kaçırmamak gerekirse) kesme, hangi durumda `millis` yeterli olur?
