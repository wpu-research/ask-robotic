# Proje: Yangın ve gaz alarm paneli
süre: 35

## Merak
Bir binanın yangın panosuna baktığında yeşil, sarı ve kırmızı ışıklar görürsün; biraz yakında da bir bip sesi duyarsın. Panonun içinde sensörler, bir karar mantığı ve çıkışlar vardır. Hepsi aynı soruya cevap verir: "Şu an durum ne ve ne yapmalıyım?" Bu hafta öğrendiklerini birleştirip böyle bir paneli kuracaksın. Gaz ve alev sensörleri hep birlikte çalışacak, panel üç seviyeli alarm verecek ve ekranda durumu gösterecek.

## Etkinlik
### Ne yapacağız?
Bu proje öğrendiklerini birleştirir:
- **51. ders:** İki eşikle histerezis; durum değerleri titremesin.
- **53. ders:** MQ-2 için ısınma ve temiz havada baz değer; eşikler bazın katı olarak.
- **54. ders:** `enum Seviye` ve her sensör için aynı `seviyeBul` fonksiyonu.
- **Modül 3:** `millis()` ile bloklamayan kod (27), röle (24), I2C LCD (32-33), buzzer (18), NTC ile sıcaklık (13).

Panel üç sensörden gelen seviyelerin **en kötüsünü** genel durum yapar. Genel durum üç şeyi sürer: LED'ler, buzzer ve ekran. Röle ayrıca gaz seviyesine bağlıdır.

### Güvenlik notu
- Gerçek bir rölede şebeke gerilimi (220 V) ile devre kurulmaz. Bu projede röle yalnızca 5 V'luk bir LED'i sürer; havalandırma fanını bu LED simgeler.
- Bu derste gerçek gaz ve alev yoktur; sensör değerlerini özellik panelinden verirsin. Gerçek can ve mal güvenliği için sertifikalı alarm cihazları kullanılır; bu proje eğitim amaçlıdır.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| MQ-2 gaz sensörü modülü | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A3** |
| Alev sensörü modülü | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A1** |
| NTC termistör (isteğe bağlı) | Uç **1** → **A2**, uç **2** → **GND** |
| Direnç (10000 Ω; NTC için) | Uç **1** → **5V**, uç **2** → **A2** |
| Direnç (330 Ω) + LED (normal; rengi yeşil) | **D11** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |
| Direnç (330 Ω) + LED (uyarı; rengi sarı) | **D12** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |
| Direnç (330 Ω) + LED (tehlike; rengi kırmızı) | **D13** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |
| Buzzer (özellik panelinden **Tür: Aktif**) | **+** → **D8**, **-** → **GND** |
| Röle modülü | **VCC** → **5V**, **GND** → **GND**, **IN** → **D7** |
| Havalandırma fanı yerine direnç (330 Ω) + LED | Röle **COM** → **5V**; röle **NO** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |
| I2C LCD 16x2 | **SDA** → **A4**, **SCL** → **A5**, **VCC** → **5V**, **GND** → **GND** (adres 0x27) |

NTC'yi tuvale eklemeyeceksen programda `ISI_VAR = false` yap; A2 boş kalırsa rastgele değerler okunur ve laboratuvar "boşta giriş" uyarısı verir. Alev sensörünün yönü farklıysa 54. dersteki gibi `ALEVDE_DUSER` değerini değiştir; laboratuvardaki alev modülünde alevde değer düşer, yani `true` doğrudur. Röle ters çalışıyorsa `HIGH` ile `LOW` yerlerini değiştir ya da rölenin **Tetik** özelliğine bak.

### Seviyeler ve çıkışlar
| Genel durum | LED | Buzzer (D8) | Röle (D7, fan) | Ekran satırı |
|---|---|---|---|---|
| NORMAL | Yeşil | Sessiz | Gaz NORMAL ise kapalı | `DURUM: NORMAL` |
| UYARI | Sarı | Yavaş bip (saniyede bir kısa) | Gaz UYARI/TEHLIKE ise açık | `DURUM: UYARI` |
| TEHLIKE | Kırmızı | Sürekli | Gaz UYARI/TEHLIKE ise açık | `DURUM: TEHLIKE` |

Üç sensörün seviyeleri `seviyeBul` ile ayrı ayrı bulunur:

| Sensör | Büyüklük | UYARI aç / kapat | TEHLIKE aç / kapat |
|---|---|---|---|
| Gaz (A3) | okuma, baz değere göre | baz×1,5 / baz×1,25 | baz×2,5 / baz×2 |
| Alev (A1) | şiddet (54. ders) | 300 / 250 | 600 / 500 |
| Isı (A2, isteğe bağlı) | °C (tam sayı) | 45 / 42 | 60 / 55 |

Röle gaz seviyesine bağlıdır: gaz temiz havaya dönene kadar (gaz seviyesi NORMAL olana kadar) fan çalışır. Röle ayrı bir histerezis gerektirmez; çünkü gaz seviyesinin kendisi zaten histerezislidir.

Panel açılınca önce **ısınma** yapar (ekranda "ISINMA"), sonra temiz havada gaz baz değerini ölçer. Laboratuvarda ısınmayı kısa tuttuk (4 saniye); gerçek MQ-2 için çok daha uzun bir süre kullan. Isınma ve baz ölçümü bitene kadar (yaklaşık 5 saniye) **Gaz düzeyi** 0'da kalmalı; bu durumda `gazBaz` yaklaşık 102 olur.

Paneli denemek için ısınma bittikten sonra özellik panelinden şu değerleri ver:

| Ne yapmak istiyorsun | Değer |
|---|---|
| Gaz UYARI | MQ-2 **Gaz düzeyi** 0,1 (okuma yaklaşık 194; eşik yaklaşık 153) |
| Gaz TEHLIKE | MQ-2 **Gaz düzeyi** 0,3 (okuma yaklaşık 379; eşik yaklaşık 255) |
| Alev UYARI | Alev sensörü **Alev şiddeti** 0,4 (şiddet yaklaşık 389; eşik 300) |
| Alev TEHLIKE | Alev sensörü **Alev şiddeti** 0,8 (şiddet yaklaşık 777; eşik 600) |
| Isı UYARI / TEHLIKE | NTC **Sıcaklık** 50 °C / 70 °C |

### Program
```cpp
// sketch: yangin_gaz_paneli
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const int ALEV_PIN = A1;
const int NTC_PIN = A2;
const int GAZ_PIN = A3;
const int LED_YESIL = 11;
const int LED_SARI = 12;
const int LED_KIRMIZI = 13;
const int BUZZER = 8;
const int ROLE = 7;

const bool ALEVDE_DUSER = true;
const bool ISI_VAR = true;
const unsigned long ISINMA_MS = 4000;     // ders için kısa; gerçekte çok daha uzun
const unsigned long OLCUM_ARALIGI = 100;  // ms
const unsigned long EKRAN_ARALIGI = 250;  // ms

enum Seviye { NORMAL, UYARI, TEHLIKE };

LiquidCrystal_I2C lcd(0x27, 16, 2);

Seviye gaz = NORMAL;
Seviye alev = NORMAL;
Seviye isi = NORMAL;
Seviye genel = NORMAL;
int gazBaz = 100;
int gazDeger = 0;
int alevDeger = 0;
int isiDeger = 25;
unsigned long sonOlcum = 0;
unsigned long sonEkran = 0;

int ortalama(int pin) {
  long toplam = 0;
  for (int i = 0; i < 4; i++) {
    toplam += analogRead(pin);
  }
  return toplam / 4;
}

int alevSiddeti() {
  int ham = ortalama(ALEV_PIN);
  return ALEVDE_DUSER ? 1023 - ham : ham;
}

int sicaklikOku() {
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(NTC_PIN);
  }
  float adc = toplam / 8.0;
  if (adc < 1.0) adc = 1.0;
  if (adc > 1022.0) adc = 1022.0;
  float direnc = 10000.0 * adc / (1023.0 - adc);
  float kelvin = 1.0 / (log(direnc / 10000.0) / 3950.0 + 1.0 / 298.15);
  return (int)(kelvin - 273.15 + 0.5);
}

Seviye seviyeBul(Seviye simdiki, int deger,
                 int uyariAc, int uyariKapat,
                 int tehlikeAc, int tehlikeKapat) {
  if (simdiki == NORMAL) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger >= uyariAc) return UYARI;
    return NORMAL;
  }
  if (simdiki == UYARI) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger < uyariKapat) return NORMAL;
    return UYARI;
  }
  if (deger < tehlikeKapat) {
    return (deger >= uyariKapat) ? UYARI : NORMAL;
  }
  return TEHLIKE;
}

Seviye enKotu(Seviye a, Seviye b) {
  return (a > b) ? a : b;
}

const char* seviyeAdi(Seviye s) {
  if (s == UYARI) return "UYARI  ";
  if (s == TEHLIKE) return "TEHLIKE";
  return "NORMAL ";
}

char seviyeHarfi(Seviye s) {
  if (s == UYARI) return 'U';
  if (s == TEHLIKE) return 'T';
  return 'N';
}

void gecisYaz(const char* ad, Seviye eski, Seviye yeni, int deger) {
  if (eski == yeni) return;
  Serial.print(ad);
  Serial.print(": ");
  Serial.print(seviyeAdi(yeni));
  Serial.print(" deger=");
  Serial.println(deger);
}

void seviyeleriGuncelle() {
  gazDeger = ortalama(GAZ_PIN);
  alevDeger = alevSiddeti();

  Seviye yeniGaz = seviyeBul(gaz, gazDeger,
                             gazBaz * 3 / 2, gazBaz * 5 / 4,
                             gazBaz * 5 / 2, gazBaz * 2);
  Seviye yeniAlev = seviyeBul(alev, alevDeger, 300, 250, 600, 500);
  Seviye yeniIsi = isi;
  if (ISI_VAR) {
    isiDeger = sicaklikOku();
    yeniIsi = seviyeBul(isi, isiDeger, 45, 42, 60, 55);
  }

  gecisYaz("GAZ", gaz, yeniGaz, gazDeger);
  gecisYaz("ALEV", alev, yeniAlev, alevDeger);
  gecisYaz("ISI", isi, yeniIsi, isiDeger);
  gaz = yeniGaz;
  alev = yeniAlev;
  isi = yeniIsi;

  Seviye yeniGenel = enKotu(gaz, enKotu(alev, isi));
  if (yeniGenel != genel) {
    genel = yeniGenel;
    Serial.print("DURUM: ");
    Serial.println(seviyeAdi(genel));
  }
}

void ciktilariSur(unsigned long simdi) {
  digitalWrite(LED_YESIL, genel == NORMAL);
  digitalWrite(LED_SARI, genel == UYARI);
  digitalWrite(LED_KIRMIZI, genel == TEHLIKE);

  bool bip = false;
  if (genel == TEHLIKE) {
    bip = true;                          // sürekli
  } else if (genel == UYARI) {
    bip = (simdi % 1000) < 150;          // saniyede bir kısa bip
  }
  digitalWrite(BUZZER, bip);

  digitalWrite(ROLE, gaz != NORMAL);     // fan: gaz temizlenene kadar
}

void ekranYaz() {
  lcd.setCursor(0, 0);
  lcd.print("DURUM: ");
  lcd.print(seviyeAdi(genel));
  lcd.print("  ");
  lcd.setCursor(0, 1);
  lcd.print("G:");
  lcd.print(seviyeHarfi(gaz));
  lcd.print(" A:");
  lcd.print(seviyeHarfi(alev));
  lcd.print(" I:");
  lcd.print(ISI_VAR ? seviyeHarfi(isi) : '-');
  lcd.print("     ");
}

void setup() {
  pinMode(LED_YESIL, OUTPUT);
  pinMode(LED_SARI, OUTPUT);
  pinMode(LED_KIRMIZI, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(ROLE, OUTPUT);
  digitalWrite(ROLE, LOW);
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("ISINMA...       ");
  lcd.setCursor(0, 1);
  lcd.print("Temiz havada kal");

  while (millis() < ISINMA_MS) {
    digitalWrite(LED_YESIL, (millis() / 250) % 2);   // yanıp söner
  }

  long toplam = 0;
  for (int i = 0; i < 32; i++) {
    toplam += analogRead(GAZ_PIN);
    delay(20);
  }
  gazBaz = toplam / 32;
  if (gazBaz < 20) gazBaz = 20;
  Serial.print("gazBaz=");
  Serial.println(gazBaz);

  seviyeleriGuncelle();
  ciktilariSur(millis());
  ekranYaz();
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    seviyeleriGuncelle();
  }

  ciktilariSur(simdi);

  if (simdi - sonEkran >= EKRAN_ARALIGI) {
    sonEkran = simdi;
    ekranYaz();
  }
}
```

### Nasıl çalışıyor?
1. `setup` önce ekranı açar ve ısınmayı bekler. Bu sırada yeşil LED yanıp söner. Sonra temiz havada 32 ölçümün ortalaması `gazBaz` olur.
2. Her 100 ms'de bir `seviyeleriGuncelle()` üç sensörü okur ve **aynı** `seviyeBul` fonksiyonunu üç kez farklı eşiklerle çağırır. Yeni sensör eklemek tek satırdır.
3. `genel`, üç seviyenin `enKotu` değeridir. Bir sensör TEHLIKE derse panel TEHLIKE olur; hepsi NORMAL olduğunda panel NORMAL olur.
4. Seviyeler çıkışları doğrudan belirler (`ciktilariSur`). Çıkışları başka yerde değiştiren kod yoktur; bu, durum makinelerinde hataları azaltır.
5. Yavaş bip `simdi % 1000 < 150` ile yapılır: her saniyenin ilk 150 ms'inde buzzer çalar. `delay` yoktur, `loop` hep döner.
6. Dönüş (TEHLIKE → UYARI → NORMAL) her sensörde histerezisle olur. Değer eşiğe yakın oynarsa seviye ve çıkışlar titremez.
7. Röle yalnızca **gaz** seviyesine bağlıdır. Panel TEHLIKE olsa bile gaz NORMAL ise (örneğin alev var, gaz yok) fan çalışmaz.
8. Ekran 250 ms'de bir yenilenir; `lcd.print` ile her satırın sonunda boşluk basılır, böylece eski karakterler kalmaz.
9. Seri monitör yalnızca seviye değişince yazar; olay günlüğü gibi okunur.

### Dene
- `ISI_VAR = false` yap ve NTC'yi (ile direncini) tuvalden sil. Panel yalnız gaz ve alevle çalışıyor mu? Ekranın ikinci satırında ne görüyorsun?
- Alev sensörünün yönünü bozup `ALEVDE_DUSER = false` yap. Normal ortamda panel nasıl davranır?
- UYARI için buzzer desenini değiştir: 100 ms çalsın, 400 ms sussun (`simdi % 500 < 100`). TEHLIKE için "iki kısa bip, bir boşluk" deseni yazabilir misin?
- NTC'nin A2 kablosunu silersen ne olur? (İpucu: `adc` değerinin uç değerlerini kontrol et.) Panele "SENSOR HATASI" seviyesi ekler misin?

### Sık yapılan hatalar
- Isınmayı ve bazı atlamak: panel ya sürekli alarm verir ya da hiç vermez.
- Bazı gazlı ortamda ölçmek: eşikler çok yukarıda kalır, gerçek bir gaz artışı alarm vermez.
- Kapama eşiğini açma eşiğiyle aynı yapmak: seviye ve buzzer titrer.
- `NORMAL` ve `UYARI` için aynı çıkışı kullanıp birini diğerinden ayırt edememek.
- Röleyi şebeke gerilimiyle kullanmak: bu projede kesinlikle yapma.
- Çıkışları (LED, buzzer, röle) farklı yerlerden sürmek: seviye ile çıkışlar birbirinden kopar.
- Gerçek devrede sensörü doğrudan güneş ışığına ya da ısıtıcıya bakacak şekilde yerleştirmek: yanlış alarm verir (laboratuvar bunu modellemez).

## Konuşalım
Gaz algılandığında fanı çalıştırmak mantıklı, ama yangın varken (alev TEHLIKE) fan aynı davranmalı mı? Gerçek bir panoda hangi kuralları kim belirler? Bu sorulara cevap vermeden önce hangi bilgilere ihtiyacın var?
