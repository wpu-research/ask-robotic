# Reed anahtarı ve limit anahtarı
süre: 20

## Merak
Evdeki pencere alarmının iki küçük parçası vardır: biri çerçeveye, biri kanada yapıştırılır. Pencere kapalıyken aralarında bir şey olmaz ama açılınca alarm öter. Aralarında kablo da yok. Bir de yazıcının kafası ya da 3B yazıcının ekseni uç noktaya gelince durur; nasıl bilir?

## Etkinlik
### İki anahtar, aynı mantık
**Reed anahtarı:** cam bir tüpün içinde iki ince metal dil. Yanına mıknatıs gelince dillerin kontağı **kapanır**, mıknatıs uzaklaşınca açılır. Elektrik bakımından bir butondur; basan şey parmak yerine mıknatıstır.

**Limit anahtarı (mikro şalter):** küçük bir kol ya da düğmeye mekanik olarak basılınca kontağı değişen anahtar. Hareketli bir parça uç noktaya gelince kola çarpar. Bu da elektrik bakımından bir butondur. Laboratuvarda ayrı bir limit anahtarı parçası yok; limit anahtarı yerine **buton** parçasını kullan. **Basılı** kutusu "kola basıldı" demektir.

İkisi de 6. dersteki butonla aynı yöntemle okunur: bir ucu pine, öbür ucu GND'ye, pin `INPUT_PULLUP`. Kontak kapanınca pin GND'ye bağlanır ve `LOW` okunur, kontak açıkken `HIGH`.

| Anahtar | Kontak kapalı (LOW) olduğunda | Laboratuvarda |
|---|---|---|
| Reed | Mıknatıs yakın (kapı kapalı, mıknatıs ve reed karşı karşıya) | **Mıknatıs yakın** kutusu işaretli |
| Limit | Kola basılı | Butonun **Basılı** kutusu işaretli |

Gerçek limit anahtarlarında genelde üç uç vardır: ortak (COM), normalde açık (NO) ve normalde kapalı (NC). NO ucunu kullanırsan basınca kontak kapanır, yukarıdaki gibi. **NC ucunu** kullanırsan tersi olur: basılmayınca kontak kapalıdır, basınca açılır. Laboratuvardaki buton yalnız NO gibi çalışır. Güvenlik uygulamalarında NC bağlantı tercih edilebilir, çünkü kablo kopsa bile pin HIGH olur ve sistem bunu "kontak açıldı" diye algılar. Yani arıza sessiz kalmaz. Ama bu mantığı kodda tersine çevirmek gerekir.

**Debounce hatırlatması:** 8. derste öğrendiğin gibi gerçek mekanik kontaklar kapanırken kısa süre titrer (bounce). Reed anahtarının dilleri ve limit anahtarının kolu da titrer. Titreşimi bir değişiklik sanıp olay üretirsek yalancı alarm çıkar. O yüzden değişimi ancak kısa bir süre kararlı kalırsa kabul ederiz. Laboratuvardaki reed ve buton temiz değişir, titreşim üretmez; kodun debounce kısmı yine de gerçek devre için doğru alışkanlıktır.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Reed | A → **D4**, B → GND (`INPUT_PULLUP`) |
| Buton (limit anahtarı yerine) | A → **D3**, B → GND (`INPUT_PULLUP`) |
| Direnç (330 Ω) | 1 → **D13**, 2 → LED A |
| LED | A → direncin 2 ucu, K → GND |

Gerçek hazır reed modüllerinin üzerinde kendi direnci ve çıkışı olabilir; laboratuvardaki reed çıplak reed gibidir, bu yüzden `INPUT_PULLUP` şarttır.

### Program
```cpp
// sketch: reed_kapi
const int REED = 4;
const int LED = 13;
const unsigned long KARARLI_MS = 20;

bool kararliKapali = false;    // kapı kapalı mı (mıknatıs yakın)?
bool sonOkunan = false;
unsigned long sonDegisim = 0;

void setup() {
  pinMode(REED, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();
  bool kapali = (digitalRead(REED) == LOW);      // LOW = kontak kapalı = mıknatıs yakın

  if (kapali != sonOkunan) {
    sonOkunan = kapali;
    sonDegisim = simdi;
  }
  if (sonOkunan != kararliKapali && simdi - sonDegisim >= KARARLI_MS) {
    kararliKapali = sonOkunan;
    Serial.println(kararliKapali ? "Kapi kapali" : "Kapi acik");
  }

  digitalWrite(LED, !kararliKapali);             // kapı açıkken LED yansın
}
```

İki anahtarı birlikte, aynı mantıkla okumak için diziler kullanabiliriz (4. derste diziler ve `for` döngüsünü görmüştün). Burada her anahtar için kendi "son değişim" zamanı tutulur:

```cpp
// sketch: kontak_debounce
const int PIN_SAYISI = 2;
const int PINLER[PIN_SAYISI] = {4, 3};     // 0: reed (D4), 1: limit (D3)
const unsigned long KARARLI_MS = 20;

bool kararli[PIN_SAYISI];
bool sonOkunan[PIN_SAYISI];
unsigned long sonDegisim[PIN_SAYISI];

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < PIN_SAYISI; i++) {
    pinMode(PINLER[i], INPUT_PULLUP);
    kararli[i] = false;                   // false = kontak açık
    sonOkunan[i] = false;
    sonDegisim[i] = 0;
  }
}

void loop() {
  unsigned long simdi = millis();
  for (int i = 0; i < PIN_SAYISI; i++) {
    bool kapali = (digitalRead(PINLER[i]) == LOW);
    if (kapali != sonOkunan[i]) {
      sonOkunan[i] = kapali;
      sonDegisim[i] = simdi;
    }
    if (sonOkunan[i] != kararli[i] && simdi - sonDegisim[i] >= KARARLI_MS) {
      kararli[i] = sonOkunan[i];
      Serial.print(i == 0 ? "Reed: " : "Limit: ");
      Serial.println(kararli[i] ? "kapali" : "acik");
    }
  }
}
```

### Nasıl çalışıyor?
1. Pin `INPUT_PULLUP` olduğu için kontak açıkken `HIGH`, kapalıyken `LOW` okunur. Kodda "kapali = (digitalRead(...) == LOW)" yazarak bu ters mantığı bir kez çeviririz.
2. Ham okuma değişince `sonDegisim` yenilenir. Değişim `KARARLI_MS` boyunca sürerse yeni durum kabul edilir ve mesaj yazılır. Daha kısa süren titreşimler mesaj üretmez.
3. `reed_kapi` kapı durumunu tutar; LED kapı açıkken yanar. Bu, projedeki alarmın temel fikridir.
4. `kontak_debounce` aynı mantığı dizilerle çoğaltır. Yeni bir anahtar eklemek için `PINLER` dizisine pin yazman ve `PIN_SAYISI`ni artırman yeter.

### Dene
- `reed_kapi` çalışırken reed parçasını seç ve **Mıknatıs yakın** kutusunu işaretle, sonra kaldır. LED ve seri monitör nasıl değişiyor? Not: sade bir reed anahtarı mıknatısın hangi kutbunun yaklaştığına bakmaz, ikisinde de kapanır.
- Çalışırken reed'i seçince sağ panelde **Sanal ölçüm** ile uçlarındaki gerilimi oku. Kontak açıkken kaç volt, kapalıyken kaç volt görüyorsun? Bu değerleri `INPUT_PULLUP` ile açıkla.
- `kontak_debounce` ile butonu (limit) ve reed'i sırayla çalıştır. Mesajlar birbirine karışıyor mu?
- Limit anahtarını NC ucuna bağlasaydın kodda hangi satırı değiştirmen gerekirdi? Laboratuvarda NC yok; cevabı kodu inceleyerek yaz.

### Sık yapılan hatalar
- Reed anahtarını `INPUT_PULLUP` olmadan bağlamak: kontak açıkken pin havada kalır, rastgele okuma verir.
- "Mıknatıs yakın = HIGH" sanmak: `INPUT_PULLUP` ile kontak kapanınca pin LOW olur.
- Debounce koymamak: gerçek devrede kapı sallanınca ya da kol titreşince yalancı olaylar çıkar.
- Reed'in ikinci ucunu GND'ye bağlamayı unutmak: kontak kapansa bile pin LOW olmaz, "Kapi kapali" hiç yazmaz.
- NO ile NC'yi karıştırmak: devre tersine çalışır.

## Konuşalım
Alarm sisteminde kapı kontağını NC bağlamak, NO bağlamaktan neden daha güvenli olabilir? Bir hırsız kabloyu keserse iki bağlantıda da ne olur?
