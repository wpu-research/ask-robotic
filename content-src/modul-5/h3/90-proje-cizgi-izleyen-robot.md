# Proje: Çizgi izleyen robot (pist)
süre: 35

## Merak
Bir robot yarışında hakem sadece iki şeye bakar: robot pisti bitirdi mi ve ne kadar sürede? Çizgiyi çok kaybeden robot yavaşlar, bazen de hiç bitiremez. Bu projede bu haftanın bütün parçalarını tek bir programda birleştireceksin. Sonunda robotun kendi tur süresini ve çizgiyi görmediği süreyi sana rapor edecek.

## Etkinlik
### Ne yapacağız?
Bu proje bu haftanın ve önceki haftaların kavramlarını birleştirir:
- **86. ders:** beş sensörlü dizi, eşikle "çizgide mi?" kararı.
- **87. ders:** başlangıçta sallanarak min/max ölçmek, her sensör için eşik = (min + max) / 2. Kontrast çok düşükse (çizgi ile zemin ayırt edilemiyorsa) kalibrasyon başarısız sayılır.
- **88. ders:** bang-bang yön kararı ve son yön hafızası.
- **89. ders:** boşluk geçme, çizgiyi arama, çizgi bulunamazsa dur.
- **27. ve 28. dersler:** `millis()` ve `enum` ile durum makinesi; `delay` hiç yok.
- **77. ve 78. dersler:** yön + PWM ile sürücü kontrolü, ölü bölge (PWM'in %20'nin altında tekerlek dönmez).

Robot bir **pist** boyunca gidecek ve bitiş bandını görünce duracak. Durunca seriye şunu yazacak: `BITTI sure=… kayip=… enuzun=…` (hepsi milisaniye).

### Pist
Pist düzenlidir ama her türden zorluğu içerir. Robot çizginin başlangıcında, çizgi üstünde ve ileri bakarak başlar.

| Bölüm | Uzunluk | Ne var? |
|---|---|---|
| 1. Düz | yaklaşık 60 cm | Başlangıç; robotun arkasında 20 cm çizgi daha var |
| 2. Kavis | yaklaşık 63 cm | Sola 90° kavis, yarıçap 40 cm |
| 3. Düz | 30 cm | Kavisten sonra dik çıkış |
| 4. Dik viraj | | Sağa 90° keskin viraj (L) |
| 5. Düz | 60 cm | Düz parça |
| 6. Boşluk | 9 cm | Çizgi yok; sonra çizgi devam eder |
| 7. Düz ve bitiş | yaklaşık 60 cm | Sonunda çizgiye dik 30 cm'lik bitiş bandı |

Çizgi genişliği 2 cm, sensör aralığı 2,4 cm, sensörler aks hizasından 7 cm öndedir.

### Devre
Standart bağlantılar:

| Parça | Bağlantı |
|---|---|
| Çizgi sensörleri 0…4 | AO → **A0…A4** (A0 en sol), VCC → 5 V, GND → GND |
| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |

Motorlar ve sürücü için harici güç kullan, ortak GND bağla. Pili ters bağlama, uçlarını kısa devre etme.

### Program
Programın akışı:

1. `KALIBRE`: 1,8 sn sola-sağa sallan, her sensörün min/max'ını ölç, eşikleri hesapla ve yaz. Bir sensörün kontrastı `MIN_KONTRAST`'tan küçükse `HATA` durumuna geç ve robotu hareket ettirme.
2. `IZLE`: 88. dersin bang-bang kuralı. Orta sensör çizgideyken düz, kenar sensörü görürse o yöne dön.
3. Hiçbir sensör çizgiyi görmezse: son yön orta idiyse `BOSLUK` (düz git), kenar idiyse `ARAMA` (o yöne yerinde dön).
4. Beş sensör birden çizgideyse ve başlangıçtan 3 sn geçtiyse bu bitiş bandıdır: dur ve raporu yaz.

Çizgiyi görmediği süre (`kayipMs`) ve tek seferde en uzun kesinti (`enUzunMs`) çalışırken biriktirilir.

```cpp
// sketch: cizgi_proje
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};

const int HIZ = 170;
const int SALLA_PWM = 120;
const unsigned long KALIBRASYON_MS = 1800;
const int MIN_KONTRAST = 200;                 // max - min bundan kucukse kalibrasyon basarisiz
const unsigned long BOSLUK_MS = 900;
const unsigned long ARAMA_MS = 2500;
const unsigned long BITIS_BEKLE_MS = 3000;    // baslangictan once bitis aranmaz

enum Durum { KALIBRE, IZLE, BOSLUK, ARAMA, BITTI, HATA };
Durum durum = KALIBRE;

int enAz[SENSOR_SAYISI];
int enCok[SENSOR_SAYISI];
int esik[SENSOR_SAYISI];
int sonYon = 0;                               // -1 sol, 0 orta, +1 sag
unsigned long durumBasla = 0;
unsigned long turBasla = 0;
unsigned long sonTur = 0;
unsigned long kayipMs = 0;
unsigned long kesintiMs = 0;
unsigned long enUzunMs = 0;

void motor(int sol, int sag) {
  digitalWrite(SOL_IN1, sol > 0);
  digitalWrite(SOL_IN2, sol < 0);
  analogWrite(SOL_EN, abs(sol));
  digitalWrite(SAG_IN3, sag > 0);
  digitalWrite(SAG_IN4, sag < 0);
  analogWrite(SAG_EN, abs(sag));
}

void gec(Durum yeni) {
  durum = yeni;
  durumBasla = millis();
}

void kalibreAdimi(unsigned long t) {
  if (t < 400) motor(-SALLA_PWM, SALLA_PWM);
  else if (t < 1200) motor(SALLA_PWM, -SALLA_PWM);
  else if (t < 1600) motor(-SALLA_PWM, SALLA_PWM);
  else motor(0, 0);
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    int v = analogRead(SENSOR_PIN[i]);
    if (v < enAz[i]) enAz[i] = v;
    if (v > enCok[i]) enCok[i] = v;
  }
}

bool esikleriHesapla() {
  bool tamam = true;
  Serial.print("esikler:");
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    esik[i] = (enAz[i] + enCok[i]) / 2;
    if (enCok[i] - enAz[i] < MIN_KONTRAST) tamam = false;
    Serial.print(' ');
    Serial.print(esik[i]);
  }
  Serial.println();
  return tamam;
}

void setup() {
  for (int p = 5; p <= 10; p++) {
    pinMode(p, OUTPUT);
  }
  Serial.begin(9600);
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    enAz[i] = 1023;
    enCok[i] = 0;
  }
  gec(KALIBRE);
}

void loop() {
  unsigned long simdi = millis();
  unsigned long gecen = simdi - durumBasla;

  if (durum == KALIBRE) {
    kalibreAdimi(gecen);
    if (gecen >= KALIBRASYON_MS) {
      if (esikleriHesapla()) {
        turBasla = simdi;
        sonTur = simdi;
        gec(IZLE);
      } else {
        Serial.println("KALIBRASYON HATASI");
        gec(HATA);
      }
    }
    return;
  }
  if (durum == BITTI || durum == HATA) {
    motor(0, 0);
    return;
  }

  bool s[SENSOR_SAYISI];
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    s[i] = analogRead(SENSOR_PIN[i]) > esik[i];
  }
  bool sol = s[0] || s[1];
  bool sag = s[3] || s[4];
  bool orta = s[2];
  bool hepsi = s[0] && s[1] && s[2] && s[3] && s[4];
  bool hicbiri = !(sol || sag || orta);

  // olcum: cizgiyi gormedigimiz sure
  unsigned long dt = simdi - sonTur;
  sonTur = simdi;
  if (hicbiri) {
    kayipMs += dt;
    kesintiMs += dt;
    if (kesintiMs > enUzunMs) enUzunMs = kesintiMs;
  } else {
    kesintiMs = 0;
  }

  if (hepsi && simdi - turBasla > BITIS_BEKLE_MS) {
    motor(0, 0);
    Serial.print("BITTI sure=");
    Serial.print(simdi - turBasla);
    Serial.print(" kayip=");
    Serial.print(kayipMs);
    Serial.print(" enuzun=");
    Serial.println(enUzunMs);
    gec(BITTI);
    return;
  }

  switch (durum) {
    case IZLE:
      if (hicbiri) {
        gec(sonYon == 0 ? BOSLUK : ARAMA);
        break;
      }
      if (sol) sonYon = -1;
      else if (sag) sonYon = 1;
      else sonYon = 0;
      if (sonYon == 0) motor(HIZ, HIZ);
      else if (sonYon < 0) motor(0, HIZ);
      else motor(HIZ, 0);
      break;

    case BOSLUK:
      if (!hicbiri) { gec(IZLE); break; }
      if (gecen > BOSLUK_MS) { gec(ARAMA); break; }
      motor(HIZ, HIZ);
      break;

    case ARAMA:
      if (!hicbiri) { gec(IZLE); break; }
      if (gecen > ARAMA_MS) {
        motor(0, 0);
        Serial.println("CIZGI KAYBOLDU");
        gec(HATA);
        break;
      }
      if (sonYon <= 0) motor(-HIZ, HIZ);
      else motor(HIZ, -HIZ);
      break;

    default:
      break;
  }
}
```

### Nasıl çalışıyor?
1. Her `loop` turunda sırayla: durum `KALIBRE` ise kalibrasyon adımı; `BITTI` ya da `HATA` ise dur; aksi hâlde sensörleri oku, ölçümü güncelle, bitişe bak, sonra duruma göre sür. Hiçbir yerde `delay` yok, bu yüzden sensörler hep taze okunur.
2. Eşik her sensör için ayrıdır ve kalibrasyonda ölçülür. Benzetimde `esikler: 511 511 511 511 511` yazar. `MIN_KONTRAST = 200` bir güvenlik önlemidir: robot yanlışlıkla çizgiden uzak bir yere konmuşsa (sensörler hiç çizgi görmedi) program `KALIBRASYON HATASI` yazar ve robotu sürmez; bu durumda robot yerinde kalır.
3. `BOSLUK` durumu 9 cm'lik boşluğu düz gider (yaklaşık 0,4 sn). `BOSLUK` ile `ARAMA` aynı `hicbiri` koşuluyla başlar; ayıran şey `sonYon`'dur.
4. `kayipMs` ve `enUzunMs` programın kendi ölçümüdür. İkisi de sensörlerden hesaplanır. Bu pistte en uzun kesinti boşlukta oluşur; boşluk 15 cm olunca yaklaşık 0,6 sn'ye çıkar ve `BOSLUK_MS = 900` yine yeter.
5. Bitiş bandı beş sensörü birden çizgiye sokar. İlk 3 sn bu koşul aranmaz; böylece başlangıç sırasında oluşabilecek tuhaf bir okuma yanlışlıkla robotu durdurmaz.

### Ölçüm raporu
Benzetimde `HIZ = 170` ile aldığım değerler (yaklaşık):

| Ölçüm | Değer |
|---|---|
| Kalibrasyon | 1,8 sn |
| Tur süresi (kalibrasyon hariç) | ≈ 13,3 sn |
| Çizgiyi görmediği toplam süre | ≈ 2,7 sn |
| En uzun tek kesinti (boşluk) | ≈ 0,37 sn |

Aynı pistte yalnız `HIZ` değerini değiştirince benzetimde şunları gördüm:

| `HIZ` | Tur süresi | Çizgiyi görmediği süre | Sonuç |
|---|---|---|---|
| 140 | ≈ 17,6 sn | ≈ 3,8 sn | bitirdi |
| 170 | ≈ 13,3 sn | ≈ 2,7 sn | bitirdi |
| 200 | ≈ 10,8 sn | ≈ 2,2 sn | bitirdi |
| 230 | ≈ 8,6 sn | ≈ 1,3 sn | bitirdi |
| 255 | - | - | dik virajda çizgiyi bulamadı, `CIZGI KAYBOLDU` yazdı ve durdu |

Bu pistte hız arttıkça hem süre hem kayıp azaldı, ama en yüksek hızda robot pisti bitiremedi. "Hızlı olan daha iyidir" kuralının bir sınırı var; sınırı sen bulmaya çalış.

### Dene
- `HIZ` için 240-250 arasında bir değer dene. Pisti bitirebilen en yüksek hız hangisi?
- Robotu çizgiden 15 cm uzağa koy ve başlat. `KALIBRASYON HATASI` yazıyor mu, robot hareket ediyor mu?
- Kendi ekleyeceğin bir özellik: `HATA` ya da `BITTI` durumunda D13'teki LED'i yaktır (başarılıysa yanıp sönsün, hata ise sürekli yansın).

### Sık yapılan hatalar
- Kalibrasyonu robot çizgideyken başlatmamak: min/max yanlış çıkar.
- Başlangıç anında bitiş koşulunu açık bırakmak: ilk okuma robotu hemen durdurabilir. `BITIS_BEKLE_MS` bu yüzden var.
- Hızı artırıp `BOSLUK_MS`'i sabit bırakmak: robot boşlukta daha uzun yol alır.
- `ARAMA`'yı sınırlamamak: çizgi bitince robot sonsuza kadar döner. Süre dolunca durmak güvenlik içindir.
- Eşikleri el ile yazmak: ışık değiştiğinde proje çalışmaz olur (87. ders).

### Gerçek robotta farklı olabilecekler
Benzetimde sensörler gürültüsüz ve tekerlekler kaymaz. Gerçek robotta okumalar titrer (eşik civarında histerezis, 88. ders, işe yarar), pil gerilimi azaldıkça robot yavaşlar ve bitiş bandı ile bir kavşağı ayırt etmek için daha fazla bilgi gerekebilir. Bu projedeki değerler (`BOSLUK_MS`, `HIZ`) senin robotunda yeniden ayarlanmalıdır.

## Konuşalım
Robotun çizgiyi "daha az kaybetmesi" mi, yoksa "daha hızlı bitirmesi" mi daha önemli? Hangi durumlarda hangisini seçerdin? Bunu sayıyla (tur süresi, kayıp süresi) nasıl savunurdun?
