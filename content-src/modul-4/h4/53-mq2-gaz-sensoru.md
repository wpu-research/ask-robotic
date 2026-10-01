# MQ-2 gaz sensörü: ısınma ve kalibrasyon
süre: 25

## Merak
Mutfaktaki gaz kaçağı alarmı sessizce bekler, ama bir gün öter. Peki alarm "kaç ppm gaz var" diye mi karar verir? Çoğu ucuz sensörde hayır: sadece "temiz havaya göre değer çok arttı" der. Bu derste MQ-2 gaz sensörünün neden önce ısınması gerektiğini, temiz havada nasıl ölçüm yapıp **baz değer** bulacağını ve bu değere göre nasıl alarm vereceğini öğreneceksin.

## Etkinlik
### Güvenlik notu
- Gaz kaçağı ve yanıcı gazlar tehlikelidir. Bu derste gaz yoktur: gaz artışını laboratuvarda MQ-2'nin **Gaz düzeyi** özelliğiyle taklit edeceksin.
- Gerçek MQ-2'nin içinde bir ısıtıcı vardır; çalışırken sıcak olur.
- Bu devre, sertifikalı bir gaz ya da duman dedektörünün yerini **tutmaz**. Eğitim amaçlıdır.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| MQ-2 gaz sensörü modülü | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A3** (**DO** boş kalır) |
| Direnç (330 Ω) + LED (durum) | **D12** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |
| Direnç (330 Ω) + LED (alarm) | **D13** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |

MQ-2 modülünü 5 V'a bağla; laboratuvarda 3,3 V'a bağlarsan modül beslenmemiş sayılır (gerçek MQ-2'nin ısıtıcısı da 5 V ister). Çoğu MQ-2 modülünde gaz arttıkça analog çıkış gerilimi de artar; laboratuvardaki modül de böyledir. MQ-2 yanıcı gazlara ve dumana duyarlıdır ama hangi gaz olduğunu **ayırt edemez**.

Laboratuvarda **Gaz düzeyi** özelliği 0 (temiz hava) ile 1 arasındadır ve çalışırken değiştirilebilir. Bu modülde AO gerilimi 5 V × (0,1 + 0,9 × düzey) olur:

| Gaz düzeyi | 0 | 0,03 | 0,1 | 0,3 | 1 |
|---|---|---|---|---|---|
| `analogRead(A3)` | 102 | 130 | 194 | 379 | 1023 |

### Isınma ve kalibrasyon
MQ-2'nin ısıtıcısı sensör elemanını çalışma sıcaklığına getirir. Soğukken ya da yeni açıldığında okumalar kararsızdır ve yavaş yavaş oturur. İlk kullanımda ve uzun süre kapalı kaldıktan sonra bu süre **uzundur**; ne kadar olduğu modüle ve üreticiye göre değişir, kendi veri sayfana bak. Bu derste laboratuvarda beklememek için **5 saniye** kullanıyoruz; gerçek bir devrede bu süre çok daha uzun olmalıdır. Laboratuvardaki MQ-2 ısınma etkisini modellemez (okumalar baştan kararlıdır); ısınma beklemesini yine de kodda yazarız, çünkü gerçek modül öyle davranır.

Isındıktan sonra **temiz havada** (laboratuvarda Gaz düzeyi 0 iken, yani `analogRead` yaklaşık 102) bir ölçüm alırsın: bu senin **baz** değerindir. Baz değer ortamdan ortama, modülden modüle ve zamanla değişir. Bu yüzden alarm için sabit bir sayı yerine **baz değere göre** bir eşik kullanırız (örneğin bazın 1,5 katı).

ppm (milyonda bir) gibi bir birime çevirmek için veri sayfasındaki eğri, gazın türü ve sensörün kalibrasyon bilgisi gerekir. Bunlar olmadan ortaya çıkan sayı güvenilir değildir. Bu yüzden derslerde **ppm yazmıyoruz**; sadece "temiz havadaki değerin kaç katı" diye bakıyoruz.

### Program 1: ısın ve baz ölç
LED (D12) ısınırken yanıp söner. Isınma bitince sensör 32 kez ölçülür ve ortalaması baz olur.

```cpp
// sketch: mq2_isinma_baz
const int GAZ = A3;
const int DURUM_LED = 12;
const unsigned long ISINMA_MS = 5000;   // ders için kısa; gerçekte çok daha uzun

int baz;
unsigned long sonYazma = 0;

int bazOlc() {
  long toplam = 0;
  for (int i = 0; i < 32; i++) {
    toplam += analogRead(GAZ);
    delay(20);
  }
  return toplam / 32;
}

void setup() {
  pinMode(DURUM_LED, OUTPUT);
  Serial.begin(9600);

  Serial.println("Isiniyor...");
  while (millis() < ISINMA_MS) {
    digitalWrite(DURUM_LED, (millis() / 250) % 2);   // yanıp söner
  }
  digitalWrite(DURUM_LED, LOW);

  baz = bazOlc();
  Serial.print("baz=");
  Serial.println(baz);
}

void loop() {
  if (millis() - sonYazma >= 500) {
    sonYazma = millis();
    int okuma = analogRead(GAZ);
    Serial.print("okuma=");
    Serial.print(okuma);
    Serial.print(" fark=");
    Serial.println(okuma - baz);
  }
}
```

### Program 2: baz değere göre alarm
Alarm, okumanın bazın **kaç katı** olduğuna bakar. 51. dersteki gibi iki eşik kullanırız: oran 1,5'e çıkınca alarm başlar, ancak 1,2'nin altına inince biter. Okumayı ayrıca yumuşatırız (14. ders): her 50 ms'de bir örnek alınır ve eski ortalamayla karıştırılır. Böylece tek bir sıçrama alarm vermez.

```cpp
// sketch: mq2_bagil_alarm
const int GAZ = A3;
const int DURUM_LED = 12;
const int ALARM_LED = 13;
const unsigned long ISINMA_MS = 5000;
const float ALARM_ORAN = 1.5;   // bazın 1,5 katı: alarm başlar
const float BIRAK_ORAN = 1.2;   // bazın 1,2 katının altı: alarm biter

float baz;
float ort;
bool alarm = false;
unsigned long sonOrnek = 0;
unsigned long sonYazma = 0;

float bazOlc() {
  long toplam = 0;
  for (int i = 0; i < 32; i++) {
    toplam += analogRead(GAZ);
    delay(20);
  }
  return toplam / 32.0;
}

void setup() {
  pinMode(DURUM_LED, OUTPUT);
  pinMode(ALARM_LED, OUTPUT);
  Serial.begin(9600);

  while (millis() < ISINMA_MS) {
    digitalWrite(DURUM_LED, (millis() / 250) % 2);
  }
  digitalWrite(DURUM_LED, LOW);

  baz = bazOlc();
  if (baz < 20) baz = 20;   // çok küçük baz, oranı anlamsız büyütür
  ort = baz;
  Serial.print("baz=");
  Serial.println(baz, 0);
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonOrnek >= 50) {
    sonOrnek = simdi;
    ort = 0.8 * ort + 0.2 * analogRead(GAZ);
    float oran = ort / baz;

    if (!alarm && oran >= ALARM_ORAN) {
      alarm = true;
    } else if (alarm && oran < BIRAK_ORAN) {
      alarm = false;
    }
    digitalWrite(ALARM_LED, alarm);
  }

  if (simdi - sonYazma >= 500) {
    sonYazma = simdi;
    Serial.print("oran=");
    Serial.print(ort / baz, 2);
    Serial.print(" alarm=");
    Serial.println(alarm ? 1 : 0);
  }
}
```

### Nasıl çalışıyor?
1. `ISINMA_MS` dolana kadar program hiçbir ölçüm kullanmaz; yalnızca durum LED'i yanıp söner.
2. Isınmadan sonra 32 ölçümün ortalaması `baz` olur. Bu sırada ortamda gaz, duman ya da alkol buharı **olmamalıdır** (laboratuvarda Gaz düzeyi 0 kalmalı).
3. `ort`, eski ortalamanın %80'i ile yeni okumanın %20'sinin toplamıdır. Okuma bir anda artsa bile `ort` birkaç örnekte yükselir.
4. `oran = ort / baz` bazın kaç katı olduğunu söyler. 1,0 temiz hava demektir; 2,0 ise değerin iki katına çıktığı.
5. İki eşik alarmı kararlı tutar: oran 1,2 ile 1,5 arasındayken alarm durumu değişmez.
6. `baz < 20` kontrolü, baz çok küçükse oranın anlamsız büyük çıkmasını önler.

### Dene
- Gaz düzeyini 0,03 yap (okuma yaklaşık 130, oran yaklaşık 1,27). `ALARM_ORAN = 1.5` iken alarm var mı? `ALARM_ORAN = 1.2` yapınca? Sonra 3.0 yap: ne zaman alarm veriyor?
- Isınma süresini 1000 ms yap. `baz` değeri değişiyor mu? (Laboratuvarda değişmez, çünkü ısınma modellenmiyor. Gerçek sensörde ısınma bitmeden ölçmek büyük farklar yaratır.)
- Sketch'e `Serial.println(okuma)` ekleyip ham değerlerle yumuşatılmış `ort` değerini yan yana yaz. Hangisi daha kararlı?

### Sık yapılan hatalar
- Isınmayı beklememek: baz değer yanlış çıkar, alarm yanlış çalar ya da hiç çalmaz.
- Bazı gazlı ortamda ölçmek (laboratuvarda Gaz düzeyi 0 değilken program başlatmak): alarm eşiği yukarı kayar ve gerçek tehlike kaçırılır.
- Sabit bir sayıyla (`okuma > 400`) karşılaştırmak: başka modülde ya da başka havada anlamsız olur.
- Okumayı ppm gibi bir birime çevirip doğru sanmak.
- Alarmı tek bir okumaya bağlamak: tek sıçrama yanlış alarm verir.
- Bu devreyi gerçek can güvenliği için tek başına kullanmak.

## Konuşalım
Baz değeri her açılışta yeniden ölçmek iyi bir fikir mi? Sensör gazlı bir odada açılırsa ne olur? Bu sorunu nasıl fark ederdin?
