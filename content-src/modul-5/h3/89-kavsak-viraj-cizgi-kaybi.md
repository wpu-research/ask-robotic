# Kavşak, keskin viraj ve çizgi kaybı
süre: 25

## Merak
Oyuncak tren rayında her şey kolay: raylar hep ileri gider. Gerçek bir pistte ise dik köşeler, birbirini kesen çizgiler, hatta bantın eskiyip silindiği boşluklar vardır. Bang-bang programın düz ve kavisli çizgide çalıştı. Peki robotun önüne aniden "T" çıkarsa, çizgi bir anda biterse ya da dik bir köşe gelirse ne yapacak?

## Etkinlik
### Beş sensörün gördüğü kalıplar
88. dersteki gibi beş sensörü okuyup desen çıkarırız (`A0 … A4`, `1` = çizgi). Üç zor durumun kendine özgü kalıpları vardır:

| Durum | Sensörlerin gördüğü | Robotun yapacağı |
|---|---|---|
| Sola dik viraj (L) | `11100`: sol taraf ve orta çizgide | sola dön |
| Sağa dik viraj (L) | `00111` | sağa dön |
| T ya da + kavşak | `11111`: hepsi çizgide | önceden verilen karar: sola, sağa ya da düz |
| Boşluk ya da çizgi kaybı | `00000`: hiçbiri çizgide değil | duruma göre düz git ya da çizgiyi ara |

Boşlukla viraj aşımı birbirine benzer: ikisinde de çizgi bir an kaybolur. Ayırmak için **son bilinen yön** kullanılır:

- Çizgi en son **ortadayken** kaybolduysa, robot düz gidiyordu: büyük olasılıkla bir **boşluk**. Düz git, boşluk dar ise çizgiyi tekrar bulursun.
- Çizgi en son **bir kenar sensöründe** görüldüyse, robot dönüyordu: çizgiyi **aştı**. Son görüldüğü yöne dön ve çizgiyi ara.
- Boşluk çok uzunsa ya da çizgi hiç bulunamazsa robot kontrolsüz dönmesin; **dur** ve durumu bildir.

### Devre
Standart bağlantılar, 88. dersteki gibi:

| Parça | Bağlantı |
|---|---|
| Çizgi sensörleri 0…4 | AO → **A0…A4** (A0 en sol) |
| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |

Motorlar için harici güç ve ortak GND kullan; pili ters bağlama, uçlarını kısa devre etme.

### Program 1: boşluk ve çizgi kaybı
28. dersteki durum makinesiyle üç durum yazıyoruz: `IZLE` (normal bang-bang), `BOSLUK` (düz giderek boşluğu geç), `ARAMA` (son yöne yerinde dön), bir de güvenli `DUR`. Durum değişince adı seriye yazılır.

```cpp
// sketch: kayip_toparla
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};
const int ESIK = 512;
const int HIZ = 150;
const unsigned long BOSLUK_MS = 900;    // en cok bu kadar duz git
const unsigned long ARAMA_MS = 2500;    // en cok bu kadar ara

enum Durum { IZLE, BOSLUK, ARAMA, DUR };
const char* DURUM_ADI[] = { "IZLE", "BOSLUK", "ARAMA", "DUR" };

Durum durum = IZLE;
int sonYon = 0;                         // -1 sol, 0 orta, +1 sag
unsigned long durumBasla = 0;

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
  Serial.println(DURUM_ADI[yeni]);
}

void setup() {
  for (int p = 5; p <= 10; p++) {
    pinMode(p, OUTPUT);
  }
  Serial.begin(9600);
}

void loop() {
  bool s[SENSOR_SAYISI];
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    s[i] = analogRead(SENSOR_PIN[i]) > ESIK;
  }
  bool sol = s[0] || s[1];
  bool sag = s[3] || s[4];
  bool orta = s[2];
  bool hicbiri = !(sol || sag || orta);
  unsigned long gecen = millis() - durumBasla;

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

    case BOSLUK:                         // duz git, cizgi gelirse IZLE
      if (!hicbiri) { gec(IZLE); break; }
      if (gecen > BOSLUK_MS) { gec(ARAMA); break; }
      motor(HIZ, HIZ);
      break;

    case ARAMA:                          // son gorulen yone yerinde don
      if (!hicbiri) { gec(IZLE); break; }
      if (gecen > ARAMA_MS) { motor(0, 0); gec(DUR); break; }
      if (sonYon <= 0) motor(-HIZ, HIZ);
      else motor(HIZ, -HIZ);
      break;

    case DUR:
      motor(0, 0);
      break;
  }
}
```

### Program 2: kavşak kararı
Şimdi dördüncü bir durum ekliyoruz: hepsi çizgideyse `11111` bir kavşak vardır. Karar `KAVSAK_KARARI` sabitindedir: −1 sola, 0 düz, +1 sağa. Üç aşama:

1. `KAVSAK_ILERI`: algıladığın anda sensör dizisi çizginin üstündedir ama tekerlek aksı 7 cm gerisindedir. Hemen dönersen yanlış yerden dönersin. Önce 350 ms ileri git, aks kavşağın hizasına gelsin.
2. `KAVSAK_DON`: seçilen yöne yerinde dön. Önce orta sensör çizgiyi bırakır (`merkezGitti`), sonra yeni çizgiyi bulduğunda dönüş biter.
3. Düz karar verdiysen `KAVSAK_DUZ`: 300 ms düz git, kavşağı geç.

T kavşakta sola dönmek, labirent kuralındaki "hep sol" taktiğidir; sağ için `+1` yaz. Bir `+` kavşakta ise kararı `0` yapıp düz geçersin.

```cpp
// sketch: kavsak_karari
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};
const int ESIK = 512;
const int HIZ = 150;
const int KAVSAK_KARARI = -1;                  // -1 sola, 0 duz, +1 saga
const unsigned long BOSLUK_MS = 900;
const unsigned long ARAMA_MS = 2500;
const unsigned long KAVSAK_ILERI_MS = 350;
const unsigned long KAVSAK_DUZ_MS = 300;

enum Durum { IZLE, BOSLUK, ARAMA, DUR, KAVSAK_ILERI, KAVSAK_DON, KAVSAK_DUZ };
const char* DURUM_ADI[] = { "IZLE", "BOSLUK", "ARAMA", "DUR",
                            "KAVSAK_ILERI", "KAVSAK_DON", "KAVSAK_DUZ" };

Durum durum = IZLE;
int sonYon = 0;
bool merkezGitti = false;
unsigned long durumBasla = 0;

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
  merkezGitti = false;
  Serial.println(DURUM_ADI[yeni]);
}

void yerindeDon(int yon) {
  if (yon < 0) motor(-HIZ, HIZ);
  else motor(HIZ, -HIZ);
}

void setup() {
  for (int p = 5; p <= 10; p++) {
    pinMode(p, OUTPUT);
  }
  Serial.begin(9600);
}

void loop() {
  bool s[SENSOR_SAYISI];
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    s[i] = analogRead(SENSOR_PIN[i]) > ESIK;
  }
  bool sol = s[0] || s[1];
  bool sag = s[3] || s[4];
  bool orta = s[2];
  bool hepsi = s[0] && s[1] && s[2] && s[3] && s[4];
  bool hicbiri = !(sol || sag || orta);
  unsigned long gecen = millis() - durumBasla;

  switch (durum) {
    case IZLE:
      if (hepsi) { gec(KAVSAK_ILERI); break; }
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
      if (gecen > ARAMA_MS) { motor(0, 0); gec(DUR); break; }
      yerindeDon(sonYon <= 0 ? -1 : 1);
      break;

    case DUR:
      motor(0, 0);
      break;

    case KAVSAK_ILERI:
      motor(HIZ, HIZ);
      if (gecen >= KAVSAK_ILERI_MS) {
        gec(KAVSAK_KARARI == 0 ? KAVSAK_DUZ : KAVSAK_DON);
      }
      break;

    case KAVSAK_DON:
      yerindeDon(KAVSAK_KARARI);
      if (!orta) merkezGitti = true;          // eski cizgiyi biraktik
      if (merkezGitti && orta) {              // yeni cizgiyi bulduk
        sonYon = 0;
        gec(IZLE);
      }
      break;

    case KAVSAK_DUZ:
      motor(HIZ, HIZ);
      if (gecen >= KAVSAK_DUZ_MS) gec(IZLE);
      break;
  }
}
```

### Nasıl çalışıyor?
1. `IZLE` durumu 88. dersin bang-bang mantığıdır; fark, hiçbir sensör çizgiyi görmeyince neyin olacağına `sonYon` ile karar vermesidir.
2. Boşlukta (`BOSLUK`) robot düz gider. Benzetimde yaklaşık 10 cm'lik bir boşluğu geçerken çizgiyi yaklaşık 0,4 sn göremez; `BOSLUK_MS = 900` bunun için yeterlidir. Süre dolarsa çizgi gerçekten kaybolmuştur ve `ARAMA`'ya geçilir. `BOSLUK_MS = 300` yaparsan robot aynı boşlukta erkenden `ARAMA`'ya geçer; yine de çizgiyi bulur ama çizgiyi görmediği süre yaklaşık 0,4 sn'den yaklaşık 0,7 sn'ye çıkar.
3. Dik virajda robot köşeyi hafifçe aşabilir; çizgi son kez kenar sensöründe görülmüştü, bu yüzden `ARAMA` o yöne yerinde döner ve çizgiyi bulunca `IZLE`'ye dönülür. Benzetimde sola dik L virajında seriye `ARAMA` yazıldığını görürsün.
4. Çizgi hiç bulunamazsa `ARAMA_MS` sonunda robot durur ve `DUR` yazılır. Kontrolsüz dönmek yerine durmak her zaman daha güvenlidir.
5. T kavşakta sola karar verilince `KAVSAK_ILERI → KAVSAK_DON → IZLE` sırası yazılır ve robot çubuğun sol ucuna gider. Karar `+1` ise sağ uca, `0` ise ve çubuğu kesen bir çizgi varsa düz devam eder.

### Dene
- `KAVSAK_KARARI` değerini +1 yap ve aynı T'yi dene. Robot hangi uca gidiyor?
- `BOSLUK_MS` değerini 300 yap. 10 cm'lik boşlukta ne oluyor?
- Boşluğu 25 cm yap. `BOSLUK_MS` yetmeyince robot ne yapıyor? Sonunda `DUR` yazıyor mu?

### Sık yapılan hatalar
- Çizgi kaybolur kaybolmaz her zaman aynı yöne dönmek: boşlukta robot kendi etrafında döner.
- Kavşakta aksı geride bırakıp hemen dönmek: `KAVSAK_ILERI_MS = 0` yapınca robot T'nin sol ucuna gitmek yerine geldiği sapa geri döner, çünkü yerinde dönerken dizi çubuğu değil sapı bulur.
- Arama süresini sınırsız bırakmak: çizgi gerçekten yoksa robot sonsuza kadar döner.
- Boşluk uzunluğunu hıza göre düşünmemek: `BOSLUK_MS` ile gidilen mesafe hıza bağlıdır. Hızı artırırsan aynı sürede daha uzun yol alırsın.

### Gerçek robotta farklı olabilecekler
Benzetimde sensörler 7 cm önde, dönüş tam yerinde ve zamanlama mükemmeldir. Gerçek robotta tekerlekler kayar, 350 ms'lik ileri gitme mesafesi pil gerilimine göre değişir ve kenar sensörleri tek bir okumada yanlış kavşak görebilir. Kavşak kararı vermeden önce desenin birkaç ardışık okumada tutarlı olduğunu denemek iyi bir önlemdir.

## Konuşalım
"Dur" gerçekten en güvenli cevap mı? Bir depo robotu çizgiyi kaybedip yolun ortasında durursa ne olur? Sence robot bu durumda nasıl "yardım iste"meli?
