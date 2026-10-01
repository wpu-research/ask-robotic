# Transistör ve MOSFET ile anahtarlama, DC motor
süre: 25

## Merak
Arduino pini küçük bir LED'i rahatça yakar. Aynı pine bir fan motoru bağlasan ne olur? Motor yeterince akım alamaz, hatta pine zarar verebilirsin. Peki küçücük bir pin, kendisinden çok daha güçlü bir motoru nasıl yönetir?

## Etkinlik
Bir Arduino pini en fazla yaklaşık 20 mA ile rahat çalışır; çıkış pininin kesin sınırı 40 mA'dir. Küçük bir DC motor ise çalışırken yüzlerce mA çekebilir. Çözüm: pin motoru doğrudan sürmez, bir **transistörü** açıp kapatır. Transistör, küçük bir akımla büyük bir akımı yöneten elektronik bir anahtardır.

- **NPN transistör** (örneğin 2N2222 / PN2222): Bazına küçük bir akım verirsen kolektör-emitör arası iletir. Laboratuvardaki NPN, baz-emitör arası yaklaşık 0,7 V'u aşınca iletmeye başlar ve akım kazancı yaklaşık 100'dür. Küçük motorlar için uygundur.
- **Mantık seviyeli MOSFET** (örneğin IRLZ44N): Geçide (gate) yaklaşık 2 V'un üstünde gerilim verince iletir. Gerilimle çalışır, neredeyse akım çekmez ve daha güçlü yükleri sürer. Dikkat: her MOSFET 5 V ile tam açılmaz; "logic level" olanı seç. Laboratuvardaki MOSFET mantık seviyelidir.

Motor bir **bobindir**. Akımı kesince bobin bir anlığına yüksek gerilimli bir sıçrama üretir; bu sıçrama transistörü bozabilir. Bunu önlemek için motora ters yönde bir **flyback diyot** (örneğin 1N4007) bağlanır. Diyotun çizgili ucu (katot) motorun artı tarafına bakar. Laboratuvar bunu denetler: motor transistör ya da MOSFET ile sürülüyor ama flyback diyotu yoksa (ya da ters bağlıysa) uyarı çıkar. Aynı şekilde NPN'in tabanına seri direnç koymazsan "taban akımı çok yüksek" uyarısı alırsın; taban akımı yaklaşık 30 mA'yı aşarsa sorun sayılır.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| NPN transistör | **E** (emitör) → GND; **C** (kolektör) → motorun **M2** ucu |
| 1 kΩ direnç | **1** ucu **D6**, **2** ucu transistörün **B** (baz) ucu |
| DC motor | **M1** ucu → Uno 5V; **M2** ucu → transistörün C ucu |
| Diyot | **A** (anot) → transistörün C ucu; **K** (katot, çizgili uç) → 5V (motorun artı tarafı) |
| Potansiyometre | **SIG** → **A0**, **VCC** → 5V, **GND** → GND |

MOSFET'i denemek istersen NPN yerine MOSFET ekle: **G** (geçit) → D6 (arada 100 Ω direnç), **S** (kaynak) → GND, **D** (akaç) → motorun M2 ucu. Geçit ile GND arasına 10 kΩ'luk bir direnç koy; gerçek devrelerde Arduino açılırken geçit havada kalmasın diye konur. Flyback diyodu aynı şekilde bağlanır (A → D, K → 5V).

Laboratuvarda motoru Uno'nun 5V ucundan beslersin; ayrı bir kaynak ve ortak GND bağlantısı gerekmez, çünkü tüm GND pinleri laboratuvarda aynı düğümdür. Gerçek devrede ise güçlü motoru Arduino'nun 5 V ucundan beslemek kartı sıfırlayabilir; orada ayrı bir kaynak kullanılır ve GND'ler birleştirilir. Bu ayrıntıyı unutma, ama laboratuvarda modellenmez.

**Sanal ölçüm:** ▶'e bas, motoru seç. NPN ile tam gazda motor uçlarında yaklaşık 4,2 V ve 0,4 A görürsün (5 V'tan yaklaşık 0,8 V eksik: iletirken transistör ve hat da gerilim düşürür). Motor, uçlarındaki gerilimin yaklaşık 6'da biri hızla döner (6 V'ta tam hız): bu yüzden NPN ile tam gazda hız yaklaşık 0,70, MOSFET ile yaklaşık 0,83 olur. MOSFET'te kayıp daha azdır çünkü iletirken direnci çok küçüktür.

### Program
İlk sketch potansiyometre ile motor hızını ayarlar. D6 bir PWM pinidir; `analogWrite` motora giden ortalama gerilimi değiştirir. Potansiyometrenin **Konum** özelliğini sağ panelden (çalışırken de) değiştirerek hızı ayarla.

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

İkinci sketch motoru yavaşça hızlandırır, bir süre tam hızda tutar, sonra yavaşça yavaşlatır. Ani kalkış yerine yumuşak kalkış, gerçek bir motorda hem kaynağı hem dişlileri korur.

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
5. Küçük motorlar çok düşük PWM değerinde dönmeyebilir. Gerçek motorlarda dönmeye başladığı en küçük değeri denemekle bulursun. Projede bunu kullanacağız.

### Dene
- `fan_pot` ile potansiyometre konumunu yavaşça artır. Sanal ölçümde motor gerilimi ve hızı nasıl değişiyor?
- `fan_rampa` içinde `delay(40)` değerini büyüt. Kalkış nasıl değişiyor?
- Motoru her 3 saniyede bir tam hızda 1 saniye çalıştırıp kapatan bir program yaz.
- Flyback diyodunu devreden sil ve ▶'e bas. Hangi uyarı çıkıyor? Sonra diyodu ters bağla; uyarı mesajı ne diyor?

### Sık yapılan hatalar
- Motoru doğrudan pine bağlamak: gerçek pin yetersiz kalır ve zarar görebilir. Laboratuvarda da pinden çekilebilecek akım sınırı aşılınca uyarı çıkar.
- Flyback diyotu atlamak ya da ters bağlamak: gerçek devrede transistör zamanla bozulur. Laboratuvar "flyback-missing" uyarısı verir. Doğru bağlantıda diyot normalde akım iletmez.
- Baz direncini koymamak: baz akımı sınırsız kalır; gerçek devrede pin ve transistör zarar görür, laboratuvarda "taban akımı" uyarısı çıkar.
- Mantık seviyeli olmayan bir MOSFET kullanmak: 5 V'ta yeterince açılmaz, ısınır ve motor güçsüz kalır.
- Emitörü (ya da MOSFET'in kaynağını) GND'ye bağlamamak: akım yolu tamamlanmaz, motor dönmez.

## Konuşalım
Küçük bir pin büyük bir yükü yönetirken gücü nereden geliyor? Transistörü bir "kapı" ya da "musluk" gibi düşünürsek, musluğu çevirmek için gereken güç ile akan suyun gücü neden aynı olmak zorunda değil?
