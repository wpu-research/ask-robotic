# Ses sensörü: alkış anahtarı
süre: 30

## Merak
"Alkışla yanan lamba" bir klasiktir: iki kez alkışla, yansın; iki kez daha alkışla, sönsün. Peki lamba kapı çarpınca, birinin yüksek sesle gülmesiyle ya da uzun süren bir müzikle de yanarsa? Güvenilir bir alkış anahtarı sesin sadece "var" ya da "yok" olduğuna bakmaz; ne kadar **yüksek** ve ne kadar **uzun** olduğuna da bakar.

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Ses sensörü modülü | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A0** (**DO** boş kalır) |
| Direnç (330 Ω) + LED | **D13** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |

Gerçek modülde bir mikrofon ve bir yükselteç vardır. Analog çıkış ortam sessizken belli bir **baz seviyede** durur, ses gelince bu seviyenin üstünde ve altında salınır. Baz seviye ve ses hassasiyeti modülden modüle farklıdır (çoğunda bir ayar vidası bulunur). Biz bu yüzden baz seviyeyi sabit bir sayı olarak yazmayız, **ölçeriz**.

Laboratuvardaki modülde mikrofon yoktur; sesi sağ paneldeki **Ses şiddeti** özelliğiyle (0-1) sen verirsin. Bu modülde sessizken (şiddet 0) AO yaklaşık 1,25 V verir, yani `analogRead` yaklaşık **256** okur (512 değil). Şiddet arttıkça AO yükselir: 0,1 için yaklaşık 327, 0,5 için yaklaşık 614, 0,8 için yaklaşık 829. Laboratuvardaki değer yalnızca yukarı çıkar; gerçek mikrofon baz seviyenin hem üstüne hem altına salınır, `abs()` ikisini de karşılar.

Alkış çok kısa bir olaydır: baz seviyeden birdenbire uzaklaşır, bir an kalır ve geri döner. Laboratuvarda bunu şöyle taklit edersin: program çalışırken **Ses şiddeti**ni 0,8 yap, hemen 0'a döndür. Elle yaptığın bu hareket en hızlı halinde bile gerçek bir alkıştan çok daha uzun sürer; bu yüzden aşağıdaki programlarda süre üst sınırını (`SURE_MAX`) 500 ms, iki alkış arası payını (`ARALIK`) 3000 ms seçtik. Gerçek bir devrede bu değerler çok daha küçük olurdu.

### Program 1: baz seviye ve tepe
Önce ortamı ölç. Sketch açılışta yaklaşık üçte bir saniye boyunca (64 ölçüm, aralarında 5 ms) ortalama alıp baz seviyeyi bulur. Sonra her yarım saniyede, baz seviyeden **en büyük sapmayı** (tepe) yazar.

```cpp
// sketch: ses_baz_tepe
const int SES = A0;

int baz;
int tepe = 0;
unsigned long sonYazma = 0;

int bazOlc() {
  long toplam = 0;
  for (int i = 0; i < 64; i++) {
    toplam += analogRead(SES);
    delay(5);
  }
  return toplam / 64;
}

void setup() {
  Serial.begin(9600);
  baz = bazOlc();
  Serial.print("baz=");
  Serial.println(baz);
}

void loop() {
  int fark = abs(analogRead(SES) - baz);
  if (fark > tepe) tepe = fark;

  if (millis() - sonYazma >= 500) {
    sonYazma = millis();
    Serial.print("tepe=");
    Serial.println(tepe);
    tepe = 0;
  }
}
```

Kurulumdaki `delay` kabul edilebilir: ölçüm yalnızca bir kez, program açılırken yapılır. Ölçüm sırasında **Ses şiddeti** 0'da kalsın.

### Program 2: alkış tanıma
Bir ses olayı üç adımda tanınır:
1. **Tepe yüksekliği:** sapma `TEPE_ESIK` değerini aşarsa bir olay başlar. Daha zayıf sesler (konuşma, fısıltı) sayılmaz.
2. **Süre:** olay, sapma `SESSIZ_PAY` kadar süre eşiğin altında kalınca biter. Süre, olayın başı ile son yüksek örnek arasındadır. Mikrofon sinyali salındığı için sapma ara sıra sıfıra yakın olur; bu yüzden olayı hemen bitirmeyip kısa bir "sessizlik payı" bekleriz.
3. **Sınıflandırma:** süre çok kısaysa parazit, çok uzunsa (müzik, bağırış, bir motor) alkış değildir. Alkış ikisinin arasındadır.

```cpp
// sketch: alkis_tani
const int SES = A0;
const int TEPE_ESIK = 150;          // baz seviyeden en az bu kadar sapma
const unsigned long SURE_MIN = 10;  // ms: bundan kısa = parazit
const unsigned long SURE_MAX = 500; // ms: bundan uzun = alkış değil
const unsigned long SESSIZ_PAY = 20; // ms

int baz;
bool sesVar = false;
unsigned long baslangic = 0;
unsigned long sonYuksek = 0;
int tepe = 0;
unsigned long sure = 0;

int bazOlc() {
  long toplam = 0;
  for (int i = 0; i < 64; i++) {
    toplam += analogRead(SES);
    delay(5);
  }
  return toplam / 64;
}

// Olay bittiğinde türünü döndürür: 'A' alkış, 'U' uzun ses, 'K' kısa parazit.
// Olay yoksa ya da sürüyorsa 0 döner.
char olayOku() {
  unsigned long simdi = millis();
  int fark = abs(analogRead(SES) - baz);

  if (fark >= TEPE_ESIK) {
    if (!sesVar) {
      sesVar = true;
      baslangic = simdi;
      tepe = 0;
    }
    sonYuksek = simdi;
    if (fark > tepe) tepe = fark;
  } else if (sesVar && simdi - sonYuksek >= SESSIZ_PAY) {
    sesVar = false;
    sure = sonYuksek - baslangic;
    if (sure < SURE_MIN) return 'K';
    if (sure > SURE_MAX) return 'U';
    return 'A';
  }
  return 0;
}

void setup() {
  Serial.begin(9600);
  baz = bazOlc();
  Serial.print("baz=");
  Serial.println(baz);
}

void loop() {
  char olay = olayOku();
  if (olay == 0) return;

  if (olay == 'A') Serial.print("ALKIS");
  if (olay == 'U') Serial.print("UZUN");
  if (olay == 'K') Serial.print("KISA");
  Serial.print(" sure=");
  Serial.print(sure);
  Serial.print(" tepe=");
  Serial.println(tepe);
}
```

`olayOku()` bir **durum** tutar (`sesVar`). Fonksiyon her `loop()` turunda çağrılır, çoğu turda `0` döner ve çok hızlı biter. 27. dersteki bloklamayan kod mantığıdır.

### Program 3: iki alkışta LED aç/kapat
Alkış anahtarı iki alkışın arasındaki süreye bakar. İki alkışın **başlangıçları** arasında en çok `ARALIK` (burada 3 saniye) varsa LED'in durumu tersine çevrilir. Tek alkış bir şey yapmaz ama "ilk alkış" olarak hatırlanır. Uzun bir ses araya girerse hafıza silinir.

```cpp
// sketch: alkis_anahtar
const int SES = A0;
const int LED = 13;
const int TEPE_ESIK = 150;
const unsigned long SURE_MIN = 10;
const unsigned long SURE_MAX = 500;
const unsigned long SESSIZ_PAY = 20;
const unsigned long ARALIK = 3000;   // iki alkış arası en çok

int baz;
bool sesVar = false;
unsigned long baslangic = 0;
unsigned long sonYuksek = 0;
int tepe = 0;
unsigned long sure = 0;

bool ledAcik = false;
int alkisSay = 0;
unsigned long ilkAlkis = 0;

int bazOlc() {
  long toplam = 0;
  for (int i = 0; i < 64; i++) {
    toplam += analogRead(SES);
    delay(5);
  }
  return toplam / 64;
}

char olayOku() {
  unsigned long simdi = millis();
  int fark = abs(analogRead(SES) - baz);

  if (fark >= TEPE_ESIK) {
    if (!sesVar) {
      sesVar = true;
      baslangic = simdi;
      tepe = 0;
    }
    sonYuksek = simdi;
    if (fark > tepe) tepe = fark;
  } else if (sesVar && simdi - sonYuksek >= SESSIZ_PAY) {
    sesVar = false;
    sure = sonYuksek - baslangic;
    if (sure < SURE_MIN) return 'K';
    if (sure > SURE_MAX) return 'U';
    return 'A';
  }
  return 0;
}

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  baz = bazOlc();
  Serial.print("baz=");
  Serial.println(baz);
}

void loop() {
  char olay = olayOku();

  if (olay == 'A') {
    if (alkisSay == 1 && baslangic - ilkAlkis <= ARALIK) {
      ledAcik = !ledAcik;
      digitalWrite(LED, ledAcik);
      alkisSay = 0;
      Serial.println(ledAcik ? "LED acik" : "LED kapali");
    } else {
      alkisSay = 1;
      ilkAlkis = baslangic;
    }
  } else if (olay == 'U') {
    alkisSay = 0;              // uzun ses: alkış dizisini sıfırla
  }
}
```

### Nasıl çalışıyor?
1. `bazOlc()` sessiz ortamın ortalamasını bulur. Bütün sapmalar bu değere göre hesaplanır.
2. `abs(analogRead(SES) - baz)` baz seviyenin üstündeki ve altındaki salınımı aynı şekilde sayar.
3. Olay başlayınca `baslangic` kaydedilir, her yüksek örnekte `sonYuksek` yenilenir. Süre `sonYuksek - baslangic` olur.
4. Tek yüksek ses bir alkıştır ama tek başına LED'i değiştirmez: `alkisSay` 1 olur ve ikinci alkış beklenir.
5. İkinci alkış `ARALIK`tan (3 saniye) geç gelirse, o alkış yeni bir "ilk alkış" olur.
6. Sesler çok zayıfsa (`TEPE_ESIK` altı), çok kısaysa ya da çok uzunsa hiç alkış sayılmaz.

### Dene
- Konuşmayı **Ses şiddeti = 0,1** ile taklit et (sapma yaklaşık 71). `TEPE_ESIK` 150 iken olay sayılıyor mu? 50 yapınca? Sonra 400 yap ve şiddeti 0,5 (sapma yaklaşık 358) ile 0,8 (yaklaşık 573) dene: hangi alkışlar kaçıyor?
- `ARALIK = 1000` yap ve iki alkış arasında yaklaşık 2 saniye bekle. Ne olur?
- Üçüncü bir alkış ekle: üç alkışta aktif buzzer'ı (D8) kısa çaldır. Buzzer'ı **Parça ekle** menüsünden seçip özellik panelinden **Tür**ünü **Aktif** yap. `alkisSay` değişkeni nasıl değişmeli?

### Sık yapılan hatalar
- Baz seviyeyi 512 sanmak: modülün baz seviyesi farklıdır (laboratuvardaki modülde yaklaşık 256). Her zaman ölç.
- Baz seviyeyi **Ses şiddeti** 0 değilken ölçmek: baz yanlış çıkar ve alkış hep tanınır ya da hiç tanınmaz.
- Olayı tek örnekle bitirmek: salınan sinyal ara sıra baz seviyeden geçer, bir alkış iki olay gibi görünür. Sessizlik payı bunu çözer.
- Sadece tepe yüksekliğine bakmak: çok yüksek bir kapı çarpması da alkışa benzer. Süreyi de kontrol et.
- Gerçek devrede gevşek ya da sallanan kablolar da sinyali oynatır ve sahte olay üretir (laboratuvar bunu modellemez, ama aklında olsun).

## Konuşalım
Alkış anahtarı kalabalık bir odada neden zorlanır? Süre ve yükseklik kontrollerine başka hangi kontrolü ekleyerek (örneğin iki alkış arasındaki süreyi sınırlamak gibi) yanlış tetikleri azaltırdın?
