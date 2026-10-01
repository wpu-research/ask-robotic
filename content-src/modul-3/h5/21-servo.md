# Servo: açı kontrolü
süre: 20

## Merak
Robot kolların, kamera tutucuların ve radar tarayıcıların ortak bir parçası var: servo. Bir servoya "tam 37 dereceye git" dersin, gider ve orada durur. Peki sıradan bir motor bunu neden yapamaz ve servo hangi açıya gideceğini sinyal telinden nasıl öğrenir?

## Etkinlik
Servonun içinde küçük bir motor, dişliler ve konumu ölçen bir sensör vardır. Servo, üç telinden biriyle gelen **darbe genişliğine** bakar. Darbe 20 ms'de bir tekrarlanır:

- Kısa darbe (yaklaşık 544 µs): 0 derece
- Orta darbe (yaklaşık 1472 µs): 90 derece
- Uzun darbe (yaklaşık 2400 µs): 180 derece

`Servo` kütüphanesi bu darbeleri senin yerine üretir. Sen yalnızca açıyı söylersin.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Servo | **GND** pini → Uno GND |
| | **VCC** pini → Uno 5V |
| | **SIG** (sinyal) pini → **D9** |
| Potansiyometre (ikinci sketch için) | **SIG** → **A0**, **VCC** → 5V, **GND** → GND |

Laboratuvarda servo, Uno'nun 5V ucundan beslenir; servo gücü için ayrı bir kaynak gerekmez. Servo 4 V'un altında beslenirse ya da VCC/GND bağlı değilse hareket etmez, açısı değişmez. Gerçek bir devrede küçük servolar yük altında kartın 5 V hattını zorlayabilir; laboratuvar bu etkiyi modellemez.

Çalışırken tuvaldeki servo kolunun açısını izleyebilirsin. Servo için Sanal ölçüm göstermez; ölçüm direnç, LED, motor gibi iki uçlu parçalar içindir.

### Program
İlk sketch servoyu üç konuma götürür. Kodu düzenleyiciye yaz (ya da aşağıdaki bloğu **Kopyala**), sonra ▶'e bas.

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

İkinci sketch açıyı potansiyometreyle ayarlar. `map` ile 0-1023 aralığı 0-180 dereceye çevrilir. Potansiyometrenin **Konum** özelliğini sağ panelden (çalışırken de) değiştirebilirsin.

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
- `servo_pot` sketch'inde potansiyometrenin konumunu ortaya getir. Servo 90 dereceye gidiyor mu? Gitmiyorsa potansiyometrenin SIG, VCC ve GND kablolarını kontrol et.

### Sık yapılan hatalar
- Servo gücünü D9'dan almaya çalışmak: pin yalnız sinyal verir. Güç 5V ve GND uçlarından gelir. Laboratuvarda VCC ya da GND kablosu eksikse servo hiç hareket etmez.
- SIG ile VCC kablolarını karıştırmak: sinyal 5V hattına giderse servo komut alamaz.
- `attach` yazmayı unutmak: servo hiç hareket etmez.
- Servoyu mekanik sınırının ötesine zorlamak: gerçek servoda dişliler uğultu yapar ve zarar görebilir. Bu yüzden `write` ile 0-180 aralığının dışına çıkma, tarama aralığını gerekirse daralt.

## Konuşalım
Servo neden her zaman 0 ile 180 derece arasında döner de bir DC motor gibi sürekli dönmez? Hangi projelerde "sürekli dönen" motor, hangilerinde "istediğin açıya giden" servo daha doğru olur?
