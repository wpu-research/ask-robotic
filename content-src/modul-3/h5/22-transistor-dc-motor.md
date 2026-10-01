# Transistör ve MOSFET ile anahtarlama, DC motor
süre: 25

## Merak
Arduino pini küçük bir LED'i rahatça yakar. Aynı pine bir fan motoru bağlasan ne olur? Motor yeterince akım alamaz, hatta pine zarar verebilirsin. Peki küçücük bir pin, kendisinden çok daha güçlü bir motoru nasıl yönetir?

## Etkinlik
Bir Arduino pini en fazla yaklaşık 20 mA ile rahat çalışır; çıkış pininin kesin sınırı 40 mA'dir. Küçük bir DC motor ise çalışırken yüzlerce mA çekebilir. Çözüm: pin motoru doğrudan sürmez, bir **transistörü** açıp kapatır. Transistör, küçük bir akımla büyük bir akımı yöneten elektronik bir anahtardır.

- **NPN transistör** (örneğin 2N2222 / PN2222): Bazına küçük bir akım verirsen kolektör-emitör arası iletir. Küçük motorlar için uygundur.
- **Mantık seviyeli MOSFET** (örneğin IRLZ44N): Geçide (gate) 5 V verince tam açılır. Gerilimle çalışır, neredeyse akım çekmez ve daha güçlü yükleri sürer. Dikkat: her MOSFET 5 V ile tam açılmaz; "logic level" olanı seç.

Motor bir **bobindir**. Akımı kesince bobin bir anlığına yüksek gerilimli bir sıçrama üretir; bu sıçrama transistörü bozabilir. Bunu önlemek için motora ters yönde bir **flyback diyot** (örneğin 1N4007) takılır. Diyotun çizgili ucu (katot) motorun artı tarafına bakar.

### Devre
| Parça | Bağlantı |
|---|---|
| NPN transistör (2N2222) | Emitör → GND; kolektör → motorun eksi (-) ucu |
| 1 kΩ direnç | Bir ucu **D6**, öbür ucu transistörün bazı |
| Küçük DC motor ya da 5 V fan | Artı (+) ucu → harici 5 V kaynağın artısı; eksi ucu → transistör kolektörü |
| 1N4007 diyot | Motorun iki ucuna paralel; çizgili uç (katot) motorun artı ucuna |
| Harici kaynak (4 x AA pil kutusu ya da 5 V adaptör) | Eksi ucu Arduino **GND**'ye de bağlanır (ortak GND) |
| Potansiyometre | Orta bacak → **A0**, kenar bacaklar → 5 V ve GND |

MOSFET kullanırsan: geçit → D6 (arada 100 Ω), kaynak (source) → GND, akaç (drain) → motorun eksi ucu. Ayrıca geçit ile GND arasına 10 kΩ koy; Arduino açılırken geçit havada kalmasın.

Motoru Arduino'nun 5 V ucundan beslemek yerine harici kaynak kullan. Motor çalışırken ve durup kalkarken kartı sıfırlayabilir. Harici kaynağın GND'si ile Arduino GND'si mutlaka birleşmelidir.

### Program
İlk sketch potansiyometre ile motor hızını ayarlar. D6 bir PWM pinidir; `analogWrite` motora giden ortalama gerilimi değiştirir.

```cpp
// sketch: fan_pot
const int MOTOR = 6;        // transistörün bazına giden PWM pini

void setup() {
  pinMode(MOTOR, OUTPUT);
}

void loop() {
  int okuma = analogRead(A0);       // 0-1023
  int hiz = okuma / 4;              // 0-255
  analogWrite(MOTOR, hiz);
  delay(10);
}
```

İkinci sketch motoru yavaşça hızlandırır, bir süre tam hızda tutar, sonra yavaşça yavaşlatır. Ani kalkış yerine yumuşak kalkış, hem pili hem dişlileri korur.

```cpp
// sketch: fan_rampa
const int MOTOR = 6;

void setup() {
  pinMode(MOTOR, OUTPUT);
}

void loop() {
  for (int hiz = 0; hiz <= 255; hiz += 5) {   // hızlan
    analogWrite(MOTOR, hiz);
    delay(40);
  }
  delay(1000);                                // tam hızda bekle
  for (int hiz = 255; hiz >= 0; hiz -= 5) {   // yavaşla
    analogWrite(MOTOR, hiz);
    delay(40);
  }
  delay(1000);
}
```

### Nasıl çalışıyor?
1. `const int MOTOR = 6;` pin numarasına bir ad verir; `const` bu değerin değişmeyeceğini söyler.
2. D6 yüksek olunca baz akımı akar, transistör iletir ve motor akımı kolektör-emitör üzerinden GND'ye ulaşır. D6 düşük olunca motor durur.
3. `analogWrite(MOTOR, 128)` pini hızla açıp kapatır; doluluk oranı yaklaşık %50 olur ve motor yarım güce yakın çalışır.
4. Flyback diyot, motor akımı kesilince oluşan ters gerilimin gidebileceği bir yol açar. Böylece sıçrama transistöre zarar vermeden sönümlenir.
5. Küçük motorlar çok düşük PWM değerinde dönmeyebilir. Motorun dönmeye başladığı en küçük değeri denemekle bul. Projede bunu kullanacağız.

### Dene
- `fan_pot` ile potansiyometreyi yavaşça çevir. Hangi değerin altında motor dönmüyor?
- `fan_rampa` içinde `delay(40)` değerini büyüt. Kalkış nasıl değişiyor?
- Motoru her 3 saniyede bir tam hızda 1 saniye çalıştırıp kapatan bir program yaz.

### Sık yapılan hatalar
- Motoru doğrudan pine bağlamak: pin yetersiz kalır ve zarar görebilir.
- Ortak GND'yi unutmak: transistör kararsız çalışır ya da hiç çalışmaz.
- Flyback diyotu atlamak ya da ters takmak: transistör zamanla bozulur. Doğru bağlantıda diyot normalde akım iletmez.
- Baz direncini koymamak: baz akımı sınırsız kalır, pin ve transistör zarar görür.
- Mantık seviyeli olmayan bir MOSFET kullanmak: 5 V'ta yeterince açılmaz, ısınır ve motor güçsüz kalır.

## Konuşalım
Küçük bir pin büyük bir yükü yönetirken gücü nereden geliyor? Transistörü bir "kapı" ya da "musluk" gibi düşünürsek, musluğu çevirmek için gereken güç ile akan suyun gücü neden aynı olmak zorunda değil?
