# Davranış tabanlı kontrol ve öncelikler
süre: 30

## Merak
Süpürge robotlar bir yandan odayı tarar, bir yandan masa ayağına çarpmamaya çalışır, pili azalınca da şarj istasyonuna döner. Hepsini tek bir uzun `if` merdiveniyle yazmaya kalksan kod birkaç günde anlaşılmaz olur. Robotikçiler bu işi başka türlü çözer: her işi ayrı bir "davranış" yapar, hangisinin sözünün geçeceğine ise bir öncelik sırası karar verir.

## Etkinlik
### Devre
Standart Modül 5 bağlantıları: sürüş motorları, ultrasonik sensör ve üç çizgi sensörü. Servoyu kullanmıyoruz; ultrasonik sensör hep ileri bakar.

| Parça | Bağlantı |
|---|---|
| Sol motor (sürücü) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor (sürücü) | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Ultrasonik HC-SR04 | TRIG **D11**, ECHO **D12** (ileriye bakar) |
| Çizgi sensörleri (TCRT5000) | sol **A0**, orta **A1**, sağ **A2** (aralarında yaklaşık 2 cm) |

Motorlar için ayrı güç kaynağı kullan ve sürücünün GND'sini Arduino GND'sine bağla.

### Fikir: davranışlar ve hakem
Her davranış tek bir soruya cevap veren küçük bir fonksiyondur:

> "Şu an devrede olmalı mıyım? Evet ise tekerleklere ne öneriyorum?"

Fonksiyon `aktif` bilgisi ve iki tekerlek hızı (öneri) döndürür. Hiçbir davranış motoru kendisi sürmez. Sadece öneri yapar. Önerileri toplayıp birini seçen kısmın adı **hakemdir** (arbiter). Hakem basittir: davranışları öncelik sırasıyla gez, devrede olan ilk davranışın önerisini uygula.

Bu derste üç davranışımız var, yüksekten alçağa:

| Öncelik | Davranış | Ne zaman devrede? | Önerisi |
|---|---|---|---|
| 1 (en yüksek) | **KAÇ** | Ön mesafe 25 cm altına düşünce; 60 cm üstüne çıkana kadar sürer | Yerinde sola dön |
| 2 | **ÇİZGİ** | Üç çizgi sensöründen biri çizgiyi görüyorsa | Çizgiye göre düz git ya da hafifçe yönel |
| 3 (en düşük) | **DOLAŞ** | Her zaman (varsayılan) | İleri git, ara sıra rastgele dön |

Dikkat edilecek iki nokta:
- **KAÇ** iki farklı eşik kullanır: 25 cm'de başlar, 60 cm'de biter. Bunu ders 88'deki histerezis gibi düşün; aksi hâlde robot eşiğin etrafında titrer.
- **DOLAŞ** her zaman `aktif` döner. En alt katman, hiçbiri devrede değilken ne yapılacağını söyler.

Bir davranış yeni bir sensör ya da yeni bir görev eklemek istediğinde diğerlerine dokunmazsın. Yalnızca yeni bir fonksiyon yazar ve sıraya koyarsın.

### Program
Her davranış değişiminde robot seri porta zamanı ve yeni davranışın adını yazar.

```cpp
// sketch: davranis_oncelik
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12;
const int SENS_SOL = A0, SENS_ORTA = A1, SENS_SAG = A2;

const float KAC_BASLA_CM = 25;
const float KAC_BITIR_CM = 60;
const int CIZGI_ESIK = 500;          // analogRead: çizgi ≈ 860, zemin ≈ 164

struct Oneri {
  bool aktif;
  int sol;
  int sag;
};

enum Davranis { KAC, CIZGI, DOLAS, DAVRANIS_SAYISI };   // sıra = öncelik
const char* DAVRANIS_ADI[] = {"KAC", "CIZGI", "DOLAS"};

float onCm = 400;
bool kaciyor = false;
unsigned long donusBitis = 0, sonrakiDonus = 2000;
int donusYonu = 1;
unsigned long sonOlcum = 0;
int onceki = -1;

float mesafeOku() {
  digitalWrite(TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 25000);
  if (sure == 0) return 400;                  // yankı yok: çok uzak
  return sure / 58.0;
}

void surus(int sol, int sag) {                // -255 … 255
  digitalWrite(SOL_IN1, sol >= 0); digitalWrite(SOL_IN2, sol < 0);
  digitalWrite(SAG_IN1, sag >= 0); digitalWrite(SAG_IN2, sag < 0);
  analogWrite(SOL_EN, abs(sol));
  analogWrite(SAG_EN, abs(sag));
}

Oneri kac() {
  Oneri o = {false, 0, 0};
  if (!kaciyor && onCm < KAC_BASLA_CM) kaciyor = true;
  if (kaciyor && onCm > KAC_BITIR_CM) kaciyor = false;
  if (kaciyor) { o.aktif = true; o.sol = -140; o.sag = 140; }   // yerinde sola dön
  return o;
}

Oneri cizgiyiIzle() {
  Oneri o = {false, 0, 0};
  bool sol  = analogRead(SENS_SOL)  > CIZGI_ESIK;
  bool orta = analogRead(SENS_ORTA) > CIZGI_ESIK;
  bool sag  = analogRead(SENS_SAG)  > CIZGI_ESIK;
  if (!sol && !orta && !sag) return o;        // çizgi yok: devrede değil
  o.aktif = true;
  if (sol && !sag)      { o.sol = 60;  o.sag = 150; }   // çizgi solda: sola yönel
  else if (sag && !sol) { o.sol = 150; o.sag = 60; }    // çizgi sağda: sağa yönel
  else                  { o.sol = 150; o.sag = 150; }   // ortada: düz
  return o;
}

Oneri dolas() {
  Oneri o = {true, 170, 170};                 // her zaman devrede: varsayılan
  unsigned long t = millis();
  if (t >= sonrakiDonus) {                    // yeni rastgele dönüş planla
    donusBitis = t + random(300, 800);
    donusYonu = random(2) ? 1 : -1;
    sonrakiDonus = donusBitis + random(1500, 3500);
  }
  if (t < donusBitis) { o.sol = -130 * donusYonu; o.sag = 130 * donusYonu; }
  return o;
}

void setup() {
  Serial.begin(9600);
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  randomSeed(7);
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonOlcum >= 60) {               // ultrasonik 60 ms'de bir
    sonOlcum = simdi;
    onCm = mesafeOku();
  }

  Oneri oneri[DAVRANIS_SAYISI];
  oneri[KAC]   = kac();
  oneri[CIZGI] = cizgiyiIzle();
  oneri[DOLAS] = dolas();

  int secilen = DOLAS;                        // hakem: ilk aktif davranış kazanır
  for (int i = 0; i < DAVRANIS_SAYISI; i++) {
    if (oneri[i].aktif) { secilen = i; break; }
  }
  surus(oneri[secilen].sol, oneri[secilen].sag);

  if (secilen != onceki) {                    // davranış değişince yaz
    Serial.print("t=");
    Serial.print(simdi);
    Serial.print(" ");
    Serial.println(DAVRANIS_ADI[secilen]);
    onceki = secilen;
  }
}
```

### Nasıl çalışıyor?
1. `enum Davranis` sırası önceliği belirler: `KAC` sıfırıncı, yani en önde.
2. Her `loop()` turunda üç davranış da öneri hazırlar. Hakem döngüsü `i = 0`'dan başlar ve `aktif` olan ilk öneride `break` ile durur. Bu yüzden KAÇ devredeyse ÇİZGİ ve DOLAŞ ne önerirse önersin dikkate alınmaz.
3. `surus()` seçilen önerinin hızlarını motorlara yazar. Negatif hız = geri.
4. Seri port çıktısı bize "robot şu an hangi davranışta" sorusunun cevabını verir. Hata ayıklarken en değerli bilgi budur.
5. Ultrasonik ölçüm 60 ms'de bir yapılır (`pulseIn` bekler, her turda yapmak gereksiz).
6. `dolas()` zamanı kendi içinde tutar; başka davranış sürerken de çalışır. Bu yüzden DOLAŞ'a geri dönüldüğünde robot rastgele dönüşün ortasında olabilir.

Benzetimde robot, ucunda bir duvar bulunan bir çizginin üzerinde başlar. Çizgiyi izler (ÇİZGİ), duvara 25 cm kala çizgi hâlâ görünürken KAÇ devreye girer ve çizginin önüne geçer, dönüş bitince DOLAŞ başlar. Ölçülen seri çıktının başı şöyledir:

```
t=0 CIZGI
t=5580 KAC
t=5940 DOLAS
t=7980 KAC
t=8460 DOLAS
t=10800 KAC
```

KAÇ'ın 7980. milisaniyedeki ikinci devreye girişi de dikkat çekici: robot DOLAŞ'ın rastgele dönüşü sırasında duvar kenarının ışına girdiği an 6 cm'lik bir mesafe okudu. Tek ışınlı bir sensör yandan gelen engeli geç görür.

### Dene
- `KAC_BITIR_CM` değerini 30 yap. Robot duvar kenarında neden daha çok titreşiyor? Seri çıktıda `KAC` ve `DOLAS` ne sıklıkta değişiyor?
- Hakemdeki `for` döngüsünün sırasını değiştir: `DOLAS`'ı en öne al. Ne olur? (Cevabı yazmadan önce tahmin et, sonra dene.)
- Dördüncü bir davranış ekle: `bekle()`: D2'deki butona basılıyken durur (`INPUT_PULLUP`). Önceliği nereye koyarsın?

### Sık yapılan hatalar
- Davranışların içinde `surus()` çağırmak: iki davranış motorlara aynı anda yazar ve sonuç belirsizleşir. Davranış yalnızca öneri döndürür.
- Bütün davranışlara `aktif = true` yazmak: hakem hep ilkini seçer, diğerleri bir daha hiç çalışmaz.
- Tek eşikli kaçma: 25 cm'de başlayıp 25 cm'de biten KAÇ, robotu duvarın önünde titretir. Bitiş eşiğini daha büyük tut.
- `delay()` kullanmak: hakem döngüsü yavaşlar, robot geç tepki verir (27. dersteki millis yaklaşımını kullan).

### Gerçek robotta farklı olabilecekler
Tek ışınlı bir ultrasonik sensör yandan yaklaşan engeli geç görür; gerçek robotta yanlara da sensör eklenir. Gerçek ultrasonik sensörlerde yankı bazen kaybolur ya da yan duvarlara sekerek yanlış mesafe verir; KAÇ davranışına tek bir ölçüme bakmak yerine birkaç ölçümün medyanını vermek iyi olur (Modül 4'teki medyan filtre). Gerçek çizgi sensörünün eşiğini kalibrasyonla bulursun (87. ders); `500` bu benzetime özgü bir değerdir.

## Konuşalım
Bir davranışın sözü başka bir davranışınkinden her zaman geçerse, öncelik sırası robotun "karakterini" belirler. Bir yangın alarmı robotunda "dumanı kaynağa kadar takip et" ile "engelden kaç" davranışlarını nasıl sıralardın? Sırayı değiştirmek neyi riske atar?
