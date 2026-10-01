# Proje: Park sensörü (LED + buzzer + LCD)
süre: 35

## Merak
Arabanı geri vitese alıp garaja girerken "bip... bip... bip.bip.bip.biiip" sesini duymuşsundur. Ses sıklaştıkça duvara yaklaştığını anlarsın; sürekli öttüğünde dur demektir. Hiç ekrana bakmadan, yalnızca sesle mesafe duyabilmek müthiş bir fikir. Şimdi bu sistemi sen yapacaksın.

## Etkinlik
### Ne yapacağız?
Bu proje bu haftaki ve önceki modüllerdeki parçaları birleştirir:
- **Bu hafta (36-38):** HC-SR04 ile `pulseIn` ölçümü, santimetre hesabı ve 5 elemanlı **medyan filtre**.
- **Modül 3, hafta 6:** `millis()` ile bloklamayan kod. Ölçüm, ekran ve bip birbirini beklemez.
- **Modül 3, hafta 7:** I2C LCD ekran (0x27).
- **Modül 3, hafta 3:** `map()` ile bir aralığı başka bir aralığa çevirme.

Sistemin davranışı:

| Mesafe | LED | Buzzer (D8) | LCD alt satır |
|---|---|---|---|
| 100 cm ve üstü | Yeşil | Sessiz | GUVENLI |
| 50 - 100 cm | Yeşil | Yavaş bip | GUVENLI |
| 20 - 50 cm | Sarı | Sıklaşan bip | YAKLASIYOR |
| 20 cm'den az | Kırmızı | Sürekli ses | DUR! |

Bip aralığı mesafeye bağlıdır: 100 cm'de 800 ms, 20 cm'de 100 ms. Arası `map()` ile orantılı hesaplanır. Her bip 40 ms sürer.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| HC-SR04 VCC | Uno **5V** |
| HC-SR04 GND | Uno **GND** |
| HC-SR04 TRIG | Uno **D9** |
| HC-SR04 ECHO | Uno **D10** |
| Buzzer **+** | Uno **D8** |
| Buzzer **-** | Uno **GND** |
| Yeşil LED + 330 Ω direnç | Uno **D11** → direnç **1**; direnç **2** → LED **A**; LED **K** → Uno **GND** |
| Sarı LED + 330 Ω direnç | Uno **D12** → direnç **1**; direnç **2** → LED **A**; LED **K** → Uno **GND** |
| Kırmızı LED + 330 Ω direnç | Uno **D13** → direnç **1**; direnç **2** → LED **A**; LED **K** → Uno **GND** |
| I2C LCD 16x2 | **SDA** → Uno **A4**, **SCL** → Uno **A5**, **VCC** → Uno **5V**, **GND** → Uno **GND** |

Buzzer'ı seçip sağ panelden **Tür**'ü **Aktif** yap (varsayılan "Pasif"tir ve `tone()` ister). LED'lerin renklerini de özellik panelinden ayarla (yeşil, sarı, kırmızı). LCD'nin I2C adresi panelde yazar; kodla aynı olmalı (0x27).

Aktif buzzer'ın içinde kendi osilatörü vardır: pine HIGH verince öter, LOW verince susar. Pasif buzzer kullanıyorsan `digitalWrite` yerine `tone()` gerekir (18. ders). Bilgi notu: gerçek bir buzzer'ın akımı pinin sınırlarına yakın olabilir; sürücülü bir modül ya da veri sayfasına uygun bir direnç kullanılır.

### Program
Sistem beş iş yapar ve hiçbirinde uzun `delay` yoktur:
1. Her 60 ms'de bir mesafeyi ölçer.
2. Ölçümü pencereye koyar ve medyanı alır (filtreli mesafe).
3. Filtreli mesafeye göre LED'leri seçer.
4. Buzzer'ı mesafeye göre sessiz, aralıklı ya da sürekli yapar.
5. Her 250 ms'de bir LCD'yi günceller.

```cpp
// sketch: park_sensoru
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const int TRIG = 9;
const int ECHO = 10;
const int BUZZER = 8;
const int LED_YESIL = 11;
const int LED_SARI = 12;
const int LED_KIRMIZI = 13;

const float MENZIL = 400.0;               // yankı yok: uzak say
const float BIP_BASLANGIC = 100.0;        // bundan yakında bip başlar
const float SARI_MESAFE = 50.0;           // bundan yakında sarı
const float DUR_MESAFE = 20.0;            // bundan yakında sürekli ses
const unsigned long OLCUM_ARALIGI = 60;   // ms
const unsigned long EKRAN_ARALIGI = 250;  // ms
const unsigned long BIP_SURESI = 40;      // ms
const int N = 5;

LiquidCrystal_I2C lcd(0x27, 16, 2);

float pencere[N];
int sira = 0;
float mesafe = MENZIL;                    // filtreli mesafe

unsigned long sonOlcum = 0;
unsigned long sonEkran = 0;
unsigned long bipBasla = 0;
bool bipAcik = false;

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return MENZIL;
  float cm = sure * 0.0343 / 2.0;
  return cm > MENZIL ? MENZIL : cm;
}

float medyan(float a[], int n) {
  float b[N];
  for (int i = 0; i < n; i++) b[i] = a[i];
  for (int i = 1; i < n; i++) {
    float x = b[i];
    int j = i - 1;
    while (j >= 0 && b[j] > x) {
      b[j + 1] = b[j];
      j--;
    }
    b[j + 1] = x;
  }
  return b[n / 2];
}

void ledGuncelle() {
  digitalWrite(LED_YESIL, mesafe >= SARI_MESAFE);
  digitalWrite(LED_SARI, mesafe >= DUR_MESAFE && mesafe < SARI_MESAFE);
  digitalWrite(LED_KIRMIZI, mesafe < DUR_MESAFE);
}

void buzzerGuncelle(unsigned long simdi) {
  if (mesafe >= BIP_BASLANGIC) {          // uzak: sessiz
    digitalWrite(BUZZER, LOW);
    bipAcik = false;
    return;
  }
  if (mesafe < DUR_MESAFE) {              // çok yakın: sürekli ses
    digitalWrite(BUZZER, HIGH);
    bipAcik = true;
    return;
  }
  // 20-100 cm arası: bip aralığı 100-800 ms
  unsigned long aralik = map((long)mesafe, 20, 100, 100, 800);
  if (bipAcik) {
    if (simdi - bipBasla >= BIP_SURESI) {
      digitalWrite(BUZZER, LOW);
      bipAcik = false;
    }
  } else if (simdi - bipBasla >= aralik) {
    digitalWrite(BUZZER, HIGH);
    bipAcik = true;
    bipBasla = simdi;
  }
}

void ekranGuncelle() {
  char sayi[8];
  lcd.setCursor(0, 0);
  lcd.print("Mesafe:");
  if (mesafe >= MENZIL) {
    lcd.print("   ---");
  } else {
    dtostrf(mesafe, 6, 1, sayi);          // 6 karakter genişlikte, 1 ondalık
    lcd.print(sayi);
  }
  lcd.print(" cm");                       // toplam tam 16 karakter

  lcd.setCursor(0, 1);
  if (mesafe < DUR_MESAFE) lcd.print("DUR!            ");
  else if (mesafe < SARI_MESAFE) lcd.print("YAKLASIYOR      ");
  else lcd.print("GUVENLI         ");
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_YESIL, OUTPUT);
  pinMode(LED_SARI, OUTPUT);
  pinMode(LED_KIRMIZI, OUTPUT);
  digitalWrite(BUZZER, LOW);

  lcd.init();
  lcd.backlight();

  float ilk = tekOlcum();
  for (int i = 0; i < N; i++) pencere[i] = ilk;   // pencereyi ilk okumayla doldur
  mesafe = ilk;
  ledGuncelle();
  ekranGuncelle();
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    pencere[sira] = tekOlcum();
    sira = (sira + 1) % N;
    mesafe = medyan(pencere, N);
    ledGuncelle();
  }

  buzzerGuncelle(simdi);                  // her turda: bip zamanlaması hassas

  if (simdi - sonEkran >= EKRAN_ARALIGI) {
    sonEkran = simdi;
    ekranGuncelle();
  }
}
```

### Nasıl çalışıyor?
1. **Üç saat, üç iş:** `sonOlcum` ölçümü, `sonEkran` ekranı, `bipBasla` bipi yönetir. Her biri `millis()` ile kendi aralığına bakar (27. ders). Hiçbiri diğerini beklemez.
2. **Filtre:** ham ölçüm doğrudan kullanılmaz. Beş ölçümün medyanı `mesafe` olur (38. ders). Böylece tek bir yanlış okuma bip'i bozmaz.
3. **Bip aralığı:** `map((long)mesafe, 20, 100, 100, 800)` 20 cm'yi 100 ms'ye, 100 cm'yi 800 ms'ye çevirir. 60 cm için sonuç 450 ms'dir: bipler 450 ms arayla başlar.
4. **Bip süresi:** her bip 40 ms yanık kalır, sonra buzzer susar. Bir sonraki bip `bipBasla`'dan itibaren `aralik` kadar sonra başlar.
5. **Sürekli ses:** 20 cm'den azsa buzzer pini sürekli HIGH kalır; kenar yoktur, yani düz bir ses.
6. **Ekran:** `dtostrf(mesafe, 6, 1, sayi)` ondalık sayıyı sağa yaslı, 6 karakterlik bir metne çevirir. Satır her seferinde tam 16 karakter olduğu için eski karakterler ekranda kalmaz. Ekranı 250 ms'de bir güncelleriz; LCD yavaş bir cihazdır, her turda yazmak bipin zamanlamasını bozardı.
7. **Yankı yok:** `tekOlcum` yankı gelmezse 400 döndürür; bu durumda ekran `---` gösterir, sistem sessizdir ve yeşil yanar.

Tepki süresi: medyan filtre yüzünden mesafe aniden değişirse sistem 3 ölçümde, yani yaklaşık 180 ms sonra tepki verir. Park hızlarında (yürüme hızı civarı) bu kabul edilebilir bir bedeldir.

### Dene
- `BIP_SURESI` değerini 100 ms yap. 20 cm civarında bipler birbirine karışıyor mu?
- Sarı ve kırmızı sınırlarda LED titrerse (ölçüm 19,9 ile 20,1 arasında gidip geliyorsa) ne olur? Termostattaki histerezis fikrini buraya uygula: kırmızıya geçiş 20 cm'de, kırmızıdan çıkış 25 cm'de olsun.
- 13. dersteki NTC devresini kur (10 kΩ ve NTC, orta nokta A2) ve ses hızını sıcaklığa göre düzelt (36. dersteki formül). NTC'nin Sıcaklık özelliğini 0 °C ve 35 °C yaparak düzeltilmiş mesafeyi seri monitörde yazdır. Laboratuvardaki HC-SR04 sabit bir ses hızıyla çalışır; bu düzeltme asıl olarak gerçek sensörde fark yaratır, burada yalnızca hesabı denersin.
- Mesafe özelliğini 150 cm'den 15 cm'e doğru yavaşça kaydır. LED renkleri, bip sıklığı ve LCD yazısı hangi mesafelerde değişiyor? Tabloyla uyuşuyor mu?
- Pasif buzzer için `digitalWrite(BUZZER, HIGH)` yerine `tone(BUZZER, 2000)`, susturmak için `noTone(BUZZER)` kullan.

### Sık yapılan hatalar
- Bip için `delay()` kullanmak: ölçüm, ekran ve diğer işler bip süresince durur. Bütün işler `millis()` ile kendi saatinde çalışmalı.
- LCD'yi her turda güncellemek: I2C iletişimi uzun sürer ve bip ritmi bozulur.
- LCD satırını tam 16 karaktere tamamlamamak: "100.0 cm"den "45.3 cm"e inince eski karakterler ekranda kalır.
- Filtre olmadan ham ölçümle karar vermek: tek bir aykırı değer kısa bir sessizlik ya da yanlış renk getirir.
- Yankı yok durumunu (`0`) mesafe sanmak: sistem "0 cm" diyerek sürekli öter. Biz bunu 400 cm yaparak sessiz bıraktık; ama gerçek bir araçta "sensör ölçemiyor" diye ayrıca uyarı vermek daha güvenlidir.
- Buzzer'ın Tür özelliğini "Aktif" yapmamak: pasif buzzer `digitalWrite` ile ses vermez.
- Bilgi notu: gerçek bir araçta sensörün 2 cm'den yakınındaki bir yüzey (tampon, kablo) sürekli yanlış ölçüme yol açar. Ayrıca servo, motor ya da fan gibi yükleri sensörle aynı güç hattından beslemek gerilim çökmeleriyle ölçümü bozar; ayrı beslenir, GND'ler ortak yapılır.

## Konuşalım
Gerçek bir arabada sensör arka tamponda yan yana dört tane olurdu. Sensörler aynı anda ölçerse birbirinin sesini duyabilir. Bunu nasıl önlerdin? Sensörleri sırayla ölçmenin bedeli ne olurdu?
