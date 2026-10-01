// Serbest mod için derlemesi ve davranışı ders kontrolleriyle doğrulanmış örnek sketch'ler (ders metinlerinden kopya).
export const CIZGI_ZOR = `// Ders 90 örneği (serbest mod)
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
`

export const KACIS = `// Ders 85 örneği (serbest mod)
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
`

