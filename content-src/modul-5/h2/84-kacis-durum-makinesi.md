# Engelden kaçma durum makinesi
süre: 30

## Merak
81-83. derslerde üç ayrı yetenek yazdın: tamponla refleks, mesafeyle durma, servoyla yön seçme. Hepsini tek programda çalıştırmaya kalksan `if` ve `delay` yığını çıkar; robot bir şey beklerken diğerine bakamaz. Kimin ne zaman sıra alacağına nasıl karar vereceksin? 28. dersteki cevabı hatırla: robota her an **tek bir durum** ver ve durumlar arası geçişleri açıkça yaz.

## Etkinlik
### Devre
Devre 83. dersteki gibidir ve tamponlar da bağlıdır.

| Parça | Bağlantı |
|---|---|
| HC-SR04 | VCC → 5 V, GND → GND, TRIG → **D11**, ECHO → **D12** |
| Sensörü taşıyan servo | Sinyal → **D4** |
| Tamponlar | Sol → **D2**, sağ → **D3** (ikisi de GND ile arası, `INPUT_PULLUP`) |
| Sol motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |
| Sağ motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |

**Güç uyarısı:** Servo ve motorlar için ayrı pil kullan, pilin eksisini Arduino GND'sine de bağla (ortak GND). Pilleri kısa devre yapma, ters bağlama.

### Durumlar
Robotun beş durumu var:

| Durum | Robot ne yapıyor? | Bir sonraki durum |
|---|---|---|
| ILERI | Düz gider, 50 ms'de bir ölçer | Ortanca mesafe < 25 cm ise **DUR**; tampon basılırsa **GERI** |
| DUR | Motorlar kapalı, 250 ms bekler (robot tam dursun) | **TARA** |
| TARA | Servo 5 yöne bakar, her yönde 300 ms bekleyip ölçer | En uzak yön 35 cm'den uzaksa **DON**, değilse **GERI** |
| DON | Yerinde döner, süre = \|açı − 90\| × 5 ms | **ILERI** |
| GERI | 400 ms geri gider | **DON** (90° döner) |

Tampon, sensörün göremediği engeller için yedektir: ILERI durumunda her turda önce tamponlara bakılır.

### Program
Bu program 27. dersteki `millis()` mantığıyla kurulu: hiçbir durumda `delay` yok. Her durum "süre doldu mu?" diye bakar ve dolduysa `gec()` ile yeni duruma geçer. Hangi durumda olduğunu seri monitörden de izleyebilirsin.

```cpp
// sketch: kacis_fsm
#include <Servo.h>

// Robotun beş durumu (28. ders). Her biri bir sayıdır: ILERI=0, DUR=1, ...
enum Durum { ILERI, DUR, TARA, DON, GERI };

const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN3 = 9;
const int SAG_IN4 = 10;
const int TRIG = 11;
const int ECHO = 12;

const int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde

// Tek motor: pwm > 0 ileri, < 0 geri, 0 dur (77. ders)
void motor(int en, int a, int b, int pwm) {
  digitalWrite(a, pwm > 0);
  digitalWrite(b, pwm < 0);
  analogWrite(en, abs(pwm));
}

// İki motoru birden sür: sol ve sag -255...255
void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN3, SAG_IN4, sag);
}

// HC-SR04 ile mesafe (cm). Yankı gelmezse 400 döner.
int mesafeOlc() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return 400;
  return sure / 58;
}

const int SERVO_PIN = 4;
const int TAMPON_SOL = 2;
const int TAMPON_SAG = 3;

const int ESIK_CM = 25;              // bundan yakında engel varsa dur
const int ACIK_CM = 35;              // taramada en iyi yön bundan yakınsa sıkışmışız
const int ACI_ADET = 5;
const int ACILAR[ACI_ADET] = {30, 60, 90, 120, 150};   // 90 = ileri, büyük açı = sol
const int MS_DERECE = 5;                 // yerinde dönüş: ~5 ms / derece
const unsigned long OLCUM_ARALIK = 50;   // ILERI'de ölçüm aralığı (ms)
const unsigned long DUR_MS = 250;        // durduktan sonra bekleme (robot tam dursun)
const unsigned long SERVO_BEKLE = 300;   // servo yeni açıya varsın
const unsigned long GERI_MS = 400;

const char* DURUM_ADI[] = {"ILERI", "DUR", "TARA", "DON", "GERI"};

Servo tarayici;
Durum durum = ILERI;
unsigned long durumBasi = 0;
unsigned long sonOlcum = 0;
unsigned long servoZaman = 0;
int taramaNo = 0;
int mesafeler[ACI_ADET];
unsigned long donSure = 0;
int donYon = 1;                      // +1 sola, -1 sağa

// 3 ölçümün ortancası (~20 ms sürer)
int medyan3() {
  int a = mesafeOlc(); delay(5);
  int b = mesafeOlc(); delay(5);
  int c = mesafeOlc();
  if (a > b) { int t = a; a = b; b = t; }
  if (b > c) { int t = b; b = c; c = t; }
  if (a > b) { int t = a; a = b; b = t; }
  return b;
}

// Durum değiştirir, giriş zamanını kaydeder ve seriye yazar
void gec(Durum yeni) {
  durum = yeni;
  durumBasi = millis();
  Serial.print("DURUM ");
  Serial.println(DURUM_ADI[yeni]);
}

void don(int yon, unsigned long ms) {   // yon: +1 sola, -1 sağa
  donYon = yon;
  donSure = ms;
  gec(DON);
}

void setup() {
  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(TAMPON_SOL, INPUT_PULLUP);
  pinMode(TAMPON_SAG, INPUT_PULLUP);
  tarayici.attach(SERVO_PIN);
  tarayici.write(90);
  Serial.begin(9600);
  gec(ILERI);
}

void loop() {
  unsigned long simdi = millis();

  switch (durum) {
    case ILERI:                           // düz git, engel ara
      surus(HIZ, HIZ);
      if (digitalRead(TAMPON_SOL) == LOW) { donYon = -1; gec(GERI); break; }
      if (digitalRead(TAMPON_SAG) == LOW) { donYon = 1; gec(GERI); break; }
      if (simdi - sonOlcum >= OLCUM_ARALIK) {
        sonOlcum = simdi;
        if (medyan3() < ESIK_CM) gec(DUR);
      }
      break;

    case DUR:                             // dur, robot sakinleşsin
      surus(0, 0);
      if (simdi - durumBasi >= DUR_MS) {
        taramaNo = 0;
        tarayici.write(ACILAR[0]);
        servoZaman = simdi;
        gec(TARA);
      }
      break;

    case TARA:                            // servoyla 5 yöne bak
      surus(0, 0);
      if (simdi - servoZaman >= SERVO_BEKLE) {
        mesafeler[taramaNo] = medyan3();
        taramaNo++;
        if (taramaNo < ACI_ADET) {
          tarayici.write(ACILAR[taramaNo]);
          servoZaman = millis();
        } else {
          tarayici.write(90);
          int en = 0;
          for (int i = 1; i < ACI_ADET; i++) if (mesafeler[i] > mesafeler[en]) en = i;
          Serial.print("EN ACIK ");
          Serial.print(ACILAR[en]);
          Serial.print(" ");
          Serial.println(mesafeler[en]);
          if (mesafeler[en] < ACIK_CM) {
            donYon = 1;
            gec(GERI);
          } else {
            int fark = ACILAR[en] - 90;
            don(fark >= 0 ? 1 : -1, (unsigned long)abs(fark) * MS_DERECE);
          }
        }
      }
      break;

    case DON:                             // yerinde dön
      surus(-donYon * HIZ, donYon * HIZ);
      if (simdi - durumBasi >= donSure) gec(ILERI);
      break;

    case GERI:                            // geri çekil
      surus(-HIZ, -HIZ);
      if (simdi - durumBasi >= GERI_MS) don(donYon, 90UL * MS_DERECE);
      break;
  }
}
```

### Nasıl çalışıyor?
1. `enum Durum { ILERI, DUR, TARA, DON, GERI }` durumlara isim verir; `switch (durum)` o anki duruma ait bloğu çalıştırır (28. ders). `durumBasi` o duruma girdiğin zamanı tutar, `simdi - durumBasi >= DUR_MS` gibi karşılaştırmalar süre dolunca geçiş yapar.
2. `gec(yeni)` durumu değiştirir, `durumBasi`'yı günceller ve seriye `DURUM ...` yazar. Süreyi sıfırlamayı hiçbir yerde elle yapmıyoruz; unutma riski yok.
3. TARA durumunda `taramaNo` hangi açıda olduğumuzu tutar. Servo açısı değişince `servoZaman` kaydedilir; 300 ms geçince ölçüm alınır ve bir sonraki açıya geçilir. Beş açı bitince `mesafeler` dizisinden en uzak olan seçilir ve `EN ACIK` satırı yazılır.
4. En iyi yön bile `ACIK_CM = 35` cm'den yakınsa robot sıkışmıştır (dar bir cep ya da köşe). O zaman dönmeye çalışmak yerine önce GERI'ye gidip biraz çekilir, sonra 90° döner.
5. `medyan3()` üç `pulseIn` ve iki `delay(5)` içerir, yaklaşık 20 ms sürer. Bu kısa blokaj kabul edilebilir; `loop()` yine saniyede onlarca kez döner.

**Ölçtüklerimiz (benzetim):**
- Boş 2 × 2 m kutuda, ölçüm gürültüsü 2 cm iken, robot 20 saniyede yaklaşık 2,8 m yol aldı, 3 tam ILERI-DUR-TARA-DON turu yaptı ve hiç duvara değmedi.
- Zamanlamalar `millis()` ile tuttu: DUR yaklaşık 250 ms, TARA yaklaşık 1,6 saniye (5 yön × 300 ms bekleme ve ölçümler), 60°'lik DON yaklaşık 300 ms. Ölçülen dönüş açısı, taramada seçilen açının 90°'den farkıyla 20° içinde uyuştu.
- Dar bir cepte (30 cm genişlikte, ucu kapalı) başlayan robot ilerleyip durdu, ikinci taramada en uzak yön 26 cm çıktı (35 cm'den yakın), `GERI` durumuna geçti ve gerçekten geri gitti. Hiç çarpmadı.
- Duvarda 3 cm'lik ince bir yarık bıraktık. Orta ışın yarıktan geçip uzağı gördü (sensör engeli göremedi), ama iki tampon duvara bastı ve robot ILERI → GERI → DON sırasıyla geri çekildi. Tampon yedeği işe yaradı.

### Dene
- `ACIK_CM` değerini 60 yap. Robot daha mı sık GERI'ye gidiyor? Neden?
- TARA'dan sıkışarak gelen GERI hep sola döner (`donYon = 1`). Bunu, taramada 30° ile 150° yönlerinden hangisi daha uzun ölçüldüyse o tarafa döndürecek şekilde değiştir.
- Beşinci durum olarak `BEKLE` ekle: seri monitörden `b` gelince dur, `g` gelince ILERI'ye dön. Hangi yerlere `if` eklemen gerekti?

### Sık yapılan hatalar
- Durum bloklarına `delay` koymak: bir durum beklerken tamponlara hiç bakılmaz.
- `durum = DUR;` yazıp `durumBasi`'yı güncellemeyi unutmak. Hep `gec()` kullan.
- `enum` tanımını, onu parametre olarak kullanan fonksiyonlardan sonra yazmak: Arduino "`Durum` was not declared" hatası verir. Tanımı dosyanın başına koy.
- Durum adlarını Arduino'nun kendi adlarıyla çakıştırmak. Ör. `ADLAR` Arduino'daki AVR işlemcisinin bir kayıt bitinin adıdır; bu isimle bir dizi tanımlarsan derleyici beklenmedik hata verir. Bu yüzden diziye `DURUM_ADI` dedik.
- Geçişleri yazarken bir durumdan çıkışı unutmak: robot o durumda sonsuza kadar kalır. Her durum için "nereye gidiyor?" sorusunu cevapla.
- Tarama sırasında `surus(0, 0)` demeyi unutmak: robot dönerek ölçer.

### Gerçek robotta farklı olabilecekler
- Zamanlamalar (`DUR_MS`, `SERVO_BEKLE`, `MS_DERECE`) kendi robotunda ölç; dönüşün süresi pile, zemine ve motor farklarına göre değişir. Zamana bağlı dönüş, tekerlek sayısına bağlı dönüşten (enkoder, 4. hafta) daha az doğrudur.
- Bir durum makinesi hata ayıklarken büyük kolaylık sağlar: `DURUM ...` çıktısı robotun neyi neden yaptığını anlatır. Gerçek robotta seri kablo takılı olmayınca bunu bir LED'le ya da kısa bir bip dizisiyle de gösterebilirsin.
- Gerçek ortamda tarama sırasında bir şey robota yaklaşabilir. Durum makinesine "TARA sırasında da tamponlara bak" kuralı eklemek isteyebilirsin.

## Konuşalım
Bu programı `delay` ile, durum makinesi olmadan yazmayı düşün. Tampon basıldığında ne olurdu? Durum makinesinin sana en çok neyi kolaylaştırdığını düşünüyorsun?
