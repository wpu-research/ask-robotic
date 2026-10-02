# Yapım 2: entegrasyon ve test
süre: 40

## Merak
Dünkü Yol C alt sistemi hedef kaybolunca 38 cm ileri koşmuştu. PID hata yapmadı; yalnızca "hedef yok" diye bir şey bilmiyordu. Alt sistemler parçaların işini yapar, ama hangisinin ne zaman çalışacağına bir karar katmanı karar verir. Bu derste parçaları **durum makinesiyle** (28. ve 84. dersler) birleştirecek ve bir **test matrisiyle** sınayacaksın.

## Etkinlik
Birleştirmenin kuralı basittir: her durumda tek bir davranış çalışır, durumlar arası geçişler koşullara bağlıdır, her koşul bir sensörden ya da zamandan gelir.

Sen yalnız seçtiğin yolun bölümünü yap; diğerlerini okumak zorunda değilsin.

### Test matrisi nedir?
Bir tablo: her satır bir **senaryo**, her sütun **beklenen sonuç** ve **ölçülen sonuç**. Önce beklenen sütunu doldurursun (ders 111'deki ölçütlerden), sonra ölçersin, sonra karşılaştırırsın. Hata varsa satır kırmızıya döner ve nedenini aranır. Aşağıda her yolun matrisi var; ölçülen sütunu simülatörden aldık.

### Yol A: çizgi izle, engelden kaç, bitiş çizgisinde dur
Durumlar:

| Durum | Ne yapar | Çıkış koşulu |
|---|---|---|
| CIZGI_IZLE | Çizgi konumuna göre iki tekerleğin hızını ayarlar | Daha önce çizgi görüldü ve 300 ms çizgi yok: SERBEST |
| SERBEST | Düz gider | Üç sensör birden çizgide: BITTI. Önde 28 cm'den yakın engel: SOLA_DON |
| SOLA_DON | Yerinde sola döner (420 ms, yaklaşık 90°) | Süre doldu: YANA_GIT |
| YANA_GIT | Düz gider, engelin yanından geçer (2 sn) | Süre doldu: SAGA_DON |
| SAGA_DON | Yerinde sağa döner (420 ms) | Süre doldu: SERBEST |
| BITTI | Durur | Yok |

Sürüş, mesafe ve çizgi fonksiyonları ders 112'dekilerle aynıdır; yeni olan `loop()` içindeki durum makinesidir. Mesafe her 60 ms'de bir ölçülür. Programda `delay()` yoktur (HC-SR04 için gereken kısa `delayMicroseconds` ve `pulseIn` hariç): dönüş ve yan gitme süreleri `millis()` ile sayılır (27. ders).

```cpp
// sketch: a_arac
// Yol A: çizgiyi izle, çizgi bitince engelden kaçarak ilerle, bitiş çizgisinde dur.
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12;
const int CIZGI[5] = {A0, A1, A2, A3, A4};

const int OLU_BOLGE = 51;          // PWM'in %20'si: altında tekerlek dönmez
const int TABAN = 150;             // düz giderken hız
const float KP = 55.0;             // çizgi konumu başına hız farkı
const float ENGEL_CM = 28.0;       // bundan yakınsa engel var
const unsigned long KAYIP_MS = 300;   // çizgisiz geçen bu süre = çizgi bitti
const unsigned long DONUS_MS = 420;   // yaklaşık 90 derece dönüş süresi (ölçerek bulundu)
const unsigned long YAN_MS = 2000;    // engelin yanından gitme süresi

enum Durum { CIZGI_IZLE, SERBEST, SOLA_DON, YANA_GIT, SAGA_DON, BITTI };
Durum durum = CIZGI_IZLE;
unsigned long durumBasla = 0;
unsigned long sonCizgi = 0;
bool cizgiGordu = false;

float mesafeler[3] = {400, 400, 400};
unsigned long sonOlcum = 0;

void motor(int en, int in1, int in2, int hiz) {
  hiz = constrain(hiz, -255, 255);
  if (hiz == 0) { digitalWrite(in1, LOW); digitalWrite(in2, LOW); analogWrite(en, 0); return; }
  digitalWrite(in1, hiz > 0);
  digitalWrite(in2, hiz < 0);
  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));
}

void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long s = pulseIn(ECHO, HIGH, 15000);
  return s == 0 ? 400.0 : s / 58.0;   // yankı yoksa "çok uzak"
}

// Son 3 ölçümün ortancası (tek bir hatalı okuma kararı bozmaz)
float mesafe() {
  mesafeler[0] = mesafeler[1];
  mesafeler[1] = mesafeler[2];
  mesafeler[2] = tekOlcum();
  float a = mesafeler[0], b = mesafeler[1], c = mesafeler[2];
  if (a > b) { float t = a; a = b; b = t; }
  if (b > c) { float t = b; b = c; c = t; }
  if (a > b) { float t = a; a = b; b = t; }
  return b;
}

// Çizgi konumu: -2 ... +2 (artı = çizgi solda). Kaç sensör çizgide: sayi
float cizgiKonum(int &sayi) {
  float toplam = 0;
  sayi = 0;
  for (int i = 0; i < 5; i++) {
    if (analogRead(CIZGI[i]) > 512) {   // çizgi ~860, zemin ~164
      toplam += 2 - i;
      sayi++;
    }
  }
  return sayi ? toplam / sayi : 0;
}

void durumDegis(Durum yeni) {
  durum = yeni;
  durumBasla = millis();
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();
  int sayi;
  float konum = cizgiKonum(sayi);

  // Mesafeyi 60 ms'de bir ölç
  static float onde = 400;
  if (simdi - sonOlcum >= 60) {
    sonOlcum = simdi;
    onde = mesafe();
  }

  switch (durum) {
    case CIZGI_IZLE:
      if (sayi > 0) {
        cizgiGordu = true;
        sonCizgi = simdi;
        int fark = (int)(KP * konum);
        surus(TABAN - fark, TABAN + fark);
      } else if (cizgiGordu && simdi - sonCizgi > KAYIP_MS) {
        durumDegis(SERBEST);
        Serial.println("durum: SERBEST");
      }
      // çizgi hiç görülmediyse (başlangıç) son komut sürer
      break;

    case SERBEST:
      if (sayi >= 3) {
        surus(0, 0);
        durumDegis(BITTI);
        Serial.println("durum: BITTI");
      } else if (onde < ENGEL_CM) {
        durumDegis(SOLA_DON);
      } else {
        surus(TABAN, TABAN);
      }
      break;

    case SOLA_DON:
      surus(-TABAN, TABAN);
      if (simdi - durumBasla >= DONUS_MS) durumDegis(YANA_GIT);
      break;

    case YANA_GIT:
      surus(TABAN, TABAN);
      if (simdi - durumBasla >= YAN_MS) durumDegis(SAGA_DON);
      break;

    case SAGA_DON:
      surus(TABAN, -TABAN);
      if (simdi - durumBasla >= DONUS_MS) durumDegis(SERBEST);
      break;

    case BITTI:
      surus(0, 0);
      break;
  }
}
```

**Nasıl çalışıyor?**
1. Her `loop` turunda çizgi okunur, 60 ms'de bir mesafe ölçülür, sonra yalnızca **o anki durumun** kodu çalışır.
2. `CIZGI_IZLE` içinde çizgi konumuna göre bir fark hesaplanır: `fark = KP · konum`. Çizgi solda (konum artı) ise sol tekerlek yavaşlar, sağ hızlanır, robot sola döner.
3. "Çizgi bitti" kararı tek bir okumaya bağlı değildir: çizgi 300 ms boyunca hiç görülmezse SERBEST'e geçilir. Tek bir sensör hatası, çizgi bitişi sanılmaz (89. ders).
4. Engel dolanma bir **desen**dir: sola dön, yana git, sağa dön, tekrar bak. Engel hâlâ ortadaysa durum makinesi aynı deseni tekrar eder. Duvarın ucunu bir turda aşamazsa ikinci turda aşar.
5. Bitiş çizgisi çapraz olduğu için üç sensör birden görür. Bu kontrol yalnız SERBEST durumunda yapılır; çizgi izlerken yanıltmasın.

**Test matrisi (Yol A).** Geçme koşulu: bitiş çizgisinde durmak, çarpmamak (robot merkezi ile en yakın duvar arası en az 8 cm; robot yarıçapı 7,5 cm) ve 20 sn'den kısa sürmek.

| No | Senaryo | Beklenen | Ölçülen (simülatör) |
|---|---|---|---|
| T1 | Çizginin 4 cm sağında başla | Bitir, çarpma yok | 11,2 sn, en yakın duvar 18,1 cm |
| T2 | 5 cm sağda, 6° açılı başla | Bitir, çarpma yok | 11,2 sn, en yakın duvar 18,2 cm |
| T3 | 3 cm solda, -6° açılı başla | Bitir, çarpma yok | 11,2 sn, en yakın duvar 18,1 cm |
| T4 | Sağ motor %4 zayıf | Bitir, çarpma yok | 11,2 sn, en yakın duvar 10,0 cm |
| T5 | Sağ motor %3 güçlü | Bitir, çarpma yok | 11,4 sn, en yakın duvar 12,7 cm |
| T6 | Bitiş sonrası 1 sn bekle | Robot kıpırdamaz | Kıpırdamadı (5 mm'den az) |

T4 ve T5'te duvara yakınlık azaldı; yani tekerlek uyumsuzluğu tolerans payını yiyor. Bu payı bilmek, ölçütü gerçek robotta yazarken önemlidir (93. ders).

**Arenada sensör aralığı farklı: KP'yi yeniden ayarla.** Yukarıdaki tablo, sensörleri 2,0 cm aralıklı dizilmiş bir sınama düzeneğinde ölçüldü. Laboratuvardaki **arenada** (bu dersin etkinliği) çizgi sensörleri 2,4 cm aralıklıdır. `cizgiKonum()` konumu sensör **numarası** cinsinden verir (−2 ... +2); sensörler %20 daha seyrek olduğundan aynı konum değeri artık %20 daha büyük bir gerçek sapmaya karşılık gelir ve `KP = 55` ile düzeltme fazla sert olur. Arenada ölçtüğümüz:

| `KP` | Arena sonucu |
|---|---|
| 55 | Çizgiyi kaybediyor: 3,6 sn'de, çizgi bitmeden (x = 1,02 m; çizgi 1,30 m'ye kadar gidiyor) çaprazın ortasında `durum: SERBEST` yazılıyor. Robot serbest dolaşıp 3 kez çarpıyor ve pisti bitiremiyor |
| 52 ve altı | Bitiriyor (yaklaşık 11,5 sn), çarpma yok |
| **46** | Bitiriyor (11,3 sn), çarpma yok; `SERBEST`'e doğru yerde, çizgi bittikten sonra (x = 1,31 m) geçiyor |

Öneri: arenada `KP = 46` kullan (55 / 1,2 ≈ 46; sensör aralığı %20 büyüdüğü için kazancı aynı oranda küçülttük). Genel kural: sensör aralığını değiştirirsen ya da farklı bir dizi kullanırsan `KP`'yi yeniden ölç; bir sayıyı başka bir düzenekten kopyalama. Arena etkinliğinin çözümünde bu yüzden `KP = 46` yazar. Bu dersin metnindeki `a_arac` sketch'i 2,0 cm'lik sınama düzeneğine göre `KP = 55` bırakıldı.

### Yol B: üç noktadan al-bırak dizisi
*Arena etkinliğinde **B: Robot kol** sekmesi: parça P1'de durur, yeşil daire P3'tür; tutucu 90°'nin üstünde kapalı sayılır (bu dersteki sketch'te açık = 30°, kapalı = 100°). Arena parçanın gerçekten alınıp bırakıldığını da sınar.*

Durumlar:

| Durum | Ne yapar | Çıkış koşulu |
|---|---|---|
| P1_GIT | Kolu P1'e götürür | Vardı ve 500 ms bekledi: tutucuyu kapat, P1_TUT |
| P1_TUT | Tutucunun kapanmasını bekler | 500 ms geçti: P2'ye yönel, P2_GIT |
| P2_GIT | Parçayı P2'ye taşır | Vardı ve bekledi: P3'e yönel, P3_GIT |
| P3_GIT | Parçayı P3'e taşır | Vardı ve bekledi: tutucuyu aç, P3_BIRAK |
| P3_BIRAK | Tutucunun açılmasını bekler | 500 ms geçti: "dizi bitti", BITTI |

Kol noktalar arasında zıplamaz: her 20 ms'de her eklem en çok 1,5° ilerler (`adimAt`). Hareket yumuşak olur, servo ve parça ani sarsılmaz. Bekleme süreleri kolun oturması ve tutucunun kapanması içindir. Sketch her noktaya varışta bir satır yazar (`nokta=1`, `nokta=2`, `nokta=3`), böylece ölçüm anını biliriz.

```cpp
// sketch: b_kol
// Yol B: üç noktadan al-bırak dizisi. P1'den al, P2'den geçir, P3'e bırak.
#include <Servo.h>

const int OMUZ_PIN = 9;
const int DIRSEK_PIN = 10;
const int TUTUCU_PIN = 11;

const float L1 = 10.0;
const float L2 = 10.0;
const int US_MIN = 544;
const int US_MAX = 2400;
const float TUTUCU_ACIK = 30.0;
const float TUTUCU_KAPALI = 100.0;

const float NOKTA_X[3] = {12.0, 8.0, 4.0};     // cm
const float NOKTA_Y[3] = {4.0, 10.0, 12.0};
const float ADIM_DERECE = 1.5;                 // her 20 ms'de en çok bu kadar
const unsigned long ADIM_MS = 20;
const unsigned long BEKLEME_MS = 500;          // noktada durma süresi

enum Durum { P1_GIT, P1_TUT, P2_GIT, P3_GIT, P3_BIRAK, BITTI };
Durum durum = P1_GIT;

Servo omuz, dirsek, tutucu;
float omuzSimdi = 90, dirsekSimdi = 0;         // şu anki açılar
float omuzHedef = 90, dirsekHedef = 0;         // gidilecek açılar
unsigned long sonAdim = 0;
unsigned long beklemeBasla = 0;
bool bekliyor = false;

int dereceyiUsYap(float aci) {
  aci = constrain(aci, 0.0, 180.0);
  return (int)(US_MIN + aci * (US_MAX - US_MIN) / 180.0 + 0.5);
}

bool tersKinematik(float x, float y, float &omuzAci, float &dirsekAci) {
  float c = (x * x + y * y - L1 * L1 - L2 * L2) / (2.0 * L1 * L2);
  if (c < -1.0 || c > 1.0) return false;
  float s2 = acos(c);                          // q2: dirsek bükülmesi (0 = düz, 90 = dik)
  float q1 = atan2(y, x) + atan2(L2 * sin(s2), L1 + L2 * cos(s2));
  omuzAci = q1 * 180.0 / PI;
  dirsekAci = s2 * 180.0 / PI;
  return omuzAci >= 0.0 && omuzAci <= 180.0 && dirsekAci >= 0.0 && dirsekAci <= 180.0;
}

void noktayaGit(int n) {
  if (!tersKinematik(NOKTA_X[n], NOKTA_Y[n], omuzHedef, dirsekHedef)) {
    Serial.println("hata: nokta ulasilamaz");
  }
}

// Açıyı hedefe doğru bir adım ilerlet. Vardıysa true.
bool adimAt() {
  float fo = omuzHedef - omuzSimdi;
  float fd = dirsekHedef - dirsekSimdi;
  omuzSimdi += constrain(fo, -ADIM_DERECE, ADIM_DERECE);
  dirsekSimdi += constrain(fd, -ADIM_DERECE, ADIM_DERECE);
  omuz.writeMicroseconds(dereceyiUsYap(omuzSimdi));
  dirsek.writeMicroseconds(dereceyiUsYap(dirsekSimdi));
  return fabs(fo) < 0.01 && fabs(fd) < 0.01;
}

void nokta(int n) {                            // dizi kaydı: ölçüm için seri satır
  Serial.print("nokta=");
  Serial.println(n);
}

void setup() {
  Serial.begin(9600);
  omuz.attach(OMUZ_PIN, US_MIN, US_MAX);
  dirsek.attach(DIRSEK_PIN, US_MIN, US_MAX);
  tutucu.attach(TUTUCU_PIN, US_MIN, US_MAX);
  omuz.writeMicroseconds(dereceyiUsYap(omuzSimdi));
  dirsek.writeMicroseconds(dereceyiUsYap(dirsekSimdi));
  tutucu.writeMicroseconds(dereceyiUsYap(TUTUCU_ACIK));
  noktayaGit(0);
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonAdim < ADIM_MS) return;
  sonAdim = simdi;

  if (durum == BITTI) return;

  bool vardi = adimAt();
  if (!vardi) return;

  // Vardık: biraz bekle (kol otursun), sonra sıradaki işe geç
  if (!bekliyor) {
    bekliyor = true;
    beklemeBasla = simdi;
    return;
  }
  if (simdi - beklemeBasla < BEKLEME_MS) return;
  bekliyor = false;

  switch (durum) {
    case P1_GIT:
      nokta(1);
      tutucu.writeMicroseconds(dereceyiUsYap(TUTUCU_KAPALI));   // al
      durum = P1_TUT;
      break;
    case P1_TUT:
      noktayaGit(1);
      durum = P2_GIT;
      break;
    case P2_GIT:
      nokta(2);
      noktayaGit(2);
      durum = P3_GIT;
      break;
    case P3_GIT:
      nokta(3);
      tutucu.writeMicroseconds(dereceyiUsYap(TUTUCU_ACIK));     // bırak
      durum = P3_BIRAK;
      break;
    case P3_BIRAK:
      Serial.println("dizi bitti");
      durum = BITTI;
      break;
    default:
      break;
  }
}
```

**Nasıl çalışıyor?**
1. `noktayaGit(n)` yalnızca **hedef açıları** belirler. Servoyu asıl hareket ettiren `adimAt()`'tir; `loop` her 20 ms'de bir çağırır.
2. `adimAt()` her eklemi hedefe doğru en çok 1,5° ilerletir ve her ikisi de vardıysa `true` döner. Böylece iki eklem aynı anda yola çıkar, kol yaylanmadan yürür.
3. Vardıktan sonra 500 ms beklenir. Bu bekleme kolun mekanik olarak oturması ve tutucunun kapanması içindir. Simülatör servoyu anında bulur; **gerçek servo darbeyi aldığı anda yerinde olmaz**, bu beklemeyi kendi kolunda ölçerek ayarla.
4. Her varışta `nokta=N` yazılır. Ölçüm bu satırın geldiği an yapılır.

**Test matrisi (Yol B).** Ölçüm: nokta satırının geldiği anda D9 ve D10 pinlerindeki darbelerden uç noktası hesaplanır ve hedefle karşılaştırılır. Bu **komut edilen** konumdur; simülatör servonun mekanik hatasını içermez.

| No | Senaryo | Beklenen | Ölçülen (simülatör) |
|---|---|---|---|
| T1 | P1'e var | Uç noktası hatası < 5 mm; tutucu açık | 0,05 mm; tutucu açık |
| T2 | P2'ye taşı | Hata < 5 mm; tutucu kapalı (parça elde) | 0,06 mm; tutucu kapalı |
| T3 | P3'e taşı | Hata < 5 mm | 0,09 mm |
| T4 | Dizi bitişi | "dizi bitti" yazar; tutucu açık; 15 sn'den kısa | 4,2 sn; tutucu açık |
| T5 | Hareketin yumuşaklığı | Omuz hiçbir 20 ms'de 2,5°'den fazla sıçramaz | Sıçramadı |

Gerçek kolda bu sayılar bu kadar iyi çıkmaz; tablodaki 0,05-0,09 mm, matematiğin ve servo darbesinin doğruluğudur. Kalan hatayı cetvelle ve kendi kolunla ölçeceksin.

### Yol C: hedefi takip et, kaybolursa dur
*Arena etkinliğinde **C: Takip** sekmesi: levha hareketi (uzaklaşma, kaybolma, geri dönme) arenada zamanla kendiliğinden olur; aşağıdaki T1, T5 ve T6 satırlarını sen elle yapmadan görürsün.*

Durumlar:

| Durum | Ne yapar | Çıkış koşulu |
|---|---|---|
| BEKLE | Durur, hedef arar | Menzilde (100 cm içinde) hedef görüldü: TAKIP |
| TAKIP | PID ile 20 cm mesafeyi korur | Art arda 8 ölçüm (yaklaşık 0,5 sn) hedef yok: KAYIP |
| KAYIP | Durur | Hedef göründü: TAKIP (PID sıfırlanır) |

Önemli ayrıntı: hedef yok olduğu **an** motorlar durur; KAYIP durumuna geçmeyi beklemez. Dur komutu, durum yazmaktan önce gelir. Hedef geri gelince PID'in integral ve eski hata değerleri sıfırlanır, aksi hâlde eski bir değerle fırlardı.

```cpp
// sketch: c_takip
// Yol C: öndeki hedefi 20 cm mesafeden takip et; hedef kaybolursa dur.
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12;

const int OLU_BOLGE = 51;
const float HEDEF_CM = 20.0;
const float MENZIL_CM = 100.0;         // bundan uzaktaki "hedef" sayılmaz
const float KP = 9.0;
const float KI = 4.0;
const float KD = 6.0;
const float I_SINIR = 40.0;
const float OLU_ARALIK_CM = 0.5;
const unsigned long DONGU_MS = 60;
const int KAYIP_SAYISI = 8;            // art arda bu kadar boş ölçüm = hedef kayıp (~0,5 sn)

enum Durum { BEKLE, TAKIP, KAYIP };
Durum durum = BEKLE;

float mesafeler[3] = {400, 400, 400};
float integral = 0, oncekiHata = 0;
int bosSayac = 0;
unsigned long sonDongu = 0;

void motor(int en, int in1, int in2, int hiz) {
  hiz = constrain(hiz, -255, 255);
  if (hiz == 0) { digitalWrite(in1, LOW); digitalWrite(in2, LOW); analogWrite(en, 0); return; }
  digitalWrite(in1, hiz > 0);
  digitalWrite(in2, hiz < 0);
  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));
}

void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long s = pulseIn(ECHO, HIGH, 15000);
  return s == 0 ? 400.0 : s / 58.0;
}

float mesafe() {
  mesafeler[0] = mesafeler[1];
  mesafeler[1] = mesafeler[2];
  mesafeler[2] = tekOlcum();
  float a = mesafeler[0], b = mesafeler[1], c = mesafeler[2];
  if (a > b) { float t = a; a = b; b = t; }
  if (b > c) { float t = b; b = c; c = t; }
  if (a > b) { float t = a; a = b; b = t; }
  return b;
}

void pidSifirla() {
  integral = 0;
  oncekiHata = 0;
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  if (millis() - sonDongu < DONGU_MS) return;
  sonDongu += DONGU_MS;
  float dt = DONGU_MS / 1000.0;

  float d = mesafe();
  bool hedefVar = d < MENZIL_CM;

  if (!hedefVar) {
    surus(0, 0);                          // hedef yoksa anında dur (fail-safe)
    bosSayac++;
    if (durum == TAKIP && bosSayac >= KAYIP_SAYISI) {
      durum = KAYIP;
      Serial.println("durum: KAYIP");
    }
    return;
  }
  bosSayac = 0;

  if (durum != TAKIP) {                   // hedef (yeniden) göründü
    durum = TAKIP;
    pidSifirla();
    Serial.println("durum: TAKIP");
  }

  float hata = d - HEDEF_CM;
  float turev = (hata - oncekiHata) / dt;
  oncekiHata = hata;
  float u = KP * hata + KI * integral + KD * turev;
  if (fabs(u) < 255) {
    integral = constrain(integral + hata * dt, -I_SINIR, I_SINIR);
  }
  int hiz = 0;
  if (fabs(hata) >= OLU_ARALIK_CM) {
    hiz = (int)constrain(u, -200, 200);
  }
  surus(hiz, hiz);
}
```

**Nasıl çalışıyor?**
1. `hedefVar` mesafenin menzilde (100 cm içinde) olup olmadığıdır. Menzil dışı ölçüm "hedef yok" sayılır. HC-SR04 yankı alamazsa `tekOlcum` 400 döndürdüğü için aynı yoldan geçer.
2. Hedef yoksa robot hemen durur ve sayaç artar. Sayaç 8'e (yaklaşık 0,5 sn) varınca durum KAYIP olur. Ortanca filtre tek bir boş ölçümü zaten eler; art arda iki boş ölçüm robotu o tur için durdurur. Bu bilinçli bir tercihtir: emin olamıyorsan dur.
3. Hedef geri gelince `pidSifirla()` çağrılır; eski integral yeni hedefe saldırtmaz (98. ders).
4. `BEKLE` ve `KAYIP` davranışça aynıdır (durmak); ayrı yazılmalarının nedeni seri çıktıda "hiç hedef görmedim" ile "hedefi kaybettim" arasındaki farkı raporda görebilmektir.

**Hareketli hedefi nasıl taklit ettik?** Simülatörde hedef, `arena.walls` dizisindeki bir duvar kesitidir. Dizi **değiştirilebilir** olduğundan, kesitin iki ucunun x değerini zamanla artırırsak hedef yavaşça uzaklaşır:

```js
// checks.mjs'ten: her 100 ms'de hedef 3 mm kayar = 3 cm/sn
const tahta = arena.walls.at(-1)        // [x1, y1, x2, y2]
tahta[0] += 0.003; tahta[2] += 0.003
sim.run(100)
```

Gerçek robotta aynı deneyi bir arkadaşın elindeki karton levhayla yaparsın. Önemli: gerçek mesafeyi ölçen kişi cetveli robotun sensörüyle hedef arasında tutar, robotun kendi ölçümüne güvenmez.

**Test matrisi (Yol C).** Ölçülen mesafe, simülatörün bildiği gerçek sensör-hedef mesafesidir (robotun gürültülü ölçümü değil). Her satırda ilk 10 sn yakalama, sonra ölçüm.

| No | Senaryo | Beklenen | Ölçülen (simülatör) |
|---|---|---|---|
| T1 | Hedef 8 sn boyunca 3 cm/sn uzaklaşır (24 cm), sonra durur | 17-23 cm | 18,3-22,0 cm |
| T2 | T1, sağ motor %5 zayıf | 17-23 cm | 18,2-21,5 cm |
| T3 | T1, sağ motor %3 güçlü | 17-23 cm | 18,7-21,7 cm |
| T4 | T1, hedef 55 cm uzaktan başlar | 17-23 cm | 18,4-22,1 cm |
| T5 | Hedef birden kaybolur (levha çekildi) | 3 cm'den az ilerler; KAYIP yazar | 0,8 cm; KAYIP yazdı |
| T6 | Hedef 0,5 m önüne geri gelir | Yeniden TAKIP; 10 sn içinde 17-23 cm | TAKIP yazdı; 17-23 cm içinde |

T5, ders 112'deki 38 cm'lik koşuyla karşılaştırıldığında durum makinesinin değerini gösterir: aynı PID, tek fark karar katmanı.

### Dene
- **A:** `YAN_MS` değerini 1500 yap ve parkuru yeniden çalıştır. Ne oluyor? Nedenini ders 115'te kök neden analiziyle çözeceğiz.
- **A:** `ENGEL_CM` değerini 15 yap. Robot engele ne kadar yaklaşıyor? Bu durumda hangi test satırı kırılır?
- **B:** `BEKLEME_MS` değerini 0 yap. Gerçek bir kolda hangi sorun çıkardı? Simülatörde hata değişir mi, neden?
- **B:** Üçüncü noktayı (4; 12) yerine (4; 21) yap. Sketch ne yazıyor ve kol ne yapıyor? Bu davranış güvenli mi?
- **C:** `KAYIP_SAYISI` değerini 2 ve 20 yap. Hedef kaybolunca robotun davranışı nasıl değişir? Hangi değer seni daha güvende tutar?
- **C:** Test matrisine yeni bir satır ekle: hedef 5 cm/sn ile uzaklaşırsa robot yetişebilir mi? Beklenen sonucu önce yaz, sonra ölç.

### Sık yapılan hatalar
- Test matrisini ölçtükten sonra yazmak. Beklenen sütunu önce yazmazsan sonuca göre kendini ikna edersin.
- Tek senaryoyla "çalışıyor" demek. Başlangıç konumu, tekerlek uyumsuzluğu, hedefin hızı gibi şeyleri değiştirerek aynı sketch'i birkaç kez sına; çalışan bir tek senaryo kanıt değildir.
- Durumlar içinde `delay` kullanmak: algılama durur, robot kör kalır (26. ders).
- Durum değişince eski zamanlayıcıyı sıfırlamamak (`durumBasla`): sonraki durum hemen biter.
- Hedef kaybolunca "son bilinen komutu" sürdürmek. Emin olmadığın durumda motoru durdur.
- C: PID'i durum değişiminde sıfırlamamak: eski integral robotu yeni hedefe fırlatır.
- B: Hedefe zıplatarak gitmek. Servo anında gitmek için akım çeker, kol sarsılır, parça düşer.

## Konuşalım
Test matrisinde bir satır kırmızı çıktı ve robotu iyileştirmeyi düşünüyorsun. İlk işin sketch'i değiştirmek mi olmalı, yoksa önce satırın neden kırıldığını ölçmek mi? İkisinin sırası neden önemli?
