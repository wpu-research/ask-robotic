# Besleme düşmesi ve kalibrasyon
süre: 30

## Merak
Gerçek devrelerde garip bir olay vardır: motor çalışmaya başlayınca kart kendiliğinden yeniden başlar, ya da pil zayıfladıkça sensör sayıları yavaş yavaş kayar. Kodda hiçbir şey değişmedi; değişen, sensörün **beslendiği gerilim**. Peki bunun laboratuvarda ne kadarını görebilirsin, kalanı için ne yapmalısın?

## Etkinlik
### Laboratuvarın besleme modeli
Laboratuvar besleme hakkında bazı şeyleri gerçekten modeller:
- **Sensörlerin en düşük besleme gerilimi.** HC-SR04 ve PIR gibi parçalar 4 V altında beslenirse cevap vermez. DHT, BMP280, MPU6050 gibi parçalar 3 V civarından itibaren çalışır. MQ-2 modülü 4 V ister.
- **Analog modüllerin çıkışı besleme gerilimiyle orantılıdır.** Toprak nemi, ses, alev ve MQ-2 modüllerinde AO çıkışı, VCC gerilimi çarpı bir orandır. VCC düşerse AO da düşer.
- **Uno pininin iç direnci.** Laboratuvarda bir çıkış pini yaklaşık 25 Ω'luk bir iç direnç gibi davranır; yük çektikçe pinin gerilimi 5 V'tan düşer.
- **Pin akım sınırı.** Bir pinden 40 mA'in üstünde akım geçerse laboratuvar uyarı verir.

Laboratuvar şunları **modellemez:**
- **5 V hattının çökmesi.** Uno'nun 5V ve 3V3 uçları laboratuvarda ideal kaynaktır: motor, servo ya da röle ne kadar akım çekerse çeksin gerilim düşmez.
- **Brown-out sıfırlaması.** Kart besleme düştüğü için kendini yeniden başlatmaz. (↺ Sıfırla düğmesini sen basarsın.)
- **Güç hattı gürültüsü, kondansatör etkisi, kablo direnci.**

Yani "laboratuvarda motor çalışırken kart sıfırlanmadı" cümlesi gerçek devre için hiçbir şey kanıtlamaz. Gerçekte motoru ve röleyi ayrı bir kaynaktan besleme, ortak GND, besleme hattına kondansatör gibi önlemler kodun dışındaki çözümlerdir. Laboratuvarda bu bölümde yalnızca modellenen kısımlarla çalışacağız.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Toprak nemi modülü | VCC → **5V**, GND → **GND**, AO → **A0** |

### 1) Besleme gerilimi ölçümü bozar
Toprak nemi modülünün AO çıkışı laboratuvarda `VCC × (0,9 − 0,6 × nem)` biçimindedir (nem 0-1). VCC'yi 5V'ta bırakınca kuru toprakta (nem 0) AO 4,5 V, ıslak toprakta (nem 1) 1,5 V verir. VCC'yi **3V3**'e taşırsan modül hâlâ çalışır (3 V eşiğinin üstünde), ama aynı kuru toprakta AO 3,3 × 0,9 = 2,97 V olur ve `analogRead` yaklaşık 608 gösterir. Sensör aynı, toprak aynı; sayı çok farklı.

Bu bize kalibrasyonun ilk kuralını verir: **kalibrasyon, ölçüm koşullarına bağlıdır.** Besleme gerilimi değişirse eski kalibrasyon yanlış sonuç verir.

### 2) İki nokta kalibrasyonu
Ham ADC değerini anlamlı bir birime çevirmek için iki bilinen uç ölçülür: sensör kuruyken ve ıslakken ne okuyor? Sonra `map` ile bu iki uç 0 ve 100'e eşlenir (14. ders).

1. Sensörü seçip özellik panelinden **Toprak nemi** değerini 0 yap (tamamen kuru), seri monitörde okunan `Ham` değerini yaz.
2. Toprak nemini 1 yap (tamamen ıslak), `Ham` değerini yaz.
3. Bu iki değeri kodda sabit olarak kullan.

Aşağıdaki sketch bu sabitlerle yüzde hesaplar. Sabitler laboratuvarda 5V beslemeyle okunmuştur:

```cpp
// sketch: nem_kalibrasyon
const int SENSOR = A0;
const int KURU = 921;     // nem 0 iken okunan ham değer
const int ISLAK = 307;    // nem 1 iken okunan ham değer

void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(SENSOR);
  int yuzde = map(ham, KURU, ISLAK, 0, 100);
  yuzde = constrain(yuzde, 0, 100);       // uçların dışına taşan değerleri kırp
  Serial.print("Ham=");
  Serial.print(ham);
  Serial.print(" Nem: ");
  Serial.print(yuzde);
  Serial.println("%");
  delay(500);
}
```

`KURU` büyük, `ISLAK` küçük olduğu için `map`'in ilk aralığı "ters" yazıldı: `map` ters aralıkları da doğru işler. `constrain` olmadan kuruluktan daha kuru bir değer %0'ın altına, ıslaktan daha ıslak bir değer %100'ün üstüne çıkardı. Toprak nemini 0,5 yaptığında modülün AO'su 3,0 V olur, `Ham` yaklaşık 614 okunur ve program yaklaşık %50 yazar.

Şimdi aynı sketch'in VCC'sini 3V3'e taşı (■ Dur, kabloyu çek, ▶). Toprak nemi 0,5 iken `Ham` yaklaşık 405 olur ve program neredeyse %84 yazar: kalibrasyon eski koşul için yapılmıştı. Çözüm kalibrasyonu yeni koşulda tekrarlamak ya da besleme gerilimini sabit tutmaktır.

### 3) Yük altında pin gerilimi
Uno'nun bir pinini besleme gibi kullanıp ona yük bağlarsan, iç direnç yüzünden pin gerilimi düşer. Laboratuvarda dene: D13'ü bir 220 Ω dirence, direncin öbür ucunu GND'ye bağla; programda `digitalWrite(13, HIGH)` yap. Çalışırken direnci seç: **Sanal ölçüm** direncin uçlarında yaklaşık 4,5 V ve yaklaşık 20 mA gösterir. Pinin iç direnci (yaklaşık 25 Ω) ile 220 Ω seri bağlı, 5 V ikisine bölünür: 5 × 220 / 245 ≈ 4,49 V. Direnci 47 Ω yaparsan pin gerilimi yaklaşık 3,26 V'a düşer, akım yaklaşık 69 mA olur ve laboratuvar "pin aşırı akım" uyarısı verir (sınır 40 mA).

### 4) Sensör beslenmezse ne olur? Güvenli davranış
Besleme eksik ya da düşükse sensör çoğu zaman **hata vermez, sessiz kalır.** HC-SR04'te bu, `pulseIn`'in 0 döndürmesi demektir. Aşağıdaki sketch, 0 dönünce "YOK" yazar ve LED'i söndürür; yani bilinmeyen durumda tehlikeli çıkışı **kapalı** tutar (fail-safe):

```cpp
// sketch: mesafe_veya_yok
const int TRIG = 9;
const int ECHO = 10;
const int LED = 13;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long sure = pulseIn(ECHO, HIGH, 30000);     // 30 ms'de cevap gelmezse 0 döner
  if (sure == 0) {
    Serial.println("YOK");
    digitalWrite(LED, LOW);                   // bilinmiyorsa uyarı yakma, güvenli tarafta kal
  } else {
    float cm = sure / 58.0;
    Serial.print(cm, 1);
    Serial.println(" cm");
    digitalWrite(LED, cm < 20 ? HIGH : LOW);
  }
  delay(100);
}
```

Dene: HC-SR04'ün VCC'sini 5V yerine **3V3**'e bağla. Sensör 4 V altında kaldığı için cevap vermez ve seri monitörde sürekli `YOK` görürsün. Laboratuvar bu durumda sensör üzerinde "beslenmemiş" uyarısı da gösterir. Gerçekte ise bazen sensör yarım yamalak çalışır ve tuhaf değerler verir; bu yüzden "değer makul mü?" sorusunu 74. derste ayrıca soracağız.

### Gerçek dünya bilgisi: kart neden sıfırlanır?
Mikrodenetleyicide **brown-out detector** adlı bir devre vardır: besleme belli bir eşiğin altına inince işlemciyi sıfırlar, çünkü eşiğin altında kodun güvenilir çalışması garanti değildir. Motor ya da röle çalışmaya başlarken çektiği büyük akım, zayıf bir kaynakta gerilimi bu eşiğin altına çekebilir. Belirti, motor her başladığında kartın başa dönmesidir; seri monitörde `setup()`'taki açılış mesajını tekrar tekrar görürsün. Bu kodla düzeltilen bir hata değil; ayrı güç, kondansatör ve ortak GND ile devrede çözülür. Laboratuvarda bu olay olmaz. Gerçek devrede yeniden başlamayı fark etmenin kolay yolu, `setup()` içinde bir açılış mesajı yazdırmaktır.

### Nasıl çalışıyor?
1. `nem_kalibrasyon` iki ölçülmüş ucu `map` ile 0-100'e eşler; `constrain` taşmaları keser.
2. Aynı sabitler başka bir besleme geriliminde yanlış sonuç verir, çünkü AO gerilimi VCC ile orantılıdır.
3. Pin gerilimi, iç direnç ve yük direncinin gerilim bölücüsüdür (12. ders).
4. `mesafe_veya_yok` sessiz sensörü `pulseIn` zaman aşımıyla yakalar ve çıkışı güvenli tarafta bırakır.

### Dene
- `nem_kalibrasyon` içinde toprak nemini 0'dan 1'e 0,1 adımlarla artır. Yüzde doğrusal mı artıyor?
- `KURU` ve `ISLAK` sabitlerini bilerek yanlış yaz (örneğin 800 ve 400). %0 ve %100 artık hangi toprak nemi değerlerinde görünüyor?
- `mesafe_veya_yok` içindeki `30000` zaman aşımını 3000 yap ve mesafeyi 100 cm yap. Sensör çalışıyor ama program neden "YOK" yazıyor? (İpucu: 100 cm için yankı süresi yaklaşık 5800 µs.)

### Sık yapılan hatalar
- Kalibrasyonu bir besleme koşulunda yapıp başka koşulda kullanmak.
- Uç değerleri `constrain` ile kırpmamak: yüzde 0'ın altına ya da 100'ün üstüne çıkar.
- "Laboratuvarda 5V hattı çökmedi, demek ki motoru karttan besleyebilirim" demek.
- Sensör cevap vermediğinde (`pulseIn` 0) bunu mesafe 0 sanmak ve alarmı çalıştırmak.

## Konuşalım
Bu derste besleme gerilimi değişince sensör sayılarının kaydığını gördün. Bir sensörü kalibre ettikten sonra hangi koşulların değişmediğinden emin olman gerekir? Hangilerini senin ölçüm düzeneğinde kontrol edemezsin?
