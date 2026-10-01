# Simülasyon neden yalan söyler: gürültü, bounce, güç, toprak
süre: 25

## Merak
Simülatörde kusursuz çalışan bir sayaç programı, gerçek kartta tek basışta 3 sayıyor. Ya da bir eşik programı, ışık sabitken LED'i durmadan yakıp söndürüyor. Kod aynı, kart aynı. Peki fark nereden geliyor? Cevap kodda değil: gerçek dünya, simülatörün varsayılan olarak çizmediği şeylerle dolu.

## Etkinlik
### Dürüst bir uyarı
Simülatör iyi bir antrenman sahasıdır ama gerçek devrenin yerini tutmaz. Bu derste anlatılan etkilerin (sıçrama, gürültü, gerilim düşmesi, toprak sorunu) **simülatörde kendiliğinden oluşmadığını** bil. Biz onları bu derste **elle üreteceğiz**: butona kısa sürede birkaç HIGH/LOW göndererek sıçramayı, analog girişe titreyen gerilim vererek gürültüyü taklit edeceğiz. Taklit, gerçeğin kendisi değil; ama kodunun gerçekte neye dayanması gerektiğini görmene yeter.

### Devre
| Parça | Bağlantı |
|---|---|
| Buton | Bir ucu **D2**, öbür ucu GND (`INPUT_PULLUP`) |
| Potansiyometre (ya da LDR bölücüsü) | Orta uç **A0**, uçlar 5 V ve GND |
| LED + 330 Ω direnç | **D13** → direnç → LED → GND |

### 1) Bounce: butonun sıçraması
Gerçek bir buton mekanik bir parçadır. Kontaklar birbirine değerken kısa süre titreşir ve pin, bir basışta birkaç kez HIGH/LOW arasında gidip gelir (8. derste gördüğün debounce). Aşağıdaki sayaç düşen kenarı sayar ama sıçramayı hesaba katmaz:

```cpp
// sketch: sayac_ham
const int BUTON = 2;
int sayac = 0;
bool onceki = false;

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  bool basili = (digitalRead(BUTON) == LOW);
  if (basili && !onceki) {          // basılmaya yeni geçti
    sayac++;
    Serial.print("Sayac: ");
    Serial.println(sayac);
  }
  onceki = basili;
}
```

Bu kod ideal bir butonda doğrudur. Şimdi tek basışı, gerçek butonu taklit ederek `LOW, HIGH, LOW, HIGH, LOW` diye saniyenin binde birkaçında gönderdiğimizi düşün: program 3 basış sayar. Kod hatasızdı; girdi "kirliydi".

Çözüm: pinin değişiminden sonra belli bir süre **sakin kalmasını** bekle. Pin 20 ms boyunca aynı kaldıysa değeri kabul et:

```cpp
// sketch: sayac_temiz
const int BUTON = 2;
const unsigned long SAKIN_SURE = 20;   // ms
int sayac = 0;
bool sonHam = false;
bool kararli = false;
unsigned long sonDegisim = 0;

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  bool ham = (digitalRead(BUTON) == LOW);
  if (ham != sonHam) {              // pin oynadı: sayacı sıfırla
    sonHam = ham;
    sonDegisim = millis();
  }
  if (millis() - sonDegisim >= SAKIN_SURE && ham != kararli) {
    kararli = ham;                  // yeterince sakin kaldı: kabul et
    if (kararli) {
      sayac++;
      Serial.print("Sayac: ");
      Serial.println(sayac);
    }
  }
}
```

20 ms çoğu buton için iyi bir başlangıç değerdir; kendi butonunun ne kadar sıçradığı parçaya göre değişir. Süre çok kısaysa sıçrama sızar, çok uzunsa hızlı basışları kaçırırsın.

### 2) Gürültü: eşiğin titremesi
Analog bir sensör gerçekte "2,50 V" değil, 2,47 ile 2,53 arasında oynayan bir değer verir. Kablo anten gibi çalışır, güç hattında dalgalanma vardır, ADC'nin kendisi de en küçük basamakta oynar (11. ders). Tek bir eşiğe (512) göre karar veren program, değer eşiğin yakınındayken sürekli yanlış karar verir:

```cpp
// sketch: esik_ham
const int SENSOR = A0;
const int LED = 13;
const int ESIK = 512;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, analogRead(SENSOR) > ESIK ? HIGH : LOW);
}
```

Işık yavaş yavaş artarken değer eşikten geçerken 512'nin hemen üstüne çıkıp hemen altına döner; LED birkaç kez yanıp söner. Çözüm iki eşiktir (**histerezis**, 35. derste termostatta kullandın): yanmak için 522'yi aş, sönmek için 502'nin altına in.

```cpp
// sketch: esik_histerezis
const int SENSOR = A0;
const int LED = 13;
const int ACMA = 522;
const int KAPAMA = 502;
bool yanik = false;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  int deger = analogRead(SENSOR);
  if (!yanik && deger > ACMA) yanik = true;
  if (yanik && deger < KAPAMA) yanik = false;
  digitalWrite(LED, yanik ? HIGH : LOW);
}
```

İki eşik arasındaki 20'lik boşluk, gürültünün genliğinden büyük olmalı. Gürültüyü bilmeden bu aralığı seçemezsin; bu yüzden gerçek sensörü önce bir süre `Serial`'e yazdırıp ne kadar oynadığına bakarsın. Ortalama almak (14. ders) de gürültüyü azaltır.

### 3) Güç: gerilim düşmesi (brown-out)
Röle, motor ve servo anlık olarak çok akım çeker. Güç kaynağı yetmezse ya da kablo inceyse 5 V hattı kısa süre çöker. Kartın içindeki işlemci gerilim belli bir eşiğin altına düşünce kendini **sıfırlayabilir** (brown-out). Belirtisi: motor çalışmaya başlayınca kart yeniden başlar, LCD bozulur, seri çıktıda baştan yazılan başlık satırları görürsün. Çözüm kodda değil, devrede: motoru ve röleyi ayrı güç kaynağından besle, kondansatör ekle, kalın ve kısa kablo kullan.

Kartın sık yeniden başlayıp başlamadığını görmek için basit bir araç: her açılışta EEPROM'daki bir sayacı artır ve seriye yaz. Sayı hızlı artıyorsa kart sürekli sıfırlanıyor demektir.

```cpp
// sketch: acilis_sayaci
#include <EEPROM.h>

void setup() {
  Serial.begin(9600);
  byte sayi = EEPROM.read(0);
  if (sayi == 255) sayi = 0;        // hiç yazılmamış hücre
  sayi++;
  EEPROM.update(0, sayi);
  Serial.print("Acilis no: ");
  Serial.println(sayi);
}

void loop() {
}
```

Bu araç yalnızca teşhis içindir; EEPROM'un yazma ömrü sınırlıdır (34. ders), kalıcı bırakma. Simülatörde güç kaynağı çökmediği için brown-out kendiliğinden olmaz; yeniden başlatmayı elle yaparız.

### 4) Ortak toprak (GND)
Bir sinyal yalnızca "bir referansa göre" gerilimdir. İki ayrı güç kaynağı kullanıyorsan (kart USB'den, motor pilden), **GND uçlarını birbirine bağlamazsan** kartın gördüğü "HIGH" ile motor sürücünün gördüğü "HIGH" aynı referansa göre ölçülmez. Sonuç: komut bazen çalışır bazen çalışmaz, giriş pinleri havada kalır ve rastgele değer okur. Kural: birden çok güç kaynağı varsa GND'leri birleştir, artılarını (5 V) birleştirme.

### Nasıl çalışıyor?
1. `sayac_ham` düşen kenarı her algıladığında sayar; sıçrama kenarı çoğalttığı için sayı şişer.
2. `sayac_temiz` pinin kararlı kalmasını bekler; sıçrama dizisi 20 ms içinde bittiği için tek basış sayılır.
3. `esik_ham` tek eşiğe bakar; `esik_histerezis` iki eşikle "geri dönüş yolunu" ayırır.
4. `acilis_sayaci` yeniden başlama sayısını EEPROM'da tutar; kendi başına bir hata düzeltmez, hatayı görünür kılar.

### Dene
- `sayac_temiz` içindeki `SAKIN_SURE` değerini 0 yap. Bu hâliyle program neye benziyor? Hangi derste gördüğün programla aynı davranır?
- `esik_histerezis` programında `ACMA` ve `KAPAMA` değerlerini birbirine çok yaklaştır (510 ve 514). Titreme geri geliyor mu?
- Gerçek bir buton ya da potansiyometren varsa `Serial`'e peş peşe okumaları yazdır; gerçekte kaç basamak oynuyor?

### Sık yapılan hatalar
- "Simülatörde çalıştı, bitti" demek. Sıçrama, gürültü ve güç sorunu simülatörde kendiliğinden oluşmaz; gerçek karta geçerken bunları ayrıca düşün.
- Butonu `delay(50)` ile temizlemeye çalışmak. Çalışır ama programı bekletir (26. ders); `millis()` ile yap.
- Eşiği, gürültünün genliğinden dar bir histerezis boşluğuyla seçmek.
- Motoru Arduino'nun 5 V çıkışından beslemek ve kartın neden resetlendiğini koda bakarak aramak.
- İki güç kaynağının GND'sini birleştirmeyi unutmak.

## Konuşalım
Bu derste dört bozucu etkiyi (sıçrama, gürültü, gerilim düşmesi, ortak toprak yokluğu) gördün. Birinin kodla, diğerinin devreyle çözüldüğünü fark ettin mi? Senin projende hangisi hangi gruba girer?
