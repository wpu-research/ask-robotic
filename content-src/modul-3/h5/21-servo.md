# Servo: açı kontrolü
süre: 20

## Merak
Robot kolların, kamera tutucuların ve radar tarayıcıların ortak bir parçası var: servo. Bir servoya "tam 37 dereceye git" dersin, gider ve orada durur. Peki sıradan bir motor bunu neden yapamaz ve servo hangi açıya gideceğini kablodan nasıl öğrenir?

## Etkinlik
Servonun içinde küçük bir motor, dişliler ve konumu ölçen bir sensör vardır. Servo, üç telinden biriyle gelen **darbe genişliğine** bakar. Darbe 20 ms'de bir tekrarlanır:

- Kısa darbe (yaklaşık 544 µs): 0 derece
- Orta darbe (yaklaşık 1472 µs): 90 derece
- Uzun darbe (yaklaşık 2400 µs): 180 derece

`Servo` kütüphanesi bu darbeleri senin yerine üretir. Sen yalnızca açıyı söylersin.

### Devre
| Parça | Bağlantı |
|---|---|
| Küçük servo (SG90 gibi) | Kahverengi/siyah tel → GND |
| | Kırmızı tel → 5 V |
| | Turuncu/sarı tel (sinyal) → **D9** |
| Potansiyometre (ikinci sketch için) | Orta bacak → **A0**, kenar bacaklar → 5 V ve GND |

Servo yük altında fazla akım çekebilir. Küçük bir servoyu denemek için kartın 5 V ucu yeterlidir, ama servo titriyor ya da kart sürekli sıfırlanıyorsa servoyu ayrı bir 5 V kaynaktan besle ve kaynağın GND'sini Arduino GND'sine bağla.

### Program
İlk sketch servoyu üç konuma götürür.

```cpp
// sketch: servo_uc_nokta
#include <Servo.h>

Servo servom;               // bir servo nesnesi oluştur

void setup() {
  servom.attach(9);         // servo sinyal teli D9'a bağlı
}

void loop() {
  servom.write(0);          // 0 dereceye git
  delay(1000);
  servom.write(90);         // 90 dereceye git
  delay(1000);
  servom.write(180);        // 180 dereceye git
  delay(1000);
}
```

İkinci sketch açıyı potansiyometreyle ayarlar. `map` ile 0-1023 aralığı 0-180 dereceye çevrilir.

```cpp
// sketch: servo_pot
#include <Servo.h>

Servo servom;

void setup() {
  servom.attach(9);
}

void loop() {
  int okuma = analogRead(A0);              // 0-1023
  int aci = map(okuma, 0, 1023, 0, 180);   // 0-180 derece
  servom.write(aci);
  delay(15);                               // servonun gitmesi için kısa bekleme
}
```

Üçüncü sketch servoyu 0'dan 180'e, sonra geri tarattırır. Bu, projede kullanacağımız "tarayıcı" hareketinin temelidir.

```cpp
// sketch: servo_tarama
#include <Servo.h>

Servo servom;

void setup() {
  servom.attach(9);
}

void loop() {
  for (int aci = 0; aci <= 180; aci++) {   // ileri tara
    servom.write(aci);
    delay(15);
  }
  for (int aci = 180; aci >= 0; aci--) {   // geri tara
    servom.write(aci);
    delay(15);
  }
}
```

### Nasıl çalışıyor?
1. `#include <Servo.h>` servo kütüphanesini programa ekler. `Servo servom;` bir servo nesnesi tanımlar.
2. `attach(9)` servoyu D9'a bağlar ve 20 ms'lik darbe üretimini başlatır.
3. `write(aci)` açıyı 0-180 arasında verirsin. Kütüphane bunu 544-2400 µs arası bir darbeye çevirir; 90 derece yaklaşık 1472 µs eder.
4. Servo hemen ışınlanmaz, dönmek zaman alır. Bu yüzden her adımdan sonra `delay(15)` bekleriz. Yavaş tarama için bekleme büyütülür, hızlı tarama için küçültülür.
5. Servo kütüphanesi D9 ve D10'daki `analogWrite` (PWM) özelliğini kapatır. Servo kullandığın programda bu iki pinden PWM çıkışı bekleme.

### Dene
- `servo_tarama` içinde `delay(15)` değerini 5 ve sonra 40 yap. Tarama hızı nasıl değişiyor?
- Taramayı yalnızca 30 ile 150 derece arasında yap.
- `servo_pot` sketch'inde potansiyometre ortadayken servo 90 dereceye gidiyor mu? Gitmiyorsa potansiyometrenin uçlarını kontrol et.

### Sık yapılan hatalar
- Servo gücünü D9'dan almaya çalışmak: pin yalnız sinyal verir. Güç 5 V ve GND uçlarından gelir.
- Servo tellerini ters takmak: kahverengi/siyah GND, kırmızı 5 V olmalı.
- Servo ve kart GND'lerini birleştirmemek (ayrı kaynak kullanırken): sinyal anlaşılmaz, servo titrer.
- `attach` yazmayı unutmak: servo hiç hareket etmez.
- Servoyu mekanik sınırının ötesine zorlamak: dişliler uğultu yapar, zarar görebilir. Böyle bir ses duyarsan açıyı daralt.

## Konuşalım
Servo neden her zaman 0 ile 180 derece arasında döner de bir DC motor gibi sürekli dönmez? Hangi projelerde "sürekli dönen" motor, hangilerinde "istediğin açıya giden" servo daha doğru olur?
