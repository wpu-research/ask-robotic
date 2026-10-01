# Laboratuvar kusursuzdur: ADC basamağı ve gürültü
süre: 30

## Merak
Laboratuvarda potansiyometreyi ortaya getirdin, eşik programın LED'i tam zamanında yaktı, hiç titremedi. Aynı kodu gerçek bir devreye koyan biri, ışık sabitken LED'in durmadan yanıp söndüğünü görüyor. Kod aynı, devre aynı. Fark nerede? Cevap: laboratuvar bilerek **temiz** bir dünya çiziyor. Bu hafta o temiz dünyanın neyi gizlediğini, hangi gerçek dünya etkilerini ise laboratuvarın gerçekten gösterdiğini ayıracaksın.

## Etkinlik
### Laboratuvar neyi modeller, neyi modellemez?
Bu hafta bir kural koyuyoruz: bir etkiyi yalnızca laboratuvar **gerçekten** üretiyorsa "laboratuvarda gördün" diyeceğiz. Üretmiyorsa bunu açıkça yazacağız ve etkiyi kodla taklit edeceğiz.

| Gerçek dünya etkisi | Laboratuvarda |
|---|---|
| ADC basamağı (10 bit, 1024 seviye) | **Modellenir.** Her gerilim en yakın basamağa yuvarlanır. |
| Analog gürültü (kablo, güç hattı, ADC titremesi) | **Modellenmez.** Laboratuvarın gerilimleri kusursuz sabittir. |
| ADC ofset, kazanç hatası, referans geriliminin kayması | **Modellenmez.** Referans tam 5,00 V'tur. |
| Buton sıçraması | **Modellenmez** (72. ders). |
| Zamanlama (`delay`, `millis`, `pulseIn` süresi) | **Modellenir.** Kod gerçek Uno komutlarıyla, 16 MHz hızında koşar. |
| PIR ısınması | **Modellenir** (kısaltılmış; 75. ders). |
| Sensörlerin en düşük besleme gerilimi | **Modellenir** (73. ders). |
| 5 V hattının çökmesi, brown-out | **Modellenmez** (73. ders). |

Bu tablodaki "Modellenmez" satırlarının hepsi gerçek devrede seni bekliyor. Bu derste ilkiyle uğraşıyoruz: **gürültü** ve onunla birlikte **ADC basamağı**.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Potansiyometre | VCC → **5V**, SIG → **A0**, GND → **GND** |
| Direnç (330 Ω) | 1 → **D13**, 2 → LED A |
| LED | A → direncin 2 ucu, K → **GND** |

### 1) ADC basamağı: bu modellenir
`analogRead` 0-5 V aralığını 1024 basamağa böler (11. ders). Bir basamak yaklaşık 5 V / 1023 = 4,9 mV eder. Aradaki gerilimler en yakın basamağa yuvarlanır. Bu sketch ham değeri milivolta çevirir:

```cpp
// sketch: adc_basamak
void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(A0);
  float mv = ham * 5000.0 / 1023.0;
  Serial.print("ADC=");
  Serial.print(ham);
  Serial.print(" mV=");
  Serial.println(mv, 1);
  delay(500);
}
```

Potansiyometre konumunu 0,51 yaptığında A0'daki gerilim 2,550 V olur. ADC 522 verir ve program 2551,3 mV yazar. Aradaki 1,3 mV'lik fark ölçüm hatası değil, **basamak yuvarlamasıdır**: 522. basamak 2551,3 mV'a denk gelir ve 2550 mV bu basamağa yuvarlanır. 1 mV'u ayırt eden bir ölçüm istiyorsan 10 bitlik ADC yetmez. Ayrıca konumu 0,01 oynattığında ADC yaklaşık 10 basamak atlar; aradaki basamaklar ancak gerilim daha ince ayarlanırsa görünür.

### 2) Gürültü: bu modellenmez
Laboratuvarda potansiyometreyi sabit bıraktığında ADC değeri **hiç** oynamaz. Gerçekte oynar: kablolar anten gibi çalışır, güç hattında dalgalanma vardır, ADC'nin kendisi de bir iki basamak titrer. ATmega328P'nin veri sayfası, ADC'nin mutlak doğruluğunu birkaç basamak (yaklaşık ±2) olarak verir; kesin sayı için kendi veri sayfasına bak.

Laboratuvar gürültü üretmediği için biz **üreteceğiz**: okumaya kodla rastgele bir sayı ekleyeceğiz. Bu bir taklit; gerçek gürültünün şekli farklıdır, ama kodunun neye dayanması gerektiğini görmene yeter. `random(-8, 9)` -8 ile +8 arasında (9 dahil değil) bir tam sayı verir. `randomSeed` ile başlangıcı sabitlediğimiz için her çalıştırmada aynı dizi çıkar.

Aşağıdaki sketch, gürültülü tek okumayı ve 16 okumanın ortalamasını yan yana yazar (14. dersteki yumuşatma fikri):

```cpp
// sketch: gurultu_ortalama
const int SENSOR = A0;

int gurultuluOku() {
  return analogRead(SENSOR) + random(-8, 9);   // sahte gürültü: ±8 basamak
}

int ortalama(int adet) {
  long toplam = 0;
  for (int i = 0; i < adet; i++) {
    toplam += gurultuluOku();
  }
  return toplam / adet;
}

void setup() {
  Serial.begin(9600);
  randomSeed(42);
}

void loop() {
  Serial.print("Tek=");
  Serial.print(gurultuluOku());
  Serial.print(" Ort16=");
  Serial.println(ortalama(16));
  delay(300);
}
```

Potansiyometre 0,50'de sabitken `Tek` her satırda yaklaşık 503 ile 519 arasında dolaşır, `Ort16` ise çok daha dar bir aralıkta kalır. Ortalama gürültüyü yok etmez, küçültür: 16 okumada gürültü yaklaşık 4 kat azalır (karekök kuralı). Bedeli zamandır: 16 okuma 16 kat iş demektir.

### 3) Gürültü eşiği titretir
Tek eşikle karar veren program, değer eşiğin yakınındayken her gürültü dalgasında kararını değiştirir. Aynı sahte gürültüyü ekleyip D13'teki LED'i bir eşiğe bağlayalım:

```cpp
// sketch: esik_ham
const int SENSOR = A0;
const int LED = 13;
const int ESIK = 512;

int gurultuluOku() {
  return analogRead(SENSOR) + random(-8, 9);
}

void setup() {
  pinMode(LED, OUTPUT);
  randomSeed(42);
}

void loop() {
  digitalWrite(LED, gurultuluOku() > ESIK ? HIGH : LOW);
  delay(5);
}
```

Potansiyometreyi yaklaşık 0,50 konumunda bırak: LED saniyede onlarca kez yanıp sönmeye çalışır. Çözüm iki eşiktir (**histerezis**, 35. ders): yanmak için eşiğin biraz üstüne çık, sönmek için biraz altına in. İki eşik arasındaki boşluk gürültünün genliğinden büyük olmalı; burada gürültü ±8, boşluk ±12.

```cpp
// sketch: esik_histerezis
const int SENSOR = A0;
const int LED = 13;
const int ACMA = 524;
const int KAPAMA = 500;
bool yanik = false;

int gurultuluOku() {
  return analogRead(SENSOR) + random(-8, 9);
}

void setup() {
  pinMode(LED, OUTPUT);
  randomSeed(42);
}

void loop() {
  int deger = gurultuluOku();
  if (!yanik && deger > ACMA) yanik = true;
  if (yanik && deger < KAPAMA) yanik = false;
  digitalWrite(LED, yanik ? HIGH : LOW);
  delay(5);
}
```

Potansiyometreyi 0,50 civarında tutunca LED artık titremez; yavaşça 0,6'ya götürünce **bir kez** yanar, geri indirince **bir kez** söner.

### Gerçek dünyada ek bilgi: referans kayması
`analogRead` değeri, ölçülen gerilimin **besleme gerilimine oranıdır** (Uno'da varsayılan referans besleme hattıdır). Besleme 5,00 V yerine 4,70 V ise aynı sensör gerilimi daha büyük bir ADC değeri verir ve `ham * 5.0 / 1023.0` hesabı yanlış gerilim yazar. Laboratuvarın referansı hep tam 5,00 V olduğu için bu kayma görünmez; ölçümü gerçek bir devrede doğrulamak gerekir.

### Nasıl çalışıyor?
1. `adc_basamak` ham değeri milivolta çevirir; çıkıştaki küçük fark ADC basamağından gelir.
2. `gurultu_ortalama` laboratuvarda olmayan gürültüyü `random` ile ekler ve ortalamanın tek okumadan daha kararlı olduğunu gösterir.
3. `esik_ham` tek eşikle karar verir, gürültü yüzünden titrer.
4. `esik_histerezis` yanma ve sönme eşiklerini ayırır; LED yalnızca değer gerçekten karşı tarafa geçince değişir.

### Dene
- `gurultu_ortalama` içinde `random(-8, 9)` aralığını `random(-30, 31)` yap. `Ort16` ne kadar oynuyor? Ortalama sayısını 64 yaparsan ne olur, sürenin bedeli ne?
- `esik_histerezis` içinde `ACMA` ile `KAPAMA` değerlerini birbirine çok yaklaştır (510 ve 514). Titreme geri geliyor mu? Gürültü genliğinin yarısından küçük bir boşluk neden yetmez?
- Potansiyometrenin konumunu 0,01 adımlarla oynat ve `adc_basamak` çıktısına bak. Değer her adımda kaç basamak atlıyor? Bir basamak kaç mV?

### Sık yapılan hatalar
- "Laboratuvarda titremedi, demek ki gerçekte de titremez" demek. Laboratuvarın gürültüsü sıfırdır.
- Histerezis boşluğunu gürültünün genliğinden dar seçmek.
- Gürültüyü azaltmak için ortalama alırken okuma sayısını çok büyütüp programı yavaşlatmak.
- ADC değerini 5,00 V referansı varsayarak gerilime çevirip sonucu mutlak doğru sanmak.

## Konuşalım
Bu derste gürültünün laboratuvarda hiç olmadığını, ama kodunun gürültüye dayanması gerektiğini gördün. Laboratuvarda sorunsuz çalışan hangi kısmını, gerçek devrede çalışacağından emin olmadan "bitti" saymazdın?
