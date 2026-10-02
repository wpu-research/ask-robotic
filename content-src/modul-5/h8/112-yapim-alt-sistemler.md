# Yapım 1: alt sistemler
süre: 40

## Merak
Üç yüz satırlık bir program yazdın, ilk kez çalıştırdın ve robot olduğu yerde dönüyor. Sorun motorda mı, sensörde mi, yoksa kararlarında mı? Hepsi birbirine karışmışsa bunu bilemezsin. Usta mühendisler büyük robotu küçük parçalara böler ve her parçayı **tek başına**, ölçerek sınar. Bugün seçtiğin yolun parçalarını yapıp tek tek sınayacaksın.

## Etkinlik
Her alt sistem üç şeye sahip olur: tek bir işi yapan fonksiyonlar, tek başına çalıştırılabilen bir sınama yolu ve sayıyla yazılmış bir geçme koşulu. Seçtiğin yolun bölümünü yap; diğerlerini merak edersen oku.

### Yol A: sürüş, mesafe ve çizgi modülleri
Devre ders 111'deki Yol A tablosuyla aynıdır. Sketch üç modülü ayrı bölümlerde tutar ve seri porttan tek harfli komutlarla her birini ayrı ayrı çalıştırır.

| Modül | Fonksiyon | Sınama komutu | Geçme koşulu |
|---|---|---|---|
| Sürüş | `surus(sol, sag)` | `i` ileri, `g` geri, `s` sola, `d` sağa | 1 sn ileri: 15-30 cm; 420 ms dönüş: 80-100° |
| Mesafe | `tekOlcum()` | `m` | Cetvelle ölçtüğün mesafeden en çok 1,5 cm sapar |
| Çizgi | `cizgiKonum(sayi)` | `c` | Çizgi ortadaki sensörün altında: konum 0; bir sensör aralığı (2 cm) sağdayken: konum -1 |

```cpp
// sketch: a_alt_sistem
// Yol A alt sistem testi: sürüş, mesafe ve çizgi modüllerini seri komutla tek tek dene.
// Komutlar: i = ileri 1 sn, g = geri 1 sn, s = sola dön 0,42 sn, d = sağa dön 0,42 sn,
//           m = mesafe yaz, c = çizgi konumu yaz
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12;
const int CIZGI[5] = {A0, A1, A2, A3, A4};

const int OLU_BOLGE = 51;      // PWM'in %20'si: altında tekerlek dönmez
const int TABAN = 150;

// ---- SÜRÜŞ MODÜLÜ ----
void motor(int en, int in1, int in2, int hiz) {
  hiz = constrain(hiz, -255, 255);
  if (hiz == 0) {
    digitalWrite(in1, LOW);
    digitalWrite(in2, LOW);
    analogWrite(en, 0);
    return;
  }
  digitalWrite(in1, hiz > 0);
  digitalWrite(in2, hiz < 0);
  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));   // ölü bölgeyi atla
}

void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

// ---- MESAFE MODÜLÜ ----
float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long s = pulseIn(ECHO, HIGH, 15000);
  return s == 0 ? 400.0 : s / 58.0;      // yankı yoksa "çok uzak"
}

// ---- ÇİZGİ MODÜLÜ ----
// Konum -2 ... +2 (artı = çizgi solda). sayi = çizgiyi gören sensör sayısı.
float cizgiKonum(int &sayi) {
  float toplam = 0;
  sayi = 0;
  for (int i = 0; i < 5; i++) {
    if (analogRead(CIZGI[i]) > 512) {    // çizgi ~860, zemin ~164
      toplam += 2 - i;
      sayi++;
    }
  }
  return sayi ? toplam / sayi : 0;
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
  Serial.println("hazir");
}

void loop() {
  if (Serial.available() == 0) return;
  char komut = Serial.read();
  switch (komut) {
    case 'i': surus(TABAN, TABAN);   delay(1000); surus(0, 0); Serial.println("ileri bitti"); break;
    case 'g': surus(-TABAN, -TABAN); delay(1000); surus(0, 0); Serial.println("geri bitti"); break;
    case 's': surus(-TABAN, TABAN);  delay(420);  surus(0, 0); Serial.println("sol bitti"); break;
    case 'd': surus(TABAN, -TABAN);  delay(420);  surus(0, 0); Serial.println("sag bitti"); break;
    case 'm':
      Serial.print("mesafe=");
      Serial.println(tekOlcum(), 1);
      break;
    case 'c': {
      int sayi;
      float konum = cizgiKonum(sayi);
      Serial.print("konum=");
      Serial.print(konum, 2);
      Serial.print(" sayi=");
      Serial.println(sayi);
      break;
    }
  }
}
```

**Nasıl çalışıyor?**
1. `motor()` bir tekerleği -255...255 arasında bir sayıyla sürer. İşaret yönü, büyüklük hızı belirler. Sıfır değilse hız `OLU_BOLGE` ile 255 arasına yeniden ölçeklenir; böylece küçük komutlar ölü bölgede (78. ders) kaybolmaz.
2. `surus(sol, sag)` iki tekerleği birlikte yönetir. Aynı işaret düz gider, zıt işaret yerinde döner (76. ders).
3. `tekOlcum()` HC-SR04'ün yankı süresini `pulseIn` ile ölçer ve 58'e bölerek santimetreye çevirir. Yankı gelmezse 400 cm döndürür, yani "çok uzak".
4. `cizgiKonum()` beş sensörden çizgiyi görenlerin sıra numarasının ortalamasını alır: A2 ortadır (0), A0 en solda (+2), A4 en sağda (-2). Çizgiyi gören sensör sayısını `sayi` içinde verir; `sayi` sıfırsa çizgi kayıptır ve konum anlamsızdır.
5. Sınama komutları `delay` kullanır. Bu bir alt sistem testidir, robotun asıl programı değildir; asıl programda (ders 113) `millis()` kullanacaksın.

**Ölçerek öğrendiklerimiz (simülatörde):**
- `i` komutu 1 sn'de yaklaşık 22,9 cm ilerletti. Kendi robotun farklı çıkabilir; bu yüzden ders 113'te hız yerine süre değil, durum ve sensör kullanacağız.
- `s` ve `d` ile 420 ms'lik dönüş yaklaşık 91° döndürdü. Bu sayıyı biz ölçerek bulduk: aynı hızda 500 ms yaklaşık 108° döndürüyordu. Kendi robotunda `delay` süresini, robot tam 90° dönene kadar ayarla; iletki ya da telefonun pusulası işini görür.

### Yol B: ters kinematik fonksiyonu ve servo sürücü
*Arena etkinliğinde bu yol için **B: Robot kol** sekmesini aç: kolu `g x y` komutlarıyla hedeflere gönder, arena uç noktasını darbeden yeniden hesaplayıp 1 mm ölçütünü senin yerine sınar.*

Devre ders 111'deki Yol B tablosudur (servolar D9, D10, D11; harici güç ve ortak GND). Kolun iki bölümü de 10 cm'dir. 108. derste gördüğün iki eksenli ters kinematiği burada tek bir yere topluyoruz. Açı düzenimiz şöyle:

| Servo | Açı | Anlamı |
|---|---|---|
| Omuz (D9) | 0° / 90° | Kol yatay ileri / dik yukarı |
| Dirsek (D10) | 0° / 90° | Kol düz uzamış / dirsek dik açıda |

Hedef nokta (x, y) santimetre; taban orijin, x ileri, y yukarı. Bu düzen 108. dersteki q1 ve q2 ile aynıdır (dirsek servosu doğrudan q2). Dirsek üstte çözümü şu adımlarla bulunur:

```text
c   = (x² + y² − L1² − L2²) / (2 · L1 · L2)       (kosinüs teoremi)
q2  = acos(c)                                      (c, -1 ile 1 arasında değilse nokta erişilemez)
q1  = atan2(y, x) + atan2(L2·sin q2, L1 + L2·cos q2)
omuz servosu = q1 (derece),  dirsek servosu = q2 (derece)
ileri kinematik: x = L1·cos q1 + L2·cos(q1 − q2),  y = L1·sin q1 + L2·sin(q1 − q2)
```

Servo sürücü açıyı darbe genişliğine çevirir. Servo kütüphanesinde 0° için 544 µs, 180° için 2400 µs'dir (21. ders: `write(90)` yaklaşık 1472 µs verir). `Servo.write()` yalnızca tam derece alır; `writeMicroseconds()` ise mikrosaniye hassasiyetinde konum verir.

| Modül | Fonksiyon | Sınama komutu | Geçme koşulu |
|---|---|---|---|
| Ters kinematik | `tersKinematik(x, y, omuz, dirsek)` | `g x y` | Açılardan ileri kinematikle bulunan uç noktası, hedeften 1 mm'den az sapar |
| Servo sürücü | `dereceyiUsYap(aci)` | `g x y` (satırdaki `us=`) | Pindeki darbe, yazılan µs ile 1,5 µs'den az farklı |
| Erişim kontrolü | `tersKinematik` `false` döner | `g 25 0` | `ulasilamaz` yazar, servolar yerinde kalır |

```cpp
// sketch: b_alt_sistem
#include <Servo.h>

const int OMUZ_PIN = 9;
const int DIRSEK_PIN = 10;
const int TUTUCU_PIN = 11;

const float L1 = 10.0;             // omuz - dirsek (cm)
const float L2 = 10.0;             // dirsek - uç (cm)
const int US_MIN = 544;            // Servo kütüphanesinin 0 derece darbesi
const int US_MAX = 2400;           // 180 derece darbesi

Servo omuz, dirsek, tutucu;

// Derece (0-180) -> darbe genişliği (mikrosaniye)
int dereceyiUsYap(float aci) {
  aci = constrain(aci, 0.0, 180.0);
  return (int)(US_MIN + aci * (US_MAX - US_MIN) / 180.0 + 0.5);
}

// Ters kinematik: hedef (x, y) cm -> servo açıları (derece). Ulaşılamazsa false.
// Omuz servosu q1: 0 = yatay ileri, 90 = dik yukarı. Dirsek servosu q2: 0 = kol düz, 90 = dirsek dik açı.
bool tersKinematik(float x, float y, float &omuzAci, float &dirsekAci) {
  float r2 = x * x + y * y;
  float c = (r2 - L1 * L1 - L2 * L2) / (2.0 * L1 * L2);
  if (c < -1.0 || c > 1.0) return false;          // kol bu noktaya yetişmez
  float s2 = acos(c);                              // dirsek bükülmesi q2 (radyan), dirsek üstte çözüm
  float q1 = atan2(y, x) + atan2(L2 * sin(s2), L1 + L2 * cos(s2));
  omuzAci = q1 * 180.0 / PI;
  dirsekAci = s2 * 180.0 / PI;
  return omuzAci >= 0.0 && omuzAci <= 180.0 && dirsekAci >= 0.0 && dirsekAci <= 180.0;
}

// İleri kinematik: açılardan uç noktasını bul (ters kinematiği doğrulamak için)
void ileriKinematik(float omuzAci, float dirsekAci, float &x, float &y) {
  float t1 = omuzAci * PI / 180.0;
  float t2 = dirsekAci * PI / 180.0;
  x = L1 * cos(t1) + L2 * cos(t1 - t2);
  y = L1 * sin(t1) + L2 * sin(t1 - t2);
}

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(50);
  omuz.attach(OMUZ_PIN, US_MIN, US_MAX);
  dirsek.attach(DIRSEK_PIN, US_MIN, US_MAX);
  tutucu.attach(TUTUCU_PIN, US_MIN, US_MAX);
  omuz.writeMicroseconds(dereceyiUsYap(90));
  dirsek.writeMicroseconds(dereceyiUsYap(0));
  tutucu.writeMicroseconds(dereceyiUsYap(30));
}

void loop() {
  if (Serial.available() == 0) return;
  char komut = Serial.read();
  if (komut != 'g') return;                        // "g 12 4" = x=12 cm, y=4 cm'ye git
  float x = Serial.parseFloat();
  float y = Serial.parseFloat();
  float a1, a2;
  if (!tersKinematik(x, y, a1, a2)) {
    Serial.println("ulasilamaz");
    return;
  }
  omuz.writeMicroseconds(dereceyiUsYap(a1));
  dirsek.writeMicroseconds(dereceyiUsYap(a2));
  float gx, gy;
  ileriKinematik(a1, a2, gx, gy);
  Serial.print("omuz=");   Serial.print(a1, 2);
  Serial.print(" dirsek="); Serial.print(a2, 2);
  Serial.print(" us=");    Serial.print(dereceyiUsYap(a1));
  Serial.print(",");       Serial.print(dereceyiUsYap(a2));
  Serial.print(" kontrol="); Serial.print(gx, 2);
  Serial.print(",");       Serial.println(gy, 2);
}
```

**Nasıl çalışıyor?**
1. `tersKinematik()` önce hedefin kolun menzilinde olup olmadığına bakar. İki bölüm de 10 cm olduğu için kol en fazla 20 cm uzanır; `g 25 0` bu yüzden reddedilir.
2. Örnek: `g 12 4` komutu omuz 69,20° ve dirsek 101,54° verir; sketch `us=1258,1591` darbelerini üretir. Aynı açıları ileri kinematiğe geri sokan `kontrol=12.00,4.00` satırı, formülü doğru yazdığını gösterir. Bu "gidiş-dönüş" sınaması, bir fonksiyonu elle hesap yapmadan doğrulamanın ucuz yoludur.
3. `dereceyiUsYap()` açıyı `544 + açı · (2400 − 544) / 180` ile mikrosaniyeye çevirir. `+ 0.5` yuvarlamak içindir.
4. `ileriKinematik()` kolun ucunun nerede olduğunu açılardan hesaplar. Gerçek kolda uç noktasını ölçmek için cetvel kullanırsın; bu fonksiyon cetvelin yerini tutmaz, yalnız formülünü sınar.

**Ölçerek öğrendiklerimiz (simülatörde):**
- Beş farklı hedefte (örneğin (12; 4), (8; 10), (4; 12), (14; 2), (10; 0)), servo pinlerinde ölçtüğümüz darbelerden bulunan uç noktası hedeften en çok 0,14 mm saptı.
- Aynı açıları tam dereceye yuvarlasaydık (`Servo.write` gibi) en büyük sapma 0,9 mm olurdu. Yani yuvarlama tek başına 5 mm ölçütünü tehdit etmez. Asıl riskler mekaniktir: dişli boşluğu, kolun ağırlığıyla eğilmesi, servonun ölü bandı, kol uzunluklarını cetvelle hatalı ölçmek. Bunlar simülatörde yok; gerçek kolda ölçüt bunlarla zorlanır. Servonun ölü bandını kendi servonun veri sayfasında ara.

### Yol C: mesafe PID alt sistemi
*Arena etkinliğinde **C: Takip** sekmesi: 44 cm önündeki levhaya yaklaşan robotun gerçek mesafesi (ışın, gürültüsüz) sağ panelde görünür; 17-23 cm ölçütü bu değerle sınanır.*

Devre ders 111'deki Yol C tablosudur. Öndeki hedefe 20 cm mesafeyi korumak için hata, hedef mesafe ile ölçülen mesafenin farkıdır: `hata = ölçülen − 20`. Artı hata "hedef uzakta, ileri git", eksi hata "çok yakın, geri çekil" demektir. PID'in üç terimini (96-98. dersler) toplarız.

| Modül | Fonksiyon | Sınama | Geçme koşulu |
|---|---|---|---|
| Sürüş | `surus(sol, sag)` | Yol A ile aynı | Yol A'nın koşulları |
| Mesafe | `mesafe()` (son 3 ölçümün ortancası) | Seri satır `mesafe=` | Cetvelle ölçtüğün mesafeden en çok 1,5 cm sapar |
| PID | `loop()` içinde | Duran hedef | Yakalamadan 10 sn sonra 17-23 cm |

```cpp
// sketch: c_mesafe_pid
// Yol C alt sistemi: öndeki hedefe 20 cm mesafeyi PID ile koru.
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12;

const int OLU_BOLGE = 51;
const float HEDEF_CM = 20.0;
const float KP = 9.0;
const float KI = 4.0;
const float KD = 6.0;
const float I_SINIR = 40.0;        // integral toplamının üst sınırı (windup önleme)
const float OLU_ARALIK_CM = 0.5;   // hedefe bu kadar yakınsa dur
const unsigned long DONGU_MS = 60;

float mesafeler[3] = {400, 400, 400};
float integral = 0, oncekiHata = 0;
unsigned long sonDongu = 0;
unsigned long sonYazi = 0;

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
  float hata = d - HEDEF_CM;               // artı: hedef uzakta, ileri git
  float turev = (hata - oncekiHata) / dt;
  oncekiHata = hata;

  float u = KP * hata + KI * integral + KD * turev;
  bool doygun = fabs(u) >= 255;
  if (!doygun) {                           // doyduysa integrali büyütme
    integral = constrain(integral + hata * dt, -I_SINIR, I_SINIR);
  }

  int hiz = 0;
  if (fabs(hata) >= OLU_ARALIK_CM) {
    hiz = (int)constrain(u, -200, 200);
  }
  surus(hiz, hiz);

  if (millis() - sonYazi >= 500) {         // ayar yaparken izlemek için
    sonYazi = millis();
    Serial.print("mesafe=");
    Serial.print(d, 1);
    Serial.print(" hata=");
    Serial.print(hata, 1);
    Serial.print(" hiz=");
    Serial.println(hiz);
  }
}
```

**Nasıl çalışıyor?**
1. Ölçüm **ortanca filtreyle** (3 ölçümün ortancası) gelir; tek bir hatalı okuma (gürültü) kararı bozmaz.
2. Döngü `millis()` ile her 60 ms'de bir çalışır. Sabit periyot, türev ve integral hesabının `dt` ile doğru olması içindir (103. ders).
3. `u` üç terimin toplamıdır. Büyük hata büyük hız, hatanın hızlı değişmesi (`KD`) fren, uzun süre kalan küçük hata (`KI`) ek itme demektir.
4. `I_SINIR` ve `doygun` kontrolü integralin şişmesini (windup, 98. ders) önler.
5. Hedefe 0,5 cm'den yakınsa robot durur (ölü aralık); aksi hâlde ölçüm gürültüsü motorları sürekli titretebilir.
6. Hız ±200 ile sınırlandı; tam hızın biraz altında kalır.
7. `KP`, `KI`, `KD` değerlerini 99. dersteki gibi elle deneyerek simülatörde bulduk. Kendi robotunun motorları ve hedefi farklıdır, değerleri yeniden ayarlaman gerekir.

**Ölçerek öğrendiklerimiz (simülatörde):**
- Hedef duran bir levha, robot 44 cm'den başlıyor. İlk 10 sn'lik **yakalama** evresinde robot 20 cm'yi biraz aşıp 13,5 cm'e kadar yaklaştı. Bu yüzden kabul ölçütünü "yakaladıktan sonra" ölçeriz.
- Yakalamadan sonraki 8 sn'de mesafe 18,6 ile 21,4 cm arasında kaldı. 17-23 cm ölçütü sağlanıyor. Ölçüm gürültüsü 1 cm olduğundan 1-2 cm oynama beklenir.
- **Alt sistemin bir sınırı:** hedef aniden kaybolunca (levhayı çektik), bu alt sistem 1,5 sn içinde yaklaşık 38 cm ileri koştu. Çünkü uzak mesafeyi "hedef çok uzakta, git" diye yorumluyor. Bu davranış PID'in hatası değil, eksik **karar katmanıdır**: ders 113'te durum makinesi ekleyip bunu çözeceğiz.

### Dene
- **A:** `TABAN` değerini 100 ve 200 yap, `i` komutunu tekrarla. 1 sn'de gidilen yolu cetvelle ölç. Yol, `TABAN` ile orantılı mı, yoksa ölü bölge orantıyı bozuyor mu?
- **A:** Robotu çizginin soluna ve sağına kaydır, `c` komutunun işaretini kontrol et. İşaret yanlışsa 113. derste robot çizgiden kaçar.
- **B:** `g 19 0` ve `g 21 0` komutlarını dene. Biri servoları oynatır, öbürü `ulasilamaz` yazar. Kolun menzili neden 20 cm?
- **B:** Kollarını 10 yerine 12 ve 8 cm yap (`L1`, `L2`). Ters kinematik hâlâ doğru mu? `kontrol=` satırı bunu söyler.
- **C:** `KD` değerini 0 yap, sonra 20 yap. Seri çıktıdaki `hiz` değerleri nasıl değişiyor? Gürültü türevi nasıl etkiliyor?
- **C:** `OLU_ARALIK_CM` değerini 0 yap. Robot hedefte duruyor mu, titriyor mu?

### Sık yapılan hatalar
- Alt sistemi sınamadan bir sonraki adıma geçmek. "Birleşince bakarım" dersen hatayı hangi parçanın yaptığını bulamazsın.
- A: `OLU_BOLGE` kullanmadan düşük PWM vermek. Motor dönmez, "çalışmıyor" sanırsın.
- A: Çizgi eşiğini (512) farklı zemin ve ışıkta denememek. Sensör değerlerini önce `Serial` ile oku (87. ders).
- B: Servo gücünü Arduino'dan almak. Servolar hareket edince kart resetlenir. Harici güç ve ortak GND şart.
- B: Dirsek açısını yanlış yöne almak. Formül doğru olabilir ama servoyu ters taktıysan kol zıt tarafa kıvrılır; bir kez `g 12 4` ile bakıp (omuz 69,20°, dirsek 101,54° olmalı) açı düzenini fiziksel kolla karşılaştır.
- C: Mesafeyi filtrelemeden PID'e vermek: türev terimi gürültüyü büyütür.
- C: Integral sınırlamamak: robot uzun süre hedefe ulaşamazsa integral şişer ve sonra hedefi aşar.

## Konuşalım
Bir alt sistem testi geçti ama birleştirince robot çalışmadı. Hata hangi katmanda olabilir? Alt sistem testlerinin sana hangi tür hatayı bulmaktan kurtardığını, hangisini bulamadığını düşün.
