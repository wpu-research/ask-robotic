# Işık sensörü hassasiyeti ve histerezis
süre: 25

## Merak
Sokak lambaları akşam alacakaranlıkta bazen yanıp sönüp tekrar yanar, sonra kalıcı olarak yanar. Işık yavaş yavaş azalırken sensör eşiğin tam üstünde bir an "karanlık", bir an "aydınlık" der. Aynı şey senin gece lambanda da olur: değer eşiğin yanında oynayınca LED titrer. Bu derste titremeyi önce görecek, sonra iki eşikle (histerezis) yok edeceksin.

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| LDR (foto direnç) | Bir ucu 5 V, öbür ucu **A1** |
| 10 kΩ sabit direnç | Bir ucu **A1**, öbür ucu GND |
| LED + 330 Ω direnç | **D13** → direnç → LED anodu; katot → GND |

Bu, 12. dersteki LDR bölücüsünün aynısıdır: LDR aydınlıkta küçük direnç gösterir, bu yüzden A1'deki gerilim aydınlıkta yükselir. Yani `analogRead` değeri **aydınlıkta büyür, karanlıkta küçülür**. Senin devren ters bağlıysa (LDR GND tarafındaysa) karşılaştırmaların yönünü değiştir.

### Program 1: tek eşik
Bu derste LED, karanlıkta yanacak. En basit hali tek bir eşikle karşılaştırmaktır. Sketch her saniye eşiği kaç kez geçtiğini de sayıp yazar.

```cpp
// sketch: ldr_tek_esik
const int LDR = A1;
const int LED = 13;
const int ESIK = 473;

bool onceki = false;
int gecis = 0;
unsigned long sonYazma = 0;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int deger = analogRead(LDR);
  bool karanlik = (deger < ESIK);   // karanlıkta değer küçüktür
  digitalWrite(LED, karanlik);

  if (karanlik != onceki) {
    gecis++;
    onceki = karanlik;
  }

  if (millis() - sonYazma >= 1000) {
    sonYazma = millis();
    Serial.print("gecis=");
    Serial.println(gecis);
  }
}
```

Ortam ışığı eşiğin hemen yanındaysa (değer yaklaşık 473) ve okuma küçük dalgalanıyorsa, LED saniyede onlarca kez açılıp kapanır. Dalgalanmanın kaynağı ışığın kendisi, bir gölge, kablo ya da ADC'nin küçük sapmalarıdır. Gerçek bir devrede de bu olur; simülasyonda bunu "gürültü" dizisiyle taklit ediyoruz.

### Program 2: iki eşik (histerezis)
Çözüm, açma ve kapama için **iki ayrı eşik** kullanmaktır. LED karanlıkta yanar ve ancak ortam **belirgin biçimde** aydınlanınca söner. İki eşik arasındaki bölgeye **ölü bölge** ya da **histerezis bandı** denir. Termostatta (35. ders) hedefin 0,5 derece altı ve üstü ile aynı fikirdir.

```cpp
// sketch: ldr_histerezis
const int LDR = A1;
const int LED = 13;
const int ACMA = 423;     // bunun altında: karanlık, LED yansın
const int KAPAMA = 523;   // bunun üstünde: aydınlık, LED sönsün

bool yanik = false;
bool onceki = false;
int gecis = 0;
unsigned long sonYazma = 0;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int deger = analogRead(LDR);

  if (!yanik && deger < ACMA) {
    yanik = true;
  } else if (yanik && deger > KAPAMA) {
    yanik = false;
  }
  digitalWrite(LED, yanik);

  if (yanik != onceki) {
    gecis++;
    onceki = yanik;
  }

  if (millis() - sonYazma >= 1000) {
    sonYazma = millis();
    Serial.print("gecis=");
    Serial.println(gecis);
  }
}
```

423 ile 523 arasındaki değerlerde program hiçbir şey yapmaz: LED ne durumdaysa öyle kalır. Karar, sensörün şimdiki değerine **ve** LED'in şimdiki durumuna bağlıdır.

Bandı ne kadar geniş seçeceksin? Gürültünün tepeden tepeye genişliğinden büyük olmalı. Gürültü 80 birim oynuyorsa bant 100 birim olabilir. Fazla geniş bantta ise lamba geç yanar ve geç söner; yani sistem **daha az hassas** olur. Hassasiyet ile kararlılık arasında bir denge kurarsın.

### Program 3: eşiği kendin bul
Eşikleri elle sayıya dökmek yerine ortamdan öğrenebilirsin. Program ilk 3 saniyede (bu sürede sensörü bir kez kapat, bir kez aç) en küçük ve en büyük değeri ölçer. Sonra eşikleri bu aralığın %40'ına (yanma) ve %60'ına (sönme) koyar.

```cpp
// sketch: ldr_otomatik_esik
const int LDR = A1;
const int LED = 13;
const unsigned long OGRENME_MS = 3000;

int enAz = 1023;
int enCok = 0;
int acma;
int kapama;
bool yanik = false;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);

  unsigned long bas = millis();
  while (millis() - bas < OGRENME_MS) {
    int d = analogRead(LDR);
    if (d < enAz) enAz = d;
    if (d > enCok) enCok = d;
  }

  int aralik = enCok - enAz;
  acma = enAz + aralik * 4 / 10;     // bunun altı: karanlık
  kapama = enAz + aralik * 6 / 10;   // bunun üstü: aydınlık

  Serial.print("enAz=");
  Serial.print(enAz);
  Serial.print(" enCok=");
  Serial.print(enCok);
  Serial.print(" acma=");
  Serial.print(acma);
  Serial.print(" kapama=");
  Serial.println(kapama);
  if (aralik < 100) {
    Serial.println("UYARI: isik degisimi cok az, sensoru kontrol et");
  }
}

void loop() {
  int deger = analogRead(LDR);
  if (!yanik && deger < acma) {
    yanik = true;
  } else if (yanik && deger > kapama) {
    yanik = false;
  }
  digitalWrite(LED, yanik);
}
```

### Nasıl çalışıyor?
1. Tek eşikte LED'in durumu yalnızca `deger > ESIK` sonucudur. Değer eşiğin iki yanında gidip gelirse LED de gidip gelir.
2. Histerezisli sürümde `yanik` değişkeni sistemin "hafızasıdır". Eşiği geçmek yetmez; **karşı** eşiği geçmek gerekir.
3. `gecis` sayacı titremeyi sayıya döker. İyi bir çözümün göstergesi, gürültülü ortamda bile bu sayının artmamasıdır.
4. Üçüncü sürüm bandı ortamın aralığına göre ayarlar. Böylece aynı kod farklı LDR'lerde ve farklı odalarda çalışır.

### Dene
- `ldr_histerezis` programında `ACMA = 453`, `KAPAMA = 493` yap (dar bant). Işığı eşiğe yakın tutup elinle titret. Titreme geri geliyor mu?
- Bandı çok genişlet (`ACMA = 200`, `KAPAMA = 800`). Gece lambası ne zaman yanıyor ve ne zaman sönüyor?
- `ldr_otomatik_esik` programında yüzde 40/60 yerine 30/70 dene. Lamba daha geç mi yanıyor?

### Sık yapılan hatalar
- Açma ve kapama eşiğini aynı yapmak: bu, tek eşiktir.
- Eşikleri ters yazmak (`ACMA > KAPAMA`): LED hiç yanmaz ya da hiç sönmez.
- Bandı gürültüden dar seçmek: titreme tamamen gitmez.
- LDR'yi GND tarafına bağlayıp yönü değiştirmemek: lamba gündüz yanar.
- Öğrenme süresinde ışığı hiç değiştirmemek: aralık çok küçük kalır, eşikler anlamsızlaşır.

## Konuşalım
Bir ışık sensörüne hem hızlı tepki vermek hem de titrememek ister misin? Bu iki isteğin neden birbiriyle çeliştiğini, histerezis bandının genişliği üzerinden anlat.
