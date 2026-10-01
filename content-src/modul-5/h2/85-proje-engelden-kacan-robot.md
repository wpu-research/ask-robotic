# Proje: Otonom engelden kaçan robot
süre: 35

## Merak
Bir depoda dolaşan küçük robot kimseye sormadan koridorlarda gezer, rafların kenarından döner, bir şeye çarpmaya ramak kalınca yön değiştirir. Bu hafta üç sensör ve beş durumla tam bu işi yapan bir robot kurdun. Şimdi hepsini birleştirip robotu içinde engeller olan bir arenaya bırakacaksın ve soracağız: bu robot gerçekten işe yarıyor mu? "Yarıyor" derken neyi, hangi sayıyla ölçeceksin?

## Etkinlik
### Ne yapacağız?
Bu proje öğrendiklerini birleştirir:
- **Hafta 2, ders 81:** Tamponlar (D2, D3) yedek koruma olarak.
- **Hafta 2, ders 82:** HC-SR04 (D11, D12) ve medyan filtre.
- **Hafta 2, ders 83:** Servo (D4) ile 30°-150° tarama, en uzak yönü seçme.
- **Hafta 2, ders 84:** `millis()` tabanlı durum makinesi (ILERI, DUR, TARA, DON, GERI).
- **Hafta 1:** `surus(sol, sag)` işlevi ve motor sürücüsü (77. ders), ölü bölgenin üstünde hız (78. ders), seri komutlarla uzaktan durdurma/başlatma (79. ders).

84. dersin programına üç şey ekliyoruz:
1. **Seri komutlar:** `x` robotu durdurur, `g` yeniden başlatır.
2. **Sıkışma denetimi:** ILERI durumunda 1,5 saniye boyunca mesafe 6 cm değişmediyse (robot ilerlemiyor demektir) robot geri çekilir. Bu, sensörün göremediği bir engele takılmaya karşı ek bir koruma.
3. **Rapor:** Her 5 saniyede tampon sayısını yazar.

### Devre
| Parça | Bağlantı |
|---|---|
| HC-SR04 | VCC → 5 V, GND → GND, TRIG → **D11**, ECHO → **D12** |
| Sensörü taşıyan servo | Sinyal → **D4** |
| Tamponlar | Sol → **D2**, sağ → **D3** (GND ile arası, `INPUT_PULLUP`) |
| Sol motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |
| Sağ motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |

**Güç uyarısı:** Servo ve motorlar için ayrı pil kullan, pilin eksisini Arduino GND'sine de bağla (ortak GND). Servoyu ve motorları Arduino'nun 5 V pininden besleme. Pilleri kısa devre yapma, ters bağlama.

### Program
```cpp
// sketch: otonom_kacis
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
const unsigned long TAKILMA_MS = 1500;   // bu sürede mesafe 6 cm değişmediyse sıkıştık
const unsigned long RAPOR_MS = 5000;

const char* DURUM_ADI[] = {"ILERI", "DUR", "TARA", "DON", "GERI"};

Servo tarayici;
Durum durum = ILERI;
unsigned long durumBasi = 0;
unsigned long sonOlcum = 0;
unsigned long servoZaman = 0;
int taramaNo = 0;
int mesafeler[ACI_ADET];
unsigned long donSure = 0;
unsigned long ilerlemeZaman = 0;
unsigned long sonRapor = 0;
int ilerlemeCm = -100;
int carpmaSayisi = 0;
bool calisiyor = true;
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
  if (yeni == ILERI) {
    ilerlemeZaman = durumBasi;
    ilerlemeCm = -100;
  }
  Serial.print("DURUM ");
  Serial.println(DURUM_ADI[yeni]);
}

void tamponTepki(int yon) {
  carpmaSayisi++;
  Serial.println(yon > 0 ? "TAMPON SAG" : "TAMPON SOL");
  donYon = yon;
  gec(GERI);
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

void komutOku() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == 'x') { calisiyor = false; Serial.println("KOMUT DUR"); }
    if (c == 'g') { calisiyor = true; Serial.println("KOMUT GIT"); gec(ILERI); }
  }
}

void loop() {
  unsigned long simdi = millis();

  komutOku();
  if (!calisiyor) {
    surus(0, 0);
    return;
  }

  if (simdi - sonRapor >= RAPOR_MS) {
    sonRapor = simdi;
    Serial.print("RAPOR carpma=");
    Serial.println(carpmaSayisi);
  }

  switch (durum) {
    case ILERI:                           // düz git, engel ara
      surus(HIZ, HIZ);
      if (digitalRead(TAMPON_SOL) == LOW) { tamponTepki(-1); break; }
      if (digitalRead(TAMPON_SAG) == LOW) { tamponTepki(1); break; }
      if (simdi - sonOlcum >= OLCUM_ARALIK) {
        sonOlcum = simdi;
        int cm = medyan3();
        if (cm < ESIK_CM) { gec(DUR); break; }
        if (abs(cm - ilerlemeCm) >= 6) {          // ilerliyoruz: mesafe değişti
          ilerlemeCm = cm;
          ilerlemeZaman = simdi;
        } else if (simdi - ilerlemeZaman >= TAKILMA_MS) {
          Serial.println("SIKISTI");
          donYon = 1;
          gec(GERI);
        }
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
1. Durum makinesi 84. dersle aynıdır. Fark: `loop()` en başta `komutOku()` ile seri porta bakar. `calisiyor` yanlışsa motorlar durur ve `loop()` geri döner; durumlar olduğu gibi kalır. `g` gelince `gec(ILERI)` ile temiz bir başlangıç yapılır.
2. `tamponTepki()` tampon olayını sayar (`carpmaSayisi`), mesajı yazar ve GERI durumuna geçer. Sol tampon basıldıysa dönüş yönü sağdır (81. ders).
3. **Sıkışma denetimi:** ILERI durumunda son ölçümün 6 cm'den fazla değiştiği an `ilerlemeCm` ve `ilerlemeZaman` güncellenir. Robot 0,2 m/s gittiğinde 6 cm yaklaşık 0,3 saniyede değişir. 1,5 saniye (`TAKILMA_MS`) boyunca değişmediyse robot bir yere takılmış demektir: `SIKISTI` yazılır ve GERI durumuna geçilir. Eşiği 6 cm seçtik; 2 cm'lik ölçüm gürültüsü medyan filtreden sonra genellikle bu kadar oynatmaz.
4. `RAPOR` satırı her 5 saniyede tampon sayısını yazar. Robotu denerken neyin sık olduğunu görmek için kullanışlıdır.

### Ölç: robot işe yarıyor mu?
Deneme arenası 2 × 2 m. İçinde üç engel var: ortada 40 × 40 cm'lik bir blok (dört duvar), sağ tarafta 60 cm'lik dikey bir duvar parçası ve üstte 60 cm'lik yatay bir duvar parçası. Ölçüm gürültüsü 2 cm. Her koşuda robotu bir başlangıç noktasına koyup 30-35 saniye çalıştırıyoruz ve iki şeye bakıyoruz (kontrolde ayrıca 25. saniyede `x` gönderip robotun durduğunu, `g` ile devam ettiğini de doğruluyoruz):

- **Yol:** robotun kat ettiği toplam mesafe (`r.state.distanceM`).
- **Çarpma sayısı:** `r.state.collided` robot duvara girmeye çalıştığı sürece doğrudur. Süre boyunca doğru kaldığı için milisaniye saymak yanlış olur; **doğru olmaya başladığı anı** sayarız (8. dersteki kenar algılama). Böylece bir temas bir çarpma olur.

**Sonuçlar:**
- Sol alttan doğuya bakarak başlayan koşuda (35 sn) robot 4,2 m yol aldı, hiç çarpmadı. Tampon bir kez devreye girdi, 7 kez tarama yaptı.
- Sağ üstten batıya bakarak başlayan koşuda (30 sn) 4,2 m yol aldı, 1 çarpma oldu ve sıkışma denetimi bir kez devreye girdi.
- Altı farklı başlangıç noktasını ve iki farklı gürültü tohumunu denedik (12 koşu, 35 sn): robot 4,0-4,7 m yol aldı, çarpma sayısı 0-3 arasında kaldı.

**Neden bu eşikler?** Başarı ölçütünü şöyle koyduk: 30-35 saniyede **en az 3 metre yol** ve **en fazla 3 çarpma**.
- Robot 0,2 m/s gider. 35 saniyede hiç durmasa 7 m kat ederdi. Ama her engelde dur, tara, dön döngüsü yaklaşık 2,2 saniye alır (DUR 0,25 + TARA 1,6 + DON 0,3). Bu süre boyunca robot ilerlemez; yani 4-5 metre bu robot için çok iyi bir sonuçtur.
- Eşiği ölçtüğümüz en düşük değerin (4,0 m) yaklaşık 1 m altına, 3 m'ye koyduk: farklı başlangıç ve gürültüde robotun yine geçmesini istiyoruz. 7 m'ye yakın bir eşik, robotun engelden kaçarken harcadığı zamanı yok sayardı. 1 m'lik eşik ise robot çoğunlukla duruyor olsa bile geçerdi; hiçbir şey ölçmezdi.
- "Hiç çarpmama" şartı gerçekçi değil. Sensörümüz tek bir ışındır; ışın bir duvar ucunun yanından geçip gövde o uca değebilir, sığ bir açıyla duvara sürtünürken ışın hep uzağı görebilir. Tampon da robotun yalnız önünü korur. Yine de çarpma sayısını sıfıra yakın tutmak isteriz: bu yüzden üst sınır küçük (3).

Eşiği sana uyan bir sayıyla değiştirmeden önce şunu sor: bu sayı robotun gerçekten iyi olduğunu mu gösteriyor, yoksa yalnız bizim arenaya mı uyuyor?

### Dene
- `ESIK_CM` değerini 15 ve 40 yap. Yol ve çarpma sayısı nasıl değişiyor? Hangi değer iyi bir denge?
- `HIZ` değerini 220 yap. Robot daha fazla yol alıyor ama çarpma sayısı artıyor mu? Neden?
- Seri komutlara `h` ekle: `h` gelince `HIZ` yarıya insin (yavaş mod), `g` normal hıza dönsün. `HIZ` şu an sabit (`const`); bunu değiştirilebilir bir değişkene çevirmen gerekecek.
- `RAPOR` satırına toplam geçen süreyi de ekle.

### Sık yapılan hatalar
- Sıkışma denetimini `delay` ile yapmak: robot beklerken hiçbir şeye bakamaz.
- Çarpmayı `collided` doğru olduğu sürece saymak: bir temas yüzlerce çarpma gibi görünür.
- Ölçüm gürültüsüne karşı medyan kullanmamak: robot sahte engelden korkup gereksiz tarama yapar.
- `x` komutuyla durdurup `g` ile başlatırken durum makinesini sıfırlamamak: robot yarım kalmış bir dönüşün ortasından devam eder.
- Eşiği "robot geçsin diye" ölçümden yüksek tutup sonra "neden geçmiyor" diye şaşırmak. Önce ölç, sonra eşiği koy.

### Gerçek robotta farklı olabilecekler
- **Ultrasonik ışın açısı:** Gerçek HC-SR04 dar bir ışın değil, koni gibi yayılır (veri sayfasına bak). Duvar ucu, sandalye bacağı gibi dar cisimler bazen görülmez; bazen yan duvar ya da zemin yanlış ölçüme yol açar. Benzetimde sensör tek bir ışındır.
- **Yansıma:** Duvara eğik gelen ses sensöre dönmeyebilir. Robot duvarı daha uzak, hatta hiç yok sanır. Sığ açıyla yaklaşmak en tehlikeli durumdur.
- **Yumuşak yüzeyler:** Perde, kumaş, koltuk, halı gibi yüzeyler sesi emer. Yankı zayıflar ya da hiç gelmez. Bu yüzeylerde tamponlar ve sıkışma denetimi yedek olarak çok önemli olur.
- **Tampon:** Gerçek anahtarlar sıçrar (8. ders). Yumuşak engellerde tampon basılmayabilir.
- **Zamanlama:** Dönüşler zamanla yapılıyor. Pil bitmeye yaklaştıkça motorlar yavaşlar ve 90° dönüş 70°'ye düşebilir. Dönüşleri enkoderle ölçmek (4. hafta) bunu çözer.
- **Güvenlik:** Gerçek robotu önce kaldırıp tekerlekleri havada deneyerek çalıştır. Bir komut gelmeden robot hareket etmemeli; `x` komutu bir "acil durdur" gibi düşünülmeli.

## Konuşalım
Bir arkadaşın robotunun "çok iyi" olduğunu söylüyor, ama hiç sayı vermiyor. Ona hangi iki ölçümü sorarsın ve cevaplara göre neyi anlarsın? Çarpma sayısı küçük ama yol da küçükse robota ne olmuş olabilir?
