# Robot kol: al-bırak dizisi
süre: 35

## Merak
Fabrikalardaki robot kollar bir kutuyu hızla kapar, taşır ve yerine koyar. Ama dikkatli bak: hareketleri sert değil, yumuşaktır. Servoya "90 dereceye git" dersen servo oraya anında zıplar; kolun ucundaki nesne sallanır, düşer, hatta dişliler zarar görür. Bu derste kolu yumuşakça hareket ettirmeyi ve bir al-bırak işini adım adım yaptırmayı öğreneceksin.

## Etkinlik
### Devre
108. dersteki kol bağlantısı aynen geçerlidir.

| Parça | Bağlantı |
|---|---|
| Omuz servosu | sinyal **D9** |
| Dirsek servosu | sinyal **D10** |
| Tutucu servosu | sinyal **D11** |
| Servo gücü | Harici 5 V kaynak; kaynağın eksisi Arduino **GND**'ye bağlı (ortak GND) |

Üç servo birlikte çalışırken kısa süreli yüksek akım çekebilir. Arduino'nun 5 V pininden besleme. Pil takarken artıyı eksiyi ters bağlama, uçları birbirine değdirme.

### Önce ani hareket, sonra yumuşak hareket
Önce ani hareketin ne yaptığına bak. Aşağıdaki program omuzu bir anda 90°'den 30°'ye atar, 2 saniye sonra geri 90°'ye.

```cpp
// sketch: kol_ani_hareket
#include <Servo.h>

Servo omuz;

void setup() {
  omuz.attach(9);
  omuz.write(90);
  delay(1000);
  omuz.write(30);        // bir anda 60° atlar
  delay(2000);
  omuz.write(90);
}

void loop() {
}
```

Servo her 20 ms'de bir darbe alır. Darbe genişliği 90°'den 30°'ye tek bir çerçevede değişir: servo en hızlı şekilde oraya koşar. Kol bu sırada sarsılır.

Yumuşak hareketin fikri: hedefe tek hamlede gitme, başlangıç ile hedef arasında küçük adımlarla ilerle. `millis()` ile zaman ölç (27. ders) ve her 20 ms'de bir ara açıyı hesapla:

```
oran = geçen süre / toplam süre        (0 ile 1 arası)
açı  = başlangıç + (hedef − başlangıç) · oran
```

Toplam süre ne kadar uzunsa hareket o kadar yavaştır. Üç servo (omuz, dirsek, tutucu) aynı süreye bölündüğü için hepsi aynı anda varır.

### Al-bırak dizisi
Dizi dokuz adımdan oluşur. Her adımın bir hedef noktası (108. dersteki ters kinematikle açıya çevrilir), tutucu durumu ve süresi vardır.

| # | Adım | Hedef (x, y) cm | Tutucu | Süre (ms) |
|---|---|---|---|---|
| 1 | NESNE_USTU: nesnenin üstüne git | (16, 8) | aç | 1500 |
| 2 | ASAGI: nesneye alçal | (16, 2) | açık | 800 |
| 3 | KAVRA: tutucuyu kapat (kol sabit) | (16, 2) | kapat | 900 |
| 4 | YUKARI: nesneyi kaldır | (16, 8) | kapalı | 800 |
| 5 | TASI: bırakma noktasının üstüne git | (7, 12) | kapalı | 1500 |
| 6 | INDIR: alçal | (7, 5) | kapalı | 800 |
| 7 | BIRAK: tutucuyu aç (kol sabit) | (7, 5) | aç | 900 |
| 8 | KALK: yüksel | (7, 12) | açık | 800 |
| 9 | EVE: başlangıç konumu | (2, 14) | açık | 1500 |

Tutucu açısı `ACIK = 120°`, `KAPALI = 60°` seçildi. Bunlar kendi tutucuna bağlıdır; dişlilerini zorlamadan açılıp kapandığı değerleri bul.

Sıraya dikkat: tutucu yalnız kol nesnenin yanında **durmuşken** kapanır (adım 3) ve yalnız bırakma noktasında durmuşken açılır (adım 7). Kol hareket ederken tutucu bırakmaz.

```cpp
// sketch: kol_al_birak
#include <Servo.h>

const int OMUZ_PIN = 9, DIRSEK_PIN = 10, TUTUCU_PIN = 11;
const float L1 = 10.0, L2 = 10.0;
const float DERECE = 180.0 / PI;
const float ACIK = 120, KAPALI = 60;
const unsigned long KARE_MS = 20;          // servo çerçeve süresi

Servo omuz, dirsek, tutucu;

struct Adim {
  const char* ad;
  float x, y;
  float tut;
  unsigned long sure;
};

const int ADIM_SAYISI = 9;
const Adim DIZI[ADIM_SAYISI] = {
  {"NESNE_USTU", 16, 8,  ACIK,   1500},
  {"ASAGI",      16, 2,  ACIK,    800},
  {"KAVRA",      16, 2,  KAPALI,  900},
  {"YUKARI",     16, 8,  KAPALI,  800},
  {"TASI",        7, 12, KAPALI, 1500},
  {"INDIR",       7, 5,  KAPALI,  800},
  {"BIRAK",       7, 5,  ACIK,    900},
  {"KALK",        7, 12, ACIK,    800},
  {"EVE",         2, 14, ACIK,   1500}
};

float simdiki[3];      // omuz, dirsek, tutucu: şu anki açılar
float baslangic[3];
float hedef[3];
int adim = -1;
unsigned long adimBasi = 0, sonKare = 0;

int acidanUs(float aci) {
  return (int)(544 + aci * (2400 - 544) / 180.0 + 0.5);
}

bool ters(float x, float y, float &q1, float &q2) {
  float c = (x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2);
  if (c > 1.0 || c < -1.0) return false;
  float s2 = acos(c);
  q1 = (atan2(y, x) + atan2(L2 * sin(s2), L1 + L2 * cos(s2))) * DERECE;
  q2 = s2 * DERECE;
  return q1 >= 0 && q1 <= 180 && q2 >= 0 && q2 <= 180;
}

void servolaraYaz() {
  omuz.writeMicroseconds(acidanUs(simdiki[0]));
  dirsek.writeMicroseconds(acidanUs(simdiki[1]));
  tutucu.writeMicroseconds(acidanUs(simdiki[2]));
}

void adimBaslat(int i) {
  adim = i;
  adimBasi = millis();
  for (int k = 0; k < 3; k++) baslangic[k] = simdiki[k];
  if (!ters(DIZI[i].x, DIZI[i].y, hedef[0], hedef[1])) {
    Serial.println("HEDEF ULASILAMAZ");
    adim = ADIM_SAYISI;                    // diziyi durdur
    return;
  }
  hedef[2] = DIZI[i].tut;
  Serial.print("t=");   Serial.print(adimBasi);
  Serial.print(" ");    Serial.print(DIZI[i].ad);
  Serial.print(" ");    Serial.print(hedef[0], 1);
  Serial.print(" ");    Serial.print(hedef[1], 1);
  Serial.print(" ");    Serial.println(hedef[2], 0);
}

void setup() {
  Serial.begin(9600);
  float q1, q2;
  ters(2, 14, q1, q2);                     // başlangıç konumu
  simdiki[0] = q1; simdiki[1] = q2; simdiki[2] = KAPALI;
  omuz.attach(OMUZ_PIN);
  dirsek.attach(DIRSEK_PIN);
  tutucu.attach(TUTUCU_PIN);
  servolaraYaz();
  delay(1000);
  adimBaslat(0);
}

void loop() {
  unsigned long simdi = millis();
  if (adim >= ADIM_SAYISI) return;         // dizi bitti

  if (simdi - sonKare >= KARE_MS) {
    sonKare = simdi;
    float oran = (float)(simdi - adimBasi) / DIZI[adim].sure;
    if (oran > 1) oran = 1;
    for (int k = 0; k < 3; k++) {
      simdiki[k] = baslangic[k] + (hedef[k] - baslangic[k]) * oran;
    }
    servolaraYaz();
    if (oran >= 1) {                       // adım bitti
      if (adim + 1 < ADIM_SAYISI) adimBaslat(adim + 1);
      else { Serial.print("t="); Serial.print(simdi); Serial.println(" BITTI"); adim = ADIM_SAYISI; }
    }
  }
}
```

### Nasıl çalışıyor?
1. `DIZI` tablosu işin tüm tarifidir: adım adı, hedef nokta, tutucu durumu ve süre. Kodu değiştirmeden yeni bir iş eklemek için tabloya satır eklemek yeter.
2. `adimBaslat()` o anki açıları başlangıç olarak saklar, ters kinematikle hedef açıları bulur (108. ders) ve zamanı kaydeder. Hedef ulaşılamıyorsa diziyi durdurur.
3. `loop()` her 20 ms'de bir (servonun çerçeve süresi) `oran`'ı hesaplar ve üç servoya birden ara açıyı yazar. `delay()` yoktur; `loop()` hep açık kalır, böylece ileride sensör okuma gibi işler eklenebilir.
4. `oran` 1'e ulaşınca açı tam hedefe oturur ve sıradaki adım hemen başlar.
5. KAVRA ve BIRAK adımlarında hedef nokta aynıdır; yalnız tutucu açısı değişir. Kol bu sürede kıpırdamaz.
6. Servo açısı `writeMicroseconds()` ile verildiği için ara değerler küsuratlı derecelerde bile ince ince akar.

Bu yöntem ara açıları **eklem uzayında** düz bir çizgiyle birleştirir. Kolun ucu iki nokta arasında tam düz çizgi çizmez, hafif kavisli bir yol izler. Dikey iniş ve çıkışlar kısa olduğu için burada önemli değildir.

Darbe genişliklerini ölçmek zamanlamayı da doğrular: her adımın başlangıç ve bitiş anlarını ölçmek için servo sinyalini izlersin. Ölçümde adımlar tabloda yazılan süreleriyle aynı bitiyor ve ardışık iki darbe arasındaki açı farkı en fazla yaklaşık 1,5° oluyor. Aynı ölçüm `kol_ani_hareket` programında 60° atlama gösteriyor.

### Dene
- Bütün `sure` değerlerini yarıya indir. Hareket hızlanınca ardışık darbeler arasındaki fark nasıl değişiyor?
- `oran` yerine `oran * oran * (3 - 2 * oran)` kullan. Hareket başlarken ve biterken neden daha yumuşak?
- Diziye üçüncü bir nesne noktası ekle. Bırakma noktası menzil dışına çıkarsa program ne yapıyor?

### Sık yapılan hatalar
- Yumuşak hareketi `delay()` içeren bir `for` döngüsüyle yapmak: hareket sürerken kod başka iş yapamaz (26. ders).
- Her adımda başlangıcı sıfırlamayı unutmak: `baslangic` o anki açı olmazsa servo her adımda eski bir yere zıplar.
- `oran`'ı 1'de sınırlamamak: servo hedefi geçer.
- Tutucuyu kol hareket ederken kapatmak ya da açmak: nesne düşer.
- Tutucuyu sonuna kadar zorlamak: servo yanar ya da dişliler zarar görür. Tutucunun mekanik sınırlarını önceden bul.

### Gerçek robotta farklı olabilecekler
Benzetimdeki servo, komuta anında uyar ve yük taşımaz; gerçekte nesnenin ağırlığı, servo torku ve kolun atalet momenti hareketi yavaşlatır, kol komutlanan konuma tam oturmayabilir. Tutucu bir nesneyi kavrarken servo tam kapanma açısına ulaşamaz (nesne araya girer) ve servo sürekli akım çekip ısınabilir; kapanma açısını nesne boyutuna göre ayarla.

## Konuşalım
Bir robot kol nesneyi çok hızlı kaldırırsa ne olabilir? Yavaş çalışan bir kolu fabrikada kullanmak neden pahalı olabilir? Hız ile güvenlik arasındaki dengeyi nasıl kurarsın?
